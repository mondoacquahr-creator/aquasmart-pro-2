// Logo tvrtke servisera za izvještaje i ponude.
// Sprema se u mapu tvrtke na poslužitelju (company-<id>/brand/logo.png) preko postojećeg
// učitavanja slika, a kopija se čuva na uređaju da se izvještaj može ispisati i bez signala.
import { api } from './supabase';
import { isDemoMode } from './session';

const LOGO_FILE = 'brand/logo.png';
const CACHE_KEY = 'pc_company_logo';
const MAX_W = 800;
const MAX_H = 300;

let companyId: string | null = null;

async function getCompanyId(): Promise<string | null> {
  if (companyId) return companyId;
  try {
    const me: any = await api.get('me');
    companyId = me?.companyId || null;
  } catch {
    companyId = null;
  }
  return companyId;
}

const readCache = (): { companyId?: string; dataUrl?: string } => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; }
};
const writeCache = (v: { companyId?: string; dataUrl?: string }) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(v)); } catch {}
};

const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result));
  r.onerror = reject;
  r.readAsDataURL(blob);
});

// Smanji sliku na najviše 800 × 300 px, PNG (zadržava prozirnost).
async function normalize(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Datoteka nije slika.'));
      i.src = url;
    });
    const scale = Math.min(1, MAX_W / img.naturalWidth, MAX_H / img.naturalHeight);
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Obrada slike nije uspjela.'))), 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function uploadCompanyLogo(file: File): Promise<string> {
  if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) throw new Error('Učitajte logo kao PNG, JPG, WEBP ili SVG.');
  const blob = await normalize(file);
  const dataUrl = await blobToDataUrl(blob);
  if (isDemoMode()) {
    writeCache({ companyId: 'demo', dataUrl });
    return dataUrl;
  }
  if (!navigator.onLine) throw new Error('Za učitavanje loga potrebna je internetska veza.');
  await api.uploadImage(new File([blob], 'logo.png', { type: 'image/png' }), LOGO_FILE);
  writeCache({ companyId: (await getCompanyId()) || undefined, dataUrl });
  return dataUrl;
}

// Logo kao data URL (za ispis), ili null ako tvrtka nema logo.
export async function getCompanyLogo(): Promise<string | null> {
  const cached = readCache();
  if (isDemoMode()) return cached.dataUrl || null;
  if (!navigator.onLine) return cached.dataUrl || null;
  const id = await getCompanyId();
  if (!id) return cached.dataUrl || null;
  try {
    const res: any = await api.get(`images/url?path=${encodeURIComponent(`company-${id}/${LOGO_FILE}`)}`);
    if (!res?.url) throw new Error('nema');
    const r = await fetch(res.url);
    if (!r.ok) throw new Error('nema');
    const dataUrl = await blobToDataUrl(await r.blob());
    writeCache({ companyId: id, dataUrl });
    return dataUrl;
  } catch {
    // Nema loga na poslužitelju (ili privremena greška): koristi kopiju iste tvrtke ako postoji.
    return cached.companyId === id ? cached.dataUrl || null : null;
  }
}
