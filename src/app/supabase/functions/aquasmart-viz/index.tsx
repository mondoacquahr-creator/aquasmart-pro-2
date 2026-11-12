import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { Resend } from "npm:resend";
import * as kv from "./kv_store.tsx";

// AquaSmart Pro – katalog bazena i AI vizualizator (zasebna funkcija).

const app = new Hono();
const resend = new Resend(Deno.env.get('resend'));
const MONDO_ACQUA_EMAIL = "info@mondo-acqua.hr";
// Dok domena mondo-acqua.hr nije potvrđena u Resendu, Resend dostavlja samo na e-mail vlasnika računa.
const INQUIRY_EMAIL = Deno.env.get('INQUIRY_EMAIL') || "mondo.acquahr@gmail.com";

app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "apikey", "X-Client-Info"],
  allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
  maxAge: 600,
}));

const adminClient = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
// Mondo admin = oznaka u app_metadata (postavlja se samo na poslužitelju), ne e-mail – kao u glavnom serveru.
const isMondoAdmin = (user: any) => user?.app_metadata?.mondoAdmin === true;
const isEmail = (s: any) => typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const escapeHtml = (s: any) => String(s ?? '').replace(/[&<>"']/g, (ch) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as any)[ch]);

const authMiddleware = async (c: any, next: any) => {
  const token = c.req.header('Authorization')?.split(' ')[1];
  if (!token) return c.json({ error: 'Missing authorization header' }, 401);
  const { data: { user }, error } = await adminClient().auth.getUser(token);
  if (error || !user) return c.json({ error: 'Unauthorized' }, 401);
  c.set('user', user);
  await next();
};

const BASE_PATH = "/aquasmart-viz";
const FUNCTIONS_PATH = "/functions/v1/aquasmart-viz";
const registerRoute = (app: Hono, method: 'get' | 'post' | 'delete', path: string, ...handlers: any[]) => {
  (app as any)[method](path, ...handlers);
  (app as any)[method](`${BASE_PATH}${path}`, ...handlers);
  (app as any)[method](`${FUNCTIONS_PATH}${path}`, ...handlers);
};

registerRoute(app, 'get', '/health', (c: any) => c.json({ status: 'ok', ai: !!Deno.env.get('GEMINI_API_KEY') }));

// ---------- Katalog bazena (Mondo Acqua) ----------
// Javno čitanje; uređuju samo Mondo admini. Slike su u javnom bucketu 'pool-catalog'.

const CATALOG_BUCKET = 'pool-catalog';
const initCatalogBucket = async () => {
  const supabase = adminClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b: any) => b.name === CATALOG_BUCKET)) {
    await supabase.storage.createBucket(CATALOG_BUCKET, { public: true });
  }
};
initCatalogBucket().catch(err => console.error('Catalog bucket init error:', err));

const cleanPool = (body: any, id: string) => ({
  id,
  name: String(body.name || '').trim().slice(0, 120),
  type: String(body.type || '').trim().slice(0, 60),
  shape: String(body.shape || '').trim().slice(0, 60),
  dimensions: String(body.dimensions || '').trim().slice(0, 60),
  description: String(body.description || '').trim().slice(0, 1000),
  images: Array.isArray(body.images) ? body.images.filter((u: any) => typeof u === 'string').slice(0, 5) : [],
  active: body.active !== false,
  updatedAt: new Date().toISOString(),
});

