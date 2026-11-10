import { useState } from 'react';
import { useNavigate } from 'react-router';
import { X, AlertTriangle, AlertCircle, MapPin, Calendar, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Pool, WaterAnalysis } from '../types';

interface AlertPoolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pools: Pool[];
  analyses: WaterAnalysis[];
  type: 'warning' | 'critical';
}

export function AlertPoolsModal({ isOpen, onClose, pools, analyses, type }: AlertPoolsModalProps) {
  const navigate = useNavigate();

  // Filter pools by status
  const alertPools = pools.filter(pool => {
    const poolAnalyses = analyses.filter(a => a.poolId === pool.id);
    if (poolAnalyses.length === 0) return false;
    const latest = poolAnalyses.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    return latest.status === type;
  });

  // Get latest analysis for each pool
  const poolsWithAnalysis = alertPools.map(pool => {
    const poolAnalyses = analyses.filter(a => a.poolId === pool.id);
    const latest = poolAnalyses.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    return { pool, analysis: latest };
  });

  const title = type === 'warning' ? 'Bazeni sa upozorenjima' : 'Kritični bazeni';
  const bgColor = type === 'warning' ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-rose-600';
  const icon = type === 'warning' ? AlertTriangle : AlertCircle;
  const Icon = icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl z-50 max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${bgColor} text-white p-6 rounded-t-3xl`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <p className="text-sm opacity-90">
                      {alertPools.length} {alertPools.length === 1 ? 'bazen' : 'bazena'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {poolsWithAnalysis.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">Nema {type === 'warning' ? 'upozorenja' : 'kritičnih bazena'}</p>
                </div>
              ) : (
                poolsWithAnalysis.map(({ pool, analysis }) => {
                  // Get critical parameters
                  const criticalParams = [];
                  if (analysis.parameters.pH < 6.8 || analysis.parameters.pH > 7.8) criticalParams.push('pH');
                  if (analysis.parameters.freeChlorine < 0.5 || analysis.parameters.freeChlorine > 5) criticalParams.push('Klor');
                  if (analysis.parameters.alkalinity && (analysis.parameters.alkalinity < 80 || analysis.parameters.alkalinity > 200)) criticalParams.push('Alkalitet');
                  
                  return (
                    <motion.div
                      key={pool.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-gradient-to-br ${
                        type === 'warning' 
                          ? 'from-yellow-50 to-orange-50 border-yellow-300' 
                          : 'from-red-50 to-rose-50 border-red-300'
                      } border-2 rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer`}
                      onClick={() => {
                        navigate(`/app/pools/${pool.id}`);
                        onClose();
                      }}
                    >
                      {/* Pool Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{pool.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {pool.clientName && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {pool.clientName}
                              </div>
                            )}
                            {pool.location?.address && (
                              <div className="text-xs text-gray-500">
                                {pool.location.address}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-white text-xs font-bold ${
                          type === 'warning' ? 'bg-orange-500' : 'bg-red-600'
                        }`}>
                          {type === 'warning' ? '⚠️ UPOZORENJE' : '🚨 KRITIČNO'}
                        </div>
                      </div>

                      {/* Analysis Info */}
                      <div className="bg-white/70 rounded-xl p-3 mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                          <Calendar className="w-3 h-3" />
                          Zadnja analiza: {new Date(analysis.date).toLocaleDateString('hr-HR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        
                        {/* Critical Parameters */}
                        {criticalParams.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <TrendingDown className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-semibold text-gray-700">Problematični parametri:</span>
                            <div className="flex gap-1.5 flex-wrap">
                              {criticalParams.map(param => (
                                <span
                                  key={param}
                                  className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium"
                                >
                                  {param}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white/50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-600 mb-0.5">pH</div>
                          <div className="font-bold text-gray-900">{analysis.parameters.pH.toFixed(1)}</div>
                        </div>
                        <div className="bg-white/50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-600 mb-0.5">Klor</div>
                          <div className="font-bold text-gray-900">{analysis.parameters.freeChlorine.toFixed(1)}</div>
                        </div>
                        {analysis.parameters.orp && (
                          <div className="bg-white/50 rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-600 mb-0.5">ORP</div>
                            <div className="font-bold text-gray-900">{analysis.parameters.orp}</div>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/pools/${pool.id}/analysis/new`);
                            onClose();
                          }}
                          className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${
                            type === 'warning'
                              ? 'bg-orange-500 hover:bg-orange-600 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          🔬 Nova analiza i intervencija
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
              <button
                onClick={onClose}
                className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all"
              >
                Zatvori
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}