import { motion } from 'motion/react';

// Vizualna kartica očitanja (isti stil kao primjer na naslovnici), ali sa stvarnim vrijednostima.

const CARD_BG = 'rgba(10,40,52,0.55)';
const CARD_BORDER = '1px solid rgba(120,220,255,0.12)';
const CYAN = '#5CE1E6';

type ParamId = 'ph' | 'freeChlorine' | 'totalChlorine' | 'alkalinity' | 'hardness' | 'cyanuricAcid' | 'temperature';

const PARAMS: { id: ParamId; label: string; unit: string; min: number; max: number }[] = [
  { id: 'ph', label: 'pH', unit: '', min: 7.2, max: 7.6 },
  { id: 'freeChlorine', label: 'Slobodni klor', unit: 'mg/L', min: 1.0, max: 3.0 },
  { id: 'totalChlorine', label: 'Ukupni klor', unit: 'mg/L', min: 1.0, max: 3.0 },
  { id: 'alkalinity', label: 'Alkalitet', unit: 'mg/L', min: 80, max: 120 },
  { id: 'hardness', label: 'Tvrdoća (Ca)', unit: 'mg/L', min: 200, max: 400 },
  { id: 'cyanuricAcid', label: 'Cijanurna kiselina', unit: 'mg/L', min: 30, max: 50 },
  { id: 'temperature', label: 'Temperatura', unit: '°C', min: 20, max: 30 },
];

const GRAD = {
  ok: 'linear-gradient(90deg, #CFF5E7, #1FA97A)',
  slight: 'linear-gradient(90deg, #FFF6CC, #FFD60A)',
  far: 'linear-gradient(90deg, #FFD60A 0%, #FF8A1F 55%, #FF2D55 100%)',
};

function assess(value: number, min: number, max: number) {
  const span = max - min;
  // Prikazna skala: idealni raspon zauzima srednju trećinu trake.
  const pct = Math.min(98, Math.max(2, ((value - (min - span)) / (3 * span)) * 100));
  if (value >= min && value <= max) return { pct, status: 'U redu', color: '#2EE6A6', grad: GRAD.ok, off: false };
  const low = value < min;
  const dist = low ? min - value : value - max;
  const slight = dist <= span * 0.5;
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
      return { ...p, value: v, ...assess(v, p.min, p.max) };
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
            <div className="relative h-2.5 rounded-full mb-1.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
              {/* idealni raspon */}
              <div className="absolute inset-y-0 rounded-full" style={{ left: '33.3%', width: '33.4%', background: 'rgba(46,230,166,0.16)' }} />
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: r.grad }}
                initial={{ width: '0%' }}
                animate={{ width: `${r.pct}%` }}
                transition={{ delay: 0.3 + idx * 0.15, duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
              />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.4)', marginLeft: '-8px' }}
                initial={{ left: '0%' }}
                animate={{ left: `${r.pct}%` }}
                transition={{ delay: 0.3 + idx * 0.15, duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
                Cilj {fmt(r.min)} – {fmt(r.max)}
              </span>
              <span className="text-xs font-semibold" style={{ color: r.color }}>{r.status}</span>
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
