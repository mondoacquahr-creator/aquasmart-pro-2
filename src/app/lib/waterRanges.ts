// Preporučeni rasponi parametara vode (isti kao u kartici Analiza) i ocjena izmjerene vrijednosti.
export interface Param { key: 'pH' | 'chlorine' | 'alkalinity' | 'redox' | 'temperature'; label: string; unit: string; min?: number; max?: number; dec?: number }

export const WATER_PARAMS: Param[] = [
  { key: 'pH', label: 'pH vrijednost', unit: '', min: 7.2, max: 7.6, dec: 1 },
  { key: 'chlorine', label: 'Slobodni klor', unit: 'mg/l', min: 1.0, max: 3.0, dec: 1 },
  { key: 'alkalinity', label: 'Ukupna alkalnost', unit: 'mg/l', min: 80, max: 120 },
  { key: 'redox', label: 'Redox', unit: 'mV', min: 650, max: 800 },
  { key: 'temperature', label: 'Temperatura vode', unit: '°C' },
];

export type Rating = 'ok' | 'low' | 'high' | 'none';

export function rate(p: Param, v: unknown): Rating {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  if (!Number.isFinite(n)) return 'none';
  if (p.min !== undefined && n < p.min) return 'low';
  if (p.max !== undefined && n > p.max) return 'high';
  return 'ok';
}

export const RATING_LABEL: Record<Rating, string> = { ok: 'u redu', low: 'prenisko', high: 'previsoko', none: '' };

export const fmtVal = (v: unknown) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n.toLocaleString('hr-HR', { maximumFractionDigits: 2 }) : '—';
};

const fmtFixed = (n: number, dec = 0) => n.toLocaleString('hr-HR', { minimumFractionDigits: dec, maximumFractionDigits: Math.max(dec, 2) });
export const rangeText = (p: Param) =>
  p.min !== undefined && p.max !== undefined ? `${fmtFixed(p.min, p.dec)} – ${fmtFixed(p.max, p.dec)}` : '—';
