import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Droplets, LogOut, RefreshCw, ChevronDown, ChevronUp, Trash2, Save, CheckCircle, AlertTriangle, XCircle, Phone, MapPin, Calendar, Wrench, BarChart2, User, Home, FlaskConical, Package, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { memberApi, MemberData, MemberPool, MemberProfile, MemberVisit } from '../lib/memberApi';
import { MONDO_CONTACT } from '../lib/mondoShop';
import { authService } from '../lib/auth';
import { T } from '../lib/theme';
import { WaterBackground } from './WaterBackground';

interface MemberPortalProps {
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

type Tab = 'overview' | 'analyses' | 'pool' | 'equipment' | 'profile';

const inputStyle = {
  background: T.inputBg,
  border: T.inputBorder,
  fontSize: '16px',
  outline: 'none',
  color: '#fff',
};

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: T.cardBg, border: T.cardBorder }}>
      {children}
    </div>
  );
}

function StatusBadge({ condition }: { condition?: string }) {
  if (condition === 'ok') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(46,230,166,0.15)', color: '#2EE6A6' }}>Dobro</span>;
  if (condition === 'watch') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,176,32,0.15)', color: '#FFB020' }}>Pratiti</span>;
  if (condition === 'replace') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>Za zamjenu</span>;
  return null;
}

function pHColor(v?: number) {
  if (!v) return T.muted;
  if (v >= 7.2 && v <= 7.6) return '#2EE6A6';
  if (v >= 7.0 && v < 7.2 || v > 7.6 && v <= 7.8) return '#FFB020';
  return '#FF3B30';
}

function chlorColor(v?: number) {
  if (!v) return T.muted;
  if (v >= 1 && v <= 3) return '#2EE6A6';
  if ((v >= 0.5 && v < 1) || (v > 3 && v <= 5)) return '#FFB020';
  return '#FF3B30';
}

function alkColor(v?: number) {
  if (!v) return T.muted;
  if (v >= 80 && v <= 120) return '#2EE6A6';
  if ((v >= 60 && v < 80) || (v > 120 && v <= 150)) return '#FFB020';
  return '#FF3B30';
}

function statusColor(status?: string) {
  if (status === 'ok' || status === 'good') return '#2EE6A6';
  if (status === 'warning' || status === 'adjust') return '#FFB020';
  return '#FF3B30';
}

function formatDate(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return iso; }
}

