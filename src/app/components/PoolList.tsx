import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search, AlertCircle, CheckCircle, AlertTriangle, Droplets, MapPin, Plus, Beaker, Trash2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { Pool } from '../types';

export function PoolList() {
  const navigate = useNavigate();
  const [pools, setPools] = useState<Pool[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setPools(storage.getPools());
  }, []);

  const filteredPools = pools.filter(pool =>
    pool.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status?: Pool['lastAnalysisStatus']) => {
    if (!status) return <Droplets className="w-6 h-6 text-white" />;
    
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-6 h-6 text-white" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-white" />;
      case 'critical':
        return <AlertCircle className="w-6 h-6 text-white" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nema analiza';
    const date = new Date(dateString);
    return date.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleDeletePool = (e: React.MouseEvent, poolId: string, poolName: string) => {
    e.stopPropagation();
    
    const analyses = storage.getAnalyses(poolId);
    const workOrdersData = localStorage.getItem('workOrders');
    let workOrderCount = 0;
    if (workOrdersData) {
      const workOrders = JSON.parse(workOrdersData);
      workOrderCount = workOrders.filter((wo: any) => wo.poolId === poolId).length;
    }
    
    const confirmMessage = analyses.length > 0 || workOrderCount > 0
      ? `Jeste li sigurni da želite obrisati bazen "${poolName}"?\n\n` +
        `${analyses.length > 0 ? `• ${analyses.length} ${analyses.length === 1 ? 'analiza' : 'analiza'}\n` : ''}` +
        `${workOrderCount > 0 ? `• ${workOrderCount} ${workOrderCount === 1 ? 'radni nalog' : 'radnih naloga'}\n` : ''}` +
        `\nSvi povezani podaci će biti trajno obrisani.`
      : `Jeste li sigurni da želite obrisati bazen "${poolName}"?`;
    
    if (window.confirm(confirmMessage)) {
      storage.deletePool(poolId);
      setPools(pools.filter(p => p.id !== poolId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-slate-900 to-black pb-20">
      {/* Header */}
      <div className="bg-zinc-900/90 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center">
                <Droplets className="w-8 h-8 text-sky-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Moji bazeni</h1>
                <p className="text-gray-600 text-sm">{pools.length} {pools.length === 1 ? 'bazen' : 'bazena'} • Klikni za analizu</p>
              </div>
            </div>
            {pools.length > 0 && (
              <button
                onClick={() => navigate('/app/pools/new')}
                className="bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Info Banner - only show when pools exist */}
        {filteredPools.length > 0 && (
          <div className="mb-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Beaker className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-1">💡 Brzi pristup analizi</h3>
                <p className="text-sm text-blue-800">
                  Kliknite na bilo koji bazen za trenutnu analizu vode. Podaci se automatski spremaju.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pretraži bazene..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white/80 backdrop-blur-sm shadow-md transition-all"
            />
          </div>
        </div>

        {filteredPools.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Droplets className="w-12 h-12 text-blue-500" />
            </div>
            <p className="text-gray-600 mb-6 text-lg">
              {searchTerm ? 'Nema rezultata pretrage' : 'Nema bazena'}
            </p>
            <button
              onClick={() => navigate('/app/pools/new')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Dodaj prvi bazen
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPools.map((pool) => (
              <button
                key={pool.id}
                onClick={() => navigate(`/app/pools/${pool.id}`)}
                className="w-full bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-md hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-blue-200 transform hover:scale-[1.01] group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg group-hover:text-blue-600 transition-colors">{pool.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <Beaker className="w-3 h-3" />
                          Analiziraj
                        </span>
                      </div>
                      {pool.lastAnalysisStatus && (
                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                          pool.lastAnalysisStatus === 'ok' ? 'bg-green-100 text-green-700' :
                          pool.lastAnalysisStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {pool.lastAnalysisStatus === 'ok' ? 'OK' :
                           pool.lastAnalysisStatus === 'warning' ? 'Pažnja' :
                           'Kritično'}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1.5">
                      {pool.clientId && (
                        <div className="text-gray-500">
                          Klijent: {storage.getClient(pool.clientId)?.name || 'N/A'}
                        </div>
                      )}
                      <div className="text-sm text-gray-600">
                        Volumen: {pool.volume} m³
                      </div>
                      {pool.disinfectionSystem && (
                        <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg inline-flex items-center gap-1 w-fit">
                          {pool.disinfectionSystem === 'elektroliza' && '⚡ Elektroliza'}
                          {pool.disinfectionSystem === 'klor-ph' && '💧 Klor+pH'}
                          {pool.disinfectionSystem === 'peroksid' && '🧪 Peroksid'}
                          {pool.disinfectionSystem === 'tablete' && '💊 Tablete'}
                        </div>
                      )}
                      {pool.location?.address && (
                        <div className="truncate flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {pool.location.address}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Zadnja analiza: {formatDate(pool.lastAnalysisDate)}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                      pool.lastAnalysisStatus === 'ok' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                      pool.lastAnalysisStatus === 'warning' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      pool.lastAnalysisStatus === 'critical' ? 'bg-gradient-to-br from-red-400 to-rose-500' :
                      'bg-gradient-to-br from-gray-300 to-gray-400'
                    }`}>
                      {getStatusIcon(pool.lastAnalysisStatus)}
                    </div>
                    <button
                      onClick={(e) => handleDeletePool(e, pool.id, pool.name)}
                      className="w-12 h-12 rounded-xl bg-red-50 hover:bg-red-500 flex items-center justify-center shadow-md mt-2 group transition-all"
                      title="Obriši bazen"
                    >
                      <Trash2 className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
                    </button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}