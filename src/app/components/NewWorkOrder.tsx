import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, FileText, Droplets, Wrench, Settings, Plus, X, Check, CheckCircle, Users } from 'lucide-react';
import { storage } from '../lib/storage';
import { Pool, Client } from '../types';
import { workOrderStorage } from '../lib/workOrderStorage';
import { ImageUploader } from './ImageUploader';
import { api } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { useLanguage } from '../lib/languageContext';

interface ServiceItem {
  id: string;
  label: string;
  completed: boolean;
}

interface ReplacementItem {
  id: string;
  part: string;
  quantity: number;
  notes: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
}

type TabType = 'analysis' | 'services' | 'replacements' | 'equipment' | 'gallery';

export function NewWorkOrder() {
  const navigate = useNavigate();
  const { poolId } = useParams();
  const { t, language } = useLanguage();
  
  // Steps: 1 = select client, 2 = select pool, 3 = fill work order
  const [step, setStep] = useState<number>(poolId ? 3 : 1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  const [activeTab, setActiveTab] = useState<TabType>('analysis');
  const [assignedWorkers, setAssignedWorkers] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; path: string }>>([]);

  // Tab 1: Analiza vode
  const [analysisEnabled, setAnalysisEnabled] = useState(false);

  // Tab 2: Usluge (services)
  const [services, setServices] = useState<ServiceItem[]>([
    { id: '1', label: t('tasks.vacuum'), completed: false },
    { id: '2', label: 'Strojno čišćenje', completed: false },
    { id: '3', label: t('tasks.waterline'), completed: false },
    { id: '4', label: t('tasks.skimmer'), completed: false },
    { id: '5', label: t('tasks.backwash'), completed: false },
    { id: '6', label: t('tasks.machinery'), completed: false },
  ]);

  // Update labels when language changes
  useEffect(() => {
    setServices(prev => prev.map(s => {
      switch(s.id) {
        case '1': return { ...s, label: t('tasks.vacuum') };
        case '2': return { ...s, label: language === 'hr' ? 'Strojno čišćenje' : 'Robotic Cleaning' };
        case '3': return { ...s, label: t('tasks.waterline') };
        case '4': return { ...s, label: t('tasks.skimmer') };
        case '5': return { ...s, label: t('tasks.backwash') };
        case '6': return { ...s, label: t('tasks.machinery') };
        default: return s;
      }
    }));
  }, [language, t]);

  // Tab 3: Zamjene dijelova
  const [replacements, setReplacements] = useState<ReplacementItem[]>([]);

  useEffect(() => {
    if (poolId) {
      const poolData = storage.getPool(poolId);
      if (!poolData) {
        setStep(1);
        return;
      }
      setSelectedPool(poolData);
      
      // Load client data
      if (poolData.clientId) {
        const clientData = storage.getClients().find(c => c.id === poolData.clientId);
        if (clientData) {
          setSelectedClient(clientData);
        } else {
          // Fallback: if client ID exists but client not found, try to create a dummy client or just set dummy name
          setSelectedClient({ id: poolData.clientId, name: 'Klijent ' + poolData.clientId } as Client);
        }
      } else {
        // Pool has no client assigned, allow proceeding or handle gracefully
        setSelectedClient({ id: 'temporary', name: 'Nezabilježeni klijent' } as Client);
      }
      setStep(3);
    }
  }, [poolId]);

  useEffect(() => {
    const saved = localStorage.getItem('employees');
    if (saved) {
      setEmployees(JSON.parse(saved));
    }
    
    // Auto-assign to current employee if executor role
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'employee') {
      const currentEmployeeId = localStorage.getItem('currentEmployeeId');
      if (currentEmployeeId) {
        setAssignedWorkers([currentEmployeeId]);
      }
    }
  }, []);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setStep(2);
  };

  const handleSelectPool = (pool: Pool) => {
    setSelectedPool(pool);
    setStep(3);
  };

  const handleToggleService = (id: string) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, completed: !s.completed } : s
    ));
  };

  const handleAddReplacement = () => {
    setReplacements([
      ...replacements,
      {
        id: Date.now().toString(),
        part: '',
        quantity: 1,
        notes: ''
      }
    ]);
  };

  const handleRemoveReplacement = (id: string) => {
    setReplacements(replacements.filter(r => r.id !== id));
  };

  const handleUpdateReplacement = (id: string, field: keyof ReplacementItem, value: any) => {
    setReplacements(replacements.map(r =>
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const handleSave = () => {
    if (!selectedPool || !selectedClient) return;

    // Generate work order number
    const existingOrders = workOrderStorage.getAll();
    const year = new Date().getFullYear();
    const orderCount = existingOrders.filter((o: any) => 
      o.workOrderNumber?.startsWith(`RN-${year}`)
    ).length;
    const workOrderNumber = `RN-${year}-${String(orderCount + 1).padStart(3, '0')}`;

    // Prepare services as object with labels
    const servicesObj: Record<string, boolean> = {};
    const servicesLabels: Record<string, string> = {};
    const requestedServices: string[] = [];
    
    services.forEach(s => {
      servicesObj[s.id] = false; // Start all unchecked for executor to complete
      servicesLabels[s.id] = s.label;
      if (s.completed) {
        requestedServices.push(s.id);
      }
    });

    // Prepare structured notes data for WorkOrderDetails
    const workOrderData = {
      workOrderNumber,
      clientType: 'individual' as const,
      orderNumber: '',
      year: year.toString(),
      dateStarted: new Date().toISOString(),
      dateCompleted: '',
      costCenter: '',
      costBearer: '',
      description: additionalNotes,
      issuer: '',
      analysisEnabled,
      services: servicesObj,
      servicesLabels,
      requestedServices, // Store which were requested by employer
      replacements: replacements.map(r => ({
        ...r,
        completed: false
      })),
    };

    const primaryWorkerId = assignedWorkers[0] || '';
    const primaryWorker = employees.find(e => e.id === primaryWorkerId);
    
    const additionalWorkersList = assignedWorkers.slice(1).map(id => {
       const emp = employees.find(e => e.id === id);
       return emp ? { id: emp.id, name: emp.name } : null;
    }).filter(item => item !== null) as { id: string, name: string }[];

    const workOrder = {
      id: Date.now().toString(),
      workOrderNumber,
      poolId: selectedPool.id,
      poolName: selectedPool.name,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      date: new Date().toISOString(),
      type: 'maintenance' as const,
      assignedTo: primaryWorkerId,
      assignedToName: primaryWorker ? primaryWorker.name : '',
      additionalWorkers: additionalWorkersList,
      status: 'in-progress' as const,
      notes: JSON.stringify(workOrderData), // Structured data for WorkOrderDetails
      tasks: {
        analysis: analysisEnabled,
        services: services.filter(s => s.completed),
        replacements,
      },
      additionalNotes,
      photos: galleryImages.map(img => ({
        id: Math.random().toString(36).substr(2, 9),
        category: 'general',
        dataUrl: img.url,
        timestamp: new Date().toISOString()
      })),
    };

    // Save using workOrderStorage
    workOrderStorage.save(workOrder);

    // Send notification if assigned to an employee
    if (assignedWorkers.length > 0) {
      assignedWorkers.forEach(empId => {
        api.sendNotification({
          userId: empId,
          title: 'Novi radni nalog',
          message: `Dodijeljen vam je novi radni nalog ${workOrderNumber} za klijenta ${selectedClient.name}.`,
          workOrderId: workOrder.id
        }).catch(err => console.error('Failed to send notification:', err));
      });
    }

    // Show success message
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/app/all-work-orders');
    }, 1500);
  };

  // STEP 1: Select Client
  if (step === 1) {
    const clients = storage.getClients().sort((a, b) => 
      (a.name || '').localeCompare(b.name || '', 'hr', { sensitivity: 'base' })
    );
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-slate-800/50 border-b border-amber-500/20 sticky top-0 z-10 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
            <button 
              onClick={() => navigate('/app')} 
              className="mr-4 text-amber-500 hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
              {t('common.client')}
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4">
          <p className="text-slate-300 mb-4">{t('roles.selectRole')}:</p>
          
          {clients.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nema klijenata. Prvo dodajte klijenta.</p>
              <button
                onClick={() => navigate('/app/clients')}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg hover:from-amber-500 hover:to-yellow-500 transition-all"
              >
                Dodaj klijenta
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  className="w-full bg-slate-800/50 border border-amber-500/20 rounded-xl p-4 text-left hover:bg-slate-800/70 hover:border-amber-500/50 transition-all"
                >
                  <h3 className="text-lg font-medium text-white mb-2">{client.name}</h3>
                  {client.contact && (
                    <div className="text-sm text-slate-400">📞 {client.contact}</div>
                  )}
                  {(client.address || client.location?.address) && (
                    <div className="text-sm text-slate-400">
                      📍 {client.address || client.location?.address}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // STEP 2: Select Pool
  if (step === 2 && selectedClient) {
    const clientPools = storage.getPools().filter(p => p.clientId === selectedClient.id);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-slate-800/50 border-b border-amber-500/20 sticky top-0 z-10 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
            <button 
              onClick={() => setStep(1)} 
              className="mr-4 text-amber-500 hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
              Odabir bazena
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4">
          <div className="mb-4">
            <div className="text-sm text-slate-400">Klijent:</div>
            <div className="text-lg text-white font-medium">{selectedClient.name}</div>
          </div>

          <p className="text-slate-300 mb-4">Odaberite bazen:</p>
          
          {clientPools.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center">
              <Droplets className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Ovaj klijent nema bazene.</p>
              <button
                onClick={() => {
                  // Save context for return
                  localStorage.setItem('workOrderContext', JSON.stringify({
                    clientId: selectedClient.id,
                    returnTo: 'work-order'
                  }));
                  navigate(`/app/clients/${selectedClient.id}`);
                }}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg hover:from-amber-500 hover:to-yellow-500 transition-all"
              >
                Dodaj bazen klijentu
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {clientPools.map((pool) => (
                  <button
                    key={pool.id}
                    onClick={() => handleSelectPool(pool)}
                    className="w-full bg-slate-800/50 border border-amber-500/20 rounded-xl p-4 text-left hover:bg-slate-800/70 hover:border-amber-500/50 transition-all"
                  >
                    <h3 className="text-lg font-medium text-white mb-2">{pool.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                      <div>💧 {pool.volume}m³</div>
                      <div>📏 {pool.dimensions}</div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Add New Pool Button */}
              <button
                onClick={() => {
                  // Save context for return
                  localStorage.setItem('workOrderContext', JSON.stringify({
                    clientId: selectedClient.id,
                    returnTo: 'work-order'
                  }));
                  navigate(`/app/clients/${selectedClient.id}`);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl p-4 hover:from-blue-500 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 font-medium border border-blue-500/30"
              >
                <Plus className="w-5 h-5" />
                Dodaj novi bazen ovom klijentu
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // STEP 3: Fill Work Order
  if (!selectedPool || !selectedClient) {
    return null;
  }

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'analysis', label: t('analysis.title'), icon: Droplets },
    { id: 'services', label: t('common.settings'), icon: Wrench },
    { id: 'replacements', label: t('common.edit'), icon: Settings },
    { id: 'equipment', label: t('common.pool'), icon: Settings },
    { id: 'gallery', label: t('common.gallery'), icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-24">
      {/* SUCCESS MESSAGE */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-green-500/50 rounded-2xl p-8 max-w-sm w-full text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Nalog spremljen!</h2>
            <p className="text-slate-300">Radni nalog je uspješno kreiran.</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-slate-800/50 border-b border-amber-500/20 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => setStep(2)} 
              className="mr-4 text-amber-500 hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                {t('home.actions.newOrder')}
              </h1>
              <div className="text-sm text-slate-400">
                {selectedClient.name} • {selectedPool.name}
              </div>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {t('common.save')}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* ASSIGN TO */}
        <div className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-4">
          <label className="block text-sm text-slate-300 mb-4 font-bold uppercase tracking-wider">Dodjeli djelatnicima <span className="text-slate-500 text-xs font-normal normal-case ml-2">(Prvi odabrani je voditelj)</span></label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {employees.map((emp) => {
              const isAssigned = assignedWorkers.includes(emp.id);
              return (
              <label 
                key={emp.id} 
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all select-none ${
                  isAssigned
                    ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                  isAssigned
                    ? 'bg-amber-500 border-amber-500'
                    : 'border-slate-600 bg-slate-800'
                }`}>
                  {isAssigned && <Check className="w-4 h-4 text-[#030213] stroke-[4]" />}
                </div>
                <input
                  type="checkbox"
                  checked={isAssigned}
                  onChange={() => {
                    setAssignedWorkers(prev => {
                      if (prev.includes(emp.id)) {
                        return prev.filter(id => id !== emp.id);
                      } else {
                        return [...prev, emp.id];
                      }
                    });
                  }}
                  className="hidden"
                />
                <span className="font-bold">{emp.name}</span>
                {assignedWorkers[0] === emp.id && (
                  <span className="ml-auto text-[10px] uppercase font-black bg-amber-500 text-black px-2 py-1 rounded shadow-sm">
                    Voditelj
                  </span>
                )}
              </label>
            )})}
          </div>
          {employees.length === 0 && (
            <div className="text-center py-4 text-slate-500 text-sm bg-slate-900/50 rounded-lg border border-slate-800">
                Nema unesenih djelatnika. <button onClick={() => navigate('/app/employee-management')} className="text-amber-500 hover:underline">Dodaj djelatnike</button>
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-amber-500/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        <div className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-6">
          {/* TAB 1: ANALIZA VODE */}
          {activeTab === 'analysis' && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">{t('analysis.title')}</h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={analysisEnabled}
                  onChange={(e) => setAnalysisEnabled(e.target.checked)}
                  className="w-6 h-6 rounded border-slate-600 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-slate-300">{t('common.analysis')}</span>
              </label>
            </div>
          )}

          {/* TAB 2: USLUGE */}
          {activeTab === 'services' && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Usluge</h3>
              <div className="space-y-3">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg cursor-pointer hover:bg-slate-900/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={service.completed}
                      onChange={() => handleToggleService(service.id)}
                      className="w-5 h-5 rounded border-slate-600 text-green-600 focus:ring-green-500"
                    />
                    <span className={`flex-1 ${service.completed ? 'text-green-400 line-through' : 'text-slate-300'}`}>
                      {service.label}
                    </span>
                    {service.completed && <Check className="w-5 h-5 text-green-500" />}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ZAMJENE DIJELOVA */}
          {activeTab === 'replacements' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Zamjene neispravnih dijelova</h3>
                <button
                  onClick={handleAddReplacement}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Dodaj
                </button>
              </div>

              {replacements.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  Nema zamjena. Kliknite "Dodaj" za novu zamjenu.
                </div>
              ) : (
                <div className="space-y-4">
                  {replacements.map((replacement) => (
                    <div key={replacement.id} className="bg-slate-900/30 rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            placeholder="Naziv dijela"
                            value={replacement.part}
                            onChange={(e) => handleUpdateReplacement(replacement.id, 'part', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="number"
                              placeholder="Količina"
                              value={replacement.quantity}
                              onChange={(e) => handleUpdateReplacement(replacement.id, 'quantity', parseInt(e.target.value))}
                              className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <input
                              type="text"
                              placeholder="Napomena"
                              value={replacement.notes}
                              onChange={(e) => handleUpdateReplacement(replacement.id, 'notes', e.target.value)}
                              className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveReplacement(replacement.id)}
                          className="ml-3 p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: OPREMA */}
          {activeTab === 'equipment' && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Oprema</h3>
              {selectedPool.equipment && selectedPool.equipment.length > 0 ? (
                <div className="space-y-3">
                  {selectedPool.equipment.map((item: any, index: number) => (
                    <div key={index} className="bg-slate-900/30 rounded-lg p-4">
                      <div className="font-medium text-white mb-1">{item.type}</div>
                      {item.brand && <div className="text-sm text-slate-400">Marka: {item.brand}</div>}
                      {item.model && <div className="text-sm text-slate-400">Model: {item.model}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  Nema evidentirane opreme za ovaj bazen.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: GALERIJA */}
          {activeTab === 'gallery' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Galerija površine vode</h3>
                <span className="text-xs text-slate-400">Preporučeno: Slikajte stanje prije rada</span>
              </div>
              <ImageUploader 
                folder={`work-orders/${selectedPool.id}`}
                existingImages={galleryImages}
                onImageUploaded={(url, path) => setGalleryImages(prev => [...prev, { url, path }])}
                onImageRemoved={(path) => setGalleryImages(prev => prev.filter(img => img.path !== path))}
                maxImages={8}
              />
            </div>
          )}
        </div>

        {/* OPIS DODATNIH AKTIVNOSTI */}
        <div className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-4">
          <label className="block text-sm text-slate-300 mb-2">Opis dodatnih aktivnosti:</label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={4}
            placeholder="Unesite dodatne napomene ili aktivnosti..."
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white resize-none"
          />
        </div>
      </div>
    </div>
  );
}