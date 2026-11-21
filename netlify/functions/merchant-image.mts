// Slike za Google Merchant Center: /merchant-images/<id>.jpg
// Lokalne kopije (vg-) poslužuju se statički (preferStatic). Za ostale (vh- Vagner, Ivero, spa) sliku dohvaćamo kod
// dobavljača i radimo JPEG 800×800 na bijeloj podlozi – Google od 31. 1. 2027. traži najmanje 500×500 px.
import sharp from 'sharp';
import { SHOP_PRODUCTS } from '../../src/app/lib/shopCatalog';
import { VAGNER_EQUIPMENT } from '../../src/app/lib/vagnerEquipment';

const SRC = new Map<string, string>();
for (const p of SHOP_PRODUCTS) { const u = p.sourceImageUrl || p.imageUrl; if (!p.id.startsWith('vg-') && u?.startsWith('http')) SRC.set(p.id, u); }
for (const p of VAGNER_EQUIPMENT) if (p.id.startsWith('vh-')) SRC.set(p.id, p.imageUrl);

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
  Accept: 'image/jpeg,image/png,image/webp,image/*;q=0.8',
};

async function fetchImage(src: string): Promise<Buffer | null> {
  // Vagner uz svaku AVIF sliku ima i JPG (ponekad PNG) istog imena – AVIF ovdje ne možemo dekodirati.
  const urls = /\.avif$/i.test(src) ? ['.jpg', '.png'].map((e) => src.replace(/\.avif$/i, '') + e) : [src];
  for (const u of urls) {
    try {
      const res = await fetch(encodeURI(decodeURI(u)), { headers: { ...HEADERS, Referer: new URL(u).origin + '/' } });
      if (res.ok) return Buffer.from(await res.arrayBuffer());
    } catch { /* sljedeći pokušaj */ }
  }
  return null;
}

export default async (req: Request) => {
  const file = new URL(req.url).pathname.split('/').pop() || '';
  const id = decodeURIComponent(file.replace(/\.jpg$/, ''));
  const src = SRC.get(id);
  if (!src) return new Response('Not found', { status: 404 });
  const buf = await fetchImage(src);
  if (!buf) return new Response('Image not available', { status: 502 });
  const jpg = await sharp(buf)
    .flatten({ background: '#ffffff' })
    .resize(800, 800, { fit: 'contain', background: '#ffffff' })
    .jpeg({ quality: 88 })
    .toBuffer();
  return new Response(jpg, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
      'Netlify-CDN-Cache-Control': 'public, durable, max-age=2592000',
    },
  });
};

export const config = { path: '/merchant-images/*', preferStatic: true };
