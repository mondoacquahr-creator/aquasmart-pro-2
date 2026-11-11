import { VAGNER_EQUIPMENT, EquipmentProduct } from './vagnerEquipment';

// Okvirni prijedlog opreme prema dimenzijama bazena.
// Pravilo: cijeli volumen vode treba proći kroz filter za ~5 sati (uobičajeno 4–6 h za privatne bazene).

export interface PoolDims { length: number; width: number; depth: number; oval?: boolean }

// "8,20 x 3,50 x 1,50 m" -> { length: 8.2, width: 3.5, depth: 1.5 }
export function parseDimensions(s: string): PoolDims | null {
  const nums = String(s || '').replace(/,/g, '.').match(/\d+(?:\.\d+)?/g);
  if (!nums || nums.length < 3) return null;
  const [length, width, depth] = nums.slice(0, 3).map(Number);
  if (![length, width, depth].every((n) => n > 0 && n < 50)) return null;
  return { length, width, depth };
}

// Razina vode je oko 15 cm ispod ruba; ovalni bazen ima oko 89 % volumena pravokutnog.
export function waterVolume(d: PoolDims): number {
  const waterDepth = Math.max(0.5, d.depth - 0.15);
  return Math.round(d.length * d.width * waterDepth * (d.oval ? 0.89 : 1) * 10) / 10;
}

const num = (s: string) => {
  const m = String(s).replace(',', '.').match(/(\d+(?:\.\d+)?)\s*m³\/h/);
  return m ? parseFloat(m[1]) : 0;
};
const upTo = (s: string) => {
  const m = String(s).match(/do\s*(\d+)\s*m³(?!\/)/);
  return m ? parseInt(m[1], 10) : 0;
};
const sandKg = (p: EquipmentProduct) => {
  const m = `${p.size} ${p.description}`.match(/(\d+)\s*kg punjenja/);
  return m ? parseInt(m[1], 10) : 0;
};

export interface EquipmentSuggestion {
  volume: number;
  flow: number;               // potreban protok m³/h
  filtration: { items: EquipmentProduct[]; label: string; sandKg?: number };
  efficientPump?: EquipmentProduct;
  electrolysis?: EquipmentProduct;
  dosing?: EquipmentProduct;
}

export function suggestEquipment(d: PoolDims): EquipmentSuggestion {
  const volume = waterVolume(d);
  const flow = Math.round((volume / 5) * 10) / 10;
  const pumps = VAGNER_EQUIPMENT.filter((p) => p.category === 'Pumpe');
  const filters = VAGNER_EQUIPMENT.filter((p) => p.category === 'Filteri');

  // Pumpa: nazivni protok s rezervom ~25 % (stvarni protok je manji zbog cijevi i filtera)
  const needPump = flow * 1.25;
  const fixedPumps = pumps.filter((p) => !/regulacijom brzine/i.test(p.name)).sort((a, b) => num(a.size) - num(b.size) || a.priceEUR - b.priceEUR);
  const pump = fixedPumps.find((p) => num(p.size) >= needPump);
  const vsPump = pumps.filter((p) => /regulacijom brzine/i.test(p.name)).sort((a, b) => num(a.size) - num(b.size)).find((p) => num(p.size) >= needPump);

  // Filter: posuda s navedenim protokom koji pokriva potreban protok
  const sets = filters.filter((p) => /set/i.test(p.name) && num(p.size) >= flow * 1.1).sort((a, b) => a.priceEUR - b.priceEUR);
  const vessels = filters.filter((p) => !/set/i.test(p.name) && num(p.size) >= flow * 1.1).sort((a, b) => a.priceEUR - b.priceEUR);
  const vessel = vessels[0];

  let filtration: EquipmentSuggestion['filtration'];
  if (pump && vessel) {
    filtration = { items: [pump, vessel], label: 'Pumpa i pješčani filter', sandKg: sandKg(vessel) || undefined };
  } else if (sets[0]) {
    const kg = sandKg(filters.find((f) => sets[0].name.includes((f.name.match(/Azur \d+|WM300/) || [''])[0]) && !/set/i.test(f.name)) || sets[0]);
    filtration = { items: [sets[0]], label: 'Filterski set (posuda + pumpa)', sandKg: kg || undefined };
  } else {
    filtration = { items: [], label: 'Za ovaj volumen filtraciju dimenzionira Mondo Acqua' };
  }

  const electrolysis = VAGNER_EQUIPMENT.filter((p) => p.category === 'Elektroliza' && upTo(p.size) >= volume && /^Slana elektroliza VA SALT C/.test(p.name))
    .sort((a, b) => upTo(a.size) - upTo(b.size))[0];
  const dosing = VAGNER_EQUIPMENT.find((p) => p.id === 'vg-9202061NK');

  return { volume, flow, filtration, efficientPump: vsPump, electrolysis, dosing };
}
