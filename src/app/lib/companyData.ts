import { api } from './supabase';
import { saveItem, deleteItem, overlayPending, saveCache, readCache, flush } from './outbox';

// Je li zadnje učitavanje došlo iz kopije na uređaju (nema veze s poslužiteljem).
let fromCache = false;
export const lastLoadWasOffline = () => fromCache;

export const OFFLINE_MESSAGE = 'Nema signala. Prikazani su zadnji spremljeni podaci; izmjene se šalju čim se veza vrati.';

export async function loadCompanyData(): Promise<Record<string, any[]> | null> {
  try {
    // Prvo pošalji ono što čeka, da poslužitelj vrati najnovije stanje.
    await flush().catch(() => {});
    const data = await api.syncAll();
    if (data && typeof data === 'object') {
      await saveCache(data);
      fromCache = false;
      return overlayPending(data);
    }
    throw new Error('Prazan odgovor');
  } catch {
    const cached = await readCache();
    fromCache = true;
    return cached ? overlayPending(cached) : null;
  }
}

// Sprema razliku između starog i novog popisa. Izmjene bez veze idu u red čekanja.
// Baca grešku samo ako poslužitelj izmjenu stvarno odbije.
export async function saveChanges(resource: string, oldList: any[], newList: any[]): Promise<'server' | 'queued'> {
  const errors: string[] = [];
  let queued = false;

  for (const item of newList) {
    const old = oldList.find(o => o.id === item.id);
    if (!old || JSON.stringify(old) !== JSON.stringify(item)) {
      try {
        if ((await saveItem(resource, item)).saved === 'queued') queued = true;
      } catch (err: any) {
        errors.push(err?.message || 'Greška');
      }
    }
  }

  const newIds = new Set(newList.map(i => i.id));
  for (const item of oldList) {
    if (!newIds.has(item.id)) {
      try {
        if ((await deleteItem(resource, String(item.id))).saved === 'queued') queued = true;
      } catch (err: any) {
        errors.push(err?.message || 'Greška');
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(errors[0]);
  }
  return queued ? 'queued' : 'server';
}
