import * as XLSX from 'xlsx';

// Izvoz popisa u Excel (.xlsx). Ključevi prvog retka postaju naslovi stupaca.
export function exportToExcel(fileBase: string, sheetName: string, rows: Record<string, any>[]) {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const headers = rows.length ? Object.keys(rows[0]) : [];
  sheet['!cols'] = headers.map((h) => {
    const longest = rows.reduce((max, r) => Math.max(max, String(r[h] ?? '').length), h.length);
    return { wch: Math.min(Math.max(longest + 2, 10), 45) };
  });
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, sheetName.slice(0, 31));
  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(book, `${fileBase}_${today}.xlsx`);
}

// Datum u hrvatskom obliku (dd.mm.gggg.) ili prazno.
export function hrDate(value: any): string {
  if (!value) return '';
  const raw = typeof value === 'object' ? (value.createdAt || value.date || value.scheduledFor || '') : value;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}.`;
}