registerRoute(app, 'get', '/catalog/pools', async (c: any) => {
  try {
    const items = await kv.getByPrefix('catalog:pools:');
    return c.json(items.filter((p: any) => p.active !== false).sort((a: any, b: any) => a.name.localeCompare(b.name)));
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

const mondoAdminOnly = async (c: any, next: any) => {
  if (!isMondoAdmin(c.get('user'))) return c.json({ error: 'Samo Mondo Acqua admin smije ovu radnju.' }, 403);
  await next();
};

registerRoute(app, 'get', '/admin/catalog/pools', authMiddleware, mondoAdminOnly, async (c: any) => {
  return c.json(await kv.getByPrefix('catalog:pools:'));
});

registerRoute(app, 'post', '/admin/catalog/pools', authMiddleware, mondoAdminOnly, async (c: any) => {
  const body = await c.req.json().catch(() => ({}));
  const id = String(body.id || crypto.randomUUID());
  const pool = cleanPool(body, id);
  if (!pool.name) return c.json({ error: 'Upišite naziv modela.' }, 400);
  await kv.set(`catalog:pools:${id}`, pool);
  return c.json({ success: true, pool });
});

registerRoute(app, 'delete', '/admin/catalog/pools/:id', authMiddleware, mondoAdminOnly, async (c: any) => {
  await kv.del(`catalog:pools:${c.req.param('id')}`);
  return c.json({ success: true });
});

registerRoute(app, 'post', '/admin/catalog/upload', authMiddleware, mondoAdminOnly, async (c: any) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return c.json({ error: 'Nema datoteke.' }, 400);
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return c.json({ error: 'Dopuštene su JPG, PNG i WEBP slike.' }, 400);
  if (file.size > 8 * 1024 * 1024) return c.json({ error: 'Slika je veća od 8 MB.' }, 400);
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;
  const supabase = adminClient();
  const { error } = await supabase.storage.from(CATALOG_BUCKET).upload(path, file, { contentType: file.type });
  if (error) return c.json({ error: error.message }, 500);
  const { data } = supabase.storage.from(CATALOG_BUCKET).getPublicUrl(path);
  return c.json({ success: true, url: data.publicUrl });
});

// Jednokratni uvoz slika kataloga u bucket (zaštićen privremenim kodom iz KV 'admin:import-token').
registerRoute(app, 'post', '/admin/catalog/import-image', async (c: any) => {
  const body = await c.req.json().catch(() => ({}));
  const tok = await kv.get('admin:import-token');
  if (!tok?.token || tok.token !== body.token || !(Date.parse(tok.expires) > Date.now())) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const poolId = String(body.poolId || '');
  const index = Number(body.index);
  const pool = await kv.get(`catalog:pools:${poolId}`);
  if (!pool || !(index >= 0 && index < 5)) return c.json({ error: 'Nepoznat model ili indeks.' }, 400);
  const img = typeof body.dataUrl === 'string' ? body.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/) : null;
  if (!img) return c.json({ error: 'Neispravna slika.' }, 400);
  const bytes = Uint8Array.from(atob(img[2]), (ch) => ch.charCodeAt(0));
  if (bytes.length > 8 * 1024 * 1024) return c.json({ error: 'Slika je prevelika.' }, 400);
  const ext = img[1] === 'image/png' ? 'png' : img[1] === 'image/webp' ? 'webp' : 'jpg';
  const path = `mondo/${poolId.replace(/[^a-z0-9-]/gi, '')}-${index}.${ext}`;
  const supabase = adminClient();
  const { error } = await supabase.storage.from(CATALOG_BUCKET).upload(path, bytes, { contentType: img[1], upsert: true });
  if (error) return c.json({ error: error.message }, 500);
  const { data } = supabase.storage.from(CATALOG_BUCKET).getPublicUrl(path);
  const images = Array.isArray(pool.images) ? [...pool.images] : [];
  images[index] = data.publicUrl;
  await kv.set(`catalog:pools:${poolId}`, { ...pool, images, updatedAt: new Date().toISOString() });
  return c.json({ success: true, url: data.publicUrl });
});

// ---------- AI vizualizator ----------

const GEMINI_MODEL = 'gemini-2.5-flash-image';
const VIZ_LIMIT_GUEST = 3;
const VIZ_LIMIT_USER = 20;

const optionalUser = async (c: any) => {
  const token = c.req.header('Authorization')?.split(' ')[1];
  if (!token) return null;
  const { data } = await adminClient().auth.getUser(token).catch(() => ({ data: { user: null } } as any));
  return data?.user || null;
};

const parseDataUrl = (s: any): { mime: string; data: string } | null => {
  if (typeof s !== 'string') return null;
  const m = s.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) return null;
  return { mime: m[1], data: m[2] };
};

const fetchAsBase64 = async (url: string): Promise<{ mime: string; data: string } | null> => {
  try {
    let referer = '';
    try { referer = new URL(url).origin + '/'; } catch { /* ignore */ }
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/jpeg,image/png,image/*;q=0.8,*/*;q=0.5',
        ...(referer ? { 'Referer': referer } : {}),
      },
    });
    if (!r.ok) {
      console.error('Ref image fetch failed', r.status, url);
      return null;
    }
    const mime = r.headers.get('content-type')?.split(';')[0] || 'image/jpeg';
    const buf = new Uint8Array(await r.arrayBuffer());
    let bin = '';
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return { mime, data: btoa(bin) };
  } catch (err) {
    console.error('Ref image fetch error', String(err), url);
    return null;
  }
};

