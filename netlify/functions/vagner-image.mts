// Slike za Google Merchant Center za proizvode "vh-" (Vagner Pool), "aq-" (Aquachem) i "spa-" (Astral Spa).
// Vagnerove slike su AVIF i ne daju se Netlifyjevom CDN-u, pa ih ovdje dohvaćamo i pretvaramo u JPEG.
// Google od 31. 1. 2027. traži najmanje 500 × 500 px, pa svaku sliku smještamo na bijelo platno 1000 × 1000.
import sharp from 'sharp';
import { VAGNER_EQUIPMENT } from '../../src/app/lib/vagnerEquipment';
import { SPA_PRODUCTS } from '../../src/app/lib/spaProducts';

const SRC = new Map([...VAGNER_EQUIPMENT, ...SPA_PRODUCTS].filter((p) => /^(vh|aq|spa)-/.test(p.id)).map((p) => [p.id, p.imageUrl]));

export default async (req: Request) => {
  const file = new URL(req.url).pathname.split('/').pop() || '';
  const id = decodeURIComponent(file.replace(/\.jpg$/, ''));
  const src = SRC.get(id);
  if (!src) return new Response('Not found', { status: 404 });
  // Vagner uz svaku AVIF sliku ima i JPG (ponekad PNG) istog imena – AVIF ovdje ne možemo dekodirati.
  // Ostali izvori (Aquachem, AstralPool) daju JPG/PNG/WebP pa se dohvaćaju izravno.
  const isAvif = /\.avif$/i.test(src);
  const base = src.replace(/\.avif$/i, '');
  let buf: Buffer | null = null;
  for (const ext of isAvif ? ['.jpg', '.png'] : ['']) {
    const res = await fetch(encodeURI(base + ext), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
        Accept: 'image/jpeg,image/png,image/*;q=0.8',
        Referer: 'https://www.vagnerpool.hr/',
      },
    });
    if (res.ok) { buf = Buffer.from(await res.arrayBuffer()); break; }
  }
  if (!buf) return new Response('Image not available', { status: 502 });
  const img = sharp(buf);
  const jpg = await img
    .flatten({ background: '#ffffff' })
    .resize(900, 900, { fit: 'contain', background: '#ffffff' })
    .extend({ top: 50, bottom: 50, left: 50, right: 50, background: '#ffffff' })
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

export const config = { path: ['/merchant-images/vh-*', '/merchant-images/aq-*', '/merchant-images/spa-*'] };
