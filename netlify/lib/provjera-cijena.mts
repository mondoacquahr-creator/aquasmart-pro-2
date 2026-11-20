// Provjera cijena dobavljača: uspoređuje naš webshop s javnim cjenikom dobavljača i sprema izvještaj.
// Cijene se NE mijenjaju automatski – izvještaj samo pokazuje razlike, a promjenu potvrđuje Mondo Acqua.
import { getStore } from '@netlify/blobs';
import rows from '../functions/cjenik-data.json';

type Row = { naziv: string; sifra: string; marka: string; cijena: number | string; tip: string };
export type Razlika = { sifra: string; naziv: string; nasa: number; dobavljac: number; link: string };
export type Izvjestaj = {
  vrijeme: string;
  dobavljac: string;
  link?: string;
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

// Vagner Pool: javni XML feed (PRICE bez PDV-a, PRICE_VAT s PDV-om). Naša šifra = "vg-"/"vh-" + KOD.
async function vagnerCjenik() {
  const res = await fetch('https://www.vagnerpool.hr/feeds/roba.xml', { signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new Error(`Vagner HTTP ${res.status}`);
  const xml = await res.text();
  const out = new Map<string, { naziv: string; cijena: number; link: string; status: string }>();
  for (const m of xml.matchAll(/<SHOPITEM>([\s\S]*?)<\/SHOPITEM>/g)) {
    const g = (t: string) => (m[1].match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) || [])[1]?.trim() || '';
    const kod = g('KOD');
    const cijena = Math.round(Number(g('PRICE_VAT')) * 100) / 100;
    if (kod && Number.isFinite(cijena) && cijena > 0) out.set(kod, { naziv: g('PRODUCT'), cijena, link: g('URL'), status: g('DELIVERY_STATUS') });
  }
  if (out.size === 0) throw new Error('Vagner feed je prazan');
  return out;
}

export async function provjeriVagner(): Promise<Izvjestaj> {
  const vrijeme = new Date().toISOString();
  const base: Izvjestaj = { vrijeme, dobavljac: 'Vagner Pool (vagnerpool.hr)', link: 'https://www.vagnerpool.hr/feeds/roba.xml', provjereno: 0, razlike: [], nismoNasli: [], noviKodDobavljaca: [] };
  let feed: Awaited<ReturnType<typeof vagnerCjenik>>;
  try { feed = await vagnerCjenik(); } catch (e) { return { ...base, greska: String((e as Error).message || e) }; }
  for (const r of (rows as Row[]).filter((x) => x.tip === 'proizvod' && /^v[gh]-/.test(x.sifra))) {
    const p = feed.get(r.sifra.slice(3));
    if (!p) { base.nismoNasli.push(`${r.naziv} (${r.sifra.slice(3)})`); continue; }
    base.provjereno++;
    const nasa = Number(r.cijena);
    if (Math.abs(nasa - p.cijena) >= 0.02) base.razlike.push({ sifra: r.sifra, naziv: r.naziv, nasa, dobavljac: p.cijena, link: p.link });
  }
  return base; // Vagner ima tisuće artikala – popis "novih kod dobavljača" se ne prikazuje.
}

export async function provjeriIvero(): Promise<Izvjestaj> {
  const vrijeme = new Date().toISOString();
  const nasi = (rows as Row[]).filter((r) => r.tip === 'proizvod' && r.marka === 'Ivero');
  const base: Izvjestaj = { vrijeme, dobavljac: 'Ivero (shop.ivero.hr)', link: 'https://shop.ivero.hr/', provjereno: 0, razlike: [], nismoNasli: [], noviKodDobavljaca: [] };
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

function sekcija(iz: Izvjestaj) {
  let html = `<h2>${esc(iz.dobavljac)}</h2>`;
  if (iz.greska) return html + `<p class="up">Cjenik dobavljača nije dohvaćen: ${esc(iz.greska)}</p>`;
  html += `<h3>Razlike u cijeni (${iz.razlike.length})</h3>`;
  html += iz.razlike.length
    ? `<table><tr><th>Proizvod</th><th>Naša</th><th>Dobavljač</th><th>Razlika</th></tr>${iz.razlike.map((r) => `<tr><td><a href="${esc(r.link)}" target="_blank" rel="noopener">${esc(r.naziv)}</a><br><small>${esc(r.sifra)}</small></td><td class="n">${eur(r.nasa)}</td><td class="n">${eur(r.dobavljac)}</td><td class="n ${r.dobavljac > r.nasa ? 'up' : 'down'}">${r.dobavljac > r.nasa ? '+' : ''}${eur(r.dobavljac - r.nasa)}</td></tr>`).join('')}</table>`
    : `<p>Sve uparene cijene (${iz.provjereno}) jednake su cijenama dobavljača.</p>`;
  if (iz.nismoNasli.length) html += `<h3>Naši proizvodi koje nismo našli kod dobavljača (${iz.nismoNasli.length})</h3><p><small>Naziv ili šifra se razlikuje ili ih dobavljač više ne nudi – provjerite ručno.</small></p><ul>${iz.nismoNasli.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`;
  if (iz.noviKodDobavljaca.length) html += `<h3>Proizvodi dobavljača kojih nema u našem webshopu (${iz.noviKodDobavljaca.length})</h3><table>${iz.noviKodDobavljaca.map((p) => `<tr><td><a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.naziv)}</a></td><td class="n">${eur(p.cijena)}</td></tr>`).join('')}</table>`;
  return html;
}

export function izvjestajHtml(lista: Izvjestaj[] | null) {
  const head = `<!doctype html><html lang="hr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Provjera cijena dobavljača – Mondo Acqua</title><style>body{font:15px/1.5 system-ui,sans-serif;max-width:900px;margin:24px auto;padding:0 16px;color:#142538}h2{margin-top:32px;border-top:2px solid #dde4ea;padding-top:16px}table{border-collapse:collapse;width:100%;margin:8px 0 24px}td,th{border-bottom:1px solid #dde4ea;padding:6px 8px;text-align:left}td.n{text-align:right;white-space:nowrap}.up{color:#b42318}.down{color:#176a40}small{color:#5b6b7b}a.btn{display:inline-block;background:#0b679e;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none}</style></head><body><h1>Provjera cijena dobavljača</h1>`;
  if (!lista || !lista.length) return `${head}<p>Provjera još nije pokrenuta.</p><p><a class="btn" href="?pokreni=1">Pokreni provjeru sada</a></p></body></html>`;
  const kad = new Date(lista[0].vrijeme).toLocaleString('hr-HR', { timeZone: 'Europe/Zagreb' });
  const ukupno = lista.reduce((n, x) => n + x.razlike.length, 0);
  return `${head}<p>Provjereno ${kad} · <b>${ukupno} razlika</b><br><small>Automatski svaki ponedjeljak ujutro. Cijene se ne mijenjaju same – razlike upišite u katalog pa objavite.</small></p><p><a class="btn" href="?pokreni=1">Pokreni provjeru sada</a></p>${lista.map(sekcija).join('')}</body></html>`;
}

// Pokreće provjeru, sprema izvještaj i (ako je postavljen RESEND_API_KEY u Netlifyju) šalje e-mail s razlikama.
export async function pokreniProvjeru() {
  const lista = await Promise.all([provjeriIvero(), provjeriVagner()]);
  const store = getStore('provjera-cijena');
  await store.setJSON('zadnja', lista);
  const key = process.env.RESEND_API_KEY;
  const to = process.env.PROVJERA_CIJENA_EMAIL || 'mondo.acquahr@gmail.com';
  const razlika = lista.reduce((n, x) => n + x.razlike.length, 0);
  const greske = lista.filter((x) => x.greska).length;
  if (key && (razlika || greske)) {
    const subject = razlika ? `Provjera cijena: ${razlika} razlika kod dobavljača` : 'Provjera cijena: cjenik dobavljača nije dohvaćen';
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.MAIL_FROM || 'Mondo Pool Care <orders@resend.dev>', to, subject, html: izvjestajHtml(lista) }),
    }).catch(() => {});
  }
  return lista;
}

export async function zadnjiIzvjestaj(): Promise<Izvjestaj[] | null> {
  const v = (await getStore('provjera-cijena').get('zadnja', { type: 'json' })) as Izvjestaj[] | Izvjestaj | null;
  return v ? (Array.isArray(v) ? v : [v]) : null;
}
