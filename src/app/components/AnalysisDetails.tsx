import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { ArrowLeft, Calendar, Droplet, TestTube, FileText, Package, Camera, AlertTriangle, Wrench, CheckCircle, X, FileDown, Printer, Edit } from 'lucide-react';
import { storage } from '../lib/storage';
import { Pool, WaterAnalysis, Client } from '../types';
import { generateAnalysisPDF } from '../lib/pdfExport';

interface Photo {
  id: string;
  category: string;
  dataUrl: string;
  timestamp: string;
}

export function AnalysisDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { poolId, analysisId } = useParams<{ poolId: string; analysisId: string }>();
  const [pool, setPool] = useState<Pool | null>(null);
  const [analysis, setAnalysis] = useState<WaterAnalysis | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (!poolId || !analysisId) {
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

    const analyses = storage.getAnalyses(poolId);
    const analysisData = analyses.find(a => a.id === analysisId);
    
    if (!analysisData) {
      alert('Analiza nije pronađena');
      navigate(`/app/pools/${poolId}/history`);
      return;
    }
    setAnalysis(analysisData);

    // Try to get client info if available
    if (poolData.clientId) {
      const clientData = storage.getClient(poolData.clientId);
      setClient(clientData || null);
    }
  }, [poolId, analysisId, navigate]);

  const getStatusColor = (status?: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'ok':
        return {
          gradient: 'from-green-50 to-emerald-50',
          border: 'border-green-200',
          text: 'text-green-700',
          badge: 'bg-gradient-to-br from-green-400 to-emerald-500',
          label: 'Voda u redu',
          icon: <CheckCircle className="w-6 h-6 text-white" />
        };
      case 'warning':
        return {
          gradient: 'from-yellow-50 to-orange-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          badge: 'bg-gradient-to-br from-yellow-400 to-orange-500',
          label: 'Potrebne korekcije',
          icon: <AlertTriangle className="w-6 h-6 text-white" />
        };
      case 'critical':
        return {
          gradient: 'from-red-50 to-rose-50',
          border: 'border-red-200',
          text: 'text-red-700',
          badge: 'bg-gradient-to-br from-red-400 to-rose-500',
          label: 'Kritično stanje',
          icon: <AlertTriangle className="w-6 h-6 text-white" />
        };
      default:
        return {
          gradient: 'from-gray-50 to-slate-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          badge: 'bg-gradient-to-br from-gray-300 to-gray-400',
          label: 'Nepoznato',
          icon: <TestTube className="w-6 h-6 text-white" />
        };
    }
  };

  const getParameterStatus = (param: string, value: number) => {
    const ranges: { [key: string]: { min: number; max: number } } = {
      pH: { min: 7.2, max: 7.6 },
      freeChlorine: { min: 0.5, max: 1.5 },
      alkalinity: { min: 80, max: 120 },
      hardness: { min: 200, max: 400 },
    };

    const range = ranges[param];
    if (!range) return 'normal';

    if (value < range.min || value > range.max) {
      return 'warning';
    }
    return 'normal';
  };

  const PHOTO_CATEGORIES: { [key: string]: { label: string; icon: string; color: string } } = {
    pumpa: { label: 'Pumpa', icon: '⚙️', color: 'bg-blue-100 text-blue-700' },
    filter: { label: 'Filter', icon: '🔹', color: 'bg-green-100 text-green-700' },
    dozatori: { label: 'Dozator 1', icon: '💉', color: 'bg-yellow-100 text-yellow-700' },
    dozator1: { label: 'Dozator 2', icon: '💊', color: 'bg-orange-100 text-orange-700' },
    trafo: { label: 'Trafo', icon: '⚡', color: 'bg-red-100 text-red-700' },
    ostalo: { label: 'Ostalo', icon: '📷', color: 'bg-gray-100 text-gray-700' },
    issues: { label: 'Kvarovi', icon: '⚠️', color: 'bg-red-100 text-red-700' },
    work: { label: 'Radovi', icon: '🔧', color: 'bg-blue-100 text-blue-700' },
    products: { label: 'Proizvodi', icon: '📦', color: 'bg-green-100 text-green-700' },
  };

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

  if (!pool || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <p className="text-gray-600">Učitavanje...</p>
      </div>
    );
  }

  const statusInfo = getStatusColor(analysis.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate(`/app/pools/${poolId}/history`)} className="mr-4 p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">Detalji analize</h1>
          </div>
          <button
            onClick={() => generateAnalysisPDF({ pool, analysis, client: client || undefined })}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            title="Preuzmi PDF"
          >
            <FileDown className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={() => window.open(`/print/pools/${poolId}/analysis/${analysisId}`, '_blank')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            title="Štampaj"
          >
            <Printer className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={() => navigate(`/app/pools/${poolId}/analysis/${analysisId}/edit`)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            title="Uredi analizu"
          >
            <Edit className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Success Message (if just saved) */}
        {location.state?.justSaved && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-2xl animate-[slideDown_0.3s_ease-out]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Analiza uspješno spremljena! ✅</h3>
                <p className="text-green-100 text-sm">Svi podaci su spremljeni i dostupni za pregled i ispis.</p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => generateAnalysisPDF({ pool, analysis, client: client || undefined })}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
              >
                <FileDown className="w-5 h-5" />
                <span>Preuzmi radni nalog (PDF)</span>
              </button>
              <button
                onClick={() => window.open(`/print/pools/${poolId}/analysis/${analysisId}`, '_blank')}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Printer className="w-5 h-5" />
                <span>Štampaj radni nalog</span>
              </button>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className={`bg-gradient-to-br ${statusInfo.gradient} border-2 ${statusInfo.border} rounded-3xl p-6 shadow-2xl`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 ${statusInfo.badge} rounded-2xl flex items-center justify-center shadow-lg`}>
              {statusInfo.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{statusInfo.label}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Calendar className="w-4 h-4" />
                {new Date(analysis.date).toLocaleString('hr-HR')}
              </div>
            </div>
          </div>

          {/* Pool & Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
              <div className="text-xs text-gray-600 mb-1">Bazen</div>
              <div className="font-bold text-gray-900">{pool.name}</div>
              <div className="text-sm text-gray-600">Volumen: {pool.volume} m³</div>
            </div>
            {client && (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
                <div className="text-xs text-gray-600 mb-1">Klijent</div>
                <div className="font-bold text-gray-900">{client.name}</div>
                {client.phone && (
                  <div className="text-sm text-gray-600">📞 {client.phone}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Visual Water Condition */}
        {analysis.waterCondition && analysis.waterCondition.length > 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center">
                <Droplet className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Vizualno stanje vode</h2>
                <p className="text-sm text-gray-600">Primjetne karakteristike pri vizualnom pregledu</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {analysis.waterCondition.map(condition => (
                <div key={condition} className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl px-4 py-3 font-medium text-gray-800 shadow-sm">
                  {CONDITIONS_MAP[condition] || condition}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Water Parameters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
              <TestTube className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Parametri vode</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl border-2 ${
              getParameterStatus('pH', analysis.parameters.pH) === 'warning' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100'
            }`}>
              <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">pH vrijednost</div>
              <div className="text-3xl font-black text-blue-700 mb-1">{analysis.parameters.pH}</div>
              <div className="text-xs font-bold text-gray-400 bg-white/50 px-2 py-0.5 rounded-full inline-block">Cilj: 7.2 - 7.6</div>
            </div>

            <div className={`p-4 rounded-xl border-2 ${
              getParameterStatus('freeChlorine', analysis.parameters.freeChlorine) === 'warning' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100'
            }`}>
              <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Slobodni klor</div>
              <div className="text-3xl font-black text-blue-700 mb-1">{analysis.parameters.freeChlorine}</div>
              <div className="text-xs font-bold text-gray-400 bg-white/50 px-2 py-0.5 rounded-full inline-block">Cilj: 0.5 - 1.5</div>
            </div>

            <div className={`p-4 rounded-xl border-2 ${
              getParameterStatus('alkalinity', analysis.parameters.alkalinity) === 'warning' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100'
            }`}>
              <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Alkalnost</div>
              <div className="text-3xl font-black text-teal-700 mb-1">{analysis.parameters.alkalinity}</div>
              <div className="text-xs font-bold text-gray-400 bg-white/50 px-2 py-0.5 rounded-full inline-block">Cilj: 80 - 120</div>
            </div>

            <div className={`p-4 rounded-xl border-2 ${
              getParameterStatus('hardness', analysis.parameters.hardness) === 'warning' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100'
            }`}>
              <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Tvrdoća</div>
              <div className="text-3xl font-black text-teal-700 mb-1">{analysis.parameters.hardness}</div>
              <div className="text-xs font-bold text-gray-400 bg-white/50 px-2 py-0.5 rounded-full inline-block">Cilj: 200 - 400</div>
            </div>

            {analysis.parameters.temperature && (
              <div className="p-4 rounded-xl border-2 bg-gradient-to-br from-orange-50 to-red-50 border-orange-100">
                <div className="text-xs text-gray-600 mb-1">Temperatura</div>
                <div className="text-3xl font-bold text-orange-700 mb-1">{analysis.parameters.temperature}°C</div>
                <div className="text-xs text-gray-600">Mjerena</div>
              </div>
            )}

            {analysis.parameters.orp && (
              <div className="p-4 rounded-xl border-2 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
                <div className="text-xs text-gray-600 mb-1">ORP</div>
                <div className="text-3xl font-bold text-purple-700 mb-1">{analysis.parameters.orp}</div>
                <div className="text-xs text-gray-600">mV</div>
              </div>
            )}
          </div>
        </div>

        {/* Equipment Issues - ALWAYS SHOW */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Eventualni kvarovi</h2>
          </div>
          {analysis.notes?.equipmentIssues ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-gray-800 whitespace-pre-wrap">{analysis.notes.equipmentIssues}</p>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
              <p className="text-gray-500 italic">Nema prijavljenih kvarova</p>
            </div>
          )}
          
          {/* Issue Photos */}
          {analysis.notes?.equipmentPhotos && analysis.notes.equipmentPhotos.filter(p => p.category === 'issues').length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">📷 Fotografije kvarova:</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {analysis.notes.equipmentPhotos
                  .filter(p => p.category === 'issues')
                  .map((photo) => (
                    <div 
                      key={photo.id} 
                      className="relative group cursor-pointer"
                      onClick={() => setViewingPhoto(photo)}
                    >
                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-red-300 hover:border-red-500 transition-all">
                        <img 
                          src={photo.dataUrl} 
                          alt="Kvar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Work - ALWAYS SHOW */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Ostali izvršeni radovi</h2>
          </div>
          {analysis.notes?.additionalWork ? (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-gray-800 whitespace-pre-wrap">{analysis.notes.additionalWork}</p>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
              <p className="text-gray-500 italic">Nema dodatnih radova</p>
            </div>
          )}
          
          {/* Work Photos */}
          {analysis.notes?.equipmentPhotos && analysis.notes.equipmentPhotos.filter(p => p.category === 'work').length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">📷 Fotografije radova:</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {analysis.notes.equipmentPhotos
                  .filter(p => p.category === 'work')
                  .map((photo) => (
                    <div 
                      key={photo.id} 
                      className="relative group cursor-pointer"
                      onClick={() => setViewingPhoto(photo)}
                    >
                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-blue-300 hover:border-blue-500 transition-all">
                        <img 
                          src={photo.dataUrl} 
                          alt="Radovi" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Left - ALWAYS SHOW */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Ostavljeni proizvodi na objektu</h2>
          </div>
          {analysis.notes?.productsLeft && analysis.notes.productsLeft.length > 0 ? (
            <div className="space-y-2">
              {analysis.notes.productsLeft.map((product) => (
                <div
                  key={product.id}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4"
                >
                  <div className="font-bold text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-600">Količina: {product.quantity}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
              <p className="text-gray-500 italic">Nema ostavljenih proizvoda</p>
            </div>
          )}
        </div>

        {/* Equipment Photos - ALWAYS SHOW */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Fotografije</h2>
              <p className="text-sm text-gray-600">
                {analysis.notes?.equipmentPhotos && analysis.notes.equipmentPhotos.length > 0 
                  ? `Ukupno ${analysis.notes.equipmentPhotos.length} slika` 
                  : 'Nema fotografija'}
              </p>
            </div>
          </div>

          {analysis.notes?.equipmentPhotos && analysis.notes.equipmentPhotos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {analysis.notes.equipmentPhotos.map((photo) => {
                const cat = PHOTO_CATEGORIES[photo.category] || { label: 'Ostalo', icon: '📷', color: 'bg-gray-100 text-gray-700' };
                return (
                  <div 
                    key={photo.id} 
                    className="relative group cursor-pointer"
                    onClick={() => setViewingPhoto(photo)}
                  >
                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-all">
                      <img 
                        src={photo.dataUrl} 
                        alt={cat.label} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className={`absolute top-2 left-2 ${cat.color} px-2 py-1 rounded-lg text-xs font-bold shadow-md`}>
                      {cat.icon} {cat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
              <p className="text-gray-500 italic">Nema fotografija</p>
            </div>
          )}
        </div>
      </div>

      {/* Photo Viewer Modal */}
      {viewingPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingPhoto(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setViewingPhoto(null)}
              className="absolute -top-12 right-0 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={viewingPhoto.dataUrl} 
              alt="Full size" 
              className="w-full h-auto rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 text-center text-white">
              <div className="font-bold text-lg">
                {PHOTO_CATEGORIES[viewingPhoto.category]?.label || 'Fotografija'}
              </div>
              <div className="text-sm opacity-75">
                {new Date(viewingPhoto.timestamp).toLocaleString('hr-HR')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}