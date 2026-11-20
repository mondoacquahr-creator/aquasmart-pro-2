// Fotografije snimljene bez signala: čuvaju se na uređaju (IndexedDB, podnosi i veće datoteke)
// i šalju se automatski čim se veza vrati. Putanja se zna unaprijed, pa nalog već
// sadrži točnu adresu fotografije i ne treba ga mijenjati nakon slanja.
import { api, supabase } from './supabase';

const DB_NAME = 'poolcare-photos';
const STORE = 'queue';

type QueuedPhoto = { id: string; path: string; folder?: string | null; blob: Blob; createdAt: string; tries: number };

let dbPromise: Promise<IDBDatabase> | null = null;
function db(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return db().then(d => new Promise<T>((resolve, reject) => {
    const t = d.transaction(STORE, mode);
    const r = fn(t.objectStore(STORE));
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  }));
}

let count = 0;
const listeners = new Set<(n: number) => void>();
async function refreshCount() {
  try { count = await tx<number>('readonly', s => s.count()); } catch { count = 0; }
  listeners.forEach(fn => { try { fn(count); } catch {} });
}
export function subscribePhotos(fn: (n: number) => void): () => void {
  listeners.add(fn);
  fn(count);
  return () => { listeners.delete(fn); };
}

// Mapa tvrtke na poslužitelju (company-<id>), poznata i bez signala iz prijave.
export async function companyFolder(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    const u = data?.session?.user;
    if (!u) return null;
    return `company-${(u.app_metadata as any)?.companyId || u.id}`;
  } catch {
    return null;
  }
}

// relPath je putanja unutar mape tvrtke, npr. work-orders/12/abc.jpg
export async function queuePhoto(id: string, relPath: string, blob: Blob): Promise<void> {
  const folder = await companyFolder();
  await tx('readwrite', s => s.put({ id, path: relPath, folder, blob, createdAt: new Date().toISOString(), tries: 0 } as QueuedPhoto));
  await refreshCount();
}

export async function removeQueuedPhoto(id: string): Promise<void> {
  try { await tx('readwrite', s => s.delete(id)); } catch {}
  await refreshCount();
}

export async function getQueuedPhotoBlob(id: string): Promise<Blob | null> {
  try {
    const item = await tx<QueuedPhoto | undefined>('readonly', s => s.get(id));
    return item?.blob || null;
  } catch {
    return null;
  }
}

export async function isPhotoQueued(id: string): Promise<boolean> {
  return (await getQueuedPhotoBlob(id)) !== null;
}

const retryable = (err: any) => {
  if (!navigator.onLine) return true;
  const st = Number(err?.status);
  return !st || st >= 500 || st === 408 || st === 429;
};

// Pošalji jednu fotografiju. true = poslano (ili konačno odbijeno pa uklonjeno), false = čeka.
export async function uploadQueuedPhoto(id: string): Promise<'sent' | 'waiting' | 'rejected'> {
  let item: QueuedPhoto | undefined;
  try { item = await tx<QueuedPhoto | undefined>('readonly', s => s.get(id)); } catch { return 'waiting'; }
  if (!item) return 'sent';
  if (!navigator.onLine) return 'waiting';
  // Fotografija pripada tvrtki koja ju je snimila; pod drugim računom se ne šalje.
  if (item.folder && item.folder !== (await companyFolder())) return 'waiting';
  try {
    const name = item.path.split('/').pop() || `${id}.jpg`;
    await api.uploadImage(new File([item.blob], name, { type: item.blob.type || 'image/jpeg' }), item.path);
    await removeQueuedPhoto(id);
    return 'sent';
  } catch (err) {
    if (retryable(err)) return 'waiting';
    await removeQueuedPhoto(id);
    return 'rejected';
  }
}

let flushing = false;
export async function flushPhotos(): Promise<void> {
  if (flushing || !navigator.onLine) return;
  flushing = true;
  try {
    const ids = await tx<IDBValidKey[]>('readonly', s => s.getAllKeys());
    for (const id of ids) {
      if (!navigator.onLine) break;
      await uploadQueuedPhoto(String(id));
    }
  } catch {
    // pokušat će se ponovno
  } finally {
    flushing = false;
    await refreshCount();
  }
}

if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
  window.addEventListener('online', () => { flushPhotos(); });
  setInterval(() => { if (count > 0) flushPhotos(); }, 30000);
  setTimeout(() => { refreshCount().then(flushPhotos); }, 2000);
}
