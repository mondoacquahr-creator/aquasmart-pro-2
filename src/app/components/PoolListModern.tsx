import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search, AlertCircle, CheckCircle, AlertTriangle, Droplets, MapPin, Plus } from 'lucide-react';
import { storage } from '../lib/storage';
import { Pool } from '../types';
import { motion } from 'motion/react';

export function PoolListModern() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Moji bazeni</h1>
              <p className="text-xs text-gray-500">{pools.length} ukupno</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/app/pools/new')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Novi bazen
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pretraži bazene..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 shadow-md transition-all"
            />
          </div>
        </motion.div>

        {/* Empty State */}
        {filteredPools.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-gray-100"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Droplets className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm ? 'Nema rezultata' : 'Nema bazena'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Pokušajte s drugim pojmom' : 'Dodajte svoj prvi bazen'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/app/pools/new')}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                Dodaj prvi bazen
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredPools.map((pool, index) => (
              <motion.button
                key={pool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                onClick={() => navigate(`/app/pools/${pool.id}`)}
                className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-blue-200 group overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                        {pool.name}
                      </h3>
                      {pool.clientId && (
                        <p className="text-sm text-gray-500">
                          {storage.getClient(pool.clientId)?.name || 'Klijent'}
                        </p>
                      )}
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      pool.lastAnalysisStatus === 'ok' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                      pool.lastAnalysisStatus === 'warning' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      pool.lastAnalysisStatus === 'critical' ? 'bg-gradient-to-br from-red-400 to-rose-500' :
                      'bg-gradient-to-br from-gray-300 to-gray-400'
                    }`}>
                      {getStatusIcon(pool.lastAnalysisStatus)}
                    </div>
                  </div>

                  {/* Pool Info */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Droplets className="w-4 h-4 text-gray-400" />
                      <span>{pool.volume} m³</span>
                    </div>
                    {pool.location?.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{pool.location.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Tag */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Zadnja analiza: {formatDate(pool.lastAnalysisDate)}
                    </span>
                    {pool.lastAnalysisStatus && (
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                        pool.lastAnalysisStatus === 'ok' ? 'bg-green-100 text-green-700' :
                        pool.lastAnalysisStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {pool.lastAnalysisStatus === 'ok' ? 'U redu' :
                         pool.lastAnalysisStatus === 'warning' ? 'Pažnja' :
                         'Kritično'}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}