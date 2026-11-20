import { useMemo, useState } from 'react';
import { Plus, Trash2, Search, MapPin, Calendar, UserCog } from 'lucide-react';

// Radni nalozi: filteri (status, serviser, datum), brojači po statusu i tablica.
// Na mobitelu iste stavke kao kompaktne kartice.
type Status = 'active' | 'pending' | 'completed';
export interface WOrow { id: number | string; client: string; location: string; task: string; status: Status; assignee: string; dueDate: string; }

export const STATUS_LABEL: Record<Status, string> = { pending: 'Novi', active: 'U tijeku', completed: 'Završeno' };
export const STATUS_STYLE: Record<Status, { bg: string; bd: string; fg: string }> = {
  pending: { bg: 'rgba(79,195,240,0.14)', bd: 'rgba(79,195,240,0.38)', fg: '#9FE6EC' },
  active: { bg: 'rgba(232,180,90,0.13)', bd: 'rgba(232,180,90,0.38)', fg: '#F0C983' },
  completed: { bg: 'rgba(95,211,166,0.12)', bd: 'rgba(95,211,166,0.34)', fg: '#8FE3C2' },
};

export function StatusChip({ status }: { status: Status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  return <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap" style={{ background: s.bg, border: `1px solid ${s.bd}`, color: s.fg }}>{STATUS_LABEL[status] || status}</span>;
}

const hrDate = (d: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || '');
  return m ? `${m[3]}.${m[2]}.` : d || '—';
};
const today = () => new Date().toISOString().slice(0, 10);
const weekBounds = () => {
  const now = new Date(); const day = (now.getDay() + 6) % 7;
  const start = new Date(now); start.setDate(now.getDate() - day);
  const end = new Date(start); end.setDate(start.getDate() + 6);
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)];
};

const selStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(120,220,255,0.14)', color: '#cfe3e8' };

