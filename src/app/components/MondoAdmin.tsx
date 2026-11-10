import { useState, useEffect, useRef } from 'react';
import { T } from '../lib/theme';
import { WaterBackground } from './WaterBackground';
import { ArrowLeft, MessageCircle, ShoppingBag, Clock, CheckCircle, Package, User, ExternalLink, Loader2, MessageSquare, Database, HelpCircle, Plus, Pencil, Trash2, X, Image as ImageIcon, ToggleLeft, ToggleRight, Users } from 'lucide-react';
import { AdminMembers } from './AdminMembers';
import { motion } from 'motion/react';
import { MondoFooter } from './MondoFooter';
import { api, getApiErrorKind, ApiErrorKind } from '../lib/supabase';
import { adminGetCatalog, adminSavePool, adminDeletePool, adminUploadImage, adminGetInquiries } from '../lib/vizApi';
import type { Pool } from '../lib/vizApi';
import { isLiveMode } from '../lib/session';
import { authService } from '../lib/auth';

interface Order {
  id: string;
  userName: string;
  userEmail: string;
  items: any[];
  totalEUR: number;
  vatAmount: number;
  totalWithVat: number;
  status: string;
  createdAt: string;
  note?: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  timestamp: string;
}

interface Inquiry {
  id: string;
  createdAt: string;
  name: string;
  phone?: string;
  email?: string;
  location?: string;
  poolId?: string;
  poolName?: string;
  note?: string;
}

type ActiveTab = 'orders' | 'messages' | 'catalog' | 'inquiries' | 'members';

interface MondoAdminProps {
  onBack: () => void;
  onNavigate: (page: any) => void;
}

const emptyPoolForm = () => ({
  name: '',
  type: 'Skimmer',
  shape: 'Pravokutni',
  dimensions: '',
  description: '',
  active: true,
  images: [] as string[],
});

const cardBase = { background: 'rgba(10,40,52,0.55)', border: '1px solid rgba(120,220,255,0.12)' };
const errorBox = { background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF3B30' };
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
      <button
        onClick={isAuth ? onLogin : onRetry}
        className="text-xs font-semibold hover:opacity-80"
        style={{ color: '#FF3B30' }}
      >
        {isAuth ? 'Prijava' : 'Pokušaj ponovno'}
      </button>
    </div>
  );
}