function formatDateTime(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

// ─── MONDO CARE CARD ─────────────────────────────────────────────────────────
function MondoCareCard({ profile, pool, planActive, planValidUntil }: { profile?: MemberProfile | null; pool?: any | null; planActive?: boolean; planValidUntil?: string }) {
  const user = authService.getCurrentUser();
  const email = user?.email || '';
  const lines = [
    'Zahtjev za Mondo Care paket',
    profile?.name ? `Ime: ${profile.name}` : '',
    email ? `E-mail: ${email}` : '',
    profile?.phone ? `Telefon: ${profile.phone}` : '',
    profile?.city ? `Mjesto: ${profile.city}` : '',
    pool?.volume ? `Volumen bazena: ${pool.volume} m³` : '',
  ].filter(Boolean).join('\n');

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${MONDO_CONTACT.whatsapp}?text=${encodeURIComponent(lines)}`, '_blank', 'noopener');
  };

  const handleEmail = () => {
    window.location.href = `mailto:${MONDO_CONTACT.email}?subject=${encodeURIComponent('Mondo Care – zahtjev')}&body=${encodeURIComponent(lines)}`;
  };

  const benefits = [
    'Otvaranje i zatvaranje sezone (2 dolaska)',
    'Pregled opreme i upis stanja u Moj bazen',
    '15 % popusta na kemiju i opremu',
    'Prednost kod dogovaranja termina',
    'Savjet po svakoj analizi vode',
  ];

  if (planActive) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: T.faint }}>GODIŠNJI PAKET</p>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(46,230,166,0.15)', color: '#2EE6A6' }}>Aktivan</span>
        </div>
        <div className="flex items-end justify-between gap-4 mb-3">
          <h3 className="text-base font-bold text-white">Mondo Care</h3>
        </div>
        {planValidUntil && (
          <p className="text-sm mb-4" style={{ color: '#2EE6A6' }}>
            Aktivno do {new Date(planValidUntil).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        )}
        <ul className="space-y-2 text-sm" style={{ color: T.muted }}>
          {benefits.map(item => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2EE6A6' }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  return (
    <Card>
      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: T.faint }}>GODIŠNJI PAKET</p>
      <div className="flex items-end justify-between gap-4 mb-4">
        <h3 className="text-base font-bold text-white">Mondo Care</h3>
        <div className="text-right shrink-0">
          <p className="text-xl font-extrabold" style={{ color: T.cyan }}>199 € / godišnje</p>
          <p className="text-xs" style={{ color: T.faint }}>cijena s PDV-om</p>
        </div>
      </div>
      <ul className="space-y-2 text-sm mb-5" style={{ color: T.muted }}>
        {benefits.map(item => (
          <li key={item} className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2EE6A6' }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button
          onClick={handleWhatsApp}
          className="flex-1 py-3 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(90deg, #0ABFCF 0%, #5CE1E6 100%)' }}
        >
          Zatraži Mondo Care
        </button>
        <button
          onClick={handleEmail}
          className="px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/8"
          style={{ border: `1px solid rgba(92,225,230,0.3)`, color: T.cyan }}
        >
          E-mailom
        </button>
      </div>
      <p className="text-xs mt-3 leading-relaxed" style={{ color: T.faint }}>
        Paket aktivira Mondo Acqua nakon dogovora; popust od 15 % tada vrijedi umjesto 10 %.
      </p>
    </Card>
  );
}

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────
function OverviewTab({ data, onRequestVisit, onNewAnalysis, onNavigate }: {
  data: MemberData;
  onRequestVisit: () => void;
  onNewAnalysis: () => void;
  onNavigate: (page: string) => void;
}) {
  const latest = data.analyses[0];
  const currentVisit = data.visits[0];
  const user = authService.getCurrentUser();
  const name = user?.name || data.profile?.name || 'Korisnik';

  const v = (a: any, key: string) => (a?.values?.[key] ?? a?.[key]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Dobro došli, {name.split(' ')[0]}!</h2>

      {/* Latest analysis */}
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: T.faint }}>Zadnja analiza</p>
        {latest ? (
          <div>
            <p className="text-xs mb-3" style={{ color: T.muted }}>{formatDateTime(latest.createdAt)}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${pHColor(v(latest, 'pH'))}22`, color: pHColor(v(latest, 'pH')) }}>
                pH {v(latest, 'pH')?.toFixed(1) ?? '—'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${chlorColor(v(latest, 'freeChlorine'))}22`, color: chlorColor(v(latest, 'freeChlorine')) }}>
                Klor {v(latest, 'freeChlorine')?.toFixed(1) ?? '—'} mg/L
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${alkColor(v(latest, 'alkalinity'))}22`, color: alkColor(v(latest, 'alkalinity')) }}>
                Alk {v(latest, 'alkalinity') ?? '—'} mg/L
              </span>
            </div>
            {(v(latest, 'status') || latest.status) && (
              <p className="text-sm font-semibold" style={{ color: statusColor(v(latest, 'status') || latest.status) }}>{v(latest, 'message') || latest.message || v(latest, 'status') || latest.status}</p>
            )}
          </div>
        ) : (
          <p className="text-sm" style={{ color: T.muted }}>Još nemate spremljenih analiza.</p>
        )}
        <button
          onClick={onNewAnalysis}
          className="mt-4 w-full py-3 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(90deg, #0ABFCF 0%, #5CE1E6 100%)' }}
        >
          Nova analiza vode
        </button>
      </Card>

      {/* Visit card */}
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: T.faint }}>Pregled opreme</p>
        {currentVisit ? (
          <div>
            {currentVisit.status === 'new' && <p className="text-sm" style={{ color: T.cyan }}>Zaprimljeno – javit ćemo vam se za termin.</p>}
            {currentVisit.status === 'scheduled' && <p className="text-sm" style={{ color: '#2EE6A6' }}>Dogovoreno: {currentVisit.scheduledFor ? formatDate(currentVisit.scheduledFor) : '–'}</p>}
            {currentVisit.status === 'done' && <p className="text-sm" style={{ color: '#2EE6A6' }}>Obavljeno ✓</p>}
            {currentVisit.status === 'cancelled' && <p className="text-sm" style={{ color: '#FF3B30' }}>Otkazano</p>}
          </div>
        ) : (
          <>
            <p className="text-sm mb-4" style={{ color: T.muted }}>
              Dolazimo na vaš bazen, pregledamo pumpu, filter i dozatore te upišemo njihovo stanje. Pregled je besplatan uz kupnju od najmanje 150 € u sezoni ili uz Mondo Care; inače 49 €, koje vam vraćamo kao bon za kupnju.
            </p>
            <button
              onClick={onRequestVisit}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
              style={{ border: `1px solid ${T.cyan}`, color: T.cyan, background: 'rgba(92,225,230,0.06)' }}
            >
              Zatraži pregled
            </button>
          </>
        )}
      </Card>

      {/* Mondo Care */}
      <MondoCareCard profile={data.profile} pool={data.pool} planActive={(data as any).profile?.planActive} planValidUntil={(data as any).profile?.planValidUntil} />

      {/* Benefits */}
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: T.faint }}>Vaše pogodnosti</p>
        <ul className="space-y-2 text-sm" style={{ color: T.muted }}>
          {[
            'Povijest svih analiza vode',
            'Moj bazen s podsjetnicima',
            (data as any).profile?.planActive
              ? '15 % popusta na kemiju i opremu (+5 % iznad 2.000 €)'
              : '10 % popusta na kemiju i opremu (+5 % iznad 2.000 €)',
            'Pregled opreme na vašem bazenu (besplatan uz kupnju od 150 €)',
          ].map(b => (
            <li key={b} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2EE6A6' }} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Webshop */}
      <button
        onClick={() => onNavigate('products')}
        className="w-full py-4 rounded-2xl text-sm font-bold text-black transition-all hover:opacity-90"
        style={{ background: T.accent, boxShadow: '0 6px 20px rgba(79,195,240,0.25)' }}
      >
        {(data as any).profile?.planActive
          ? 'Webshop – 15 % popusta na kemiju i opremu (+5 % iznad 2.000 €)'
          : 'Webshop – 10 % popusta na kemiju i opremu (+5 % iznad 2.000 €)'}
      </button>
    </div>
  );
}

// ─── ANALYSES TAB ─────────────────────────────────────────────────────────────
function AnalysesTab({ data, onDeleted }: { data: MemberData; onDeleted: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const analyses = [...data.analyses].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const doDelete = async (id: string) => {
    setDeleting(true);
    try {
      await memberApi.deleteMemberAnalysis(id);
      setConfirmDelete(null);
      onDeleted();
    } catch { /* ignore */ }
    setDeleting(false);
  };

  const av = (a: any, key: string) => (a?.values?.[key] ?? a?.[key]);

  // Chart data (last 10)
  const chartData = analyses.slice(0, 10).reverse().map((a, i) => ({
    name: a.createdAt ? new Date(a.createdAt).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit' }) : `#${i + 1}`,
    pH: av(a, 'pH'),
    Klor: av(a, 'freeChlorine'),
  }));

  return (
    <div className="space-y-4">
      {analyses.length >= 2 && (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: T.faint }}>Trend (zadnjih {Math.min(10, analyses.length)})</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(10,40,52,0.95)', border: '1px solid rgba(92,225,230,0.2)', borderRadius: 10, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
              <Line type="monotone" dataKey="pH" stroke={T.cyan} strokeWidth={2} dot={{ r: 3, fill: T.cyan }} name="pH" />
              <Line type="monotone" dataKey="Klor" stroke="#2EE6A6" strokeWidth={2} dot={{ r: 3, fill: '#2EE6A6' }} name="Klor (mg/L)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {analyses.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: T.muted }}>Još nemate analiza.</p>
      )}

      {analyses.map(a => (
        <Card key={a.id}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs mb-2" style={{ color: T.faint }}>{formatDateTime(a.createdAt)}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${pHColor(av(a, 'pH'))}22`, color: pHColor(av(a, 'pH')) }}>pH {av(a, 'pH')?.toFixed(1) ?? '—'}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${chlorColor(av(a, 'freeChlorine'))}22`, color: chlorColor(av(a, 'freeChlorine')) }}>Klor {av(a, 'freeChlorine')?.toFixed(1) ?? '—'}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${alkColor(av(a, 'alkalinity'))}22`, color: alkColor(av(a, 'alkalinity')) }}>Alk {av(a, 'alkalinity') ?? '—'}</span>
              </div>
              {(av(a, 'status') || a.status) && <p className="text-xs font-semibold" style={{ color: statusColor(av(a, 'status') || a.status) }}>{av(a, 'message') || a.message || av(a, 'status') || a.status}</p>}
            </div>
            <button onClick={() => setExpanded(expanded === a.id ? null : a.id!)} className="shrink-0 p-1" style={{ color: T.faint }}>
              {expanded === a.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {expanded === a.id && a.recommendations && a.recommendations.length > 0 && (
            <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {a.recommendations.map((r, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <p className="text-sm font-semibold text-white mb-0.5">{r.productName} – {r.dosage}</p>
                  <p className="text-xs" style={{ color: T.muted }}>{r.instructions}</p>
                </div>
              ))}
            </div>
          )}

          {/* Delete */}
          <div className="mt-3 flex justify-end">
            {confirmDelete === a.id ? (
              <div className="flex items-center gap-2 text-sm">
                <span style={{ color: T.muted }}>Trajno obrisati?</span>
                <button onClick={() => doDelete(a.id!)} disabled={deleting}
                  className="px-3 py-1 rounded-lg font-semibold" style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
                  {deleting ? '...' : 'Da'}
                </button>
                <button onClick={() => setConfirmDelete(null)}
                  className="px-3 py-1 rounded-lg font-semibold" style={{ background: 'rgba(255,255,255,0.06)', color: T.muted }}>
                  Ne
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(a.id!)}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg transition-all hover:bg-red-500/10"
                style={{ color: 'rgba(255,59,48,0.7)' }}>
                <Trash2 className="w-3 h-3" /> Obriši
              </button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── POOL TAB ─────────────────────────────────────────────────────────────────
function PoolTab({ data, onSaved }: { data: MemberData; onSaved: () => void }) {
  const [form, setForm] = useState<MemberPool>(data.pool || {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setForm(data.pool || {}); }, [data.pool]);

  const f = (field: keyof MemberPool) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setForm(prev => ({ ...prev, [field]: v === '' ? undefined : (typeof prev[field] === 'number' ? parseFloat(v) || undefined : v) }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    try {
      await memberApi.saveMemberPool(form);
      setSaved(true);
      onSaved();
    } catch (err: any) {
      setError(err?.message || 'Greška pri spremanju.');
    }
    setSaving(false);
  };

  const sel = (field: keyof MemberPool, options: string[]) => (
    <select value={(form[field] as string) || ''} onChange={f(field)}
      className="w-full px-4 py-4 rounded-2xl transition-all"
      style={{ ...inputStyle }}>
      <option value="">– odaberite –</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  const inp = (field: keyof MemberPool, placeholder: string, type = 'text') => (
    <input type={type} value={(form[field] as string | number) ?? ''} onChange={f(field)}
      className="w-full px-4 py-4 rounded-2xl text-white transition-all"
      placeholder={placeholder} style={{ ...inputStyle }} />
  );

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Volumen (m³)</label>
          {inp('volume', '50', 'number')}
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Godina izgradnje</label>
          {inp('poolYear', '2010', 'number')}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Dužina (m)</label>
          {inp('length', '10', 'number')}
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Širina (m)</label>
          {inp('width', '5', 'number')}
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Dubina (m)</label>
          {inp('depth', '1.5', 'number')}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Vrsta bazena</label>
        {sel('poolType', ['Ukopani', 'Montažni', 'Keramički', 'Kompozitni', 'Betonski', 'Ostalo'])}
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Filter</label>
        {sel('filterType', ['Pješčani', 'Stakleno punjenje', 'Uložak', 'Ostalo'])}
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Punjenje filtera</label>
        <input type="text" value={form.filterMedia || ''} onChange={f('filterMedia')}
          className="w-full px-4 py-4 rounded-2xl text-white transition-all" placeholder="npr. kvarcni pijesak 0.4–0.8 mm"
          style={{ ...inputStyle }} />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Dezinfekcija</label>
        {sel('disinfection', ['Klor tablete', 'Klor granule', 'Sol / elektroliza', 'Aktivni kisik', 'UV', 'Ostalo'])}
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Grijanje</label>
        {sel('heating', ['Nema', 'Toplinska pumpa', 'Solarno', 'Izmjenjivač', 'Ostalo'])}
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Pokrivač</label>
        {sel('cover', ['Nema', 'Solarni', 'Zimski', 'Rolo', 'Ostalo'])}
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Adresa bazena</label>
        <input type="text" value={form.address || ''} onChange={f('address')}
          className="w-full px-4 py-4 rounded-2xl text-white transition-all" placeholder="Ulica i broj, Grad"
          style={{ ...inputStyle }} />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Napomena</label>
        <textarea value={form.notes || ''} onChange={f('notes')} rows={3}
          className="w-full px-4 py-4 rounded-2xl text-white transition-all resize-none" placeholder="Slobodni tekst..."
          style={{ ...inputStyle }} />
      </div>

      {error && <p className="text-sm p-3 rounded-xl" style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF3B30' }}>{error}</p>}
      {saved && <p className="text-sm p-3 rounded-xl text-center font-semibold" style={{ background: 'rgba(46,230,166,0.1)', border: '1px solid rgba(46,230,166,0.3)', color: '#2EE6A6' }}>Spremljeno ✓</p>}

      <button type="submit" disabled={saving}
        className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 text-black"
        style={{ background: 'linear-gradient(90deg, #0ABFCF 0%, #5CE1E6 100%)', opacity: saving ? 0.7 : 1 }}>
        {saving ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> Spremanje...</> : <><Save className="w-4 h-4" /> Spremi</>}
      </button>
    </form>
  );
}

// ─── EQUIPMENT TAB ────────────────────────────────────────────────────────────
function EquipmentTab({ data, onRequestVisit }: { data: MemberData; onRequestVisit: () => void }) {
  const equipment = data.equipment || [];

  if (equipment.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <Wrench className="w-12 h-12 mx-auto" style={{ color: T.faint }} />
        <p className="text-sm" style={{ color: T.muted }}>Nakon pregleda ovdje ćete vidjeti stanje svoje opreme.</p>
        <button onClick={onRequestVisit}
          className="px-6 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
          style={{ border: `1px solid ${T.cyan}`, color: T.cyan, background: 'rgba(92,225,230,0.06)' }}>
          Zatraži pregled
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {equipment.map(eq => (
        <Card key={eq.id}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="font-semibold text-white">{eq.type}</p>
              {(eq.brand || eq.model) && <p className="text-sm" style={{ color: T.muted }}>{[eq.brand, eq.model].filter(Boolean).join(' ')}</p>}
            </div>
            <StatusBadge condition={eq.condition} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: T.faint }}>
            {eq.year && <span>Godina: {eq.year}{eq.year ? ` (${new Date().getFullYear() - eq.year} god.)` : ''}</span>}
            {eq.inspectedAt && <span>Pregled: {formatDate(eq.inspectedAt)}</span>}
          </div>
          {eq.notes && <p className="mt-2 text-xs" style={{ color: T.muted }}>{eq.notes}</p>}
        </Card>
      ))}
    </div>
  );
}

// ─── PROFILE TAB ─────────────────────────────────────────────────────────────
function ProfileTab({ data, onSaved, onLogout, onDeleted }: {
  data: MemberData;
  onSaved: () => void;
  onLogout: () => void;
  onDeleted: () => void;
}) {
  const user = authService.getCurrentUser();
  const [form, setForm] = useState<MemberProfile>({
    name: user?.name || data.profile?.name || '',
    phone: data.profile?.phone || '',
    city: data.profile?.city || '',
    address: data.profile?.address || '',
    marketing: data.profile?.marketing ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setProfileError(''); setSaved(false);
    try {
      await memberApi.saveMemberProfile(form);
      setSaved(true);
      onSaved();
    } catch (err: any) {
      setProfileError(err?.message || 'Greška pri spremanju.');
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await memberApi.deleteMemberAccount();
      onLogout();
    } catch { /* ignore */ }
    setDeletingAccount(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Ime i prezime</label>
        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-4 rounded-2xl text-white transition-all" placeholder="Ivan Horvat"
          style={{ ...inputStyle }} />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Telefon</label>
        <input type="tel" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })}
          className="w-full px-4 py-4 rounded-2xl text-white transition-all" placeholder="+385 91 234 5678"
          style={{ ...inputStyle }} />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Mjesto</label>
        <input type="text" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })}
          className="w-full px-4 py-4 rounded-2xl text-white transition-all" placeholder="Zagreb"
          style={{ ...inputStyle }} />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: T.faint }}>Adresa</label>
        <input type="text" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })}
          className="w-full px-4 py-4 rounded-2xl text-white transition-all" placeholder="Ulica i broj"
          style={{ ...inputStyle }} />
      </div>
      <label className="flex items-center gap-3 cursor-pointer py-2">
        <div className="relative shrink-0">
          <input type="checkbox" checked={!!form.marketing} onChange={e => setForm({ ...form, marketing: e.target.checked })} className="sr-only" />
          <div className="w-5 h-5 rounded-md border flex items-center justify-center transition-all"
            style={{ background: form.marketing ? T.cyan : 'transparent', borderColor: form.marketing ? T.cyan : 'rgba(92,225,230,0.3)' }}>
            {form.marketing && <CheckCircle className="w-3 h-3 text-black" />}
          </div>
        </div>
        <span className="text-sm" style={{ color: T.muted }}>Želim primati ponude i podsjetnike e-mailom</span>
      </label>

      {profileError && <p className="text-sm p-3 rounded-xl" style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF3B30' }}>{profileError}</p>}
      {saved && <p className="text-sm p-3 rounded-xl text-center font-semibold" style={{ background: 'rgba(46,230,166,0.1)', border: '1px solid rgba(46,230,166,0.3)', color: '#2EE6A6' }}>Spremljeno ✓</p>}

      <button type="submit" disabled={saving}
        className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 text-black"
        style={{ background: 'linear-gradient(90deg, #0ABFCF 0%, #5CE1E6 100%)', opacity: saving ? 0.7 : 1 }}>
        {saving ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> Spremanje...</> : <><Save className="w-4 h-4" /> Spremi profil</>}
      </button>

      {/* Danger zone */}
      <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,59,48,0.15)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,59,48,0.6)' }}>Zona opasnosti</p>
        {confirmDeleteAccount ? (
          <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.25)' }}>
            <p className="text-sm font-semibold" style={{ color: '#FF3B30' }}>Trajno brisanje svih podataka?</p>
            <div className="flex gap-2">
              <button type="button" onClick={handleDeleteAccount} disabled={deletingAccount}
                className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'rgba(255,59,48,0.2)', color: '#FF3B30' }}>
                {deletingAccount ? '...' : 'Da, obriši'}
              </button>
              <button type="button" onClick={() => setConfirmDeleteAccount(false)}
                className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', color: T.muted }}>
                Ne
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmDeleteAccount(true)}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ border: '1px solid rgba(255,59,48,0.3)', color: 'rgba(255,59,48,0.7)', background: 'transparent' }}>
            Obriši račun i sve podatke
          </button>
        )}
      </div>
    </form>
  );
}

