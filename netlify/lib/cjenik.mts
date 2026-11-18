// Javni cjenik u CSV i XML obliku + dnevna arhiva (30 dana) u Netlify Blobs.
import { getStore } from '@netlify/blobs';
import rows from '../functions/cjenik-data.json';

type Row = { tip: string; naziv: string; sifra: string; marka: string; jedinica: string; cijenaJedinica: number | ''; cijena: number; posebniOblik: string; sidrena: number; sidrenaDatum?: string; barkod: string; dostupnost: string };
const ROWS = rows as Row[];
const f = (n: number | '') => (n === '' ? '' : Number(n).toFixed(2));
export const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Zagreb' }).format(new Date()); // YYYY-MM-DD

const HEAD = ['tip', 'naziv', 'sifra', 'marka', 'jedinica_mjere', 'cijena_za_jedinicu_mjere_eur', 'maloprodajna_cijena_eur', 'posebni_oblik_prodaje', 'sidrena_cijena_eur', 'sidrena_cijena_datum', 'barkod', 'dostupnost', 'datum_cjenika'];
const csvCell = (v: string) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
export function csv(date: string) {
  const lines = ROWS.map((r) => [r.tip, r.naziv, r.sifra, r.marka, r.jedinica, f(r.cijenaJedinica), f(r.cijena), r.posebniOblik, f(r.sidrena), r.sidrenaDatum || '2026-09-10', r.barkod, r.dostupnost, date].map((v) => csvCell(String(v))).join(';'));
  return '﻿' + [HEAD.join(';'), ...lines].join('\r\n') + '\r\n';
}
const x = (v: string) => v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c] as string));
export function xml(date: string) {
  const items = ROWS.map((r) => `  <stavka tip="${r.tip}">\n    <naziv>${x(r.naziv)}</naziv>\n    <sifra>${x(r.sifra)}</sifra>\n    <marka>${x(r.marka)}</marka>\n    <jedinica_mjere>${x(r.jedinica)}</jedinica_mjere>\n    <cijena_za_jedinicu_mjere>${f(r.cijenaJedinica)}</cijena_za_jedinicu_mjere>\n    <maloprodajna_cijena>${f(r.cijena)}</maloprodajna_cijena>\n    <posebni_oblik_prodaje>${x(r.posebniOblik)}</posebni_oblik_prodaje>\n    <sidrena_cijena datum="${r.sidrenaDatum || '2026-09-10'}">${f(r.sidrena)}</sidrena_cijena>\n    <barkod>${x(r.barkod)}</barkod>\n    <dostupnost>${x(r.dostupnost)}</dostupnost>\n  </stavka>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<cjenik trgovac="Mondo Acqua d.o.o." adresa="Lučinići 17, 51216 Marinići" datum="${date}" valuta="EUR" pdv="uključen">\n${items}\n</cjenik>\n`;
}

// Spremi današnji cjenik (ako još nije) i obriši starije od 30 dana.
export async function snapshot() {
  const store = getStore('cjenik');
  const date = today();
  if (!(await store.get(`${date}.csv`))) {
    await store.set(`${date}.csv`, csv(date));
    await store.set(`${date}.xml`, xml(date));
  }
  const limit = new Date(Date.now() - 31 * 864e5).toISOString().slice(0, 10);
  const { blobs } = await store.list();
  await Promise.all(blobs.filter((b) => b.key.slice(0, 10) < limit).map((b) => store.delete(b.key)));
  return date;
}
