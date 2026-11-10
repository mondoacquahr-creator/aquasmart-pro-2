import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Plus, History, FileText, MapPin, AlertCircle, CheckCircle, AlertTriangle, ChevronRight, BarChart3, TrendingUp } from 'lucide-react';
import { storage } from '../lib/storage';
import { Pool, WaterAnalysis } from '../types';
import { ContactAgent } from './ContactAgent';

export function PoolDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [pool, setPool] = useState<Pool | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<WaterAnalysis | null>(null);
  const [allAnalyses, setAllAnalyses] = useState<WaterAnalysis[]>([]);

  useEffect(() => {
    if (id) {
      const poolData = storage.getPool(id);
      setPool(poolData || null);

      const analyses = storage.getAnalyses(id);
      // Sort by date, newest first
      const sorted = analyses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAllAnalyses(sorted);
      
      if (sorted.length > 0) {
        setLastAnalysis(sorted[0]);
      }
    }
  }, [id]);

  if (!pool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Bazen nije pronađen</p>
          <button
            onClick={() => navigate('/app/pools')}
            className="mt-4 text-amber-500 hover:text-amber-400 hover:underline font-medium"
          >
            Povratak na listu
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (!pool.lastAnalysisStatus) {
      return (
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl w-fit">
          <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <span className="font-medium">Nema analiza</span>
        </div>
      );
    }

    switch (pool.lastAnalysisStatus) {
      case 'ok':
        return (
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl w-fit">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="font-medium text-green-700">Voda u redu</span>
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl w-fit">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="font-medium text-yellow-700">Potrebne korekcije</span>
          </div>
        );
      case 'critical':
        return (
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl w-fit">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg flex items-center justify-center shadow-md">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <span className="font-medium text-red-700">Kritično stanje</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-slate-900 to-black">
      <div className="bg-zinc-900/90 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate('/app/pools')} className="mr-4 p-2 hover:bg-amber-500/10 rounded-xl transition-colors text-amber-500">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold truncate text-white">{pool.name}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Pool Photo */}
        {pool.poolPhoto && (
          <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/20">
            <img 
              src={pool.poolPhoto} 
              alt={pool.name} 
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Status Card */}
        <div className={`rounded-3xl p-6 shadow-2xl border-2 ${
          pool.lastAnalysisStatus === 'ok' 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            : pool.lastAnalysisStatus === 'warning'
            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
            : pool.lastAnalysisStatus === 'critical'
            ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
            : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
        }`}>
          <div className="mb-6">
            {getStatusBadge()}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
              <div className="text-gray-600 text-xs mb-1">Tip</div>
              <div className="font-medium">
                {pool.type === 'private' ? '🏠 Privatni' : pool.type === 'hotel' ? '🏨 Hotelski' : pool.type === 'public' ? '🏊 Javni' : '-'}
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
              <div className="text-gray-600 text-xs mb-1">Zapremina</div>
              <div className="font-medium">{pool.volume} m³</div>
            </div>
            {pool.disinfectionSystem && (
              <div className="col-span-2 bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                <div className="text-gray-600 text-xs mb-1">Sustav dezinfekcije</div>
                <div className="font-medium">
                  {pool.disinfectionSystem === 'elektroliza' && '⚡ Elektroliza (solna)'}
                  {pool.disinfectionSystem === 'klor-ph' && '💧 Klor + pH (automatsko doziranje)'}
                  {pool.disinfectionSystem === 'peroksid' && '🧪 Peroksid'}
                  {pool.disinfectionSystem === 'tablete' && '💊 Tablete'}
                </div>
                {pool.disinfectionSystemPhoto && (
                  <div className="mt-3">
                    <img 
                      src={pool.disinfectionSystemPhoto} 
                      alt="Sustav dezinfekcije" 
                      className="w-full h-32 object-cover rounded-lg border-2 border-teal-200"
                    />
                  </div>
                )}
              </div>
            )}
            {pool.location?.address && (
              <div className="col-span-2 bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                <div className="text-gray-600 text-xs mb-1">Lokacija</div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">{pool.location.address}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Last Analysis Summary */}
        {lastAnalysis && (
          <button
            onClick={() => navigate(`/app/pools/${pool.id}/analysis/${lastAnalysis.id}`)}
            className="w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-gray-100 hover:border-blue-300 transition-all hover:shadow-3xl text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Zadnja analiza</h2>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                <div className="text-gray-600 text-xs mb-1">pH</div>
                <div className="text-2xl font-bold text-blue-600">{lastAnalysis.parameters.pH}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                <div className="text-gray-600 text-xs mb-1">Slobodni klor</div>
                <div className="text-2xl font-bold text-blue-600">{lastAnalysis.parameters.freeChlorine} <span className="text-sm">mg/l</span></div>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-xl border border-teal-100">
                <div className="text-gray-600 text-xs mb-1">Alkalnost</div>
                <div className="text-2xl font-bold text-teal-600">{lastAnalysis.parameters.alkalinity} <span className="text-sm">mg/l</span></div>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-xl border border-teal-100">
                <div className="text-gray-600 text-xs mb-1">Tvrdoća</div>
                <div className="text-2xl font-bold text-teal-600">{lastAnalysis.parameters.hardness} <span className="text-sm">mg/l</span></div>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              🕐 {new Date(lastAnalysis.date).toLocaleString('hr-HR')}
            </div>
          </button>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/app/pools/${pool.id}/analysis/new`)}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white p-5 rounded-2xl hover:from-sky-600 hover:to-blue-700 transition-all shadow-xl hover:shadow-blue-500/25 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 font-bold text-lg"
          >
            <Plus className="w-6 h-6" />
            Nova analiza vode
          </button>

          <button
            onClick={() => navigate(`/app/pools/${pool.id}/work-orders/new`)}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-900 p-5 rounded-2xl hover:from-amber-400 hover:to-yellow-500 transition-all shadow-xl hover:shadow-amber-500/25 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 font-bold text-lg"
          >
            <FileText className="w-6 h-6" />
            Novi radni nalog
          </button>

          <button
            onClick={() => navigate(`/app/pools/${pool.id}/history`)}
            className="w-full bg-zinc-800/50 backdrop-blur-md border-2 border-amber-500/30 text-amber-400 p-5 rounded-2xl hover:bg-zinc-800/70 hover:border-amber-500/50 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 font-bold text-lg"
          >
            <History className="w-6 h-6" />
            Povijest analiza
          </button>
        </div>

        {/* Info Card - kako pristupiti analitici */}
        {allAnalyses.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-purple-900">
                <strong>Savjet:</strong> Kliknite na "Povijest analiza" za prikaz svih analiza s trendovima, ili idite na "Analitiku" za business intelligence dashboard s grafovima i statistikama.
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {pool.notes && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">📝 Napomene</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-2xl">{pool.notes}</p>
          </div>
        )}

        {/* Analytics & Recent Analyses */}
        {allAnalyses.length > 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                Analitika i pregled
              </h2>
              <button
                onClick={() => navigate('/app/analytics-dashboard')}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
              >
                <span>Sva analitika</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{allAnalyses.length}</div>
                <div className="text-xs text-gray-600 mt-1">Ukupno analiza</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {allAnalyses.filter(a => a.status === 'ok').length}
                </div>
                <div className="text-xs text-gray-600 mt-1">U redu</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {allAnalyses.filter(a => a.status === 'warning' || a.status === 'critical').length}
                </div>
                <div className="text-xs text-gray-600 mt-1">Upozorenja</div>
              </div>
            </div>

            {/* Recent Analyses Preview (last 3) */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700 mb-3">Nedavne analize:</div>
              {allAnalyses.slice(0, 3).map((analysis) => (
                <button
                  key={analysis.id}
                  onClick={() => navigate(`/app/pools/${pool.id}/analysis/${analysis.id}`)}
                  className="w-full bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-cyan-50 border border-gray-200 hover:border-blue-300 rounded-xl p-4 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                          analysis.status === 'ok' ? 'bg-green-500' :
                          analysis.status === 'warning' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(analysis.date).toLocaleDateString('hr-HR', { 
                            day: 'numeric', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">pH:</span>
                          <span className="ml-1 font-medium">{analysis.parameters.pH}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Cl:</span>
                          <span className="ml-1 font-medium">{analysis.parameters.freeChlorine}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">TA:</span>
                          <span className="ml-1 font-medium">{analysis.parameters.alkalinity}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">CH:</span>
                          <span className="ml-1 font-medium">{analysis.parameters.hardness}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  </div>
                </button>
              ))}

              {allAnalyses.length > 3 && (
                <button
                  onClick={() => navigate(`/app/pools/${pool.id}/history`)}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Prikaži sve analize ({allAnalyses.length}) →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Contact Agent */}
        <ContactAgent poolId={pool.id} analysisId={lastAnalysis?.id} />
      </div>
    </div>
  );
}