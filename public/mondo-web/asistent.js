/* Mondo asistent – AI asistent za www.mondo-acqua.hr (probna verzija).
   Jedna datoteka: stilovi, robotić i prozor za razgovor. Razgovor se sprema na poslužitelju (vidi Privatnost). */
(() => {
  if (window.__mondoAsistent) return; window.__mondoAsistent = true;

  const API = 'https://sryuogkaebeznmadchcr.supabase.co/functions/v1/mondo-asistent/chat';
  const INQUIRY = 'https://sryuogkaebeznmadchcr.supabase.co/functions/v1/aquasmart-viz/visualize/inquiry';
  const TEL = '+385952087321', TEL_TXT = '+385 95 208 7321';
  const POOLCARE = 'https://poolcare.mondo-acqua.hr/?stranica=';
  const anon = () => { try { return ANON; } catch { return ''; } };            // ključ koji stranica već koristi
  const goPage = (k, path) => { try { go(k); } catch { location.href = (window.MW_BASE || '/') + path; } };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ss = { get: k => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} } };

  const ROBOT = `<svg class="ma-bot" viewBox="0 0 200 200" aria-hidden="true">
  <g class="ma-arm"><path d="M150 152q22-4 30-26" fill="none" stroke="#cfe9f5" stroke-width="10" stroke-linecap="round"/><circle cx="181" cy="122" r="10" fill="#4FC3F0"/></g>
  <path d="M50 152q-20 6-26 22" fill="none" stroke="#cfe9f5" stroke-width="10" stroke-linecap="round"/><circle cx="23" cy="176" r="10" fill="#4FC3F0"/>
  <rect x="70" y="138" width="60" height="44" rx="18" fill="#4FC3F0"/><circle cx="100" cy="162" r="7" fill="#f4fafd"/>
  <path d="M100 6c9 12 14 19 14 25a14 14 0 0 1-28 0c0-6 5-13 14-25z" fill="#4FC3F0"/><rect x="96" y="42" width="8" height="12" rx="4" fill="#cfe9f5"/>
  <rect x="26" y="78" width="16" height="34" rx="8" fill="#4FC3F0"/><rect x="158" y="78" width="16" height="34" rx="8" fill="#4FC3F0"/>
  <rect x="38" y="50" width="124" height="92" rx="40" fill="#f4fafd"/>
  <rect x="56" y="70" width="88" height="48" rx="24" fill="#06202A"/>
  <g class="ma-look"><circle class="ma-eye" cx="82" cy="94" r="10" fill="#4FC3F0"/><circle class="ma-eye" cx="118" cy="94" r="10" fill="#4FC3F0"/></g>
</svg>`;

  const CSS = `
.ma-root{--ma-aqua:#4FC3F0;--ma-ink:#06202A;font-family:Inter,system-ui,sans-serif}
.ma-root *{box-sizing:border-box}
.ma-bot{display:block;width:100%;height:100%;overflow:visible}
.ma-eye,.ma-arm,.ma-look{transform-box:fill-box}
.ma-eye{transform-origin:center;animation:ma-blink 5.2s infinite}
.ma-arm{transform-origin:10% 90%}
.ma-wave .ma-arm{animation:ma-wave 1.6s ease-in-out 1}
.ma-think .ma-look{animation:ma-think 1.2s ease-in-out infinite}
@keyframes ma-blink{0%,46%,50%,100%{transform:scaleY(1)}48%{transform:scaleY(.1)}}
@keyframes ma-wave{0%,100%{transform:rotate(0)}15%{transform:rotate(-34deg)}30%{transform:rotate(-8deg)}45%{transform:rotate(-34deg)}60%{transform:rotate(-8deg)}75%{transform:rotate(-30deg)}}
@keyframes ma-think{0%,100%{transform:translate(-5px,-6px)}50%{transform:translate(5px,-6px)}}
@keyframes ma-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes ma-in{from{transform:translateX(140px);opacity:0}to{transform:none;opacity:1}}
@keyframes ma-pop{from{transform:scale(.6);opacity:0}to{transform:none;opacity:1}}
@keyframes ma-dot{0%,60%,100%{transform:none;opacity:.45}30%{transform:translateY(-5px);opacity:1}}

.ma-launch{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(22px + env(safe-area-inset-bottom,0px));z-index:80;display:flex;align-items:center;gap:10px;padding:7px 18px 7px 7px;border-radius:999px;background:#0b2a3a;border:1px solid rgba(120,220,255,.3);box-shadow:0 14px 34px rgba(0,0,0,.45);color:#fff;font:600 15px/1 Inter,system-ui,sans-serif;cursor:pointer;animation:ma-in .7s cubic-bezier(.2,.8,.2,1) both;transition:padding .25s,gap .25s}
.ma-launch:focus-visible,.ma-x:focus-visible,.ma-chips button:focus-visible,.ma-send:focus-visible{outline:3px solid #fff;outline-offset:2px}
.ma-launch .ma-av{width:50px;height:50px;border-radius:50%;background:#103a4f;display:grid;place-items:center;flex:none}
.ma-launch .ma-av>span{display:block;width:40px;height:40px;animation:ma-bob 3.4s ease-in-out infinite}
.ma-launch .ma-lbl{white-space:nowrap;overflow:hidden;max-width:160px;transition:max-width .25s,opacity .2s}
.ma-launch.ma-small{padding:7px;gap:0}
.ma-launch.ma-small .ma-lbl{max-width:0;opacity:0}
.ma-hi{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(92px + env(safe-area-inset-bottom,0px));z-index:80;max-width:240px;background:#fff;color:#06202A;font:600 15px/1.35 Inter,system-ui,sans-serif;padding:12px 16px;border-radius:18px 18px 4px 18px;box-shadow:0 12px 30px rgba(0,0,0,.4);cursor:pointer;animation:ma-pop .3s cubic-bezier(.2,1.2,.3,1) both;transform-origin:100% 100%}
@media (max-width:760px){.ma-launch{bottom:calc(80px + env(safe-area-inset-bottom,0px))}.ma-hi{bottom:calc(150px + env(safe-area-inset-bottom,0px))}.ma-on-page .totop{bottom:calc(150px + env(safe-area-inset-bottom,0px))}}
@media (min-width:761px){.ma-on-page .totop{bottom:calc(96px + env(safe-area-inset-bottom,0px))}}
@media (min-width:761px){.ma-nl .ma-launch{bottom:66px}.ma-nl .ma-hi{bottom:136px}.ma-nl.ma-on-page .totop{bottom:140px}}

.ma-dim{position:fixed;inset:0;background:rgba(2,10,16,.55);z-index:99}
.ma-panel{position:fixed;z-index:100;left:0;right:0;bottom:0;height:min(86dvh,720px);background:#071f2b;border:1px solid rgba(120,220,255,.16);border-bottom:0;border-radius:26px 26px 0 0;box-shadow:0 -20px 60px rgba(0,0,0,.5);display:flex;flex-direction:column;color:#fff;overflow:hidden;animation:ma-up .28s cubic-bezier(.2,.8,.2,1) both}
@keyframes ma-up{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}
.ma-head{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid rgba(120,220,255,.12);flex:none}
.ma-head .ma-av{width:48px;height:48px;border-radius:50%;background:#103a4f;display:grid;place-items:center;flex:none}
.ma-head .ma-av>span{display:block;width:38px;height:38px}
.ma-head b{display:block;font:700 17px/1.2 Montserrat,Inter,sans-serif;letter-spacing:-.01em}
.ma-head small{display:block;font-size:13px;color:#8fb6c6;margin-top:3px}
.ma-x{margin-left:auto;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:none;color:#cfe3ec;font-size:18px;cursor:pointer;flex:none}
.ma-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:16px 14px 8px;display:flex;flex-direction:column;gap:10px}
.ma-m{max-width:88%;padding:11px 14px;border-radius:18px;font-size:15px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.ma-m.b{align-self:flex-start;background:rgba(255,255,255,.07);border-bottom-left-radius:6px}
.ma-m.u{align-self:flex-end;background:var(--ma-aqua);color:var(--ma-ink);font-weight:500;border-bottom-right-radius:6px}
.ma-typing{display:inline-flex;gap:6px;padding:4px 2px}
.ma-typing i{width:8px;height:8px;border-radius:50%;background:#9fd9f0;animation:ma-dot 1.1s infinite}
.ma-typing i:nth-child(2){animation-delay:.15s}.ma-typing i:nth-child(3){animation-delay:.3s}
.ma-chips{display:flex;flex-wrap:wrap;gap:8px;align-self:flex-start;max-width:100%}
.ma-chips button,.ma-chips a{font:600 14px/1 Inter,system-ui,sans-serif;padding:11px 15px;border-radius:999px;border:1px solid rgba(79,195,240,.55);background:none;color:#9fe0fa;cursor:pointer;text-decoration:none}
.ma-chips .p{background:var(--ma-aqua);color:var(--ma-ink);border-color:var(--ma-aqua)}
.ma-form{align-self:stretch;display:grid;gap:8px;padding:12px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(120,220,255,.14)}
.ma-form label{font-size:13px;color:#a9c9d6;display:grid;gap:5px}
.ma-form input{font:500 16px/1.2 Inter,system-ui,sans-serif;padding:12px 13px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(4,24,32,.6);color:#fff;width:100%}
.ma-form input:focus{outline:2px solid var(--ma-aqua);outline-offset:1px}
.ma-form button{font:700 15px/1 Inter,system-ui,sans-serif;padding:14px;border-radius:999px;border:0;background:var(--ma-aqua);color:var(--ma-ink);cursor:pointer}
.ma-form button[disabled]{opacity:.6}
.ma-form p{margin:0;font-size:12.5px;line-height:1.45;color:#8fb6c6}
.ma-form p.err{color:#ffb4a8}
.ma-form a{color:#9fe0fa}
.ma-in{display:flex;gap:10px;align-items:flex-end;padding:10px 12px 8px;border-top:1px solid rgba(120,220,255,.12);flex:none}
.ma-in textarea{flex:1;resize:none;min-height:0;height:48px;max-height:110px;margin:0;width:auto;font:500 16px/1.4 Inter,system-ui,sans-serif;padding:12px 16px;border-radius:22px;border:1px solid transparent;background:rgba(255,255,255,.07);color:#fff}
.ma-in textarea::placeholder{color:#8fb6c6}
.ma-in textarea:focus{outline:none;border-color:rgba(79,195,240,.7)}
.ma-send{width:46px;height:46px;border-radius:50%;border:0;background:var(--ma-aqua);display:grid;place-items:center;cursor:pointer;flex:none}
.ma-send[disabled]{opacity:.5}
.ma-note{font-size:12px;color:#7fa3b3;text-align:center;padding:0 16px calc(10px + env(safe-area-inset-bottom,0px));flex:none}
@media (min-width:761px){.ma-dim{display:none}.ma-panel{left:auto;right:24px;bottom:24px;width:400px;height:min(640px,calc(100dvh - 48px));border-radius:24px;border-bottom:1px solid rgba(120,220,255,.16)}}
@media (prefers-reduced-motion:reduce){.ma-root *,.ma-launch,.ma-hi,.ma-panel{animation:none!important;transition:none!important}}
`;

  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const style = el('style'); style.textContent = CSS; document.head.appendChild(style);
  document.documentElement.classList.add('ma-on-page');
  const root = el('div', 'ma-root'); document.body.appendChild(root);
  // Netlify u donji desni kut zna ubaciti svoju oznaku; ako je tu, gumb se pomakne iznad nje.
  [800, 2500, 6000].forEach(ms => setTimeout(() => { if (document.getElementById('nl-badge-frame')) document.documentElement.classList.add('ma-nl'); }, ms));

  // ---------- gumb s robotićem ----------
  const launch = el('button', 'ma-launch', `<span class="ma-av"><span>${ROBOT}</span></span><span class="ma-lbl">Pitajte asistenta</span>`);
  launch.type = 'button'; launch.setAttribute('aria-label', 'Otvorite razgovor s AI asistentom');
  root.appendChild(launch);
  let hi = null, opened = false;
  const wave = () => { launch.classList.remove('ma-wave'); void launch.offsetWidth; launch.classList.add('ma-wave'); };
  const closeHi = () => { if (hi) { hi.remove(); hi = null; } };
  const sayHi = (text, key) => {
    if (opened || panel || ss.get(key)) return; ss.set(key, '1');
    closeHi(); hi = el('div', 'ma-hi'); hi.textContent = text; hi.onclick = () => open(); root.appendChild(hi);
    if (!reduce) wave();
    setTimeout(closeHi, 7000);
  };
  setTimeout(() => sayHi('Bok! Trebate pomoć oko bazena?', 'ma-hi'), 6000);
  addEventListener('scroll', () => launch.classList.toggle('ma-small', scrollY > 300), { passive: true });
  // jedan poticaj po dijelu stranice, samo dok razgovor nije otvoren
  const NUDGE = { '/bazeni': 'Ne znate koji bazen odabrati?', '/odrzavanje': 'Problem s vodom? Pitajte me.' };
  let lastPath = location.pathname;
  setInterval(() => {
    if (location.pathname === lastPath) return; lastPath = location.pathname;
    const k = Object.keys(NUDGE).find(p => lastPath.replace(/\/$/, '').endsWith(p));
    if (k) setTimeout(() => sayHi(NUDGE[k], 'ma-n' + k), 2500);
  }, 1000);

  // ---------- prozor za razgovor ----------
  let panel = null, dim = null, body = null, input = null, sendBtn = null, headAv = null, busy = false;
  const history = [];   // {role:'user'|'assistant', text}
  const sid = Array.from(crypto.getRandomValues(new Uint8Array(12)), b => (b % 36).toString(36)).join('');   // oznaka razgovora, ne osobe
  const SEND_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06202A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const scrollDown = () => { body.scrollTop = body.scrollHeight; };
  const addMsg = (who, text) => { const m = el('div', 'ma-m ' + who); m.textContent = text; body.appendChild(m); scrollDown(); return m; };

  const ACT = {
    ponuda:       ['Zatražite ponudu', () => showForm(), true],
    nazovi:       ['Nazovite', 'tel:' + TEL],
    whatsapp:     ['WhatsApp', 'https://wa.me/' + TEL.replace('+', '')],
    usporedba:    ['Usporedite bazene', () => { close(); goPage('bazeni', 'bazeni'); }],
    kljuc:        ['Ključ u ruke', () => { close(); goPage('kljuc-u-ruke', 'kljuc-u-ruke'); }],
    odrzavanje:   ['Održavanje', () => { close(); goPage('odrzavanje', 'odrzavanje'); }],
    analiza:      ['Pokrenite analizu vode', POOLCARE + 'analiza'],
    vizualizator: ['AI vizualizator', POOLCARE + 'vizualizator'],
    webshop:      ['Otvorite webshop', POOLCARE + 'webshop'],
  };
  const addActions = keys => {
    const list = (keys || []).filter(k => ACT[k]); if (!list.length) return;
    const row = el('div', 'ma-chips');
    list.forEach(k => {
      const [label, target, primary] = ACT[k];
      let b;
      if (typeof target === 'string') { b = el('a'); b.href = target; if (target.startsWith('http')) { b.target = '_blank'; b.rel = 'noopener'; } }
      else { b = el('button'); b.type = 'button'; b.onclick = target; }
      b.textContent = label; if (primary) b.className = 'p';
      row.appendChild(b);
    });
    body.appendChild(row); scrollDown();
  };

  const START = ['Koji bazen odabrati?', 'Koliko traje gradnja?', 'Voda mi je zelena', 'Trebam ponudu'];
  const greet = () => {
    addMsg('b', 'Bok! Ja sam Mondo asistent. Pitajte me o bazenima, gradnji ili održavanju vode.');
    const row = el('div', 'ma-chips');
    START.forEach(q => { const b = el('button'); b.type = 'button'; b.textContent = q; b.onclick = () => { row.remove(); q === 'Trebam ponudu' ? (addMsg('u', q), showForm()) : ask(q); }; row.appendChild(b); });
    body.appendChild(row);
  };

  async function ask(text) {
    text = String(text || '').trim().slice(0, 600);
    if (!text || busy) return;
    busy = true; sendBtn.disabled = true;
    addMsg('u', text); history.push({ role: 'user', text });
    const wait = el('div', 'ma-m b', '<span class="ma-typing"><i></i><i></i><i></i></span>'); body.appendChild(wait); scrollDown();
    headAv.classList.add('ma-think');
    let out;
    try {
      const r = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + anon(), apikey: anon() },
        body: JSON.stringify({ messages: history.slice(-12), page: location.pathname, sid }),
      });
      out = await r.json();
      if (!out || !out.answer) throw new Error('bez odgovora');
    } catch {
      out = { answer: 'Trenutno ne mogu odgovoriti. Nazovite nas na ' + TEL_TXT + ' ili pošaljite poruku na WhatsApp.', actions: ['nazovi', 'whatsapp', 'ponuda'], failed: true };
    }
    wait.remove(); headAv.classList.remove('ma-think');
    addMsg('b', out.answer);
    if (!out.failed) history.push({ role: 'assistant', text: out.answer });
    addActions(out.actions);
    busy = false; sendBtn.disabled = false;
    if (matchMedia('(min-width:761px)').matches) input.focus();
  }

  function showForm() {
    if (body.querySelector('.ma-form')) { body.querySelector('.ma-form input').focus(); return; }
    addMsg('b', 'Ostavite kontakt i naš tim javlja se s konkretnim sljedećim korakom.');
    const f = el('form', 'ma-form', `
      <label>Ime i prezime<input name="name" autocomplete="name" required maxlength="120"></label>
      <label>Telefon ili e-pošta<input name="contact" autocomplete="tel" required maxlength="120"></label>
      <label>Mjesto gradnje ili bazena<input name="loc" autocomplete="address-level2" maxlength="120"></label>
      <button type="submit">Pošaljite upit</button>
      <p class="ma-fmsg">Podatke koristimo samo za odgovor na vaš upit. <a href="#privatnost" class="ma-priv">Privatnost</a></p>`);
    f.querySelector('.ma-priv').onclick = e => { e.preventDefault(); close(); goPage('privatnost', 'privatnost'); };
    f.onsubmit = async e => {
      e.preventDefault();
      const msg = f.querySelector('.ma-fmsg'), btn = f.querySelector('button');
      const name = f.name.value.trim(), contact = f.contact.value.trim(), loc = f.loc.value.trim();
      if (!name || !contact) { msg.className = 'ma-fmsg err'; msg.textContent = 'Upišite ime te telefon ili e-poštu.'; return; }
      const isMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
      const asked = history.filter(m => m.role === 'user').slice(-4).map(m => '– ' + m.text).join('\n');
      const note = ['Izvor: AI asistent na stranici mondo-acqua.hr', asked && 'Pitanja u razgovoru:\n' + asked].filter(Boolean).join('\n').slice(0, 1000);
      btn.disabled = true; btn.textContent = 'Šaljem…';
      try {
        const r = await fetch(INQUIRY, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + anon(), apikey: anon() },
          body: JSON.stringify({ name, phone: isMail ? '' : contact, email: isMail ? contact : '', location: loc, note }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j.success) throw new Error('greška');
        f.remove(); addMsg('b', 'Hvala! Upit je zaprimljen, javit ćemo se uskoro.');
      } catch {
        btn.disabled = false; btn.textContent = 'Pošaljite upit';
        msg.className = 'ma-fmsg err'; msg.textContent = 'Slanje nije uspjelo. Nazovite ' + TEL_TXT + ' ili pišite na info@mondo-acqua.hr.';
      }
    };
    body.appendChild(f); scrollDown();
    if (matchMedia('(min-width:761px)').matches) f.name.focus();
  }

  function open() {
    if (panel) return; opened = true; closeHi();
    dim = el('div', 'ma-dim'); dim.onclick = close;
    panel = el('section', 'ma-panel'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Mondo asistent');
    panel.innerHTML = `<header class="ma-head"><span class="ma-av"><span>${ROBOT}</span></span><div><b>Mondo asistent</b><small>AI asistent Mondo Acque</small></div><button type="button" class="ma-x" aria-label="Zatvorite razgovor">✕</button></header>
      <div class="ma-body" aria-live="polite"></div>
      <form class="ma-in"><textarea rows="1" maxlength="600" placeholder="Napišite pitanje…" aria-label="Vaše pitanje"></textarea><button type="submit" class="ma-send" aria-label="Pošaljite pitanje">${SEND_SVG}</button></form>
      <div class="ma-note">Odgovara AI, a razgovor se sprema radi boljih odgovora. Ponudu potvrđuje naš tim.</div>`;
    root.append(dim, panel); launch.style.display = 'none';
    body = panel.querySelector('.ma-body'); input = panel.querySelector('textarea'); sendBtn = panel.querySelector('.ma-send'); headAv = panel.querySelector('.ma-head .ma-av');
    panel.querySelector('.ma-x').onclick = close;
    const form = panel.querySelector('.ma-in');
    form.onsubmit = e => { e.preventDefault(); const v = input.value; input.value = ''; input.style.height = ''; ask(v); };
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
    input.addEventListener('input', () => { input.style.height = ''; input.style.height = Math.min(input.scrollHeight, 110) + 'px'; });
    document.addEventListener('keydown', onEsc);
    if (saved) { body.append(...saved); saved = null; scrollDown(); } else greet();
    if (matchMedia('(min-width:761px)').matches) input.focus();
  }
  let saved = null;
  const onEsc = e => { if (e.key === 'Escape') close(); };
  function close() {
    if (!panel) return;
    document.removeEventListener('keydown', onEsc);
    saved = [...body.childNodes];   // razgovor ostaje dok je stranica otvorena
    panel.remove(); dim.remove(); panel = dim = null; launch.style.display = ''; launch.focus();
  }
  launch.onclick = open;
})();
