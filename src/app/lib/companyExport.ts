// Izvoz svih podataka tvrtke (Pro portal) u jednu Excel datoteku, list po vrsti podataka.
import { loadCompanyData } from './companyData';
import { exportWorkbook } from './excelExport';

const LABELS: Record<string, string> = {
  id: 'ID', client: 'Klijent', clientName: 'Klijent', name: 'Naziv', location: 'Lokacija', address: 'Adresa',
  task: 'Zadatak', status: 'Status', assignee: 'Izvršitelj', dueDate: 'Rok', priority: 'Prioritet', notes: 'Napomena',
  note: 'Napomena', disinfectionSystem: 'Dezinfekcija', totalCost: 'Ukupno (€)', workStartedAt: 'Početak rada',
  workEndedAt: 'Kraj rada', completedAt: 'Završeno', completedBy: 'Završio', reviewedAt: 'Pregledano',
  phone: 'Telefon', email: 'E-mail', pools: 'Broj bazena', lastService: 'Zadnji servis', nextService: 'Sljedeći servis',
  stock: 'Stanje', unit: 'Jedinica', minStock: 'Minimalna zaliha', category: 'Kategorija', price: 'Cijena (€)',
  code: 'Šifra', supplier: 'Dobavljač', role: 'Uloga', date: 'Datum', createdAt: 'Upisano', updatedAt: 'Izmijenjeno',
  volume: 'Volumen (m³)', pH: 'pH', chlorine: 'Klor', freeChlorine: 'Slobodni klor', alkalinity: 'Alkalnost',
  hardness: 'Tvrdoća', temperature: 'Temperatura', quantity: 'Količina', type: 'Vrsta',
  productsUsed: 'Utrošeni proizvodi', services: 'Usluge', maintenanceTasks: 'Zadaci održavanja',
};
const STATUS: Record<string, string> = { active: 'U tijeku', pending: 'Na čekanju', completed: 'Završeno', inactive: 'Neaktivan', high: 'Visok', medium: 'Srednji', low: 'Nizak' };
const SKIP = new Set(['permissions', 'photos', 'trend', 'performance', 'tasks', 'assigneeId', 'additionalWorkers']);

const hrDateTime = (v: any) => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(v)) return v;
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  const date = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}.`;
  return v.length > 10 ? `${date} ${d.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}` : date;
};

const describeList = (arr: any[]) => arr.map((x) => {
  if (x && typeof x === 'object') {
    const label = x.productName || x.name || x.title || x.id;
    const qty = x.quantity !== undefined ? ` ${x.quantity}${x.unit ? ' ' + x.unit : ''}` : '';
    const done = x.completed === true ? ' ✓' : '';
    return `${label}${qty}${done}`;
  }
  return String(x);
}).join('; ');

// Svaki zapis u jedan red: jednostavna polja kao stupci, popisi kao tekst.
const flatten = (item: any): Record<string, any> => {
  const row: Record<string, any> = {};
  for (const [k, v] of Object.entries(item || {})) {
    if (SKIP.has(k) || v === null || v === undefined || v === '') continue;
    const label = LABELS[k] || k;
    if (Array.isArray(v)) { if (v.length) row[label] = describeList(v); }
    else if (typeof v === 'object') row[label] = JSON.stringify(v);
    else row[label] = (k === 'status' || k === 'priority') && STATUS[String(v)] ? STATUS[String(v)] : hrDateTime(v);
  }
  return row;
};

const SHEETS: [string, string][] = [
  ['work-orders', 'Radni nalozi'],
  ['clients', 'Klijenti'],
  ['pools', 'Bazeni'],
  ['analyses', 'Analize vode'],
  ['warehouse', 'Skladište'],
  ['warehouse-transactions', 'Promjene skladišta'],
  ['employees', 'Djelatnici'],
  ['orders', 'Narudžbe'],
];

export async function exportCompanyData(companyName?: string): Promise<void> {
  const data = await loadCompanyData();
  if (!data) throw new Error('Podaci nisu dostupni. Provjerite vezu i pokušajte ponovno.');
  const base = `mondo-pool-care_${(companyName || 'tvrtka').toLowerCase().replace(/[^a-z0-9čćžšđ]+/gi, '-').replace(/^-|-$/g, '')}`;
  exportWorkbook(base, SHEETS.map(([key, name]) => ({ name, rows: (data[key] || []).map(flatten) })));
}
