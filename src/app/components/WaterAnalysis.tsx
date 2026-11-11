import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Beaker, Droplets, TrendingUp, AlertCircle, CheckCircle, ArrowLeft, Download, Share2, BarChart3, MapPin, Phone, Mail, MessageCircle, Sparkles, Package, ShoppingCart, Zap } from 'lucide-react';
import { analyzeWater, AnalysisResult } from '../lib/waterAnalysis';
import { calculateTreatmentCost } from '../lib/productPrices';
import { MONDO_CONTACT, addRecommended } from '../lib/mondoShop';
import { T } from '../lib/theme';
import { WaterBackground } from './WaterBackground';
import { ReadingCard } from './ReadingCard';
import { AlternativeProducts } from './AlternativeProducts';
import { memberApi, isMemberLoggedIn } from '../lib/memberApi';
import { TesterScanButton } from './TesterScan';
import { PoolPhotoCheck } from './PoolPhotoCheck';
import type { WaterAppearance } from '../lib/waterAnalysis';

interface WaterAnalysisProps {
  onBack: () => void;
  onOpenShop?: () => void;
  onRegisterMember?: () => void;
  onLogin?: () => void;
}

export function WaterAnalysis({ onBack, onOpenShop, onRegisterMember, onLogin }: WaterAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'test' | 'recommendations'>('test');
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior }); }, [activeTab]);
  const [poolVolume, setPoolVolume] = useState('');
  const [testResults, setTestResults] = useState({
    ph: '',
    freeChlorine: '',
    totalChlorine: '',
    alkalinity: '',
    hardness: '',
    cyanuricAcid: '',
    temperature: '',
    orp: '',
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [appearance, setAppearance] = useState<WaterAppearance | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const savedForResult = useRef<AnalysisResult | null>(null);

  // Prefill pool volume from member profile on mount
  useEffect(() => {
    if (!isMemberLoggedIn()) return;
    memberApi.getMemberMe().then(data => {
      if (data.pool?.volume && !poolVolume) {
        setPoolVolume(String(data.pool.volume));
      }
    }).catch(() => {});
  }, []);

  // Auto-save analysis for members (once per analysis)
  useEffect(() => {
    if (!analysisResult || !isMemberLoggedIn()) return;
    if (savedForResult.current === analysisResult) return;
    savedForResult.current = analysisResult;
    setSaveStatus('saving');
    memberApi.saveMemberAnalysis({
      pH: testResults.ph ? parseFloat(testResults.ph) : undefined,
      freeChlorine: testResults.freeChlorine ? parseFloat(testResults.freeChlorine) : undefined,
      totalChlorine: testResults.totalChlorine ? parseFloat(testResults.totalChlorine) : undefined,
      alkalinity: testResults.alkalinity ? parseFloat(testResults.alkalinity) : undefined,
      hardness: testResults.hardness ? parseFloat(testResults.hardness) : undefined,
      cyanuricAcid: testResults.cyanuricAcid ? parseFloat(testResults.cyanuricAcid) : undefined,
      temperature: testResults.temperature ? parseFloat(testResults.temperature) : undefined,
      orp: testResults.orp ? parseFloat(testResults.orp) : undefined,
      volume: poolVolume ? parseFloat(poolVolume) : undefined,
      status: analysisResult.status,
      message: analysisResult.message,
      issues: analysisResult.issues,
      ...(photoPath ? { photoPath } : {}),
      ...(appearance ? { appearance } : {}),
      recommendations: analysisResult.recommendations.map(r => ({
        productName: r.productName,
        dosage: r.dosage,
        instructions: r.instructions,
      })),
    }).then(() => setSaveStatus('saved')).catch(() => setSaveStatus('error'));
  }, [analysisResult]);

  const handleInputChange = (param: string, value: string) => {
    setTestResults(prev => ({ ...prev, [param]: value }));
  };

  const handleAnalyze = () => {
    if (!poolVolume || !testResults.ph || (!testResults.freeChlorine && !testResults.orp)) {
      alert('Molimo unesite volumen bazena, pH te slobodni klor ili Redox (ORP)');
      return;
    }

    const params = {
      pH: testResults.ph ? parseFloat(testResults.ph) : undefined,
      freeChlorine: testResults.freeChlorine ? parseFloat(testResults.freeChlorine) : undefined,
      totalChlorine: testResults.totalChlorine ? parseFloat(testResults.totalChlorine) : undefined,
      alkalinity: testResults.alkalinity ? parseFloat(testResults.alkalinity) : undefined,
      hardness: testResults.hardness ? parseFloat(testResults.hardness) : undefined,
      cyanuricAcid: testResults.cyanuricAcid ? parseFloat(testResults.cyanuricAcid) : undefined,
      temperature: testResults.temperature ? parseFloat(testResults.temperature) : undefined,
      orp: testResults.orp ? parseFloat(testResults.orp) : undefined,
    };

    const result = analyzeWater(params, parseFloat(poolVolume), 'chlorine', appearance);
    setAnalysisResult(result);
    setSaveStatus('idle');
    savedForResult.current = null;
    setActiveTab('recommendations');
  };

  const analyzeParameter = (param: string, value: number) => {
    const ranges: any = {
      ph: { min: 7.2, max: 7.6, ideal: 7.4 },
      freeChlorine: { min: 0.5, max: 1.5, ideal: 1.0 },
      totalChlorine: { min: 1.0, max: 3.0, ideal: 2.0 },
      alkalinity: { min: 80, max: 120, ideal: 100 },
      hardness: { min: 200, max: 400, ideal: 300 },
      cyanuricAcid: { min: 30, max: 50, ideal: 40 },
      temperature: { min: 20, max: 30, ideal: 25 },
      orp: { min: 650, max: 750, ideal: 700 },
    };
    const range = ranges[param];
    if (!range) return 'unknown';
    if (value < range.min) return 'low';
    if (value > range.max) return 'high';
    if (Math.abs(value - range.ideal) < (range.max - range.min) * 0.2) return 'perfect';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'perfect': return '#2EFF88';
      case 'good': return '#00E0FF';
      case 'low': return '#FFB020';
      case 'high': return '#FF3B30';
      default: return 'rgba(255,255,255,0.45)';
    }
  };

  const parameters = [
    { id: 'ph', label: 'pH razina', unit: '', icon: Droplets, idealRange: '7.2 - 7.6' },
    { id: 'freeChlorine', label: 'Slobodni klor', unit: 'mg/l', icon: Beaker, idealRange: '0.5 - 1.5' },
    { id: 'orp', label: 'Redox (ORP)', unit: 'mV', icon: Zap, idealRange: '650 - 750' },
    { id: 'totalChlorine', label: 'Ukupni klor', unit: 'mg/l', icon: Beaker, idealRange: '1.0 - 3.0' },
    { id: 'alkalinity', label: 'Ukupna alkalnost', unit: 'mg/l', icon: TrendingUp, idealRange: '80 - 120' },
    { id: 'hardness', label: 'Tvrdoća vode (Ca)', unit: 'mg/l', icon: Droplets, idealRange: '200 - 400' },
    { id: 'cyanuricAcid', label: 'Cijanurna kiselina', unit: 'mg/l', icon: Beaker, idealRange: '30 - 50' },
    { id: 'temperature', label: 'Temperatura', unit: '°C', icon: Sparkles, idealRange: '25 - 30' },
  ];

  const handleOrderRecommended = () => {
    if (!analysisResult) return;
    const cost = calculateTreatmentCost(analysisResult.recommendations);
    const items = cost.items
      .filter(item => item.product.id !== 'unknown')
      .map(item => ({ productId: item.product.id, quantity: item.quantity }));

    let summary = `Volumen ${poolVolume} m³, pH ${testResults.ph}`;
    if (testResults.freeChlorine) summary += `, slobodni klor ${testResults.freeChlorine} mg/l`;
    if (testResults.orp) summary += `, Redox ${testResults.orp} mV`;
    if (testResults.alkalinity) summary += `, alkalnost ${testResults.alkalinity} mg/l`;

    addRecommended(items, summary);
    onOpenShop?.();
  };

  // Mondo Acqua card (reusable within this file)
  const MondoCard = () => (
    <div className="glass-card p-6" style={{ border: '2px solid rgba(255,176,32,0.2)' }}>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #FFB020 0%, #FF8C00 100%)', borderRadius: '12px' }}>
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{MONDO_CONTACT.name}</h3>
          {MONDO_CONTACT.address && (
            <p className="text-sm" style={{ color: T.muted }}>{MONDO_CONTACT.address}</p>
          )}
          {MONDO_CONTACT.hours && (
            <p className="text-sm" style={{ color: T.faint }}>{MONDO_CONTACT.hours}</p>
          )}
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Proizvode možete naručiti online s dostavom ili preuzeti osobno.
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4" style={{ color: '#FFB020' }} />
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>{MONDO_CONTACT.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4" style={{ color: '#FFB020' }} />
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>{MONDO_CONTACT.email}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <a
          href={`tel:${MONDO_CONTACT.phone.replace(/\s/g, '')}`}
          className="btn-secondary px-4 py-2 text-sm font-semibold flex items-center gap-2"
        >
          <Phone className="w-4 h-4" />
          Nazovi
        </a>
        <a
          href={`https://wa.me/${MONDO_CONTACT.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-sm font-semibold flex items-center gap-2 rounded-xl transition-all hover:opacity-90"
          style={{ background: '#25D366', color: '#fff' }}
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
        {MONDO_CONTACT.address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MONDO_CONTACT.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary px-4 py-2 text-sm font-semibold flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Navigacija
          </a>
        )}
      </div>

      <button
        onClick={() => onOpenShop?.()}
        className="btn-primary w-full py-3 font-semibold flex items-center justify-center gap-2"
      >
        <ShoppingCart className="w-5 h-5" />
        Naruči proizvode
      </button>
    </div>
  );

  return (
    <div className="relative min-h-screen" style={{ background: T.pageBg }}>
      <WaterBackground />

      {/* Header */}
      <div className="relative z-10" style={{ background: T.cardBg, backdropFilter: 'blur(20px)', borderBottom: T.cardBorder }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="glass-card w-10 h-10 flex items-center justify-center hover:bg-white/5 transition-all">
                <ArrowLeft className="w-5 h-5" style={{ color: T.cyan }} />
              </button>
              <div className="w-10 h-10 flex items-center justify-center" style={{ background: T.cyan, borderRadius: '12px' }}>
                <Beaker className="w-6 h-6" style={{ color: '#000000' }} />
              </div>
              <div>
                <h1 className="font-bold text-lg">Analiza Vode</h1>
                <p className="text-sm" style={{ color: T.cyan }}>Analiza kvalitete vode</p>
              </div>
            </div>
            <div className="caption px-4 py-2" style={{ background: '#2EFF8820', color: '#2EFF88', borderRadius: '12px', border: '1px solid #2EFF8840' }}>
              BESPLATNO
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { id: 'test', label: 'Novi Test', icon: Beaker },
              { id: 'recommendations', label: 'Preporuke', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-all ${
                  activeTab === tab.id ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* NEW TEST */}
          {activeTab === 'test' && (
            <motion.div key="test" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="mb-6">
                <h2 className="text-3xl font-semibold mb-2">Testiranje Parametara</h2>
                <p style={{ color: T.muted }}>Unesite izmjerene vrijednosti</p>
              </div>

              <div className="mb-6">
                <TesterScanButton onResult={(ph, cl) => setTestResults(prev => ({ ...prev, ph: String(ph), freeChlorine: String(cl) }))} />
                <div className="mt-3">
                  <PoolPhotoCheck onRegisterMember={onRegisterMember} onChange={(a, p) => { setAppearance(a); setPhotoPath(p); }} />
                </div>
              </div>

              {/* Pool Volume Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 mb-8"
                style={{ border: T.cardBorder }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-6 h-6" style={{ color: T.cyan }} />
                  <h3 className="font-semibold text-lg">Volumen Bazena</h3>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Unesi volumen bazena"
                    value={poolVolume}
                    onChange={(e) => setPoolVolume(e.target.value)}
                    className="input-glass w-full px-4 py-4 text-lg"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-semibold" style={{ color: T.cyan }}>
                    m³
                  </span>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {parameters.map((param, idx) => {
                  const value = parseFloat(testResults[param.id as keyof typeof testResults]);
                  const status = value ? analyzeParameter(param.id, value) : 'unknown';
                  const color = getStatusColor(status);

                  return (
                    <motion.div
                      key={param.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-card p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 flex items-center justify-center" style={{ background: `${color}20`, borderRadius: '12px' }}>
                            <param.icon className="w-6 h-6" style={{ color }} />
                          </div>
                          <div>
                            <h3 className="font-semibold">{param.label}</h3>
                            <p className="text-sm" style={{ color: T.muted }}>Idealno: {param.idealRange}</p>
                          </div>
                        </div>
                        {status !== 'unknown' && (
                          <div className="w-3 h-3 rounded-full" style={{ background: color }}></div>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          placeholder={`Unesi ${param.unit || 'vrijednost'}`}
                          value={testResults[param.id as keyof typeof testResults]}
                          onChange={(e) => handleInputChange(param.id, e.target.value)}
                          className="input-glass w-full px-4 py-3"
                        />
                        {param.unit && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: T.faint }}>
                            {param.unit}
                          </span>
                        )}
                      </div>

                      {status !== 'unknown' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 px-4 py-2"
                          style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: '12px' }}
                        >
                          <p className="text-sm font-medium" style={{ color }}>
                            {status === 'perfect' && '✅ Savršeno! Vrijednost je idealna.'}
                            {status === 'good' && '👍 Dobro! Vrijednost je u rasponu.'}
                            {status === 'low' && '⚠️ Nisko! Potrebno povećanje.'}
                            {status === 'high' && '⚠️ Visoko! Potrebno smanjenje.'}
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex gap-4 mb-12">
                <button
                  onClick={handleAnalyze}
                  className="flex-1 btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Analiziraj Vodu</span>
                </button>
                <button className="btn-secondary py-4 px-6 text-lg flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  <span>PDF</span>
                </button>
                <button className="btn-secondary py-4 px-6 text-lg flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  <span>Podijeli</span>
                </button>
              </div>

              {/* Mondo Acqua – Naruči Proizvode */}
              <div className="glass-card p-8" style={{ border: '2px solid rgba(255,176,32,0.2)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFB020 0%, #FF8C00 100%)', borderRadius: '12px' }}>
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Naručite Proizvode</h2>
                    <p style={{ color: T.muted }}>Kontaktirajte Mondo Acqua ili naručite online</p>
                  </div>
                </div>
                <MondoCard />
              </div>
            </motion.div>
          )}

          {/* RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <motion.div key="recommendations" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="mb-6">
                <h2 className="text-3xl font-semibold mb-2">Plan Tretmana</h2>
                <p style={{ color: T.muted }}>Točne doze i upute za uravnoteženje vode u bazenu</p>
              </div>

              {analysisResult && (
                <div className="mb-8 w-full max-w-xl mx-auto">
                  <ReadingCard values={testResults} volume={poolVolume} recommendations={analysisResult.recommendations} />
                </div>
              )}

              {!analysisResult && (
                <div className="glass-card p-12 text-center">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: T.faint }} />
                  <h3 className="text-xl font-semibold mb-2">Nema rezultata</h3>
                  <p style={{ color: T.muted }} className="mb-6">
                    Molimo prvo izvršite analizu vode
                  </p>
                  <button onClick={() => setActiveTab('test')} className="btn-primary px-8 py-3">
                    Kreni s Analizom
                  </button>
                </div>
              )}

              {/* Member auto-save banner */}
              {analysisResult && isMemberLoggedIn() && saveStatus !== 'idle' && (
                <div className="mb-4 px-4 py-2 rounded-xl text-sm font-medium" style={
                  saveStatus === 'saved'
                    ? { background: 'rgba(46,255,136,0.08)', border: '1px solid rgba(46,255,136,0.25)', color: '#2EFF88' }
                    : saveStatus === 'error'
                    ? { background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.25)', color: '#FF3B30' }
                    : { background: 'rgba(92,225,230,0.06)', border: '1px solid rgba(92,225,230,0.15)', color: T.cyan }
                }>
                  {saveStatus === 'saving' && 'Spremanje...'}
                  {saveStatus === 'saved' && '✓ Spremljeno u Moj bazen'}
                  {saveStatus === 'error' && 'Analiza nije spremljena – provjerite vezu.'}
                </div>
              )}

              {analysisResult && analysisResult.recommendations.length === 0 && (
                <div className="glass-card p-12 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#2EFF88' }} />
                  <h3 className="text-xl font-semibold mb-2">Savršeno!</h3>
                  <p style={{ color: T.muted }}>
                    Svi parametri su u idealnom rasponu. Nastavite s redovitim održavanjem.
                  </p>
                </div>
              )}

              {analysisResult && analysisResult.recommendations.length > 0 && (
                <>
                  {/* Treatment Summary */}
                  <div className="glass-card p-6 mb-8" style={{ border: T.cardBorder }}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center" style={{ background: `${T.cyan}20`, borderRadius: '12px' }}>
                        <Sparkles className="w-6 h-6" style={{ color: T.cyan }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">Status Analize</h3>
                        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>{analysisResult.message}</p>
                        {analysisResult.issues.length > 0 && (
                          <div className="space-y-1">
                            {analysisResult.issues.map((issue, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm" style={{ color: '#FFB020' }}>
                                <AlertCircle className="w-4 h-4" />
                                <span>{issue}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Product Recommendations */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {analysisResult.recommendations.sort((a, b) => a.priority - b.priority).map((rec, idx) => {
                      const priorityColors: any = { 1: '#FF3B30', 2: '#FFB020', 3: '#00E0FF', 4: '#2EFF88' };
                      const color = priorityColors[rec.priority] || '#00E0FF';
                      const priorityLabels: any = { 1: 'KRITIČNO', 2: 'VAŽNO', 3: 'PREPORUČENO', 4: 'NEOBAVEZNO' };

                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="glass-card p-6"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Package className="w-5 h-5" style={{ color }} />
                              <h3 className="font-semibold">{rec.productName}</h3>
                            </div>
                            <span className="caption px-3 py-1" style={{ background: `${color}20`, color, borderRadius: '8px' }}>
                              {priorityLabels[rec.priority]}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="px-4 py-3" style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: '12px' }}>
                              <p className="caption mb-1" style={{ color: T.faint }}>DOZIRANJE</p>
                              <p className="text-2xl font-bold" style={{ color }}>{rec.dosage}</p>
                            </div>
                            <div className="glass-card px-4 py-3">
                              <p className="caption mb-2" style={{ color: T.faint }}>UPUTA</p>
                              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                {rec.instructions}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Insights */}
                  {analysisResult.insights && analysisResult.insights.length > 0 && (
                    <div className="mt-8 glass-card p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" style={{ color: T.cyan }} />
                        Dodatni Savjeti
                      </h3>
                      <div className="space-y-2">
                        {analysisResult.insights.map((insight, idx) => (
                          <p key={idx} className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                            {insight}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <AlternativeProducts recommendations={analysisResult.recommendations} />

                  {/* Order recommended button */}
                  <div className="mt-8">
                    <button
                      onClick={handleOrderRecommended}
                      className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Naruči preporučene proizvode
                    </button>
                    <p className="text-center text-sm mt-2" style={{ color: T.faint }}>
                      Količine su izračunate prema deklaraciji proizvoda. Možete ih promijeniti u košarici.
                    </p>
                  </div>

                  {/* Non-member promo card */}
                  {!isMemberLoggedIn() && (
                    <div className="mt-6 glass-card p-6" style={{ border: `1px solid rgba(92,225,230,0.2)` }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ background: 'rgba(92,225,230,0.12)' }}>
                          <Droplets className="w-5 h-5" style={{ color: T.cyan }} />
                        </div>
                        <h3 className="font-bold text-lg">Spremite ovu analizu</h3>
                      </div>
                      <p className="text-sm mb-4 leading-relaxed" style={{ color: T.muted }}>
                        Besplatnom registracijom čuvate povijest svih analiza, dobivate podsjetnike, 10&nbsp;% popusta na kemiju i opremu (+5&nbsp;% iznad 2.000&nbsp;€) i pregled opreme na vašem bazenu (besplatan uz kupnju od 150 €).
                      </p>
                      <button
                        onClick={() => onRegisterMember?.()}
                        className="w-full py-3 rounded-xl text-black font-bold hover:opacity-90 transition-all mb-2"
                        style={{ background: 'linear-gradient(90deg, #0ABFCF 0%, #5CE1E6 100%)' }}
                      >
                        Besplatna registracija
                      </button>
                      <button
                        onClick={() => onLogin?.()}
                        className="w-full py-2 text-sm font-medium transition-all hover:opacity-80"
                        style={{ color: T.muted }}
                      >
                        Već imam račun – prijava
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
