// /cjenik.csv, /cjenik.xml – današnji cjenik; /cjenik/arhiva/ – popis; /cjenik/arhiva/YYYY-MM-DD.csv|xml – arhiva 30 dana.
import { getStore } from '@netlify/blobs';
import { csv, xml, snapshot } from '../lib/cjenik.mts';

const TYPES: Record<string, string> = { csv: 'text/csv; charset=utf-8', xml: 'application/xml; charset=utf-8' };

export default async (req: Request) => {
  const path = new URL(req.url).pathname.replace(/\/$/, '');
  let date = '';
  try { date = await snapshot(); } catch { date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Zagreb' }).format(new Date()); }
  if (path === '/cjenik.csv') return new Response(csv(date), { headers: { 'Content-Type': TYPES.csv, 'Cache-Control': 'public, max-age=600' } });
  if (path === '/cjenik.xml') return new Response(xml(date), { headers: { 'Content-Type': TYPES.xml, 'Cache-Control': 'public, max-age=600' } });
  const store = getStore('cjenik');
  if (path === '/cjenik/arhiva') {
    const { blobs } = await store.list();
    const keys = blobs.map((b) => b.key).sort().reverse();
    const li = keys.map((k) => `<li><a href="/cjenik/arhiva/${k}">${k}</a></li>`).join('');
    return new Response(`<!doctype html><meta charset="utf-8"><title>Arhiva cjenika – Mondo Acqua</title><h1>Arhiva cjenika (30 dana)</h1><ul>${li}</ul>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
  const m = path.match(/^\/cjenik\/arhiva\/(\d{4}-\d{2}-\d{2})\.(csv|xml)$/);
  if (m) {
    const body = await store.get(`${m[1]}.${m[2]}`);
    if (body) return new Response(body, { headers: { 'Content-Type': TYPES[m[2]] } });
  }
  return new Response('Nije pronađeno', { status: 404 });
};

export const config = { path: ['/cjenik.csv', '/cjenik.xml', '/cjenik/arhiva', '/cjenik/arhiva/*'] };