// ─── VISIT MODAL ──────────────────────────────────────────────────────────────
function VisitModal({ data, onClose, onSuccess }: { data: MemberData; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    phone: data.profile?.phone || '',
    address: data.pool?.address || data.profile?.address || '',
    city: data.pool?.address ? '' : (data.profile?.city || ''),
    preferred: '',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim()) { setError('Telefon je obavezan.'); return; }
    setError(''); setSubmitting(true);
    try {
      await memberApi.requestFreeVisit({ phone: form.phone, address: form.address || undefined, city: form.city || undefined, preferred: form.preferred || undefined, note: form.note || undefined });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Greška pri slanju zahtjeva.');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl p-6 space-y-4"
        style={{ background: 'rgba(6,25,34,0.97)', border: T.cardBorder, boxShadow: T.cardShadow }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Zahtjev za pregled opreme</h3>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ color: T.faint }}>
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#2EE6A6' }} />
            <p className="text-sm font-semibold" style={{ color: '#2EE6A6' }}>Zahtjev je poslan. Javit ćemo vam se za termin.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: T.faint }}>Telefon *</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-white" placeholder="+385 91 234 5678"
                style={{ ...inputStyle }} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: T.faint }}>Adresa bazena</label>
              <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-white" placeholder="Ulica i broj"
                style={{ ...inputStyle }} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: T.faint }}>Mjesto</label>
              <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-white" placeholder="Zagreb"
                style={{ ...inputStyle }} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: T.faint }}>Željeni termin</label>
              <input type="text" value={form.preferred} onChange={e => setForm({ ...form, preferred: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-white" placeholder="npr. radnim danom poslijepodne"
                style={{ ...inputStyle }} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: T.faint }}>Napomena</label>
              <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} rows={2}
                className="w-full px-4 py-3 rounded-xl text-white resize-none" placeholder="Slobodni tekst"
                style={{ ...inputStyle }} />
            </div>

            {error && <p className="text-sm p-3 rounded-xl" style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF3B30' }}>{error}</p>}

            <p className="text-xs leading-relaxed" style={{ color: T.faint }}>
              Besplatno uz kupnju od najmanje 150 € u sezoni ili uz Mondo Care; inače 49 € (vraćamo kao bon za kupnju). Uvjete potvrđujemo pri dogovoru termina.
            </p>

            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-black transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, #0ABFCF 0%, #5CE1E6 100%)', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> Slanje...</> : 'Pošalji zahtjev'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function MemberPortal({ onLogout, onNavigate }: MemberPortalProps) {
  const [tab, setTab] = useState<Tab>('overview');
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior }); }, [tab]);
  const [data, setData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showVisitModal, setShowVisitModal] = useState(false);

  const user = authService.getCurrentUser();

  const load = async () => {
    setLoading(true); setError('');
    try {
      const d = await memberApi.getMemberMe();
      setData(d);
      try {
        localStorage.setItem('memberPlan', (d as any).profile?.planActive ? 'care' : 'free');
      } catch { /* ignore */ }
    } catch (err: any) {
      setError(err?.message || 'Greška pri učitavanju podataka.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Pregled', icon: Home },
    { id: 'analyses', label: 'Analize', icon: FlaskConical },
    { id: 'pool', label: 'Moj bazen', icon: Droplets },
    { id: 'equipment', label: 'Oprema', icon: Wrench },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: T.pageBg }}>
      <WaterBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-20 backdrop-blur-xl" style={{ background: 'rgba(4,24,32,0.85)', borderBottom: '1px solid rgba(92,225,230,0.1)' }}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #0ABFCF 0%, #5CE1E6 100%)' }}>
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.cyan }}>Moj bazen</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white leading-tight">{user?.name || data?.profile?.name || 'Vlasnik bazena'}</p>
                  {(data as any)?.profile?.planActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(46,230,166,0.15)', color: '#2EE6A6' }}>Mondo Care</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: T.muted }}>
              <LogOut className="w-4 h-4" /> Odjava
            </button>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto scrollbar-none gap-1 px-4 pb-3" style={{ scrollbarWidth: 'none' }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all"
                style={tab === t.id
                  ? { background: 'rgba(92,225,230,0.15)', color: T.cyan, border: '1px solid rgba(92,225,230,0.3)' }
                  : { color: 'rgba(255,255,255,0.45)', border: '1px solid transparent' }
                }
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(92,225,230,0.2)', borderTopColor: T.cyan }}></div>
              <p className="text-sm" style={{ color: T.muted }}>Učitavanje…</p>
            </div>
          )}

          {!loading && error && (
            <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF3B30' }}>
              <p className="text-sm font-semibold mb-2">{error}</p>
              <button onClick={load} className="flex items-center gap-1 text-xs font-semibold hover:opacity-80" style={{ color: '#FF3B30' }}>
                <RefreshCw className="w-3 h-3" /> Pokušaj ponovno
              </button>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {tab === 'overview' && (
                <OverviewTab
                  data={data}
                  onRequestVisit={() => setShowVisitModal(true)}
                  onNewAnalysis={() => onNavigate('analysis')}
                  onNavigate={onNavigate}
                />
              )}
              {tab === 'analyses' && <AnalysesTab data={data} onDeleted={load} />}
              {tab === 'pool' && <PoolTab data={data} onSaved={load} />}
              {tab === 'equipment' && <EquipmentTab data={data} onRequestVisit={() => setShowVisitModal(true)} />}
              {tab === 'profile' && <ProfileTab data={data} onSaved={load} onLogout={onLogout} onDeleted={load} />}
            </>
          )}
        </div>
      </div>

      {showVisitModal && data && (
        <VisitModal data={data} onClose={() => setShowVisitModal(false)} onSuccess={load} />
      )}
    </div>
  );
}
