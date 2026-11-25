// Glavni web (public/mondo-web/index.html) je jedna stranica koja naslov, opis i kanonsku adresu mijenja tek JavaScriptom.
// Ovdje se pri svakoj objavi za svaku podstranicu složi kopija s točnim <title>, opisom, canonicalom i og-oznakama
// već u HTML-u, i s otvorenim pravim dijelom stranice, da je Google odmah vidi kao zasebnu stranicu.
// Netlify (netlify.toml) svakoj adresi poslužuje njezinu kopiju: /bazeni/coral -> /mondo-web/stranice/coral.html.

const SITE = 'https://www.mondo-acqua.hr/';

const objLiteral = (html, name) => {
  const m = html.match(new RegExp(`const ${name} = (\\{[\\s\\S]*?\\});\\n`));
  if (!m) throw new Error(`mondo-web-pages: nema "const ${name}" u index.html`);
  return new Function(`return ${m[1]}`)();
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const swap = (html, re, value, what) => {
  if (typeof re === 'string' ? !html.includes(re) : !re.test(html)) throw new Error(`mondo-web-pages: nije pronađeno ${what}`);
  return html.replace(re, value);
};

export function mondoWebPages(indexHtml) {
  const SLUG = objLiteral(indexHtml, 'SLUG');
  const TITLES = objLiteral(indexHtml, 'TITLES');
  const DESC = objLiteral(indexHtml, 'DESC');
  const UPIT_DESC = 'Pošaljite upit za bazen ili održavanje: vrsta bazena, dimenzije i mjesto. Javljamo se s konkretnim sljedećim korakom.';
  const out = [];
  for (const [key, slug] of Object.entries(SLUG)) {
    if (key === 'pocetna') continue; // početna je sam index.html
    const isUpit = key === 'upit';
    const pageId = isUpit ? 'kontakt' : key;
    const title = isUpit ? 'Pošaljite upit – Mondo Acqua' : `${TITLES[key]} – Mondo Acqua`;
    const desc = isUpit ? UPIT_DESC : DESC[key];
    if (!TITLES[pageId] || !desc) throw new Error(`mondo-web-pages: nema naslova ili opisa za "${key}"`);
    const url = SITE + slug;
    let h = indexHtml;
    h = swap(h, /<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`, 'title');
    h = swap(h, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`, 'description');
    h = swap(h, /<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`, 'canonical');
    h = swap(h, /<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">\n<meta property="og:url" content="${url}">`, 'og:title');
    h = swap(h, /<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`, 'og:description');
    h = swap(h, `class="page" id="p-${pageId}"`, `class="page active" id="p-${pageId}"`, `dio stranice p-${pageId}`);
    out.push({ fileName: `mondo-web/stranice/${key}.html`, source: h });
  }
  return out;
}
