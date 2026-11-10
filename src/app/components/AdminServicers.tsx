import { useState, useEffect } from 'react';
import { Loader2, Search, Download, Mail, Phone, Calendar, Users, ClipboardList, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import { api, ApiErrorKind, getApiErrorKind } from '../lib/supabase';
import { authService } from '../lib/auth';
import { exportToExcel, hrDate } from '../lib/excelExport';

// Mondo admin: popis servisera (tvrtki) registriranih na Mondo Pool Care.

interface Servicer {
  id: string;
  companyName: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string | null;
  lastSignInAt?: string | null;
  trialEndsAt?: string | null;
  trialDaysLeft?: number | null;
  employeesCount: number;
  activeEmployeesCount: number;
  clientsCount: number;
  workOrdersCount: number;
}

interface Props {
  onNavigate: (page: any) => void;
  demoMode?: boolean;
}

const cardBase = { background: 'rgba(10,40,52,0.55)', border: '1px solid rgba(120,220,255,0.12)' };
const errorBox = { background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF3B30' };
const inputStyle = { background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', fontSize: '16px', outline: 'none', color: '#fff' };

function trialLabel(s: Servicer): { text: string; color: string; bg: string } {
  const d = s.trialDaysLeft;
  if (d == null) return { text: 'Probno razdoblje: nepoznato', color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.06)' };
  if (d > 7) return { text: `Probno: još ${d} dana`, color: '#2EE6A6', bg: 'rgba(46,230,166,0.1)' };
  if (d > 0) return { text: `Probno: još ${d} ${d === 1 ? 'dan' : 'dana'}`, color: '#FFB020', bg: 'rgba(255,176,32,0.12)' };
  return { text: 'Probno razdoblje isteklo', color: '#FF8A80', bg: 'rgba(255,59,48,0.1)' };
}

export function AdminServicers({ onNavigate, demoMode = false }: Props) {
  const [list, setList] = useState<Servicer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiErrorKind | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    if (demoMode) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const data = await api.get('admin/servicers');
      setList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(getApiErrorKind(err));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [demoMode]);

  const handleLogin = async () => {
    await authService.logout();
    onNavigate('login');
  };

  if (demoMode) {
    return (
      <div className="rounded-2xl p-5 text-sm" style={cardBase}>
        <p style={{ color: 'rgba(255,255,255,0.65)' }}>
          Demo način: ovdje se ne prikazuju stvarni podaci. Za popis servisera prijavite se pravim Mondo admin računom.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#5CE1E6' }} />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Učitavanje servisera...</p>
      </div>
    );
  }

  if (error) {
    const isAuth = error === 'auth';
    return (
      <div className="p-4 rounded-xl" style={errorBox}>
        <p className="text-sm font-semibold mb-2">
          {isAuth ? 'Sesija je istekla ili nemate ovlasti. Prijavite se ponovno.' : 'Podaci se trenutno ne mogu učitati. Pokušajte ponovno.'}
        </p>
        <button onClick={isAuth ? handleLogin : load} className="text-xs font-semibold hover:opacity-80" style={{ color: '#FF3B30' }}>
          {isAuth ? 'Prijava' : 'Pokušaj ponovno'}
        </button>
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const filtered = q
    ? list.filter(s => [s.companyName, s.name, s.email].some(v => String(v || '').toLowerCase().includes(q)))
    : list;
  const activeTrials = list.filter(s => (s.trialDaysLeft ?? 0) > 0).length;

  const doExport = () => exportToExcel('serviseri', 'Serviseri', list.map(s => ({
    'Tvrtka': s.companyName || '',
    'Nositelj': s.name || '',
    'E-mail': s.email || '',
    'Telefon': s.phone || '',
    'Registriran': hrDate(s.createdAt),
    'Probno razdoblje do': hrDate(s.trialEndsAt),
    'Preostalo dana': s.trialDaysLeft != null ? Math.max(s.trialDaysLeft, 0) : '',
    'Zaposlenici': s.employeesCount,
    'Aktivni zaposlenici': s.activeEmployeesCount,
    'Klijenti': s.clientsCount,
    'Radni nalozi': s.workOrdersCount,
    'Zadnja prijava': hrDate(s.lastSignInAt),
  })));

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
        <span>Ukupno: <strong className="text-white">{list.length}</strong></span>
        <span>U probnom razdoblju: <strong className="text-white">{activeTrials}</strong></span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative" style={{ flex: '999 1 260px', minWidth: 0 }}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pretraži po tvrtki, imenu ili e-mailu..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-white"
            style={inputStyle}
          />
        </div>
        <button
          onClick={doExport}
          disabled={list.length === 0}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'rgba(92,225,230,0.1)', border: '1px solid rgba(92,225,230,0.3)', color: '#5CE1E6', opacity: list.length === 0 ? 0.5 : 1 }}
        >
          <Download className="w-4 h-4" />
          Izvoz u Excel
        </button>
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {list.length === 0 ? 'Još nema registriranih servisera.' : 'Nema pronađenih servisera.'}
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((s, i) => {
          const t = trialLabel(s);
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="rounded-2xl p-4"
              style={cardBase}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 flex-shrink-0" style={{ color: '#5CE1E6' }} />
                    <p className="font-bold text-white truncate">{s.companyName || 'Tvrtka nije upisana'}</p>
                  </div>
                  {s.name && <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.name}</p>}
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ color: t.color, background: t.bg }}>
                  {t.text}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {s.email && (
                  <a href={`mailto:${s.email}`} className="flex items-center gap-1.5 hover:opacity-80">
                    <Mail className="w-3.5 h-3.5" />{s.email}
                  </a>
                )}
                {s.phone && (
                  <a href={`tel:${s.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:opacity-80">
                    <Phone className="w-3.5 h-3.5" />{s.phone}
                  </a>
                )}
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Registriran {hrDate(s.createdAt) || '—'}</span>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Zaposlenici: {s.activeEmployeesCount}/{s.employeesCount}</span>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Klijenti: {s.clientsCount}</span>
                <span className="flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5" />Radni nalozi: {s.workOrdersCount}</span>
                <span>Zadnja prijava: {hrDate(s.lastSignInAt) || '—'}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
