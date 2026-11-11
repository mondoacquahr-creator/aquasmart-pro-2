import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { Resend } from "npm:resend";
import * as kv from "./kv_store.tsx";

// AquaSmart Pro 2.0 server — verzija s tvrtkama, djelatnicima i ovlastima.
// Tvrtka (companyId), uloga i ovlasti čitaju se SAMO iz app_metadata,
// koju korisnik ne može sam mijenjati (user_metadata može).

const app = new Hono();
const resend = new Resend(Deno.env.get('resend'));
const MONDO_ACQUA_EMAIL = "info@mondo-acqua.hr";

app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey", "X-Client-Info"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const adminClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const BUCKET_NAME = "make-381f82bd-images";
const initBucket = async () => {
  const supabase = adminClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((bucket: any) => bucket.name === BUCKET_NAME);
  if (!bucketExists) {
    await supabase.storage.createBucket(BUCKET_NAME, { public: false });
  }
};
initBucket().catch(err => console.error("Bucket init error:", err));

// ---------- Tvrtka, uloga, ovlasti ----------

type Access = 'none' | 'view' | 'edit';
interface Permissions {
  workOrders: 'own' | 'all';
  createOrders: boolean;
  warehouse: Access;
  clients: Access;
  prices: boolean;
  waterAnalysis: boolean;
  visualizer: boolean;
}

const DEFAULT_PERMISSIONS: Permissions = {
  workOrders: 'own',
  createOrders: false,
  warehouse: 'view',
  clients: 'view',
  prices: false,
  waterAnalysis: true,
  visualizer: true,
};

const FULL_PERMISSIONS: Permissions = {
  workOrders: 'all',
  createOrders: true,
  warehouse: 'edit',
  clients: 'edit',
  prices: true,
  waterAnalysis: true,
  visualizer: true,
};

const ACCESS_VALUES = ['none', 'view', 'edit'];

// Prima bilo što s klijenta i vraća samo dopuštene vrijednosti.
const sanitizePermissions = (input: any): Permissions => {
  const p = input && typeof input === 'object' ? input : {};
  return {
    workOrders: p.workOrders === 'all' ? 'all' : 'own',
    createOrders: p.createOrders === true,
    warehouse: ACCESS_VALUES.includes(p.warehouse) ? p.warehouse : DEFAULT_PERMISSIONS.warehouse,
    clients: ACCESS_VALUES.includes(p.clients) ? p.clients : DEFAULT_PERMISSIONS.clients,
    prices: p.prices === true,
    waterAnalysis: p.waterAnalysis !== false,
    visualizer: p.visualizer !== false,
  };
};

type AppRole = 'owner' | 'employee' | 'client' | 'member';

const getCompanyId = (user: any): string => user.app_metadata?.companyId || user.id;

// Korisnici bez app_metadata.role (stari računi) tretiraju se kao vlasnici
// vlastite, prazne tvrtke (companyId = vlastiti id). Nikad ne dobivaju tuđe podatke.
const getRole = (user: any): AppRole => {
  const r = user.app_metadata?.role;
  if (r === 'employee' || r === 'client' || r === 'owner' || r === 'member') return r;
  return 'owner';
};

const getPermissions = (user: any): Permissions => {
  if (getRole(user) === 'owner') return FULL_PERMISSIONS;
  return sanitizePermissions(user.app_metadata?.permissions);
};

// Mondo admin = oznaka u app_metadata (postavlja se samo na poslužitelju), ne e-mail.
const isMondoAdmin = (user: any) => user?.app_metadata?.mondoAdmin === true;

// ---------- Middleware ----------

const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const accessToken = authHeader?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Missing authorization header' }, 401);
  }
  const { data: { user }, error } = await adminClient().auth.getUser(accessToken);
  if (error || !user) {
    return c.json({ error: 'Unauthorized', details: error?.message || 'No user session found for this token' }, 401);
  }
  // Zabranjeni (deaktivirani) djelatnik ne smije ništa, ni dok mu token još vrijedi.
  if (user.banned_until && new Date(user.banned_until) > new Date()) {
    return c.json({ error: 'Račun je deaktiviran.' }, 403);
  }
  c.set('user', user);
  await next();
};

const ownerOnly = async (c: any, next: any) => {
  const user = c.get('user');
  if (getRole(user) !== 'owner') return c.json({ error: 'Samo nositelj tvrtke smije ovu radnju.' }, 403);
  await next();
};

// ---------- Probno razdoblje i pretplata tvrtke ----------
// Nakon TRIAL_DAYS dana tvrtka (nositelj i djelatnici) može samo čitati podatke,
// dok Mondo admin ne upiše plaćenu pretplatu (paidUntil) ili oznaku exempt.
const TRIAL_DAYS = 30;
const TRIAL_EXPIRED_MSG = 'Probno razdoblje od 30 dana je isteklo. Podatke i dalje možete pregledavati; za nastavak rada javite se Mondo Acqui: info@mondo-acqua.hr, +385 95 208 7321.';

const companyBilling = async (user: any) => {
  const companyId = getCompanyId(user);
  const key = `company:${companyId}:billing`;
  let b = await kv.get(key);
  if (!b || !b.trialEndsAt) {
    let created = user.created_at;
    if (companyId !== user.id) {
      const { data } = await adminClient().auth.admin.getUserById(companyId);
      created = data?.user?.created_at || created;
    }
    const start = Date.parse(created || '') || Date.now();
    b = { ...(b || {}), trialEndsAt: new Date(start + TRIAL_DAYS * 86400000).toISOString(), paidUntil: b?.paidUntil || '' };
    await kv.set(key, b);
  }
  const today = new Date().toISOString().slice(0, 10);
  const paid = !!b.paidUntil && b.paidUntil >= today;
  const inTrial = Date.parse(b.trialEndsAt) > Date.now();
  const trialDaysLeft = Math.ceil((Date.parse(b.trialEndsAt) - Date.now()) / 86400000);
  const active = paid || inTrial || b.exempt === true || isMondoAdmin(user);
  return { trialEndsAt: b.trialEndsAt, paidUntil: b.paidUntil || '', exempt: b.exempt === true, paid, inTrial, trialDaysLeft, active };
};

const activeCompanyOnly = async (c: any, next: any) => {
  const user = c.get('user');
  const role = getRole(user);
  if ((role === 'owner' || role === 'employee') && !isMondoAdmin(user)) {
    const b = await companyBilling(user);
    if (!b.active) return c.json({ error: TRIAL_EXPIRED_MSG, code: 'TRIAL_EXPIRED' }, 402);
  }
  await next();
};

const BASE_PATH = "/make-server-381f82bd";
const FUNCTIONS_PATH = "/functions/v1/make-server-381f82bd";

const registerRoute = (app: Hono, method: 'get' | 'post' | 'delete' | 'put', path: string, ...handlers: any[]) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  (app as any)[method](cleanPath, ...handlers);
  (app as any)[method](`${BASE_PATH}${cleanPath}`, ...handlers);
  (app as any)[method](`${FUNCTIONS_PATH}${cleanPath}`, ...handlers);
};

registerRoute(app, 'get', '/health', (c: any) => c.json({ status: "ok" }));

