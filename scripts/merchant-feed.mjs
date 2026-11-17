// Pure generator shared by Vite and its validation tests. Never invent product identifiers.
export const ORIGIN = 'https://poolcare.mondo-acqua.hr';
export const escapeXml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const title = p => `${p.name} – ${p.size}`;
const description = p => `${p.description || p.name}. Pakiranje / izvedba: ${p.size}. Kategorija: ${p.category}.`;
export const merchantImage = p => `${ORIGIN}/merchant-images/${encodeURIComponent(p.id)}.jpg`;
export const productUrl = p => `${ORIGIN}/proizvodi/${encodeURIComponent(p.id)}/`;
export function merchantAssets(products) {
  const seen = new Set();
  for (const p of products) {
    if (!/^[a-zA-Z0-9-]+$/.test(p.id) || seen.has(p.id)) throw new Error(`Invalid or duplicate product ID: ${p.id}`);
    seen.add(p.id);
    if (!(Number.isFinite(p.priceEUR) && p.priceEUR > 0) || !p.name || !p.size || !p.imageUrl?.startsWith('https://')) throw new Error(`Incomplete product: ${p.id}`);
  }
  const tag = (key, value) => `<g:${key}>${escapeXml(value)}</g:${key}>`;
  const items = products.map(p => `<item>${[
    ['id',p.id],['title',title(p)],['description',description(p)],['link',productUrl(p)],
    ['image_link',merchantImage(p)],['availability','in_stock'],['price',`${p.priceEUR.toFixed(2)} EUR`],
    ['condition','new'],['product_type',p.category],
  ].map(([k,v]) => tag(k,v)).join('')}</item>`).join('\n');
  const feed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>Mondo Acqua Pool Care</title><link>${ORIGIN}/?stranica=webshop</link><description>Proizvodi za bazene i spa – maloprodajne cijene s PDV-om.</description>\n${items}\n</channel></rss>\n`;
  return [{fileName:'_redirects', source: products.map(p => `/merchant-images/${p.id}.jpg /.netlify/images?url=${encodeURIComponent(p.imageUrl)}&fm=jpg&q=90 200`).join('\n') + '\n'}, {fileName:'google-products.xml',source:feed}, ...products.map(p => ({fileName:`proizvodi/${p.id}/index.html`,source:productPage(p)}))];
}
function productPage(p) {
  const e = escapeXml;
  const shop = `${ORIGIN}/?stranica=webshop&proizvod=${encodeURIComponent(p.id)}`;
  const data = {'@context':'https://schema.org','@type':'Product',name:title(p),description:description(p),image:[merchantImage(p)],sku:p.id,offers:{'@type':'Offer',url:productUrl(p),price:p.priceEUR.toFixed(2),priceCurrency:'EUR',availability:'https://schema.org/InStock',itemCondition:'https://schema.org/NewCondition',seller:{'@type':'Organization',name:'Mondo Acqua d.o.o.'}}};
  return `<!doctype html><html lang="hr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(title(p))} | Mondo Acqua</title><meta name="description" content="${e(description(p))}"><link rel="canonical" href="${e(productUrl(p))}"><script type="application/ld+json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script><style>*{box-sizing:border-box}body{margin:0;background:#f4f7fa;color:#142538;font:17px/1.6 system-ui,sans-serif}header,main,footer{max-width:1060px;margin:auto;padding:24px}header a{color:#142538;font-weight:750;text-decoration:none}main{display:grid;grid-template-columns:1fr 1fr;gap:48px;background:white;border-radius:20px;margin:20px auto;padding:40px}img{width:100%;height:420px;object-fit:contain}h1{font-size:30px;line-height:1.2}small{color:#516171}.price{font-size:32px;font-weight:750;margin-bottom:0}.stock{color:#176a40;font-weight:650}.button{display:inline-block;background:#0b679e;color:white;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:700}footer a{color:#0b679e}@media(max-width:700px){main{display:block;margin:12px;padding:24px}img{height:260px}h1{font-size:25px}}</style></head><body><header><a href="${e(ORIGIN)}/?stranica=webshop">MONDO ACQUA · POOL CARE</a></header><main><img src="${e(merchantImage(p))}" alt="${e(title(p))}"><article><small>${e(p.category)}</small><h1>${e(p.name)}</h1><p>${e(p.size)}</p><p>${e(description(p))}</p><p class="price">${e(p.priceEUR.toLocaleString('hr-HR',{minimumFractionDigits:2,maximumFractionDigits:2}))} €</p><small>Cijena s uključenim PDV-om.</small><p class="stock">Na zalihi</p><a class="button" href="${e(shop)}">Odaberi u webshopu</a><p><small>Košaricu, način naručivanja i uvjete kupnje provjerite u webshopu prije potvrde narudžbe.</small></p></article></main><footer>Mondo Acqua d.o.o. · <a href="mailto:info@mondo-acqua.hr">info@mondo-acqua.hr</a> · <a href="tel:+385952087321">+385 95 208 7321</a><br><a href="${e(ORIGIN)}/?stranica=webshop">Povratak u webshop</a></footer></body></html>`;
}
