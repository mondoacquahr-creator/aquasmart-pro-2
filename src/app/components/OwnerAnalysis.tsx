import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Beaker, Droplets, AlertCircle, CheckCircle, AlertTriangle, DollarSign, TrendingUp, TrendingDown, Minus, Calculator, Crown, Settings as SettingsIcon, ChevronRight, Info } from 'lucide-react';
import { dosingEngine } from '../lib/dosing-engine';
import { motion } from 'motion/react';
import { AquaSmartAvatar } from './AquaSmartAvatar';
import { MondoFooter } from './MondoFooter';
import { ContactAgent } from './ContactAgent';
import { useLanguage } from '../lib/languageContext';

export function OwnerAnalysis() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [volume, setVolume] = useState('');
  
  // Dimension calculator
  const [showCalculator, setShowCalculator] = useState(false);
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  
  // System type
  const [systemType, setSystemType] = useState<'none' | 'automatic'>('none');
  
  // Manual test values
  const [ph, setPh] = useState('');
  const [chlorine, setChlorine] = useState('');
  const [alkalinity, setAlkalinity] = useState('');
  const [orp, setOrp] = useState('');
  
  // Automatic system readings
  const [autoPh, setAutoPh] = useState('');
  const [autoChlorine, setAutoChlorine] = useState('');
  const [autoOrp, setAutoOrp] = useState('');
  
  const [results, setResults] = useState<any>(null);
  const [showCalibrationGuide, setShowCalibrationGuide] = useState(false);

  const calibrationGuide = {
    hr: [
      { title: "Pripremite otopine", text: "Za pH sondu koristite pH 7 i pH 4 otopine. Za Redox/ORP koristite 475mV otopinu." },
      { title: "Uđite u servisni meni", text: "Na vašoj automatici pronađite 'Calibration' ili 'Kalibracija' podizbornik." },
      { title: "Čišćenje sonde", text: "Prije kalibracije sondu nježno isperite čistom vodom (nemojte brisati grubim krpama)." },
      { title: "Postupak pH", text: "Uronite sondu u otopinu pH 7. Pričekajte stabilizaciju i potvrdite. Ponovite s otopinom pH 4." },
      { title: "Postupak Redox", text: "Uronite sondu u otopinu 475mV. Pričekajte stabilizaciju i potvrdite." }
    ],
    en: [
      { title: "Prepare solutions", text: "Use pH 7 and pH 4 for pH probe. Use 475mV solution for Redox/ORP." },
      { title: "Service Menu", text: "Find 'Calibration' menu on your controller." },
      { title: "Clean probe", text: "Rinse probe with clean water before calibration (do not wipe with rough cloths)." },
      { title: "pH Process", text: "Dip probe in pH 7. Wait for stability and confirm. Repeat with pH 4." },
      { title: "Redox Process", text: "Dip probe in 475mV solution. Wait for stability and confirm." }
    ]
  }[language === 'hr' ? 'hr' : 'en'];

  const calculateVolume = () => {
    if (length && width && depth) {
      const vol = (parseFloat(length) * parseFloat(width) * parseFloat(depth)).toFixed(2);
      setVolume(vol);
      setShowCalculator(false);
    }
  };

  const handleAnalyze = () => {
    if (!volume || !ph || !chlorine) {
      alert(language === 'hr' ? 'Molimo unesite barem zapreminu, pH i klor' : 'Please enter at least volume, pH and chlorine');
      return;
    }

    const analysis = dosingEngine.analyze({
      volume: parseFloat(volume),
      ph: parseFloat(ph),
      chlorine: parseFloat(chlorine),
      alkalinity: alkalinity ? parseFloat(alkalinity) : undefined,
      orp: orp ? parseFloat(orp) : undefined,
    });
    
    // Check for calibration warnings if automatic system
    const calibrationWarnings = [];
    if (systemType === 'automatic') {
      const phDiff = autoPh && Math.abs(parseFloat(ph) - parseFloat(autoPh));
      const clDiff = autoChlorine && Math.abs(parseFloat(chlorine) - parseFloat(autoChlorine));
      const orpDiff = autoOrp && orp && Math.abs(parseFloat(orp) - parseFloat(autoOrp));
      
      if (phDiff && phDiff > 0.3) {
        calibrationWarnings.push({ type: 'pH', diff: phDiff, auto: parseFloat(autoPh), manual: parseFloat(ph) });
      }
      if (clDiff && clDiff > 0.5) {
        calibrationWarnings.push({ type: 'Klor', diff: clDiff, auto: parseFloat(autoChlorine), manual: parseFloat(chlorine) });
      }
      if (orpDiff && orpDiff > 50) {
        calibrationWarnings.push({ type: 'ORP', diff: orpDiff, auto: parseFloat(autoOrp), manual: parseFloat(orp) });
      }
    }

    setResults({ ...analysis, calibrationWarnings, systemType });
    
    // Scroll to top after analysis
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
      case 'warning': return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
      case 'critical': return 'bg-red-500/10 border-red-500/30 text-red-500';
      default: return 'bg-white/5 border-white/10 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white pb-24 relative overflow-hidden font-sans">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#D4AF37]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <div className="bg-[#0a0c10]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-xl transition-all border border-white/5">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-[#D4AF37]" />
              <h1 className="text-lg font-black uppercase tracking-tight">{language === 'hr' ? 'Analiza vode' : language === 'it' ? 'Analisi Acqua' : 'Water Analysis'}</h1>
            </div>
          </div>
          
          <div className="flex gap-1.5">
            {['hr', 'en', 'it'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang as any)}
                className={`w-9 h-9 rounded-full text-[10px] font-black flex items-center justify-center transition-all border-2 ${
                  language === lang 
                    ? 'bg-[#D4AF37] border-[#D4AF37] text-black' 
                    : 'bg-white/5 border-white/10 text-[#D4AF37] hover:border-[#D4AF37]/30'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8 relative z-10">
        {!results ? (
          <>
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group bg-gradient-to-br from-[#1a1d23] to-[#0a0c10] rounded-[2.5rem] p-10 border border-white/5 overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center shadow-inner">
                  <Droplets className="w-10 h-10 text-blue-400" />
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">Smart Engine</span>
                   </div>
                  <h2 className="text-3xl font-black mb-1 tracking-tighter">
                    {language === 'hr' ? 'Brza analiza' : language === 'it' ? 'Analisi Rapida' : 'Quick Analysis'}
                  </h2>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">
                    {language === 'hr' ? 'Unesite parametre vode' : 'Enter water parameters'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Input Form */}
            <div className="bg-[#1a1d23] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl space-y-8">
              <div>
                <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-6 ml-1">
                  {language === 'hr' ? 'Osnovni podaci' : 'Basic Information'}
                </h3>
                
                {/* System Type Selection */}
                <div className="mb-10 p-6 bg-white/5 rounded-3xl border border-white/10">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">
                    ⚙️ {language === 'hr' ? 'Koristite li automatiku?' : 'Use automatic system?'}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSystemType('none')}
                      className={`py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        systemType === 'none'
                          ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-amber-900/20'
                          : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {language === 'hr' ? 'Ne' : 'No'}
                    </button>
                    <button
                      onClick={() => setSystemType('automatic')}
                      className={`py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        systemType === 'automatic'
                          ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-amber-900/20'
                          : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {language === 'hr' ? 'Da, imam automatiku' : 'Yes, automatic'}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Automatic System Readings */}
                  {systemType === 'automatic' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/20 space-y-6"
                    >
                      <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        🤖 {language === 'hr' ? 'Očitanja sa automatike' : 'Automatic Readings'}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField label="pH Auto" value={autoPh} onChange={setAutoPh} placeholder="7.4" />
                        <InputField label="Klor Auto (mg/L)" value={autoChlorine} onChange={setAutoChlorine} placeholder="1.2" />
                        <InputField label="ORP Auto (mV)" value={autoOrp} onChange={setAutoOrp} placeholder="720" />
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="pt-6 border-t border-white/5">
                    <h4 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      🧪 {systemType === 'automatic' ? (language === 'hr' ? 'Ručno testiranje' : 'Manual Test') : (language === 'hr' ? 'Parametri vode' : 'Water Parameters')}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                        {language === 'hr' ? 'Zapremina bazena (m³)' : 'Pool Volume (m³)'} *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={volume}
                          onChange={(e) => setVolume(e.target.value)}
                          placeholder="48"
                          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCalculator(true)}
                          className="px-5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-2xl border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-all font-black text-[10px] uppercase tracking-widest"
                        >
                          <Calculator className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <InputField label="pH vrijednost *" value={ph} onChange={setPh} placeholder="7.2" />
                    <InputField label="Slobodni klor (mg/L) *" value={chlorine} onChange={setChlorine} placeholder="1.5" />
                    <InputField label="Alkalnost (mg/L) - opc" value={alkalinity} onChange={setAlkalinity} placeholder="100" />
                    <InputField label="ORP / Redox (mV) - opc" value={orp} onChange={setOrp} placeholder="700" />
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  className="w-full mt-10 bg-[#D4AF37] text-black py-5 rounded-[1.5rem] hover:bg-[#c4a132] transition-all shadow-xl shadow-amber-900/10 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
                >
                  <Beaker className="w-5 h-5" />
                  {language === 'hr' ? 'Analiziraj vodu' : language === 'it' ? 'Analizza Acqua' : 'Analyze Water'}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                <strong className="text-gray-300">Napomena:</strong> Rezultati analize su informativnog karaktera. Za potpuno praćenje povijesti i profesionalnu evidenciju, prijavite se kao profesionalac.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-[2.5rem] p-10 border shadow-2xl relative overflow-hidden ${getStatusColor(results.status)}`}
            >
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[60px]"></div>
              <div className="flex flex-col items-center text-center gap-6 relative z-10">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20">
                  {(() => {
                    const StatusIcon = getStatusIcon(results.status);
                    return <StatusIcon className="w-10 h-10" />;
                  })()}
                </div>
                <div>
                  <h2 className="text-3xl font-black mb-1 tracking-tighter uppercase">
                    {results.status === 'ok' && (language === 'hr' ? 'Voda je savršena' : 'Water is Perfect')}
                    {results.status === 'warning' && (language === 'hr' ? 'Potrebna korekcija' : 'Correction Needed')}
                    {results.status === 'critical' && (language === 'hr' ? 'Kritično stanje' : 'Critical Condition')}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">{language === 'hr' ? 'Izvještaj generiran' : 'Report Generated'}</p>
                </div>
              </div>
            </motion.div>

            {/* Parameter Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {ph && (
                <ParameterCard
                  label="pH"
                  current={parseFloat(ph)}
                  optimal="7.2 - 7.6"
                  unit=""
                  minOptimal={7.2}
                  maxOptimal={7.6}
                />
              )}
              {chlorine && (
                <ParameterCard
                  label="Klor"
                  current={parseFloat(chlorine)}
                  optimal="0.5 - 1.5"
                  unit="mg/L"
                  minOptimal={0.5}
                  maxOptimal={1.5}
                />
              )}
              {alkalinity && (
                <ParameterCard
                  label="Alkalnost"
                  current={parseFloat(alkalinity)}
                  optimal="80 - 120"
                  unit="mg/L"
                  minOptimal={80}
                  maxOptimal={120}
                />
              )}
              {orp && (
                <ParameterCard
                  label="ORP"
                  current={parseFloat(orp)}
                  optimal="650 - 750"
                  unit="mV"
                  minOptimal={650}
                  maxOptimal={750}
                />
              )}
            </div>

            {/* Calibration Warnings */}
            {results.calibrationWarnings && results.calibrationWarnings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-[2rem] p-8 text-white shadow-2xl"
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-sm font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {language === 'hr' ? 'Upozorenje - Kalibracija sondi!' : 'Warning - Calibration Needed!'}
                  </h3>
                  <button 
                    onClick={() => setShowCalibrationGuide(true)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] hover:underline"
                  >
                    <Info className="w-4 h-4" />
                    {language === 'hr' ? 'Kako kalibrirati?' : 'How to calibrate?'}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {results.calibrationWarnings.map((warning: any, index: number) => (
                    <div key={index} className="bg-black/20 rounded-2xl p-5 border border-red-500/20">
                      <div className="flex justify-between items-center mb-4">
                         <div className="font-black text-xs uppercase tracking-widest">{warning.type}</div>
                         <div className="text-[10px] font-bold text-red-500/70">Diff: {warning.diff.toFixed(2)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Auto</div>
                          <div className="text-xl font-black">{warning.auto}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Manual</div>
                          <div className="text-xl font-black">{warning.manual}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Maintenance Link */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate('/owner-maintenance')}
              className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6 cursor-pointer hover:bg-blue-500/20 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <SettingsIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-tight">{language === 'hr' ? 'Održavanje bazena' : 'Pool Maintenance'}</h4>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{language === 'hr' ? 'Vodič za usisavanje i pranje' : 'Vacuum and wash guide'}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </motion.div>

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="bg-[#1a1d23] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-8 ml-1">{language === 'hr' ? 'Preporučeni koraci' : 'Recommended Steps'}</h3>
                <div className="space-y-4">
                  {results.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="bg-white/5 rounded-3xl p-6 border border-white/10 group hover:border-[#D4AF37]/30 transition-all">
                      <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-[#D4AF37] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-900/20">
                          <span className="text-black font-black text-lg">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-black text-white text-lg mb-1 tracking-tight">{rec.productName}</div>
                          <div className="text-[#D4AF37] font-black text-sm uppercase tracking-widest mb-3">{rec.dosage}</div>
                          <div className="text-gray-400 text-xs font-medium leading-relaxed">{rec.instructions}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/owner-cost', { state: { results } })}
                className="bg-[#D4AF37] text-black py-5 rounded-[1.5rem] hover:bg-[#c4a132] transition-all shadow-xl shadow-amber-900/10 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
              >
                <DollarSign className="w-5 h-5" />
                {language === 'hr' ? 'Izračunaj trošak' : 'Calculate Cost'}
              </button>
              <button
                onClick={() => setResults(null)}
                className="bg-white/5 text-gray-400 border border-white/10 py-5 rounded-[1.5rem] hover:bg-white/10 transition-all font-black uppercase tracking-[0.2em] text-xs"
              >
                {language === 'hr' ? 'Nova analiza' : 'New Analysis'}
              </button>
            </div>

            {/* Contact Agent */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ContactAgent />
            </motion.div>
          </>
        )}
      </div>

      {/* Footer */}
      <MondoFooter />
      
      {/* Volume Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-[#0a0c10]/90 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1d23] rounded-[2.5rem] p-8 max-w-md w-full border border-white/10 shadow-2xl relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 tracking-tighter uppercase">
              <Calculator className="w-6 h-6 text-[#D4AF37]" />
              {language === 'hr' ? 'Kalkulator zapremine' : 'Volume Calculator'}
            </h3>
            
            <div className="space-y-6 mb-8">
              <InputField label={language === 'hr' ? 'Dužina (m)' : 'Length (m)'} value={length} onChange={setLength} placeholder="8" />
              <InputField label={language === 'hr' ? 'Širina (m)' : 'Width (m)'} value={width} onChange={setWidth} placeholder="4" />
              <InputField label={language === 'hr' ? 'Prosječna dubina (m)' : 'Avg Depth (m)'} value={depth} onChange={setDepth} placeholder="1.5" />
              
              {length && width && depth && (
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-2xl p-6 text-center">
                  <div className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mb-1">{language === 'hr' ? 'Ukupna zapremina' : 'Total Volume'}</div>
                  <div className="text-3xl font-black text-white">
                    {(parseFloat(length) * parseFloat(width) * parseFloat(depth)).toFixed(2)} <span className="text-sm font-bold text-[#D4AF37]">m³</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setShowCalculator(false);
                  setLength('');
                  setWidth('');
                  setDepth('');
                }}
                className="py-4 px-4 bg-white/5 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:border-white/20 transition-all"
              >
                {language === 'hr' ? 'Odustani' : 'Cancel'}
              </button>
              <button
                onClick={calculateVolume}
                disabled={!length || !width || !depth}
                className="py-4 px-4 bg-[#D4AF37] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#c4a132] transition-all shadow-lg shadow-amber-900/10 disabled:opacity-30 disabled:grayscale"
              >
                {language === 'hr' ? 'Primijeni' : 'Apply'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Calibration Guide Modal */}
      {showCalibrationGuide && (
        <div className="fixed inset-0 bg-[#0a0c10]/95 backdrop-blur-2xl flex items-center justify-center z-[100] p-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1d23] border border-[#D4AF37]/30 rounded-[3rem] p-10 max-w-2xl w-full shadow-[0_0_100px_rgba(212,175,55,0.15)] relative max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[80px]"></div>
            
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl border border-[#D4AF37]/30 flex items-center justify-center">
                <SettingsIcon className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">{language === 'hr' ? 'Vodič za kalibraciju' : 'Calibration Guide'}</h3>
                <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-[0.5em]">{language === 'hr' ? 'Preciznost je ključ' : 'Precision is key'}</p>
              </div>
            </div>

            <div className="space-y-6 mb-12">
              {calibrationGuide.map((step: any, idx: number) => (
                <div key={idx} className="flex gap-6 items-start bg-white/5 p-6 rounded-[2rem] border border-white/5 group hover:border-white/10 transition-all">
                  <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center flex-shrink-0 text-black font-black text-lg shadow-lg">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-black text-white text-lg mb-1 tracking-tight">{step.title}</h4>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCalibrationGuide(false)}
              className="w-full bg-[#D4AF37] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#c4a132] transition-all"
            >
              {language === 'hr' ? 'Razumijem' : 'I Understand'}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Helper Input Component
function InputField({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
        {label}
      </label>
      <input
        type="number"
        step="0.1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all font-bold placeholder:text-gray-700"
      />
    </div>
  );
}

// ParameterCard component
function ParameterCard({ label, current, optimal, unit, minOptimal, maxOptimal }: { label: string, current: number, optimal: string, unit: string, minOptimal: number, maxOptimal: number }) {
  const isOptimal = current >= minOptimal && current <= maxOptimal;
  const isTooLow = current < minOptimal;
  const isTooHigh = current > maxOptimal;
  
  let statusColor = 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500';
  let StatusIcon = CheckCircle;
  let statusText = 'Optimal';
  let TrendIcon = Minus;
  
  if (isTooLow) {
    statusColor = 'border-red-500/20 bg-red-500/5 text-red-500';
    StatusIcon = AlertCircle;
    statusText = 'Low';
    TrendIcon = TrendingDown;
  } else if (isTooHigh) {
    statusColor = 'border-red-500/20 bg-red-500/5 text-red-500';
    StatusIcon = AlertCircle;
    statusText = 'High';
    TrendIcon = TrendingUp;
  }

  return (
    <div className={`rounded-3xl p-6 border transition-all ${statusColor}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-current opacity-20`}>
             <StatusIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</div>
            <div className="text-xs font-bold">{statusText}</div>
          </div>
        </div>
        <TrendIcon className="w-5 h-5 opacity-40" />
      </div>
      
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-black text-white">{current}</div>
        <div className="text-xs font-bold text-gray-500">{unit}</div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
         <div className="text-[14px] font-black uppercase tracking-widest text-gray-500">Target</div>
         <div className="text-[16px] font-black text-white">{optimal} {unit}</div>
      </div>
    </div>
  );
}
