import { motion } from 'motion/react';
import { IDEAL_RANGES } from '../lib/waterAnalysis';

// Vizualna kartica očitanja (isti stil kao primjer na naslovnici), ali sa stvarnim vrijednostima.

const CARD_BG = 'rgba(10,40,52,0.55)';
const CARD_BORDER = '1px solid rgba(120,220,255,0.12)';
const CYAN = '#5CE1E6';

type ParamId = 'ph' | 'freeChlorine' | 'orp' | 'totalChlorine' | 'alkalinity' | 'hardness' | 'cyanuricAcid' | 'temperature';

// Rasponi su isti kao u analizi (lib/waterAnalysis), da kartica i status vode uvijek govore isto.
// lo/hi: krajevi prikazne skale; warnLo/warnHi: do tih vrijednosti odstupanje je "malo" (npr. pH 6,8 je blizu cilja).
type Param = { id: ParamId; label: string; unit: string; min: number; max: number; lo?: number; hi?: number; warnLo?: number; warnHi?: number };
const PARAMS: Param[] = [
  { id: 'ph', label: 'pH', unit: '', min: IDEAL_RANGES.pH.min, max: IDEAL_RANGES.pH.max, lo: 6.0, hi: 8.8, warnLo: IDEAL_RANGES.pH.critical.min, warnHi: IDEAL_RANGES.pH.critical.max },
  { id: 'freeChlorine', label: 'Slobodni klor', unit: 'mg/L', min: IDEAL_RANGES.freeChlorine.min, max: IDEAL_RANGES.freeChlorine.max },
  { id: 'orp', label: 'Redox (ORP)', unit: 'mV', min: IDEAL_RANGES.orp.min, max: IDEAL_RANGES.orp.max },
  { id: 'totalChlorine', label: 'Ukupni klor', unit: 'mg/L', min: 1.0, max: 3.0 },
  { id: 'alkalinity', label: 'Alkalitet', unit: 'mg/L', min: IDEAL_RANGES.alkalinity.min, max: IDEAL_RANGES.alkalinity.max },
  { id: 'hardness', label: 'Tvrdoća (Ca)', unit: 'mg/L', min: IDEAL_RANGES.hardness.min, max: IDEAL_RANGES.hardness.max },
  { id: 'cyanuricAcid', label: 'Cijanurna kiselina', unit: 'mg/L', min: 30, max: 50 },
  { id: 'temperature', label: 'Temperatura', unit: '°C', min: 20, max: 30 },
];

const GRAD = {
  ok: 'linear-gradient(90deg, #CFF5E7, #1FA97A)',
  slight: 'linear-gradient(90deg, #FFF6CC, #FFD60A)',
  far: 'linear-gradient(90deg, #FFD60A 0%, #FF8A1F 55%, #FF2D55 100%)',
};

function assess(value: number, p: Param) {
  const { min, max } = p;
  const span = max - min;
  // Prikazna skala: idealni raspon zauzima srednju trećinu trake; ispod i iznad cilja skala ide do lo/hi.
  const lo = p.lo ?? min - span;
  const hi = p.hi ?? max + span;
  const raw = value < min
    ? ((value - lo) / (min - lo)) * 33.3
    : value > max
      ? 66.7 + ((value - max) / (hi - max)) * 33.3
      : 33.3 + ((value - min) / (span || 1)) * 33.4;
  const pct = Math.min(98, Math.max(2, raw));
  if (value >= min && value <= max) return { pct, status: 'U redu', color: '#2EE6A6', grad: GRAD.ok, off: false };
  const low = value < min;
  const dist = low ? min - value : value - max;
  const slight = low
    ? (p.warnLo !== undefined ? value >= p.warnLo : dist <= span * 0.5)
    : (p.warnHi !== undefined ? value <= p.warnHi : dist <= span * 0.5);
  const status = slight ? (low ? 'Malo nisko' : 'Malo visoko') : (low ? 'Nisko' : 'Visoko');
  return { pct, status, color: slight ? '#FFD60A' : '#FF8A1F', grad: slight ? GRAD.slight : GRAD.far, off: true };
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10)).replace('.', ',');

// "9000 ml" -> "9 L", "1800 g" -> "1,8 kg"; dodaci u zagradi ostaju u detaljnim uputama
const niceDose = (d: string) => {
  const t = d.replace(/\s*\(.*\)\s*$/, '').trim();
  const m = t.match(/^([\d.,]+)\s*(ml|g)\b(.*)$/i);
  if (!m) return t;
  const n = parseFloat(m[1].replace(',', '.'));
  if (!isFinite(n) || n < 1000) return t;
  const big = Math.round((n / 1000) * 10) / 10;
  return `${String(big).replace('.', ',')} ${m[2].toLowerCase() === 'ml' ? 'L' : 'kg'}${m[3]}`;
};

