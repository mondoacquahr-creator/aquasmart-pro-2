import { useState, useRef, useCallback, useEffect } from 'react';
import { TrialBanner } from './TrialBanner';
import { CompanySettingsModal } from './CompanySettingsModal';
import { T } from '../lib/theme';
import { WaterBackground } from './WaterBackground';
import { motion, AnimatePresence } from 'motion/react';
import { Users, FileText, Package, BarChart3, MapPin, UserCog, Warehouse, Home, Plus, Download, Upload, Trash2, TrendingUp, TrendingDown, Calendar, Eye, Settings, MoreHorizontal, Droplets, CheckCircle, Clock, AlertCircle, Shield, Loader2, Copy, X, ArrowLeft } from 'lucide-react';
import { AquaSmartProLogo } from './AquaSmartProLogo';
import { ImportWizard, ImportField, ImportResult } from './ImportWizard';
import * as XLSX from 'xlsx';
import { WorkOrderDetailsModal } from './WorkOrderDetailsModal';
import { useLanguage } from '../lib/languageContext';
import { isLiveMode, isDemoMode, generatePassword, Permissions, DEFAULT_EMPLOYEE_PERMISSIONS } from '../lib/session';
import { api } from '../lib/supabase';
import { EmployeePermissionsEditor } from './EmployeePermissionsEditor';
import { loadCompanyData, saveChanges } from '../lib/companyData';
import { totalWorkLabel } from '../lib/workTime';
import { authService } from '../lib/auth';

interface EmployerDashboardProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  // Samo za Mondo admina: povratak na admin panel
  onAdminPanel?: () => void;
}

interface Client {
  id: string;
  name: string;
  location: string;
  pools: number;
  lastService: string;
  nextService: string;
  status: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  poolVolume?: number;
  poolType?: string;
}

interface WorkOrder {
  id: number;
  client: string;
  location: string;
  task: string;
  status: 'active' | 'pending' | 'completed';
  assignee: string;
  assigneeId?: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  disinfectionSystem?: 'klor' | 'so' | 'uv' | 'ozon' | '';
  maintenanceTasks?: MaintenanceTask[];
  services?: Service[];
  productsUsed?: ProductUsed[];
  totalCost?: number;
  workStartedAt?: string;
  workEndedAt?: string;
  completedAt?: string | null;
  completedBy?: string | null;
  reviewedAt?: string | null;
}

interface MaintenanceTask {
  id: number;
  name: string;
  completed: boolean;
  cost: number;
}

interface Service {
  id: number;
  name: string;
  description: string;
  cost: number;
}

interface ProductUsed {
  id: number;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalCost: number;
}

interface Employee {
  id: number | string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  tasks: number;
  location: string;
  performance: number;
  email?: string;
  permissions?: Permissions;
}

interface WarehouseItem {
  id: number;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  price?: number;
  code?: string;
  supplier?: string;
  notes?: string;
}

const STORAGE_KEYS = {
  CLIENTS: 'aquasmart_employer_clients',
  WORK_ORDERS: 'aquasmart_employer_work_orders',
  EMPLOYEES: 'aquasmart_employer_employees',
  WAREHOUSE: 'aquasmart_employer_warehouse',
};

