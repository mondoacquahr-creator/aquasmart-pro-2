// Rad bez signala (strojarnica, podrum, teren bez mreže).
//
// Svaka izmjena u Pro portalu ide kroz ovaj red čekanja:
//  - ako ima veze, šalje se odmah;
//  - ako nema veze (ili poslužitelj privremeno ne odgovara), sprema se na uređaj
//    i šalje se automatski čim se veza vrati;
//  - dok čeka, izmjena je vidljiva u aplikaciji i NE prepisuje je stanje s poslužitelja.
// Uz red čekanja čuva se i zadnja kopija podataka tvrtke, da se aplikacija može
// otvoriti i bez signala.

import { api, supabase } from './supabase';

export type OutboxOp = {
  key: string;                 // resource:id (jedna stavka = najviše jedna operacija u redu)
  op: 'post' | 'delete';
  resource: string;
  id: string;
  body?: any;
  queuedAt: string;
  tries: number;
};

export type RejectedOp = { resource: string; id: string; reason: string; at: string };

export type OutboxState = { pending: number; rejected: RejectedOp[]; sending: boolean; online: boolean };

const OUTBOX_PREFIX = 'pc_outbox_';
const REJECTED_PREFIX = 'pc_rejected_';
const CACHE_PREFIX = 'pc_cache_';

let currentUserId: string | null = null;
let sending = false;
const listeners = new Set<(s: OutboxState) => void>();

async function userId(): Promise<string> {
  if (currentUserId) return currentUserId;
  try {
    const { data } = await supabase.auth.getSession();
    currentUserId = data?.session?.user?.id || 'anon';
  } catch {
    currentUserId = 'anon';
  }
  return currentUserId!;
}

// Kad se promijeni prijavljeni korisnik, red i kopija se vežu uz novog.
supabase.auth.onAuthStateChange((_event, session) => {
  currentUserId = session?.user?.id || null;
  notify();
});

function read<T>(key: string, def: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : def;
  } catch {
    return def;
  }
}

function write(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Spremanje na uređaj nije uspjelo:', err);
  }
}

function queueSync(): OutboxOp[] {
  return currentUserId ? read<OutboxOp[]>(OUTBOX_PREFIX + currentUserId, []) : [];
}

async function getQueue(): Promise<OutboxOp[]> {
  return read<OutboxOp[]>(OUTBOX_PREFIX + (await userId()), []);
}

async function setQueue(q: OutboxOp[]) {
  write(OUTBOX_PREFIX + (await userId()), q);
}

function rejectedSync(): RejectedOp[] {
  return currentUserId ? read<RejectedOp[]>(REJECTED_PREFIX + currentUserId, []) : [];
}

async function addRejected(r: RejectedOp) {
  const key = REJECTED_PREFIX + (await userId());
  const list = read<RejectedOp[]>(key, []);
  write(key, [r, ...list].slice(0, 20));
}

export async function clearRejected() {
  write(REJECTED_PREFIX + (await userId()), []);
  notify();
}

export function getState(): OutboxState {
  return {
    pending: queueSync().length,
    rejected: rejectedSync(),
    sending,
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
  };
}

function notify() {
  const s = getState();
  listeners.forEach(fn => { try { fn(s); } catch {} });
}

export function subscribe(fn: (s: OutboxState) => void): () => void {
  listeners.add(fn);
  fn(getState());
  return () => { listeners.delete(fn); };
}

// Greška veze ili privremena greška poslužitelja: pokušaj ponovno kasnije.
// 4xx (nema ovlasti, isteklo probno razdoblje, neispravni podaci) je konačno odbijanje.
function isRetryable(err: any): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  const status = Number(err?.status);
  if (!status) return true;
  return status >= 500 || status === 408 || status === 429;
}

// ---------- Kopija podataka tvrtke na uređaju ----------

const idOf = (x: any) => String(x?.id);

function applyOp(data: Record<string, any[]>, op: OutboxOp) {
  const list = Array.isArray(data[op.resource]) ? data[op.resource] : [];
  if (op.op === 'delete') {
    data[op.resource] = list.filter(i => idOf(i) !== op.id);
  } else {
    const i = list.findIndex(x => idOf(x) === op.id);
    data[op.resource] = i >= 0
      ? list.map((x, j) => (j === i ? op.body : x))
      : [...list, op.body];
  }
}

async function patchCache(op: OutboxOp) {
  const key = CACHE_PREFIX + (await userId());
  const cache = read<Record<string, any[]> | null>(key, null);
  if (!cache) return;
  applyOp(cache, op);
  write(key, cache);
}

