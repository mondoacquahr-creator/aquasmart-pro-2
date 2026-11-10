import { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { X, Upload, FileSpreadsheet, ArrowRight, ArrowLeft, Check, AlertTriangle, Link2 } from 'lucide-react';
import { T } from '../lib/theme';

// Čarobnjak za uvoz iz Excela/CSV-a: korisnik sam poveže svoje stupce s poljima aplikacije,
// vidi pregled s greškama i tek onda uveze. Povezivanje se pamti za sljedeći put.

export type FieldType = 'text' | 'number' | 'date';
export interface ImportField {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  hint?: string;
  synonyms: string[];
}
export interface ImportResult { added: number; updated: number; skipped: number }

interface Props {
  title: string;
  storageKey: string;
  fields: ImportField[];
  existingNames: string[];
  duplicateLabel: string;
  onImport: (rows: Record<string, any>[], mode: 'update' | 'skip') => ImportResult;
  onClose: () => void;
  /** dodatna provjera retka (npr. ime ILI ime+prezime); vraća poruku greške ili null */
  validate?: (row: Record<string, any>) => string | null;
  /** provjera povezivanja (npr. mora biti povezan naziv ili ime); vraća poruku ili null */
  mappingCheck?: (keys: string[]) => string | null;
}

const IGNORE = '__ignore__';
const norm = (s: any) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, ' ').trim();

function toNumber(v: any): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  if (typeof v === 'number') return v;
  const s = String(v).replace(/\s/g, '').replace(/[€$kn]/gi, '');
  const n = parseFloat(s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s.replace(/,/g, ''));
  return Number.isFinite(n) ? n : undefined;
}
function toDate(v: any): string | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  if (typeof v === 'number') {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
  }
  const s = String(v).trim();
  const hr = s.match(/^(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})/);
  if (hr) return `${hr[3]}-${hr[2].padStart(2, '0')}-${hr[1].padStart(2, '0')}`;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return iso ? iso[0] : undefined;
}

function guess(header: string, fields: ImportField[], taken: Set<string>): string {
  const h = norm(header);
  if (!h) return IGNORE;
  for (const f of fields) {
    if (taken.has(f.key)) continue;
    if ([f.label, ...f.synonyms].some((s) => norm(s) === h)) return f.key;
  }
  for (const f of fields) {
    if (taken.has(f.key)) continue;
    if ([f.label, ...f.synonyms].some((s) => { const n = norm(s); return n.length > 2 && (h.includes(n) || n.includes(h)); })) return f.key;
  }
  return IGNORE;
}

const cardStyle = { background: T.cardBg, border: T.cardBorder } as const;