export function EmployerDashboard({ onBack, onNavigate, onAdminPanel }: EmployerDashboardProps) {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<'home' | 'employees' | 'work-orders' | 'clients' | 'warehouse' | 'analytics' | 'more'>(() => {
    const saved = sessionStorage.getItem('employer_view');
    return (saved as any) || 'home';
  });
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior }); }, [currentView]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState<null | 'clients' | 'warehouse'>(null);
  const warehouseFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);

  // ── Add Employee Modal state ──────────────────────────────────────
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [addEmpName, setAddEmpName] = useState('');
  const [addEmpEmail, setAddEmpEmail] = useState('');
  const [addEmpPassword, setAddEmpPassword] = useState('');
  const [addEmpPosition, setAddEmpPosition] = useState('');
  const [addEmpLocation, setAddEmpLocation] = useState('');
  const [addEmpPerms, setAddEmpPerms] = useState<Permissions>({ ...DEFAULT_EMPLOYEE_PERMISSIONS });
  const [addEmpError, setAddEmpError] = useState('');
  const [addEmpSaving, setAddEmpSaving] = useState(false);
  const [addEmpSuccess, setAddEmpSuccess] = useState(false);
  const [addEmpMailed, setAddEmpMailed] = useState(false);
  const [addEmpWasLive, setAddEmpWasLive] = useState(false);
  const [addEmpCopied, setAddEmpCopied] = useState(false);

  // ── Live mode state ──────────────────────────────────────────────
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [showMigrationBanner, setShowMigrationBanner] = useState(false);
  const firstLoadDoneRef = useRef(false);
  const modalOpenRef = useRef(false);

  // ── Permissions Modal state ───────────────────────────────────────
  const [showPermModal, setShowPermModal] = useState(false);
  const [permEmployee, setPermEmployee] = useState<Employee | null>(null);
  const [permValue, setPermValue] = useState<Permissions>({ ...DEFAULT_EMPLOYEE_PERMISSIONS });
  const [permSaving, setPermSaving] = useState(false);
  const [permError, setPermError] = useState('');

  // Load data from localStorage
  const loadData = <T,>(key: string, defaultData: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultData;
    } catch {
      return defaultData;
    }
  };

  const saveData = <T,>(key: string, data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // State with localStorage persistence (empty in live mode, populated from server)
  const [showCompanySettings, setShowCompanySettings] = useState(false);
  const [clients, setClients] = useState<Client[]>(() => isDemoMode() ? loadData(STORAGE_KEYS.CLIENTS, [
    { id: '1', name: 'Hotel Adriatic', location: 'Split', pools: 3, lastService: '2026-02-25', nextService: '2026-03-10', status: 'active', phone: '+385 21 123 456', email: 'info@adriatic.hr' },
    { id: '2', name: 'Villa Sunset', location: 'Dubrovnik', pools: 1, lastService: '2026-02-20', nextService: '2026-03-05', status: 'active', phone: '+385 20 234 567', email: 'villa@sunset.hr' },
  ]) : []);

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => isDemoMode() ? loadData(STORAGE_KEYS.WORK_ORDERS, [
    { id: 1, client: 'Hotel Adriatic', location: 'Split', task: 'Čišćenje bazena', status: 'active', assignee: 'Marko Horvat', dueDate: '2026-02-27', priority: 'high' },
    { id: 2, client: 'Villa Sunset', location: 'Dubrovnik', task: 'Kemijsko uravnoteženje', status: 'pending', assignee: 'Ana Kovač', dueDate: '2026-02-28', priority: 'medium' },
  ]) : []);

  const [employees, setEmployees] = useState<Employee[]>(() => isDemoMode() ? loadData(STORAGE_KEYS.EMPLOYEES, [
    { id: 1, name: 'Marko Horvat', role: 'Serviser bazena', status: 'active', tasks: 8, location: 'Split', performance: 94 },
    { id: 2, name: 'Ana Kovač', role: 'Voditelj tima', status: 'active', tasks: 12, location: 'Dubrovnik', performance: 98 },
  ]) : []);

  const [warehouse, setWarehouse] = useState<WarehouseItem[]>(() => isDemoMode() ? loadData(STORAGE_KEYS.WAREHOUSE, []) : []);

  // ── Live mode data loading ─────────────────────────────────────────
  const load = useCallback(async () => {
    const data = await loadCompanyData();
    if (data) {
      const serverClients = (data.clients || []) as Client[];
      const serverOrders = (data['work-orders'] || []) as WorkOrder[];
      const serverEmployees = (data.employees || []) as Employee[];
      const serverWarehouse = (data.warehouse || []) as WarehouseItem[];
      setClients(serverClients);
      setWorkOrders(serverOrders);
      setEmployees(serverEmployees);
      setWarehouse(serverWarehouse);
      setSyncError('');

      if (!firstLoadDoneRef.current) {
        firstLoadDoneRef.current = true;
        const allEmpty = serverClients.length === 0 && serverOrders.length === 0 && serverWarehouse.length === 0;
        if (allEmpty) {
          try {
            const localC = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]');
            const localO = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORK_ORDERS) || '[]');
            const localW = JSON.parse(localStorage.getItem(STORAGE_KEYS.WAREHOUSE) || '[]');
            const hasLocal = localC.length > 0 || localO.length > 0 || localW.length > 0;
            const companyId = authService.getCurrentUser()?.id;
            const flagSet = companyId ? localStorage.getItem(`aquasmart_migrated_${companyId}`) : true;
            if (hasLocal && !flagSet) setShowMigrationBanner(true);
          } catch {}
        }
      }
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
        setLoading(true);
        load();
      }
    })();
  }, [load]);

  useEffect(() => {
    modalOpenRef.current = !!(selectedWorkOrder || showAddEmployeeModal || showPermModal);
  }, [selectedWorkOrder, showAddEmployeeModal, showPermModal]);

  useEffect(() => {
    if (!live) return;
    const handleFocus = () => { if (!modalOpenRef.current) load(); };
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(() => { if (!modalOpenRef.current) load(); }, 60000);
    return () => { window.removeEventListener('focus', handleFocus); clearInterval(interval); };
  }, [live, load]);

  const handleMigrate = async () => {
    setShowMigrationBanner(false);
    try {
      const localC: Client[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]');
      const localO: WorkOrder[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORK_ORDERS) || '[]');
      const localW: WarehouseItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.WAREHOUSE) || '[]');
      for (const item of localC) { try { await api.post('clients', item); } catch {} }
      for (const item of localO) { try { await api.post('work-orders', item); } catch {} }
      for (const item of localW) { try { await api.post('warehouse', item); } catch {} }
    } catch {}
    const companyId = authService.getCurrentUser()?.id;
    if (companyId) localStorage.setItem(`aquasmart_migrated_${companyId}`, '1');
    load();
  };

  const handleDismissMigration = () => {
    const companyId = authService.getCurrentUser()?.id;
    if (companyId) localStorage.setItem(`aquasmart_migrated_${companyId}`, '1');
    setShowMigrationBanner(false);
  };

  // Save to localStorage (demo) or server (live)
  const updateClients = async (newClients: Client[]) => {
    const previous = clients;
    setClients(newClients);
    if (live) {
      try { await saveChanges('clients', previous, newClients); }
      catch { setSyncError('Promjena nije spremljena na poslužitelj. Provjerite vezu i pokušajte ponovno.'); }
    } else {
      saveData(STORAGE_KEYS.CLIENTS, newClients);
    }
  };

  const updateWorkOrders = async (newOrders: WorkOrder[]) => {
    const previous = workOrders;
    setWorkOrders(newOrders);
    if (live) {
      try { await saveChanges('work-orders', previous, newOrders); }
      catch { setSyncError('Promjena nije spremljena na poslužitelj. Provjerite vezu i pokušajte ponovno.'); }
    } else {
      saveData(STORAGE_KEYS.WORK_ORDERS, newOrders);
    }
  };

  const updateEmployees = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    if (!live) saveData(STORAGE_KEYS.EMPLOYEES, newEmployees);
  };

  const updateWarehouse = async (newWarehouse: WarehouseItem[]) => {
    const previous = warehouse;
    setWarehouse(newWarehouse);
    if (live) {
      try { await saveChanges('warehouse', previous, newWarehouse); }
      catch { setSyncError('Promjena nije spremljena na poslužitelj. Provjerite vezu i pokušajte ponovno.'); }
    } else {
      saveData(STORAGE_KEYS.WAREHOUSE, newWarehouse);
    }
  };

  // ── View navigation with history ──────────────────────────────────
  type DashboardView = 'home' | 'employees' | 'work-orders' | 'clients' | 'warehouse' | 'analytics' | 'more';

  const goToView = useCallback((view: DashboardView) => {
    sessionStorage.setItem('employer_view', view);
    if (view === 'home') {
      window.history.replaceState({ page: 'pro-portal', view: 'home' }, '');
    } else {
      window.history.pushState({ page: 'pro-portal', view }, '');
    }
    setCurrentView(view);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('employer_view') || 'home';
    window.history.replaceState({ page: 'pro-portal', view: saved }, '');
    const handlePop = (event: PopStateEvent) => {
      if (event.state?.page === 'pro-portal') {
        const v = (event.state.view || 'home') as DashboardView;
        sessionStorage.setItem('employer_view', v);
        setCurrentView(v);
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // ── Čarobnjak za uvoz ────────────────────────────────────────────────────
  const CLIENT_FIELDS: ImportField[] = [
    { key: 'name', label: 'Ime i prezime / naziv', synonyms: ['klijent', 'kupac', 'naziv', 'ime i prezime', 'puno ime', 'tvrtka', 'name', 'customer', 'client'] },
    { key: 'firstName', label: 'Ime', synonyms: ['ime', 'first name', 'firstname'] },
    { key: 'lastName', label: 'Prezime', synonyms: ['prezime', 'last name', 'lastname', 'surname'] },
    { key: 'address', label: 'Adresa', synonyms: ['adresa', 'ulica', 'ulica i broj', 'address', 'street'] },
    { key: 'city', label: 'Mjesto', synonyms: ['mjesto', 'grad', 'lokacija', 'opcina', 'city', 'location', 'postanski broj i mjesto'] },
    { key: 'phone', label: 'Telefon', synonyms: ['telefon', 'mobitel', 'mob', 'tel', 'gsm', 'phone', 'mobile', 'broj telefona'] },
    { key: 'email', label: 'E-mail', synonyms: ['email', 'e mail', 'mail', 'e-posta'] },
    { key: 'pools', label: 'Broj bazena', type: 'number', synonyms: ['bazeni', 'broj bazena', 'brojbazena', 'pools'] },
    { key: 'poolVolume', label: 'Volumen bazena (m³)', type: 'number', synonyms: ['volumen', 'm3', 'zapremnina', 'kubikaza', 'volume'] },
    { key: 'poolType', label: 'Vrsta bazena', synonyms: ['vrsta bazena', 'tip bazena', 'bazen', 'pool type'] },
    { key: 'lastService', label: 'Zadnji servis', type: 'date', synonyms: ['zadnji servis', 'zadnjiservis', 'last service'] },
    { key: 'nextService', label: 'Sljedeći servis', type: 'date', synonyms: ['sljedeci servis', 'sljedeciservis', 'next service'] },
    { key: 'notes', label: 'Napomena', synonyms: ['napomena', 'biljeska', 'opis', 'notes', 'note', 'komentar'] },
  ];
  const WAREHOUSE_FIELDS: ImportField[] = [
    { key: 'name', label: 'Naziv artikla', required: true, synonyms: ['naziv', 'artikl', 'proizvod', 'opis artikla', 'name', 'item', 'product'] },
    { key: 'code', label: 'Šifra', synonyms: ['sifra', 'šifra', 'kod', 'code', 'sku', 'kataloski broj', 'ean'] },
    { key: 'category', label: 'Kategorija', synonyms: ['kategorija', 'grupa', 'vrsta', 'category', 'group'] },
    { key: 'unit', label: 'Jedinica mjere', synonyms: ['jedinica', 'jm', 'jed mj', 'mjera', 'unit', 'uom'] },
    { key: 'stock', label: 'Stanje (količina)', type: 'number', synonyms: ['stanje', 'kolicina', 'količina', 'zaliha', 'kom', 'qty', 'quantity', 'stock'] },
    { key: 'minStock', label: 'Minimalna zaliha', type: 'number', synonyms: ['minimalno', 'min', 'min zaliha', 'minimalna kolicina', 'min stock'] },
    { key: 'price', label: 'Cijena (€)', type: 'number', synonyms: ['cijena', 'vpc', 'mpc', 'nabavna cijena', 'price', 'eur'] },
    { key: 'supplier', label: 'Dobavljač', synonyms: ['dobavljac', 'dobavljač', 'supplier', 'proizvodac'] },
    { key: 'notes', label: 'Napomena', synonyms: ['napomena', 'opis', 'notes'] },
  ];
  const nkey = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
  const clientName = (r: Record<string, any>) => (r.name || [r.firstName, r.lastName].filter(Boolean).join(' ')).trim();

  const importClients = (rows: Record<string, any>[], mode: 'update' | 'skip'): ImportResult => {
    const list = [...clients];
    let added = 0, updated = 0, skipped = 0;
    const today = new Date().toISOString().split('T')[0];
    rows.forEach((r, i) => {
      const name = clientName(r);
      const data: Partial<Client> = {
        name, location: r.city, address: r.address, phone: r.phone, email: r.email,
        pools: r.pools !== undefined ? Math.max(1, Math.round(r.pools)) : undefined,
        poolVolume: r.poolVolume, poolType: r.poolType, notes: r.notes,
        lastService: r.lastService, nextService: r.nextService,
      };
      Object.keys(data).forEach((k) => (data as any)[k] === undefined && delete (data as any)[k]);
      const idx = list.findIndex((c) => nkey(c.name) === nkey(name));
      if (idx >= 0) {
        if (mode === 'skip') { skipped++; return; }
        list[idx] = { ...list[idx], ...data };
        updated++;
      } else {
        list.push({
          id: `import_${Date.now()}_${i}`, status: 'active', pools: 1, location: '',
          lastService: today, nextService: new Date(Date.now() + 14 * 864e5).toISOString().split('T')[0],
          ...data, name,
        } as Client);
        added++;
      }
    });
    updateClients(list);
    return { added, updated, skipped };
  };

  const importWarehouse = (rows: Record<string, any>[], mode: 'update' | 'skip'): ImportResult => {
    const list = [...warehouse];
    let added = 0, updated = 0, skipped = 0;
    rows.forEach((r, i) => {
      const data: Partial<WarehouseItem> = {
        name: String(r.name), code: r.code, category: r.category, unit: r.unit,
        stock: r.stock, minStock: r.minStock, price: r.price, supplier: r.supplier, notes: r.notes,
      };
      Object.keys(data).forEach((k) => (data as any)[k] === undefined && delete (data as any)[k]);
      const idx = list.findIndex((w) => (r.code && w.code && nkey(String(w.code)) === nkey(String(r.code))) || nkey(w.name) === nkey(String(r.name)));
      if (idx >= 0) {
        if (mode === 'skip') { skipped++; return; }
        list[idx] = { ...list[idx], ...data };
        updated++;
      } else {
        list.push({ id: Date.now() + i, category: 'Ostalo', unit: 'kom', stock: 0, minStock: 0, trend: 'stable', ...data } as WarehouseItem);
        added++;
      }
    });
    updateWarehouse(list);
    return { added, updated, skipped };
  };

  // Download Warehouse Excel Template
  const downloadWarehouseTemplate = () => {
    const template = [{
      'Naziv': 'Klor granule 56%',
      'Kategorija': 'Dezinfekcija',
      'Jedinica': 'kg',
      'Stanje': 25,
      'Minimalno': 10,
      'Cijena': 11.55,
    }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Skladište');
    XLSX.writeFile(wb, 'MondoPoolCare_Skladiste_Predlozak.xlsx');
  };

  // Excel Import for Warehouse
  const handleWarehouseImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);

        let newCount = 0;
        let updatedCount = 0;
        const updatedWarehouse = [...warehouse];

        json.forEach((row: any, index: number) => {
          const naziv = row['Naziv'] || row['naziv'];
          if (!naziv) return;
          const existingIdx = updatedWarehouse.findIndex(
            w => w.name.toLowerCase() === String(naziv).toLowerCase()
          );
          if (existingIdx >= 0) {
            updatedWarehouse[existingIdx] = {
              ...updatedWarehouse[existingIdx],
              category: row['Kategorija'] || row['kategorija'] || updatedWarehouse[existingIdx].category,
              unit: row['Jedinica'] || row['jedinica'] || updatedWarehouse[existingIdx].unit,
              minStock: Number(row['Minimalno'] ?? row['minimalno'] ?? updatedWarehouse[existingIdx].minStock) || 0,
              price: row['Cijena'] !== undefined ? Number(row['Cijena']) || undefined : updatedWarehouse[existingIdx].price,
              stock: Number(row['Stanje'] ?? row['stanje'] ?? 0) || 0,
            };
            updatedCount++;
          } else {
            updatedWarehouse.push({
              id: Date.now() + index,
              name: String(naziv),
              category: row['Kategorija'] || row['kategorija'] || 'Ostalo',
              unit: row['Jedinica'] || row['jedinica'] || 'kom',
              stock: Number(row['Stanje'] ?? row['stanje'] ?? 0) || 0,
              minStock: Number(row['Minimalno'] ?? row['minimalno'] ?? 0) || 0,
              price: row['Cijena'] !== undefined ? Number(row['Cijena']) || undefined : undefined,
              trend: 'stable',
            });
            newCount++;
          }
        });

        updateWarehouse(updatedWarehouse);
        alert(`✅ Uvezeno: ${newCount} novih, ${updatedCount} ažuriranih artikala.`);
        if (warehouseFileInputRef.current) warehouseFileInputRef.current.value = '';
      } catch (error) {
        alert('❌ Greška pri uvozu. Provjerite da datoteka ima stupce Naziv, Kategorija, Jedinica, Stanje, Minimalno, Cijena.');
        console.error('Warehouse import error:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Excel Import for Clients
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);

        const newClients: Client[] = json.map((row: any, index: number) => ({
          id: `import_${Date.now()}_${index}`,
          name: `${row.Ime || ''} ${row.Prezime || ''}`.trim() || row.Naziv || 'Nepoznato',
          location: row.Lokacija || row.Grad || 'N/A',
          pools: parseInt(row.Bazeni || row.BrojBazena || '1'),
          lastService: row.ZadnjiServis || new Date().toISOString().split('T')[0],
          nextService: row.SljedeciServis || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'active',
          phone: row.Mobitel || row.Telefon || '',
          email: row.Email || '',
        }));

        updateClients([...clients, ...newClients]);
        alert(`✅ Uspješno uvezeno ${newClients.length} klijenata!`);

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        alert('❌ Greška pri uvozenju datoteke. Provjerite format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Download Excel Template
  const downloadTemplate = () => {
    const template = [
      {
        'Ime': 'Marko',
        'Prezime': 'Horvat',
        'Lokacija': 'Split',
        'Bazeni': 2,
        'Mobitel': '+385 91 234 5678',
        'Email': 'marko@example.com',
        'ZadnjiServis': '2026-02-20',
        'SljedeciServis': '2026-03-05'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Klijenti');
    XLSX.writeFile(wb, 'MondoPoolCare_Klijenti_Predlozak.xlsx');
  };

  // Add functions
  const addClient = () => {
    const name = prompt('Ime klijenta:');
    if (!name) return;

    const location = prompt('Lokacija:');
    const pools = parseInt(prompt('Broj bazena:') || '1');

    const newClient: Client = {
      id: `manual_${Date.now()}`,
      name,
      location: location || 'N/A',
      pools: pools || 1,
      lastService: new Date().toISOString().split('T')[0],
      nextService: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      phone: '',
      email: '',
    };

    updateClients([...clients, newClient]);
  };

  const addWorkOrder = () => {
    const client = prompt('Klijent:');
    if (!client) return;

    const task = prompt('Zadatak:');
    const assignee = prompt('Izvršitelj:');

    const newOrder: WorkOrder = {
      id: Date.now(),
      client: client || 'N/A',
      location: 'N/A',
      task: task || 'N/A',
      status: 'pending',
      assignee: assignee || 'Neraspoređeno',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'medium',
    };

    updateWorkOrders([...workOrders, newOrder]);
  };

  // ── Add Employee Modal handlers ───────────────────────────────────
  const openAddEmployeeModal = () => {
    setAddEmpName('');
    setAddEmpEmail('');
    setAddEmpPassword(generatePassword());
    setAddEmpPosition('');
    setAddEmpLocation('');
    setAddEmpPerms({ ...DEFAULT_EMPLOYEE_PERMISSIONS });
    setAddEmpError('');
    setAddEmpSaving(false);
    setAddEmpSuccess(false);
    setAddEmpWasLive(false);
    setAddEmpCopied(false);
    setShowAddEmployeeModal(true);
  };

  const handleAddEmployee = async () => {
    if (!addEmpName.trim()) { setAddEmpError('Upišite ime.'); return; }
    if (!addEmpEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addEmpEmail)) {
      setAddEmpError('Neispravan e-mail.'); return;
    }
    if (addEmpPassword.length < 8) { setAddEmpError('Lozinka mora imati najmanje 8 znakova.'); return; }

    setAddEmpError('');
    setAddEmpSaving(true);

    const live = await isLiveMode();
    setAddEmpWasLive(live);

    if (live) {
      try {
        const res = await api.post('employees/create', {
          name: addEmpName,
          email: addEmpEmail,
          password: addEmpPassword,
          position: addEmpPosition || 'Serviser',
          location: addEmpLocation,
          permissions: addEmpPerms,
        });
        updateEmployees([...employees, res.employee]);
        setAddEmpMailed(res.emailSent === true);
        setAddEmpSaving(false);
        setAddEmpSuccess(true);
      } catch (err: any) {
        setAddEmpSaving(false);
        const msg: string = err.message || 'Greška pri dodavanju djelatnika.';
        setAddEmpError(msg.includes('već postoji') ? 'Djelatnik s tim e-mailom već postoji.' : msg);
      }
    } else {
      const newEmployee: Employee = {
        id: Date.now(),
        name: addEmpName,
        role: addEmpPosition || 'Serviser',
        location: addEmpLocation || 'N/A',
        status: 'active',
        tasks: 0,
        performance: 0,
        email: addEmpEmail,
        permissions: addEmpPerms,
      };
      updateEmployees([...employees, newEmployee]);
      // Sync to 'employees' key used by auth.ts for demo login
      try {
        const stored: any[] = JSON.parse(localStorage.getItem('employees') || '[]');
        const emailLower = addEmpEmail.toLowerCase();
        const filtered = stored.filter((e: any) => e.email?.toLowerCase() !== emailLower);
        filtered.push({
          id: String(newEmployee.id),
          email: addEmpEmail,
          password: addEmpPassword,
          name: addEmpName,
          permissions: addEmpPerms,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('employees', JSON.stringify(filtered));
      } catch {}
      setAddEmpSaving(false);
      setAddEmpSuccess(true);
    }
  };

  const handleCopyLoginData = () => {
    const text = `Mondo Pool Care – prijava\nAdresa: ${window.location.origin}\nE-mail: ${addEmpEmail}\nPrivremena lozinka: ${addEmpPassword}`;
    navigator.clipboard.writeText(text).catch(() => {});
    setAddEmpCopied(true);
    setTimeout(() => setAddEmpCopied(false), 2000);
  };

  // ── Permissions Modal handlers ────────────────────────────────────
  const openPermissionsModal = (employee: Employee) => {
    setPermEmployee(employee);
    setPermValue(employee.permissions ? { ...employee.permissions } : { ...DEFAULT_EMPLOYEE_PERMISSIONS });
    setPermError('');
    setPermSaving(false);
    setShowPermModal(true);
  };

  const handleSavePermissions = async () => {
    if (!permEmployee) return;
    setPermSaving(true);
    setPermError('');

    const live = await isLiveMode();
    if (live) {
      try {
        const res = await api.post(`employees/${permEmployee.id}/permissions`, { permissions: permValue });
        updateEmployees(employees.map(e => e.id === permEmployee.id ? res.employee : e));
        setPermSaving(false);
        setShowPermModal(false);
      } catch (err: any) {
        setPermSaving(false);
        setPermError(err.message || 'Greška pri spremanju ovlasti.');
      }
    } else {
      updateEmployees(employees.map(e => e.id === permEmployee.id ? { ...e, permissions: permValue } : e));
      // Sync permissions to 'employees' key used by auth.ts
      try {
        const stored: any[] = JSON.parse(localStorage.getItem('employees') || '[]');
        const empId = String(permEmployee.id);
        const updated = stored.map((e: any) =>
          String(e.id) === empId ? { ...e, permissions: permValue } : e
        );
        localStorage.setItem('employees', JSON.stringify(updated));
      } catch {}
      setPermSaving(false);
      setShowPermModal(false);
    }
  };

  // ── Employee deletion / deactivation ─────────────────────────────
  const deleteEmployee = async (id: number | string) => {
    const live = await isLiveMode();
    if (live) {
      if (confirm('Deaktivirati djelatnika? Više se neće moći prijaviti.')) {
        try {
          const res = await api.post(`employees/${id}/deactivate`, {});
          updateEmployees(employees.map(e => e.id === id ? res.employee : e));
        } catch (err: any) {
          alert(err.message || 'Greška pri deaktivaciji.');
        }
      }
    } else {
      if (confirm('Želite li obrisati ovog djelatnika?')) {
        updateEmployees(employees.filter(e => e.id !== id));
        // Remove from 'employees' key used by auth.ts
        try {
          const stored: any[] = JSON.parse(localStorage.getItem('employees') || '[]');
          localStorage.setItem('employees', JSON.stringify(stored.filter((e: any) => String(e.id) !== String(id))));
        } catch {}
      }
    }
  };

  const activateEmployee = async (id: number | string) => {
    try {
      const res = await api.post(`employees/${id}/activate`, {});
      updateEmployees(employees.map(e => e.id === id ? res.employee : e));
    } catch (err: any) {
      alert(err.message || 'Greška pri aktivaciji.');
    }
  };

  const addWarehouseItem = () => {
    const name = prompt('Naziv artikla:');
    if (!name) return;

    const stock = parseInt(prompt('Trenutno stanje:') || '0');
    const unit = prompt('Jedinica (kg/L):') || 'kg';
    const minStock = parseInt(prompt('Minimalno stanje:') || '50');

    const newItem: WarehouseItem = {
      id: Date.now(),
      name,
      stock,
      unit,
      minStock,
      trend: 'stable',
      category: 'Ostalo',
    };

    updateWarehouse([...warehouse, newItem]);
  };

  // Delete functions
  const deleteClient = (id: string) => {
    if (confirm('Želite li obrisati ovog klijenta?')) {
      updateClients(clients.filter(c => c.id !== id));
    }
  };

  const deleteWorkOrder = (id: number) => {
    if (confirm('Želite li obrisati ovaj radni nalog?')) {
      updateWorkOrders(workOrders.filter(w => w.id !== id));
    }
  };

  const deleteWarehouseItem = (id: number) => {
    if (confirm('Želite li obrisati ovaj artikl?')) {
      updateWarehouse(warehouse.filter(w => w.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#2EFF88';
      case 'pending': return '#FFB020';
      case 'completed': return '#D4A853';
      case 'high': return '#FF3B30';
      case 'medium': return '#FFB020';
      case 'low': return '#2EFF88';
      default: return 'rgba(255,255,255,0.45)';
    }
  };

  // ── Shared modal style helpers ─────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    background: 'rgba(2,13,18,0.6)',
    border: '1px solid rgba(120,220,255,0.18)',
    color: '#fff',
    fontSize: '16px',
  };

  // Main Dashboard Home View
  // Nalozi koje je djelatnik zatvorio, a vlasnik još nije pregledao
  const toReview = workOrders
    .filter(o => o.status === 'completed' && o.completedAt && !o.reviewedAt)
    .sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)));
  const markReviewed = (id: number | string) => {
    updateWorkOrders(workOrders.map(o => o.id === id ? { ...o, reviewedAt: new Date().toISOString() } : o));
  };

  const renderHomeView = () => {
    const activeOrPendingCount = workOrders.filter(o => o.status === 'active' || o.status === 'pending').length;
    const belowMinCount = warehouse.filter(w => w.stock <= w.minStock).length;

    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Pregled <span className="gradient-gold">Poslodavac</span>
        </h1>
        {loading && <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>Učitavanje…</p>}

        {/* Završeni nalozi za pregled */}
        {toReview.length > 0 && (
          <div className="rounded-2xl mb-6 overflow-hidden" style={{ background: 'rgba(46,255,136,0.06)', border: '1px solid rgba(46,255,136,0.3)' }}>
            <p className="px-4 pt-4 pb-2 font-semibold flex items-center gap-2" style={{ color: '#2EFF88' }}>
              <CheckCircle className="w-5 h-5" /> Završeni nalozi za pregled ({toReview.length})
            </p>
            {toReview.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center gap-3 px-4 py-3" style={{ borderTop: '1px solid rgba(46,255,136,0.15)' }}>
                <div className="flex-1 min-w-[180px]">
                  <p className="font-semibold text-sm">#{o.id} · {o.client}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {o.completedBy || o.assignee}{o.completedAt ? ` · ${new Date(o.completedAt).toLocaleString('hr-HR', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''}
                    {o.workStartedAt && o.workEndedAt ? ` · rad ${totalWorkLabel(o.workStartedAt, o.workEndedAt)}` : ''}
                  </p>
                </div>
                <button onClick={() => setSelectedWorkOrder(o)} className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5" style={{ background: 'rgba(92,225,230,0.1)', color: '#5CE1E6', border: '1px solid rgba(92,225,230,0.25)' }}>
                  <Eye className="w-4 h-4" /> Otvori
                </button>
                <button onClick={() => markReviewed(o.id)} className="px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5" style={{ background: '#2EFF88', color: '#000' }}>
                  <CheckCircle className="w-4 h-4" /> Pregledano
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Summary strip */}
        <div
          className="flex flex-wrap items-center gap-2 rounded-2xl mb-6 text-sm"
          style={{
            background: 'rgba(10,40,52,0.55)',
            border: '1px solid rgba(120,220,255,0.12)',
            padding: '12px 16px',
          }}
        >
          <span className="flex items-center gap-1 font-semibold" style={{ color: '#5CE1E6' }}>
            <Clock className="w-3.5 h-3.5" />
            Danas
          </span>
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>·</span>
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>{activeOrPendingCount} u tijeku</span>
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>·</span>
          {belowMinCount > 0 ? (
            <span style={{ color: '#FFB020' }}>{belowMinCount} ispod minimuma</span>
          ) : (
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>Skladište u redu</span>
          )}
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>·</span>
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>{employees.length} djelatnika</span>
        </div>

        {/* Main Menu Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          {[
            { id: 'employees', icon: Users, label: 'Djelatnici', count: employees.length },
            { id: 'work-orders', icon: FileText, label: 'Radni Nalozi', count: workOrders.length },
            { id: 'warehouse', icon: Warehouse, label: 'Skladište', count: warehouse.length },
            { id: 'clients', icon: UserCog, label: 'Klijenti', count: clients.length },
          ].map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => goToView(item.id as any)}
              className="p-4 lg:p-8 rounded-3xl cursor-pointer backdrop-blur-xl group relative overflow-hidden"
              style={{
                background: 'rgba(10,40,52,0.55)',
                border: '1px solid rgba(120,220,255,0.12)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(135deg, rgba(92,225,230,0.08) 0%, transparent 100%)' }}></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 lg:mb-6">
                  <item.icon className="w-8 h-8 lg:w-12 lg:h-12" style={{ color: '#5CE1E6' }} />
                  <div className="text-xl lg:text-2xl font-bold" style={{ color: '#5CE1E6' }}>{item.count}</div>
                </div>
                <h3 className="text-base lg:text-xl font-semibold">{item.label}</h3>
                <p className="text-sm mt-1 lg:mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Upravljaj {item.label.toLowerCase()}
                </p>
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
      {importing === 'clients' && (
        <ImportWizard
          title="Uvoz klijenata"
          storageKey="mpc_import_map_clients"
          fields={CLIENT_FIELDS}
          existingNames={clients.map((c) => c.name)}
          duplicateLabel="Klijent već postoji"
          mappingCheck={(keys) => (keys.includes('name') || keys.includes('firstName') || keys.includes('lastName') ? null : 'Povežite stupac s imenom klijenta (Ime i prezime / naziv, ili Ime i Prezime).')}
          validate={(r) => (clientName(r) ? null : 'Nedostaje ime klijenta')}
          onImport={importClients}
          onClose={() => setImporting(null)}
        />
      )}
      {importing === 'warehouse' && (
        <ImportWizard
          title="Uvoz skladišta"
          storageKey="mpc_import_map_warehouse"
          fields={WAREHOUSE_FIELDS}
          existingNames={warehouse.map((w) => w.name)}
          duplicateLabel="Artikl već postoji"
          onImport={importWarehouse}
          onClose={() => setImporting(null)}
        />
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleExcelImport}
        accept=".xlsx,.xls"
        className="hidden"
      />
      <input
        type="file"
        ref={warehouseFileInputRef}
        onChange={handleWarehouseImport}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

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

            <AquaSmartProLogo size="md" variant="employer" />
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

      {/* Migration banner */}
      {showMigrationBanner && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm" style={{
            background: 'rgba(212,168,83,0.08)',
            border: '1px solid rgba(212,168,83,0.5)',
            color: 'rgba(255,255,255,0.85)'
          }}>
            <span>Na ovom uređaju postoje podaci spremljeni prije povezivanja s oblakom. Prenijeti ih u vašu tvrtku?</span>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <button onClick={handleMigrate} className="px-3 py-1 rounded-lg font-semibold transition-all hover:scale-105" style={{ background: '#D4A853', color: '#000000' }}>
                Prenesi
              </button>
              <button onClick={handleDismissMigration} className="px-3 py-1 rounded-lg font-medium transition-all hover:scale-105" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Ne, hvala
              </button>
            </div>
          </div>
        </div>
      )}

      {onAdminPanel && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <button onClick={onAdminPanel} className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{ background: 'rgba(92,225,230,0.1)', border: '1px solid rgba(92,225,230,0.35)', color: '#5CE1E6' }}>
            <ArrowLeft className="w-4 h-4" /> Mondo admin panel (upiti, narudžbe, članovi, serviseri)
          </button>
        </div>
      )}
      <TrialBanner />
      {showCompanySettings && <CompanySettingsModal onClose={() => setShowCompanySettings(false)} />}

      {/* Content */}
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderHomeView()}
          </motion.div>
        )}

        {currentView === 'employees' && (
          <motion.div key="employees" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-semibold">Djelatnici ({employees.length})</h2>
                <button
                  onClick={openAddEmployeeModal}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all hover:scale-105"
                  style={{ background: T.accent, color: '#000000' }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Novi Djelatnik</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="p-6 rounded-2xl group transition-all"
                    style={{
                      background: 'rgba(10,40,52,0.55)',
                      border: '1px solid rgba(120,220,255,0.12)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                      opacity: employee.status === 'inactive' ? 0.5 : 1,
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{employee.name}</h3>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{employee.role}</p>
                        {employee.email && (
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{employee.email}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold" style={{
                          background: employee.status === 'active' ? 'rgba(46,255,136,0.2)' : 'rgba(255,255,255,0.1)',
                          color: employee.status === 'active' ? '#2EFF88' : 'rgba(255,255,255,0.5)'
                        }}>
                          {employee.status === 'active' ? 'AKTIVAN' : 'NEAKTIVAN'}
                        </span>

                        <button
                          onClick={() => openPermissionsModal(employee)}
                          className="px-2 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
                          style={{ background: 'rgba(92,225,230,0.12)', color: '#5CE1E6', border: '1px solid rgba(92,225,230,0.3)' }}
                        >
                          Ovlasti
                        </button>

                        {employee.status === 'inactive' ? (
                          <button
                            onClick={() => activateEmployee(employee.id)}
                            className="px-2 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
                            style={{ background: 'rgba(46,255,136,0.15)', color: '#2EFF88', border: '1px solid rgba(46,255,136,0.3)' }}
                          >
                            Aktiviraj
                          </button>
                        ) : (
                          <button
                            onClick={() => deleteEmployee(employee.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <div>📍 {employee.location}</div>
                      <div>📋 {workOrders.filter(o => o.status !== 'completed' && (o.assigneeId ? o.assigneeId === String(employee.id) : o.assignee === employee.name)).length} aktivnih zadataka</div>
                      <div>📊 Učinak: {employee.performance}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {currentView === 'work-orders' && (
          <motion.div key="work-orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-semibold">Radni Nalozi ({workOrders.length})</h2>
                <button onClick={() => {
                  setSelectedWorkOrder({
                    id: Date.now(),
                    client: '',
                    location: '',
                    task: 'Novi radni nalog',
                    status: 'pending',
                    assignee: '',
                    dueDate: new Date().toISOString().split('T')[0],
                    priority: 'medium',
                  });
                }} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all hover:scale-105" style={{ background: T.accent, color: '#000000' }}>
                  <Plus className="w-4 h-4" />
                  <span>Novi Nalog</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {workOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedWorkOrder(order)}
                    className="p-6 rounded-2xl group cursor-pointer hover:scale-[1.02] transition-all"
                    style={{ background: 'rgba(10,40,52,0.55)', border: '1px solid rgba(120,220,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{order.client}</h3>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{order.task}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold" style={{
                          background: `${getStatusColor(order.status)}20`,
                          color: getStatusColor(order.status)
                        }}>
                          {order.status === 'active' ? 'AKTIVNO' : order.status === 'pending' ? 'NA ČEKANJU' : 'ZAVRŠENO'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWorkOrder(order.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{order.location}</span></div>
                      <div className="flex items-center gap-2"><UserCog className="w-4 h-4" /><span>{order.assignee}</span></div>
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{order.dueDate}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {currentView === 'clients' && (
          <motion.div key="clients" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-semibold">Klijenti ({clients.length})</h2>
                <div className="flex gap-2">
                  <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }}>
                    <Download className="w-4 h-4" />
                    <span>Predložak</span>
                  </button>
                  <button onClick={() => setImporting('clients')} className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105" style={{ background: 'rgba(92,225,230,0.1)', border: '1px solid rgba(92,225,230,0.3)', color: '#5CE1E6' }}>
                    <Upload className="w-4 h-4" />
                    <span>Uvoz iz Excela</span>
                  </button>
                  <button onClick={addClient} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all hover:scale-105" style={{ background: T.accent, color: '#000000' }}>
                    <Plus className="w-4 h-4" />
                    <span>Novi Klijent</span>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {clients.map((client) => (
                  <div key={client.id} className="p-6 rounded-2xl group" style={{ background: 'rgba(10,40,52,0.55)', border: '1px solid rgba(120,220,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg flex-1">{client.name}</h3>
                      <button onClick={() => deleteClient(client.id)} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all hover:bg-red-500/20">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <div>📍 {client.location}</div>
                      <div>🏊 {client.pools} bazen(a)</div>
                      <div>📅 Zadnji: {client.lastService}</div>
                      <div>📅 Sljedeći: {client.nextService}</div>
                      {client.phone && <div>📞 {client.phone}</div>}
                      {client.email && <div>✉️ {client.email}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {currentView === 'warehouse' && (
          <motion.div key="warehouse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-2xl sm:text-3xl font-semibold">Skladište ({warehouse.length} artikala)</h2>
                <div className="flex flex-wrap gap-2">
                  <button onClick={downloadWarehouseTemplate} className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }}>
                    <Download className="w-4 h-4" />
                    <span>Predložak</span>
                  </button>
                  <button onClick={() => setImporting('warehouse')} className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105" style={{ background: 'rgba(92,225,230,0.1)', border: '1px solid rgba(92,225,230,0.3)', color: '#5CE1E6' }}>
                    <Upload className="w-4 h-4" />
                    <span>Uvoz iz Excela</span>
                  </button>
                  <button onClick={addWarehouseItem} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all hover:scale-105" style={{ background: T.accent, color: '#000000' }}>
                    <Plus className="w-4 h-4" />
                    <span>Novi Artikl</span>
                  </button>
                </div>
              </div>

              {warehouse.length === 0 && (
                <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Warehouse className="w-12 h-12 mx-auto mb-4 opacity-40" />
                  <p>Skladište je prazno. Dodajte artikle ručno ili ih uvezite iz Excela.</p>
                </div>
              )}

              {warehouse.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(10,40,52,0.55)', border: '1px solid rgba(120,220,255,0.12)' }}>
                  {warehouse.map((item, i) => {
                    const low = item.stock < item.minStock;
                    return (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i ? '1px solid rgba(120,220,255,0.08)' : 'none' }}>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{item.name}</p>
                          <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            {item.category}{item.price !== undefined ? ` · ${item.price.toFixed(2).replace('.', ',')} €` : ''}
                          </p>
                        </div>
                        {item.trend === 'up' && <TrendingUp className="w-4 h-4 shrink-0" style={{ color: '#2EFF88' }} />}
                        {item.trend === 'down' && <TrendingDown className="w-4 h-4 shrink-0" style={{ color: '#FF3B30' }} />}
                        <div className="text-right shrink-0">
                          <p className="font-bold text-sm" style={{ color: low ? '#FF3B30' : '#5CE1E6' }}>{item.stock} {item.unit}</p>
                          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>min {item.minStock}</p>
                        </div>
                        <button onClick={() => deleteWarehouseItem(item.id)} aria-label="Obriši artikl" className="p-2 rounded-lg shrink-0 transition-all hover:bg-red-500/20">
                          <Trash2 className="w-4 h-4 text-red-500" style={{ opacity: 0.7 }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {currentView === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="max-w-7xl mx-auto px-6 py-8">
              <h2 className="text-3xl font-semibold mb-8">📊 Analitika i Statistika</h2>

              {/* Top KPIs */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <motion.div whileHover={{ y: -4 }} className="p-6 rounded-2xl" style={{
                  background: 'rgba(10,40,52,0.55)',
                  border: '1px solid rgba(120,220,255,0.12)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
                }}>
                  <div className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Ukupno Bazena</div>
                  <div className="text-4xl font-bold" style={{ color: '#2EFF88' }}>
                    {clients.reduce((sum, c) => sum + c.pools, 0)}
                  </div>
                  <div className="text-xs mt-2 flex items-center gap-1" style={{ color: '#2EFF88' }}>
                    <TrendingUp className="w-3 h-3" />
                    <span>+12% ovaj mjesec</span>
                  </div>
                </motion.div>

                <motion.div whileHover={{ y: -4 }} className="p-6 rounded-2xl" style={{
                  background: 'rgba(10,40,52,0.55)',
                  border: '1px solid rgba(120,220,255,0.12)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
                }}>
                  <div className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Aktivni Nalozi</div>
                  <div className="text-4xl font-bold" style={{ color: '#5CE1E6' }}>
                    {workOrders.filter(w => w.status === 'active').length}
                  </div>
                  <div className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    od {workOrders.length} ukupno
                  </div>
                </motion.div>

                <motion.div whileHover={{ y: -4 }} className="p-6 rounded-2xl" style={{
                  background: 'rgba(10,40,52,0.55)',
                  border: '1px solid rgba(120,220,255,0.12)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
                }}>
                  <div className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Prosječni učinak</div>
                  <div className="text-4xl font-bold" style={{ color: '#5CE1E6' }}>
                    {employees.length > 0
                      ? Math.round(employees.reduce((sum, e) => sum + e.performance, 0) / employees.length)
                      : 0}%
                  </div>
                  <div className="text-xs mt-2 flex items-center gap-1" style={{ color: '#5CE1E6' }}>
                    <TrendingUp className="w-3 h-3" />
                    <span>+5% vs prošli mjesec</span>
                  </div>
                </motion.div>

                <motion.div whileHover={{ y: -4 }} className="p-6 rounded-2xl" style={{
                  background: 'rgba(10,40,52,0.55)',
                  border: '1px solid rgba(120,220,255,0.12)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
                }}>
                  <div className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Niska Zaliha</div>
                  <div className="text-4xl font-bold" style={{ color: warehouse.filter(w => w.stock < w.minStock).length > 0 ? '#FF3B30' : '#5CE1E6' }}>
                    {warehouse.filter(w => w.stock < w.minStock).length}
                  </div>
                  <div className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    artikala za naručiti
                  </div>
                </motion.div>
              </div>

              {/* Performance by Employee */}
              <div className="mb-8 p-8 rounded-3xl" style={{
                background: T.cardBg,
                border: T.cardBorder,
                boxShadow: T.cardShadow
              }}>
                <h3 className="text-xl font-semibold mb-6">Učinak djelatnika</h3>
                <div className="space-y-4">
                  {employees.map((emp) => (
                    <div key={emp.id} className="flex items-center gap-4">
                      <div className="w-32 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{emp.name}</div>
                      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${emp.performance}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{
                            background: emp.performance >= 95
                              ? 'linear-gradient(90deg, #2EFF88 0%, #00FF7F 100%)'
                              : emp.performance >= 80
                                ? 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)'
                                : 'linear-gradient(90deg, #FF3B30 0%, #FF6B6B 100%)'
                          }}
                        />
                      </div>
                      <div className="w-16 text-right font-bold" style={{
                        color: emp.performance >= 95 ? '#2EFF88' : emp.performance >= 80 ? '#FFD700' : '#FF3B30'
                      }}>
                        {emp.performance}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Orders Status */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-8 rounded-3xl" style={{
                  background: 'rgba(10,40,52,0.55)',
                  border: '1px solid rgba(120,220,255,0.12)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
                }}>
                  <h3 className="text-xl font-semibold mb-6">Status Radnih Naloga</h3>
                  <div className="space-y-4">
                    {[
                      { status: 'active', label: 'Aktivno', color: '#2EFF88' },
                      { status: 'pending', label: 'Na čekanju', color: '#FFB020' },
                      { status: 'completed', label: 'Završeno', color: '#D4A853' }
                    ].map((item) => {
                      const count = workOrders.filter(w => w.status === item.status).length;
                      const percentage = workOrders.length > 0 ? (count / workOrders.length) * 100 : 0;

                      return (
                        <div key={item.status}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.label}</span>
                            <span className="text-sm font-bold" style={{ color: item.color }}>{count}</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8 }}
                              className="h-full rounded-full"
                              style={{ background: item.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-8 rounded-3xl" style={{
                  background: 'rgba(10,40,52,0.55)',
                  border: '1px solid rgba(120,220,255,0.12)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
                }}>
                  <h3 className="text-xl font-semibold mb-6">Pregled skladišta</h3>
                  <div className="space-y-4">
                    {warehouse.slice(0, 5).map((item) => {
                      const stockPercent = (item.stock / item.minStock) * 100;

                      return (
                        <div key={item.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.name}</span>
                            <span className="text-xs font-bold" style={{
                              color: item.stock < item.minStock ? '#FF3B30' : '#2EFF88'
                            }}>
                              {item.stock} / {item.minStock} {item.unit}
                            </span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(stockPercent, 100)}%` }}
                              transition={{ duration: 0.8 }}
                              className="h-full rounded-full"
                              style={{
                                background: item.stock < item.minStock
                                  ? 'linear-gradient(90deg, #FF3B30 0%, #FF6B6B 100%)'
                                  : 'linear-gradient(90deg, #2EFF88 0%, #00FF7F 100%)'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Location Breakdown */}
              <div className="p-8 rounded-3xl" style={{
                background: T.cardBg,
                border: T.cardBorder,
                boxShadow: T.cardShadow
              }}>
                <h3 className="text-xl font-semibold mb-6">Klijenti po Lokacijama</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[...new Set(clients.map(c => c.location))].map((location) => {
                    const count = clients.filter(c => c.location === location).length;
                    const totalPools = clients.filter(c => c.location === location).reduce((sum, c) => sum + c.pools, 0);

                    return (
                      <motion.div
                        key={location}
                        whileHover={{ y: -4 }}
                        className="p-6 rounded-2xl"
                        style={{
                          background: 'rgba(92,225,230,0.05)',
                          border: '1px solid rgba(92,225,230,0.2)'
                        }}
                      >
                        <MapPin className="w-6 h-6 mb-3" style={{ color: '#5CE1E6' }} />
                        <div className="text-2xl font-bold" style={{ color: '#5CE1E6' }}>{count}</div>
                        <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {location}
                        </div>
                        <div className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {totalPools} bazena
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentView === 'more' && (
          <motion.div key="more" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="max-w-7xl mx-auto px-6 py-8">
              <h2 className="text-3xl font-semibold mb-8">Dodatne Funkcije</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 'analytics', icon: BarChart3, label: 'Analitika', desc: 'Statistike i izvještaji', color: '#5CE1E6' },
                  { id: 'water-analysis', icon: Droplets, label: 'Analiza Vode', desc: 'Testiranje vode', color: '#2EFF88' },
                  { id: 'products', icon: Package, label: 'Proizvodi', desc: 'Katalog proizvoda', color: '#5CE1E6' },
                  { id: 'stores', icon: MapPin, label: 'Prodajna Mjesta', desc: 'Lokacije trgovina', color: '#FFB020' },
                  { id: 'settings', icon: Settings, label: 'Postavke tvrtke', desc: 'Naziv, OIB, adresa i IBAN za ponude', color: '#FF3B30' },
                ].map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (item.id === 'visualizer') onNavigate('visualizer');
                      else if (item.id === 'analytics') goToView('analytics');
                      else if (item.id === 'water-analysis') onNavigate('water-analysis');
                      else if (item.id === 'products') onNavigate('products');
                      else if (item.id === 'stores') onNavigate('stores');
                      else if (item.id === 'settings') setShowCompanySettings(true);
                      else alert(`${item.label} uskoro dostupno!`);
                    }}
                    className="p-8 rounded-3xl cursor-pointer backdrop-blur-xl group relative overflow-hidden"
                    style={{
                      background: 'rgba(10,40,52,0.55)',
                      border: '1px solid rgba(120,220,255,0.12)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                    }}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Work Order Details Modal */}
      <AnimatePresence>
        {selectedWorkOrder && (
          <WorkOrderDetailsModal
            order={selectedWorkOrder}
            onClose={() => setSelectedWorkOrder(null)}
            clients={clients.map(c => ({ id: c.id, name: c.name, location: c.location }))}
            employees={employees.filter(e => e.status !== 'inactive').map(e => ({ id: e.id, name: e.name }))}
            warehouseProducts={warehouse.map(w => ({ id: w.id, name: w.name, unit: w.unit }))}
            onSave={(updatedOrder) => {
              const exists = workOrders.some(o => o.id === updatedOrder.id);
              const updated = exists
                ? workOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
                : [...workOrders, updatedOrder];
              updateWorkOrders(updated);
              setSelectedWorkOrder(null);
            }}
            onPersist={(updatedOrder) => {
              const exists = workOrders.some(o => o.id === updatedOrder.id);
              updateWorkOrders(exists
                ? workOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
                : [...workOrders, updatedOrder]);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Add Employee Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddEmployeeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: 'rgba(10,40,52,0.92)', border: '1px solid rgba(120,220,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', backdropFilter: 'blur(20px)' }}
            >
              <div className="p-6" style={{ borderBottom: '1px solid rgba(120,220,255,0.12)' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Novi djelatnik</h2>
                  <button onClick={() => setShowAddEmployeeModal(false)} className="p-2 rounded-lg transition-all hover:bg-white/10">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto" style={{ maxHeight: '72vh' }}>
                {addEmpSuccess ? (
                  <div>
                    <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {addEmpMailed
                        ? 'Djelatnik je dodan. Pristupni podaci i poveznica za prijavu poslani su mu e-mailom. Za svaki slučaj ih možete i kopirati:'
                        : 'Djelatnik je dodan. E-mail djelatniku nije poslan, pa mu pošaljite podatke za prvu prijavu:'}
                    </p>
                    <div className="p-4 rounded-xl font-mono text-sm mb-4" style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)' }}>
                      <div>E-mail: <span style={{ color: '#5CE1E6' }}>{addEmpEmail}</span></div>
                      <div>Privremena lozinka: <span style={{ color: '#5CE1E6' }}>{addEmpPassword}</span></div>
                    </div>
                    {!addEmpWasLive && (
                      <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        (demo – račun na poslužitelju nije stvoren)
                      </p>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={handleCopyLoginData}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all hover:scale-105"
                        style={{ background: T.accent, color: '#000000' }}
                      >
                        <Copy className="w-4 h-4" />
                        {addEmpCopied ? 'Kopirano ✓' : 'Kopiraj podatke'}
                      </button>
                      <button
                        onClick={() => setShowAddEmployeeModal(false)}
                        className="px-4 py-2 rounded-xl font-medium transition-all hover:scale-105"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        Zatvori
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addEmpError && (
                      <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF6B6B' }}>
                        {addEmpError}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Ime i prezime *</label>
                      <input
                        value={addEmpName}
                        onChange={e => setAddEmpName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl outline-none"
                        style={inputStyle}
                        placeholder="Marko Horvat"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>E-mail *</label>
                      <input
                        type="email"
                        value={addEmpEmail}
                        onChange={e => setAddEmpEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl outline-none"
                        style={inputStyle}
                        placeholder="marko@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Privremena lozinka *</label>
                      <div className="flex gap-2">
                        <input
                          value={addEmpPassword}
                          onChange={e => setAddEmpPassword(e.target.value)}
                          className="flex-1 px-4 py-3 rounded-xl outline-none"
                          style={inputStyle}
                        />
                        <button
                          type="button"
                          onClick={() => setAddEmpPassword(generatePassword())}
                          className="px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                          style={{ background: 'rgba(92,225,230,0.12)', color: '#5CE1E6', border: '1px solid rgba(92,225,230,0.3)' }}
                        >
                          Generiraj
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Pozicija</label>
                      <input
                        value={addEmpPosition}
                        onChange={e => setAddEmpPosition(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl outline-none"
                        style={inputStyle}
                        placeholder="Serviser"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Lokacija</label>
                      <input
                        value={addEmpLocation}
                        onChange={e => setAddEmpLocation(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl outline-none"
                        style={inputStyle}
                        placeholder="Split"
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.8)' }}>Ovlasti</h3>
                      <EmployeePermissionsEditor value={addEmpPerms} onChange={setAddEmpPerms} />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleAddEmployee}
                        disabled={addEmpSaving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-60"
                        style={{ background: T.accent, color: '#000000' }}
                      >
                        {addEmpSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {addEmpSaving ? 'Spremanje...' : 'Dodaj djelatnika'}
                      </button>
                      <button
                        onClick={() => setShowAddEmployeeModal(false)}
                        className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        Odustani
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Permissions Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showPermModal && permEmployee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: 'rgba(10,40,52,0.92)', border: '1px solid rgba(120,220,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', backdropFilter: 'blur(20px)' }}
            >
              <div className="p-6" style={{ borderBottom: '1px solid rgba(120,220,255,0.12)' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Ovlasti – {permEmployee.name}</h2>
                  <button onClick={() => setShowPermModal(false)} className="p-2 rounded-lg transition-all hover:bg-white/10">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto" style={{ maxHeight: '72vh' }}>
                {permError && (
                  <div className="p-3 rounded-xl text-sm mb-4" style={{ background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF6B6B' }}>
                    {permError}
                  </div>
                )}

                <EmployeePermissionsEditor value={permValue} onChange={setPermValue} />

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSavePermissions}
                    disabled={permSaving}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-60"
                    style={{ background: T.accent, color: '#000000' }}
                  >
                    {permSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {permSaving ? 'Spremanje...' : 'Spremi ovlasti'}
                  </button>
                  <button
                    onClick={() => setShowPermModal(false)}
                    className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Odustani
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