const SURROUNDS: Record<string, string> = {
  grass: 'a neat lawn around the pool with a narrow stone coping',
  deck: 'a wooden (WPC) deck around the pool',
  stone: 'light natural stone paving around the pool',
  keep: 'the existing ground around the pool, unchanged',
};

registerRoute(app, 'post', '/visualize', async (c: any) => {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return c.json({ error: 'AI vizualizacija još nije uključena.' }, 503);

  const body = await c.req.json().catch(() => ({}));
  const parcel = parseDataUrl(body.markedImage);
  if (!parcel) return c.json({ error: 'Učitajte fotografiju parcele.' }, 400);
  if (parcel.data.length > 8_000_000) return c.json({ error: 'Fotografija je prevelika.' }, 400);
  const pool = await kv.get(`catalog:pools:${String(body.poolId || '')}`);
  if (!pool || pool.active === false) return c.json({ error: 'Odaberite bazen iz kataloga.' }, 400);
  const variants = Math.min(Math.max(Number(body.variants) || 2, 1), 3);

  // Dnevno ograničenje: prijavljeni po računu, gosti po IP adresi.
  const user = await optionalUser(c);
  const day = new Date().toISOString().slice(0, 10);
  const who = user ? `u:${user.id}` : `ip:${(c.req.header('x-forwarded-for') || 'unknown').split(',')[0].trim()}`;
  const limit = user ? (isMondoAdmin(user) ? 1000 : VIZ_LIMIT_USER) : VIZ_LIMIT_GUEST;
  const counterKey = `viz:count:${day}:${who}`;
  const used = Number((await kv.get(counterKey))?.n || 0);
  if (used + variants > limit) {
    return c.json({ error: `Dosegnuto je dnevno ograničenje (${limit} vizualizacija). Pokušajte sutra${user ? '' : ' ili se prijavite'}.` }, 429);
  }

  const refs = (await Promise.all((pool.images || []).slice(0, 3).map(fetchAsBase64))).filter(Boolean) as any[];
  if (refs.length === 0) return c.json({ error: 'Za ovaj model još nema fotografija.' }, 400);

  const surround = SURROUNDS[String(body.surround)] || SURROUNDS.keep;
  const SHAPE_EN: Record<string, string> = { 'Pravokutni': 'rectangular', 'Ovalni': 'oval', 'Slobodni oblik': 'free-form', 'L-oblik': 'L-shaped' };
  const shapeEn = SHAPE_EN[pool.shape] || 'rectangular';
  const nRefs = Math.min(refs.length, 2);
  const prompt = [
    'Edit the first image (a garden photo). A red rectangle marks where a new in-ground swimming pool should be built.',
    `The next ${nRefs} image(s) are product photos of the pool model to use: a ${shapeEn} pool${pool.dimensions ? ` of ${pool.dimensions}` : ''}. Use only the pool itself from them (shape, lining colour, coping, steps) and ignore everything else in those photos.`,
    'Place that pool, filled with clear blue water, inside the marked area of the garden photo, with correct perspective, scale, lighting and shadows.',
    `Surroundings: ${surround}.`,
    'Keep everything outside the pool area unchanged (house, hedge, walls, sea, mountains, sky, framing) and remove the red rectangle.',
    'Photorealistic result.',
  ].join(' ');
  const poolText = `a ${shapeEn} in-ground swimming pool (${pool.dimensions || 'about 6 x 3 m'}) with light blue lining, white coping stones and built-in corner steps`;
  const simplePrompt = [
    `Edit this garden photo: build ${poolText} inside the area marked by the red rectangle, filled with clear blue water.`,
    `Surroundings: ${surround}.`,
    'Keep the camera angle, the house, hedge, walls, sea, mountains and sky exactly as they are. Remove the red rectangle.',
    'Photorealistic, natural daylight, matching shadows and perspective.',
  ].join(' ');
  const parcelPart = { inline_data: { mime_type: parcel.mime, data: parcel.data } };
  const refParts = refs.slice(0, 2).map((ref: any) => ({ inline_data: { mime_type: ref.mime, data: ref.data } }));

  const callGeminiOnce = async (parts: any[], modalities: string[]) => {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseModalities: modalities },
      }),
    });
    if (!r.ok) {
      console.error('Gemini error', r.status, await r.text().catch(() => ''));
      return null;
    }
    const j = await r.json();
    const cand = j?.candidates?.[0];
    const outParts = cand?.content?.parts || [];
    const img = outParts.find((p: any) => p.inlineData?.data || p.inline_data?.data);
    const d = img?.inlineData || img?.inline_data;
    if (!d) {
      const text = outParts.map((p: any) => p.text).filter(Boolean).join(' ').slice(0, 400);
      console.error('Gemini no image', JSON.stringify({
        finishReason: cand?.finishReason, finishMessage: cand?.finishMessage,
        blockReason: j?.promptFeedback?.blockReason, text,
      }));
      return null;
    }
    return `data:${d.mimeType || d.mime_type || 'image/png'};base64,${d.data}`;
  };
  // 1) fotografija parcele + referentne fotografije modela; 2) rezervno: samo parcela + opis modela.
  const callGemini = async () =>
    (await callGeminiOnce([parcelPart, ...refParts, { text: prompt }], ['TEXT', 'IMAGE'])) ||
    (await callGeminiOnce([parcelPart, { text: simplePrompt }], ['TEXT', 'IMAGE']));

  const results = (await Promise.all(Array.from({ length: variants }, callGemini))).filter(Boolean);
  if (results.length === 0) return c.json({ error: 'AI trenutno nije uspio izraditi sliku. Pokušajte ponovno ili koristite ručni način.' }, 502);

  await kv.set(counterKey, { n: used + results.length });
  return c.json({ success: true, images: results, remaining: Math.max(limit - used - results.length, 0) });
});

