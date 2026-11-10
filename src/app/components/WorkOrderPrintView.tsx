import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { storage } from '../lib/storage';
import { workOrderStorage } from '../lib/workOrderStorage';
import { Pool, WaterAnalysis, WorkOrder } from '../types';

const CONDITIONS_MAP: Record<string, string> = {
  'bistra': '💎 Bistra',
  'zamucena': '🌫️ Zamućena',
  'bjeljkasta': '⚪ Bjeljkasta',
  'zelena': '🟢 Zelena',
  'smedja': '🟤 Smeđa',
  'dno-prljavo': '🧹 Dno prljavo',
  'zidovi-prljavi': '🧼 Zidovi prljavi',
  'linija-zuta': '📏 Vidljiva žuta linija',
};

export function WorkOrderPrintView() {
  const { poolId, analysisId } = useParams();
  const [pool, setPool] = useState<Pool | null>(null);
  const [analysis, setAnalysis] = useState<WaterAnalysis | null>(null);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);

  useEffect(() => {
    if (poolId) {
      const poolData = storage.getPool(poolId);
      setPool(poolData || null);
    }

    if (analysisId) {
      const analyses = storage.getAnalyses();
      const foundAnalysis = analyses.find(a => a.id === analysisId);
      setAnalysis(foundAnalysis || null);

      // Find work order for this analysis
      const allWorkOrders = workOrderStorage.getAll();
      const foundWorkOrder = allWorkOrders.find(wo => wo.analysisId === analysisId);
      setWorkOrder(foundWorkOrder || null);
    }

    // Auto print after a short delay
    setTimeout(() => {
      window.print();
    }, 500);
  }, [poolId, analysisId]);

  if (!pool || !analysis) {
    return (
      <div className="p-8 text-center">
        <p>Podaci nisu pronađeni</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white print:p-0">
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      {/* Header */}
      <div className="mb-8 border-b-4 border-teal-500 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">RADNI NALOG</h1>
            <p className="text-lg text-gray-600">Analiza bazenske vode</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Broj naloga:</div>
            <div className="text-xl font-bold text-teal-600">#{workOrder?.id || analysis.id}</div>
            <div className="text-sm text-gray-600 mt-2">
              {new Date(analysis.date).toLocaleDateString('hr-HR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Pool & Client Info */}
        <div className="grid grid-cols-2 gap-6 bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl">
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Bazen</div>
            <div className="text-lg font-bold text-gray-900">{pool.name}</div>
            <div className="text-sm text-gray-700">Volumen: {pool.volume} m³</div>
            {pool.location?.address && (
              <div className="text-sm text-gray-600 mt-1">{pool.location.address}</div>
            )}
          </div>
          {pool.clientName && (
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Klijent</div>
              <div className="text-lg font-bold text-gray-900">{pool.clientName}</div>
            </div>
          )}
        </div>
      </div>

      {/* Water Condition */}
      {analysis.waterCondition && analysis.waterCondition.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">💧</span>
            Vizualno stanje vode
          </h2>
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex flex-wrap gap-2">
              {analysis.waterCondition.map(condition => (
                <span key={condition} className="px-4 py-2 bg-white rounded-lg border border-blue-300 text-sm font-medium text-gray-800 shadow-sm">
                  {CONDITIONS_MAP[condition] || condition}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Parameters */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Parametri vode</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="text-xs font-semibold text-gray-600 uppercase mb-1">pH</div>
            <div className="text-2xl font-bold text-gray-900">{analysis.parameters.pH.toFixed(1)}</div>
            <div className="text-xs text-gray-600 mt-1">Ideal: 7.2-7.6</div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Slobodni klor</div>
            <div className="text-2xl font-bold text-gray-900">{analysis.parameters.freeChlorine.toFixed(1)} mg/l</div>
            <div className="text-xs text-gray-600 mt-1">Ideal: 1.0-3.0 mg/l</div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Alkalnost</div>
            <div className="text-2xl font-bold text-gray-900">{analysis.parameters.alkalinity} mg/l</div>
            <div className="text-xs text-gray-600 mt-1">Ideal: 80-120 mg/l</div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Tvrdoća</div>
            <div className="text-2xl font-bold text-gray-900">{analysis.parameters.hardness} mg/l</div>
            <div className="text-xs text-gray-600 mt-1">Ideal: 200-400 mg/l</div>
          </div>

          {analysis.parameters.temperature && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Temperatura</div>
              <div className="text-2xl font-bold text-gray-900">{analysis.parameters.temperature.toFixed(1)} °C</div>
            </div>
          )}

          {analysis.parameters.orp && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 uppercase mb-1">ORP</div>
              <div className="text-2xl font-bold text-gray-900">{analysis.parameters.orp} mV</div>
              <div className="text-xs text-gray-600 mt-1">Ideal: 650-750 mV</div>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="mb-6">
        <div className={`rounded-xl p-4 border-2 ${
          analysis.status === 'ok' ? 'bg-green-50 border-green-300' :
          analysis.status === 'warning' ? 'bg-yellow-50 border-yellow-300' :
          'bg-red-50 border-red-300'
        }`}>
          <div className="text-sm font-semibold text-gray-700 mb-1">Status:</div>
          <div className={`text-xl font-bold ${
            analysis.status === 'ok' ? 'text-green-700' :
            analysis.status === 'warning' ? 'text-yellow-700' :
            'text-red-700'
          }`}>
            {analysis.status === 'ok' ? '✅ Voda u redu' :
             analysis.status === 'warning' ? '⚠️ Voda zahtijeva intervenciju' :
             '🚨 Voda u kritičnom stanju'}
          </div>
        </div>
      </div>

      {/* Recommendations & Treatment Cost */}
      {workOrder?.analysisResults?.recommendations && workOrder.analysisResults.recommendations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">⚗️</span>
            Preporuke za tretman
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-300">
                  <th className="text-left py-2 font-semibold text-gray-700">Proizvod</th>
                  <th className="text-center py-2 font-semibold text-gray-700">Količina</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Upute</th>
                </tr>
              </thead>
              <tbody>
                {workOrder.analysisResults.recommendations.map((rec, index) => (
                  <tr key={index} className="border-b border-blue-200 last:border-0">
                    <td className="py-2 text-gray-800 font-medium">{rec.productName}</td>
                    <td className="text-center py-2 font-bold text-blue-600">{rec.quantity} {rec.unit}</td>
                    <td className="py-2 text-gray-700 text-sm">{rec.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Billing / Treatment Cost */}
      {workOrder?.billing && workOrder.billing.items && workOrder.billing.items.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">💰</span>
            Trošak tretmana
          </h2>
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-300">
                  <th className="text-left py-2 font-semibold text-gray-700">Stavka</th>
                  <th className="text-center py-2 font-semibold text-gray-700">Količina</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Cijena</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Ukupno</th>
                </tr>
              </thead>
              <tbody>
                {workOrder.billing.items.map((item, index) => (
                  <tr key={index} className="border-b border-amber-200 last:border-0">
                    <td className="py-2 text-gray-800">{item.description}</td>
                    <td className="text-center py-2 text-gray-700">{item.quantity}</td>
                    <td className="text-right py-2 text-gray-700">{item.price.toFixed(2)} €</td>
                    <td className="text-right py-2 font-bold text-gray-900">{(item.quantity * item.price).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-amber-400">
                  <td colSpan={3} className="py-3 text-right font-bold text-gray-900 text-lg">UKUPNO:</td>
                  <td className="text-right py-3 font-bold text-amber-600 text-xl">{workOrder.billing.total.toFixed(2)} €</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Equipment Issues */}
      {analysis.notes?.equipmentIssues && (
        <div className="mb-6 page-break">
          <h2 className="text-xl font-bold text-red-600 mb-3 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Kvarovi opreme
          </h2>
          <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
            <div className="whitespace-pre-wrap text-gray-800">{analysis.notes.equipmentIssues}</div>
          </div>
        </div>
      )}

      {/* Additional Work */}
      {analysis.notes?.additionalWork && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Dodatni radovi
          </h2>
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
            <div className="whitespace-pre-wrap text-gray-800">{analysis.notes.additionalWork}</div>
          </div>
        </div>
      )}

      {/* Products Left */}
      {analysis.notes?.productsLeft && analysis.notes.productsLeft.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-teal-600 mb-3 flex items-center gap-2">
            <span className="text-2xl">📦</span>
            Ostavljeni proizvodi
          </h2>
          <div className="bg-teal-50 rounded-xl p-4 border-2 border-teal-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-teal-300">
                  <th className="text-left py-2 font-semibold text-gray-700">Proizvod</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Količina</th>
                </tr>
              </thead>
              <tbody>
                {analysis.notes.productsLeft.map((product, index) => (
                  <tr key={index} className="border-b border-teal-200 last:border-0">
                    <td className="py-2 text-gray-800">{product.name}</td>
                    <td className="text-right py-2 font-medium text-gray-800">{product.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Replaced Parts / Zamjena dijelova */}
      {(() => {
        try {
          if (workOrder?.notes) {
            const parsedNotes = JSON.parse(workOrder.notes);
            if (parsedNotes.replacements && parsedNotes.replacements.length > 0) {
              return (
                <div className="mb-6 page-break">
                  <h2 className="text-xl font-bold text-orange-600 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🔧</span>
                    Zamjena dijelova
                  </h2>
                  <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-orange-300">
                          <th className="text-left py-2 font-semibold text-gray-700">Dio</th>
                          <th className="text-center py-2 font-semibold text-gray-700">Količina</th>
                          <th className="text-left py-2 font-semibold text-gray-700">Napomena</th>
                          <th className="text-center py-2 font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedNotes.replacements.map((item: any, index: number) => (
                          <tr key={index} className="border-b border-orange-200 last:border-0">
                            <td className="py-2 text-gray-800 font-medium">{item.part}</td>
                            <td className="text-center py-2 text-gray-700">{item.quantity}</td>
                            <td className="py-2 text-gray-600 text-sm">{item.notes || '-'}</td>
                            <td className="text-center py-2">
                              {item.completed ? (
                                <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-sm">
                                  ✓ Izvršeno
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                                  ○ Nije izvršeno
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }
          }
        } catch (e) {
          // Silent fail if notes can't be parsed
        }
        return null;
      })()}

      {/* Photos */}
      {analysis.notes?.equipmentPhotos && analysis.notes.equipmentPhotos.length > 0 && (
        <div className="mb-6 page-break">
          <h2 className="text-xl font-bold text-purple-600 mb-3 flex items-center gap-2">
            <span className="text-2xl">📸</span>
            Fotografije
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {analysis.notes.equipmentPhotos.map((photo, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                <img src={photo.dataUrl} alt={photo.category} className="w-full h-64 object-cover" />
                <div className="bg-gray-50 p-2 text-sm font-medium text-gray-700 text-center">
                  {photo.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t-2 border-gray-300">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-sm font-semibold text-gray-600 mb-4">Serviser:</div>
            <div className="border-b-2 border-gray-400 pb-1 mb-2"></div>
            <div className="text-xs text-gray-500">Potpis i pečat</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-600 mb-4">Klijent:</div>
            <div className="border-b-2 border-gray-400 pb-1 mb-2"></div>
            <div className="text-xs text-gray-500">Potpis</div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <div className="font-bold text-teal-600 text-lg mb-1">AquaSmart Pro</div>
          <div>Mondo Acqua d.o.o. | Profesionalna analiza bazenske vode</div>
        </div>
      </div>

      {/* Print Button (hide on print) */}
      <div className="no-print mt-8 text-center">
        <button
          onClick={() => window.print()}
          className="px-8 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all font-semibold shadow-lg"
        >
          🖨️ Ispiši radni nalog
        </button>
        <button
          onClick={() => window.close()}
          className="ml-4 px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all font-semibold shadow-lg"
        >
          Zatvori
        </button>
      </div>
    </div>
  );
}