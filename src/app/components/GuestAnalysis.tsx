import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Droplet, AlertCircle, TrendingUp, Zap, Package, CheckCircle, ShoppingCart, Droplets } from 'lucide-react';
import { analyzeWater, IDEAL_RANGES } from '../lib/waterAnalysis';
import { ReadingCard } from './ReadingCard';
import { calculateTreatmentCost } from '../lib/productPrices';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/languageContext';
import { addToCart, addRecommended, useCart } from '../lib/mondoShop';
import { T } from '../lib/theme';
import { WaterBackground } from './WaterBackground';
import { memberApi, isMemberLoggedIn } from '../lib/memberApi';

interface GuestAnalysisProps {
  onBack?: () => void;
  onRegister?: () => void;
  onRegisterMember?: () => void;
  onLogin?: () => void;
  onOpenShop?: () => void;
}

export function GuestAnalysis({ onBack, onRegister, onRegisterMember, onLogin, onOpenShop }: GuestAnalysisProps) {
  const { t, language } = useLanguage();
  const cart = useCart();
  const [poolVolume, setPoolVolume] = useState('');
  const [parameters, setParameters] = useState({
    pH: '',
    freeChlorine: '',
    alkalinity: '',
    hardness: '',
    temperature: '',
    orp: '',
  });
  const [result, setResult] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const savedForResult = useRef<any>(null);

  // Prefill pool volume from member profile on mount
  useEffect(() => {
    if (!isMemberLoggedIn()) return;
    memberApi.getMemberMe().then(data => {
      if (data.pool?.volume && !poolVolume) {
        setPoolVolume(String(data.pool.volume));
      }
    }).catch(() => {});
  }, []);

  // Auto-save analysis for members (once per result)
  useEffect(() => {
    if (!result || !showResults || !isMemberLoggedIn()) return;
    if (savedForResult.current === result) return;
    savedForResult.current = result;
    setSaveStatus('saving');
    memberApi.saveMemberAnalysis({
      pH: parameters.pH ? parseFloat(parameters.pH) : undefined,
      freeChlorine: parameters.freeChlorine ? parseFloat(parameters.freeChlorine) : undefined,
      alkalinity: parameters.alkalinity ? parseFloat(parameters.alkalinity) : undefined,
      hardness: parameters.hardness ? parseFloat(parameters.hardness) : undefined,
      temperature: parameters.temperature ? parseFloat(parameters.temperature) : undefined,
      orp: parameters.orp ? parseFloat(parameters.orp) : undefined,
      volume: poolVolume ? parseFloat(poolVolume) : undefined,
      status: result.status,
      message: result.message,
      issues: result.issues,
      recommendations: (result.recommendations || []).map((r: any) => ({
        productName: r.productName,
        dosage: r.dosage,
        instructions: r.instructions,
      })),
    }).then(() => setSaveStatus('saved')).catch(() => setSaveStatus('error'));
  }, [result, showResults]);

  const handleAnalyze = () => {
    if (!poolVolume || !parameters.pH || (!parameters.freeChlorine && !parameters.orp)) {
      alert(
        language === 'hr'
          ? 'Molimo unesite volumen bazena, pH te slobodni klor ili Redox (ORP)'
          : language === 'it'
          ? 'Si prega di inserire il volume della piscina, il pH e il cloro libero o il redox (ORP)'
          : 'Please enter pool volume, pH and free chlorine or redox (ORP)'
      );
      return;
    }

    const analysisParams = {
      pH: parameters.pH ? parseFloat(parameters.pH) : undefined,
      freeChlorine: parameters.freeChlorine ? parseFloat(parameters.freeChlorine) : undefined,
      alkalinity: parameters.alkalinity ? parseFloat(parameters.alkalinity) : undefined,
      hardness: parameters.hardness ? parseFloat(parameters.hardness) : undefined,
      temperature: parameters.temperature ? parseFloat(parameters.temperature) : undefined,
      orp: parameters.orp ? parseFloat(parameters.orp) : undefined,
    };

    const analysisResult = analyzeWater(analysisParams, parseFloat(poolVolume), '');
    setResult(analysisResult);
    setShowResults(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'from-green-500 to-emerald-500';
      case 'warning': return 'from-yellow-500 to-orange-500';
      case 'critical': return 'from-red-500 to-rose-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return 'ℹ️';
    }
  };

  const getMatchedProducts = () => {
    if (!result?.recommendations?.length) return [];
    return calculateTreatmentCost(result.recommendations).items;
  };

  const handleOrderRecommended = () => {
    if (!result) return;
    const cost = calculateTreatmentCost(result.recommendations);
    const items = cost.items
      .filter((item: any) => item.product.id !== 'unknown')
      .map((item: any) => ({ productId: item.product.id, quantity: item.quantity }));

    let summary = `Volumen ${poolVolume} m³, pH ${parameters.pH}, slobodni klor ${parameters.freeChlorine} mg/l`;
    if (parameters.alkalinity) summary += `, alkalnost ${parameters.alkalinity} mg/l`;

    addRecommended(items, summary);
    onOpenShop?.();
  };

  if (showResults && result) {
    const matchedProducts = getMatchedProducts();

    return (
      <div className="min-h-screen relative overflow-hidden pb-16" style={{ background: T.pageBg }}>
        <WaterBackground />
        {/* Header */}
        <div className="backdrop-blur-md border-b sticky top-0 z-20" style={{ background: T.cardBg, borderColor: 'rgba(120,220,255,0.12)' }}>
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => setShowResults(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              style={{ color: T.cyan }}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white">{t('guestAnalysis.resultsTitle')}</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {/* Member save banner */}
          {isMemberLoggedIn() && saveStatus !== 'idle' && (
            <div className="px-4 py-2 rounded-xl text-sm font-medium" style={
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

          {/* Vizualna kartica očitanja */}
          <ReadingCard
            values={{ ph: parameters.pH, freeChlorine: parameters.freeChlorine, orp: parameters.orp, alkalinity: parameters.alkalinity, hardness: parameters.hardness, temperature: parameters.temperature }}
            volume={poolVolume}
            recommendations={result.recommendations || []}
          />

          {/* Status Card */}
          <div className={`relative overflow-hidden bg-gradient-to-br ${getStatusColor(result.status)} rounded-3xl p-6 text-white shadow-2xl`}>
            <div className="relative z-10">
              <div className="text-5xl mb-3">{getStatusIcon(result.status)}</div>
              <h2 className="text-2xl font-bold mb-2">{result.message}</h2>
              {result.issues.length > 0 && (
                <div className="space-y-1 mt-4">
                  {result.issues.map((issue: string, idx: number) => (
                    <p key={idx} className="text-sm opacity-90">• {issue}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommendations + Order */}
          {matchedProducts.length > 0 && (
            <div className="rounded-2xl p-6 backdrop-blur-xl" style={{ background: T.cardBg, border: T.cardBorder, boxShadow: T.cardShadow }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5" style={{ color: T.cyan }} />
                  {t('guestAnalysis.treatmentRec')}
                </h3>
                <span className="text-xs px-3 py-1 rounded-full" style={{ color: T.faint, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {language === 'hr' ? 'Tap za narudžbu' : 'Tap to order'}
                </span>
              </div>

              <div className="space-y-3">
                {matchedProducts.map((item: any, idx: number) => {
                  const rec = (result.recommendations.find((r: any) => r.productName === item.productType) ?? result.recommendations[idx]) as any;
                  const inCart = cart.items.find((c) => c.productId === item.product.id);
                  const recDosage = rec?.dosage || item.quantityText;

                  return (
                    <motion.div
                      key={item.productName + idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="rounded-2xl overflow-hidden" style={{ background: 'rgba(10,40,52,0.4)', border: T.cardBorder }}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(92,225,230,0.15)' }}>
                              <Package className="w-4 h-4" style={{ color: T.cyan }} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-white text-sm leading-tight">{item.productName}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{item.product.size} · Ivero</div>
                              <div className="text-xs mt-1 font-medium" style={{ color: T.cyan }}>
                                {language === 'hr' ? 'Potrebno:' : 'Required:'} {recDosage}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-white font-bold">€{item.product.priceEUR.toFixed(2)}</div>
                            <div className="text-xs text-gray-400">{item.quantityText}</div>
                          </div>
                        </div>

                        {rec?.instructions && (
                          <p className="text-xs text-gray-400 mt-2 pl-12 leading-relaxed">{rec.instructions}</p>
                        )}
                      </div>

                      {/* Add to cart strip */}
                      <div className="border-t border-white/5 px-4 py-3 bg-white/[0.02] flex items-center justify-between gap-3">
                        <div className="text-xs text-gray-500">
                          {item.quantity}x {item.product.size} ·{' '}
                          <span className="text-white/70 font-medium">€{item.totalCost.toFixed(2)}</span>
                        </div>
                        {inCart ? (
                          <span className="flex items-center gap-1.5 text-[#2EFF88] text-sm font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            {language === 'hr' ? '✓ U košarici' : '✓ In cart'}
                          </span>
                        ) : (
                          <button
                            onClick={() => addToCart(item.product.id, item.quantity)}
                            className="flex items-center gap-1.5 text-black px-3 py-1.5 rounded-lg font-semibold text-xs hover:opacity-90 transition-colors"
                            style={{ background: T.accent }}
                          >
                            <ShoppingCart className="w-3 h-3" />
                            {language === 'hr' ? 'Dodaj u narudžbu' : language === 'it' ? 'Aggiungi' : language === 'de' ? 'Hinzufügen' : 'Add to order'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {result.treatmentCost && (
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-sm text-gray-400">{language === 'hr' ? 'Ukupni trošak tretmana' : 'Total treatment cost'}</span>
                  <div className="text-right">
                    <div className="text-white font-bold">€{result.treatmentCost.totalEUR.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">{result.treatmentCost.totalHRK.toFixed(2)} kn</div>
                  </div>
                </div>
              )}

              {/* Order all recommended */}
              <div className="mt-5">
                <button
                  onClick={handleOrderRecommended}
                  className="w-full text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                  style={{ background: T.accent, boxShadow: '0 8px 30px rgba(79,195,240,0.35)' }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {language === 'hr' ? 'Naruči preporučene proizvode' : 'Order recommended products'}
                </button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  Količine su izračunate prema deklaraciji proizvoda. Možete ih promijeniti u košarici.
                </p>
              </div>
            </div>
          )}

          {/* Fallback: no matched products */}
          {matchedProducts.length === 0 && result.recommendations.length > 0 && (
            <div className="rounded-2xl p-6 backdrop-blur-xl" style={{ background: T.cardBg, border: T.cardBorder, boxShadow: T.cardShadow }}>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-white">
                <Zap className="w-5 h-5" style={{ color: T.cyan }} />
                {t('guestAnalysis.treatmentRec')}
              </h3>
              <div className="space-y-3">
                {result.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="rounded-xl p-4" style={{ background: 'rgba(10,40,52,0.4)', border: T.cardBorder }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="font-semibold text-white">{rec.productName}</div>
                      <div className="font-bold whitespace-nowrap" style={{ color: T.cyan }}>{rec.dosage}</div>
                    </div>
                    <p className="text-sm text-gray-400">{rec.instructions}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          {result.insights.length > 0 && (
            <div className="rounded-2xl p-6 backdrop-blur-xl" style={{ background: T.cardBg, border: T.cardBorder, boxShadow: T.cardShadow }}>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5" style={{ color: T.cyan }} />
                {t('guestAnalysis.tips')}
              </h3>
              <div className="space-y-2">
                {result.insights.map((insight: string, idx: number) => (
                  <div key={idx} className="text-sm rounded-lg p-3" style={{ color: T.muted, background: 'rgba(92,225,230,0.06)', border: '1px solid rgba(92,225,230,0.12)' }}>
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Non-member promo card */}
          {!isMemberLoggedIn() && (
            <div className="rounded-2xl p-6 backdrop-blur-xl" style={{ background: T.cardBg, border: `1px solid rgba(92,225,230,0.2)`, boxShadow: T.cardShadow }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ background: 'rgba(92,225,230,0.12)' }}>
                  <Droplets className="w-5 h-5" style={{ color: T.cyan }} />
                </div>
                <h3 className="font-bold text-lg text-white">Spremite ovu analizu</h3>
              </div>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: T.muted }}>
                Besplatnom registracijom čuvate povijest svih analiza, dobivate podsjetnike, 10&nbsp;% popusta na kemiju i opremu (+5&nbsp;% iznad 2.000&nbsp;€) i pregled opreme na vašem bazenu (besplatan uz kupnju od 150 €).
              </p>
              <button
                onClick={() => (onRegisterMember ?? onRegister)?.()}
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-8" style={{ background: T.pageBg }}>
      <WaterBackground />
      {/* Header */}
      <div className="backdrop-blur-md border-b sticky top-0 z-10" style={{ background: T.cardBg, borderColor: 'rgba(120,220,255,0.12)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => onBack?.()}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            style={{ color: T.cyan }}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Droplet className="w-6 h-6" style={{ color: T.cyan }} />
            <h1 className="text-xl font-bold text-white">{t('guestAnalysis.title')}</h1>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 pt-6">
        {/* Info Card */}
        <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(92,225,230,0.06)', border: '1px solid rgba(92,225,230,0.2)' }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: T.cyan }} />
            <div className="text-sm" style={{ color: T.muted }}>
              <p className="font-semibold mb-1" style={{ color: T.cyan }}>{t('guestAnalysis.infoTitle')}</p>
              <p>{t('guestAnalysis.infoDesc')}</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 space-y-5 backdrop-blur-xl"
          style={{ background: T.cardBg, border: T.cardBorder, boxShadow: T.cardShadow }}
        >
          {/* Pool Volume */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('guestAnalysis.poolVolume')} *
            </label>
            <input
              type="number"
              value={poolVolume}
              onChange={(e) => setPoolVolume(e.target.value)}
              className="w-full px-4 py-3 text-white rounded-xl transition-all"
              style={{ background: T.inputBg, border: T.inputBorder, fontSize: '16px', outline: 'none' }}
              placeholder="50"
              required
            />
          </div>

          {/* pH */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('guestAnalysis.phValue')} *
              <span className="text-xs text-gray-500 ml-2">({t('guestAnalysis.ideal')}: {IDEAL_RANGES.pH.min}-{IDEAL_RANGES.pH.max})</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={parameters.pH}
              onChange={(e) => setParameters({ ...parameters, pH: e.target.value })}
              className="w-full px-4 py-3 text-white rounded-xl transition-all"
              style={{ background: T.inputBg, border: T.inputBorder, fontSize: '16px', outline: 'none' }}
              placeholder="7.4"
              required
            />
          </div>

          {/* Free Chlorine */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('guestAnalysis.freeChlorine')} *
              <span className="text-xs text-gray-500 ml-2">({t('guestAnalysis.ideal')}: {IDEAL_RANGES.freeChlorine.min}-{IDEAL_RANGES.freeChlorine.max})</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={parameters.freeChlorine}
              onChange={(e) => setParameters({ ...parameters, freeChlorine: e.target.value })}
              className="w-full px-4 py-3 text-white rounded-xl transition-all"
              style={{ background: T.inputBg, border: T.inputBorder, fontSize: '16px', outline: 'none' }}
              placeholder="1.5"
              required
            />
          </div>

          {/* Optional Parameters */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm font-medium text-gray-300 mb-4">{t('guestAnalysis.optionalParams')}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {language === 'hr' ? 'Alkalnost' : language === 'it' ? 'Alcalinità' : 'Alkalinity'} (mg/L)
                </label>
                <input
                  type="number"
                  step="1"
                  value={parameters.alkalinity}
                  onChange={(e) => setParameters({ ...parameters, alkalinity: e.target.value })}
                  className="w-full px-4 py-3 text-white rounded-xl transition-all"
              style={{ background: T.inputBg, border: T.inputBorder, fontSize: '16px', outline: 'none' }}
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {language === 'hr' ? 'Tvrdoća' : language === 'it' ? 'Durezza' : 'Hardness'} (mg/L)
                  <span className="text-xs text-gray-500 ml-2">({t('guestAnalysis.ideal')}: {IDEAL_RANGES.hardness.min}-{IDEAL_RANGES.hardness.max})</span>
                </label>
                <input
                  type="number"
                  step="1"
                  value={parameters.hardness}
                  onChange={(e) => setParameters({ ...parameters, hardness: e.target.value })}
                  className="w-full px-4 py-3 text-white rounded-xl transition-all"
              style={{ background: T.inputBg, border: T.inputBorder, fontSize: '16px', outline: 'none' }}
                  placeholder="300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {language === 'hr' ? 'Temperatura' : language === 'it' ? 'Temperatura' : 'Temperature'} (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={parameters.temperature}
                  onChange={(e) => setParameters({ ...parameters, temperature: e.target.value })}
                  className="w-full px-4 py-3 text-white rounded-xl transition-all"
              style={{ background: T.inputBg, border: T.inputBorder, fontSize: '16px', outline: 'none' }}
                  placeholder="24"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  ORP / Redox (mV)
                  <span className="text-xs text-gray-500 ml-2">({t('guestAnalysis.ideal')}: {IDEAL_RANGES.orp.min}-{IDEAL_RANGES.orp.max})</span>
                </label>
                <input
                  type="number"
                  step="1"
                  value={parameters.orp}
                  onChange={(e) => setParameters({ ...parameters, orp: e.target.value })}
                  className="w-full px-4 py-3 text-white rounded-xl transition-all"
              style={{ background: T.inputBg, border: T.inputBorder, fontSize: '16px', outline: 'none' }}
                  placeholder="700"
                />
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            className="w-full text-black py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            style={{ background: T.accent, boxShadow: '0 8px 30px rgba(79,195,240,0.35)' }}
          >
            <Zap className="w-5 h-5" />
            {t('guestAnalysis.analyzeBtn')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