export function ImportWizard({ title, storageKey, fields, existingNames, duplicateLabel, onImport, onClose, validate, mappingCheck }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fileName, setFileName] = useState('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheet, setSheet] = useState('');
  const [hasHeader, setHasHeader] = useState(true);
  const [mapping, setMapping] = useState<string[]>([]);
  const [mode, setMode] = useState<'update' | 'skip'>('update');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const matrix: any[][] = useMemo(() => {
    if (!workbook || !sheet) return [];
    const rows = XLSX.utils.sheet_to_json<any[]>(workbook.Sheets[sheet], { header: 1, blankrows: false, defval: '' });
    return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
  }, [workbook, sheet]);

  const headers: string[] = useMemo(() => {
    const width = Math.max(0, ...matrix.slice(0, 50).map((r) => r.length));
    return Array.from({ length: width }, (_, i) => (hasHeader ? String(matrix[0]?.[i] ?? '').trim() : '') || `Stupac ${i + 1}`);
  }, [matrix, hasHeader]);
  const dataRows = hasHeader ? matrix.slice(1) : matrix;

  const autoMap = (hdrs: string[], header: boolean) => {
    let saved: Record<string, string> = {};
    try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { /* */ }
    const taken = new Set<string>();
    return hdrs.map((h) => {
      const fromSaved = header ? saved[norm(h)] : undefined;
      const k = fromSaved && fields.some((f) => f.key === fromSaved) && !taken.has(fromSaved) ? fromSaved : (header ? guess(h, fields, taken) : IGNORE);
      if (k !== IGNORE) taken.add(k);
      return k;
    });
  };

  const loadFile = (file: File) => {
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: 'array', cellDates: false });
        setWorkbook(wb);
        setFileName(file.name);
        const first = wb.SheetNames[0];
        setSheet(first);
        const rows = XLSX.utils.sheet_to_json<any[]>(wb.Sheets[first], { header: 1, blankrows: false, defval: '' }).filter((r) => r.some((c) => String(c).trim() !== ''));
        const width = Math.max(0, ...rows.slice(0, 50).map((r) => r.length));
        const hdrs = Array.from({ length: width }, (_, i) => String(rows[0]?.[i] ?? '').trim() || `Stupac ${i + 1}`);
        setMapping(autoMap(hdrs, true));
        setStep(2);
      } catch {
        setError('Datoteku nije moguće pročitati. Podržani su Excel (.xlsx, .xls) i CSV.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // novi list ili promjena zaglavlja: ponovno prepoznaj stupce
  useEffect(() => {
    if (workbook && mapping.length !== headers.length) setMapping(autoMap(headers, hasHeader));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers]);

  const setField = (col: number, key: string) => {
    setMapping((m) => m.map((k, i) => (i === col ? key : k === key && key !== IGNORE ? IGNORE : k)));
  };

  const converted = useMemo(() => dataRows.map((r) => {
    const out: Record<string, any> = {};
    mapping.forEach((key, i) => {
      if (key === IGNORE) return;
      const f = fields.find((x) => x.key === key)!;
      const raw = r[i];
      const v = f.type === 'number' ? toNumber(raw) : f.type === 'date' ? toDate(raw) : String(raw ?? '').trim() || undefined;
      if (v !== undefined) out[key] = v;
    });
    return out;
  }), [dataRows, mapping, fields]);

  const required = fields.filter((f) => f.required);
  const missingRequiredMapping = required.filter((f) => !mapping.includes(f.key));
  const mappingProblem = missingRequiredMapping.length
    ? `Povežite obavezno polje: ${missingRequiredMapping.map((f) => f.label).join(', ')}`
    : mappingCheck?.(mapping.filter((k) => k !== IGNORE)) || '';
  const existing = useMemo(() => new Set(existingNames.map(norm)), [existingNames]);
  const rowStatus = converted.map((row) => {
    const miss = required.filter((f) => row[f.key] === undefined).map((f) => f.label);
    if (miss.length) return { ok: false, msg: `Nedostaje: ${miss.join(', ')}` };
    const custom = validate?.(row);
    if (custom) return { ok: false, msg: custom };
    const name = row.name ?? [row.firstName, row.lastName].filter(Boolean).join(' ');
    if (name && existing.has(norm(name))) return { ok: true, dup: true, msg: duplicateLabel };
    return { ok: true, msg: '' };
  });
  const okCount = rowStatus.filter((s) => s.ok).length;
  const dupCount = rowStatus.filter((s: any) => s.dup).length;
  const badCount = rowStatus.length - okCount;

  const doImport = () => {
    // zapamti povezivanje za sljedeći uvoz
    if (hasHeader) {
      const saved: Record<string, string> = {};
      headers.forEach((h, i) => { if (mapping[i] !== IGNORE) saved[norm(h)] = mapping[i]; });
      try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { /* */ }
    }
    const rows = converted.filter((_, i) => rowStatus[i].ok);
    setResult(onImport(rows, mode));
    setStep(4);
  };

  const steps = ['Datoteka', 'Poveži stupce', 'Pregled', 'Gotovo'];

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-0 sm:p-6" style={{ background: 'rgba(1,10,16,0.82)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-4xl max-h-[100vh] sm:max-h-[92vh] overflow-y-auto rounded-none sm:rounded-3xl" style={{ background: '#05202A', border: T.cardBorder, boxShadow: '0 30px 90px rgba(0,0,0,0.6)' }}>
        {/* Zaglavlje */}
        <div className="sticky top-0 z-10 px-5 sm:px-8 pt-6 pb-4" style={{ background: '#05202A', borderBottom: '1px solid rgba(120,220,255,0.1)' }}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
            <button onClick={onClose} aria-label="Zatvori" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <ol className="flex flex-wrap gap-2 mt-4">
            {steps.map((s, i) => {
              const n = i + 1; const active = n === step; const done = n < step;
              return (
                <li key={s} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: active ? 'rgba(79,195,240,0.18)' : 'transparent', border: `1px solid ${active ? '#4FC3F0' : 'rgba(255,255,255,0.12)'}`, color: active ? '#BFF3FF' : done ? '#2EE6A6' : 'rgba(255,255,255,0.5)' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px]" style={{ background: done ? '#2EE6A6' : active ? '#4FC3F0' : 'rgba(255,255,255,0.1)', color: done || active ? '#02131A' : '#fff' }}>
                    {done ? <Check className="w-3 h-3" /> : n}
                  </span>
                  {s}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="px-5 sm:px-8 py-6">
          {/* 1. DATOTEKA */}
          {step === 1 && (
            <div className="space-y-5">
              <p style={{ color: T.muted }}>
                Odaberite svoju tablicu (Excel ili CSV). Ne morate je prilagođavati: u sljedećem koraku sami povežete svoje stupce s poljima aplikacije.
              </p>
              <button
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) loadFile(f); }}
                className="w-full rounded-3xl py-14 px-6 flex flex-col items-center gap-3 transition-all hover:bg-white/5"
                style={{ border: '2px dashed rgba(79,195,240,0.45)' }}
              >
                <Upload className="w-10 h-10" style={{ color: '#4FC3F0' }} />
                <span className="text-lg font-semibold text-white">Kliknite ili povucite datoteku ovdje</span>
                <span className="text-sm" style={{ color: T.faint }}>.xlsx, .xls ili .csv</span>
              </button>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ''; }} />
              {error && <p className="text-sm p-3 rounded-xl" style={{ background: 'rgba(255,59,48,0.1)', color: '#FF6B60' }}>{error}</p>}
              <div className="rounded-2xl p-4" style={cardStyle}>
                <p className="text-sm font-semibold text-white mb-2">Polja koja aplikacija prima</p>
                <div className="flex flex-wrap gap-2">
                  {fields.map((f) => (
                    <span key={f.key} className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)' }}>
                      {f.label}{f.required ? ' *' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. POVEZIVANJE */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: T.muted }}>
                <FileSpreadsheet className="w-4 h-4" style={{ color: '#4FC3F0' }} />
                <span className="text-white font-medium">{fileName}</span>
                {workbook && workbook.SheetNames.length > 1 && (
                  <select value={sheet} onChange={(e) => { setSheet(e.target.value); setMapping([]); }}
                    className="px-3 py-1.5 rounded-lg text-white" style={{ background: T.inputBg, border: T.inputBorder }}>
                    {workbook.SheetNames.map((s) => <option key={s} value={s}>List: {s}</option>)}
                  </select>
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={hasHeader} onChange={(e) => { setHasHeader(e.target.checked); setMapping(autoMap(headers, e.target.checked)); }} />
                  Prvi redak su nazivi stupaca
                </label>
                <span>· {dataRows.length} redaka</span>
              </div>

              <p className="text-sm" style={{ color: T.muted }}>
                Za svaki stupac iz vaše tablice kliknite što on sadrži. Stupce koje ne trebate ostavite na „Ne uvozi”.
                Prepoznate stupce smo već povezali – provjerite ih.
              </p>

              <div className="space-y-3">
                {headers.map((h, i) => {
                  const samples = dataRows.slice(0, 3).map((r) => String(r[i] ?? '')).filter(Boolean);
                  const current = mapping[i] ?? IGNORE;
                  return (
                    <div key={i} className="rounded-2xl p-4" style={{ ...cardStyle, borderColor: current !== IGNORE ? 'rgba(79,195,240,0.45)' : undefined }}>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="sm:w-56 shrink-0">
                          <p className="font-semibold text-white flex items-center gap-2">
                            <Link2 className="w-4 h-4" style={{ color: current !== IGNORE ? '#4FC3F0' : 'rgba(255,255,255,0.3)' }} />{h}
                          </p>
                          <p className="text-xs mt-1 truncate" style={{ color: T.faint }}>{samples.length ? samples.join(' · ') : 'prazno'}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {fields.map((f) => {
                            const sel = current === f.key;
                            const usedElsewhere = !sel && mapping.includes(f.key);
                            return (
                              <button key={f.key} type="button" onClick={() => setField(i, sel ? IGNORE : f.key)}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                style={sel
                                  ? { background: '#4FC3F0', color: '#02131A' }
                                  : { border: '1px solid rgba(255,255,255,0.14)', color: usedElsewhere ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.85)' }}>
                                {f.label}{f.required ? ' *' : ''}
                              </button>
                            );
                          })}
                          <button type="button" onClick={() => setField(i, IGNORE)}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold"
                            style={current === IGNORE ? { background: 'rgba(255,255,255,0.18)', color: '#fff' } : { border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)' }}>
                            Ne uvozi
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {mappingProblem && (
                <p className="text-sm p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(255,176,32,0.1)', color: '#FFD27A' }}>
                  <AlertTriangle className="w-4 h-4" /> {mappingProblem}
                </p>
              )}
              <div className="flex justify-between gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-3 rounded-xl text-white" style={{ border: '1px solid rgba(255,255,255,0.15)' }}><ArrowLeft className="w-4 h-4" /> Natrag</button>
                <button disabled={!!mappingProblem} onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold disabled:opacity-40" style={{ background: T.accent, color: '#02131A' }}>
                  Pregled <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 3. PREGLED */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl p-4" style={cardStyle}><p className="text-2xl font-bold" style={{ color: '#2EE6A6' }}>{okCount - dupCount}</p><p className="text-xs" style={{ color: T.muted }}>novih</p></div>
                <div className="rounded-2xl p-4" style={cardStyle}><p className="text-2xl font-bold" style={{ color: '#4FC3F0' }}>{dupCount}</p><p className="text-xs" style={{ color: T.muted }}>već postoji</p></div>
                <div className="rounded-2xl p-4" style={cardStyle}><p className="text-2xl font-bold" style={{ color: badCount ? '#FF8A1F' : 'rgba(255,255,255,0.4)' }}>{badCount}</p><p className="text-xs" style={{ color: T.muted }}>s greškom (preskače se)</p></div>
              </div>

              {dupCount > 0 && (
                <div className="flex flex-wrap gap-2 text-sm">
                  <span style={{ color: T.muted }}>Za postojeće:</span>
                  {(['update', 'skip'] as const).map((m) => (
                    <button key={m} onClick={() => setMode(m)} className="px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={mode === m ? { background: '#4FC3F0', color: '#02131A' } : { border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                      {m === 'update' ? 'Ažuriraj podatke' : 'Preskoči'}
                    </button>
                  ))}
                </div>
              )}

              <div className="rounded-2xl overflow-x-auto" style={cardStyle}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: T.faint }}>#</th>
                      {fields.filter((f) => mapping.includes(f.key)).map((f) => (
                        <th key={f.key} className="text-left px-3 py-2 font-semibold whitespace-nowrap" style={{ color: T.faint }}>{f.label}</th>
                      ))}
                      <th className="text-left px-3 py-2 font-semibold" style={{ color: T.faint }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {converted.slice(0, 50).map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: rowStatus[i].ok ? undefined : 'rgba(255,138,31,0.08)' }}>
                        <td className="px-3 py-2" style={{ color: T.faint }}>{i + 1}</td>
                        {fields.filter((f) => mapping.includes(f.key)).map((f) => (
                          <td key={f.key} className="px-3 py-2 whitespace-nowrap text-white">{row[f.key] !== undefined ? String(row[f.key]) : <span style={{ color: 'rgba(255,255,255,0.25)' }}>–</span>}</td>
                        ))}
                        <td className="px-3 py-2 whitespace-nowrap" style={{ color: rowStatus[i].ok ? ((rowStatus[i] as any).dup ? '#4FC3F0' : '#2EE6A6') : '#FF8A1F' }}>
                          {rowStatus[i].ok ? ((rowStatus[i] as any).dup ? rowStatus[i].msg : 'U redu') : rowStatus[i].msg}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {converted.length > 50 && <p className="text-xs px-3 py-2" style={{ color: T.faint }}>Prikazano prvih 50 od {converted.length} redaka.</p>}
              </div>

              <div className="flex justify-between gap-3 pt-2">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-3 rounded-xl text-white" style={{ border: '1px solid rgba(255,255,255,0.15)' }}><ArrowLeft className="w-4 h-4" /> Promijeni povezivanje</button>
                <button disabled={okCount === 0} onClick={doImport}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold disabled:opacity-40" style={{ background: T.accent, color: '#02131A' }}>
                  Uvezi {okCount - (mode === 'skip' ? dupCount : 0)} <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 4. GOTOVO */}
          {step === 4 && result && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ background: 'rgba(46,230,166,0.15)' }}>
                <Check className="w-8 h-8" style={{ color: '#2EE6A6' }} />
              </div>
              <h3 className="text-2xl font-bold text-white">Uvoz je gotov</h3>
              <p style={{ color: T.muted }}>
                Dodano: <b className="text-white">{result.added}</b> · Ažurirano: <b className="text-white">{result.updated}</b> · Preskočeno: <b className="text-white">{result.skipped + badCount}</b>
              </p>
              <p className="text-sm" style={{ color: T.faint }}>Povezivanje stupaca je zapamćeno – sljedeći uvoz iste tablice bit će brži.</p>
              <button onClick={onClose} className="px-8 py-3 rounded-xl font-bold" style={{ background: T.accent, color: '#02131A' }}>Zatvori</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
