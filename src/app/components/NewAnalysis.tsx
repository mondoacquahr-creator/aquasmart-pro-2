import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { 
  ArrowLeft, 
  Camera, 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle, 
  Save, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MapPin, 
  Package, 
  Beaker,
  Droplets,
  Waves,
  TestTube,
  Info,
  Lightbulb,
  Thermometer,
  FileDown,
  FileText,
  Settings,
  Wrench
} from 'lucide-react';
import { storage } from '../lib/storage';
import { analyzeWater } from '../lib/waterAnalysis';
import { IDEAL_RANGES, getParameterStatus } from '../lib/parameterStatus';
import { findNearbyStores } from '../lib/storeLocator';
import { WaterAnalysis, Pool, Store, AnalysisResult } from '../types';
import { workOrderStorage } from '../lib/workOrderStorage';
import { WorkOrder } from '../types';
import { WaterConditionPicker } from './WaterConditionPicker';
import { AnalysisNotesForm } from './AnalysisNotesForm';
import { PhotoUpload } from './PhotoUpload';
import { NearbyStores } from './NearbyStores';
import { ContactAgent } from './ContactAgent';
import { generateAnalysisPDF } from '../lib/pdfExport';
import { analyticsStorage } from '../lib/analytics';
import { AnalyticsEntry } from '../types';