// Upit za ponudu (vizualizator i glavna stranica): sprema se i šalje e-mailom Mondo Acqui.
registerRoute(app, 'post', '/visualize/inquiry', async (c: any) => {
  const body = await c.req.json().catch(() => ({}));
  const name = String(body.name || '').trim().slice(0, 120);
  const phone = String(body.phone || '').trim().slice(0, 40);
  const email = String(body.email || '').trim().slice(0, 120);
  const note = String(body.note || '').trim().slice(0, 1000);
  const location = String(body.location || '').trim().slice(0, 200);
  if (!name || (!phone && !isEmail(email))) return c.json({ error: 'Upišite ime i telefon ili e-mail.' }, 400);
  const pool = await kv.get(`catalog:pools:${String(body.poolId || '')}`);
  const img = parseDataUrl(body.image);

  const id = crypto.randomUUID();
  const inquiry: any = { id, name, phone, email, note, location, poolId: pool?.id || null, poolName: pool?.name || '', createdAt: new Date().toISOString(), status: 'new' };
  await kv.set(`admin:viz-inquiries:${id}`, inquiry);

  let emailSent = false;
  let emailError = '';
  try {
    const r: any = await resend.emails.send({
      from: 'Mondo Acqua <orders@resend.dev>',
      to: [INQUIRY_EMAIL],
      ...(isEmail(email) ? { reply_to: email } : {}),
      subject: `UPIT ZA BAZEN: ${name}${pool?.name ? ' – ' + pool.name : ''}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2>Novi upit za ponudu</h2>
          <p><strong>Ime:</strong> ${escapeHtml(name)}</p>
          <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
          <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
          <p><strong>Lokacija:</strong> ${escapeHtml(location)}</p>
          ${pool?.name ? `<p><strong>Model:</strong> ${escapeHtml(pool.name)} ${escapeHtml(pool.dimensions || '')}</p>` : ''}
          <p><strong>Detalji:</strong><br>${escapeHtml(note).replace(/\n/g, '<br>')}</p>
          ${img ? '<p>Vizualizacija je u privitku.</p>' : ''}
        </div>`,
      attachments: img ? [{ filename: `vizualizacija-${id.slice(0, 8)}.${img.mime === 'image/png' ? 'png' : 'jpg'}`, content: img.data }] : undefined,
    } as any);
    emailSent = !r?.error;
    if (r?.error) {
      emailError = String(r.error?.message || JSON.stringify(r.error)).slice(0, 300);
      console.error('Inquiry email error:', JSON.stringify(r.error));
    }
  } catch (err) {
    emailError = String(err).slice(0, 300);
    console.error('Inquiry email failed:', err);
  }
  await kv.set(`admin:viz-inquiries:${id}`, { ...inquiry, emailSent, emailError });
  return c.json({ success: true, id, emailSent });
});

registerRoute(app, 'get', '/admin/viz-inquiries', authMiddleware, mondoAdminOnly, async (c: any) => {
  const items = await kv.getByPrefix('admin:viz-inquiries:');
  return c.json(items.sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || '')));
});


app.all('*', (c) => c.json({ error: 'Not Found', path: c.req.path }, 404));

Deno.serve(app.fetch);
