import { useState, useEffect, useRef } from 'react';
import { POWER_TYPES, KW_ONLY_TYPES, CAPACITY_TYPES, equipmentSpec } from '../lib/equipmentSpec';
import { Loader2, Search, ArrowLeft, Phone, MapPin, Calendar, Wrench, ChevronDown, ChevronUp, Trash2, Plus, X, Image as ImageIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { T } from '../lib/theme';
import { adminMembersApi, AdminMember, AdminMemberDetail, VisitRequest, EquipmentReportItem } from '../lib/adminMembersApi';
import { api, ApiErrorKind, getApiErrorKind } from '../lib/supabase';
import { authService } from '../lib/auth';

interface AdminMembersProps {
  onNavigate: (page: any) => void;
  demoMode?: boolean;
}

type SubTab = 'members' | 'visits' | 'report';
type VisitFilter = 'new' | 'scheduled' | 'done' | 'all';

const cardBase = { background: 'rgba(10,40,52,0.55)', border: '1px solid rgba(120,220,255,0.12)' };
const errorBox = { background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF3B30' };
const inputStyle = { background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', fontSize: '16px', outline: 'none', color: '#fff' };
const DEMO_MESSAGE = 'Demo način: ovdje se ne prikazuju stvarni podaci. Za narudžbe, članove i zahtjeve prijavite se pravim Mondo admin računom.';

function DemoInfoCard() {
  return (
    <div className="rounded-2xl p-5 text-sm" style={cardBase}>
      <p style={{ color: 'rgba(255,255,255,0.65)' }}>{DEMO_MESSAGE}</p>
    </div>
  );
}

function AdminErrorCard({ kind, onRetry, onLogin }: {
  kind: ApiErrorKind;
  onRetry: () => void;
  onLogin: () => void;
}) {
  const isAuth = kind === 'auth';
  return (
    <div className="p-4 rounded-xl" style={errorBox}>
      <p className="text-sm font-semibold mb-2">
        {isAuth
          ? 'Sesija je istekla ili nemate ovlasti. Prijavite se ponovno.'
          : 'Podaci se trenutno ne mogu učitati. Pokušajte ponovno.'}
      </p>
      <button onClick={isAuth ? onLogin : onRetry} className="text-xs font-semibold hover:opacity-80" style={{ color: '#FF3B30' }}>
        {isAuth ? 'Prijava' : 'Pokušaj ponovno'}
      </button>
    </div>
  );
}

function pHColor(v?: number) {
  if (!v) return T.muted;
  if (v >= 7.2 && v <= 7.6) return '#2EE6A6';
  if ((v >= 7.0 && v < 7.2) || (v > 7.6 && v <= 7.8)) return '#FFB020';
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

function ConditionBadge({ condition }: { condition?: string }) {
  if (condition === 'ok') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(46,230,166,0.15)', color: '#2EE6A6' }}>Dobro</span>;
  if (condition === 'watch') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,176,32,0.15)', color: '#FFB020' }}>Pratiti</span>;
  if (condition === 'replace') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>Za zamjenu</span>;
  return null;
}

function fmtDate(iso?: string) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return iso; }
}
function fmtDateTime(iso?: string) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return iso; }
}

const EQUIPMENT_TYPES = ['Pumpa', 'Filter', 'Dozirna pumpa pH', 'Dozirna pumpa klor', 'Elektroliza', 'Toplinska pumpa', 'Rasvjeta', 'Robot', 'Ostalo'];
const CONDITIONS = [{ value: 'ok', label: 'Dobro' }, { value: 'watch', label: 'Pratiti' }, { value: 'replace', label: 'Za zamjenu' }];
const today = () => new Date().toISOString().slice(0, 10);

