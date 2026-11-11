import { motion, AnimatePresence } from 'motion/react';
import { TrialBanner } from './TrialBanner';
import { T } from '../lib/theme';
import { WaterBackground } from './WaterBackground';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText, Droplets, Calendar, CheckCircle, AlertCircle,
  MapPin, UserCog, Package, Settings, Home, MoreHorizontal,
  Eye, User, Phone, Mail, Plus, X, ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../lib/languageContext';
import { AquaSmartProLogo } from './AquaSmartProLogo';
import { WorkOrderDetailsModal } from './WorkOrderDetailsModal';
import { getPermissions, isLiveMode, isDemoMode, refreshMe } from '../lib/session';
import { authService } from '../lib/auth';
import { api } from '../lib/supabase';
import { loadCompanyData } from '../lib/companyData';

interface EmployeeDashboardProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

interface WorkOrder {
  id: number | string;
  client: string;
  location: string;
  task: string;
  status: 'active' | 'pending' | 'completed';
  assignee?: string;
  assigneeId?: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  disinfectionSystem?: 'klor' | 'so' | 'uv' | 'ozon' | '';
  maintenanceTasks?: any[];
  services?: any[];
  productsUsed?: any[];
  totalCost?: number;
}

interface WaterTest {
  id: number;
  client: string;
  date: string;
  pH: number;
  chlorine: number;
  alkalinity: number;
  status: 'good' | 'warning' | 'critical';
}

interface WarehouseItem {
  id: number | string;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
  trend?: string;
  category: string;
}

interface ClientItem {
  id: string;
  name: string;
  location: string;
  phone?: string;
  email?: string;
  pools?: number;
  lastService?: string;
  nextService?: string;
  status?: string;
}

const EMP_STORAGE = {
  WORK_ORDERS: 'aquasmart_employee_work_orders',
  WATER_TESTS: 'aquasmart_employee_water_tests',
};

const SHARED_STORAGE = {
  WAREHOUSE: 'aquasmart_employer_warehouse',
  CLIENTS: 'aquasmart_employer_clients',
};

function loadLS<T>(key: string, def: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : def;
  } catch {
    return def;
  }
}

