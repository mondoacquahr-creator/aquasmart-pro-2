import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Minus, ChevronRight, CheckCircle, AlertTriangle, AlertCircle, FileDown } from 'lucide-react';
import { storage } from '../lib/storage';
import { Pool, WaterAnalysis } from '../types';
import { generateAnalysisPDF } from '../lib/pdfExport';

export function PoolAnalysisHistory() {
  const navigate = useNavigate();
  const { poolId } = useParams<{ poolId: string }>();
  const [pool, setPool] = useState<Pool | null>(null);
  const [analyses, setAnalyses] = useState<WaterAnalysis[]>([]);

  useEffect(() => {
    if (!poolId) {
      navigate('/app/pools');
      return;
    }

    const poolData = storage.getPool(poolId);
    if (!poolData) {
      alert('Bazen nije pronađen');
      navigate('/app/pools');
      return;
    }
    setPool(poolData);

    const analysesData = storage.getAnalyses(poolId);
    // Sort by date, newest first
    const sorted = analysesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setAnalyses(sorted);
  }, [poolId, navigate]);

  const getStatusIcon = (status?: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-white" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-white" />;
      default:
        return <AlertCircle className="w-5 h-5 text-white" />;
    }
  };

  const getStatusColor = (status?: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'ok':
        return 'bg-gradient-to-br from-green-400 to-emerald-500';
      case 'warning':
        return 'bg-gradient-to-br from-yellow-400 to-orange-500';
      case 'critical':
        return 'bg-gradient-to-br from-red-400 to-rose-500';
      default:
        return 'bg-gradient-to-br from-gray-300 to-gray-400';
    }
  };

  const getStatusText = (status?: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'ok':
        return 'Voda u redu';
      case 'warning':
        return 'Potrebne korekcije';
      case 'critical':
        return 'Kritično stanje';
      default:
        return 'Nepoznato';
    }
  };

  const getParameterTrend = (currentValue: number, previousValue: number | undefined) => {
    if (previousValue === undefined) return null;
    
    const diff = currentValue - previousValue;
    const percentChange = ((diff / previousValue) * 100).toFixed(1);
    
    if (Math.abs(diff) < 0.1) {
      return (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Minus className="w-3 h-3" />
          <span>Stabilno</span>
        </div>
      );
    }
    
    if (diff > 0) {
      return (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <TrendingUp className="w-3 h-3" />
          <span>+{percentChange}%</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1 text-xs text-red-600">
        <TrendingDown className="w-3 h-3" />
        <span>{percentChange}%</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Danas, ${date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Jučer, ${date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `Prije ${diffDays} dana`;
    } else {
      return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  if (!pool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <p className="text-gray-600">Učitavanje...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 pb-8">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate(`/app/pools/${poolId}`)} className="mr-4 p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Povijest analiza</h1>
            <p className="text-sm text-gray-600">{pool.name}</p>
          </div>
          {analyses.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Export all analyses as separate PDFs
                analyses.forEach((analysis) => {
                  setTimeout(() => {
                    generateAnalysisPDF({ pool, analysis });
                  }, 500); // Small delay between exports
                });
              }}
              className="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden md:inline">Izvezi sve (PDF)</span>
              <span className="md:hidden">PDF</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Summary Card */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-6 shadow-2xl text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-bold">{analyses.length}</div>
              <div className="text-sm opacity-90">Ukupno analiza</div>
            </div>
          </div>
          
          {analyses.length > 0 && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div className="text-2xl font-bold">
                  {analyses.filter(a => a.status === 'ok').length}
                </div>
                <div className="text-xs opacity-75">U redu</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div className="text-2xl font-bold">
                  {analyses.filter(a => a.status === 'warning').length}
                </div>
                <div className="text-xs opacity-75">Upozorenja</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div className="text-2xl font-bold">
                  {analyses.filter(a => a.status === 'critical').length}
                </div>
                <div className="text-xs opacity-75">Kritično</div>
              </div>
            </div>
          )}
        </div>

        {/* Analysis List */}
        {analyses.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nema analiza</h3>
            <p className="text-gray-600 mb-6">
              Još nema spremljenih analiza za ovaj bazen.
            </p>
            <button
              onClick={() => navigate(`/app/pools/${poolId}/analysis/new`)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg font-medium"
            >
              Napravi prvu analizu
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis, index) => {
              const previousAnalysis = analyses[index + 1];
              
              return (
                <button
                  key={analysis.id}
                  onClick={() => navigate(`/app/pools/${poolId}/analysis/${analysis.id}`)}
                  className="w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-blue-300 transition-all p-5 text-left group"
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`w-14 h-14 ${getStatusColor(analysis.status)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                      {getStatusIcon(analysis.status)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="font-bold text-gray-900 text-lg mb-1">
                            {getStatusText(analysis.status)}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(analysis.date)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              generateAnalysisPDF({ pool, analysis });
                            }}
                            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-blue-600"
                            title="Preuzmi PDF"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                        </div>
                      </div>

                      {/* Parameters Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2 border border-blue-100">
                          <div className="text-xs text-gray-600 mb-1">pH</div>
                          <div className="font-bold text-blue-700">{analysis.parameters.pH}</div>
                          {getParameterTrend(analysis.parameters.pH, previousAnalysis?.parameters.pH)}
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2 border border-blue-100">
                          <div className="text-xs text-gray-600 mb-1">Klor</div>
                          <div className="font-bold text-blue-700">{analysis.parameters.freeChlorine}</div>
                          {getParameterTrend(analysis.parameters.freeChlorine, previousAnalysis?.parameters.freeChlorine)}
                        </div>

                        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-2 border border-teal-100">
                          <div className="text-xs text-gray-600 mb-1">Alkalnost</div>
                          <div className="font-bold text-teal-700">{analysis.parameters.alkalinity}</div>
                          {getParameterTrend(analysis.parameters.alkalinity, previousAnalysis?.parameters.alkalinity)}
                        </div>

                        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-2 border border-teal-100">
                          <div className="text-xs text-gray-600 mb-1">Tvrdoća</div>
                          <div className="font-bold text-teal-700">{analysis.parameters.hardness}</div>
                          {getParameterTrend(analysis.parameters.hardness, previousAnalysis?.parameters.hardness)}
                        </div>
                      </div>

                      {/* Notes indicator */}
                      {analysis.notes && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg w-fit">
                          <span className="font-medium">📝 Sadrži napomene</span>
                          {analysis.notes.equipmentPhotos && analysis.notes.equipmentPhotos.length > 0 && (
                            <span className="text-purple-500">• {analysis.notes.equipmentPhotos.length} fotografija</span>
                          )}
                        </div>
                      )}

                      {/* Recommendations count */}
                      {analysis.recommendations && analysis.recommendations.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          💧 {analysis.recommendations.length} preporučenih proizvoda
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        {analyses.length > 0 && (
          <div className="bg-blue-50/80 backdrop-blur-sm border-2 border-blue-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <strong>Savjet:</strong> Kliknite na analizu za prikaz svih detalja, preporuka i fotografija.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}