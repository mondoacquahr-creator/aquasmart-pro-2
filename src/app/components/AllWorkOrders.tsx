import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, FileText, Calendar, User, MapPin, CheckCircle, Clock, AlertCircle, Trash2, Edit2, Save, X, PlusCircle } from 'lucide-react';
import { storage } from '../lib/storage';
import { workOrderStorage } from '../lib/workOrderStorage';
import { useLanguage } from '../lib/languageContext';

interface WorkOrder {
  id: string;
  poolId: string;
  clientId: string;
  date: string;
  assignedTo?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'invoiced';
  tasks: {
    analysis: boolean;
    services: any[];
    replacements: any[];
  };
  additionalNotes?: string;
  workOrderNumber?: string;
}

export function AllWorkOrders() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed' | 'invoiced'>('in-progress');

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const loadWorkOrders = () => {
    try {
      const saved = localStorage.getItem('workOrders');
      if (saved) {
        const parsed = JSON.parse(saved);
        setWorkOrders(Array.isArray(parsed) ? parsed.filter(i => i !== null) : []);
      }
    } catch (e) {
      console.error('Error loading work orders:', e);
      setWorkOrders([]);
    }
  };

  const getClient = (clientId: string) => {
    if (!clientId) return null;
    return storage.getClients().find(c => c && c.id === clientId);
  };

  const getPool = (poolId: string) => {
    if (!poolId) return null;
    return storage.getPools().find(p => p && p.id === poolId);
  };

  const getEmployee = (employeeId: string) => {
    if (!employeeId) return null;
    try {
      const saved = localStorage.getItem('employees');
      if (saved) {
        const employees = JSON.parse(saved);
        if (Array.isArray(employees)) {
          return employees.find((e: any) => e && e.id === employeeId);
        }
      }
    } catch (e) {}
    return null;
  };

  const filteredOrders = workOrders.filter(order => {
    if (activeTab === 'in-progress') return order.status === 'in-progress';
    if (activeTab === 'completed') return order.status === 'completed';
    if (activeTab === 'invoiced') return order.status === 'invoiced';
    return false;
  });

  const handleDeleteWorkOrder = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation(); // Prevent navigation
    
    if (confirm('⚠️ Jeste li sigurni da želite obrisati ovaj radni nalog?\n\nOva radnja se ne može poništiti!')) {
      workOrderStorage.delete(orderId);
      loadWorkOrders(); // Reload
      alert('✅ Radni nalog uspješno obrisan!');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'invoiced':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'invoiced':
        return language === 'hr' ? 'Fakturirano' : language === 'it' ? 'Fatturato' : 'Invoiced';
      case 'completed':
        return t('statuses.completed');
      case 'in-progress':
        return t('statuses.inProgress');
      default:
        return t('statuses.pending');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* HEADER */}
      <div className="bg-slate-800/50 border-b border-amber-500/20 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => navigate('/app')} 
            className="mr-4 text-amber-500 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
            {t('home.stats.orders')}
          </h1>
          <button
            onClick={() => navigate('/app/work-orders/new')}
            className="ml-auto bg-amber-500 text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Novi nalog
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* FILTERS */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('in-progress')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'in-progress'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg shadow-amber-500/30'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {t('statuses.inProgress')}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'completed'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg shadow-amber-500/30'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {t('statuses.completed')}
          </button>
          <button
            onClick={() => setActiveTab('invoiced')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'invoiced'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg shadow-amber-500/30'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {language === 'hr' ? 'Fakturirano' : language === 'it' ? 'Fatturato' : 'Invoiced'}
          </button>
        </div>

        {/* WORK ORDERS LIST */}
        {filteredOrders.length === 0 ? (
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {activeTab === 'in-progress' && 'Nema radnih naloga u tijeku'}
              {activeTab === 'completed' && 'Nema završenih radnih naloga'}
              {activeTab === 'invoiced' && 'Nema fakturiranih radnih naloga'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const client = getClient(order.clientId);
              const pool = getPool(order.poolId);
              const employee = order.assignedTo ? getEmployee(order.assignedTo) : null;

              return (
                <div
                  key={order.id}
                  className="relative w-full bg-slate-800/50 border border-amber-500/20 rounded-xl p-4 hover:bg-slate-800/70 transition-all"
                >
                  <div
                    onClick={() => {
                      if (order.poolId && order.poolId !== 'undefined') {
                        navigate(`/app/pools/${order.poolId}/work-orders/${order.id}`);
                      } else {
                        // Fallback route that doesn't require poolId
                        navigate(`/app/work-orders/${order.id}`);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {/* HEADER */}
                    <div className="flex items-start justify-between mb-3 pr-10">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-medium text-slate-300">
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        {order.workOrderNumber && (
                          <span className="text-amber-500 font-mono font-bold">
                            {order.workOrderNumber}
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.date).toLocaleDateString('hr-HR')}
                        </div>
                      </div>
                    </div>

                    {/* CLIENT & POOL */}
                    <div className="mb-3">
                      <h3 className="text-lg font-medium text-white mb-1">
                        {client?.name || 'Nepoznat klijent'}
                      </h3>
                      <div className="text-sm text-slate-400">
                        {pool?.name || 'Nepoznat bazen'} • {pool?.volume || 0}m³
                      </div>
                    </div>

                    {/* ASSIGNED TO */}
                    {employee && (
                      <div className="flex items-center gap-2 text-sm text-amber-500 mb-3">
                        <User className="w-4 h-4" />
                        <span>Dodjeljeno: {employee.name}</span>
                      </div>
                    )}

                    {/* TASKS SUMMARY */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {order.tasks?.analysis && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md">
                          Analiza vode
                        </span>
                      )}
                      {order.tasks?.services && Array.isArray(order.tasks.services) && order.tasks.services.length > 0 && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-md">
                          {order.tasks.services.length} usluga
                        </span>
                      )}
                      {order.tasks?.replacements && Array.isArray(order.tasks.replacements) && order.tasks.replacements.length > 0 && (
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-md">
                          {order.tasks.replacements.length} zamjena
                        </span>
                      )}
                    </div>
                  </div>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={(e) => handleDeleteWorkOrder(e, order.id)}
                    className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Obriši radni nalog"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}