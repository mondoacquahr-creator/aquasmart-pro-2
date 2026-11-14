// Izvlači cijene iz webshopa (iste brojke koje webshop prikazuje) i upisuje ih u znanje AI asistenta.
// Pokretanje iz korijena projekta: node scripts/asistent-cijene.mjs
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';

const out = await build({
  stdin: {
    contents: "export { IVERO_PRICES } from './src/app/lib/productPrices'; export { VAGNER_EQUIPMENT } from './src/app/lib/vagnerEquipment';",
    resolveDir: process.cwd(), loader: 'ts',
  },
  bundle: true, write: false, format: 'esm', platform: 'node',
});
const mod = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));

const kat = (id) => {   // isto kao deriveCategory u src/app/lib/mondoShop.ts
  if (id.startsWith('ph-') || id.startsWith('solna-')) return 'pH regulacija';
  if (/^(chlor-|multitabs|stabilizer|salt-)/.test(id)) return 'Dezinfekcija';
  if (id.startsWith('algaecide')) return 'Alge';
  if (id.startsWith('flocculant')) return 'Bistrenje';
  if (/^(winter|ivekor)/.test(id)) return 'Održavanje';
  if (/^(pooltester|dpd|phenol)/.test(id)) return 'Testiranje';
  return 'Ostalo';
};
const eur = (n) => n.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const rows = [
  ...Object.values(mod.IVERO_PRICES).map((p) => ({ k: 'Kemija – ' + kat(p.id), n: p.name, s: p.size, c: p.priceEUR })),
  ...mod.VAGNER_EQUIPMENT.map((p) => ({ k: 'Oprema – ' + p.category, n: p.name, s: p.size, c: p.priceEUR })),
];
const groups = new Map();
for (const r of rows) { if (!groups.has(r.k)) groups.set(r.k, []); groups.get(r.k).push(r); }
const dan = new Date().toLocaleDateString('hr-HR');
let txt = `### WEBSHOP CIJENE (Mondo Pool Care webshop, redovne cijene s PDV-om, stanje ${dan})
Popusti za registrirane vlasnike i članove Mondo Care obračunavaju se u košarici. Za opremu Mondo Acqua potvrđuje dostupnost i rok isporuke nakon narudžbe.`;
for (const [k, list] of groups) {
  txt += `\n\n[${k}]`;
  for (const r of list.sort((a, b) => a.n.localeCompare(b.n, 'hr') || a.c - b.c)) txt += `\n${r.n} (${r.s}): ${eur(r.c)}`;
}
const file = 'public/mondo-web/znanje.txt';
const cur = readFileSync(file, 'utf8');
const base = cur.split('\n\n### WEBSHOP CIJENE')[0].replace(/\s+$/, '');
const [page, approved] = base.split('\n\n### ODOBRENI ODGOVORI VLASNIKA');
const next = page + '\n\n' + txt + (approved !== undefined ? '\n\n### ODOBRENI ODGOVORI VLASNIKA' + approved : '') + '\n';
writeFileSync(file, next);
console.log(`Upisano ${rows.length} artikala u ${groups.size} skupina; znanje ima ${next.length} znakova.`);