function saveLS<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function EmployeeDashboard({ onBack, onNavigate }: EmployeeDashboardProps) {
  const { t } = useLanguage();

  const [perms, setPerms] = useState(getPermissions);
  const [currentView, setCurrentView] = useState<'home' | 'work-orders' | 'water-analysis' | 'more' | 'warehouse' | 'clients'>(() => {
    const saved = sessionStorage.getItem('employee_view');
    return (saved as any) || 'home';
  });
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior }); }, [currentView]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState('');
  const modalOpenRef = useRef(false);

  // Shared data from employer (read-only unless perms.warehouse/clients === 'edit')
  const [warehouse, setWarehouse] = useState<WarehouseItem[]>(() => isDemoMode() ? loadLS(SHARED_STORAGE.WAREHOUSE, []) : []);
  const [clients, setClients] = useState<ClientItem[]>(() => isDemoMode() ? loadLS(SHARED_STORAGE.CLIENTS, []) : []);

  // Add client modal
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientLocation, setNewClientLocation] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => isDemoMode() ? loadLS(EMP_STORAGE.WORK_ORDERS, [
    { id: 1, client: 'Hotel Adriatic', location: 'Split', task: 'Čišćenje bazena', status: 'active', dueDate: '2026-02-27', priority: 'high', notes: 'Temeljno čišćenje bazena' },
    { id: 2, client: 'Villa Sunset', location: 'Dubrovnik', task: 'Kemijsko uravnoteženje', status: 'pending', dueDate: '2026-02-28', priority: 'medium', notes: 'Provjera pH i klora' },
    { id: 3, client: 'Spa Opatija', location: 'Opatija', task: 'Filter Maintenance', status: 'completed', dueDate: '2026-02-26', priority: 'low', notes: 'Zamjena filtera' },
  ]) : []);

  const [waterTests, setWaterTests] = useState<WaterTest[]>(() => isDemoMode() ? loadLS(EMP_STORAGE.WATER_TESTS, [
    { id: 1, client: 'Hotel Adriatic', date: '2026-02-25', pH: 7.2, chlorine: 1.5, alkalinity: 120, status: 'good' },
    { id: 2, client: 'Villa Sunset', date: '2026-02-24', pH: 6.8, chlorine: 0.8, alkalinity: 90, status: 'warning' },
    { id: 3, client: 'Spa Opatija', date: '2026-02-23', pH: 8.2, chlorine: 0.3, alkalinity: 150, status: 'critical' },
  ]) : []);

  const load = useCallback(async () => {
    const data = await loadCompanyData();
    if (data) {
      setWorkOrders((data['work-orders'] || []) as WorkOrder[]);
      setWaterTests(((data.analyses || []) as any[]).filter(a => typeof a.pH === 'number') as WaterTest[]);
      setWarehouse((data.warehouse || []) as WarehouseItem[]);
      setClients((data.clients || []) as ClientItem[]);
      setSyncError('');
    } else {
      setSyncError('Nema veze s poslužiteljem. Prikazani podaci možda nisu najnoviji.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const liveMode = await isLiveMode();
      if (liveMode) {
        setLive(true);
        await refreshMe();
        setPerms(getPermissions());
        setLoading(true);
        await load();
      }
    })();
  }, [load]);

  useEffect(() => {
    modalOpenRef.current = !!(selectedWorkOrder || showAddClientModal);
  }, [selectedWorkOrder, showAddClientModal]);

  useEffect(() => {
    if (!live) return;
    const handleFocus = () => { if (!modalOpenRef.current) load(); };
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(() => { if (!modalOpenRef.current) load(); }, 60000);
    return () => { window.removeEventListener('focus', handleFocus); clearInterval(interval); };
  }, [live, load]);

  const updateWorkOrders = (orders: WorkOrder[]) => {
    setWorkOrders(orders);
    if (!live) saveLS(EMP_STORAGE.WORK_ORDERS, orders);
  };

  const updateWaterTests = (tests: WaterTest[]) => {
    setWaterTests(tests);
    if (!live) saveLS(EMP_STORAGE.WATER_TESTS, tests);
  };

  const updateWarehouse = (items: WarehouseItem[]) => {
    setWarehouse(items);
    if (!live) saveLS(SHARED_STORAGE.WAREHOUSE, items);
  };

  const updateClients = (items: ClientItem[]) => {
    setClients(items);
    if (!live) saveLS(SHARED_STORAGE.CLIENTS, items);
  };

  // ── View navigation with history ──────────────────────────────────
  type EmployeeView = 'home' | 'work-orders' | 'water-analysis' | 'more' | 'warehouse' | 'clients';

  const goToView = useCallback((view: EmployeeView) => {
    sessionStorage.setItem('employee_view', view);
    if (view === 'home') {
      window.history.replaceState({ page: 'pro-portal', view: 'home' }, '');
    } else {
      window.history.pushState({ page: 'pro-portal', view }, '');
    }
    setCurrentView(view);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('employee_view') || 'home';
    window.history.replaceState({ page: 'pro-portal', view: saved }, '');
    const handlePop = (event: PopStateEvent) => {
      if (event.state?.page === 'pro-portal') {
        const v = (event.state.view || 'home') as EmployeeView;
        sessionStorage.setItem('employee_view', v);
        setCurrentView(v);
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const markOrderComplete = async (id: number | string) => {
    const order = workOrders.find(o => o.id === id);
    const updated = workOrders.map(o => o.id === id ? { ...o, status: 'completed' as const } : o);
    updateWorkOrders(updated);
    if (live && order) {
      try { await api.post('work-orders', { ...order, status: 'completed' }); }
      catch { setSyncError('Promjena nije spremljena na poslužitelj. Provjerite vezu i pokušajte ponovno.'); }
    }
  };

  const addWaterTest = async () => {
    const client = prompt('Klijent:');
    if (!client) return;
    const pH = parseFloat(prompt('pH vrijednost:') || '7.0');
    const chlorine = parseFloat(prompt('Klor (ppm):') || '1.0');
    const alkalinity = parseInt(prompt('Alkalinitet:') || '100');
    const newTest: WaterTest = {
      id: Date.now(),
      client,
      date: new Date().toISOString().split('T')[0],
      pH,
      chlorine,
      alkalinity,
      status: pH >= 7.2 && pH <= 7.6 && chlorine >= 1.0 && chlorine <= 3.0 ? 'good' :
        pH >= 7.0 && pH <= 8.0 && chlorine >= 0.5 ? 'warning' : 'critical',
    };
    updateWaterTests([newTest, ...waterTests]);
    if (live) {
      try { await api.post('analyses', newTest); }
      catch { setSyncError('Promjena nije spremljena na poslužitelj. Provjerite vezu i pokušajte ponovno.'); }
    }
  };

  const handleSaveClient = async () => {
    if (!newClientName.trim()) return;
    const c: ClientItem = {
      id: Date.now().toString(),
      name: newClientName.trim(),
      location: newClientLocation.trim(),
      phone: newClientPhone.trim(),
      email: newClientEmail.trim(),
    };
    updateClients([...clients, c]);
    if (live) {
      try { await api.post('clients', c); }
      catch { setSyncError('Promjena nije spremljena na poslužitelj. Provjerite vezu i pokušajte ponovno.'); }
    }
    setShowAddClientModal(false);
    setNewClientName(''); setNewClientLocation(''); setNewClientPhone(''); setNewClientEmail('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#00F0FF';
      case 'pending': return '#FFB020';
      case 'completed': return '#2EFF88';
      case 'high': return '#FF3B30';
      case 'medium': return '#FFB020';
      case 'low': return '#2EFF88';
      case 'good': return '#2EFF88';
      case 'warning': return '#FFB020';
      case 'critical': return '#FF3B30';
      default: return 'rgba(255,255,255,0.45)';
    }
  };

  const activeOrders = workOrders.filter(o => o.status === 'active' || o.status === 'pending');
  const completedOrders = workOrders.filter(o => o.status === 'completed');
  const criticalTests = waterTests.filter(t => t.status === 'critical').length;

  const warehouseProductList = warehouse.map(w => ({ id: w.id, name: w.name, unit: w.unit }));

  // ── Views ─────────────────────────────────────────────────────────────────

  const renderHomeView = () => {
    // Build menu cards based on permissions
    const menuCards = [];
    menuCards.push({ id: 'work-orders', icon: FileText, label: 'Radni Nalozi', desc: 'Pregledaj i upravljaj radnim nalozima', color: '#5CE1E6', count: activeOrders.length });
    if (perms.waterAnalysis) {
      menuCards.push({ id: 'water-analysis', icon: Droplets, label: 'Analize Vode', desc: 'Testiranje i praćenje kvalitete vode', color: '#2EFF88', count: waterTests.length });
    }
    if (perms.warehouse !== 'none') {
      menuCards.push({ id: 'warehouse', icon: Package, label: 'Skladište', desc: 'Pregled skladišnih artikala', color: '#5CE1E6', count: warehouse.length });
    }
    if (perms.clients !== 'none') {
      menuCards.push({ id: 'clients', icon: UserCog, label: 'Klijenti', desc: 'Pregled klijenata', color: '#2EFF88', count: clients.length });
    }

    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Pregled <span className="gradient-text">Izvršitelj</span>
        </h1>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <motion.div whileHover={{ y: -4 }} className="p-6 rounded-2xl" style={{
            background: 'rgba(10,40,52,0.55)',
            border: '1px solid rgba(120,220,255,0.12)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
          }}>
            <FileText className="w-8 h-8 mb-3" style={{ color: '#5CE1E6' }} />
            <div className="text-3xl font-bold" style={{ color: '#5CE1E6' }}>{activeOrders.length}</div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>Aktivni Nalozi</div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="p-6 rounded-2xl" style={{
            background: 'rgba(10,40,52,0.55)',
            border: '1px solid rgba(120,220,255,0.12)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
          }}>
            <CheckCircle className="w-8 h-8 mb-3" style={{ color: '#2EFF88' }} />
            <div className="text-3xl font-bold" style={{ color: '#2EFF88' }}>{completedOrders.length}</div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>Završeno</div>
          </motion.div>

          {perms.waterAnalysis && (
            <motion.div whileHover={{ y: -4 }} className="p-6 rounded-2xl" style={{
              background: 'rgba(10,40,52,0.55)',
              border: '1px solid rgba(120,220,255,0.12)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
            }}>
              <AlertCircle className="w-8 h-8 mb-3" style={{ color: '#FF3B30' }} />
              <div className="text-3xl font-bold" style={{ color: '#FF3B30' }}>{criticalTests}</div>
              <div className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>Kritične Analize</div>
            </motion.div>
          )}
        </div>

        {/* Main Menu Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {menuCards.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => goToView(item.id as any)}
              className="p-8 rounded-3xl cursor-pointer backdrop-blur-xl group relative overflow-hidden"
              style={{ background: 'rgba(10,40,52,0.55)', border: '1px solid rgba(120,220,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(135deg, rgba(92,225,230,0.08) 0%, transparent 100%)' }}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <item.icon className="w-12 h-12" style={{ color: item.color }} />
                  <div className="text-2xl font-bold" style={{ color: item.color }}>{item.count}</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.label}</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Work Orders */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Najnoviji Radni Nalozi</h3>
          <div className="space-y-3">
            {activeOrders.slice(0, 3).map((order) => (
              <div key={String(order.id)} className="p-4 rounded-2xl flex items-center justify-between" style={{
                background: 'rgba(10,40,52,0.55)',
                border: '1px solid rgba(120,220,255,0.12)'
              }}>
                <div className="flex-1">
                  <h4 className="font-semibold">{order.client}</h4>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{order.task}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold" style={{
                    background: `${getStatusColor(order.priority)}20`,
                    color: getStatusColor(order.priority)
                  }}>
                    {order.priority === 'high' ? 'VISOKI' : order.priority === 'medium' ? 'SREDNJI' : 'NISKI'}
                  </span>
                  <button
                    onClick={() => markOrderComplete(order.id)}
                    className="px-4 py-2 rounded-lg font-bold transition-all hover:scale-105"
                    style={{ background: T.accent, color: '#000000' }}
                  >
                    Završi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderWorkOrdersView = () => {
    const currentUser = authService.getCurrentUser();
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold">Radni Nalozi ({workOrders.length})</h2>
          {perms.createOrders && (
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setSelectedWorkOrder({
                  id: Date.now(),
                  client: '',
                  location: '',
                  task: 'Novi radni nalog',
                  status: 'pending',
                  dueDate: today,
                  priority: 'medium',
                  assignee: currentUser?.name ?? '',
                  assigneeId: currentUser?.id ?? '',
                });
              }}
              className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2"
              style={{ background: T.accent, color: '#000000' }}
            >
              <Plus className="w-5 h-5" />
              <span>Novi nalog</span>
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          {['active', 'pending', 'completed'].map((status) => (
            <button key={status} className="px-4 py-2 rounded-xl font-medium transition-all" style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              {status === 'active' ? 'Aktivni' : status === 'pending' ? 'Na čekanju' : 'Završeni'}
              <span className="ml-2 px-2 py-0.5 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.1)' }}>
                {workOrders.filter(o => o.status === status).length}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {workOrders.map((order) => (
            <div key={String(order.id)} className="p-6 rounded-2xl" style={{
              background: 'rgba(10,40,52,0.55)',
              border: '1px solid rgba(120,220,255,0.12)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
            }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{order.client}</h3>
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold" style={{
                      background: `${getStatusColor(order.status)}20`,
                      color: getStatusColor(order.status)
                    }}>
                      {order.status === 'active' ? 'AKTIVNO' : order.status === 'pending' ? 'NA ČEKANJU' : 'ZAVRŠENO'}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold" style={{
                      background: `${getStatusColor(order.priority)}20`,
                      color: getStatusColor(order.priority)
                    }}>
                      {order.priority === 'high' ? 'VISOKI' : order.priority === 'medium' ? 'SREDNJI' : 'NISKI'}
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{order.task}</p>
                  {order.notes && (
                    <p className="text-xs p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)' }}>
                      📝 {order.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{order.location}</span></div>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{order.dueDate}</span></div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedWorkOrder(order)}
                    className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 flex items-center gap-2"
                    style={{ background: 'rgba(92,225,230,0.1)', color: '#5CE1E6', border: '1px solid rgba(92,225,230,0.2)' }}
                  >
                    <Eye className="w-4 h-4" /><span>Detalji</span>
                  </button>
                  {order.status !== 'completed' && (
                    <button
                      onClick={() => markOrderComplete(order.id)}
                      className="px-6 py-2 rounded-lg font-bold transition-all hover:scale-105 flex items-center gap-2"
                      style={{ background: T.accent, color: '#000000' }}
                    >
                      <CheckCircle className="w-4 h-4" /><span>Završi</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWaterAnalysisView = () => (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold">Analize Vode ({waterTests.length})</h2>
        <button
          onClick={addWaterTest}
          className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2"
          style={{ background: T.accent, color: '#000000' }}
        >
          <Droplets className="w-5 h-5" /><span>Nova Analiza</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {waterTests.map((test) => (
          <div key={test.id} className="p-6 rounded-2xl" style={{
            background: 'rgba(10,40,52,0.55)',
            border: `1px solid ${getStatusColor(test.status)}40`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
          }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{test.client}</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{test.date}</p>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-semibold" style={{
                background: `${getStatusColor(test.status)}20`,
                color: getStatusColor(test.status)
              }}>
                {test.status === 'good' ? 'DOBRO' : test.status === 'warning' ? 'UPOZORENJE' : 'KRITIČNO'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { val: test.pH, label: 'pH', ok: test.pH >= 7.2 && test.pH <= 7.6 },
                { val: test.chlorine, label: 'Cl (ppm)', ok: test.chlorine >= 1.0 && test.chlorine <= 3.0 },
                { val: test.alkalinity, label: 'Alk', ok: test.alkalinity >= 80 && test.alkalinity <= 120 },
              ].map(({ val, label, ok }) => (
                <div key={label} className="text-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-2xl font-bold" style={{ color: ok ? '#2EFF88' : '#FFB020' }}>{val}</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-2xl text-center" style={{
        background: 'rgba(10,40,52,0.55)',
        border: '1px solid rgba(120,220,255,0.12)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
      }}>
        <Droplets className="w-12 h-12 mx-auto mb-4" style={{ color: '#5CE1E6' }} />
        <h3 className="text-xl font-semibold mb-2">Detaljno Testiranje Vode</h3>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>Koristi napredni alat za analizu vode sa AI preporukama</p>
        <button
          onClick={() => onNavigate('water-analysis')}
          className="px-8 py-3 rounded-xl font-bold transition-all hover:scale-105"
          style={{ background: T.accent, color: '#000000' }}
        >
          Otvori Detaljnu Analizu
        </button>
      </div>
    </div>
  );

  const renderWarehouseView = () => (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-semibold mb-6">Skladište ({warehouse.length})</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouse.map((item) => {
          const low = item.stock <= item.minStock;
          return (
            <div key={String(item.id)} className="p-6 rounded-2xl" style={{
              background: 'rgba(10,40,52,0.55)',
              border: `1px solid ${low ? 'rgba(255,59,48,0.3)' : 'rgba(120,220,255,0.12)'}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
            }}>
              <div className="mb-3">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.category}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold" style={{ color: low ? '#FF3B30' : '#2EFF88' }}>
                    {item.stock}
                  </span>
                  <span className="text-sm ml-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.unit}</span>
                  <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Min: {item.minStock}</div>
                </div>
                {perms.warehouse === 'edit' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        const updatedItem = { ...item, stock: Math.max(0, item.stock - 1) };
                        const updated = warehouse.map(w => w.id === item.id ? updatedItem : w);
                        updateWarehouse(updated);
                        if (live) {
                          try { await api.post('warehouse', updatedItem); }
                          catch { setSyncError('Promjena nije spremljena na poslužitelj. Provjerite vezu i pokušajte ponovno.'); }
                        }
                      }}
                      className="w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all hover:scale-105"
                      style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.3)' }}
                    >
                      −
                    </button>
                    <button
                      onClick={async () => {
                        const updatedItem = { ...item, stock: item.stock + 1 };
                        const updated = warehouse.map(w => w.id === item.id ? updatedItem : w);
                        updateWarehouse(updated);
                        if (live) {
                          try { await api.post('warehouse', updatedItem); }
                          catch { setSyncError('Promjena nije spremljena na poslužitelj. Provjerite vezu i pokušajte ponovno.'); }
                        }
                      }}
                      className="w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all hover:scale-105"
                      style={{ background: 'rgba(46,255,136,0.15)', color: '#2EFF88', border: '1px solid rgba(46,255,136,0.3)' }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {warehouse.length === 0 && (
          <div className="col-span-3 text-center py-16" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Package className="w-12 h-12 mx-auto mb-4" />
            <p>Nema artikala u skladištu</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderClientsView = () => (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold">Klijenti ({clients.length})</h2>
        {perms.clients === 'edit' && (
          <button
            onClick={() => setShowAddClientModal(true)}
            className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2"
            style={{ background: T.accent, color: '#000000' }}
          >
            <Plus className="w-5 h-5" /><span>Novi klijent</span>
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {clients.map((client) => (
          <div key={client.id} className="p-6 rounded-2xl" style={{
            background: 'rgba(10,40,52,0.55)',
            border: '1px solid rgba(120,220,255,0.12)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
          }}>
            <h3 className="font-semibold text-lg mb-1">{client.name}</h3>
            {client.location && (
              <div className="flex items-center gap-2 text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <MapPin className="w-4 h-4" /><span>{client.location}</span>
              </div>
            )}
            <div className="space-y-1 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {client.phone && (
                <div className="flex items-center gap-2"><Phone className="w-3 h-3" /><span>{client.phone}</span></div>
              )}
              {client.email && (
                <div className="flex items-center gap-2"><Mail className="w-3 h-3" /><span>{client.email}</span></div>
              )}
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <div className="col-span-2 text-center py-16" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <UserCog className="w-12 h-12 mx-auto mb-4" />
            <p>Nema klijenata</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMoreView = () => {
    const moreItems = [];
    if (perms.waterAnalysis) {
      moreItems.push({ id: 'water-analysis-full', icon: Droplets, label: 'Detaljno Testiranje', desc: 'Napredna analiza vode', color: '#2EFF88' });
    }
    moreItems.push({ id: 'products', icon: Package, label: 'Proizvodi', desc: 'Katalog proizvoda', color: '#5CE1E6' });
    moreItems.push({ id: 'stores', icon: MapPin, label: 'Prodajna Mjesta', desc: 'Lokacije trgovina', color: '#FFB020' });
    if (perms.visualizer) {
      moreItems.push({ id: 'visualizer', icon: Eye, label: 'Pool Visualizer', desc: 'AR vizualizacija bazena', color: '#5CE1E6' });
    }
    moreItems.push({ id: 'profile', icon: User, label: 'Profil', desc: 'Tvoje informacije', color: '#5CE1E6' });
    moreItems.push({ id: 'help', icon: Phone, label: 'Pomoć', desc: 'Kontakt i podrška', color: '#5CE1E6' });
    moreItems.push({ id: 'settings', icon: Settings, label: 'Postavke', desc: 'Podešavanja', color: '#FF3B30' });

    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-semibold mb-8">Dodatne Funkcije</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moreItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (item.id === 'water-analysis-full') onNavigate('water-analysis');
                else if (item.id === 'products') onNavigate('products');
                else if (item.id === 'stores') onNavigate('stores');
                else if (item.id === 'visualizer') onNavigate('visualizer');
                else alert(`${item.label} uskoro dostupno!`);
              }}
              className="p-8 rounded-3xl cursor-pointer backdrop-blur-xl group relative overflow-hidden"
              style={{ background: 'rgba(10,40,52,0.55)', border: '1px solid rgba(120,220,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${item.color}10 0%, transparent 100%)` }}></div>
              <div className="relative z-10">
                <item.icon className="w-12 h-12 mb-4" style={{ color: item.color }} />
                <h3 className="text-xl font-semibold mb-2">{item.label}</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative" style={{ background: T.pageBg }}>
      <WaterBackground />
      {/* Header */}
      <div className="relative z-10 p-6" style={{ background: 'rgba(2,13,18,0.7)', backdropFilter: 'blur(16px)', borderBottom: T.cardBorder }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentView !== 'home' && (
              <>
                <button onClick={() => window.history.back()} className="px-3 py-2 rounded-xl transition-all hover:scale-105 flex items-center gap-1 text-sm font-medium" style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  <ArrowLeft className="w-4 h-4" />
                  <span>Natrag</span>
                </button>
                <button onClick={() => goToView('home')} className="px-4 py-2 rounded-xl transition-all hover:scale-105" style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <Home className="w-5 h-5" />
                </button>
              </>
            )}
            <AquaSmartProLogo size="md" variant="employee" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => goToView('more')}
              className="px-4 py-2 rounded-xl font-medium transition-all hover:scale-105"
              style={{
                background: currentView === 'more' ? T.accent : 'transparent',
                color: '#000000',
                border: currentView === 'more' ? 'none' : '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <MoreHorizontal className="w-5 h-5" style={{ color: currentView === 'more' ? '#000' : '#fff' }} />
            </button>

            <button onClick={onBack} className="px-6 py-2 rounded-xl font-bold transition-all hover:scale-105" style={{
              background: T.accent,
              color: '#000000'
            }}>
              Odjava
            </button>
          </div>
        </div>
      </div>

      {/* Sync error bar */}
      {syncError && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm" style={{
            background: 'rgba(255,59,48,0.1)',
            border: '1px solid rgba(255,59,48,0.3)',
            color: '#FF3B30'
          }}>
            <span>{syncError}</span>
            <button onClick={load} className="px-3 py-1 rounded-lg font-medium ml-4 transition-all hover:scale-105" style={{ background: 'rgba(255,59,48,0.2)', border: '1px solid rgba(255,59,48,0.4)', color: '#FF3B30' }}>
              Osvježi
            </button>
          </div>
        </div>
      )}

      <TrialBanner />

      {/* Content */}
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderHomeView()}
          </motion.div>
        )}

        {currentView === 'work-orders' && (
          <motion.div key="work-orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderWorkOrdersView()}
          </motion.div>
        )}

        {currentView === 'water-analysis' && perms.waterAnalysis && (
          <motion.div key="water-analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderWaterAnalysisView()}
          </motion.div>
        )}

        {currentView === 'warehouse' && perms.warehouse !== 'none' && (
          <motion.div key="warehouse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderWarehouseView()}
          </motion.div>
        )}

        {currentView === 'clients' && perms.clients !== 'none' && (
          <motion.div key="clients" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderClientsView()}
          </motion.div>
        )}

        {currentView === 'more' && (
          <motion.div key="more" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderMoreView()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Work Order Details Modal */}
      <AnimatePresence>
        {selectedWorkOrder && (
          <WorkOrderDetailsModal
            order={selectedWorkOrder}
            onClose={() => setSelectedWorkOrder(null)}
            hidePrices={!perms.prices}
            readOnlyAssignee={true}
            warehouseProducts={warehouseProductList}
            clients={perms.clients !== 'none' ? clients.map(c => ({ id: c.id, name: c.name, location: c.location || '' })) : undefined}
            onSave={async (updatedOrder) => {
              const exists = workOrders.some(o => o.id === updatedOrder.id);
              const updated = exists
                ? workOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
                : [...workOrders, updatedOrder];
              updateWorkOrders(updated);
              if (live) {
                try { await api.post('work-orders', updatedOrder); }
                catch { setSyncError('Promjena nije spremljena na poslužitelj. Provjerite vezu i pokušajte ponovno.'); }
              }
              setSelectedWorkOrder(null);
            }}
            onPersist={async (updatedOrder) => {
              const exists = workOrders.some(o => o.id === updatedOrder.id);
              updateWorkOrders(exists
                ? workOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
                : [...workOrders, updatedOrder]);
              if (live) {
                try { await api.post('work-orders', updatedOrder); }
                catch { setSyncError('Početak rada nije spremljen na poslužitelj. Provjerite vezu i pritisnite Spremi.'); }
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Add Client Modal */}
      <AnimatePresence>
        {showAddClientModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setShowAddClientModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl"
              style={{ background: 'rgba(10,40,52,0.92)', border: '1px solid rgba(120,220,255,0.12)', backdropFilter: 'blur(20px)' }}
            >
              <div className="p-6" style={{ borderBottom: '1px solid rgba(120,220,255,0.12)' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Novi klijent</h2>
                  <button onClick={() => setShowAddClientModal(false)} className="p-2 rounded-lg transition-all hover:bg-white/10">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Ime *', value: newClientName, setter: setNewClientName, placeholder: 'Naziv klijenta' },
                  { label: 'Lokacija', value: newClientLocation, setter: setNewClientLocation, placeholder: 'Grad' },
                  { label: 'Telefon', value: newClientPhone, setter: setNewClientPhone, placeholder: '+385...' },
                  { label: 'E-mail', value: newClientEmail, setter: setNewClientEmail, placeholder: 'email@example.com' },
                ].map(({ label, value, setter, placeholder }) => (
                  <div key={label}>
                    <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: 'white', fontSize: '16px' }}
                    />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddClientModal(false)}
                    className="flex-1 px-4 py-2 rounded-xl font-medium"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Odustani
                  </button>
                  <button
                    onClick={handleSaveClient}
                    className="flex-1 px-4 py-2 rounded-xl font-bold"
                    style={{ background: T.accent, color: '#000000' }}
                  >
                    Spremi
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
