import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'motion/react';
import { NavigationHeader } from './NavigationHeader';

type AnalyticsTab = 'overview' | 'finance' | 'employees' | 'chemicals' | 'probes' | 'pools' | 'parameters';

export function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsEntry[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [disinfectionFilter, setDisinfectionFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [selectedClient, dateRange]);

  const loadData = () => {
    let data = analyticsStorage.getAll();
    let woData = workOrderStorage.getAll();
    
    console.log('🔄 === ANALYTICS DASHBOARD LOADING ===');
    console.log('🔄 Raw analytics data:', data.length, 'entries');
    console.log('🔄 Sample entry:', data[0]);
    console.log('🔄 All entries:', data);
    
    // 🔥 DEBUG: Check localStorage directly
    const rawStorage = localStorage.getItem('aquasmart_analytics');
    console.log('🔄 Raw localStorage value:', rawStorage);
    
    // Filter by client
    if (selectedClient !== 'all') {
      data = data.filter(entry => entry.clientId === selectedClient);
      woData = woData.filter(wo => wo.clientId === selectedClient);
    }

    // Filter by date range
    const now = new Date();
    if (dateRange !== 'all') {
      const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      data = data.filter(entry => new Date(entry.timestamp) >= cutoffDate);
      woData = woData.filter(wo => new Date(wo.date) >= cutoffDate);
    }

    console.log('🔄 Filtered analytics data:', data.length, 'entries');
    console.log('🔄 === END LOADING ===');

    setAnalytics(data);
    setWorkOrders(woData);
    setClients(storage.getClients());
    setPools(storage.getPools());
  };

  const handlePrint = () => {
    window.print();
  };

  // 🔥 TEST HELPER: Create sample analytics data
  const createTestData = () => {
    const pools = storage.getPools();
    const clients = storage.getClients();
    
    if (pools.length === 0 || clients.length === 0) {
      alert('Prvo kreirajte klijente i bazene!');
      return;
    }
    
    const pool = pools[0];
    const client = clients.find(c => c.id === pool.clientId) || clients[0];
    
    // Create 5 test entries
    for (let i = 0; i < 5; i++) {
      const testEntry: AnalyticsEntry = {
        id: `test-${Date.now()}-${i}`,
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(), // Each day back
        clientId: client.id,
        clientName: client.name,
        poolId: pool.id,
        poolName: pool.name,
        poolVolume: pool.volume || 50,
        parameters: {
          pH: 7.2 + Math.random() * 0.6, // 7.2 - 7.8
          freeChlorine: 0.8 + Math.random() * 0.8, // 0.8 - 1.6
          alkalinity: 90 + Math.random() * 30, // 90 - 120
          orp: 650 + Math.random() * 100, // 650 - 750
        },
        status: i % 3 === 0 ? 'ok' : i % 3 === 1 ? 'warning' : 'critical',
        recommendations: [
          {
            productName: 'pH Minus tekući',
            quantity: 500 + Math.random() * 500,
            unit: 'ml',
            category: 'ph-regulator',
          },
          {
            productName: 'Klorex tablete',
            quantity: 200 + Math.random() * 200,
            unit: 'g',
            category: 'chlorine',
          },
          {
            productName: 'Alginox tekući',
            quantity: 100 + Math.random() * 200,
            unit: 'ml',
            category: 'algaecide',
          }
        ],
        treatmentCost: 15 + Math.random() * 35,
        source: 'manual',
      };
      
      analyticsStorage.save(testEntry);
    }
    
    console.log('✅ Test data created!');
    loadData();
  };

  // 🔥 NEW: Import chemicals from completed work orders
  const importFromWorkOrders = () => {
    const allWorkOrders = workOrderStorage.getAll();
    const completedWOs = allWorkOrders.filter(wo => wo.status === 'completed' || wo.status === 'invoiced');
    
    console.log('📦 === IMPORTING FROM WORK ORDERS ===');
    console.log('📦 Total Work Orders:', allWorkOrders.length);
    console.log('📦 Completed/Invoiced:', completedWOs.length);
    
    let importedCount = 0;
    const existingIds = new Set(analyticsStorage.getAll().map(e => e.id));
    
    completedWOs.forEach(wo => {
      // Skip if no chemicals used
      if (!wo.chemicalsUsed || wo.chemicalsUsed.length === 0) {
        console.log('  ⏭️ Skipping WO (no chemicals):', wo.id);
        return;
      }
      
      // Create unique ID for this work order
      const analyticsId = `wo-${wo.id}`;
      
      // Skip if already imported
      if (existingIds.has(analyticsId)) {
        console.log('  ⏭️ Skipping WO (already imported):', wo.id);
        return;
      }
      
      // Get pool info
      const pool = storage.getPools().find(p => p.id === wo.poolId);
      
      // Convert chemicalsUsed to analytics recommendations format
      const recommendations = wo.chemicalsUsed.map(chem => ({
        productName: chem.name,
        quantity: parseFloat(chem.quantity) || 0,
        unit: chem.unit || 'ml',
        category: 'maintenance', // Default category
      }));
      
      // Determine status from analysisResults if available
      let status: 'ok' | 'warning' | 'critical' = 'ok';
      let parameters: any = {
        pH: undefined,
        freeChlorine: undefined,
        alkalinity: undefined,
        hardness: undefined,
        temperature: undefined,
        orp: undefined,
      };
      
      if (wo.analysisResults) {
        status = wo.analysisResults.status;
        parameters = {
          pH: wo.analysisResults.parameters.pH,
          freeChlorine: wo.analysisResults.parameters.chlorine,
          alkalinity: wo.analysisResults.parameters.alkalinity,
          temperature: wo.analysisResults.parameters.temperature,
          orp: wo.analysisResults.parameters.redox,
        };
      }
      
      const analyticsEntry: AnalyticsEntry = {
        id: analyticsId,
        timestamp: wo.completedAt || wo.date,
        clientId: wo.clientId,
        clientName: wo.clientName,
        poolId: wo.poolId,
        poolName: wo.poolName,
        poolVolume: pool?.volume || 50,
        parameters,
        status,
        recommendations,
        treatmentCost: wo.billing?.total || wo.cost,
        source: 'import',
      };
      
      analyticsStorage.save(analyticsEntry);
      importedCount++;
      
      console.log('  ✅ Imported WO:', {
        id: wo.id,
        date: wo.date,
        chemicals: recommendations.length,
        cost: analyticsEntry.treatmentCost
      });
    });
    
    console.log('📦 === IMPORT COMPLETE ===');
    console.log('📦 Imported:', importedCount, 'work orders');
    
    if (importedCount > 0) {
      alert(`✅ Uspješno uvezeno ${importedCount} radnih naloga u analitiku!`);
      loadData();
    } else {
      alert('ℹ️ Nema novih naloga za uvoz. Svi završeni nalozi su već u analitici.');
    }
  };

  // --- CALCULATIONS ---

  // Chemical consumption breakdown
  const chemicalStats = useMemo(() => {
    const stats: Record<string, { quantity: number, unit: string, cost: number }> = {};
    
    console.log('📊 Analytics data for chemicals:', analytics.length, 'entries');
    
    analytics.forEach(entry => {
      console.log('  Entry recommendations:', entry.recommendations);
      entry.recommendations.forEach(rec => {
        if (!stats[rec.productName]) {
          stats[rec.productName] = { quantity: 0, unit: rec.unit, cost: 0 };
        }
        stats[rec.productName].quantity += rec.quantity;
      });
    });

    const result = Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity);
    
    console.log('📊 Chemical stats computed:', result);
    
    return result;
  }, [analytics]);

  // Probe replacements tracking
  const probeReplacements = useMemo(() => {
    let total = 0;
    const history: Array<{ poolName: string, date: string, part: string }> = [];

    workOrders.forEach(wo => {
      let woData: any = null;
      try {
        woData = wo.notes ? JSON.parse(wo.notes) : null;
      } catch (e) {}

      const reps = woData?.replacements || [];
      reps.forEach((r: any) => {
        if (r.completed && (r.part.toLowerCase().includes('sonda') || r.part.toLowerCase().includes('probe'))) {
          total += (r.quantity || 1);
          history.push({
            poolName: wo.poolName || 'Nepoznat bazen',
            date: wo.date,
            part: r.part
          });
        }
      });
    });

    return { total, history };
  }, [workOrders]);

  // Pool filtration and stats
  const filteredPools = useMemo(() => {
    return pools.filter(p => {
      if (disinfectionFilter === 'all') return true;
      return p.disinfectionSystem === disinfectionFilter;
    });
  }, [pools, disinfectionFilter]);

  const summary = useMemo(() => ({
    totalAnalyses: analytics.length,
    okCount: analytics.filter(a => a.status === 'ok').length,
    warningCount: analytics.filter(a => a.status === 'warning').length,
    criticalCount: analytics.filter(a => a.status === 'critical').length,
    totalCost: analytics.reduce((sum, a) => sum + (a.treatmentCost || 0), 0),
  }), [analytics]);

  const statusData = [
    { name: 'OK', value: summary.okCount, color: '#d4af37' },
    { name: 'Upozorenje', value: summary.warningCount, color: '#94a3b8' },
    { name: 'Kritično', value: summary.criticalCount, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Parameter trend data
  const parameterData = useMemo(() => {
    console.log('📈 Analytics data for parameters:', analytics.length, 'entries');
    
    const result = analytics
      .slice(-20)
      .map(entry => ({
        date: new Date(entry.timestamp).toLocaleDateString('hr-HR', { month: 'short', day: 'numeric' }),
        pH: entry.parameters.pH,
        Klor: entry.parameters.freeChlorine,
        Alkalitet: entry.parameters.alkalinity,
        Redox: entry.parameters.orp,
        timestamp: new Date(entry.timestamp).getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
    
    console.log('📈 Parameter data computed:', result);
    
    return result;
  }, [analytics]);

  const financialStats = useMemo(() => {
    const invoiced = workOrders.filter(wo => wo.status === 'invoiced');
    
    // Total Revenue
    const totalRevenue = invoiced.reduce((sum, wo) => {
        const cost = wo.billing?.total || wo.cost || 0;
        return sum + cost;
    }, 0);

    // Monthly Revenue (Last 6 months)
    const monthlyRevenue = new Array(6).fill(0).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return {
            name: d.toLocaleString('hr-HR', { month: 'short' }).toUpperCase(),
            month: d.getMonth(),
            year: d.getFullYear(),
            revenue: 0,
            count: 0
        };
    }).reverse();

    invoiced.forEach(wo => {
        if (!wo.invoicedAt && !wo.completedAt) return;
        const date = new Date(wo.invoicedAt || wo.completedAt || '');
        const cost = wo.billing?.total || wo.cost || 0;
        
        const period = monthlyRevenue.find(p => p.month === date.getMonth() && p.year === date.getFullYear());
        if (period) {
            period.revenue += cost;
            period.count += 1;
        }
    });

    // Top Clients
    const clientRevenue: Record<string, number> = {};
    invoiced.forEach(wo => {
        const name = wo.clientName || 'Nepoznat klijent';
        const cost = wo.billing?.total || wo.cost || 0;
        clientRevenue[name] = (clientRevenue[name] || 0) + cost;
    });

    const topClients = Object.entries(clientRevenue)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const averageTicket = invoiced.length > 0 ? totalRevenue / invoiced.length : 0;

    return { totalRevenue, monthlyRevenue, topClients, averageTicket };
  }, [workOrders]);

  // Employee Stats
  const employeeStats = useMemo(() => {
    const stats: Record<string, {
      id: string;
      name: string;
      workOrderCount: number;
      uniqueClients: Set<string>;
      totalRevenue: number;
      totalMinutes: number;
      chemicalsCount: number;
      taskTypes: Record<string, number>;
    }> = {};

    workOrders.forEach(wo => {
      // Consider invoiced work orders or completed ones
      if ((wo.status !== 'completed' && wo.status !== 'invoiced')) return;
      
      // Identify all participants
      const participants = new Set<string>();
      if (wo.completedBy) participants.add(wo.completedBy);
      if (wo.assignedTo) participants.add(wo.assignedTo);
      if (wo.additionalWorkers) {
        wo.additionalWorkers.forEach(w => participants.add(w.id));
      }

      if (participants.size === 0) return;

      const participantCount = participants.size;
      const revenueShare = (wo.billing?.total || wo.cost || 0) / participantCount;
      // Assume timeSpent is the duration of the job, and all participants were present.
      const timeSpent = wo.timeSpent || 0;
      
      let chemicalsShare = 0;
      if (wo.chemicalsUsed) {
        chemicalsShare = wo.chemicalsUsed.reduce((sum, c) => sum + Number(c.quantity || 0), 0) / participantCount;
      }
      
      const type = wo.type || 'ostalo';

      participants.forEach(empId => {
        if (!stats[empId]) {
          let name = 'Nepoznat';
          if (empId === wo.completedBy) name = wo.completedByName || name;
          if (empId === wo.assignedTo) name = wo.assignedToName || name;
          const addW = wo.additionalWorkers?.find(w => w.id === empId);
          if (addW) name = addW.name;

          stats[empId] = {
            id: empId,
            name: name,
            workOrderCount: 0,
            uniqueClients: new Set(),
            totalRevenue: 0,
            totalMinutes: 0,
            chemicalsCount: 0,
            taskTypes: {}
          };
        }

        const emp = stats[empId];
        emp.workOrderCount++;
        if (wo.clientId) emp.uniqueClients.add(wo.clientId);
        emp.totalRevenue += revenueShare;
        emp.totalMinutes += timeSpent;
        emp.chemicalsCount += chemicalsShare;
        emp.taskTypes[type] = (emp.taskTypes[type] || 0) + 1;
      });
    });

    return Object.values(stats).map(s => ({
      ...s,
      uniqueClientsCount: s.uniqueClients.size,
      averageRevenuePerHour: s.totalMinutes > 0 ? (s.totalRevenue / (s.totalMinutes / 60)) : 0,
      averageTimePerJob: s.workOrderCount > 0 ? s.totalMinutes / s.workOrderCount : 0
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [workOrders]);

  return (
    <div className="min-h-screen bg-[#030213] text-slate-100 pb-20">
      {/* Header */}
      <NavigationHeader
        title="Napredna Analitika"
        icon={<BarChart3 className="w-7 h-7 text-gold-500" />}
        backAction={() => navigate(-1)}
        actions={[
          {
            label: 'Test Data',
            action: createTestData,
            visible: analytics.length === 0,
            className: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all'
          },
          {
            label: 'Uvezi',
            action: importFromWorkOrders,
            className: 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2',
            icon: <Download className="w-4 h-4" />,
            title: 'Uvezi kemikalije iz završenih radnih naloga'
          },
          {
            label: 'Štampaj',
            action: handlePrint,
            className: 'bg-gold-500 text-[#030213] p-2 rounded-lg hover:scale-105 transition-all',
            icon: <Printer className="w-5 h-5" />
          }
        ]}
        filters={[
          {
            label: 'Klijent',
            value: selectedClient,
            onChange: (e) => setSelectedClient(e.target.value),
            options: [
              { value: 'all', label: 'Svi klijenti' },
              ...clients.map(c => ({ value: c.id, label: c.name }))
            ]
          },
          {
            label: 'Vrijeme',
            value: dateRange,
            onChange: (e) => setDateRange(e.target.value as any),
            options: [
              { value: '7days', label: 'Zadnjih 7 dana' },
              { value: '30days', label: 'Zadnjih 30 dana' },
              { value: '90days', label: 'Zadnjih 90 dana' },
              { value: 'all', label: 'Sve vrijeme' }
            ]
          }
        ]}
        tabs={[
          { id: 'overview', label: 'Pregled', icon: TrendingUp },
          { id: 'finance', label: 'Financije', icon: DollarSign },
          { id: 'employees', label: 'Djelatnici', icon: Users },
          { id: 'chemicals', label: 'Kemikalije', icon: Beaker },
          { id: 'probes', label: 'Zamjene sondi', icon: Zap },
          { id: 'pools', label: 'Popis bazena', icon: List },
          { id: 'parameters', label: 'Parametri', icon: Droplets },
        ]}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as AnalyticsTab)}
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Analize', value: summary.totalAnalyses, icon: TrendingUp, color: 'from-blue-600 to-blue-400' },
                { label: 'U redu', value: summary.okCount, icon: CheckCircle, color: 'from-gold-600 to-gold-400' },
                { label: 'Zamjene sondi', value: probeReplacements.total, icon: Zap, color: 'from-amber-600 to-yellow-400' },
                { label: 'Ukupni Prihod', value: `€${financialStats.totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'from-emerald-600 to-teal-400' }
              ].map((card, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0a0a1a] rounded-3xl p-6 border border-gold-500/10 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-black text-white">{card.value}</div>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{card.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#0a0a1a] rounded-3xl p-8 border border-gold-500/10 shadow-2xl flex flex-col items-center">
                <h3 className="text-lg font-black uppercase tracking-widest text-gold-500 mb-6 w-full text-center">Stanje vode</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0a0a1a', border: '1px solid #d4af37', borderRadius: '12px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-[#0a0a1a] rounded-3xl p-8 border border-gold-500/10 shadow-2xl overflow-hidden">
                <h3 className="text-lg font-black uppercase tracking-widest text-gold-500 mb-6">Zadnje aktivnosti</h3>
                <div className="space-y-4">
                  {analytics.slice(-5).reverse().map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div>
                        <div className="text-sm font-bold uppercase">{a.poolName}</div>
                        <div className="text-[10px] text-slate-500">{new Date(a.timestamp).toLocaleDateString('hr-HR')}</div>
                      </div>
                      <div className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                        a.status === 'ok' ? 'text-gold-500 bg-gold-500/10' : 'text-red-500 bg-red-500/10'
                      }`}>{a.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- FINANCE TAB --- */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#0a0a1a] rounded-3xl p-8 border border-gold-500/10 shadow-2xl">
                <h3 className="text-lg font-black uppercase tracking-widest text-gold-500 mb-6">Mjesečni Prihod</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialStats.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e38" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} />
                      <Tooltip 
                        formatter={(value) => [`€${Number(value).toFixed(2)}`, 'Prihod']}
                        contentStyle={{ backgroundColor: '#0a0a1a', border: '1px solid #d4af37', borderRadius: '12px' }} 
                      />
                      <Bar dataKey="revenue" fill="#d4af37" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#0a0a1a] rounded-3xl p-8 border border-gold-500/10 shadow-2xl">
                <h3 className="text-lg font-black uppercase tracking-widest text-gold-500 mb-6">Top Klijenti</h3>
                <div className="space-y-4">
                  {financialStats.topClients.map((client, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-gold-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500 font-bold text-xs">
                          {i + 1}
                        </div>
                        <div className="font-bold text-sm uppercase">{client.name}</div>
                      </div>
                      <div className="font-black text-gold-500">€{client.value.toFixed(2)}</div>
                    </div>
                  ))}
                  {financialStats.topClients.length === 0 && (
                    <div className="text-center text-slate-500 py-8">Nema podataka o naplati</div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-[#0a0a1a] rounded-3xl p-6 border border-gold-500/10 shadow-xl">
                 <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Ukupni Prihod</div>
                 <div className="text-3xl font-black text-white">€{financialStats.totalRevenue.toFixed(2)}</div>
               </div>
               <div className="bg-[#0a0a1a] rounded-3xl p-6 border border-gold-500/10 shadow-xl">
                 <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Prosječan Račun</div>
                 <div className="text-3xl font-black text-white">€{financialStats.averageTicket.toFixed(2)}</div>
               </div>
               <div className="bg-[#0a0a1a] rounded-3xl p-6 border border-gold-500/10 shadow-xl">
                 <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Broj Transakcija</div>
                 <div className="text-3xl font-black text-white">{financialStats.monthlyRevenue.reduce((acc, curr) => acc + curr.count, 0)}</div>
               </div>
            </div>
          </div>
        )}

        {/* --- EMPLOYEES TAB --- */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-[#0a0a1a] rounded-3xl p-6 border border-gold-500/10 shadow-xl flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500"><Users className="w-6 h-6" /></div>
                 <div>
                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Aktivni Djelatnici</div>
                    <div className="text-2xl font-black text-white">{employeeStats.length}</div>
                 </div>
               </div>
               <div className="bg-[#0a0a1a] rounded-3xl p-6 border border-gold-500/10 shadow-xl flex items-center gap-4">
                 <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-500"><DollarSign className="w-6 h-6" /></div>
                 <div>
                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Top Prihod (Djelatnik)</div>
                    <div className="text-2xl font-black text-white">
                        {employeeStats.length > 0 ? `€${employeeStats[0].totalRevenue.toFixed(0)}` : '€0'}
                    </div>
                    <div className="text-[10px] text-green-500 font-bold">{employeeStats.length > 0 ? employeeStats[0].name : '-'}</div>
                 </div>
               </div>
               <div className="bg-[#0a0a1a] rounded-3xl p-6 border border-gold-500/10 shadow-xl flex items-center gap-4">
                 <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500"><Clock className="w-6 h-6" /></div>
                 <div>
                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Ukupno Sati Rada</div>
                    <div className="text-2xl font-black text-white">
                        {(employeeStats.reduce((acc, curr) => acc + curr.totalMinutes, 0) / 60).toFixed(1)}h
                    </div>
                 </div>
               </div>
            </div>

            <div className="bg-[#0a0a1a] rounded-3xl border border-gold-500/10 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gold-500/10">
                    <h3 className="text-lg font-black uppercase tracking-widest text-gold-500">Detaljna Analiza Učinka</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="py-4 px-6 text-[10px] font-black uppercase text-slate-500">Djelatnik</th>
                                <th className="text-center py-4 px-6 text-[10px] font-black uppercase text-slate-500">Klijenata</th>
                                <th className="text-center py-4 px-6 text-[10px] font-black uppercase text-slate-500">Nalozi / Tipovi</th>
                                <th className="text-center py-4 px-6 text-[10px] font-black uppercase text-slate-500">Sati</th>
                                <th className="text-center py-4 px-6 text-[10px] font-black uppercase text-slate-500">Kemija (kom)</th>
                                <th className="text-right py-4 px-6 text-[10px] font-black uppercase text-slate-500">Prihod</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-500/5">
                            {employeeStats.map((emp) => (
                                <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-6 font-bold text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-black border border-white/10 text-gold-500">
                                            {emp.name.charAt(0)}
                                        </div>
                                        {emp.name}
                                    </td>
                                    <td className="py-4 px-6 text-center font-bold text-slate-300">{emp.uniqueClientsCount}</td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="font-bold text-white">{emp.workOrderCount}</div>
                                        <div className="text-[9px] text-slate-500 uppercase mt-1">
                                            {Object.entries(emp.taskTypes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-center font-bold text-slate-300">{(emp.totalMinutes / 60).toFixed(1)}h</td>
                                    <td className="py-4 px-6 text-center font-bold text-slate-300">{emp.chemicalsCount.toFixed(1)}</td>
                                    <td className="py-4 px-6 text-right font-black text-emerald-400">€{emp.totalRevenue.toFixed(2)}</td>
                                </tr>
                            ))}
                            {employeeStats.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">
                                        Nema podataka o učinku djelatnika za odabrani period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        )}

        {/* --- CHEMICALS TAB --- */}
        {activeTab === 'chemicals' && (
          <div className="space-y-6">
            <div className="bg-[#0a0a1a] rounded-3xl p-8 border border-gold-500/10 shadow-2xl">
              <h3 className="text-lg font-black uppercase tracking-widest text-gold-500 mb-6">Utrošak kemijskih sredstava</h3>
              
              {chemicalStats.length === 0 ? (
                <div className="text-center py-16">
                  <Beaker className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg font-bold">Nema podataka o utrošku kemikalija</p>
                  <p className="text-slate-600 text-sm mt-2">Analize vode s preporukama će se prikazati ovdje</p>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chemicalStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e38" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={10} hide />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={120} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'rgba(212, 175, 55, 0.05)'}} contentStyle={{ backgroundColor: '#0a0a1a', border: '1px solid #d4af37', borderRadius: '12px' }} />
                      <Bar dataKey="quantity" fill="#d4af37" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-auto max-h-[400px]">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-[#0a0a1a]">
                      <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-gold-500/10">
                        <th className="pb-4">Proizvod</th>
                        <th className="pb-4 text-right">Količina</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/5">
                      {chemicalStats.map((stat, i) => (
                        <tr key={i} className="text-sm">
                          <td className="py-4 font-bold uppercase">{stat.name}</td>
                          <td className="py-4 text-right font-black text-gold-500">{stat.quantity.toFixed(1)} {stat.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              )}
            </div>
          </div>
        )}

        {/* --- PROBES TAB --- */}
        {activeTab === 'probes' && (
          <div className="space-y-6">
            <div className="bg-[#0a0a1a] rounded-3xl p-8 border border-gold-500/10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-gold-500" />
              </div>
              <h2 className="text-4xl font-black text-white mb-2">{probeReplacements.total}</h2>
              <p className="text-slate-500 uppercase tracking-[0.3em] text-xs font-black">Ukupno zamijenjenih sondi</p>
            </div>

            <div className="bg-[#0a0a1a] rounded-3xl border border-gold-500/10 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gold-500/10">
                <h3 className="text-lg font-black uppercase tracking-widest text-gold-500">Povijest zamjena</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gold-500/5">
                      <th className="text-left py-4 px-6 text-[10px] font-black uppercase text-slate-500">Bazen</th>
                      <th className="text-left py-4 px-6 text-[10px] font-black uppercase text-slate-500">Dio / Opis</th>
                      <th className="text-right py-4 px-6 text-[10px] font-black uppercase text-slate-500">Datum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-500/5">
                    {probeReplacements.history.map((h, i) => (
                      <tr key={i}>
                        <td className="py-4 px-6 font-bold uppercase">{h.poolName}</td>
                        <td className="py-4 px-6 text-sm text-slate-300 italic">{h.part}</td>
                        <td className="py-4 px-6 text-right text-xs text-slate-500">{new Date(h.date).toLocaleDateString('hr-HR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- POOLS TAB --- */}
        {activeTab === 'pools' && (
          <div className="space-y-6">
            <div className="flex gap-3 no-print">
              {['all', 'elektroliza', 'klor-ph', 'peroksid', 'tablete'].map(sys => (
                <button
                  key={sys}
                  onClick={() => setDisinfectionFilter(sys)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                    disinfectionFilter === sys 
                      ? 'bg-gold-500 text-[#030213] border-gold-500' 
                      : 'bg-white/5 text-slate-400 border-white/10 hover:border-gold-500/50'
                  }`}
                >
                  {sys === 'all' ? 'Svi sustavi' : sys}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPools.map(pool => {
                const poolAnalyses = analytics.filter(a => a.poolId === pool.id);
                
                return (
                  <div 
                    key={pool.id} 
                    onClick={() => navigate(`/app/pools/${pool.id}`)}
                    className="bg-[#0a0a1a] rounded-2xl p-5 border border-gold-500/10 shadow-lg group hover:border-gold-500/30 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-black uppercase text-lg group-hover:text-gold-500 transition-colors">{pool.name}</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{pool.clientName}</p>
                      </div>
                      <div className="bg-gold-500/10 text-gold-500 p-2 rounded-lg group-hover:bg-gold-500 group-hover:text-[#030213] transition-colors">
                        {pool.disinfectionSystem === 'elektroliza' ? <Zap className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-black">Analiza</div>
                        <div className="text-xl font-black">{poolAnalyses.length}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-black">Volumen</div>
                        <div className="text-xl font-black">{pool.volume}m³</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- PARAMETERS TAB --- */}
        {activeTab === 'parameters' && (
          <div className="space-y-8">
            <div className="bg-[#0a0a1a] rounded-3xl p-8 border border-gold-500/10 shadow-2xl">
              <h3 className="text-lg font-black uppercase tracking-widest text-gold-500 mb-6">Trendovi parametara (zadnjih 20 mjerenja)</h3>
              
              {parameterData.length === 0 ? (
                <div className="text-center py-16">
                  <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg font-bold">Nema podataka o parametrima</p>
                  <p className="text-slate-600 text-sm mt-2">Napravite analize vode da biste vidjeli trendove pH, klora i redox vrijednosti</p>
                </div>
              ) : (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={parameterData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e38" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a1a', border: '1px solid #d4af37', borderRadius: '12px' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }} />
                    <Line type="monotone" dataKey="pH" stroke="#d4af37" strokeWidth={3} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Klor" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Redox" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}