const korekcija = (n: number) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return `${n} korekcija`;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} korekcije`;
  return `${n} korekcija`;
};

interface ReadingCardProps {
  values: Record<string, string>;
  volume: string;
  recommendations: { productName: string; dosage: string }[];
}

export function ReadingCard({ values, volume, recommendations }: ReadingCardProps) {
  const rows = PARAMS
    .filter((p) => values[p.id] !== undefined && values[p.id] !== '' && !isNaN(parseFloat(values[p.id])))
    .map((p) => {
      const v = parseFloat(values[p.id]);
      return { ...p, value: v, ...assess(v, p) };
    });
  const corrections = rows.filter((r) => r.off).length;
  const doses = recommendations.filter((r) => !/\(alternativa\)/i.test(r.productName)).slice(0, 5);
  const now = new Date();
  const when = `${now.getDate()}.${now.getMonth() + 1}. · ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-3xl overflow-hidden"
      style={{ background: CARD_BG, border: CARD_BORDER, boxShadow: '0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(120,220,255,0.06)' }}
    >
      {/* Zaglavlje */}
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(120,220,255,0.08)' }}>
        <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Vaše očitanje{volume ? ` · bazen ${fmt(parseFloat(volume))} m³` : ''}
        </p>
        <div className="flex items-center justify-between gap-3">
          <p className="font-bold text-base text-white">Očitanje {when}</p>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
            style={corrections
              ? { background: 'rgba(255,214,10,0.18)', color: '#FFD60A' }
              : { background: 'rgba(46,230,166,0.15)', color: '#2EE6A6' }}
          >
            {corrections ? korekcija(corrections) : 'Sve u redu'}
          </span>
        </div>
      </div>

      {/* Trake */}
      <div className="px-6 py-5 space-y-5">
        {rows.map((r, idx) => (
          <div key={r.id}>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{r.label}</span>
              <span className="text-xl font-bold text-white">{fmt(r.value)}{r.unit ? ` ${r.unit}` : ''}</span>
            </div>
            <div className="relative h-3 rounded-full mt-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
              {/* ciljni raspon: jasno označen */}
              <div
                className="absolute -inset-y-1 rounded-md"
                style={{ left: '33.3%', width: '33.4%', background: 'rgba(46,230,166,0.22)', boxShadow: 'inset 0 0 0 1.5px rgba(46,230,166,0.85)' }}
              />
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: r.grad, opacity: 0.9 }}
                initial={{ width: '0%' }}
                animate={{ width: `${r.pct}%` }}
                transition={{ delay: 0.3 + idx * 0.15, duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
              />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white"
                style={{ boxShadow: `0 0 0 3px ${r.color}, 0 2px 10px rgba(0,0,0,0.5)`, marginLeft: '-10px' }}
                initial={{ left: '0%' }}
                animate={{ left: `${r.pct}%` }}
                transition={{ delay: 0.3 + idx * 0.15, duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
            <div className="relative h-5 mt-2 text-xs">
              <span className="absolute -translate-x-1/2 font-semibold" style={{ left: '33.3%', color: 'rgba(46,230,166,0.95)' }}>{fmt(r.min)}</span>
              <span className="absolute -translate-x-1/2 font-semibold" style={{ left: '66.7%', color: 'rgba(46,230,166,0.95)' }}>{fmt(r.max)}</span>
              <span className="absolute left-0" style={{ color: 'rgba(255,255,255,0.4)' }}>Cilj</span>
              <span className="absolute right-0 font-bold" style={{ color: r.color }}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Doza */}
      <div
        className="mx-4 mb-4 px-5 py-4 rounded-2xl"
        style={{ background: 'rgba(4,24,32,0.7)', border: '1px solid rgba(92,225,230,0.15)' }}
      >
        <p className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: CYAN }}>
          {doses.length ? `Preporučena doza${volume ? ` · ${fmt(parseFloat(volume))} m³` : ''}` : 'Voda je u ravnoteži'}
        </p>
        {doses.length ? (
          <div className="space-y-1.5">
            {doses.map((d, i) => (
              <div key={i} className="flex justify-between gap-4 text-sm">
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{d.productName}</span>
                <span className="font-semibold text-white text-right">{niceDose(d.dosage)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Nastavite s redovitim održavanjem.</p>
        )}
        <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Doze su izračunate prema deklaraciji proizvoda.
        </p>
      </div>
    </motion.div>
  );
}