// Na podatke s poslužitelja (ili iz kopije) primijeni izmjene koje još čekaju slanje.
export async function overlayPending(data: Record<string, any[]>): Promise<Record<string, any[]>> {
  const out: Record<string, any[]> = {};
  for (const [k, v] of Object.entries(data || {})) out[k] = Array.isArray(v) ? [...v] : v;
  for (const op of await getQueue()) applyOp(out, op);
  return out;
}

export async function saveCache(data: Record<string, any[]>) {
  write(CACHE_PREFIX + (await userId()), data);
}

export async function readCache(): Promise<Record<string, any[]> | null> {
  return read<Record<string, any[]> | null>(CACHE_PREFIX + (await userId()), null);
}

// Pri odjavi: kopija podataka se briše s uređaja (privatnost), red čekanja ostaje
// vezan uz korisnika i šalje se pri sljedećoj prijavi.
export function clearCacheForLogout() {
  try {
    Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX)).forEach(k => localStorage.removeItem(k));
  } catch {}
  currentUserId = null;
}

export function pendingCountSync(): number {
  return queueSync().length;
}

// ---------- Slanje ----------

async function enqueue(op: Omit<OutboxOp, 'key' | 'queuedAt' | 'tries'>) {
  const key = `${op.resource}:${op.id}`;
  const q = (await getQueue()).filter(o => o.key !== key);
  const full: OutboxOp = { ...op, key, queuedAt: new Date().toISOString(), tries: 0 };
  q.push(full);
  await setQueue(q);
  await patchCache(full);
  notify();
}

async function sendOne(op: OutboxOp) {
  if (op.op === 'delete') await api.delete(op.resource, op.id);
  else await api.post(op.resource, op.body);
}

export type SaveResult = { saved: 'server' | 'queued' };

// Spremi stavku: odmah na poslužitelj, ili u red čekanja ako nema veze.
// Baca grešku samo kad poslužitelj izmjenu stvarno odbije (npr. nema ovlasti).
export async function saveItem(resource: string, item: any): Promise<SaveResult> {
  const op = { op: 'post' as const, resource, id: idOf(item), body: item };
  return run(op);
}

export async function deleteItem(resource: string, id: string | number): Promise<SaveResult> {
  return run({ op: 'delete' as const, resource, id: String(id) });
}

async function run(op: Omit<OutboxOp, 'key' | 'queuedAt' | 'tries'>): Promise<SaveResult> {
  const key = `${op.resource}:${op.id}`;
  const waiting = (await getQueue()).some(o => o.key === key);
  // Ako ista stavka već čeka, nova verzija ide iza nje u red (redoslijed ostaje točan).
  if (waiting || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    await enqueue(op);
    return { saved: 'queued' };
  }
  try {
    await sendOne({ ...op, key, queuedAt: '', tries: 0 });
    await patchCache({ ...op, key, queuedAt: '', tries: 0 });
    return { saved: 'server' };
  } catch (err) {
    if (isRetryable(err)) {
      await enqueue(op);
      return { saved: 'queued' };
    }
    throw err;
  }
}

// Pošalji sve što čeka, redom. Staje na prvoj grešci veze.
export async function flush(): Promise<void> {
  if (sending) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  const { data } = await supabase.auth.getSession().catch(() => ({ data: null as any }));
  if (!data?.session) return;
  sending = true;
  notify();
  try {
    while (true) {
      const q = await getQueue();
      if (!q.length) break;
      const op = q[0];
      try {
        await sendOne(op);
      } catch (err: any) {
        if (isRetryable(err)) {
          op.tries += 1;
          await setQueue([op, ...q.slice(1)]);
          break;
        }
        await addRejected({
          resource: op.resource,
          id: op.id,
          reason: String(err?.message || 'Poslužitelj je odbio izmjenu.'),
          at: new Date().toISOString(),
        });
      }
      // Uklanja se samo ta operacija (u međuvremenu je možda dodana nova).
      const now = await getQueue();
      await setQueue(now.filter(o => !(o.key === op.key && o.queuedAt === op.queuedAt)));
      notify();
    }
  } finally {
    sending = false;
    notify();
  }
}

// Automatsko slanje: kad se veza vrati, pri pokretanju i svakih 30 s dok nešto čeka.
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { notify(); flush(); });
  window.addEventListener('offline', () => notify());
  window.addEventListener('storage', (e) => { if (e.key?.startsWith(OUTBOX_PREFIX)) notify(); });
  setInterval(() => { if (pendingCountSync() > 0) flush(); }, 30000);
  setTimeout(() => { userId().then(() => { notify(); flush(); }); }, 1500);
}
