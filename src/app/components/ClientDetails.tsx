import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Droplets, Beaker, Calendar, MapPin, Settings, FileText, AlertTriangle, Image as ImageIcon, Check, Wrench, Plus, Camera, X, Phone, Clock, TrendingDown, Trash2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { workOrderStorage } from '../lib/workOrderStorage';
import { Client, Pool, WaterAnalysis, WorkOrder } from '../types';
import { motion } from 'motion/react';

type TabType = 'overview' | 'equipment' | 'analyses' | 'gallery' | 'workorders' | 'issues';

export function ClientDetails() {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [clientPools, setClientPools] = useState<Pool[]>([]);
  const [analyses, setAnalyses] = useState<WaterAnalysis[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    if (clientId) {
      const clientData = storage.getClient(clientId);
      setClient(clientData || null);
      
      const pools = storage.getPools().filter(p => p.clientId === clientId);
      setClientPools(pools);

      // Get all analyses for this client's pools
      const poolIds = pools.map(p => p.id);
      const allAnalyses = storage.getAnalyses();
      const clientAnalyses = allAnalyses.filter(a => poolIds.includes(a.poolId));
      setAnalyses(clientAnalyses.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));

      // Get all work orders for this client's pools
      const allWorkOrders = workOrderStorage.getAll();
      const clientWorkOrders = allWorkOrders.filter(w => poolIds.includes(w.poolId));
      setWorkOrders(clientWorkOrders.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    }
  }, [clientId]);

  const handleDeletePool = (e: React.MouseEvent, poolId: string, poolName: string) => {
    e.stopPropagation();
    
    const poolAnalyses = storage.getAnalyses(poolId);
    const workOrdersData = localStorage.getItem('workOrders');
    let workOrderCount = 0;
    if (workOrdersData) {
      const workOrders = JSON.parse(workOrdersData);
      workOrderCount = workOrders.filter((wo: any) => wo.poolId === poolId).length;
    }
    
    const confirmMessage = poolAnalyses.length > 0 || workOrderCount > 0
      ? `Jeste li sigurni da želite obrisati bazen "${poolName}"?\n\n` +
        `${poolAnalyses.length > 0 ? `• ${poolAnalyses.length} ${poolAnalyses.length === 1 ? 'analiza' : 'analiza'}\n` : ''}` +
        `${workOrderCount > 0 ? `• ${workOrderCount} ${workOrderCount === 1 ? 'radni nalog' : 'radnih naloga'}\n` : ''}` +
        `\nSvi povezani podaci će biti trajno obrisani.`
      : `Jeste li sigurni da želite obrisati bazen "${poolName}"?`;
    
    if (window.confirm(confirmMessage)) {
      storage.deletePool(poolId);
      // Refresh pools list
      const pools = storage.getPools().filter(p => p.clientId === clientId);
      setClientPools(pools);
      
      // Refresh analyses
      const poolIds = pools.map(p => p.id);
      const allAnalyses = storage.getAnalyses();
      const clientAnalyses = allAnalyses.filter(a => poolIds.includes(a.poolId));
      setAnalyses(clientAnalyses.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    }
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Klijent nije pronađen</p>
          <button
            onClick={() => navigate('/app/clients')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Povratak na listu
          </button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const latestAnalysis = analyses[0];
  const criticalIssues = analyses.filter(a => a.status === 'critical').length;
  const warningIssues = analyses.filter(a => a.status === 'warning').length;
  const totalEquipmentIssues = analyses.filter(a => a.notes?.equipmentIssues).length;

  // All equipment photos from all analyses
  const allEquipmentPhotos = analyses.flatMap(a => a.notes?.equipmentPhotos || []);
  const allGalleryPhotos = allEquipmentPhotos.filter(p => 
    !['issues', 'work', 'products'].includes(p.category)
  );
  const issuePhotos = allEquipmentPhotos.filter(p => p.category === 'issues');

  const tabs: { id: TabType; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'Pregled', icon: Droplets },
    { id: 'equipment', label: 'Oprema', icon: Settings, badge: totalEquipmentIssues || undefined },
    { id: 'analyses', label: 'Analize', icon: Beaker, badge: analyses.length },
    { id: 'gallery', label: 'Galerija površine vode', icon: ImageIcon, badge: allGalleryPhotos.length || undefined },
    { id: 'workorders', label: 'Radni nalozi', icon: FileText },
    { id: 'issues', label: 'Kvarovi', icon: AlertTriangle, badge: totalEquipmentIssues || undefined },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-slate-900 to-black pb-20">
      {/* Header */}
      <div className="bg-zinc-900/90 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate('/app/clients')} 
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{client.name}</h1>
              <div className="flex items-center gap-4 text-sm text-blue-100 mt-1">
                {client.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </div>
                )}
                {client.location?.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {client.location.address}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
              <div className="text-2xl font-bold">{clientPools.length}</div>
              <div className="text-xs text-blue-100">Bazeni</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
              <div className="text-2xl font-bold">{analyses.length}</div>
              <div className="text-xs text-blue-100">Analize</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
              <div className="text-2xl font-bold text-yellow-200">{warningIssues}</div>
              <div className="text-xs text-blue-100">Upozorenja</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
              <div className="text-2xl font-bold text-red-200">{criticalIssues}</div>
              <div className="text-xs text-blue-100">Kritično</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-xl font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-sky-600'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id ? 'bg-sky-500 text-white' : 'bg-white/30'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Latest Analysis Card */}
            {latestAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl p-6 shadow-xl border-2 ${
                  latestAnalysis.status === 'critical' 
                    ? 'bg-gradient-to-br from-red-50 to-rose-100 border-red-300'
                    : latestAnalysis.status === 'warning'
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-300'
                    : 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {latestAnalysis.status === 'critical' ? '🚨 Kritično stanje' :
                       latestAnalysis.status === 'warning' ? '⚠️ Potrebna pažnja' :
                       '✅ Stanje OK'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Zadnja analiza: {new Date(latestAnalysis.date).toLocaleDateString('hr-HR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const pool = clientPools.find(p => p.id === latestAnalysis.poolId);
                      if (pool) navigate(`/app/pools/${pool.id}/analysis/${latestAnalysis.id}`);
                    }}
                    className="px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold text-gray-700"
                  >
                    Detalji →
                  </button>
                </div>

                {/* Critical Parameters */}
                {(latestAnalysis.status === 'warning' || latestAnalysis.status === 'critical') && (
                  <div className="bg-white/70 rounded-xl p-4">
                    <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                      Problematični parametri:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {latestAnalysis.parameters.pH < 6.8 || latestAnalysis.parameters.pH > 7.8 ? (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          pH: {latestAnalysis.parameters.pH.toFixed(1)} (6.8-7.8)
                        </span>
                      ) : null}
                      {latestAnalysis.parameters.freeChlorine < 0.5 || latestAnalysis.parameters.freeChlorine > 5 ? (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          Klor: {latestAnalysis.parameters.freeChlorine.toFixed(1)} (0.5-5)
                        </span>
                      ) : null}
                      {latestAnalysis.parameters.alkalinity && (latestAnalysis.parameters.alkalinity < 80 || latestAnalysis.parameters.alkalinity > 200) ? (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          Alkalitet: {latestAnalysis.parameters.alkalinity} (80-200)
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div className="bg-white/50 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-600 mb-1">pH</div>
                    <div className="text-lg font-bold text-gray-900">{latestAnalysis.parameters.pH.toFixed(1)}</div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-600 mb-1">Klor</div>
                    <div className="text-lg font-bold text-gray-900">{latestAnalysis.parameters.freeChlorine.toFixed(1)}</div>
                  </div>
                  {latestAnalysis.parameters.temperature && (
                    <div className="bg-white/50 rounded-lg p-3 text-center">
                      <div className="text-sm text-gray-600 mb-1">Temp</div>
                      <div className="text-lg font-bold text-gray-900">{latestAnalysis.parameters.temperature}°C</div>
                    </div>
                  )}
                  {latestAnalysis.parameters.orp && (
                    <div className="bg-white/50 rounded-lg p-3 text-center">
                      <div className="text-sm text-gray-600 mb-1">ORP</div>
                      <div className="text-lg font-bold text-gray-900">{latestAnalysis.parameters.orp}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Pools List */}
            <div className="bg-zinc-800/60 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-amber-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Bazeni</h3>
                <button
                  onClick={() => {
                    // Save clientId for NewPool to use
                    localStorage.setItem('newPoolClientId', clientId || '');
                    navigate('/app/pools/new');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all shadow-lg font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Dodaj bazen
                </button>
              </div>
              
              {clientPools.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Droplets className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p>Nema bazena za ovog klijenta</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientPools.map((pool) => {
                    const poolAnalyses = analyses.filter(a => a.poolId === pool.id);
                    const latestPoolAnalysis = poolAnalyses[0];
                    
                    return (
                      <div
                        key={pool.id}
                        className="bg-zinc-900/60 border-2 border-zinc-700 p-4 rounded-2xl hover:border-amber-500/40 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            onClick={() => navigate(`/app/pools/${pool.id}`)}
                            className="flex-1 text-left"
                          >
                            <h4 className="font-semibold text-white mb-1">{pool.name}</h4>
                            <div className="text-sm text-gray-400 space-y-1">
                              <div>Volumen: {pool.volume} m³</div>
                              {pool.disinfectionSystem && (
                                <div className="capitalize">Sustav: {pool.disinfectionSystem}</div>
                              )}
                              {pool.location?.address && <div>{pool.location.address}</div>}
                            </div>
                          </button>
                          
                          <div className="flex flex-col gap-2 items-end">
                            {latestPoolAnalysis && (
                              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                latestPoolAnalysis.status === 'critical' ? 'bg-red-500 text-white' :
                                latestPoolAnalysis.status === 'warning' ? 'bg-yellow-500 text-white' :
                                'bg-green-500 text-white'
                              }`}>
                                {latestPoolAnalysis.status === 'critical' ? '🚨 KRITIČNO' :
                                 latestPoolAnalysis.status === 'warning' ? '⚠️ UPOZORENJE' :
                                 '✅ OK'}
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/app/pools/${pool.id}/work-orders/new`);
                              }}
                              className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-4 py-2 rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-amber-500/25 flex items-center gap-2 font-semibold text-sm whitespace-nowrap"
                            >
                              <FileText className="w-4 h-4" />
                              Radni nalog
                            </button>
                            <button
                              onClick={(e) => handleDeletePool(e, pool.id, pool.name)}
                              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2 font-semibold text-sm whitespace-nowrap"
                            >
                              <Trash2 className="w-4 h-4" />
                              Obriši
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Client Notes */}
            {client.notes && (
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Napomene</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* EQUIPMENT TAB */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Instalirana oprema</h3>
              
              {/* Equipment from all pools */}
              {clientPools.map(pool => {
                const poolAnalyses = analyses.filter(a => a.poolId === pool.id);
                const hasEquipmentData = poolAnalyses.some(a => a.notes?.equipmentPhotos && a.notes.equipmentPhotos.length > 0);
                
                if (!hasEquipmentData) return null;
                
                return (
                  <div key={pool.id} className="mb-6 last:mb-0">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-sky-500" />
                      {pool.name}
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {poolAnalyses[0]?.notes?.equipmentPhotos?.filter(p => 
                        !['issues', 'work', 'products'].includes(p.category)
                      ).map(photo => (
                        <div key={photo.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                          <img 
                            src={photo.dataUrl} 
                            alt={photo.category}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                          <div className="text-sm font-medium text-gray-900 capitalize">{photo.category}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(photo.timestamp).toLocaleDateString('hr-HR')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {!clientPools.some(pool => {
                const poolAnalyses = analyses.filter(a => a.poolId === pool.id);
                return poolAnalyses.some(a => a.notes?.equipmentPhotos && a.notes.equipmentPhotos.length > 0);
              }) && (
                <div className="text-center py-12 text-gray-500">
                  <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Nema zabilježene opreme</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ANALYSES TAB */}
        {activeTab === 'analyses' && (
          <div className="space-y-4">
            {analyses.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg p-12 text-center text-gray-500">
                <Beaker className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>Nema analiza</p>
              </div>
            ) : (
              analyses.map((analysis, idx) => {
                const pool = clientPools.find(p => p.id === analysis.poolId);
                
                return (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{pool?.name || 'Nepoznati bazen'}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            analysis.status === 'critical' ? 'bg-red-500 text-white' :
                            analysis.status === 'warning' ? 'bg-yellow-500 text-white' :
                            'bg-green-500 text-white'
                          }`}>
                            {analysis.status === 'critical' ? 'KRITIČNO' :
                             analysis.status === 'warning' ? 'UPOZORENJE' : 'OK'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {new Date(analysis.date).toLocaleDateString('hr-HR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/app/pools/${analysis.poolId}/analysis/${analysis.id}`)}
                        className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm font-semibold"
                      >
                        Detalji
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-600">pH</div>
                        <div className="font-bold text-gray-900">{analysis.parameters.pH.toFixed(1)}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-600">Klor</div>
                        <div className="font-bold text-gray-900">{analysis.parameters.freeChlorine.toFixed(1)}</div>
                      </div>
                      {analysis.parameters.temperature && (
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-600">Temp</div>
                          <div className="font-bold text-gray-900">{analysis.parameters.temperature}°</div>
                        </div>
                      )}
                      {analysis.parameters.orp && (
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-600">ORP</div>
                          <div className="font-bold text-gray-900">{analysis.parameters.orp}</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Galerija slika</h3>
              
              {allGalleryPhotos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Nema slika</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {allGalleryPhotos.map(photo => (
                    <div key={photo.id} className="relative group">
                      <img 
                        src={photo.dataUrl} 
                        alt={photo.category}
                        className="w-full h-48 object-cover rounded-xl shadow-md hover:shadow-xl transition-all"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-xl">
                        <div className="text-white text-sm font-medium capitalize">{photo.category}</div>
                        <div className="text-white/80 text-xs">
                          {new Date(photo.timestamp).toLocaleDateString('hr-HR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* WORK ORDERS TAB */}
        {activeTab === 'workorders' && (
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Radni nalozi</h3>
            
            {workOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>Nema radnih naloga</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workOrders.map(workOrder => {
                  const pool = clientPools.find(p => p.id === workOrder.poolId);
                  
                  return (
                    <div key={workOrder.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{pool?.name}</h4>
                          <div className="text-sm text-gray-600">
                            {new Date(workOrder.date).toLocaleDateString('hr-HR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/app/pools/${workOrder.poolId}/analysis/${workOrder.analysisId}`)}
                          className="text-sm text-sky-600 hover:text-sky-700 font-semibold"
                        >
                          Pogledaj →
                        </button>
                      </div>
                      
                      {workOrder.equipmentIssues && (
                        <div className="mb-2">
                          <div className="text-xs font-semibold text-red-600 mb-1">KVAROVI:</div>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">{workOrder.equipmentIssues}</div>
                        </div>
                      )}
                      
                      {workOrder.additionalWork && (
                        <div>
                          <div className="text-xs font-semibold text-blue-600 mb-1">DODATNI RADOVI:</div>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">{workOrder.additionalWork}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ISSUES TAB */}
        {activeTab === 'issues' && (
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Kvarovi i upozorenja
            </h3>
            
            {totalEquipmentIssues === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-600 font-semibold">Nema prijavljenih kvarova</p>
                <p className="text-sm text-gray-500 mt-1">Svi uređaji rade ispravno</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analyses.filter(a => a.notes?.equipmentIssues).map(analysis => {
                  const pool = clientPools.find(p => p.id === analysis.poolId);
                  
                  return (
                    <div key={analysis.id} className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Wrench className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900">{pool?.name}</h4>
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                              NOVO
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {new Date(analysis.date).toLocaleDateString('hr-HR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{analysis.notes?.equipmentIssues}</p>
                          
                          {/* Issue Photos */}
                          {analysis.notes?.equipmentPhotos?.filter(p => p.category === 'issues').length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              {analysis.notes.equipmentPhotos.filter(p => p.category === 'issues').map(photo => (
                                <img 
                                  key={photo.id}
                                  src={photo.dataUrl} 
                                  alt="Kvar"
                                  className="w-full h-20 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-3 border-t border-red-200">
                        <button
                          onClick={() => navigate(`/app/pools/${analysis.poolId}/analysis/${analysis.id}`)}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                          Pogledaj radni nalog
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}