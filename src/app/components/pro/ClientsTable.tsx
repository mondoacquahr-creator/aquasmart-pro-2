import { useMemo, useState } from 'react';
import { Plus, Trash2, Search, MapPin, Phone, Mail, Calendar, FileText } from 'lucide-react';

// Klijenti u istom obliku kao radni nalozi: pretraga, brzi filteri, tablica (računalo) i kartice (mobitel).
// Zadnji i sljedeći servis računaju se iz radnih naloga, a ako ih nema, iz podataka klijenta.
export interface CRow { id: string; name: string; location?: string; address?: string; phone?: string; email?: string; pools?: number; lastService?: string; nextService?: string; }
interface Ord { client: string; status: string; dueDate?: string; completedAt?: string | null }

const iso = (d?: string | null) => (d && /^\d{4}-\d{2}-\d{2}/.test(d) ? d.slice(0, 10) : '');
const hr = (d: string) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d); return m ? `${m[3]}.${m[2]}.${m[1]}.` : '—'; };
const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
const selStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(120,220,255,0.14)', color: '#cfe3e8' };

export function ClientsTable<T extends CRow>({ clients, orders, onNew, onDelete, onNewOrder, actions, canCreate = true }: {
  clients: T[]; orders: Ord[]; onNew?: () => void; onDelete?: (id: string) => void; onNewOrder?: (c: T) => void;
  actions?: React.ReactNode; canCreate?: boolean;
}) {
  const [q, setQ] = useState('');
  const [f, setF] = useState<'all' | 'open' | 'week' | 'stale'>('all');

  const rows = useMemo(() => clients.map(c => {
    const mine = orders.filter(o => (o.client || '').trim().toLowerCase() === c.name.trim().toLowerCase());
    const done = mine.filter(o => o.status === 'completed').map(o => iso(o.completedAt) || iso(o.dueDate)).filter(Boolean).sort();
    const open = mine.filter(o => o.status !== 'completed');
    const nextOpen = open.map(o => iso(o.dueDate)).filter(Boolean).sort()[0] || '';
    const last = done[done.length - 1] || iso(c.lastService);
    const next = nextOpen || iso(c.nextService);
    return { c, last, next, open: open.length };
  }), [clients, orders]);

  const counts = useMemo(() => ({
    all: rows.length,
    open: rows.filter(r => r.open > 0).length,
    week: rows.filter(r => r.next && r.next >= today() && r.next <= plusDays(7)).length,
    stale: rows.filter(r => !r.next && (!r.last || r.last < plusDays(-30))).length,
  }), [rows]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows
      .filter(r => f === 'all' || (f === 'open' && r.open > 0) || (f === 'week' && r.next && r.next >= today() && r.next <= plusDays(7)) ||
        (f === 'stale' && !r.next && (!r.last || r.last < plusDays(-30))))
      .filter(r => !s || `${r.c.name} ${r.c.location || ''} ${r.c.address || ''} ${r.c.phone || ''} ${r.c.email || ''}`.toLowerCase().includes(s))
      .sort((a, b) => a.c.name.localeCompare(b.c.name, 'hr'));
  }, [rows, q, f]);

  const chip = (id: typeof f, label: string, n: number) => (
    <button key={id} type="button" onClick={() => setF(id)} className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={f === id ? { background: 'rgba(79,195,240,0.16)', border: '1px solid rgba(79,195,240,0.45)', color: '#9FE6EC' } : { border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
      {label} {n}
    </button>
  );

  const nextCell = (r: typeof rows[number]) => r.next
    ? <span style={{ color: r.next < today() ? '#FF8A80' : 'rgba(255,255,255,0.75)' }}>{hr(r.next)}{r.next < today() ? ' · kasni' : ''}</span>
    : <span style={{ color: 'rgba(255,255,255,0.35)' }}>nije zakazan</span>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">Klijenti</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {clients.length} klijenata{counts.open ? ` · ${counts.open} s otvorenim nalogom` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions}
          {canCreate && onNew && (
            <button onClick={onNew} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold" style={{ background: '#4FC3F0', color: '#04202b' }}>
              <Plus className="w-4 h-4" /><span>Novi klijent</span>
            </button>
          )}
        </div>
      </div>

      <label className="relative block max-w-xs mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Traži ime, mjesto ili telefon"
          className="w-full pl-9 pr-3 py-2 rounded-lg outline-none" style={{ ...selStyle, fontSize: 16 }} />
      </label>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {chip('all', 'Svi', counts.all)}
        {chip('open', 'Otvoreni nalog', counts.open)}
        {chip('week', 'Servis ovaj tjedan', counts.week)}
        {chip('stale', 'Bez servisa 30+ dana', counts.stale)}
      </div>

      {shown.length === 0 ? (
        <p className="text-center py-14 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {clients.length === 0 ? 'Još nema klijenata. Dodajte ih ručno ili ih uvezite iz Excela.' : 'Nijedan klijent ne odgovara pretrazi.'}
        </p>
      ) : (
        <>
          <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background: 'rgba(8,30,40,0.6)', border: '1px solid rgba(120,220,255,0.12)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  <th className="text-left font-semibold px-4 py-3">Klijent</th>
                  <th className="text-left font-semibold px-3 py-3">Kontakt</th>
                  <th className="text-left font-semibold px-3 py-3">Bazeni</th>
                  <th className="text-left font-semibold px-3 py-3">Zadnji servis</th>
                  <th className="text-left font-semibold px-3 py-3">Sljedeći</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {shown.map(r => (
                  <tr key={r.c.id} className="group hover:bg-white/[0.03]" style={{ borderTop: '1px solid rgba(120,220,255,0.07)' }}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{r.c.name}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{[r.c.address, r.c.location].filter(Boolean).join(', ') || '—'}</p>
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {r.c.phone ? <a href={`tel:${r.c.phone.replace(/\s/g, '')}`} className="block hover:underline">{r.c.phone}</a> : null}
                      {r.c.email ? <a href={`mailto:${r.c.email}`} className="block hover:underline truncate max-w-[220px]">{r.c.email}</a> : null}
                      {!r.c.phone && !r.c.email && '—'}
                    </td>
                    <td className="px-3 py-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{r.c.pools || '—'}</td>
                    <td className="px-3 py-3 whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.7)' }}>{r.last ? hr(r.last) : '—'}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {nextCell(r)}
                      {r.open > 0 && <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: 'rgba(232,180,90,0.13)', border: '1px solid rgba(232,180,90,0.38)', color: '#F0C983' }}>{r.open} otvoren{r.open === 1 ? '' : 'a'}</span>}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      {onNewOrder && <button onClick={() => onNewOrder(r.c)} className="text-xs font-semibold mr-2" style={{ color: '#4FC3F0' }}>Novi nalog</button>}
                      {onDelete && (
                        <button onClick={() => onDelete(r.c.id)} aria-label="Obriši klijenta" className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-2.5">
            {shown.map(r => (
              <div key={r.c.id} className="p-4 rounded-2xl" style={{ background: 'rgba(8,30,40,0.6)', border: '1px solid rgba(120,220,255,0.12)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{r.c.name}</p>
                    {(r.c.address || r.c.location) && <p className="text-xs truncate flex items-center gap-1 mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}><MapPin className="w-3.5 h-3.5 shrink-0" />{[r.c.address, r.c.location].filter(Boolean).join(', ')}</p>}
                  </div>
                  {r.open > 0 && <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: 'rgba(232,180,90,0.13)', border: '1px solid rgba(232,180,90,0.38)', color: '#F0C983' }}>{r.open} otvoren{r.open === 1 ? '' : 'a'}</span>}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Sljedeći: {nextCell(r)}</span>
                  {r.last && <span>Zadnji: {hr(r.last)}</span>}
                  {r.c.pools ? <span>{r.c.pools} bazen{r.c.pools === 1 ? '' : 'a'}</span> : null}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {r.c.phone && <a href={`tel:${r.c.phone.replace(/\s/g, '')}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold" style={{ border: '1px solid rgba(120,220,255,0.2)', color: '#fff' }}><Phone className="w-3.5 h-3.5" />Nazovi</a>}
                  {r.c.email && <a href={`mailto:${r.c.email}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold" style={{ border: '1px solid rgba(120,220,255,0.2)', color: '#fff' }}><Mail className="w-3.5 h-3.5" />E-mail</a>}
                  {onNewOrder && <button onClick={() => onNewOrder(r.c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold" style={{ background: 'rgba(79,195,240,0.14)', color: '#9FE6EC' }}><FileText className="w-3.5 h-3.5" />Nalog</button>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