// Detalji proizvoda u webshopu (opis, upute i doziranje prema proizvođaču, tehnički podaci). Javno čitanje.
registerRoute(app, 'get', '/shop/details', async (c: any) => {
  try {
    const { data, error } = await adminClient().from('kv_store_381f82bd').select('key, value').like('key', 'shop:details:%');
    if (error) return c.json({ error: error.message }, 500);
    const out: Record<string, any> = {};
    for (const r of data || []) out[String(r.key).slice('shop:details:'.length)] = r.value;
    c.header('Cache-Control', 'public, max-age=3600');
    return c.json(out);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ---------- Webshop: narudžba plaćena PayPalom (javno; Mondo uplatu provjerava u PayPalu) ----------

registerRoute(app, 'post', '/shop/paypal-order', async (c: any) => {
  const body = await c.req.json().catch(() => ({}));
  const str = (v: any, max: number) => String(v ?? '').trim().slice(0, max);
  const paypalOrderId = str(body.paypalOrderId, 40);
  if (!/^[A-Z0-9]{8,40}$/i.test(paypalOrderId)) return c.json({ error: 'Neispravan broj PayPal transakcije.' }, 400);
  const key = `admin:paypal-orders:${paypalOrderId}`;
  if (await kv.get(key)) return c.json({ success: true, duplicate: true });
  const order = {
    id: paypalOrderId,
    amount: Number(body.amount) || 0,
    payerEmail: str(body.payerEmail, 120), payerName: str(body.payerName, 120),
    name: str(body.name, 120), phone: str(body.phone, 40), email: str(body.email, 120),
    delivery: str(body.delivery, 40), address: str(body.address, 200), note: str(body.note, 1000),
    orderText: str(body.orderText, 6000),
    createdAt: new Date().toISOString(),
  };
  await kv.set(key, order);
  try {
    await resend.emails.send({
      from: 'Mondo Pool Care <orders@resend.dev>',
      to: [MONDO_ACQUA_EMAIL],
      subject: `PLAĆENA NARUDŽBA (PayPal ${order.amount.toFixed(2)} €): ${order.name || order.payerName}`,
      html: `<div style="font-family:sans-serif;max-width:600px">
        <h2>Narudžba plaćena PayPalom</h2>
        <p><strong>PayPal transakcija:</strong> ${escapeHtml(order.id)} – provjerite uplatu u PayPal računu prije slanja robe.</p>
        <p><strong>Platitelj (PayPal):</strong> ${escapeHtml(order.payerName)} ${escapeHtml(order.payerEmail)}</p>
        <pre style="white-space:pre-wrap;font-family:inherit;background:#f6f8f9;padding:12px;border-radius:8px">${escapeHtml(order.orderText)}</pre>
      </div>`,
    } as any);
  } catch (err) { console.error('PayPal order email failed:', err); }
  return c.json({ success: true });
});

// ---------- Stanje pretplate tvrtke ----------

registerRoute(app, 'get', '/company/status', authMiddleware, async (c: any) => {
  const user = c.get('user');
  const role = getRole(user);
  if (role !== 'owner' && role !== 'employee') return c.json({ active: true });
  return c.json(await companyBilling(user));
});

// ---------- Podaci tvrtke za ponude (naziv, OIB, adresa, IBAN) ----------

const cleanIban = (v: any) => String(v ?? '').replace(/\s+/g, '').toUpperCase().slice(0, 34);

registerRoute(app, 'get', '/company/settings', authMiddleware, async (c: any) => {
  const user = c.get('user');
  const role = getRole(user);
  if (role !== 'owner' && role !== 'employee') return c.json({ error: 'Nemate pristup.' }, 403);
  const s = (await kv.get(`company:${getCompanyId(user)}:settings`)) || {};
  return c.json({ companyName: user.app_metadata?.companyName || user.user_metadata?.companyName || '', ...s });
});

registerRoute(app, 'put', '/company/settings', authMiddleware, ownerOnly, async (c: any) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const iban = cleanIban(body.iban);
  if (iban && !/^HR\d{19}$/.test(iban)) return c.json({ error: 'IBAN mora biti hrvatski: HR i 19 znamenki.' }, 400);
  const oib = String(body.oib ?? '').replace(/\D/g, '').slice(0, 11);
  if (oib && oib.length !== 11) return c.json({ error: 'OIB mora imati 11 znamenki.' }, 400);
  const settings = {
    companyName: String(body.companyName ?? '').trim().slice(0, 120),
    oib, iban,
    address: String(body.address ?? '').trim().slice(0, 120),
    city: String(body.city ?? '').trim().slice(0, 80),
    email: String(body.email ?? '').trim().slice(0, 120),
    phone: String(body.phone ?? '').trim().slice(0, 40),
    updatedAt: new Date().toISOString(),
  };
  await kv.set(`company:${getCompanyId(user)}:settings`, settings);
  return c.json({ success: true, settings });
});

// ---------- Tko sam ja ----------

registerRoute(app, 'get', '/me', authMiddleware, (c: any) => {
  const user = c.get('user');
  return c.json({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email,
    role: getRole(user),
    companyId: getCompanyId(user),
    companyName: user.app_metadata?.companyName || user.user_metadata?.companyName || '',
    permissions: getPermissions(user),
    isMondoAdmin: isMondoAdmin(user),
  });
});

// ---------- Slike ----------

registerRoute(app, 'post', '/images/upload', authMiddleware, activeCompanyOnly, async (c: any) => {
  const user = c.get('user');
  const formData = await c.req.formData();
  const file = formData.get('file');
  if (!file) return c.json({ error: 'No file uploaded' }, 400);
  // Putanja je uvijek unutar mape tvrtke, bez obzira što klijent pošalje.
  const requested = (formData.get('path') || '').toString().replace(/\.\./g, '').replace(/^\/+/, '');
  const fileName = requested || `${Date.now()}-${(file as File).name}`;
  const path = `company-${getCompanyId(user)}/${fileName}`;

  const supabase = adminClient();
  const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(path, file, { upsert: true });
  if (error) return c.json({ error: error.message }, 500);
  const { data: signedUrlData, error: signedError } = await supabase.storage
    .from(BUCKET_NAME).createSignedUrl(path, 60 * 60 * 24 * 7);
  if (signedError) return c.json({ error: signedError.message }, 500);
  return c.json({ success: true, path: data.path, url: signedUrlData.signedUrl });
});

registerRoute(app, 'get', '/images/url', authMiddleware, async (c: any) => {
  const user = c.get('user');
  const path = c.req.query('path');
  if (!path) return c.json({ error: 'Path is required' }, 400);
  if (!path.startsWith(`company-${getCompanyId(user)}/`) && !isMondoAdmin(user)) {
    return c.json({ error: 'Nemate pristup ovoj slici.' }, 403);
  }
  const { data, error } = await adminClient().storage.from(BUCKET_NAME).createSignedUrl(path, 60 * 60 * 24 * 7);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ url: data.signedUrl });
});

// ---------- Obavijesti (samo unutar iste tvrtke) ----------

