import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef } from 'react';
import { FileText, Users, UserCog, Warehouse, Package, BarChart3, MapPin, Calendar, CheckCircle, AlertCircle, Plus, TrendingUp, TrendingDown, ArrowLeft, Clock, Phone, Crown, Briefcase, Upload, FileSpreadsheet, Download, X, Edit, Trash2, Save } from 'lucide-react';
import { useLanguage } from '../lib/languageContext';
import * as XLSX from 'xlsx';

interface ProPortalFunctionalProps {
  onBack: () => void;
  userRole?: 'employee' | 'employer';
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
}

interface WorkOrder {
  id: number;
  client: string;
  location: string;
  task: string;
  status: 'active' | 'pending' | 'completed';
  assignee: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

interface Employee {
  id: number;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  tasks: number;
  location: string;
  performance: number;
}

interface WarehouseItem {
  id: number;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
}

const STORAGE_KEYS = {
  CLIENTS: 'aquasmart_pro_clients',
  WORK_ORDERS: 'aquasmart_pro_work_orders',
  EMPLOYEES: 'aquasmart_pro_employees',
  WAREHOUSE: 'aquasmart_pro_warehouse',
};

export function ProPortalFunctional({ onBack, userRole: initialRole }: ProPortalFunctionalProps) {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<'employee' | 'employer' | null>(() => {
    const savedRole = localStorage.getItem('userRole');
    return initialRole || (savedRole === 'employee' || savedRole === 'employer' ? savedRole : null);
  });
  const [activeTab, setActiveTab] = useState<'work-orders' | 'employees' | 'clients' | 'warehouse' | 'analytics'>('work-orders');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // State with localStorage persistence
  const [clients, setClients] = useState<Client[]>(() => loadData(STORAGE_KEYS.CLIENTS, [
    { id: '1', name: 'Hotel Adriatic', location: 'Split', pools: 3, lastService: '2026-02-25', nextService: '2026-03-10', status: 'active', phone: '+385 21 123 456', email: 'info@adriatic.hr' },
    { id: '2', name: 'Villa Sunset', location: 'Dubrovnik', pools: 1, lastService: '2026-02-20', nextService: '2026-03-05', status: 'active', phone: '+385 20 234 567', email: 'villa@sunset.hr' },
  ]));

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => loadData(STORAGE_KEYS.WORK_ORDERS, [
    { id: 1, client: 'Hotel Adriatic', location: 'Split', task: 'Pool Cleaning', status: 'active', assignee: 'Marko Horvat', dueDate: '2026-02-27', priority: 'high' },
    { id: 2, client: 'Villa Sunset', location: 'Dubrovnik', task: 'Chemical Balance', status: 'pending', assignee: 'Ana Kovač', dueDate: '2026-02-28', priority: 'medium' },
  ]));

  const [employees, setEmployees] = useState<Employee[]>(() => loadData(STORAGE_KEYS.EMPLOYEES, [
    { id: 1, name: 'Marko Horvat', role: 'Pool Technician', status: 'active', tasks: 8, location: 'Split', performance: 94 },
    { id: 2, name: 'Ana Kovač', role: 'Team Leader', status: 'active', tasks: 12, location: 'Dubrovnik', performance: 98 },
  ]));

  const [warehouse, setWarehouse] = useState<WarehouseItem[]>(() => loadData(STORAGE_KEYS.WAREHOUSE, [
    { id: 1, name: 'pH Plus', stock: 85, unit: 'kg', minStock: 50, trend: 'up', category: 'pH Control' },
    { id: 2, name: 'Chlorine Granular', stock: 62, unit: 'kg', minStock: 80, trend: 'down', category: 'Disinfection' },
    { id: 3, name: 'Algaecide', stock: 94, unit: 'L', minStock: 40, trend: 'up', category: 'Treatment' },
  ]));

  // Save to localStorage whenever data changes
  const updateClients = (newClients: Client[]) => {
    setClients(newClients);
    saveData(STORAGE_KEYS.CLIENTS, newClients);
  };

  const updateWorkOrders = (newOrders: WorkOrder[]) => {
    setWorkOrders(newOrders);
    saveData(STORAGE_KEYS.WORK_ORDERS, newOrders);
  };

