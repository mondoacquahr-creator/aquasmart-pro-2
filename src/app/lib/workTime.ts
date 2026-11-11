// Evidencija vremena rada na nalogu: početak, kraj i vrijeme označavanja svake stavke.

export interface TimedItem { id: number | string; completed?: boolean; completedAt?: string }

const ms = (iso?: string) => (iso ? Date.parse(iso) : NaN);

export function fmtClock(iso?: string): string {
  const t = ms(iso);
  if (!Number.isFinite(t)) return '';
  const d = new Date(t);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function fmtDuration(millis: number): string {
  if (!Number.isFinite(millis) || millis < 0) return '';
  const min = Math.round(millis / 60000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// Trajanje svake označene stavke: od prethodne označene stavke ili od početka rada.
// Ključ je `${prefix}${id}` kako se usluge i zadaci ne bi miješali.
export function itemDurations(groups: { prefix: string; items: TimedItem[] }[], startedAt?: string): Record<string, number> {
  const all = groups.flatMap(g => g.items
    .filter(i => i.completed && Number.isFinite(ms(i.completedAt)))
    .map(i => ({ key: `${g.prefix}${i.id}`, t: ms(i.completedAt) })))
    .sort((a, b) => a.t - b.t);
  const out: Record<string, number> = {};
  let prev = ms(startedAt);
  for (const i of all) {
    if (Number.isFinite(prev) && i.t >= prev) out[i.key] = i.t - prev;
    prev = i.t;
  }
  return out;
}

export function itemTimeLabel(item: TimedItem, key: string, durations: Record<string, number>): string {
  if (!item.completed || !item.completedAt) return '';
  const clock = fmtClock(item.completedAt);
  const d = durations[key];
  return d !== undefined ? `${clock} · ${fmtDuration(d)}` : clock;
}

export function totalWorkLabel(startedAt?: string, endedAt?: string, now = Date.now()): string {
  const s = ms(startedAt);
  if (!Number.isFinite(s)) return '';
  const e = Number.isFinite(ms(endedAt)) ? ms(endedAt) : now;
  return fmtDuration(e - s);
}