// ─── EQUIPMENT FORM ───────────────────────────────────────────────────────────
function EquipmentForm({
  memberId,
  initial,
  onSaved,
  onCancel,
  onLogin,
}: {
  memberId: string;
  initial?: any;
  onSaved: () => void;
  onCancel: () => void;
  onLogin: () => void;
}) {
  const [form, setForm] = useState({
    id: initial?.id || undefined,
    type: initial?.type || 'Pumpa',
    brand: initial?.brand || '',
    model: initial?.model || '',
    year: initial?.year ? String(initial.year) : '',
    condition: initial?.condition || 'ok',
    notes: initial?.notes || '',
    power: initial?.power ? String(initial.power) : '',
    powerUnit: (initial?.powerUnit as 'kW' | 'HP') || 'kW',
    capacity: initial?.capacity ? String(initial.capacity) : '',
    inspectedAt: initial?.inspectedAt ? initial.inspectedAt.slice(0, 10) : today(),
    photos: (initial?.photos || []) as string[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<ApiErrorKind | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    form.photos.forEach(async (path) => {
      if (!photoUrls[path]) {
        try {
          const res: any = await api.getImageUrl(path);
          const url = res?.url ?? res?.signedUrl ?? res;
          if (typeof url === 'string') setPhotoUrls(prev => ({ ...prev, [path]: url }));
        } catch { /* ignore */ }
      }
    });
  }, [form.photos]);

  const handleUpload = async (file: File) => {
    if (form.photos.length >= 6) return;
    setUploadingCount(c => c + 1);
    try {
      const res: any = await api.uploadImage(file);
      const path = res?.path ?? res?.storagePath ?? res?.url ?? res;
      if (typeof path === 'string') {
        setForm(p => ({ ...p, photos: [...p.photos, path] }));
      }
    } catch (err: any) {
      setError(getApiErrorKind(err));
    } finally {
      setUploadingCount(c => c - 1);
    }
  };

  const removePhoto = (idx: number) => {
    setForm(p => ({ ...p, photos: p.photos.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await adminMembersApi.saveMemberEquipment(memberId, {
        ...form,
        year: form.year ? Number(form.year) : undefined,
        power: form.power && POWER_TYPES.includes(form.type) ? Number(form.power.replace(',', '.')) : undefined,
        powerUnit: KW_ONLY_TYPES.includes(form.type) ? 'kW' : form.powerUnit,
        capacity: form.capacity && CAPACITY_TYPES.includes(form.type) ? Number(form.capacity.replace(',', '.')) : undefined,
      });
      onSaved();
    } catch (err: any) {
      setError(getApiErrorKind(err));
    }
    setSaving(false);
  };

  return (
    <div className="rounded-2xl p-5 space-y-4" style={cardBase}>
      <div className="flex items-center justify-between mb-1">
        <p className="font-bold text-white">{initial ? 'Uredi opremu' : 'Dodaj opremu'}</p>
        <button onClick={onCancel} className="p-1 rounded-lg hover:bg-white/5"><X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} /></button>
      </div>

      <div>
        <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Vrsta</label>
        <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl text-white" style={{ ...inputStyle, background: 'rgba(2,13,18,0.8)' }}>
          {EQUIPMENT_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Marka</label>
          <input type="text" value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-white" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Model</label>
          <input type="text" value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-white" style={inputStyle} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Godina</label>
          <input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-white" placeholder="2020" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Stanje</label>
          <select value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-white" style={{ ...inputStyle, background: 'rgba(2,13,18,0.8)' }}>
            {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {POWER_TYPES.includes(form.type) && (
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Snaga {KW_ONLY_TYPES.includes(form.type) ? '(kW)' : ''}
          </label>
          <div className="flex gap-2">
            <input type="number" step="0.01" value={form.power} onChange={e => setForm(p => ({ ...p, power: e.target.value }))}
              className="flex-1 min-w-0 px-4 py-3 rounded-xl text-white" placeholder={form.type === 'Toplinska pumpa' ? 'npr. 12' : 'npr. 0.75'} style={inputStyle} />
            {!KW_ONLY_TYPES.includes(form.type) && (
              <select value={form.powerUnit} onChange={e => setForm(p => ({ ...p, powerUnit: e.target.value as 'kW' | 'HP' }))}
                className="px-3 py-3 rounded-xl text-white" style={{ ...inputStyle, background: 'rgba(2,13,18,0.8)', width: 86 }}>
                <option value="kW">kW</option>
                <option value="HP">KS</option>
              </select>
            )}
          </div>
        </div>
      )}
      {CAPACITY_TYPES.includes(form.type) && (
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Punjenje filtera (kg)</label>
          <input type="number" step="1" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-white" placeholder="npr. 75" style={inputStyle} />
        </div>
      )}

      <div>
        <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Napomena</label>
        <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2}
          className="w-full px-4 py-3 rounded-xl text-white resize-none" style={inputStyle} />
      </div>

      <div>
        <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Datum pregleda</label>
        <input type="date" value={form.inspectedAt} onChange={e => setForm(p => ({ ...p, inspectedAt: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl text-white" style={{ ...inputStyle, colorScheme: 'dark' }} />
      </div>

      {/* Photos */}
      <div>
        <label className="text-xs font-semibold mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Fotografije ({form.photos.length}/6)
        </label>
        <div className="flex flex-wrap gap-2">
          {form.photos.map((path, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              {photoUrls[path] ? (
                <img src={photoUrls[path]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <ImageIcon className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />
                </div>
              )}
              <button onClick={() => removePhoto(i)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {uploadingCount > 0 && (
            <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5CE1E6' }} />
            </div>
          )}
          {form.photos.length < 6 && (
            <label className="w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0 hover:bg-white/5 transition-colors"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.15)' }}>
              <Plus className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </label>
          )}
        </div>
      </div>

      {error && <AdminErrorCard kind={error} onRetry={handleSave} onLogin={onLogin} />}

      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
        style={{ background: T.accent, color: '#000', opacity: saving ? 0.7 : 1 }}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
        Spremi
      </button>
    </div>
  );
}

// ─── MEMBER DETAIL ────────────────────────────────────────────────────────────
function MemberDetail({ memberId, onBack, onNavigate, onLogin }: { memberId: string; onBack: () => void; onNavigate: (page: any) => void; onLogin: () => void }) {
  const [detail, setDetail] = useState<AdminMemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiErrorKind | null>(null);
  const [careDateInput, setCareDateInput] = useState('');
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<ApiErrorKind | null>(null);
  const [editingEq, setEditingEq] = useState<any | null>(null);
  const [addingEq, setAddingEq] = useState(false);
  const [deleteEqId, setDeleteEqId] = useState<string | null>(null);
  const [deletingEq, setDeletingEq] = useState(false);
  const [photoUrlCache, setPhotoUrlCache] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const d = await adminMembersApi.getAdminMember(memberId);
      setDetail(d);
    } catch (err: any) {
      setError(getApiErrorKind(err));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [memberId]);

  useEffect(() => {
    if (!detail) return;
    const allPhotos = (detail.equipment || []).flatMap((eq: any) => eq.photos || []);
    allPhotos.forEach(async (path: string) => {
      if (!photoUrlCache[path]) {
        try {
          const res: any = await api.getImageUrl(path);
          const url = res?.url ?? res?.signedUrl ?? res;
          if (typeof url === 'string') setPhotoUrlCache(prev => ({ ...prev, [path]: url }));
        } catch { /* ignore */ }
      }
    });
  }, [detail]);

  const handleSetPlan = async (plan: 'care' | 'free') => {
    setPlanError(null);
    setPlanLoading(true);
    try {
      await adminMembersApi.setMemberPlan(memberId, plan, plan === 'care' && careDateInput ? careDateInput : undefined);
      await load();
    } catch (err: any) {
      setPlanError(getApiErrorKind(err));
    }
    setPlanLoading(false);
  };

  const handleDeleteEq = async (eqId: string) => {
    setDeletingEq(true);
    try {
      await adminMembersApi.deleteMemberEquipment(memberId, eqId);
      setDeleteEqId(null);
      await load();
    } catch (err: any) {
      setError(getApiErrorKind(err));
    }
    setDeletingEq(false);
  };

  const av = (a: any, key: string) => (a?.values?.[key] ?? a?.[key]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#5CE1E6' }} />
      <p style={{ color: 'rgba(255,255,255,0.3)' }}>Učitavam...</p>
    </div>
  );
  if (error) return (
    <AdminErrorCard kind={error} onRetry={load} onLogin={onLogin} />
  );
  if (!detail) return null;

  const profile = detail.profile || {};
  const pool = detail.pool || {};
  const analyses = (detail.analyses || []).slice(0, 10);
  const visits = detail.visits || [];
  const equipment = detail.equipment || [];
  const planActive = profile.planActive;
  const planValidUntil = profile.planValidUntil;

  const poolFields = [
    { label: 'Volumen', value: pool.volume != null ? `${pool.volume} m³` : undefined },
    { label: 'Dimenzije', value: [pool.length, pool.width, pool.depth].filter(Boolean).map(String).join(' × ') || undefined },
    { label: 'Tip', value: pool.poolType },
    { label: 'Filter', value: [pool.filterType, pool.filterMedia].filter(Boolean).join(', ') || undefined },
    { label: 'Dezinfekcija', value: pool.disinfection },
    { label: 'Godina izgradnje', value: pool.poolYear ? String(pool.poolYear) : undefined },
    { label: 'Grijanje', value: pool.heating },
    { label: 'Pokrivalo', value: pool.cover },
    { label: 'Adresa bazena', value: pool.address },
    { label: 'Napomene', value: pool.notes },
  ].filter(f => f.value);

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold transition-all hover:opacity-80" style={{ color: '#5CE1E6' }}>
        <ArrowLeft className="w-4 h-4" /> Natrag na popis
      </button>

      {/* Header */}
      <div className="rounded-2xl p-5 space-y-2" style={cardBase}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-white">{profile.name || '—'}</h2>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{profile.email}</p>
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className="text-sm flex items-center gap-1 mt-1 hover:underline" style={{ color: '#5CE1E6' }}>
                <Phone className="w-3.5 h-3.5" /> {profile.phone}
              </a>
            )}
            {profile.city && <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{profile.city}</p>}
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>od {fmtDate(profile.createdAt)}</p>
        </div>

        {/* Mondo Care */}
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {planActive ? (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#2EE6A6' }}>Mondo Care aktivan</p>
                {planValidUntil && <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>do {fmtDate(planValidUntil)}</p>}
              </div>
              <button onClick={() => handleSetPlan('free')} disabled={planLoading}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,59,48,0.1)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.3)' }}>
                {planLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Isključi Mondo Care'}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Mondo Care neaktivan</p>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex-1 min-w-0">
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Vrijedi do (prazno = 1 godina)</label>
                  <input type="date" value={careDateInput} onChange={e => setCareDateInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-white" style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
                <button onClick={() => handleSetPlan('care')} disabled={planLoading}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all mt-5"
                  style={{ background: 'rgba(46,230,166,0.15)', color: '#2EE6A6', border: '1px solid rgba(46,230,166,0.3)' }}>
                  {planLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Uključi Mondo Care'}
                </button>
              </div>
            </div>
          )}
          {planError && <div className="mt-3"><AdminErrorCard kind={planError} onRetry={load} onLogin={onLogin} /></div>}
        </div>
      </div>

      {/* Bazen */}
      {poolFields.length > 0 && (
        <div className="rounded-2xl p-5 space-y-2" style={cardBase}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Bazen</p>
          {poolFields.map(f => (
            <div key={f.label} className="flex justify-between gap-4 text-sm">
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>{f.label}</span>
              <span className="text-right" style={{ color: 'rgba(255,255,255,0.8)' }}>{f.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Analize */}
      <div className="rounded-2xl p-5" style={cardBase}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Analize (zadnjih {analyses.length})</p>
        {analyses.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Nema analiza.</p>
        ) : (
          <div className="space-y-3">
            {analyses.map((a: any, i: number) => (
              <div key={a.id || i} className="pb-3" style={{ borderBottom: i < analyses.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <p className="text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{fmtDateTime(a.createdAt)}</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${pHColor(av(a, 'pH'))}22`, color: pHColor(av(a, 'pH')) }}>
                    pH {av(a, 'pH')?.toFixed(1) ?? '—'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${chlorColor(av(a, 'freeChlorine'))}22`, color: chlorColor(av(a, 'freeChlorine')) }}>
                    Klor {av(a, 'freeChlorine')?.toFixed(1) ?? '—'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${alkColor(av(a, 'alkalinity'))}22`, color: alkColor(av(a, 'alkalinity')) }}>
                    Alk {av(a, 'alkalinity') ?? '—'}
                  </span>
                  {(a.status || av(a, 'status')) && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                      {a.status || av(a, 'status')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pregledi (visits) */}
      <div className="rounded-2xl p-5" style={cardBase}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Zahtjevi za pregled</p>
        {visits.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Nema zahtjeva.</p>
        ) : (
          <div className="space-y-3">
            {visits.map((v: any, i: number) => (
              <div key={v.id || i} className="flex items-start justify-between gap-3 pb-3" style={{ borderBottom: i < visits.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div>
                  <p className="text-sm font-semibold text-white">{v.status === 'new' ? 'Novi' : v.status === 'scheduled' ? 'Dogovoreno' : v.status === 'done' ? 'Obavljeno' : 'Otkazano'}</p>
                  {v.scheduledFor && <p className="text-xs mt-0.5" style={{ color: '#2EE6A6' }}>Termin: {fmtDate(v.scheduledFor)}</p>}
                  {v.preferred && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Željeni: {v.preferred}</p>}
                  {v.note && <p className="text-xs italic mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{v.note}</p>}
                </div>
                <p className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>{fmtDate(v.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Oprema */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Oprema</p>
          {!addingEq && !editingEq && (
            <button onClick={() => setAddingEq(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(92,225,230,0.1)', color: '#5CE1E6', border: '1px solid rgba(92,225,230,0.25)' }}>
              <Plus className="w-3.5 h-3.5" /> Dodaj opremu
            </button>
          )}
        </div>

        {addingEq && (
          <EquipmentForm
            memberId={memberId}
            onSaved={async () => { setAddingEq(false); await load(); }}
            onCancel={() => setAddingEq(false)}
            onLogin={onLogin}
          />
        )}

        {equipment.length === 0 && !addingEq && (
          <p className="text-sm py-4 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Nema upisane opreme.</p>
        )}

        {equipment.map((eq: any) => (
          <div key={eq.id}>
            {editingEq?.id === eq.id ? (
              <EquipmentForm
                memberId={memberId}
                initial={eq}
                onSaved={async () => { setEditingEq(null); await load(); }}
                onCancel={() => setEditingEq(null)}
                onLogin={onLogin}
              />
            ) : (
              <div className="rounded-2xl p-4 space-y-2" style={cardBase}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-white">{eq.type}</p>
                      <ConditionBadge condition={eq.condition} />
                    </div>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {[eq.brand, eq.model, equipmentSpec(eq)].filter(Boolean).join(' · ')}
                      {eq.year && <span style={{ color: 'rgba(255,255,255,0.4)' }}> · {eq.year} ({new Date().getFullYear() - eq.year} god.)</span>}
                    </p>
                    {eq.notes && <p className="text-xs mt-1 italic" style={{ color: 'rgba(255,255,255,0.35)' }}>{eq.notes}</p>}
                    {eq.inspectedAt && <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Pregledano: {fmtDate(eq.inspectedAt)}</p>}
                    {eq.photos && eq.photos.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {eq.photos.map((path: string, pi: number) => (
                          <div key={pi} className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                            {photoUrlCache[path] ? (
                              <img src={photoUrlCache[path]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <ImageIcon className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {deleteEqId === eq.id ? (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm flex-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Obrisati?</span>
                    <button onClick={() => handleDeleteEq(eq.id)} disabled={deletingEq}
                      className="px-3 py-1.5 rounded-lg text-sm font-bold"
                      style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>
                      {deletingEq ? '...' : 'Da'}
                    </button>
                    <button onClick={() => setDeleteEqId(null)}
                      className="px-3 py-1.5 rounded-lg text-sm font-bold"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                      Ne
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => { setEditingEq(eq); setAddingEq(false); }}
                      className="flex-1 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: 'rgba(92,225,230,0.08)', color: '#5CE1E6', border: '1px solid rgba(92,225,230,0.2)' }}>
                      Uredi
                    </button>
                    <button onClick={() => setDeleteEqId(eq.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: 'rgba(255,59,48,0.08)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.2)' }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {eq.condition === 'replace' && (
                      <button onClick={() => onNavigate('products')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                        style={{ background: 'rgba(255,176,32,0.1)', color: '#FFB020', border: '1px solid rgba(255,176,32,0.25)' }}>
                        Ponuda
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MEMBERS LIST ──────────────────────────────────────────────────────────────
function MembersTab({ members, loading, error, onReload, onSelectMember, onLogin }: {
  members: AdminMember[];
  loading: boolean;
  error: ApiErrorKind | null;
  onReload: () => void;
  onSelectMember: (id: string) => void;
  onLogin: () => void;
}) {
  const [search, setSearch] = useState('');

  const filtered = members.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.city?.toLowerCase().includes(q));
  });

  if (loading && members.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#5CE1E6' }} />
      <p style={{ color: 'rgba(255,255,255,0.3)' }}>Učitavam članove...</p>
    </div>
  );

  if (error) return (
    <AdminErrorCard kind={error} onRetry={onReload} onLogin={onLogin} />
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pretraži po imenu, e-mailu ili gradu..."
          className="w-full pl-10 pr-4 py-3 rounded-xl text-white"
          style={inputStyle}
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Nema pronađenih članova.</p>
      )}

      <div className="space-y-3">
        {filtered.map(m => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onSelectMember(m.id)}
            className="w-full text-left rounded-2xl p-4 transition-all hover:opacity-90"
            style={cardBase}
          >
            <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-white">{m.name}</p>
                {m.planActive && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(46,230,166,0.15)', color: '#2EE6A6' }}>
                    Mondo Care do {fmtDate(m.planValidUntil)}
                  </span>
                )}
                {(m.needsAttention ?? 0) > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1" style={{ background: 'rgba(255,176,32,0.15)', color: '#FFB020' }}>
                    <AlertTriangle className="w-3 h-3" /> Za pažnju: {m.needsAttention}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{m.email}</p>
            <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {m.phone && (
                <a href={`tel:${m.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 hover:underline" style={{ color: '#5CE1E6' }}>
                  <Phone className="w-3 h-3" /> {m.phone}
                </a>
              )}
              {m.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {m.city}</span>}
              {m.pool?.volume != null && <span>Bazen: {m.pool.volume} m³</span>}
              {m.analysesCount != null && <span>Analize: {m.analysesCount}{m.lastAnalysis ? ` · ${fmtDate(m.lastAnalysis)}` : ''}</span>}
              {m.equipmentCount != null && <span>Oprema: {m.equipmentCount}</span>}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── VISIT REQUESTS ───────────────────────────────────────────────────────────
function VisitsTab({ members, onLogin }: { members: AdminMember[]; onLogin: () => void }) {
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiErrorKind | null>(null);
  const [filter, setFilter] = useState<VisitFilter>('new');
  const [editStates, setEditStates] = useState<Record<string, { status: string; scheduledFor: string; adminNote: string }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await adminMembersApi.getVisitRequests();
      setVisits(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(getApiErrorKind(err));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getEdit = (v: VisitRequest) => editStates[v.id] || { status: v.status, scheduledFor: v.scheduledFor || '', adminNote: v.adminNote || '' };
  const setEdit = (id: string, patch: Partial<{ status: string; scheduledFor: string; adminNote: string }>) => {
    setEditStates(prev => ({ ...prev, [id]: { ...getEdit(visits.find(v => v.id === id)!), ...patch } }));
  };

  const handleSave = async (id: string) => {
    const state = editStates[id];
    if (!state) return;
    setSaving(prev => ({ ...prev, [id]: true }));
    try {
      await adminMembersApi.updateVisitRequest(id, state);
      await load();
    } catch (err: any) {
      setError(getApiErrorKind(err));
    }
    setSaving(prev => ({ ...prev, [id]: false }));
  };

  const memberMap = Object.fromEntries(members.map(m => [m.id, m]));

  const filtered = visits.filter(v => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

  const statusLabels: Record<string, string> = { new: 'Novi', scheduled: 'Dogovoreno', done: 'Obavljeno', cancelled: 'Otkazano' };
  const filterPills: { key: VisitFilter; label: string }[] = [
    { key: 'new', label: 'Novi' },
    { key: 'scheduled', label: 'Dogovoreni' },
    { key: 'done', label: 'Obavljeni' },
    { key: 'all', label: 'Svi' },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#5CE1E6' }} />
      <p style={{ color: 'rgba(255,255,255,0.3)' }}>Učitavam zahtjeve...</p>
    </div>
  );

  if (error) return (
    <AdminErrorCard kind={error} onRetry={load} onLogin={onLogin} />
  );

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {filterPills.map(fp => (
          <button key={fp.key} onClick={() => setFilter(fp.key)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={filter === fp.key
              ? { background: 'rgba(92,225,230,0.15)', color: '#5CE1E6', border: '1px solid rgba(92,225,230,0.35)' }
              : { color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {fp.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Nema zahtjeva.</p>
      )}

      {filtered.map(v => {
        const member = v.memberId ? memberMap[v.memberId] : undefined;
        const ed = getEdit(v);
        return (
          <motion.div key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 space-y-3" style={cardBase}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-semibold text-white">{v.name}</p>
                  {member?.planActive && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(46,230,166,0.15)', color: '#2EE6A6' }}>Mondo Care</span>
                  )}
                </div>
                {!member?.planActive && (
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Provjeriti kupnju od 150 € ili naplatiti 49 €</p>
                )}
              </div>
              <p className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>{fmtDateTime(v.createdAt)}</p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              {v.phone && (
                <a href={`tel:${v.phone}`} className="flex items-center gap-1 hover:underline" style={{ color: '#5CE1E6' }}>
                  <Phone className="w-3.5 h-3.5" /> {v.phone}
                </a>
              )}
              {v.email && <span style={{ color: 'rgba(255,255,255,0.45)' }}>{v.email}</span>}
            </div>
            {(v.address || v.city) && (
              <p className="text-sm flex items-start gap-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {[v.address, v.city].filter(Boolean).join(', ')}
              </p>
            )}
            {v.preferred && <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Željeni termin: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{v.preferred}</span></p>}
            {v.note && <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.35)' }}>{v.note}</p>}

            {/* Controls */}
            <div className="pt-3 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Status</label>
                  <select value={ed.status} onChange={e => setEdit(v.id, { status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-white text-sm"
                    style={{ ...inputStyle, background: 'rgba(2,13,18,0.8)' }}>
                    {Object.entries(statusLabels).map(([k, lbl]) => <option key={k} value={k}>{lbl}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Termin</label>
                  <input type="date" value={ed.scheduledFor} onChange={e => setEdit(v.id, { scheduledFor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-white text-sm"
                    style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Interna napomena</label>
                <textarea value={ed.adminNote} onChange={e => setEdit(v.id, { adminNote: e.target.value })} rows={2}
                  className="w-full px-3 py-2 rounded-xl text-white text-sm resize-none"
                  style={inputStyle} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <button onClick={() => handleSave(v.id)} disabled={saving[v.id]}
                  className="flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"
                  style={{ background: 'rgba(92,225,230,0.12)', color: '#5CE1E6', border: '1px solid rgba(92,225,230,0.25)' }}>
                  {saving[v.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Spremi
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── EQUIPMENT REPORT ─────────────────────────────────────────────────────────
function EquipmentReportTab({ onLogin }: { onLogin: () => void }) {
  const [items, setItems] = useState<EquipmentReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiErrorKind | null>(null);
  const [filterCritical, setFilterCritical] = useState(true);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await adminMembersApi.getEquipmentReport();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(getApiErrorKind(err));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filterCritical
    ? items.filter(i => i.condition === 'watch' || i.condition === 'replace')
    : items;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#5CE1E6' }} />
      <p style={{ color: 'rgba(255,255,255,0.3)' }}>Učitavam izvještaj...</p>
    </div>
  );

  if (error) return (
    <AdminErrorCard kind={error} onRetry={load} onLogin={onLogin} />
  );

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <button
        onClick={() => setFilterCritical(f => !f)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        style={filterCritical
          ? { background: 'rgba(255,176,32,0.12)', color: '#FFB020', border: '1px solid rgba(255,176,32,0.3)' }
          : { color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <AlertTriangle className="w-4 h-4" />
        {filterCritical ? 'Samo Pratiti / Za zamjenu' : 'Sva oprema'}
      </button>

      {filtered.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Nema opreme u ovom prikazu.</p>
      )}

      <div className="space-y-3">
        {filtered.map((item, i) => (
          <motion.div key={item.id || i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4" style={cardBase}>
            <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-white">{item.memberName}</p>
                {item.memberCity && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.memberCity}</span>}
                {item.memberPhone && (
                  <a href={`tel:${item.memberPhone}`} className="text-xs flex items-center gap-1 hover:underline" style={{ color: '#5CE1E6' }}>
                    <Phone className="w-3 h-3" /> {item.memberPhone}
                  </a>
                )}
              </div>
              <ConditionBadge condition={item.condition} />
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {item.type} · {[item.brand, item.model, equipmentSpec(item)].filter(Boolean).join(' · ')}
              {item.age != null && <span style={{ color: 'rgba(255,255,255,0.4)' }}> · {item.age} god.</span>}
            </p>
            {item.inspectedAt && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <Calendar className="w-3 h-3" /> {fmtDate(item.inspectedAt)}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function AdminMembers({ onNavigate, demoMode = false }: AdminMembersProps) {
  const [subTab, setSubTab] = useState<SubTab>('members');
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState<ApiErrorKind | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const loadMembers = async () => {
    if (demoMode) {
      setMembersLoading(false);
      return;
    }
    setMembersLoading(true); setMembersError(null);
    try {
      const data = await adminMembersApi.getAdminMembers();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setMembersError(getApiErrorKind(err));
    }
    setMembersLoading(false);
  };

  useEffect(() => { loadMembers(); }, [demoMode]);

  const handleLogin = async () => {
    await authService.logout();
    onNavigate('login');
  };

  const subTabs: { key: SubTab; label: string }[] = [
    { key: 'members', label: 'Članovi' },
    { key: 'visits', label: 'Zahtjevi za pregled' },
    { key: 'report', label: 'Oprema – izvještaj' },
  ];

  return (
    <div className="space-y-5">
      {/* Sub-tab pills */}
      <div className="flex gap-2 flex-wrap">
        {subTabs.map(st => (
          <button key={st.key} onClick={() => { setSubTab(st.key); setSelectedMemberId(null); }}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={subTab === st.key
              ? { background: 'rgba(92,225,230,0.15)', color: '#5CE1E6', border: '1px solid rgba(92,225,230,0.35)' }
              : { color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {st.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {demoMode && <DemoInfoCard />}
      {subTab === 'members' && !selectedMemberId && (
        !demoMode &&
        <MembersTab
          members={members}
          loading={membersLoading}
          error={membersError}
          onReload={loadMembers}
          onSelectMember={id => setSelectedMemberId(id)}
          onLogin={handleLogin}
        />
      )}
      {subTab === 'members' && selectedMemberId && (
        !demoMode &&
        <MemberDetail
          memberId={selectedMemberId}
          onBack={() => setSelectedMemberId(null)}
          onNavigate={onNavigate}
          onLogin={handleLogin}
        />
      )}
      {subTab === 'visits' && !demoMode && <VisitsTab members={members} onLogin={handleLogin} />}
      {subTab === 'report' && !demoMode && <EquipmentReportTab onLogin={handleLogin} />}
    </div>
  );
}