  const updateEmployees = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    saveData(STORAGE_KEYS.EMPLOYEES, newEmployees);
  };

  const updateWarehouse = (newWarehouse: WarehouseItem[]) => {
    setWarehouse(newWarehouse);
    saveData(STORAGE_KEYS.WAREHOUSE, newWarehouse);
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
          name: `${row.Ime || ''} ${row.Prezime || ''}`.trim() || row.Naziv || 'Unknown',
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
      },
      {
        'Ime': 'Ana',
        'Prezime': 'Kovač',
        'Lokacija': 'Zagreb',
        'Bazeni': 1,
        'Mobitel': '+385 92 345 6789',
        'Email': 'ana@example.com',
        'ZadnjiServis': '2026-02-18',
        'SljedeciServis': '2026-03-03'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Klijenti');
    XLSX.writeFile(wb, 'AcquaSmart_Klijenti_Template.xlsx');
  };

  // Add new client manually
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

  // Add new work order
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

  // Add warehouse item
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
      category: 'Other',
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

  // Role Selection Screen
  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#000000' }}>
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]" 
            style={{ background: 'radial-gradient(circle, rgba(0,240,255,0.4) 0%, transparent 70%)' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-15 blur-[120px]" 
            style={{ background: 'radial-gradient(circle, rgba(160,0,255,0.4) 0%, transparent 70%)' }}></div>
        </div>

        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}></div>

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="fixed top-8 left-8 z-50 px-5 py-3 flex items-center gap-3 rounded-2xl backdrop-blur-xl transition-all hover:scale-105"
          style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Natrag</span>
        </motion.button>

        <div className="relative z-10 max-w-6xl w-full">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-xl"
              style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Crown className="w-4 h-4 gradient-gold" />
              <span className="caption gradient-gold">PREMIUM SYSTEMS</span>
            </div>
            
            <h1 className="text-6xl font-bold mb-6" style={{ letterSpacing: '-0.04em' }}>
              Odaberite Vašu <span className="gradient-text">Razinu Pristupa</span>
            </h1>
            
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Izaberite ulogu koja najbolje odgovara vašem radnom toku
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Employee Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="rounded-[32px] p-10 cursor-pointer backdrop-blur-xl group"
              onClick={() => setSelectedRole('employee')}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div className="relative z-10">
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 flex items-center justify-center rounded-3xl transition-all group-hover:scale-110" 
                    style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.1) 0%, rgba(74,159,216,0.1) 100%)' }}>
                    <UserCog className="w-12 h-12" style={{ color: '#00F0FF' }} />
                  </div>
                </div>

                <h2 className="text-4xl font-bold text-center mb-4">Izvršitelj</h2>
                <p className="text-center mb-8 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Terenski radnik koji izvršava radne naloge
                </p>

                <div className="text-center py-4 rounded-2xl font-medium transition-all group-hover:scale-105"
                  style={{ background: 'rgba(0, 240, 255, 0.1)', color: '#00F0FF' }}>
                  Pristup kao Izvršitelj →
                </div>
              </div>
            </motion.div>

            {/* Employer Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="rounded-[32px] p-10 cursor-pointer backdrop-blur-xl group"
              onClick={() => setSelectedRole('employer')}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div className="relative z-10">
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 flex items-center justify-center rounded-3xl transition-all group-hover:scale-110" 
                    style={{ background: 'linear-gradient(135deg, rgba(160,0,255,0.1) 0%, rgba(255,215,0,0.1) 100%)' }}>
                    <Briefcase className="w-12 h-12 gradient-gold" />
                  </div>
                </div>

                <h2 className="text-4xl font-bold text-center mb-4">Poslodavac</h2>
                <p className="text-center mb-8 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Upravljanje djelatnicima, klijentima i radnim nalozima
                </p>

                <div className="text-center py-4 rounded-2xl font-medium transition-all group-hover:scale-105 gradient-gold"
                  style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.1) 100%)' }}>
                  Pristup kao Poslodavac →
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleExcelImport}
        accept=".xlsx,.xls"
        className="hidden"
      />

      {/* Header */}
      <div className="relative z-10 p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedRole(null)} className="px-4 py-2 rounded-xl transition-all hover:scale-105" style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h1 className="font-bold text-xl">
                ACQUA<span style={{ color: '#D4A853' }}>SMART</span> PRO
              </h1>
              <p className="text-sm" style={{ color: selectedRole === 'employee' ? '#4A9FD8' : '#D4A853' }}>
                {selectedRole === 'employee' ? 'Izvršitelj Access' : 'Poslodavac Access'}
              </p>
            </div>
          </div>

          <button onClick={onBack} className="px-6 py-2 rounded-xl font-semibold transition-all hover:scale-105" style={{
            background: '#D4A853',
            color: '#000000'
          }}>
            Odjava
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'work-orders', label: 'Radni Nalozi', icon: FileText },
            ...(selectedRole === 'employer' ? [{ id: 'employees' as const, label: 'Djelatnici', icon: Users }] : []),
            { id: 'clients', label: 'Klijenti', icon: UserCog },
            { id: 'warehouse', label: 'Skladište', icon: Warehouse },
            ...(selectedRole === 'employer' ? [{ id: 'analytics' as const, label: 'Analitika', icon: BarChart3 }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'text-black' : 'text-white'
              }`}
              style={{
                background: activeTab === tab.id ? '#D4A853' : 'rgba(255,255,255,0.05)',
                border: activeTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <AnimatePresence mode="wait">
          {/* Work Orders Tab */}
          {activeTab === 'work-orders' && (
            <motion.div key="work-orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Radni Nalozi ({workOrders.length})</h2>
                {selectedRole === 'employer' && (
                  <button
                    onClick={addWorkOrder}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105"
                    style={{ background: '#D4A853', color: '#000000' }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novi Nalog</span>
                  </button>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {workOrders.map((order) => (
                  <div key={order.id} className="p-6 rounded-xl group" style={{
                    background: '#1A1E26',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>
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
                          {order.status.toUpperCase()}
                        </span>
                        {selectedRole === 'employer' && (
                          <button
                            onClick={() => deleteWorkOrder(order.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{order.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCog className="w-4 h-4" />
                        <span>{order.assignee}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{order.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <motion.div key="clients" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Klijenti ({clients.length})</h2>
                <div className="flex gap-2">
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105"
                    style={{
                      background: 'rgba(0,240,255,0.1)',
                      border: '1px solid rgba(0,240,255,0.3)',
                      color: '#00F0FF'
                    }}
                  >
                    <Download className="w-4 h-4" />
                    <span>Template</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105"
                    style={{
                      background: 'rgba(255,215,0,0.1)',
                      border: '1px solid rgba(255,215,0,0.3)',
                      color: '#FFD700'
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import Excel</span>
                  </button>
                  <button
                    onClick={addClient}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105"
                    style={{ background: '#D4A853', color: '#000000' }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novi Klijent</span>
                  </button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {clients.map((client) => (
                  <div key={client.id} className="p-6 rounded-xl group" style={{
                    background: '#1A1E26',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg flex-1">{client.name}</h3>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <div>📍 {client.location}</div>
                      <div>🏊 {client.pools} bazen(a)</div>
                      <div>📅 Zadnji servis: {client.lastService}</div>
                      <div>📅 Sljedeći servis: {client.nextService}</div>
                      {client.phone && <div>📞 {client.phone}</div>}
                      {client.email && <div>✉️ {client.email}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Warehouse Tab */}
          {activeTab === 'warehouse' && (
            <motion.div key="warehouse" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Skladište ({warehouse.length} artikala)</h2>
                <button
                  onClick={addWarehouseItem}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105"
                  style={{ background: '#D4A853', color: '#000000' }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Novi Artikl</span>
                </button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {warehouse.map((item) => (
                  <div key={item.id} className="p-6 rounded-xl group" style={{
                    background: '#1A1E26',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.name}</h3>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.trend === 'up' && <TrendingUp className="w-5 h-5" style={{ color: '#2EFF88' }} />}
                        {item.trend === 'down' && <TrendingDown className="w-5 h-5" style={{ color: '#FF3B30' }} />}
                        <button
                          onClick={() => deleteWarehouseItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: item.stock < item.minStock ? '#FF3B30' : '#D4A853' }}>
                      {item.stock} {item.unit}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Min: {item.minStock} {item.unit}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Employees Tab */}
          {activeTab === 'employees' && selectedRole === 'employer' && (
            <motion.div key="employees" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-semibold mb-6">Djelatnici ({employees.length})</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="p-6 rounded-xl" style={{
                    background: '#1A1E26',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{employee.name}</h3>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{employee.role}</p>
                      </div>
                      <span className="px-3 py-1 rounded-lg text-xs font-semibold" style={{
                        background: employee.status === 'active' ? 'rgba(46,255,136,0.2)' : 'rgba(255,255,255,0.1)',
                        color: employee.status === 'active' ? '#2EFF88' : 'rgba(255,255,255,0.5)'
                      }}>
                        {employee.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <div>📍 {employee.location}</div>
                      <div>📋 {employee.tasks} aktivnih zadataka</div>
                      <div>📊 Performance: {employee.performance}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && selectedRole === 'employer' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-semibold mb-6">Analitika</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-8 rounded-2xl text-center" style={{
                  background: 'linear-gradient(135deg, rgba(0,240,255,0.1) 0%, rgba(74,159,216,0.1) 100%)',
                  border: '1px solid rgba(0,240,255,0.2)'
                }}>
                  <div className="text-5xl font-bold gradient-text mb-2">{clients.length}</div>
                  <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Ukupno Klijenata</div>
                </div>

                <div className="p-8 rounded-2xl text-center" style={{
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.1) 100%)',
                  border: '1px solid rgba(255,215,0,0.2)'
                }}>
                  <div className="text-5xl font-bold gradient-gold mb-2">{workOrders.length}</div>
                  <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Radni Nalozi</div>
                </div>

                <div className="p-8 rounded-2xl text-center" style={{
                  background: 'linear-gradient(135deg, rgba(46,255,136,0.1) 0%, rgba(0,255,127,0.1) 100%)',
                  border: '1px solid rgba(46,255,136,0.2)'
                }}>
                  <div className="text-5xl font-bold" style={{ color: '#2EFF88' }}>{employees.filter(e => e.status === 'active').length}</div>
                  <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Aktivni Djelatnici</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