export function MondoAdmin({ onBack, onNavigate }: MondoAdminProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior }); }, [activeTab]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessMode, setAccessMode] = useState<'checking' | 'demo' | 'live'>('checking');
  const [dataError, setDataError] = useState<ApiErrorKind | null>(null);

  // Catalog state
  const [catalogPools, setCatalogPools] = useState<Pool[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<ApiErrorKind | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showPoolForm, setShowPoolForm] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);
  const [poolForm, setPoolForm] = useState(emptyPoolForm());
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inquiries state
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquiriesError, setInquiriesError] = useState<ApiErrorKind | null>(null);

  const userEmail = localStorage.getItem('userEmail') || '';
  const isAdmin =
    userEmail === 'info@mondo-acqua.hr' ||
    userEmail === 'admin@mondo-acqua.hr' ||
    userEmail === 'profesionalac@aquasmart.hr';

  const fetchData = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setDataError(null);
    try {
      const [ordersData, messagesData] = await Promise.all([
        api.get('admin/all-orders'),
        api.get('admin/all-messages'),
      ]);
      if (Array.isArray(ordersData)) {
        setOrders(ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
      if (Array.isArray(messagesData)) {
        setMessages(messagesData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }
    } catch (err: any) {
      setDataError(getApiErrorKind(err));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCatalog = async () => {
    if (accessMode !== 'live') return;
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const data: any = await adminGetCatalog();
      const arr = Array.isArray(data) ? data : (data?.pools ?? []);
      setCatalogPools(arr);
    } catch (err: any) {
      setCatalogError(getApiErrorKind(err));
    } finally {
      setCatalogLoading(false);
    }
  };

  const fetchInquiries = async () => {
    if (accessMode !== 'live') return;
    setInquiriesLoading(true);
    setInquiriesError(null);
    try {
      const data: any = await adminGetInquiries();
      const arr = Array.isArray(data) ? data : (data?.inquiries ?? []);
      setInquiries(arr.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      setInquiriesError(getApiErrorKind(err));
    } finally {
      setInquiriesLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    isLiveMode().then(live => {
      if (!active) return;
      if (live) {
        setAccessMode('live');
        void fetchData();
      } else {
        setAccessMode('demo');
        setIsLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (accessMode !== 'live') return;
    if (activeTab === 'catalog' && catalogPools.length === 0 && !catalogLoading) {
      fetchCatalog();
    }
    if (activeTab === 'inquiries' && inquiries.length === 0 && !inquiriesLoading) {
      fetchInquiries();
    }
  }, [activeTab, accessMode]);

  const handleLogin = async () => {
    await authService.logout();
    onNavigate('login');
  };

  const openNewForm = () => {
    setEditingPool(null);
    setPoolForm(emptyPoolForm());
    setFormError('');
    setShowPoolForm(true);
  };

  const openEditForm = (pool: Pool) => {
    setEditingPool(pool);
    setPoolForm({
      name: pool.name,
      type: pool.type,
      shape: pool.shape,
      dimensions: pool.dimensions,
      description: pool.description,
      active: pool.active,
      images: [...(pool.images ?? [])],
    });
    setFormError('');
    setShowPoolForm(true);
  };

  const handleSavePool = async () => {
    if (accessMode !== 'live') return;
    if (!poolForm.name.trim()) {
      setFormError('Naziv je obavezan.');
      return;
    }
    setFormError('');
    setFormSaving(true);
    try {
      const payload: any = { ...poolForm };
      if (editingPool) payload.id = editingPool.id;
      await adminSavePool(payload);
      setShowPoolForm(false);
      await fetchCatalog();
    } catch (err: any) {
      const kind = getApiErrorKind(err);
      if (kind === 'auth') {
        setShowPoolForm(false);
        setCatalogError('auth');
      } else {
        setShowPoolForm(false);
        setCatalogError('other');
      }
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeletePool = async (id: string) => {
    if (accessMode !== 'live') return;
    try {
      await adminDeletePool(id);
      setDeleteConfirmId(null);
      await fetchCatalog();
    } catch (err: any) {
      const kind = getApiErrorKind(err);
      if (kind === 'auth') {
        setCatalogError('auth');
      } else {
        setCatalogError('other');
      }
    }
  };

  const handleUploadImage = async (file: File) => {
    if (accessMode !== 'live') return;
    if (poolForm.images.length >= 5) return;
    setUploadingCount(c => c + 1);
    try {
      const res: any = await adminUploadImage(file);
      const url = res?.url ?? res?.imageUrl ?? res;
      if (typeof url === 'string') {
        setPoolForm(p => ({ ...p, images: [...p.images, url] }));
      }
    } catch (err: any) {
      const kind = getApiErrorKind(err);
      if (kind === 'auth') {
        setShowPoolForm(false);
        setCatalogError('auth');
      } else {
        setShowPoolForm(false);
        setCatalogError('other');
      }
    } finally {
      setUploadingCount(c => c - 1);
    }
  };

  const removeImage = (idx: number) => {
    setPoolForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-amber-500/20 p-8 rounded-3xl text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Pristup odbijen</h2>
          <p className="text-slate-400 mb-6">Ovaj dio aplikacije rezerviran je isključivo za Mondo Acqua administratore.</p>
          <button onClick={onBack} className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold">
            Povratak na početnu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative" style={{ background: T.pageBg }}>
      <WaterBackground />
      {/* Header */}
      <div
        className="sticky top-0 z-20"
        style={{ background: 'rgba(2,13,18,0.7)', borderBottom: T.cardBorder, backdropFilter: 'blur(16px)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-6 h-6" style={{ color: '#5CE1E6' }} />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                Mondo Acqua{' '}
                <span className="text-xs tracking-widest px-2 py-0.5 rounded" style={{ color: '#5CE1E6', background: 'rgba(92,225,230,0.1)' }}>
                  ADMIN
                </span>
              </h1>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Upravljanje upitima i narudžbama</p>
            </div>
          </div>
          <button
            onClick={accessMode !== 'live' ? () => {} : activeTab === 'catalog' ? fetchCatalog : activeTab === 'inquiries' ? fetchInquiries : activeTab === 'members' ? () => {} : fetchData}
            disabled={accessMode !== 'live' || isLoading || catalogLoading || inquiriesLoading}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            {(isLoading || catalogLoading || inquiriesLoading) ? (
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#5CE1E6' }} />
            ) : (
              <Clock className="w-5 h-5" style={{ color: '#5CE1E6' }} />
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto">
          {(
            [
              { key: 'orders', icon: ShoppingBag, label: `Narudžbe (${orders.length})` },
              { key: 'messages', icon: MessageSquare, label: `Poruke (${messages.length})` },
              { key: 'catalog', icon: Database, label: 'Katalog bazena' },
              { key: 'inquiries', icon: HelpCircle, label: 'Upiti s vizualizatora' },
              { key: 'members', icon: Users, label: 'Vlasnici bazena' },
            ] as const
          ).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-shrink-0 py-4 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2"
              style={{
                borderBottomColor: activeTab === tab.key ? '#5CE1E6' : 'transparent',
                color: activeTab === tab.key ? '#5CE1E6' : 'rgba(255,255,255,0.35)',
                background: activeTab === tab.key ? 'rgba(92,225,230,0.04)' : 'transparent',
              }}
            >
              <tab.icon className="w-4 h-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 py-8">

        {/* ── Orders ── */}
        {activeTab === 'orders' && (
          accessMode === 'demo' ? (
            <DemoInfoCard />
          ) : dataError ? (
            <AdminErrorCard kind={dataError} onRetry={fetchData} onLogin={handleLogin} />
          ) : isLoading && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: '#D4A853' }} />
              <p style={{ color: 'rgba(255,255,255,0.3)' }}>Učitavam narudžbe...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.length === 0 && (
                <div className="rounded-2xl p-10 text-center border border-dashed" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <Package className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.1)' }} />
                  <p style={{ color: 'rgba(255,255,255,0.3)' }}>Nema pristiglih narudžbi.</p>
                </div>
              )}
              {orders.map(order => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={order.id}
                  className="rounded-2xl overflow-hidden"
                  style={cardBase}
                >
                  <div className="p-4 border-b flex justify-between items-start" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{order.userName}</span>
                        <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                        <span className="text-xs font-mono" style={{ color: '#5CE1E6' }}>{order.id.split('-')[0]}</span>
                      </div>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{order.userEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: '#2EFF88' }}>{order.totalWithVat.toFixed(2)} €</p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{new Date(order.createdAt).toLocaleString('hr-HR')}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span style={{ color: 'rgba(255,255,255,0.7)' }}>{item.quantity}x {item.name}</span>
                          <span style={{ color: 'rgba(255,255,255,0.3)' }}>{item.price.toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>
                    {order.note && (
                      <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-xs font-bold mb-1" style={{ color: '#D4A853' }}>Napomena:</p>
                        <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.4)' }}>{order.note}</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex justify-end gap-2" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <button className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg"
                      style={{ background: 'rgba(46,255,136,0.08)', color: '#2EFF88' }}>Plaćeno</button>
                    <button className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg"
                      style={{ background: 'rgba(92,225,230,0.08)', color: '#5CE1E6' }}>U obradi</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}

        {/* ── Messages ── */}
        {activeTab === 'messages' && (
          accessMode === 'demo' ? (
            <DemoInfoCard />
          ) : dataError ? (
            <AdminErrorCard kind={dataError} onRetry={fetchData} onLogin={handleLogin} />
          ) : isLoading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: '#D4A853' }} />
              <p style={{ color: 'rgba(255,255,255,0.3)' }}>Učitavam poruke...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="rounded-2xl p-10 text-center border border-dashed" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <MessageCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.1)' }} />
                  <p style={{ color: 'rgba(255,255,255,0.3)' }}>Nema novih poruka.</p>
                </div>
              )}
              {messages.map(msg => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id}
                  className="rounded-2xl p-4"
                  style={cardBase}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(92,225,230,0.1)' }}>
                        <User className="w-4 h-4" style={{ color: '#5CE1E6' }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{msg.senderName}</p>
                        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{new Date(msg.timestamp).toLocaleString('hr-HR')}</p>
                      </div>
                    </div>
                    <button onClick={() => onNavigate('/owner-chat')} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <ExternalLink className="w-4 h-4" style={{ color: '#5CE1E6' }} />
                    </button>
                  </div>
                  <p className="text-sm p-3 rounded-xl" style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {msg.text}
                  </p>
                </motion.div>
              ))}
            </div>
          )
        )}

        {/* ── Catalog ── */}
        {activeTab === 'catalog' && (
          accessMode === 'demo' ? (
            <DemoInfoCard />
          ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Katalog bazena</h2>
              <button
                onClick={openNewForm}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                style={{ background: 'rgba(92,225,230,0.12)', color: '#5CE1E6', border: '1px solid rgba(92,225,230,0.3)' }}
              >
                <Plus className="w-4 h-4" />
                Novi model
              </button>
            </div>

            {catalogError && (
              <AdminErrorCard kind={catalogError} onRetry={fetchCatalog} onLogin={handleLogin} />
            )}

            {/* Pool form */}
            {showPoolForm && (
              <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(10,40,52,0.55)', border: '1px solid rgba(120,220,255,0.12)' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{editingPool ? 'Uredi model' : 'Novi model bazena'}</h3>
                  <button onClick={() => setShowPoolForm(false)} className="p-1 rounded-lg hover:bg-white/5">
                    <X className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Naziv *</label>
                  <input
                    type="text"
                    value={poolForm.name}
                    onChange={e => setPoolForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-white"
                    style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', fontSize: '16px', outline: 'none', color: 'white' }}
                  />
                </div>

                {/* Type + Shape in a row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Tip</label>
                    <select
                      value={poolForm.type}
                      onChange={e => setPoolForm(p => ({ ...p, type: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-white"
                      style={{ background: 'rgba(2,13,18,0.8)', border: '1px solid rgba(120,220,255,0.18)', fontSize: '16px', outline: 'none', color: 'white' }}
                    >
                      <option>Skimmer</option>
                      <option>Preljevni</option>
                      <option>Ostalo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Oblik</label>
                    <select
                      value={poolForm.shape}
                      onChange={e => setPoolForm(p => ({ ...p, shape: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-white"
                      style={{ background: 'rgba(2,13,18,0.8)', border: '1px solid rgba(120,220,255,0.18)', fontSize: '16px', outline: 'none', color: 'white' }}
                    >
                      <option>Pravokutni</option>
                      <option>Ovalni</option>
                      <option>Slobodni oblik</option>
                      <option>L-oblik</option>
                      <option>Ostalo</option>
                    </select>
                  </div>
                </div>

                {/* Dimensions */}
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Dimenzije</label>
                  <input
                    type="text"
                    value={poolForm.dimensions}
                    onChange={e => setPoolForm(p => ({ ...p, dimensions: e.target.value }))}
                    placeholder="8 x 4 x 1,5 m"
                    className="w-full px-4 py-3 rounded-xl text-white"
                    style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', fontSize: '16px', outline: 'none', color: 'white' }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Opis</label>
                  <textarea
                    value={poolForm.description}
                    onChange={e => setPoolForm(p => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-white resize-none"
                    style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', fontSize: '16px', outline: 'none', color: 'white' }}
                  />
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Prikaži kupcima</span>
                  <button
                    onClick={() => setPoolForm(p => ({ ...p, active: !p.active }))}
                    className="flex items-center gap-2 transition-colors"
                  >
                    {poolForm.active ? (
                      <ToggleRight className="w-8 h-8" style={{ color: '#5CE1E6' }} />
                    ) : (
                      <ToggleLeft className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.3)' }} />
                    )}
                    <span className="text-sm" style={{ color: poolForm.active ? '#5CE1E6' : 'rgba(255,255,255,0.3)' }}>
                      {poolForm.active ? 'Aktivan' : 'Skriven'}
                    </span>
                  </button>
                </div>

                {/* Images */}
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Fotografije ({poolForm.images.length}/5)
                  </label>
                  <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Dodajte 2–3 jasne fotografije modela, po mogućnosti jednu snimljenu odozgo.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {poolForm.images.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(0,0,0,0.7)' }}
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {uploadingCount > 0 && (
                      <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#5CE1E6' }} />
                      </div>
                    )}
                    {poolForm.images.length < 5 && (
                      <label
                        className="w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0 hover:bg-white/5 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.15)' }}
                      >
                        <Plus className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.3)' }} />
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => e.target.files?.[0] && handleUploadImage(e.target.files[0])}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl text-sm" style={errorBox}>{formError}</div>
                )}

                <button
                  onClick={handleSavePool}
                  disabled={formSaving}
                  className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                  style={{
                    background: T.accent,
                    color: '#000',
                    opacity: formSaving ? 0.7 : 1,
                  }}
                >
                  {formSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Spremi
                </button>
              </div>
            )}

            {/* Catalog list */}
            {catalogLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00F0FF' }} />
              </div>
            ) : catalogPools.length === 0 && !catalogError ? (
              <div className="rounded-2xl p-10 text-center border border-dashed" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <Database className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.1)' }} />
                <p style={{ color: 'rgba(255,255,255,0.3)' }}>Katalog je prazan. Dodajte prvi model.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {catalogPools.map(pool => (
                  <div key={pool.id} className="rounded-2xl overflow-hidden" style={cardBase}>
                    {/* Photo */}
                    <div className="w-full" style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                      {pool.images?.[0] ? (
                        <img src={pool.images[0]} alt={pool.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.1)' }} />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-bold leading-tight">{pool.name}</p>
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={pool.active
                            ? { background: 'rgba(46,255,136,0.1)', color: '#2EFF88' }
                            : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
                        >
                          {pool.active ? 'Aktivan' : 'Skriven'}
                        </span>
                      </div>
                      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{pool.dimensions}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{pool.type} · {pool.shape}</p>

                      {/* Actions or delete confirm */}
                      {deleteConfirmId === pool.id ? (
                        <div className="mt-3 p-3 rounded-xl space-y-2" style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.25)' }}>
                          <p className="text-sm font-semibold" style={{ color: '#FF3B30' }}>Obrisati model?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeletePool(pool.id)}
                              className="flex-1 py-2 rounded-lg text-sm font-bold"
                              style={{ background: 'rgba(255,59,48,0.2)', color: '#FF3B30' }}
                            >
                              Da
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="flex-1 py-2 rounded-lg text-sm font-bold"
                              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                            >
                              Ne
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => openEditForm(pool)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
                            style={{ background: 'rgba(92,225,230,0.08)', color: '#5CE1E6', border: '1px solid rgba(92,225,230,0.2)' }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Uredi
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(pool.id)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                            style={{ background: 'rgba(255,59,48,0.08)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.2)' }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Obriši
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )
        )}

        {/* ── Members (Vlasnici bazena) ── */}
        {activeTab === 'members' && (
          accessMode === 'checking' ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#5CE1E6' }} />
            </div>
          ) : (
            <AdminMembers onNavigate={onNavigate} demoMode={accessMode === 'demo'} />
          )
        )}

        {/* ── Inquiries ── */}
        {activeTab === 'inquiries' && (
          accessMode === 'demo' ? (
            <DemoInfoCard />
          ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Upiti s vizualizatora</h2>
            {inquiriesError ? (
              <AdminErrorCard kind={inquiriesError} onRetry={fetchInquiries} onLogin={handleLogin} />
            ) : inquiriesLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#5CE1E6' }} />
              </div>
            ) : inquiries.length === 0 ? (
              <div className="rounded-2xl p-10 text-center border border-dashed" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <HelpCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.1)' }} />
                <p style={{ color: 'rgba(255,255,255,0.3)' }}>Nema upita s vizualizatora.</p>
              </div>
            ) : (
              inquiries.map(inq => (
                <motion.div
                  key={inq.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-4 space-y-3"
                  style={cardBase}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold">{inq.name}</p>
                      {inq.poolName && (
                        <p className="text-xs mt-0.5" style={{ color: '#5CE1E6' }}>Model: {inq.poolName}</p>
                      )}
                    </div>
                    <p className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {inq.createdAt ? new Date(inq.createdAt).toLocaleString('hr-HR') : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {inq.phone && (
                      <a href={`tel:${inq.phone}`} className="flex items-center gap-1 hover:underline" style={{ color: '#5CE1E6' }}>
                        {inq.phone}
                      </a>
                    )}
                    {inq.email && (
                      <a href={`mailto:${inq.email}`} className="hover:underline" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {inq.email}
                      </a>
                    )}
                    {inq.location && (
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{inq.location}</span>
                    )}
                  </div>
                  {inq.note && (
                    <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.35)' }}>{inq.note}</p>
                  )}
                </motion.div>
              ))
            )}
          </div>
          )
        )}
      </main>

      <MondoFooter />
    </div>
  );
}