export function NewAnalysis() {
  const navigate = useNavigate();
  const { poolId } = useParams<{ poolId: string }>();
  const [pool, setPool] = useState<Pool | null>(null);
  const [disinfectionSystem, setDisinfectionSystem] = useState<Pool['disinfectionSystem']>('');
  
  // Automatika state
  const [hasAutomation, setHasAutomation] = useState(false);
  const [automationParams, setAutomationParams] = useState({
    pH: '',
    freeChlorine: '',
    orp: '',
  });
  const [calibrationWarnings, setCalibrationWarnings] = useState<Array<{type: string; diff: number; auto: number; manual: number}>>([]);
  
  const [parameters, setParameters] = useState({
    pH: '',
    freeChlorine: '',
    alkalinity: '',
    hardness: '',
    temperature: '',
    orp: '',
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [poolPhoto, setPoolPhoto] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [nearbyStores, setNearbyStores] = useState<Store[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [waterCondition, setWaterCondition] = useState<string[]>([]);
  
  // Notes state
  const [equipmentIssues, setEquipmentIssues] = useState('');
  const [additionalWork, setAdditionalWork] = useState('');
  const [productsLeft, setProductsLeft] = useState<Array<{ id: string; name: string; quantity: string }>>([]);
  const [equipmentPhotos, setEquipmentPhotos] = useState<Array<{
    id: string;
    category: 'pumpa' | 'filter' | 'dozatori' | 'dozator1' | 'trafo' | 'ostalo' | 'issues' | 'work' | 'products';
    dataUrl: string;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    if (poolId) {
      const poolData = storage.getPool(poolId);
      setPool(poolData || null);
      
      // Set disinfection system from pool data
      if (poolData?.disinfectionSystem) {
        setDisinfectionSystem(poolData.disinfectionSystem);
      }
    }
  }, [poolId]);

  useEffect(() => {
    if (pool?.location?.latitude && pool?.location?.longitude) {
      const stores = findNearbyStores(
        pool.location.latitude,
        pool.location.longitude,
        50 // 50km radius
      );
      setNearbyStores(stores);
    } else {
      // No GPS location, show all stores
      setNearbyStores([]);
    }
  }, [pool]);

  // Check for calibration warnings when parameters change
  useEffect(() => {
    if (!hasAutomation) {
      setCalibrationWarnings([]);
      return;
    }

    const warnings: Array<{type: string; diff: number; auto: number; manual: number}> = [];
    
    // Check pH
    if (automationParams.pH && parameters.pH) {
      const autoPh = parseFloat(automationParams.pH);
      const manualPh = parseFloat(parameters.pH);
      const diff = Math.abs(autoPh - manualPh);
      if (diff > 0.3) {
        warnings.push({ type: 'pH', diff, auto: autoPh, manual: manualPh });
      }
    }
    
    // Check Free Chlorine
    if (automationParams.freeChlorine && parameters.freeChlorine) {
      const autoCl = parseFloat(automationParams.freeChlorine);
      const manualCl = parseFloat(parameters.freeChlorine);
      const diff = Math.abs(autoCl - manualCl);
      if (diff > 0.5) {
        warnings.push({ type: 'Klor', diff, auto: autoCl, manual: manualCl });
      }
    }
    
    // Check ORP/Redox
    if (automationParams.orp && parameters.orp) {
      const autoOrp = parseFloat(automationParams.orp);
      const manualOrp = parseFloat(parameters.orp);
      const diff = Math.abs(autoOrp - manualOrp);
      if (diff > 50) {
        warnings.push({ type: 'Redox (ORP)', diff, auto: autoOrp, manual: manualOrp });
      }
    }
    
    setCalibrationWarnings(warnings);
  }, [hasAutomation, automationParams, parameters]);

  const handleCalculate = () => {
    if (!pool) return;

    // Reset previous result first
    setResult(null);

    const params = {
      pH: parameters.pH ? parseFloat(parameters.pH) : undefined,
      freeChlorine: parameters.freeChlorine ? parseFloat(parameters.freeChlorine) : undefined,
      alkalinity: parameters.alkalinity ? parseFloat(parameters.alkalinity) : undefined,
      hardness: parameters.hardness ? parseFloat(parameters.hardness) : undefined,
      temperature: parameters.temperature ? parseFloat(parameters.temperature) : undefined,
      orp: parameters.orp ? parseFloat(parameters.orp) : undefined,
    };

    console.log('Calculating with params:', params);
    const analysisResult = analyzeWater(params, pool.volume, disinfectionSystem);
    console.log('Analysis result:', analysisResult);
    console.log('Treatment cost:', analysisResult.treatmentCost);
    setResult(analysisResult);

    // Scroll to top to show results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = () => {
    if (!pool || !result) return;

    const analysis: WaterAnalysis = {
      id: Date.now().toString(),
      poolId: pool.id,
      date: new Date().toISOString(),
      parameters: {
        pH: parameters.pH ? parseFloat(parameters.pH) : 0,
        freeChlorine: parameters.freeChlorine ? parseFloat(parameters.freeChlorine) : 0,
        alkalinity: parameters.alkalinity ? parseFloat(parameters.alkalinity) : 0,
        hardness: parameters.hardness ? parseFloat(parameters.hardness) : 0,
        temperature: parameters.temperature ? parseFloat(parameters.temperature) : undefined,
        orp: parameters.orp ? parseFloat(parameters.orp) : undefined,
      },
      status: result.status,
      recommendations: result.recommendations,
      waterCondition: waterCondition.length > 0 ? waterCondition : undefined,
      notes: {
        equipmentIssues: equipmentIssues.trim() || undefined,
        additionalWork: additionalWork.trim() || undefined,
        productsLeft: productsLeft.length > 0 ? productsLeft : undefined,
        equipmentPhotos: equipmentPhotos.length > 0 ? equipmentPhotos : undefined,
      }
    };

    // Save regular analysis
    storage.saveAnalysis(analysis);
    
    // Save to analytics for professionals
    const analyticsEntry: AnalyticsEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      clientId: undefined,
      clientName: undefined,
      poolId: pool.id,
      poolName: pool.name,
      poolVolume: pool.volume,
      parameters: {
        pH: parameters.pH ? parseFloat(parameters.pH) : undefined,
        freeChlorine: parameters.freeChlorine ? parseFloat(parameters.freeChlorine) : undefined,
        alkalinity: parameters.alkalinity ? parseFloat(parameters.alkalinity) : undefined,
        hardness: parameters.hardness ? parseFloat(parameters.hardness) : undefined,
        temperature: parameters.temperature ? parseFloat(parameters.temperature) : undefined,
        orp: parameters.orp ? parseFloat(parameters.orp) : undefined,
      },
      status: result.status,
      recommendations: result.recommendations.map(rec => ({
        productName: rec.productName,
        quantity: rec.quantity,
        unit: rec.unit,
        category: rec.category,
      })),
      treatmentCost: result.treatmentCost?.totalEUR,
      source: 'manual',
    };
    
    analyticsStorage.save(analyticsEntry);
    
    console.log('✅ Analysis saved to analytics:', analyticsEntry);
    
    // Show success message and stay on page
    setSavedSuccess(true);
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setSavedSuccess(false);
    }, 5000);
  };

  const handleExportPDF = () => {
    if (!pool || !result) {
      alert('Molimo prvo analizirajte vodu');
      return;
    }

    // Create WaterAnalysis object from current state
    const analysis: WaterAnalysis = {
      id: Date.now().toString(),
      poolId: pool.id,
      date: new Date().toISOString(),
      parameters: {
        pH: parameters.pH ? parseFloat(parameters.pH) : 0,
        freeChlorine: parameters.freeChlorine ? parseFloat(parameters.freeChlorine) : 0,
        alkalinity: parameters.alkalinity ? parseFloat(parameters.alkalinity) : 0,
        hardness: parameters.hardness ? parseFloat(parameters.hardness) : 0,
        temperature: parameters.temperature ? parseFloat(parameters.temperature) : undefined,
        orp: parameters.orp ? parseFloat(parameters.orp) : undefined,
      },
      status: result.status,
      recommendations: result.recommendations,
    };

    generateAnalysisPDF({ pool, analysis });
  };

  const isFormValid = () => {
    return parameters.pH || parameters.freeChlorine || parameters.alkalinity || parameters.hardness;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
      {/* Animated gradient orbs - 3D depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg2LCAxODIsIDIxMiwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30 pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 bg-slate-900/30 backdrop-blur-2xl border-b border-cyan-500/10 shadow-[0_8px_32px_0_rgba(6,182,212,0.1)]">
        <div className="p-4 flex items-center gap-4 max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="p-3 hover:bg-white/10 rounded-xl transition-all backdrop-blur-sm border border-white/5">
            <ArrowLeft className="w-6 h-6 text-cyan-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-md opacity-60"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50">
                <Beaker className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 uppercase tracking-tight">Nova analiza vode</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 relative z-10">{/* Pool Info Banner - 3D Glassmorphism */}
        <div className="relative overflow-hidden group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-3xl p-8 border-2 border-cyan-500/30 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl blur-md opacity-60 animate-pulse"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-xl">
                    <Waves className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">{pool.name}</div>
              </div>
              <div className="text-cyan-100/80 font-bold text-lg">Volumen: {pool.volume} m³</div>
            </div>
          </div>
        </div>

        {/* Disinfection System Selector - 3D Premium */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-cyan-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl blur-md opacity-60"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-xl">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Sustav dezinfekcije</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: 'salt-electrolysis' as const, label: '⚡ Elektroliza soli', desc: 'Automatska proizvodnja klora' },
                { value: 'chlorine+ph' as const, label: '💉 Klor + pH automatika', desc: 'Dozatori za klor i pH' },
                { value: 'peroxide' as const, label: '💧 Peroksid', desc: 'Aktivni kisik sustav' },
                { value: 'tablets' as const, label: '💊 Tablete klora', desc: 'Manuelno doziranje' },
              ].map((system) => {
                const isInstalled = pool.disinfectionSystem === system.value;
                const isSelected = disinfectionSystem === system.value;
                
                return (
                  <button
                    key={system.value}
                    onClick={() => {
                      setDisinfectionSystem(system.value);
                      if (pool) {
                        const updatedPool = { ...pool, disinfectionSystem: system.value };
                        storage.updatePool(updatedPool);
                        setPool(updatedPool);
                      }
                    }}
                    className={`p-5 rounded-2xl border-2 transition-all text-left relative group/btn hover:scale-105 transform ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                        : 'border-white/10 bg-white/5 hover:border-cyan-500/30'
                    }`}
                  >
                    {isInstalled && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-lg">
                        INSTALIRANO
                      </div>
                    )}
                    <div className={`font-bold text-lg mb-1 ${isSelected ? 'text-cyan-400' : 'text-white'}`}>{system.label}</div>
                    <div className="text-sm text-slate-400">{system.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* AUTOMATIKA TOGGLE - PRO FEATURE */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl blur-md opacity-60"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center shadow-xl">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-tight">Automatika za mjerenje</h2>
                  <p className="text-sm text-slate-400">Ima li bazen automatiku za pH/Redox mjerenje?</p>
                </div>
              </div>
              
              <button
                onClick={() => setHasAutomation(!hasAutomation)}
                className={`relative w-16 h-8 rounded-full transition-all ${
                  hasAutomation ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-700'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${
                  hasAutomation ? 'translate-x-9' : 'translate-x-1'
                }`}></div>
              </button>
            </div>

            {hasAutomation && (
              <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-purple-500/20">
                <p className="text-sm text-cyan-300 mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Unesite vrijednosti koje pokazuje automatika. Usporedbit ćemo ih s manualnim mjerenjima.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-300 font-medium">
                      pH (automatika)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={automationParams.pH}
                      onChange={(e) => setAutomationParams({ ...automationParams, pH: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-500 transition-all bg-slate-800 text-white"
                      placeholder="7.2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-2 text-gray-300 font-medium">
                      Slobodni klor (automatika)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={automationParams.freeChlorine}
                      onChange={(e) => setAutomationParams({ ...automationParams, freeChlorine: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-500 transition-all bg-slate-800 text-white"
                      placeholder="1.0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-2 text-gray-300 font-medium">
                      Redox (automatika)
                    </label>
                    <input
                      type="number"
                      step="10"
                      value={automationParams.orp}
                      onChange={(e) => setAutomationParams({ ...automationParams, orp: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-500 transition-all bg-slate-800 text-white"
                      placeholder="750"
                    />
                  </div>
                </div>

                {calibrationWarnings.length > 0 && (
                  <div className="mt-4 p-4 bg-red-500/20 border-2 border-red-500 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <h3 className="font-bold text-red-400">KALIBRACIJA POTREBNA!</h3>
                    </div>
                    <div className="space-y-2">
                      {calibrationWarnings.map((warning, idx) => (
                        <div key={idx} className="text-sm text-red-300">
                          <strong>{warning.type}:</strong> Razlika {warning.diff.toFixed(2)} 
                          (Automatika: {warning.auto}, Manualno: {warning.manual})
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate('/app/pool-instructions')}
                      className="mt-3 w-full bg-red-500 text-white py-2 px-4 rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Wrench className="w-4 h-4" />
                      Pogledaj upute za kalibraciju
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results - Show immediately after disinfection system when available */}
        {result && (
          <>
            <div
              className={`rounded-2xl p-6 shadow-xl border-2 backdrop-blur-sm ${
                result.status === 'ok'
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                  : result.status === 'warning'
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                  : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                    result.status === 'ok'
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                      : result.status === 'warning'
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                      : 'bg-gradient-to-br from-red-400 to-rose-500'
                  }`}
                >
                  <Droplets className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-medium mb-2">{result.message}</h3>
                  {result.issues.length > 0 && (
                    <div className="text-sm space-y-1.5">
                      <div className="font-medium opacity-80">Utvrđeni problemi:</div>
                      <ul className="space-y-1">
                        {result.issues.map((issue, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Insights */}
              {result.insights.length > 0 && (
                <div className="mt-4 space-y-2">
                  {result.insights.map((insight, index) => (
                    <div key={index} className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-sm flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Beaker className="w-5 h-5" />
                    Preporučeni proizvodi (Ivero):
                  </div>
                  {result.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                          rec.priority === 1 ? 'bg-gradient-to-br from-red-500 to-rose-500' :
                          rec.priority === 2 ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                          'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}>
                          <Beaker className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-medium text-lg">
                              {rec.productName}
                            </div>
                            {rec.priority === 1 && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                Hitno
                              </span>
                            )}
                          </div>
                          <div className="text-2xl font-bold text-blue-600 mb-2">
                            {rec.dosage}
                          </div>
                          <div className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                            <span>{rec.instructions}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Treatment Cost */}
              {result.treatmentCost && result.treatmentCost.items.length > 0 && (
                <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border-2 border-green-200 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Trošak Tretmana</h3>
                      <p className="text-sm text-gray-600">Procijenjeni trošak potrebnih proizvoda</p>
                    </div>
                  </div>

                  {/* Cost Items */}
                  <div className="space-y-3 mb-4">
                    {result.treatmentCost.items.map((item, index) => (
                      <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-100">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-1">
                              {item.productType}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              Potrebno: <span className="font-medium text-blue-600">{item.amountNeeded} {item.unit}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">Kupiti:</span>
                              <span className="font-medium text-gray-900">{item.quantityText}</span>
                              <span className="text-gray-400">|</span>
                              <span className="text-gray-600">{item.product.name}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              €{item.totalCost.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.product.priceHRK.toFixed(2)} kn
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t-2 border-green-300 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">Ukupno:</div>
                        <div className="text-sm text-gray-600">PDV uključen u cijenu</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-600">
                          €{result.treatmentCost.totalEUR.toFixed(2)}
                        </div>
                        <div className="text-lg text-gray-600">
                          {result.treatmentCost.totalHRK.toFixed(2)} kn
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-900 flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Cijene su informativne i odnose se na Ivero proizvode. Stvarne cijene mogu varirati ovisno o prodajnom mjestu.</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Success Message after saving */}
            {savedSuccess && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-2xl animate-[slideDown_0.3s_ease-out]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Save className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Analiza uspješno spremljena! ✅</h3>
                    <p className="text-green-100 text-sm">Podaci su sigurno pohranjeni i dostupni u povijesti.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleSave}
                className="bg-sky-500 text-white py-4 px-6 rounded-xl hover:bg-sky-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 font-medium"
              >
                <Save className="w-5 h-5" />
                Spremi analizu
              </button>

              <button
                onClick={handleExportPDF}
                className="bg-white border-2 border-sky-500 text-sky-600 py-4 px-6 rounded-xl hover:bg-sky-50 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 font-medium"
              >
                <FileDown className="w-5 h-5" />
                Podijeli PDF
              </button>
            </div>

            {/* Additional Actions */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Dodatne opcije
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    // First save the analysis, then navigate to notes
                    if (!pool || !result) return;
                    
                    const analysis: WaterAnalysis = {
                      id: Date.now().toString(),
                      poolId: pool.id,
                      date: new Date().toISOString(),
                      parameters: {
                        pH: parameters.pH ? parseFloat(parameters.pH) : 0,
                        freeChlorine: parameters.freeChlorine ? parseFloat(parameters.freeChlorine) : 0,
                        alkalinity: parameters.alkalinity ? parseFloat(parameters.alkalinity) : 0,
                        hardness: parameters.hardness ? parseFloat(parameters.hardness) : 0,
                        temperature: parameters.temperature ? parseFloat(parameters.temperature) : undefined,
                        orp: parameters.orp ? parseFloat(parameters.orp) : undefined,
                      },
                      status: result.status,
                      recommendations: result.recommendations,
                    };

                    storage.saveAnalysis(analysis);
                    
                    navigate('/app/analysis-notes', {
                      state: {
                        poolId: pool.id,
                        analysisId: analysis.id,
                      },
                    });
                  }}
                  className="bg-white border-2 border-purple-300 text-purple-700 py-3 px-4 rounded-xl hover:bg-purple-50 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Camera className="w-5 h-5" />
                  <span>Dodaj napomene i fotografije</span>
                </button>

                <button
                  onClick={() => navigate('/app/analytics-dashboard')}
                  className="bg-white border-2 border-purple-300 text-purple-700 py-3 px-4 rounded-xl hover:bg-purple-50 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <FileText className="w-5 h-5" />
                  <span>Pogledaj analitiku</span>
                </button>
              </div>
            </div>

            {/* Analysis Notes Section - ALWAYS SHOW WHEN RESULT EXISTS */}
            <AnalysisNotesForm
              equipmentIssues={equipmentIssues}
              setEquipmentIssues={setEquipmentIssues}
              additionalWork={additionalWork}
              setAdditionalWork={setAdditionalWork}
              productsLeft={productsLeft}
              setProductsLeft={setProductsLeft}
              equipmentPhotos={equipmentPhotos}
              setEquipmentPhotos={setEquipmentPhotos}
            />

            {/* Nearby Stores Section - Show for all users when there are stores */}
            {nearbyStores.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2 text-gray-900">
                  🏪 Gdje kupiti Ivero proizvode
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Pronađene trgovine u blizini lokacije bazena
                </p>
                <NearbyStores 
                  stores={nearbyStores} 
                  userLocation={pool.location?.latitude && pool.location?.longitude ? {
                    lat: pool.location.latitude,
                    lng: pool.location.longitude
                  } : undefined}
                />
              </div>
            )}
          </>
        )}

        {/* Input Form - Only show when NO result exists */}
        {!result && (
          <>
            {/* Info Card */}
            <div className="bg-blue-50/80 backdrop-blur-sm border-2 border-blue-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <strong>Savjet:</strong> Nije potrebno unijeti sve parametre. Unesite one koje ste izmjerili, a aplikacija će dati preporuke na temelju dostupnih podataka.
                  {!parameters.orp && (
                    <div className="mt-2 pt-2 border-t border-blue-300">
                      <strong>ORP preporuka:</strong> ORP (redox potencijal) mjeri <em>stvarnu učinkovitost</em> dezinfekcije, dok slobodni klor mjeri samo koncentraciju. Za potpunu sliku, preporučujemo mjerenje oba parametra!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Input Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <TestTube className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold">Parametri vode</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* pH */}
                <div className="group">
                  <label className="block text-sm mb-2 text-gray-700 font-medium">
                    pH vrijednost
                    <span className="text-xs text-gray-500 ml-2">(ideal: {IDEAL_RANGES.pH.ok.min}-{IDEAL_RANGES.pH.ok.max})</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={parameters.pH}
                      onChange={(e) => setParameters({ ...parameters, pH: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all bg-white group-hover:border-gray-300 ${
                        (() => {
                          const status = getParameterStatus('pH', parameters.pH ? parseFloat(parameters.pH) : undefined);
                          return status.status === 'critical' ? 'border-red-400 focus:border-red-500' :
                                 status.status === 'warning' ? 'border-yellow-400 focus:border-yellow-500' :
                                 status.status === 'ok' && parameters.pH ? 'border-green-400 focus:border-green-500' :
                                 'border-gray-200 focus:border-blue-500';
                        })()
                      }`}
                      placeholder="7.4"
                    />
                    {parameters.pH && (
                      <div className={`absolute right-12 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-1 rounded ${getParameterStatus('pH', parseFloat(parameters.pH)).bgColor} ${getParameterStatus('pH', parseFloat(parameters.pH)).color}`}>
                        {getParameterStatus('pH', parseFloat(parameters.pH)).label}
                      </div>
                    )}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                      pH
                    </div>
                  </div>
                </div>

                {/* Free Chlorine */}
                <div className="group">
                  <label className="block text-sm mb-2 text-gray-700 font-medium">
                    Slobodni klor
                    <span className="text-xs text-gray-500 ml-2">(ideal: {IDEAL_RANGES.freeChlorine.ok.min}-{IDEAL_RANGES.freeChlorine.ok.max} mg/l)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={parameters.freeChlorine}
                      onChange={(e) => setParameters({ ...parameters, freeChlorine: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all bg-white group-hover:border-gray-300 ${
                        (() => {
                          const status = getParameterStatus('freeChlorine', parameters.freeChlorine ? parseFloat(parameters.freeChlorine) : undefined);
                          return status.status === 'critical' ? 'border-red-400 focus:border-red-500' :
                                 status.status === 'warning' ? 'border-yellow-400 focus:border-yellow-500' :
                                 status.status === 'ok' && parameters.freeChlorine ? 'border-green-400 focus:border-green-500' :
                                 'border-gray-200 focus:border-blue-500';
                        })()
                      }`}
                      placeholder="1.5"
                    />
                    {parameters.freeChlorine && (
                      <div className={`absolute right-20 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-1 rounded ${getParameterStatus('freeChlorine', parseFloat(parameters.freeChlorine)).bgColor} ${getParameterStatus('freeChlorine', parseFloat(parameters.freeChlorine)).color}`}>
                        {getParameterStatus('freeChlorine', parseFloat(parameters.freeChlorine)).label}
                      </div>
                    )}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                      mg/l
                    </div>
                  </div>
                </div>

                {/* Alkalinity */}
                <div className="group">
                  <label className="block text-sm mb-2 text-gray-700 font-medium">
                    Alkalnost (TA)
                    <span className="text-xs text-gray-500 ml-2">(ideal: {IDEAL_RANGES.alkalinity.ok.min}-{IDEAL_RANGES.alkalinity.ok.max} mg/l)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="10"
                      value={parameters.alkalinity}
                      onChange={(e) => setParameters({ ...parameters, alkalinity: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all bg-white group-hover:border-gray-300 ${
                        (() => {
                          const status = getParameterStatus('alkalinity', parameters.alkalinity ? parseFloat(parameters.alkalinity) : undefined);
                          return status.status === 'critical' ? 'border-red-400 focus:border-red-500' :
                                 status.status === 'warning' ? 'border-yellow-400 focus:border-yellow-500' :
                                 status.status === 'ok' && parameters.alkalinity ? 'border-green-400 focus:border-green-500' :
                                 'border-gray-200 focus:border-blue-500';
                        })()
                      }`}
                      placeholder="100"
                    />
                    {parameters.alkalinity && (
                      <div className={`absolute right-20 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-1 rounded ${getParameterStatus('alkalinity', parseFloat(parameters.alkalinity)).bgColor} ${getParameterStatus('alkalinity', parseFloat(parameters.alkalinity)).color}`}>
                        {getParameterStatus('alkalinity', parseFloat(parameters.alkalinity)).label}
                      </div>
                    )}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                      mg/l
                    </div>
                  </div>
                </div>

                {/* Hardness */}
                <div className="group">
                  <label className="block text-sm mb-2 text-gray-700 font-medium">
                    Tvrdoća (CH)
                    <span className="text-xs text-gray-500 ml-2">(ideal: {IDEAL_RANGES.hardness.ok.min}-{IDEAL_RANGES.hardness.ok.max} mg/l)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="10"
                      value={parameters.hardness}
                      onChange={(e) => setParameters({ ...parameters, hardness: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all bg-white group-hover:border-gray-300 ${
                        (() => {
                          const status = getParameterStatus('hardness', parameters.hardness ? parseFloat(parameters.hardness) : undefined);
                          return status.status === 'critical' ? 'border-red-400 focus:border-red-500' :
                                 status.status === 'warning' ? 'border-yellow-400 focus:border-yellow-500' :
                                 status.status === 'ok' && parameters.hardness ? 'border-green-400 focus:border-green-500' :
                                 'border-gray-200 focus:border-blue-500';
                        })()
                      }`}
                      placeholder="250"
                    />
                    {parameters.hardness && (
                      <div className={`absolute right-20 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-1 rounded ${getParameterStatus('hardness', parseFloat(parameters.hardness)).bgColor} ${getParameterStatus('hardness', parseFloat(parameters.hardness)).color}`}>
                        {getParameterStatus('hardness', parseFloat(parameters.hardness)).label}
                      </div>
                    )}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                      mg/l
                    </div>
                  </div>
                </div>

                {/* Temperature */}
                <div className="group">
                  <label className="block text-sm mb-2 text-gray-700 font-medium">
                    Temperatura
                    <span className="text-xs text-gray-500 ml-2">(opcionalno)</span>
                  </label>
                  <div className="relative">
                    <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.1"
                      value={parameters.temperature}
                      onChange={(e) => setParameters({ ...parameters, temperature: e.target.value })}
                      className="w-full pl-11 pr-14 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all bg-white group-hover:border-gray-300"
                      placeholder="25"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                      °C
                    </div>
                  </div>
                </div>

                {/* ORP */}
                <div className="group">
                  <label className="block text-sm mb-2 text-gray-700 font-medium">
                    ORP (Redox Potencijal)
                    <span className="text-xs text-gray-500 ml-2">(ideal: {IDEAL_RANGES.orp.ok.min}-{IDEAL_RANGES.orp.ok.max} mV)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="10"
                      value={parameters.orp}
                      onChange={(e) => setParameters({ ...parameters, orp: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all bg-white group-hover:border-gray-300 ${
                        (() => {
                          const status = getParameterStatus('orp', parameters.orp ? parseFloat(parameters.orp) : undefined);
                          return status.status === 'critical' ? 'border-red-400 focus:border-red-500' :
                                 status.status === 'warning' ? 'border-yellow-400 focus:border-yellow-500' :
                                 status.status === 'ok' && parameters.orp ? 'border-green-400 focus:border-green-500' :
                                 'border-gray-200 focus:border-blue-500';
                        })()
                      }`}
                      placeholder="700"
                    />
                    {parameters.orp && (
                      <div className={`absolute right-16 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-1 rounded ${getParameterStatus('orp', parseFloat(parameters.orp)).bgColor} ${getParameterStatus('orp', parseFloat(parameters.orp)).color}`}>
                        {getParameterStatus('orp', parseFloat(parameters.orp)).label}
                      </div>
                    )}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                      mV
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <div className="mt-8">
                <button
                  onClick={handleCalculate}
                  disabled={!isFormValid()}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-bold text-lg flex items-center justify-center gap-3"
                >
                  <Beaker className="w-6 h-6" />
                  Analiziraj vodu
                </button>
              </div>
            </div>

            {/* Photo Upload */}
            <PhotoUpload
              onPhotoCapture={(photo) => setPoolPhoto(photo)}
              existingPhoto={poolPhoto || undefined}
            />

            {/* Water Condition Picker */}
            <WaterConditionPicker
              selected={waterCondition}
              onChange={setWaterCondition}
            />

            {/* Contact Agent Section */}
            <ContactAgent poolId={pool.id} analysisId={result?.status ? Date.now().toString() : undefined} />
          </>
        )}
      </div>
    </div>
  );
}