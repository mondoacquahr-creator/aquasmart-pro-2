// Gradi podatke za javni cjenik (Odluka o objavi cjenika proizvoda i usluga, NN 101/26, 110/26).
// Izvori: webshop (SHOP_PRODUCTS) + bazeni i usluge s glavne stranice (public/mondo-web/index.html).
import fs from 'node:fs';

const BRANDS = ['Ivero', 'AstralPool', 'Astral', 'Badu', 'Zodiac', 'Fairland', 'WYBOT', 'Tornado', 'AVfol', 'Alkorplan', 'Lovibond',
  'eXact', 'PoolCheck', 'Blue Lagoon', 'Blue Connect', 'SeaMAID', 'Scrubby', 'Voltera', 'Rapid', 'NORM', 'GeoBubble', 'Revolution', 'EN-VIE'];
const brandOf = (p) => {
  if (!p.id.startsWith('vg-') && !p.id.startsWith('vh-')) return /astral|spa/i.test(p.name + p.category) ? 'AstralPool' : 'Ivero';
  const hit = BRANDS.find((b) => new RegExp(`\\b${b.replace('-', '\\-')}\\b`, 'i').test(p.name));
  return hit === 'Astral' ? 'AstralPool' : hit === 'Rapid' || hit === 'NORM' || hit === 'GeoBubble' || hit === 'EN-VIE' || hit === 'Revolution' ? 'Vagner Pool' : hit || 'Vagner Pool';
};
const num = (t) => Number(String(t).replace(/\./g, '').replace(',', '.'));
const unitOf = (p) => {
  const m = p.size.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|l|L|ml)\b/);
  if (m) {
    let q = Number(m[1].replace(',', '.')); let u = m[2].toLowerCase();
    if (u === 'g') { q /= 1000; u = 'kg'; } if (u === 'ml') { q /= 1000; u = 'l'; }
    return { unit: u === 'l' ? 'l' : 'kg', perUnit: Math.round((p.priceEUR / q) * 100) / 100 };
  }
  if (/po metru/.test(p.size)) return { unit: 'm', perUnit: p.priceEUR };
  return { unit: 'kom', perUnit: '' };
};

export function buildCjenikRows(shopProducts, mainHtmlPath) {
  const rows = shopProducts.map((p) => {
    const u = unitOf(p);
    return { tip: 'proizvod', naziv: `${p.name} – ${p.size}`, sifra: p.id, marka: brandOf(p), jedinica: u.unit,
      cijenaJedinica: u.perUnit, cijena: p.priceEUR, posebniOblik: '', sidrena: p.anchorEUR ?? p.priceEUR, sidrenaDatum: p.anchorDate || '2026-09-10', barkod: '', dostupnost: 'dostupno' };
  });
  const html = fs.readFileSync(mainHtmlPath, 'utf8');
  const arr = (name) => { const m = html.match(new RegExp(`const ${name} = (\\[.*?\\]);\\n`)); return m ? Function(`return ${m[1]}`)() : []; };
  for (const [name, label] of [['FP_RECT', 'Montažni FP bazen pravokutni'], ['FP_OVAL', 'Montažni FP bazen ovalni']])
    for (const r of arr(name)) rows.push({ tip: 'proizvod', naziv: `${label} ${r[0]} m s opremom, montažom i materijalom`, sifra: `${name.toLowerCase()}-${r[0].replace(/[^\d]/g, '')}`,
      marka: 'Mondo Acqua', jedinica: 'kom', cijenaJedinica: '', cijena: num(r[3]), posebniOblik: '', sidrena: num(r[5] || r[3]), barkod: '', dostupnost: 'po narudžbi' });
  for (const [name, label] of [['CORAL', 'Kompozitni bazen CORAL'], ['COMPACT', 'Keramički bazen COMPACT']])
    for (const m of arr(name)) rows.push({ tip: 'proizvod', naziv: `${label} ${m[1]} ${m[2]} m`, sifra: `${name.toLowerCase()}-${m[0]}`,
      marka: name, jedinica: 'kom', cijenaJedinica: '', cijena: num(m[3]), posebniOblik: '', sidrena: num(m[5] || m[3]), barkod: '', dostupnost: 'po narudžbi' });
  for (const [, s, j, n, c] of html.matchAll(/<li data-usluga="([^"]+)" data-jedinica="([^"]+)"><span>([^<]+)<\/span><strong>od ([\d.]+) €/g)) rows.push({ tip: 'usluga', naziv: `${n} (početna cijena)`, sifra: s, marka: 'Mondo Acqua', jedinica: j, cijenaJedinica: num(c), cijena: num(c), posebniOblik: '', sidrena: num(c), barkod: '', dostupnost: 'dostupno' });
  rows.push({ tip: 'usluga', naziv: 'Mondo Care – godišnji paket održavanja', sifra: 'mondo-care', marka: 'Mondo Acqua', jedinica: 'godina', cijenaJedinica: 199, cijena: 199, posebniOblik: '', sidrena: 199, barkod: '', dostupnost: 'dostupno' });
  rows.push({ tip: 'usluga', naziv: 'Dostava narudžbe iz webshopa (Hrvatska)', sifra: 'dostava', marka: 'Mondo Acqua', jedinica: 'narudžba', cijenaJedinica: 10, cijena: 10, posebniOblik: '', sidrena: 10, barkod: '', dostupnost: 'dostupno' });
  return rows;
}
