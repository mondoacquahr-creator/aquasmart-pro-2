import { projectId, publicAnonKey } from '../utils/supabase/info';

// Brojač posjeta bez kolačića (isti kao na www.mondo-acqua.hr, funkcija mondo-stat; ne sprema IP).
// Šalje se iz same aplikacije, pri svakoj promjeni stranice. Instalirana aplikacija (Google Play,
// početni zaslon) bilježi se pod /app/..., preglednik pod /?stranica=...
// Vlastite posjete isključujete jednim otvaranjem poolcare.mondo-acqua.hr/?nebroji=1 (vraćate s ?nebroji=0).

let last = '';

const isStandalone = (): boolean => {
  try {
    return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  } catch {
    return false;
  }
};

export function countVisit(page: string): void {
  try {
    if (location.hostname !== 'poolcare.mondo-acqua.hr') return;
    const q = new URLSearchParams(location.search);
    try {
      if (q.get('nebroji') === '1') localStorage.setItem('ma-nebroji', '1');
      if (q.get('nebroji') === '0') localStorage.removeItem('ma-nebroji');
      if (localStorage.getItem('ma-nebroji')) return;
    } catch { /* bez pohrane: brojimo */ }
    if (navigator.doNotTrack === '1' || (navigator as any).webdriver) return;

    const name = String(page || 'home').replace(/[^a-z0-9-]/gi, '').slice(0, 30) || 'home';
    const p = isStandalone() ? `/app/${name}` : (name === 'home' ? '/' : `/?stranica=${name}`);
    if (p === last) return;
    last = p;

    let r = '';
    try { r = document.referrer ? new URL(document.referrer).hostname : ''; if (/mondo-acqua\.hr$/.test(r)) r = ''; } catch { /* ignore */ }

    fetch(`https://${projectId}.supabase.co/functions/v1/mondo-stat/hit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}`, apikey: publicAnonKey },
      body: JSON.stringify({ s: 'poolcare.mondo-acqua.hr', p, r, w: innerWidth < 760 ? 'm' : 'd' }),
    }).catch(() => { /* brojač ne smije smetati aplikaciji */ });
  } catch { /* ignore */ }
}
