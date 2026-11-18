// Slike za Google Merchant Center za proizvode "vh-" (Vagner Pool).
// Vagnerove slike su AVIF i ne daju se Netlifyjevom CDN-u, pa ih ovdje dohvaćamo i pretvaramo u JPEG.
import sharp from 'sharp';
import { VAGNER_EQUIPMENT } from '../../src/app/lib/vagnerEquipment';

const SRC = new Map(VAGNER_EQUIPMENT.filter((p) => p.id.startsWith('vh-')).map((p) => [p.id, p.imageUrl]));

export default async (req: Request) => {
  const file = new URL(req.url).pathname.split('/').pop() || '';
  const id = decodeURIComponent(file.replace(/\.jpg$/, ''));
  const src = SRC.get(id);
  if (!src) return new Response('Not found', { status: 404 });
  const res = await fetch(encodeURI(src), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
      Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
      Referer: 'https://www.vagnerpool.hr/',
    },
  });
  if (!res.ok) return new Response(`Upstream ${res.status}`, { status: 502 });
  const jpg = await sharp(Buffer.from(await res.arrayBuffer()))
    .flatten({ background: '#ffffff' })
    .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
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

export const config = { path: '/merchant-images/vh-*', preferStatic: true };
