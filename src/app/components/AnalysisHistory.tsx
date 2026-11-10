import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { History, Droplets, Calendar, Filter, Search, ChevronRight } from 'lucide-react';
import { storage } from '../lib/storage';
import { WaterAnalysis, Pool } from '../types';

export function AnalysisHistory() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<WaterAnalysis[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [filterPool, setFilterPool] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const allAnalyses = storage.getAnalyses();
    const allPools = storage.getPools();
    setAnalyses(allAnalyses);
    setPools(allPools);
  }, []);

  const getPoolName = (poolId: string) => {
    const pool = pools.find(p => p.id === poolId);
    return pool ? pool.name : 'Nepoznat bazen';
  };

  const filteredAnalyses = analyses
    .filter(a => filterPool === 'all' || a.poolId === filterPool)
    .filter(a => {
      if (!searchTerm) return true;
      const poolName = getPoolName(a.poolId).toLowerCase();
      return poolName.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groupedByDate = filteredAnalyses.reduce((groups, analysis) => {
    const date = new Date(analysis.date).toLocaleDateString('hr-HR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(analysis);
    return groups;
  }, {} as Record<string, WaterAnalysis[]>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'from-green-500 to-emerald-500';
      case 'warning':
        return 'from-yellow-500 to-orange-500';
      case 'critical':
        return 'from-red-500 to-rose-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ok':
        return 'U redu';
      case 'warning':
        return 'Pažnja';
      case 'critical':
        return 'Kritično';
      default:
        return 'N/A';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Clean Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center">
              <History className="w-8 h-8 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Povijest Analiza</h1>
              <p className="text-gray-600 text-sm">Sve prošle analize vode</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pretraži bazene..."
              className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Filter Tabs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-md border border-gray-100 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setFilterPool('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                filterPool === 'all'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Svi bazeni ({analyses.length})
            </button>
            {pools.map(pool => (
              <button
                key={pool.id}
                onClick={() => setFilterPool(pool.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  filterPool === pool.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {pool.name} ({analyses.filter(a => a.poolId === pool.id).length})
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {filteredAnalyses.filter(a => a.status === 'ok').length}
            </div>
            <div className="text-sm text-green-700">U redu</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {filteredAnalyses.filter(a => a.status === 'warning').length}
            </div>
            <div className="text-sm text-yellow-700">Pažnja</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border-2 border-red-200">
            <div className="text-3xl font-bold text-red-600 mb-1">
              {filteredAnalyses.filter(a => a.status === 'critical').length}
            </div>
            <div className="text-sm text-red-700">Kritično</div>
          </div>
        </div>

        {/* Analysis List */}
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-100">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nema analiza</h3>
            <p className="text-gray-500 mb-6">
              {filterPool === 'all' 
                ? 'Još niste napravili niti jednu analizu.'
                : 'Nema analiza za odabrani bazen.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-medium"
            >
              Napravi prvu analizu
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, dateAnalyses]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-600">{date}</h3>
                </div>
                <div className="space-y-3">
                  {dateAnalyses.map(analysis => (
                    <button
                      key={analysis.id}
                      onClick={() => navigate(`/pools/${analysis.poolId}`)}
                      className="w-full bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-purple-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${getStatusColor(analysis.status)} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                          <Droplets className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                            {getPoolName(analysis.poolId)}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span>
                              {new Date(analysis.date).toLocaleTimeString('hr-HR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span className={`font-medium ${
                              analysis.status === 'ok' ? 'text-green-600' :
                              analysis.status === 'warning' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {getStatusLabel(analysis.status)}
                            </span>
                            {analysis.parameters.pH && (
                              <>
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                <span>pH {analysis.parameters.pH}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}