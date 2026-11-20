// Provjera cijena dobavljača: uspoređuje naš webshop s javnim cjenikom dobavljača i sprema izvještaj.
// Cijene se NE mijenjaju automatski – izvještaj samo pokazuje razlike, a promjenu potvrđuje Mondo Acqua.
import { getStore } from '@netlify/blobs';
import rows from '../functions/cjenik-data.json';

type Row = { naziv: string; sifra: string; marka: string; cijena: number | string; tip: string };
export type Razlika = { sifra: string; naziv: string; nasa: number; dobavljac: number; link: string };
export type Izvjestaj = {
  vrijeme: string;
  dobavljac: string;
  provjereno: number;
  razlike: Razlika[];
  nismoNasli: string[]; // naši proizvodi koje nismo našli kod dobavljača
  noviKodDobavljaca: { naziv: string; cijena: number; link: string }[];
  greska?: string;
};

const norm = (t: string) => t.toLowerCase().replace(/đ/g, 'd').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/(\d),(\d)/g, '$1.$2').replace(/[^a-z0-9.%]+/g, '');

// Ivero (WooCommerce): javni JSON s cijenama s PDV-om, u centima.
async function iveroCjenik() {
  const out: { naziv: string; cijena: number; link: string }[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`https://shop.ivero.hr/wp-json/wc/store/products?per_page=100&page=${page}`, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) { if (page > 1 && res.status === 400) break; throw new Error(`Ivero HTTP ${res.status}`); }
    const list = (await res.json()) as any[];
    if (!Array.isArray(list) || list.length === 0) break;
    for (const p of list) {
      const minor = Number(p?.prices?.currency_minor_unit ?? 2);
      const price = Number(p?.prices?.price) / 10 ** minor;
      if (p?.name && Number.isFinite(price) && price > 0) out.push({ naziv: String(p.name).replace(/&#8211;/g, '–').replace(/&amp;/g, '&'), cijena: price, link: String(p.permalink || '') });
    }
    if (list.length < 100) break;
  }
  return out;
}

export async function provjeriIvero(): Promise<Izvjestaj> {
  const vrijeme = new Date().toISOString();
  const nasi = (rows as Row[]).filter((r) => r.tip === 'proizvod' && r.marka === 'Ivero');
  const base: Izvjestaj = { vrijeme, dobavljac: 'Ivero (shop.ivero.hr)', provjereno: 0, razlike: [], nismoNasli: [], noviKodDobavljaca: [] };
  let njihovi: Awaited<ReturnType<typeof iveroCjenik>>;
  try { njihovi = await iveroCjenik(); } catch (e) { return { ...base, greska: String((e as Error).message || e) }; }
  const poNazivu = new Map(njihovi.map((p) => [norm(p.naziv), p]));
  const upareni = new Set<string>();
  for (const r of nasi) {
    const kljuc = norm(r.naziv.replace(' – ', ' '));
    const p = poNazivu.get(kljuc);
    if (!p) { base.nismoNasli.push(r.naziv); continue; }
    upareni.add(kljuc);
    base.provjereno++;
    const nasa = Number(r.cijena);
    if (Math.abs(nasa - p.cijena) >= 0.005) base.razlike.push({ sifra: r.sifra, naziv: r.naziv, nasa, dobavljac: p.cijena, link: p.link });
  }
  base.noviKodDobavljaca = njihovi.filter((p) => !upareni.has(norm(p.naziv)));
  return base;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const eur = (n: number) => n.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

export function izvjestajHtml(iz: Izvjestaj | null) {
  const head = `<!doctype html><html lang="hr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Provjera cijena dobavljača – Mondo Acqua</title><style>body{font:15px/1.5 system-ui,sans-serif;max-width:900px;margin:24px auto;padding:0 16px;color:#142538}table{border-collapse:collapse;width:100%;margin:8px 0 24px}td,th{border-bottom:1px solid #dde4ea;padding:6px 8px;text-align:left}td.n{text-align:right;white-space:nowrap}.up{color:#b42318}.down{color:#176a40}small{color:#5b6b7b}a.btn{display:inline-block;background:#0b679e;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none}</style></head><body><h1>Provjera cijena dobavljača</h1>`;
  if (!iz) return `${head}<p>Provjera još nije pokrenuta.</p><p><a class="btn" href="?pokreni=1">Pokreni provjeru sada</a></p></body></html>`;
  const kad = new Date(iz.vrijeme).toLocaleString('hr-HR', { timeZone: 'Europe/Zagreb' });
  let html = `${head}<p><b>${esc(iz.dobavljac)}</b> · provjereno ${kad}<br><small>Automatski svaki ponedjeljak ujutro. Cijene se ne mijenjaju same – razlike upišite u katalog pa objavite.</small></p><p><a class="btn" href="?pokreni=1">Pokreni provjeru sada</a></p>`;
  if (iz.greska) html += `<p class="up">Cjenik dobavljača nije dohvaćen: ${esc(iz.greska)}</p>`;
  html += `<h2>Razlike u cijeni (${iz.razlike.length})</h2>`;
  html += iz.razlike.length
    ? `<table><tr><th>Proizvod</th><th>Naša</th><th>Dobavljač</th><th>Razlika</th></tr>${iz.razlike.map((r) => `<tr><td><a href="${esc(r.link)}" target="_blank" rel="noopener">${esc(r.naziv)}</a><br><small>${esc(r.sifra)}</small></td><td class="n">${eur(r.nasa)}</td><td class="n">${eur(r.dobavljac)}</td><td class="n ${r.dobavljac > r.nasa ? 'up' : 'down'}">${r.dobavljac > r.nasa ? '+' : ''}${eur(r.dobavljac - r.nasa)}</td></tr>`).join('')}</table>`
    : `<p>Sve uparene cijene (${iz.provjereno}) jednake su cijenama dobavljača.</p>`;
  if (iz.nismoNasli.length) html += `<h2>Naši proizvodi koje nismo našli kod dobavljača (${iz.nismoNasli.length})</h2><p><small>Naziv se razlikuje ili ih dobavljač više ne nudi – provjerite ručno.</small></p><ul>${iz.nismoNasli.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`;
  if (iz.noviKodDobavljaca.length) html += `<h2>Proizvodi dobavljača kojih nema u našem webshopu (${iz.noviKodDobavljaca.length})</h2><table>${iz.noviKodDobavljaca.map((p) => `<tr><td><a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.naziv)}</a></td><td class="n">${eur(p.cijena)}</td></tr>`).join('')}</table>`;
  return html + `<p><small>Vagner Pool: automatska provjera bit će dodana kad dobijemo njihov cjenik u datoteci (XML/CSV) ili popis poveznica proizvoda.</small></p></body></html>`;
}

// Pokreće provjeru, sprema izvještaj i (ako je postavljen RESEND_API_KEY u Netlifyju) šalje e-mail s razlikama.
export async function pokreniProvjeru() {
  const iz = await provjeriIvero();
  const store = getStore('provjera-cijena');
  await store.setJSON('zadnja', iz);
  const key = process.env.RESEND_API_KEY;
  const to = process.env.PROVJERA_CIJENA_EMAIL || 'mondo.acquahr@gmail.com';
  if (key && (iz.razlike.length || iz.greska)) {
    const subject = iz.greska ? 'Provjera cijena: cjenik dobavljača nije dohvaćen' : `Provjera cijena: ${iz.razlike.length} razlika kod Ivera`;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.MAIL_FROM || 'Mondo Pool Care <orders@resend.dev>', to, subject, html: izvjestajHtml(iz) }),
    }).catch(() => {});
  }
  return iz;
}

export async function zadnjiIzvjestaj(): Promise<Izvjestaj | null> {
  return ((await getStore('provjera-cijena').get('zadnja', { type: 'json' })) as Izvjestaj | null) ?? null;
}
