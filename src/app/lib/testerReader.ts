// Očitavanje Multi Pooltestera (pH: Phenol Red, klor: DPD) s fotografije.
// Voda se vidi kroz polja s brojevima; obojene trake pored njih su otisnuta skala.
// Svaka boja vode uspoređuje se sa skalom NA ISTOJ fotografiji, pa svjetlo manje smeta.

export type Point = { x: number; y: number };
export type Quad = [Point, Point, Point, Point]; // gore-lijevo, gore-desno, dolje-desno, dolje-lijevo
export type GetPixel = (x: number, y: number) => [number, number, number];

export const PH_SCALE = [8.2, 7.8, 7.6, 7.4, 7.2, 7.0, 6.8];
export const CL_SCALE = [3.0, 2.0, 1.5, 1.0, 0.6, 0.3, 0.1];

// Raspored unutar okvira (0–1): od lijevog ruba pH polja do desnog ruba polja klora,
// od vrha polja 8,2 do dna polja 6,8. Izmjereno na Multi Pooltesteru.
export const TEMPLATE = {
  rows: [0.058, 0.2, 0.348, 0.492, 0.637, 0.784, 0.929],
  rowHalf: 0.035,
  phWindow: [0.072, 0.129] as [number, number], // dio polja s brojem, desno od brojke
  phBar: [0.2, 0.34] as [number, number],
  clBar: [0.63, 0.8] as [number, number],
  clWindow: [0.873, 0.926] as [number, number], // dio polja s brojem, lijevo od brojke
};

// Voda u polju izgleda oko 1,3 puta jarkije od otisnute skale (izmjereno na fotografijama Mondo Acque).
export const CL_CHROMA_FACTOR = 1.31;

export interface TesterReading {
  ph: number;
  cl: number;
  phSure: boolean;
  clSure: boolean;
}

const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

// Točka (u, v) iz okvira preslikana na fotografiju (bilinearno, podnosi i blago kosu sliku).
export function mapPoint(q: Quad, u: number, v: number): Point {
  const top = lerp(q[0], q[1], u);
  const bottom = lerp(q[3], q[2], u);
  return lerp(top, bottom, v);
}

function toLab([r8, g8, b8]: [number, number, number]): [number, number, number] {
  const lin = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const r = lin(r8), g = lin(g8), b = lin(b8);
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}

const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

// Srednja (medijan) boja pravokutnika [u0,u1] × [v-h, v+h] u okviru.
function sampleLab(get: GetPixel, q: Quad, u0: number, u1: number, v: number, h: number): [number, number, number] {
  const L: number[] = [], A: number[] = [], B: number[] = [];
  const nu = 8, nv = 5;
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const p = mapPoint(q, u0 + ((u1 - u0) * (i + 0.5)) / nu, v - h + (2 * h * (j + 0.5)) / nv);
      const lab = toLab(get(Math.round(p.x), Math.round(p.y)));
      L.push(lab[0]); A.push(lab[1]); B.push(lab[2]);
    }
  }
  return [median(L), median(A), median(B)];
}

const hueOf = (lab: number[]) => (Math.atan2(lab[2], lab[1]) * 180) / Math.PI;
const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// Najbliže polje skale i procjena između njega i boljeg susjeda.
function nearestWithNeighbour(d: number[], values: number[]) {
  let i = 0;
  for (let k = 1; k < d.length; k++) if (d[k] < d[i]) i = k;
  const neighbours = [i - 1, i + 1].filter((k) => k >= 0 && k < d.length);
  const j = neighbours.reduce((best, k) => (d[k] < d[best] ? k : best), neighbours[0]);
  const w = d[i] + d[j] > 0 ? d[i] / (d[i] + d[j]) : 0;
  return { value: values[i] + (values[j] - values[i]) * w, distance: d[i] };
}

export function readTester(get: GetPixel, q: Quad): TesterReading {
  const T = TEMPLATE;
  const phSamples = T.rows.map((v) => sampleLab(get, q, T.phWindow[0], T.phWindow[1], v, T.rowHalf));
  const clSamples = T.rows.map((v) => sampleLab(get, q, T.clWindow[0], T.clWindow[1], v + 0.012, T.rowHalf));
  const phBars = T.rows.map((v) => sampleLab(get, q, T.phBar[0], T.phBar[1], v, T.rowHalf));
  const clBars = T.rows.map((v) => sampleLab(get, q, T.clBar[0], T.clBar[1], v + 0.012, T.rowHalf));

  // pH: nijansa vode (medijan po svim poljima) naspram nijansi skale.
  const phHue = median(phSamples.map(hueOf));
  const barHues = phBars.map(hueOf);
  let ph: number | null = null;
  for (let k = 0; k < 6; k++) {
    const a = barHues[k], b = barHues[k + 1];
    if (phHue >= Math.min(a, b) && phHue <= Math.max(a, b) && a !== b) {
      ph = PH_SCALE[k] + (PH_SCALE[k + 1] - PH_SCALE[k]) * ((phHue - a) / (b - a));
      break;
    }
  }
  let phSure = true;
  if (ph === null) {
    const d = barHues.map((h) => Math.abs(h - phHue));
    const n = nearestWithNeighbour(d, PH_SCALE);
    ph = n.value;
    phSure = n.distance < 6;
  }

  // Klor: boja vode umanjene jarkosti (faktor) naspram polja skale.
  const s = [0, 1, 2].map((c) => median(clSamples.map((x) => x[c])));
  const corrected = [s[0], s[1] / CL_CHROMA_FACTOR, s[2] / CL_CHROMA_FACTOR];
  const n = nearestWithNeighbour(clBars.map((b) => dist(corrected, b)), CL_SCALE);
  const clSure = n.distance < 9;

  return {
    ph: Math.round(Math.min(8.2, Math.max(6.8, ph)) * 10) / 10,
    cl: Math.round(Math.min(3, Math.max(0.1, n.value)) * 10) / 10,
    phSure,
    clSure,
  };
}
