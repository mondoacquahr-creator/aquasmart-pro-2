// /provjera-cijena – zadnji izvještaj; /provjera-cijena?pokreni=1 – nova provjera (najviše jednom u 10 minuta).
import { izvjestajHtml, pokreniProvjeru, zadnjiIzvjestaj } from '../lib/provjera-cijena.mts';

export default async (req: Request) => {
  const url = new URL(req.url);
  let iz = await zadnjiIzvjestaj();
  if (url.searchParams.get('pokreni') === '1') {
    const staro = iz?.length ? Date.now() - new Date(iz[0].vrijeme).getTime() : Infinity;
    if (staro > 10 * 60 * 1000) iz = await pokreniProvjeru();
    return Response.redirect(`${url.origin}/provjera-cijena`, 303);
  }
  return new Response(izvjestajHtml(iz), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
};

export const config = { path: '/provjera-cijena' };