registerRoute(app, 'post', '/notifications/send', authMiddleware, async (c: any) => {
  const user = c.get('user');
  const notification = await c.req.json();
  const targetUserId = notification.userId;
  if (!targetUserId) return c.json({ error: 'Target userId is required' }, 400);

  const { data: target } = await adminClient().auth.admin.getUserById(targetUserId);
  if (!target?.user || getCompanyId(target.user) !== getCompanyId(user)) {
    return c.json({ error: 'Primatelj nije u vašoj tvrtki.' }, 403);
  }

  const notificationId = crypto.randomUUID();
  const data = {
    ...notification,
    id: notificationId,
    timestamp: new Date().toISOString(),
    fromUserId: user.id,
    fromUserName: user.user_metadata?.name || 'Admin',
    read: false,
  };
  try {
    await kv.set(`u:${targetUserId}:notifications:${notificationId}`, data);
    return c.json({ success: true, notification: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ---------- Pravila po resursu ----------

const PRICE_FIELDS = ['totalCost', 'cost', 'price', 'pricePerUnit', 'discount', 'billing', 'invoicedAt'];

const stripPrices = (value: any): any => {
  if (Array.isArray(value)) return value.map(stripPrices);
  if (value && typeof value === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) {
      if (PRICE_FIELDS.includes(k)) continue;
      out[k] = stripPrices(v);
    }
    return out;
  }
  return value;
};

// Djelatnik bez prava na cijene ne vidi cijene, pa ih ne smije ni prebrisati:
// cijene se preuzimaju iz postojećeg zapisa.
const restorePrices = (incoming: any, existing: any): any => {
  if (!existing || typeof existing !== 'object') return stripPrices(incoming);
  if (Array.isArray(incoming)) {
    const byId = new Map((Array.isArray(existing) ? existing : []).map((e: any) => [String(e?.id), e]));
    return incoming.map((item: any) => restorePrices(item, item && typeof item === 'object' ? byId.get(String(item.id)) : undefined));
  }
  if (incoming && typeof incoming === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(incoming)) {
      if (PRICE_FIELDS.includes(k)) continue;
      out[k] = restorePrices(v, existing[k]);
    }
    for (const k of PRICE_FIELDS) {
      if (k in existing) out[k] = existing[k];
    }
    return out;
  }
  return incoming;
};

const isAssignedTo = (order: any, userId: string) =>
  order?.assigneeId === userId ||
  (Array.isArray(order?.additionalWorkers) && order.additionalWorkers.some((w: any) => w?.id === userId));

const accessFor = (resource: string, perms: Permissions): Access => {
  switch (resource) {
    case 'clients': return perms.clients;
    case 'warehouse':
    case 'warehouse-transactions': return perms.warehouse;
    case 'analyses':
    case 'pools': return perms.waterAnalysis ? 'edit' : 'view';
    default: return 'edit';
  }
};

// Filtrira popis koji smije vidjeti korisnik.
const filterList = (resource: string, items: any[], user: any): any[] | null => {
  const role = getRole(user);
  if (role === 'owner') return items;
  if (role === 'client' || role === 'member') return null;
  const perms = getPermissions(user);

  if (resource === 'employees') {
    // Djelatnici vide kolege (za izvršitelja na nalogu), ali ne i tuđe ovlasti.
    return items.map(({ permissions, ...rest }: any) => rest.id === user.id ? { ...rest, permissions } : rest);
  }
  if (resource === 'work-orders') {
    const visible = perms.workOrders === 'all' ? items : items.filter((o: any) => isAssignedTo(o, user.id));
    return perms.prices ? visible : visible.map(stripPrices);
  }
  if (resource === 'orders') {
    return items.filter((o: any) => o.userId === user.id);
  }
  if (resource === 'warehouse' && perms.warehouse === 'none') {
    // Za unos utrošene kemije na nalogu svaki djelatnik dobiva samo nazive artikala, bez količina i cijena.
    return items.map((i: any) => ({ id: i.id, name: i.name, unit: i.unit, category: i.category }));
  }
  if (accessFor(resource, perms) === 'none') return null;
  if (resource === 'warehouse' && !perms.prices) return items.map(stripPrices);
  return items;
};

const RESOURCES = ['pools', 'analyses', 'clients', 'work-orders', 'employees', 'warehouse', 'warehouse-transactions', 'notifications', 'orders'];

const createCrudRoutes = (resourceName: string) => {
  registerRoute(app, 'get', `/${resourceName}`, authMiddleware, async (c: any) => {
    const user = c.get('user');
    try {
      if (resourceName === 'notifications') {
        return c.json(await kv.getByPrefix(`u:${user.id}:notifications:`));
      }
      const items = await kv.getByPrefix(`c:${getCompanyId(user)}:${resourceName}:`);
      const visible = filterList(resourceName, items, user);
      if (visible === null) return c.json({ error: 'Nemate pristup.' }, 403);
      return c.json(visible);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

  const writeGuards = resourceName === 'notifications' ? [] : [activeCompanyOnly];
  registerRoute(app, 'post', `/${resourceName}`, authMiddleware, ...writeGuards, async (c: any) => {
    const user = c.get('user');
    let item = await c.req.json();
    if (!item || item.id === undefined || item.id === null || item.id === '') {
      return c.json({ error: 'Item must have an id' }, 400);
    }
    const id = String(item.id);

    if (resourceName === 'notifications') {
      try {
        await kv.set(`u:${user.id}:notifications:${id}`, item);
        return c.json({ success: true, item });
      } catch (err: any) {
        return c.json({ error: err.message }, 500);
      }
    }

    const role = getRole(user);
    if (role === 'client' || role === 'member') return c.json({ error: 'Nemate pravo na ovu radnju.' }, 403);
    const key = `c:${getCompanyId(user)}:${resourceName}:${id}`;

    try {
      if (role === 'employee') {
        const perms = getPermissions(user);
        if (resourceName === 'employees') {
          return c.json({ error: 'Samo nositelj tvrtke uređuje djelatnike.' }, 403);
        }
        if (resourceName === 'work-orders') {
          const existing = await kv.get(key);
          if (!existing) {
            if (!perms.createOrders) return c.json({ error: 'Nemate pravo otvarati naloge.' }, 403);
            if (perms.workOrders === 'own' && !isAssignedTo(item, user.id)) {
              item = { ...item, assigneeId: user.id, assignee: item.assignee || user.user_metadata?.name || user.email };
            }
          } else {
            if (perms.workOrders === 'own' && !isAssignedTo(existing, user.id)) {
              return c.json({ error: 'Ovaj nalog nije dodijeljen vama.' }, 403);
            }
            if (perms.workOrders === 'own') {
              // Djelatnik ne može prebaciti nalog na drugoga.
              item = { ...item, assigneeId: existing.assigneeId, assignee: existing.assignee, additionalWorkers: existing.additionalWorkers };
            }
          }
          if (!perms.prices) item = restorePrices(item, existing);
        } else if (resourceName !== 'orders') {
          if (accessFor(resourceName, perms) !== 'edit') {
            return c.json({ error: 'Nemate pravo mijenjati ove podatke.' }, 403);
          }
          if (resourceName === 'warehouse' && !perms.prices) {
            item = restorePrices(item, await kv.get(key));
          }
        }
      } else if (resourceName === 'employees') {
        // Nositelj uređuje opće podatke; ovlasti se mijenjaju samo preko /employees/:id/permissions.
        const existing = await kv.get(key);
        item = { ...item, permissions: existing?.permissions, email: existing?.email ?? item.email };
      }

      if (resourceName === 'orders') item = { ...item, userId: user.id };

      await kv.set(key, item);
      return c.json({ success: true, item });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

  registerRoute(app, 'delete', `/${resourceName}/:id`, authMiddleware, ...writeGuards, async (c: any) => {
    const user = c.get('user');
    const id = c.req.param('id');
    try {
      if (resourceName === 'notifications') {
        await kv.del(`u:${user.id}:notifications:${id}`);
        return c.json({ success: true });
      }
      const role = getRole(user);
      if (role === 'client' || role === 'member') return c.json({ error: 'Nemate pravo na ovu radnju.' }, 403);
      if (role === 'employee') {
        const perms = getPermissions(user);
        const allowed = resourceName !== 'employees' && resourceName !== 'work-orders' && resourceName !== 'orders'
          && accessFor(resourceName, perms) === 'edit';
        if (!allowed) return c.json({ error: 'Nemate pravo brisati ove podatke.' }, 403);
      }
      if (resourceName === 'employees') {
        return c.json({ error: 'Djelatnik se uklanja preko /employees/:id/deactivate.' }, 400);
      }
      await kv.del(`c:${getCompanyId(user)}:${resourceName}:${id}`);
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });
};

// ---------- Djelatnici: otvaranje računa, ovlasti, (de)aktivacija ----------
// Ove rute moraju biti registrirane PRIJE generičkih, da /employees/create ne završi kao generička ruta.

const isEmail = (s: any) => typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

registerRoute(app, 'post', '/employees/create', authMiddleware, ownerOnly, activeCompanyOnly, async (c: any) => {
  const owner = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!name) return c.json({ error: 'Upišite ime djelatnika.' }, 400);
  if (!isEmail(email)) return c.json({ error: 'Neispravan e-mail.' }, 400);
  if (password.length < 8) return c.json({ error: 'Privremena lozinka mora imati najmanje 8 znakova.' }, 400);

  const companyId = getCompanyId(owner);
  const companyName = owner.app_metadata?.companyName || owner.user_metadata?.companyName || '';
  const permissions = sanitizePermissions(body.permissions);

  const supabase = adminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: 'employee', companyName, mustChangePassword: true },
    app_metadata: { role: 'employee', companyId, companyName, permissions },
  });
  if (error) {
    const exists = /already|registered|exists/i.test(error.message);
    return c.json({ error: exists ? 'Račun s tim e-mailom već postoji.' : error.message }, exists ? 409 : 400);
  }

  const employee = {
    id: data.user.id,
    name,
    email,
    role: String(body.position || 'Serviser'),
    location: String(body.location || ''),
    status: 'active',
    tasks: 0,
    performance: 0,
    permissions,
    createdAt: new Date().toISOString(),
  };
  await kv.set(`c:${companyId}:employees:${employee.id}`, employee);
  return c.json({ success: true, employee });
});

const loadCompanyEmployee = async (c: any) => {
  const owner = c.get('user');
  const id = c.req.param('id');
  const companyId = getCompanyId(owner);
  const existing = await kv.get(`c:${companyId}:employees:${id}`);
  const { data } = await adminClient().auth.admin.getUserById(id);
  const target = data?.user;
  if (!existing || !target || getCompanyId(target) !== companyId || getRole(target) !== 'employee') {
    return { error: c.json({ error: 'Djelatnik nije pronađen u vašoj tvrtki.' }, 404) };
  }
  return { owner, id, companyId, existing, target };
};

registerRoute(app, 'post', '/employees/:id/permissions', authMiddleware, ownerOnly, activeCompanyOnly, async (c: any) => {
  const r: any = await loadCompanyEmployee(c);
  if (r.error) return r.error;
  const body = await c.req.json().catch(() => ({}));
  const permissions = sanitizePermissions(body.permissions);
  const { error } = await adminClient().auth.admin.updateUserById(r.id, {
    app_metadata: { ...r.target.app_metadata, permissions },
  });
  if (error) return c.json({ error: error.message }, 500);
  const employee = { ...r.existing, permissions };
  await kv.set(`c:${r.companyId}:employees:${r.id}`, employee);
  return c.json({ success: true, employee });
});

const setActive = (active: boolean) => async (c: any) => {
  const r: any = await loadCompanyEmployee(c);
  if (r.error) return r.error;
  // Zabrana prijave je reverzibilna (za razliku od brisanja računa).
  const { error } = await adminClient().auth.admin.updateUserById(r.id, {
    ban_duration: active ? 'none' : '876000h',
  } as any);
  if (error) return c.json({ error: error.message }, 500);
  const employee = { ...r.existing, status: active ? 'active' : 'inactive' };
  await kv.set(`c:${r.companyId}:employees:${r.id}`, employee);
  return c.json({ success: true, employee });
};

registerRoute(app, 'post', '/employees/:id/deactivate', authMiddleware, ownerOnly, setActive(false));
registerRoute(app, 'post', '/employees/:id/activate', authMiddleware, ownerOnly, activeCompanyOnly, setActive(true));

RESOURCES.forEach(createCrudRoutes);

// ---------- Poruke ----------

const MESSAGE_PREFIX = 'm:';

registerRoute(app, 'get', '/messages', authMiddleware, async (c: any) => {
  try {
    const user = c.get('user');
    const messages = await kv.getByPrefix(`${MESSAGE_PREFIX}${getCompanyId(user)}:`);
    return c.json(messages || []);
  } catch (err: any) {
    console.error('Error fetching messages:', err);
    return c.json([], 200);
  }
});

registerRoute(app, 'post', '/messages', authMiddleware, activeCompanyOnly, async (c: any) => {
  const user = c.get('user');
  const message = await c.req.json();
  if (!message.id) return c.json({ error: 'Message must have ID' }, 400);
  try {
    await kv.set(`${MESSAGE_PREFIX}${getCompanyId(user)}:${message.id}`, message);
    return c.json({ success: true, message });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

registerRoute(app, 'delete', '/messages/:id', authMiddleware, async (c: any) => {
  const user = c.get('user');
  if (getRole(user) === 'employee') return c.json({ error: 'Nemate pravo brisati poruke.' }, 403);
  try {
    await kv.del(`${MESSAGE_PREFIX}${getCompanyId(user)}:${c.req.param('id')}`);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ---------- Narudžbe iz webshopa (e-mail Mondo Acqui) ----------

const escapeHtml = (s: any) => String(s ?? '').replace(/[&<>"']/g, (ch) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as any)[ch]);

registerRoute(app, 'post', '/orders/submit', authMiddleware, async (c: any) => {
  const user = c.get('user');
  const { items, totalWithVat, note } = await c.req.json();
  if (!Array.isArray(items) || items.length === 0) return c.json({ error: 'Košarica je prazna.' }, 400);

  const orderId = crypto.randomUUID();
  const finalTotalWithVat = Number(totalWithVat);
  const totalBase = finalTotalWithVat / 1.25;
  const vatAmount = finalTotalWithVat - totalBase;
  const companyId = getCompanyId(user);

  const order = {
    id: orderId,
    userId: user.id,
    userName: user.user_metadata?.name || user.email,
    userEmail: user.email,
    companyId,
    items,
    totalEUR: totalBase,
    vatAmount,
    totalWithVat: finalTotalWithVat,
    note,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await kv.set(`admin:orders:${orderId}`, order);
  await kv.set(`c:${companyId}:orders:${orderId}`, order);

  try {
    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(item.name)} (${escapeHtml(item.size)})</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${escapeHtml(item.quantity)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${Number(item.price || 0).toFixed(2)} €</td>
      </tr>`).join('');
    const companyName = user.app_metadata?.companyName || user.user_metadata?.companyName || 'Nije navedeno';

    await resend.emails.send({
      from: 'Mondo Pool Care <orders@resend.dev>',
      to: [MONDO_ACQUA_EMAIL],
      subject: `NOVA NARUDŽBA: ${order.userName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #1E88E5; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #002344; color: #FFFFFF; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Mondo Pool Care</h1>
            <p style="margin: 5px 0 0; color: #4FC3F0;">Nova narudžba proizvoda</p>
          </div>
          <div style="padding: 20px;">
            <h3>Podaci o kupcu:</h3>
            <p><strong>Ime i prezime:</strong> ${escapeHtml(order.userName)}</p>
            <p><strong>E-mail:</strong> ${escapeHtml(order.userEmail)}</p>
            <p><strong>Tvrtka:</strong> ${escapeHtml(companyName)}</p>
            ${note ? `<p><strong>Napomena:</strong> ${escapeHtml(note)}</p>` : ''}
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f8f8f8;">
                  <th style="padding: 8px; text-align: left;">Proizvod</th>
                  <th style="padding: 8px; text-align: center;">Kol.</th>
                  <th style="padding: 8px; text-align: right;">Cijena</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="margin-top: 20px; text-align: right; border-top: 2px solid #1E88E5; padding-top: 10px;">
              <p>Osnovica: <strong>${order.totalEUR.toFixed(2)} €</strong></p>
              <p>PDV (25%): <strong>${order.vatAmount.toFixed(2)} €</strong></p>
              <p style="font-size: 20px; color: #1E6FC0;">UKUPNO: <strong>${order.totalWithVat.toFixed(2)} €</strong></p>
            </div>
          </div>
        </div>`,
    });
  } catch (err) {
    console.error('Email failed:', err);
  }
  return c.json({ success: true, orderId });
});

// ---------- Mondo Acqua admin ----------

registerRoute(app, 'get', '/admin/all-orders', authMiddleware, async (c: any) => {
  if (!isMondoAdmin(c.get('user'))) return c.json({ error: 'Unauthorized' }, 403);
  return c.json(await kv.getByPrefix('admin:orders:'));
});

registerRoute(app, 'get', '/admin/all-messages', authMiddleware, async (c: any) => {
  if (!isMondoAdmin(c.get('user'))) return c.json({ error: 'Unauthorized' }, 403);
  return c.json(await kv.getByPrefix('m:'));
});

// ---------- Sync: sve podatke tvrtke odjednom, s istim pravilima ----------

registerRoute(app, 'get', '/sync', authMiddleware, async (c: any) => {
  const user = c.get('user');
  const companyId = getCompanyId(user);
  try {
    const list = ['pools', 'analyses', 'clients', 'work-orders', 'warehouse', 'warehouse-transactions', 'employees', 'orders'];
    const results: Record<string, any[]> = {};
    for (const res of list) {
      const items = await kv.getByPrefix(`c:${companyId}:${res}:`);
      results[res] = filterList(res, items, user) ?? [];
    }
    return c.json(results);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ---------- Vlasnici bazena (registrirani korisnici Mondo Acque) ----------
// Uloga 'member': vlastiti profil, "Moj bazen", povijest analiza i zahtjev za besplatni pregled.
// Ne vide ničije podatke osim svojih. Mondo admin vidi sve članove, opremu i zahtjeve.

const cleanStr = (v: any, max = 200) => String(v ?? '').trim().slice(0, max);
const cleanNum = (v: any, min = -1e9, max = 1e9): number | null => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

const memberOnly = async (c: any, next: any) => {
  if (getRole(c.get('user')) !== 'member') return c.json({ error: 'Ova radnja je za registrirane vlasnike bazena.' }, 403);
  await next();
};
const mondoOnly = async (c: any, next: any) => {
  if (!isMondoAdmin(c.get('user'))) return c.json({ error: 'Samo Mondo Acqua admin smije ovu radnju.' }, 403);
  await next();
};

const POOL_FIELDS = {
  volume: (v: any) => cleanNum(v, 0, 5000),
  length: (v: any) => cleanNum(v, 0, 100),
  width: (v: any) => cleanNum(v, 0, 100),
  depth: (v: any) => cleanNum(v, 0, 10),
  poolType: (v: any) => cleanStr(v, 60),
  circulation: (v: any) => (v === 'Skimer' || v === 'Preljevni' ? v : ''),
  filterType: (v: any) => cleanStr(v, 60),
  filterMedia: (v: any) => cleanStr(v, 60),
  filterLoad: (v: any) => cleanNum(v, 0, 5000),
  pumpPower: (v: any) => cleanNum(v, 0, 100),
  pumpPowerUnit: (v: any) => (v === 'HP' ? 'HP' : 'kW'),
  disinfection: (v: any) => cleanStr(v, 60),
  poolYear: (v: any) => cleanNum(v, 1950, 2100),
  heating: (v: any) => cleanStr(v, 60),
  heatingPower: (v: any) => cleanNum(v, 0, 500),
  cover: (v: any) => cleanStr(v, 60),
  address: (v: any) => cleanStr(v, 200),
  notes: (v: any) => cleanStr(v, 1000),
} as Record<string, (v: any) => any>;

const cleanPoolProfile = (body: any) => {
  const out: Record<string, any> = {};
  for (const [k, fn] of Object.entries(POOL_FIELDS)) out[k] = fn(body?.[k]);
  return out;
};

const ANALYSIS_NUM_FIELDS = ['pH', 'freeChlorine', 'totalChlorine', 'alkalinity', 'hardness', 'cyanuricAcid', 'temperature', 'orp', 'volume'];
const cleanAnalysis = (body: any) => {
  const values: Record<string, number | null> = {};
  for (const k of ANALYSIS_NUM_FIELDS) values[k] = cleanNum(body?.[k] ?? body?.values?.[k], -100, 100000);
  const recs = Array.isArray(body?.recommendations) ? body.recommendations.slice(0, 20).map((r: any) => ({
    productName: cleanStr(r?.productName, 120),
    dosage: cleanStr(r?.dosage, 120),
    instructions: cleanStr(r?.instructions, 500),
  })) : [];
  return {
    values,
    status: cleanStr(body?.status, 20),
    message: cleanStr(body?.message, 300),
    issues: Array.isArray(body?.issues) ? body.issues.slice(0, 20).map((s: any) => cleanStr(s, 200)) : [],
    recommendations: recs,
  };
};

// planActive: Mondo Care vrijedi dok ne istekne planValidUntil (uključivo).
const withPlanStatus = (p: any) => {
  if (!p) return p;
  const today = new Date().toISOString().slice(0, 10);
  const planActive = p.plan === 'care' && (!p.planValidUntil || p.planValidUntil >= today);
  return { ...p, plan: p.plan === 'care' ? 'care' : 'free', planActive };
};

const MAX_MEMBER_ANALYSES = 200;
const byDateDesc = (a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''));

const loadMember = async (id: string) => {
  const [profile, pool, analyses, visits, equipment] = await Promise.all([
    kv.get(`member:${id}:profile`),
    kv.get(`member:${id}:pool`),
    kv.getByPrefix(`member:${id}:analyses:`),
    kv.getByPrefix(`member:${id}:visits:`),
    kv.getByPrefix(`member:${id}:equipment:`),
  ]);
  return {
    profile: profile ? withPlanStatus(profile) : null,
    pool: pool || null,
    analyses: (analyses || []).sort(byDateDesc),
    visits: (visits || []).sort(byDateDesc),
    equipment: (equipment || []).sort((a: any, b: any) => String(a.type || '').localeCompare(String(b.type || ''))),
  };
};

// Moj profil, bazen, povijest analiza, pregledi i oprema (oprema je samo za čitanje; upisuje je Mondo).
registerRoute(app, 'get', '/member/me', authMiddleware, memberOnly, async (c: any) => {
  const user = c.get('user');
  const data = await loadMember(user.id);
  if (!data.profile) {
    data.profile = withPlanStatus({ id: user.id, email: user.email, name: user.user_metadata?.name || '', createdAt: user.created_at });
  }
  return c.json(data);
});

registerRoute(app, 'put', '/member/profile', authMiddleware, memberOnly, async (c: any) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const prev = (await kv.get(`member:${user.id}:profile`)) || { id: user.id, email: user.email, createdAt: new Date().toISOString() };
  const profile = {
    ...prev,
    name: cleanStr(body.name, 120) || prev.name || '',
    phone: cleanStr(body.phone, 40),
    city: cleanStr(body.city, 80),
    address: cleanStr(body.address, 200),
    marketing: body.marketing === true,
    updatedAt: new Date().toISOString(),
  };
  await kv.set(`member:${user.id}:profile`, profile);

  // Obavijest Mondo Acqui o svakoj promjeni profila člana
  const labels: Record<string, string> = { name: 'Ime', phone: 'Telefon', city: 'Mjesto', address: 'Adresa', marketing: 'Obavijesti e-mailom' };
  const changes = Object.keys(labels)
    .filter((k) => String(prev[k] ?? '') !== String((profile as any)[k] ?? ''))
    .map((k) => `<tr><td style="padding:6px 10px 6px 0"><strong>${labels[k]}</strong></td><td style="padding:6px 10px">${escapeHtml(prev[k] ?? '–')}</td><td style="padding:6px 0">→ ${escapeHtml((profile as any)[k] ?? '–')}</td></tr>`);
  if (changes.length) {
    try {
      await resend.emails.send({
        from: 'Mondo Pool Care <orders@resend.dev>',
        to: [MONDO_ACQUA_EMAIL],
        subject: `PROMJENA PROFILA: ${profile.name || user.email}`,
        html: `<div style="font-family:sans-serif;max-width:600px"><h2>Član je promijenio profil</h2>
          <p><strong>E-mail računa:</strong> ${escapeHtml(user.email)}</p>
          <table style="border-collapse:collapse">${changes.join('')}</table></div>`,
      } as any);
    } catch (err) { console.error('Profile change email failed:', err); }
  }
  return c.json({ success: true, profile });
});

// Promjena e-mail adrese člana (ujedno i adrese za prijavu). Traži trenutnu lozinku.
registerRoute(app, 'put', '/member/email', authMiddleware, memberOnly, async (c: any) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const email = cleanStr(body.email, 200).toLowerCase();
  const password = String(body.password ?? '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return c.json({ error: 'Neispravna e-mail adresa.' }, 400);
  if (email === String(user.email || '').toLowerCase()) return c.json({ error: 'To je već vaša e-mail adresa.' }, 400);
  if (!password) return c.json({ error: 'Upišite trenutnu lozinku.' }, 400);

  // Provjera lozinke prijavom (bez spremanja sesije)
  const check = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: pwErr } = await check.auth.signInWithPassword({ email: user.email, password });
  if (pwErr) return c.json({ error: 'Lozinka nije točna.' }, 403);

  const supabase = adminClient();
  const { error } = await supabase.auth.admin.updateUserById(user.id, { email, email_confirm: true });
  if (error) {
    const msg = /already|exists|registered/i.test(error.message) ? 'Račun s tom e-mail adresom već postoji.' : 'Promjena e-maila nije uspjela.';
    return c.json({ error: msg }, /already|exists|registered/i.test(error.message) ? 409 : 500);
  }
  const prev = (await kv.get(`member:${user.id}:profile`)) || { id: user.id, createdAt: new Date().toISOString() };
  const profile = { ...prev, email, updatedAt: new Date().toISOString() };
  await kv.set(`member:${user.id}:profile`, profile);

  try {
    await resend.emails.send({
      from: 'Mondo Pool Care <orders@resend.dev>',
      to: [MONDO_ACQUA_EMAIL],
      subject: `PROMJENA E-MAILA: ${profile.name || email}`,
      html: `<div style="font-family:sans-serif;max-width:600px"><h2>Član je promijenio e-mail adresu</h2>
        <p><strong>Ime:</strong> ${escapeHtml(profile.name || '')}</p>
        <p><strong>Stari e-mail:</strong> ${escapeHtml(user.email)}</p>
        <p><strong>Novi e-mail:</strong> ${escapeHtml(email)}</p></div>`,
    } as any);
  } catch (err) { console.error('Email change notice failed:', err); }
  return c.json({ success: true, email });
});

registerRoute(app, 'put', '/member/pool', authMiddleware, memberOnly, async (c: any) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const pool = { ...cleanPoolProfile(body), updatedAt: new Date().toISOString() };
  await kv.set(`member:${user.id}:pool`, pool);
  return c.json({ success: true, pool });
});

registerRoute(app, 'post', '/member/analyses', authMiddleware, memberOnly, async (c: any) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const a = cleanAnalysis(body);
  if (a.values.pH === null && a.values.freeChlorine === null) return c.json({ error: 'Analiza nema vrijednosti.' }, 400);
  const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const photoPath = cleanStr(body.photoPath, 200);
  const appearance = cleanAppearance(body.appearance);
  const item = {
    id, ...a,
    ...(photoPath.startsWith(`company-${user.id}/water/`) ? { photoPath } : {}),
    ...(appearance ? { appearance } : {}),
    createdAt: new Date().toISOString(),
  };
  await kv.set(`member:${user.id}:analyses:${id}`, item);
  // Čuvamo najviše MAX_MEMBER_ANALYSES najnovijih.
  const all = (await kv.getByPrefix(`member:${user.id}:analyses:`)).sort(byDateDesc);
  if (all.length > MAX_MEMBER_ANALYSES) {
    await kv.mdel(all.slice(MAX_MEMBER_ANALYSES).map((x: any) => `member:${user.id}:analyses:${x.id}`));
  }
  return c.json({ success: true, analysis: item });
});

registerRoute(app, 'delete', '/member/analyses/:id', authMiddleware, memberOnly, async (c: any) => {
  const user = c.get('user');
  await kv.del(`member:${user.id}:analyses:${cleanStr(c.req.param('id'), 80)}`);
  return c.json({ success: true });
});

// ---------- Fotografija bazena: spremanje i AI procjena izgleda vode ----------

const CLARITY = ['clear', 'slightly_cloudy', 'cloudy', 'green'];
const ALGAE = ['none', 'possible', 'visible'];
const cleanAppearance = (v: any) => {
  if (!v || typeof v !== 'object' || !CLARITY.includes(v.clarity)) return null;
  return {
    isPool: v.isPool !== false,
    clarity: v.clarity,
    algae: ALGAE.includes(v.algae) ? v.algae : 'none',
    debris: v.debris === true,
    note: cleanStr(v.note, 300),
  };
};

const WATER_PHOTO_DAILY = 10;
const GEMINI_VISION_MODEL = 'gemini-2.5-flash';

const assessWaterPhoto = async (mime: string, data: string) => {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return null;
  const prompt = [
    'You are an expert in swimming pool water care. Look at this photo taken by a pool owner.',
    'Judge only what is clearly visible. If unsure, choose the milder option.',
    'isPool: true if the photo shows the water of a swimming pool.',
    'clarity: clear (bottom clearly visible, blue water), slightly_cloudy (bottom visible but hazy), cloudy (milky, bottom hard to see), green (green or greenish water).',
    'algae: none, possible (slight green or brown tint, patches on walls or floor), visible (clear algae growth or green water).',
    'debris: true if leaves, insects or dirt are visible on the surface or the floor.',
    'note: one short, plain sentence in Croatian for the pool owner describing what you see in the water (no product names, no doses).',
  ].join(' ');
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_VISION_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ inline_data: { mime_type: mime, data } }, { text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            isPool: { type: 'BOOLEAN' },
            clarity: { type: 'STRING', enum: CLARITY },
            algae: { type: 'STRING', enum: ALGAE },
            debris: { type: 'BOOLEAN' },
            note: { type: 'STRING' },
          },
          required: ['isPool', 'clarity', 'algae', 'debris', 'note'],
        },
      },
    }),
  });
  if (!r.ok) {
    console.error('Gemini water photo error', r.status, await r.text().catch(() => ''));
    return null;
  }
  const j = await r.json();
  const text = (j?.candidates?.[0]?.content?.parts || []).map((p: any) => p.text).filter(Boolean).join('');
  try { return cleanAppearance(JSON.parse(text)); } catch { return null; }
};

registerRoute(app, 'post', '/member/water-photo', authMiddleware, memberOnly, async (c: any) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const m = typeof body.image === 'string' ? body.image.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/) : null;
  if (!m) return c.json({ error: 'Pošaljite fotografiju bazena.' }, 400);
  if (m[2].length > 4_000_000) return c.json({ error: 'Fotografija je prevelika.' }, 400);

  const day = new Date().toISOString().slice(0, 10);
  const counterKey = `member:${user.id}:photo-count:${day}`;
  const used = Number((await kv.get(counterKey))?.n || 0);
  if (used >= WATER_PHOTO_DAILY) {
    return c.json({ error: `Danas ste poslali najviše fotografija (${WATER_PHOTO_DAILY}). Pokušajte sutra.` }, 429);
  }

  const bytes = Uint8Array.from(atob(m[2]), (ch) => ch.charCodeAt(0));
  const ext = m[1] === 'image/png' ? 'png' : m[1] === 'image/webp' ? 'webp' : 'jpg';
  const path = `company-${getCompanyId(user)}/water/${Date.now()}.${ext}`;
  const { error } = await adminClient().storage.from(BUCKET_NAME).upload(path, bytes, { contentType: m[1] });
  if (error) return c.json({ error: error.message }, 500);
  await kv.set(counterKey, { n: used + 1 });

  let assessment = null;
  try { assessment = await assessWaterPhoto(m[1], m[2]); } catch (err) { console.error('Water photo assessment failed:', err); }
  return c.json({ success: true, path, assessment });
});

const FREE_VISIT_DAYS = 365;

registerRoute(app, 'post', '/member/visit-request', authMiddleware, memberOnly, async (c: any) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const visits = await kv.getByPrefix(`member:${user.id}:visits:`);
  const since = Date.now() - FREE_VISIT_DAYS * 24 * 3600 * 1000;
  const recent = visits.find((v: any) => v.status !== 'cancelled' && Date.parse(v.createdAt) > since);
  if (recent) return c.json({ error: 'Besplatni pregled možete zatražiti jednom godišnje. Vaš zahtjev je već zaprimljen.' }, 409);

  const profile = (await kv.get(`member:${user.id}:profile`)) || {};
  const phone = cleanStr(body.phone, 40) || profile.phone || '';
  const address = cleanStr(body.address, 200) || profile.address || '';
  const city = cleanStr(body.city, 80) || profile.city || '';
  if (!phone) return c.json({ error: 'Upišite broj telefona da vas možemo dogovoriti termin.' }, 400);
  if (!address && !city) return c.json({ error: 'Upišite adresu ili mjesto bazena.' }, 400);

  const id = crypto.randomUUID();
  const visit = {
    id, memberId: user.id, name: profile.name || user.user_metadata?.name || '', email: user.email,
    phone, address, city,
    preferred: cleanStr(body.preferred, 120),
    note: cleanStr(body.note, 1000),
    status: 'new', createdAt: new Date().toISOString(),
  };
  await kv.set(`member:${user.id}:visits:${id}`, visit);
  await kv.set(`admin:visit-requests:${id}`, visit);

  try {
    await resend.emails.send({
      from: 'Mondo Pool Care <orders@resend.dev>',
      to: [MONDO_ACQUA_EMAIL],
      subject: `PREGLED OPREME${profile.plan === 'care' ? ' (Mondo Care)' : ''}: ${visit.name || visit.email}${city ? ' – ' + city : ''}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2>Zahtjev za pregled opreme</h2>
          <p><strong>Paket:</strong> ${profile.plan === 'care' ? 'Mondo Care' : 'besplatno članstvo (provjeriti kupnju od 150 € ili naplatiti 49 €)'}</p>
          <p><strong>Ime:</strong> ${escapeHtml(visit.name)}</p>
          <p><strong>E-mail:</strong> ${escapeHtml(visit.email)}</p>
          <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Adresa:</strong> ${escapeHtml(address)} ${escapeHtml(city)}</p>
          <p><strong>Željeni termin:</strong> ${escapeHtml(visit.preferred)}</p>
          <p><strong>Napomena:</strong> ${escapeHtml(visit.note)}</p>
        </div>`,
    } as any);
  } catch (err) {
    console.error('Visit request email failed:', err);
  }
  return c.json({ success: true, visit });
});

// Brisanje računa i svih podataka (pravo na zaborav).
registerRoute(app, 'delete', '/member/account', authMiddleware, memberOnly, async (c: any) => {
  const user = c.get('user');
  const supabase = adminClient();
  const { data: rows } = await supabase.from('kv_store_381f82bd').select('key').like('key', `member:${user.id}:%`);
  const keys = (rows || []).map((r: any) => r.key);
  const visits = await kv.getByPrefix(`member:${user.id}:visits:`);
  keys.push(...visits.map((v: any) => `admin:visit-requests:${v.id}`));
  if (keys.length) await kv.mdel(keys);
  // Fotografije bazena tog vlasnika
  const { data: photos } = await supabase.storage.from(BUCKET_NAME).list(`company-${user.id}/water`, { limit: 1000 });
  if (photos?.length) await supabase.storage.from(BUCKET_NAME).remove(photos.map((f: any) => `company-${user.id}/water/${f.name}`));
  const { error } = await supabase.auth.admin.deleteUser(user.id);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

// ---------- Mondo admin: članovi, pregledi, oprema ----------

registerRoute(app, 'get', '/admin/members', authMiddleware, mondoOnly, async (c: any) => {
  const { data: rows, error } = await adminClient().from('kv_store_381f82bd').select('value').like('key', 'member:%:profile');
  if (error) return c.json({ error: error.message }, 500);
  const list = (rows || []).map((r: any) => r.value).filter((p: any) => p && p.id && p.email);
  const out = await Promise.all(list.map(async (p: any) => {
    const [pool, analyses, equipment, visits] = await Promise.all([
      kv.get(`member:${p.id}:pool`),
      kv.getByPrefix(`member:${p.id}:analyses:`),
      kv.getByPrefix(`member:${p.id}:equipment:`),
      kv.getByPrefix(`member:${p.id}:visits:`),
    ]);
    const lastAnalysis = analyses.sort(byDateDesc)[0] || null;
    return {
      ...withPlanStatus(p), pool: pool || null,
      analysesCount: analyses.length, lastAnalysis,
      equipmentCount: equipment.length,
      needsAttention: equipment.filter((e: any) => e.condition === 'replace' || e.condition === 'watch').length,
      lastVisit: visits.sort(byDateDesc)[0] || null,
    };
  }));
  return c.json(out.sort(byDateDesc));
});

// Popis servisera (tvrtki) za Mondo admin: nositelji tvrtki, bez Mondo admina.
const countKeys = async (prefix: string): Promise<number> => {
  const { count } = await adminClient().from('kv_store_381f82bd')
    .select('key', { count: 'exact', head: true }).like('key', `${prefix}%`);
  return count || 0;
};
registerRoute(app, 'get', '/admin/servicers', authMiddleware, mondoOnly, async (c: any) => {
  const supabase = adminClient();
  const users: any[] = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return c.json({ error: error.message }, 500);
    users.push(...(data?.users || []));
    if (!data?.users || data.users.length < 1000) break;
  }
  const owners = users.filter((u: any) => getRole(u) === 'owner' && !isMondoAdmin(u));
  const now = Date.now();
  const out = await Promise.all(owners.map(async (u: any) => {
    const companyId = getCompanyId(u);
    const employees = users.filter((e: any) => getRole(e) === 'employee' && e.app_metadata?.companyId === companyId);
    const [clientsCount, workOrdersCount] = await Promise.all([
      countKeys(`c:${companyId}:clients:`),
      countKeys(`c:${companyId}:work-orders:`),
    ]);
    const createdAt = u.created_at || null;
    const billing = (await kv.get(`company:${companyId}:billing`)) || {};
    const trialEnds = billing.trialEndsAt ? new Date(billing.trialEndsAt) : createdAt ? new Date(new Date(createdAt).getTime() + TRIAL_DAYS * 86400000) : null;
    const trialDaysLeft = trialEnds ? Math.ceil((trialEnds.getTime() - now) / 86400000) : null;
    return {
      id: u.id,
      companyName: u.app_metadata?.companyName || u.user_metadata?.companyName || '',
      name: u.user_metadata?.name || '',
      email: u.email || '',
      phone: u.user_metadata?.phone || u.phone || '',
      createdAt,
      lastSignInAt: u.last_sign_in_at || null,
      trialEndsAt: trialEnds ? trialEnds.toISOString() : null,
      trialDaysLeft,
      paidUntil: billing.paidUntil || '',
      exempt: billing.exempt === true,
      employeesCount: employees.length,
      activeEmployeesCount: employees.filter((e: any) => !(e.banned_until && new Date(e.banned_until).getTime() > now)).length,
      clientsCount,
      workOrdersCount,
    };
  }));
  out.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return c.json(out);
});

// Pretplata servisera: Mondo admin upisuje do kada je plaćeno (prazno = samo probno razdoblje).
registerRoute(app, 'post', '/admin/servicers/:id/subscription', authMiddleware, mondoOnly, async (c: any) => {
  const id = cleanStr(c.req.param('id'), 80);
  const { data } = await adminClient().auth.admin.getUserById(id);
  if (!data?.user || getRole(data.user) !== 'owner') return c.json({ error: 'Serviser ne postoji.' }, 404);
  const body = await c.req.json().catch(() => ({}));
  const paidUntil = /^\d{4}-\d{2}-\d{2}$/.test(String(body.paidUntil || '')) ? String(body.paidUntil) : '';
  const companyId = getCompanyId(data.user);
  const key = `company:${companyId}:billing`;
  const prev = (await kv.get(key)) || {};
  const trialEndsAt = prev.trialEndsAt || new Date((Date.parse(data.user.created_at) || Date.now()) + TRIAL_DAYS * 86400000).toISOString();
  const billing = { ...prev, trialEndsAt, paidUntil, exempt: body.exempt === true ? true : body.exempt === false ? false : prev.exempt === true, updatedAt: new Date().toISOString() };
  await kv.set(key, billing);
  return c.json({ success: true, billing });
});

registerRoute(app, 'get', '/admin/members/:id', authMiddleware, mondoOnly, async (c: any) => {
  const id = cleanStr(c.req.param('id'), 80);
  const data = await loadMember(id);
  if (!data.profile) return c.json({ error: 'Član ne postoji.' }, 404);
  return c.json(data);
});

registerRoute(app, 'get', '/admin/visit-requests', authMiddleware, mondoOnly, async (c: any) => {
  return c.json((await kv.getByPrefix('admin:visit-requests:')).sort(byDateDesc));
});

const VISIT_STATUSES = ['new', 'scheduled', 'done', 'cancelled'];
registerRoute(app, 'post', '/admin/visit-requests/:id', authMiddleware, mondoOnly, async (c: any) => {
  const id = cleanStr(c.req.param('id'), 80);
  const body = await c.req.json().catch(() => ({}));
  const visit = await kv.get(`admin:visit-requests:${id}`);
  if (!visit) return c.json({ error: 'Zahtjev ne postoji.' }, 404);
  const updated = {
    ...visit,
    status: VISIT_STATUSES.includes(body.status) ? body.status : visit.status,
    scheduledFor: body.scheduledFor !== undefined ? cleanStr(body.scheduledFor, 40) : visit.scheduledFor,
    adminNote: body.adminNote !== undefined ? cleanStr(body.adminNote, 1000) : visit.adminNote,
    updatedAt: new Date().toISOString(),
  };
  await kv.set(`admin:visit-requests:${id}`, updated);
  await kv.set(`member:${visit.memberId}:visits:${id}`, updated);
  return c.json({ success: true, visit: updated });
});

const EQUIPMENT_CONDITIONS = ['ok', 'watch', 'replace'];
registerRoute(app, 'post', '/admin/members/:id/equipment', authMiddleware, mondoOnly, async (c: any) => {
  const memberId = cleanStr(c.req.param('id'), 80);
  if (!(await kv.get(`member:${memberId}:profile`))) return c.json({ error: 'Član ne postoji.' }, 404);
  const body = await c.req.json().catch(() => ({}));
  const type = cleanStr(body.type, 60);
  if (!type) return c.json({ error: 'Upišite vrstu opreme.' }, 400);
  const id = cleanStr(body.id, 80) || crypto.randomUUID();
  const prev = (await kv.get(`member:${memberId}:equipment:${id}`)) || {};
  const item = {
    id, memberId, type,
    brand: cleanStr(body.brand, 80),
    model: cleanStr(body.model, 120),
    year: cleanNum(body.year, 1950, 2100),
    condition: EQUIPMENT_CONDITIONS.includes(body.condition) ? body.condition : 'ok',
    power: cleanNum(body.power, 0, 500),
    powerUnit: body.powerUnit === 'HP' ? 'HP' : 'kW',
    capacity: cleanNum(body.capacity, 0, 5000),
    notes: cleanStr(body.notes, 1000),
    photos: Array.isArray(body.photos) ? body.photos.filter((s: any) => typeof s === 'string').slice(0, 6).map((s: string) => s.slice(0, 300)) : (prev.photos || []),
    inspectedAt: cleanStr(body.inspectedAt, 40) || new Date().toISOString().slice(0, 10),
    createdAt: prev.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await kv.set(`member:${memberId}:equipment:${id}`, item);
  return c.json({ success: true, equipment: item });
});

registerRoute(app, 'delete', '/admin/members/:id/equipment/:eqId', authMiddleware, mondoOnly, async (c: any) => {
  await kv.del(`member:${cleanStr(c.req.param('id'), 80)}:equipment:${cleanStr(c.req.param('eqId'), 80)}`);
  return c.json({ success: true });
});

// Mondo Care (godišnji paket): uključuje/isključuje Mondo admin nakon dogovora s kupcem.
registerRoute(app, 'post', '/admin/members/:id/plan', authMiddleware, mondoOnly, async (c: any) => {
  const memberId = cleanStr(c.req.param('id'), 80);
  const profile = await kv.get(`member:${memberId}:profile`);
  if (!profile) return c.json({ error: 'Član ne postoji.' }, 404);
  const body = await c.req.json().catch(() => ({}));
  const plan = body.plan === 'care' ? 'care' : 'free';
  let validUntil = '';
  if (plan === 'care') {
    const given = cleanStr(body.validUntil, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(given)) validUntil = given;
    else { const d = new Date(); d.setFullYear(d.getFullYear() + 1); validUntil = d.toISOString().slice(0, 10); }
  }
  const updated = {
    ...profile, plan, planValidUntil: validUntil,
    planSince: plan === 'care' ? (profile.plan === 'care' && profile.planSince ? profile.planSince : new Date().toISOString().slice(0, 10)) : '',
    updatedAt: new Date().toISOString(),
  };
  await kv.set(`member:${memberId}:profile`, updated);
  return c.json({ success: true, profile: withPlanStatus(updated) });
});

// Pregled opreme svih članova za ciljane ponude (najstarija i najlošija prva).
registerRoute(app, 'get', '/admin/equipment-report', authMiddleware, mondoOnly, async (c: any) => {
  const supabase = adminClient();
  const { data: rows, error } = await supabase.from('kv_store_381f82bd').select('key, value').like('key', 'member:%:equipment:%');
  if (error) return c.json({ error: error.message }, 500);
  const year = new Date().getFullYear();
  const profiles: Record<string, any> = {};
  const items = await Promise.all((rows || []).map(async (r: any) => {
    const e = r.value;
    if (!profiles[e.memberId]) profiles[e.memberId] = (await kv.get(`member:${e.memberId}:profile`)) || {};
    const p = profiles[e.memberId];
    return { ...e, age: e.year ? year - e.year : null, memberName: p.name || '', memberEmail: p.email || '', memberPhone: p.phone || '', memberCity: p.city || '' };
  }));
  const rank = (e: any) => (e.condition === 'replace' ? 2 : e.condition === 'watch' ? 1 : 0) * 100 + (e.age || 0);
  return c.json(items.sort((a, b) => rank(b) - rank(a)));
});

// ---------- Javna registracija: samo nova tvrtka (nositelj) ili klijent ----------
// Nitko se više ne može sam upisati u tuđu tvrtku. Djelatnike otvara nositelj preko /employees/create.

const signupHandler = async (c: any) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const name = String(body.name || '').trim();
    const companyName = String(body.companyName || '').trim();
    const appRole: AppRole = body.role === 'client' ? 'client' : body.role === 'member' ? 'member' : 'owner';

    if (!isEmail(email)) return c.json({ error: 'Neispravan e-mail.' }, 400);
    if (password.length < 8) return c.json({ error: 'Lozinka mora imati najmanje 8 znakova.' }, 400);
    if (!name) return c.json({ error: 'Upišite ime.' }, 400);
    if (appRole === 'member' && body.consent !== true) {
      return c.json({ error: 'Za registraciju je potrebna privola za spremanje podataka.' }, 400);
    }

    const supabase = adminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: appRole === 'owner' ? 'professional' : appRole, companyName },
    });
    if (error) {
      const exists = /already|registered|exists/i.test(error.message);
      return c.json({ error: exists ? 'Račun s tim e-mailom već postoji.' : error.message }, exists ? 409 : 400);
    }

    const newUser = data.user;
    const { error: updErr } = await supabase.auth.admin.updateUserById(newUser.id, {
      app_metadata: { role: appRole, companyId: newUser.id, companyName },
    });
    if (updErr) return c.json({ error: updErr.message }, 500);

    if (appRole === 'member') {
      const now = new Date().toISOString();
      await kv.set(`member:${newUser.id}:profile`, {
        id: newUser.id, email, name,
        phone: cleanStr(body.phone, 40), city: cleanStr(body.city, 80), address: cleanStr(body.address, 200),
        consentAt: now, createdAt: now,
      });
    }

    // Obavijest Mondo Acqui o novoj registraciji (greška u slanju ne ruši registraciju)
    try {
      const kind = appRole === 'member' ? 'NOVI VLASNIK BAZENA' : appRole === 'owner' ? 'NOVI SERVISER' : 'NOVA REGISTRACIJA';
      const city = cleanStr(body.city, 80);
      const phone = cleanStr(body.phone, 40);
      const subjectName = appRole === 'owner' && companyName ? `${companyName} – ${name}` : name;
      const row = (label: string, value: string) => value
        ? `<p style="margin: 6px 0;"><strong>${label}:</strong> ${escapeHtml(value)}</p>` : '';
      await resend.emails.send({
        from: 'Mondo Pool Care <orders@resend.dev>',
        to: [MONDO_ACQUA_EMAIL],
        subject: `${kind}: ${subjectName}${city ? ' – ' + city : ''}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: #002344;">${kind}</h2>
            ${row('Tvrtka', appRole === 'owner' ? companyName : '')}
            ${row('Ime', name)}
            ${row('E-mail', email)}
            ${row('Telefon', phone)}
            ${row('Mjesto', city)}
            ${row('Adresa', cleanStr(body.address, 200))}
            ${row('Registriran', new Date().toLocaleString('hr-HR', { timeZone: 'Europe/Zagreb' }))}
            <p style="color: #666; font-size: 13px;">Popis svih registracija je u Mondo admin panelu (${appRole === 'owner' ? 'kartica Serviseri' : 'kartica Vlasnici bazena'}).</p>
          </div>`,
      } as any);
    } catch (mailErr) {
      console.error('Signup notification email failed:', mailErr);
    }

    return c.json({ success: true, user: { id: newUser.id, email: newUser.email } });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};

app.post('/signup', signupHandler);
app.post(`${BASE_PATH}/signup`, signupHandler);
app.post(`${FUNCTIONS_PATH}/signup`, signupHandler);

app.all('*', (c) => c.json({
  error: 'Not Found',
  method: c.req.method,
  path: c.req.path,
  message: 'Tražena ruta ne postoji na serveru.',
}, 404));

Deno.serve(app.fetch);