export function WorkOrdersTable<T extends WOrow>({ orders, onOpen, onDelete, onNew, canCreate = true, canDelete = true, showAssignee = true }: {
  orders: T[]; onOpen: (o: T) => void; onDelete?: (id: T['id']) => void; onNew?: () => void;
  canCreate?: boolean; canDelete?: boolean; showAssignee?: boolean;
}) {
  const [status, setStatus] = useState<'all' | Status>('all');
  const [who, setWho] = useState('all');
  const [when, setWhen] = useState<'all' | 'today' | 'week' | 'late'>('all');
  const [q, setQ] = useState('');

  const assignees = useMemo(() => Array.from(new Set(orders.map(o => o.assignee).filter(Boolean))).sort(), [orders]);

  const base = useMemo(() => {
    const t = today(); const [ws, we] = weekBounds(); const s = q.trim().toLowerCase();
    return orders.filter(o =>
      (who === 'all' || o.assignee === who) &&
      (when === 'all' || (when === 'today' && o.dueDate === t) || (when === 'week' && o.dueDate >= ws && o.dueDate <= we) ||
        (when === 'late' && o.status !== 'completed' && o.dueDate && o.dueDate < t)) &&
      (!s || `${o.client} ${o.location} ${o.task} ${o.assignee}`.toLowerCase().includes(s)));
  }, [orders, who, when, q]);

  const counts = useMemo(() => ({
    all: base.length,
    pending: base.filter(o => o.status === 'pending').length,
    active: base.filter(o => o.status === 'active').length,
    completed: base.filter(o => o.status === 'completed').length,
  }), [base]);

  const rows = useMemo(() => base
    .filter(o => status === 'all' || o.status === status)
    .sort((a, b) => (a.status === 'completed' ? 1 : 0) - (b.status === 'completed' ? 1 : 0) || String(a.dueDate).localeCompare(String(b.dueDate))),
  [base, status]);

  const chip = (id: 'all' | Status, label: string, n: number) => {
    const on = status === id; const st = id === 'all' ? null : STATUS_STYLE[id];
    return (
      <button key={id} type="button" onClick={() => setStatus(id)}
        className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors"
        style={on
          ? { background: st ? st.bg : 'rgba(79,195,240,0.16)', border: `1px solid ${st ? st.bd : 'rgba(79,195,240,0.45)'}`, color: st ? st.fg : '#9FE6EC' }
          : { border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
        {label} {n}
      </button>
    );
  };

  const now = new Date();
  const subtitle = `${now.toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' })} · ${orders.filter(o => o.status !== 'completed').length} otvorenih naloga`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">Radni nalozi</h2>
          <p className="text-sm mt-1 first-letter:uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>{subtitle}</p>
        </div>
        {canCreate && onNew && (
          <button onClick={onNew} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold shrink-0" style={{ background: '#4FC3F0', color: '#04202b' }}>
            <Plus className="w-4 h-4" /><span>Novi nalog</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <label className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Traži klijenta ili mjesto"
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none" style={{ ...selStyle, fontSize: 16 }} />
        </label>
        <select value={when} onChange={e => setWhen(e.target.value as any)} className="px-3 py-2 rounded-lg text-sm" style={selStyle} aria-label="Datum">
          <option value="all">Datum: svi</option><option value="today">Danas</option><option value="week">Ovaj tjedan</option><option value="late">Kasne</option>
        </select>
        {showAssignee && (
          <select value={who} onChange={e => setWho(e.target.value)} className="px-3 py-2 rounded-lg text-sm" style={selStyle} aria-label="Serviser">
            <option value="all">Serviser: svi</option>
            {assignees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        )}
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {chip('all', 'Svi', counts.all)}
        {chip('pending', 'Novi', counts.pending)}
        {chip('active', 'U tijeku', counts.active)}
        {chip('completed', 'Završeno', counts.completed)}
      </div>

      {rows.length === 0 ? (
        <p className="text-center py-14 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {orders.length === 0 ? 'Još nema radnih naloga.' : 'Nijedan nalog ne odgovara filterima.'}
        </p>
      ) : (
        <>
          {/* Računalo: tablica */}
          <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background: 'rgba(8,30,40,0.6)', border: '1px solid rgba(120,220,255,0.12)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  <th className="text-left font-semibold px-4 py-3">Klijent</th>
                  <th className="text-left font-semibold px-3 py-3">Adresa</th>
                  <th className="text-left font-semibold px-3 py-3">Termin</th>
                  {showAssignee && <th className="text-left font-semibold px-3 py-3">Serviser</th>}
                  <th className="text-left font-semibold px-3 py-3">Status</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map(o => {
                  const late = o.status !== 'completed' && o.dueDate && o.dueDate < today();
                  return (
                    <tr key={o.id} onClick={() => onOpen(o)} className="group cursor-pointer hover:bg-white/[0.03]" style={{ borderTop: '1px solid rgba(120,220,255,0.07)' }}>
                      <td className="px-4 py-3"><p className="font-semibold text-white">{o.client || '—'}</p><p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{o.task}</p></td>
                      <td className="px-3 py-3" style={{ color: 'rgba(255,255,255,0.65)' }}>{o.location || '—'}</td>
                      <td className="px-3 py-3 whitespace-nowrap" style={{ color: late ? '#FF8A80' : 'rgba(255,255,255,0.65)' }}>{hrDate(o.dueDate)}{late ? ' · kasni' : ''}</td>
                      {showAssignee && <td className="px-3 py-3" style={{ color: 'rgba(255,255,255,0.65)' }}>{o.assignee || '—'}</td>}
                      <td className="px-3 py-3"><StatusChip status={o.status} /></td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold mr-2" style={{ color: '#4FC3F0' }}>Otvori</span>
                        {canDelete && onDelete && (
                          <button onClick={e => { e.stopPropagation(); onDelete(o.id); }} aria-label="Obriši nalog" className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobitel: kompaktne kartice */}
          <div className="md:hidden space-y-2.5">
            {rows.map(o => {
              const late = o.status !== 'completed' && o.dueDate && o.dueDate < today();
              return (
                <button key={o.id} type="button" onClick={() => onOpen(o)} className="w-full text-left p-4 rounded-2xl"
                  style={{ background: 'rgba(8,30,40,0.6)', border: '1px solid rgba(120,220,255,0.12)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{o.client || '—'}</p>
                      <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{o.task}</p>
                    </div>
                    <StatusChip status={o.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {o.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{o.location}</span>}
                    <span className="flex items-center gap-1" style={{ color: late ? '#FF8A80' : undefined }}><Calendar className="w-3.5 h-3.5" />{hrDate(o.dueDate)}{late ? ' · kasni' : ''}</span>
                    {showAssignee && o.assignee && <span className="flex items-center gap-1"><UserCog className="w-3.5 h-3.5" />{o.assignee}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
