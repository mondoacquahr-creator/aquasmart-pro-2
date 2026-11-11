// HUB3 2D kod (PDF417) za uplatnice u Hrvatskoj: banke ga čitaju mobilnim bankarstvom.
// Podaci se upisuju bez dijakritika jer HUB3 koristi ograničen skup znakova.

export interface Hub3Data {
  amountEUR: number;
  payerName?: string;
  payerAddress?: string;
  payerCity?: string;
  recipientName: string;
  recipientAddress?: string;
  recipientCity?: string;
  iban: string;
  model: string;      // npr. HR00
  reference: string;  // poziv na broj
  purposeCode?: string;
  description: string;
}

const ascii = (s: string, max: number) =>
  String(s || '')
    .replace(/[čćČĆ]/g, (c) => (c === c.toLowerCase() ? 'c' : 'C'))
    .replace(/[šŠ]/g, (c) => (c === 'š' ? 's' : 'S'))
    .replace(/[žŽ]/g, (c) => (c === 'ž' ? 'z' : 'Z'))
    .replace(/đ/g, 'dj').replace(/Đ/g, 'Dj')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .trim()
    .slice(0, max);

export function buildHub3(d: Hub3Data): string {
  const cents = Math.max(0, Math.round((d.amountEUR || 0) * 100));
  return [
    'HRVHUB30',
    'EUR',
    String(cents).padStart(15, '0'),
    ascii(d.payerName || '', 30),
    ascii(d.payerAddress || '', 27),
    ascii(d.payerCity || '', 27),
    ascii(d.recipientName, 25),
    ascii(d.recipientAddress || '', 25),
    ascii(d.recipientCity || '', 27),
    d.iban.replace(/\s+/g, '').toUpperCase().slice(0, 21),
    d.model.slice(0, 4),
    d.reference.slice(0, 22),
    (d.purposeCode || 'OTHR').slice(0, 4),
    ascii(d.description, 35),
    '',
  ].join('\n');
}

// Poziv na broj (model HR00): godina i broj naloga, samo znamenke i crtica.
export function referenceFromOrder(orderId: string | number, date = new Date()): string {
  const digits = String(orderId ?? '').replace(/\D/g, '').slice(-10) || '1';
  return `${date.getFullYear()}-${digits}`;
}

const BWIP_URL = 'https://cdn.jsdelivr.net/npm/bwip-js@4.11.4/dist/bwip-js.mjs';

// Vraća PNG data URL s PDF417 kodom ili null ako se biblioteka ne može učitati.
export async function hub3BarcodeDataUrl(text: string): Promise<string | null> {
  try {
    const m: any = await import(/* @vite-ignore */ BWIP_URL);
    const bwip = m.default || m;
    const canvas = document.createElement('canvas');
    bwip.toCanvas(canvas, { bcid: 'pdf417', text, scale: 3, columns: 9, eclevel: 4, rowmult: 3 });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('HUB3 barcode failed:', err);
    return null;
  }
}
