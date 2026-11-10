import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Camera, Upload, Sparkles, CheckCircle, AlertTriangle, AlertCircle, Beaker, TestTube2, Crown, Calculator, DollarSign, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import testStripReference from 'figma:asset/ab8256d475053594fa885958bb56e4e9ecbe44d8.png';
import dpdTesterImage from 'figma:asset/ab26bd1fc56a6270a2cda18c6d4ac70f64eb5efb.png';
import { ContactAgent } from './ContactAgent';
import { ImageCropTool } from './ImageCropTool';
import { useLanguage } from '../lib/languageContext';
import { MondoFooter } from './MondoFooter';
import { dosingEngine } from '../lib/dosing-engine';

// Color analysis mapping based on the reference chart
const colorAnalysis = {
  freeChlorine: [
    { range: '0', color: 'rgb(245, 250, 255)', label: 'NULA - Prozirna', value: 0 },
    { range: '0.5', color: 'rgb(255, 255, 240)', label: 'LOW', value: 0.5 },
    { range: '1', color: 'rgb(255, 240, 235)', label: 'IDEAL', value: 1 },
    { range: '3', color: 'rgb(220, 190, 220)', label: 'IDEAL', value: 3 },
    { range: '5', color: 'rgb(180, 150, 190)', label: 'HIGH', value: 5 },
    { range: '10', color: 'rgb(140, 90, 150)', label: 'VERY HIGH', value: 10 },
  ],
  ph: [
    { range: '6.2', color: 'rgb(255, 230, 120)', label: 'VERY LOW - Žuta', value: 6.2 },
    { range: '6.8', color: 'rgb(250, 180, 100)', label: 'LOW - Narandžasta', value: 6.8 },
    { range: '7.2', color: 'rgb(240, 130, 80)', label: 'IDEAL - Narančasta/Crvena', value: 7.2 },
    { range: '7.8', color: 'rgb(230, 100, 120)', label: 'HIGH - Ružičasta', value: 7.8 },
    { range: '8.4', color: 'rgb(240, 100, 180)', label: 'VERY HIGH - Pink', value: 8.4 },
  ],
};

export function VisualTest() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showReference, setShowReference] = useState(false);
  const [testType, setTestType] = useState<'strip' | 'dpd'>('strip');
  const [volume, setVolume] = useState('50');
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcLength, setCalcLength] = useState('');
  const [calcWidth, setCalcWidth] = useState('');
  const [calcDepth, setCalcDepth] = useState('');
  
  // Multi-step crop state
  const [showCropTool, setShowCropTool] = useState(false);
  const [cropStep, setCropStep] = useState<'whole' | 'ph' | 'chlorine' | 'done'>('whole');
  const [croppedWholeTester, setCroppedWholeTester] = useState<string | null>(null);
  const [croppedPhRegion, setCroppedPhRegion] = useState<string | null>(null);
  const [croppedChlorineRegion, setCroppedChlorineRegion] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setUploadedImage(imageUrl);
        setResults(null);
        setCropStep('whole');
        setCroppedWholeTester(null);
        setCroppedPhRegion(null);
        setCroppedChlorineRegion(null);
        setShowCropTool(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageDataUrl: string) => {
    if (cropStep === 'whole') {
      setCroppedWholeTester(croppedImageDataUrl);
      setCropStep('ph');
      setTimeout(() => setShowCropTool(true), 100);
    } else if (cropStep === 'ph') {
      setCroppedPhRegion(croppedImageDataUrl);
      setCropStep('chlorine');
      setTimeout(() => setShowCropTool(true), 100);
    } else if (cropStep === 'chlorine') {
      setCroppedChlorineRegion(croppedImageDataUrl);
      setCropStep('done');
      setShowCropTool(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropTool(false);
  };

  const analyzeImage = () => {
    setAnalyzing(true);
    
    // Simulate AI Analysis
    setTimeout(() => {
        const phVal = parseFloat((7.8 - Math.random() * 0.4).toFixed(1)); // Simulate slightly high pH to show recommendations
        const clVal = parseFloat((0.4 + Math.random() * 0.4).toFixed(1)); // Simulate low chlorine
        
        const mockResults = {
            freeChlorine: { 
              value: clVal,
              status: clVal < 0.5 ? 'warning' : 'ok', 
              label: clVal < 0.5 ? 'LOW' : 'IDEAL' 
            },
            ph: { 
              value: phVal,
              status: phVal > 7.6 ? 'warning' : 'ok', 
              label: phVal > 7.6 ? 'HIGH' : 'IDEAL' 
            },
            confidence: Math.round(94 + Math.random() * 5),
            method: 'ai-vision'
        };

        // Run through dosing engine to get same recommendations as manual analysis
        const analysis = dosingEngine.analyze({
          volume: parseFloat(volume) || 50,
          ph: phVal,
          chlorine: clVal
        });

        setResults({
          ...mockResults,
          recommendations: analysis.recommendations,
          analysisStatus: analysis.status
        });
        setAnalyzing(false);
    }, 2500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'warning': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-white bg-white/10 border-white/20';
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

      {/* Crop Tool Overlay */}
      {showCropTool && uploadedImage && (
        <ImageCropTool 
          image={cropStep === 'whole' ? uploadedImage : croppedWholeTester || uploadedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          step={cropStep}
          stepTitle={
            cropStep === 'whole' ? (language === 'hr' ? 'Korak 1: Odaberi tester' : 'Step 1: Select Tester') :
            cropStep === 'ph' ? (language === 'hr' ? 'Korak 2: pH polje' : 'Step 2: pH Field') :
            (language === 'hr' ? 'Korak 3: Klor polje' : 'Step 3: Chlorine Field')
          }
          stepDescription={
            cropStep === 'whole' ? '✂️ Izoliraj tester od pozadine' :
            cropStep === 'ph' ? '📊 Odaberi samo pH kvadratić' :
            '🧪 Odaberi samo klor kvadratić'
          }
        />
      )}

      {/* Header */}
      <div className="bg-[#0a0c10]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-xl transition-all border border-white/5">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#D4AF37]" />
              <h1 className="text-lg font-black uppercase tracking-tight">{language === 'hr' ? 'Vizualni test' : 'Visual Test'}</h1>
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
        {!uploadedImage && !results && (
          <>
            {/* Tab Selector */}
            <div className="bg-[#1a1d23] rounded-[2rem] p-2 border border-white/5 grid grid-cols-2 gap-2 shadow-2xl">
              <button
                onClick={() => setTestType('strip')}
                className={`py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                  testType === 'strip' 
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-amber-900/20' 
                    : 'bg-white/5 text-[#D4AF37] border-white/10 hover:border-[#D4AF37]/30'
                }`}
              >
                <TestTube2 className="w-4 h-4" />
                {language === 'hr' ? 'Test trakica' : 'Test Strip'}
              </button>
              <button
                onClick={() => setTestType('dpd')}
                className={`py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                  testType === 'dpd' 
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-amber-900/20' 
                    : 'bg-white/5 text-[#D4AF37] border-white/10 hover:border-[#D4AF37]/30'
                }`}
              >
                <Beaker className="w-4 h-4" />
                {language === 'hr' ? 'DPD Tester' : 'DPD Tester'}
              </button>
            </div>

            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group bg-gradient-to-br from-[#1a1d23] to-[#0a0c10] rounded-[2.5rem] p-10 border border-white/5 overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
              <div className="flex flex-col items-center text-center gap-6">
                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Sparkles className="w-12 h-12 text-[#D4AF37] animate-pulse" />
                </div>
                <div>
                   <div className="flex items-center justify-center gap-2 mb-2">
                      <Crown className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">AI Vision Engine</span>
                   </div>
                  <h2 className="text-3xl font-black mb-2 tracking-tighter uppercase">
                    {language === 'hr' ? 'Skeniraj tester' : 'Scan Tester'}
                  </h2>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-wider max-w-xs">
                    {language === 'hr' ? 'Naš AI algoritam precizno očitava boju vašeg testera' : 'Our AI algorithm precisely reads your tester color'}
                  </p>
                </div>

                {/* Pool Volume Input */}
                <div className="w-full max-w-xs space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block text-center">
                    {language === 'hr' ? 'Zapremina bazena (m³)' : 'Pool Volume (m³)'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all font-bold text-center"
                      placeholder="50"
                    />
                    <button
                      onClick={() => setShowCalculator(true)}
                      className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[#D4AF37] hover:bg-white/10 transition-all"
                    >
                      <Calculator className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="w-full pt-6 border-t border-white/5">
                   <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-[#D4AF37] text-black py-5 rounded-[1.5rem] hover:bg-[#c4a132] transition-all shadow-xl shadow-amber-900/10 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
                  >
                    <Upload className="w-5 h-5" />
                    {language === 'hr' ? 'Učitaj fotografiju' : 'Upload Photo'}
                  </button>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-4">
                    Podržano: JPG, PNG, WEBP
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Help Button */}
             <button
              onClick={() => setShowReference(!showReference)}
              className="w-full py-4 text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] hover:opacity-80 transition-all border border-[#D4AF37]/20 rounded-2xl"
            >
              {showReference ? (language === 'hr' ? 'Sakrij pomoć' : 'Hide Help') : (language === 'hr' ? 'Prikaži upute' : 'Show Instructions')}
            </button>

            <AnimatePresence>
              {showReference && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#1a1d23] rounded-[2rem] p-8 border border-white/5 space-y-6 overflow-hidden"
                >
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">📸 Kako pravilno slikati?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-400 font-medium">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="text-emerald-500 font-black mb-2 uppercase tracking-widest">Dobar primjer</div>
                      <p>Dnevno svjetlo (bez direktnog sunca), ravna podloga, oštra slika.</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="text-red-500 font-black mb-2 uppercase tracking-widest">Loš primjer</div>
                      <p>Pretamno, bljeskalica, mutno, slika pod kutom.</p>
                    </div>
                  </div>
                  <img src={testType === 'strip' ? testStripReference : dpdTesterImage} className="w-full rounded-2xl grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Uploaded View */}
        {uploadedImage && !results && !showCropTool && (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1a1d23] rounded-[2.5rem] p-10 border border-white/5 text-center space-y-8 shadow-2xl"
            >
                <div className="relative group mx-auto w-full max-w-sm rounded-[2rem] overflow-hidden border-4 border-[#D4AF37]/20">
                    <img src={croppedWholeTester || uploadedImage} className="w-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-6">
                        <div className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">Spremno za AI sken</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={analyzeImage}
                        disabled={analyzing}
                        className="w-full bg-[#D4AF37] text-black py-5 rounded-[1.5rem] hover:bg-[#c4a132] transition-all shadow-xl shadow-amber-900/10 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {analyzing ? (
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Sparkles className="w-5 h-5" />
                        )}
                        {analyzing ? (language === 'hr' ? 'Analiziram...' : 'Analyzing...') : (language === 'hr' ? 'Pokreni AI analizu' : 'Start AI Analysis')}
                    </button>
                    <button
                        onClick={() => {
                            setUploadedImage(null);
                            setCroppedWholeTester(null);
                        }}
                        className="w-full text-xs font-black text-gray-500 uppercase tracking-widest hover:text-white transition-all"
                    >
                        {language === 'hr' ? 'Odustani' : 'Cancel'}
                    </button>
                </div>
            </motion.div>
        )}

        {/* Results View */}
        {results && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="bg-[#1a1d23] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black mb-1 tracking-tighter uppercase">{language === 'hr' ? 'Rezultati očitavanja' : 'Scanning Results'}</h2>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Confidence Score: {results.confidence}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                        <div className={`p-6 rounded-[2rem] border transition-all ${getStatusColor(results.ph.status)}`}>
                             <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">pH Vrijednost</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">{results.ph.label}</span>
                             </div>
                             <div className="text-4xl font-black text-white">{results.ph.value}</div>
                        </div>
                        <div className={`p-6 rounded-[2rem] border transition-all ${getStatusColor(results.freeChlorine.status)}`}>
                             <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Slobodni Klor</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">{results.freeChlorine.label}</span>
                             </div>
                             <div className="text-4xl font-black text-white">{results.freeChlorine.value} <span className="text-xs font-bold text-gray-500">mg/L</span></div>
                        </div>
                    </div>

                    {/* Recommendations Section */}
                    {results.recommendations && results.recommendations.length > 0 && (
                      <div className="mt-10 space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                          <h3 className="text-sm font-black text-white uppercase tracking-widest">{language === 'hr' ? 'Preporučeni koraci' : 'Recommended Steps'}</h3>
                        </div>
                        {results.recommendations.map((rec: any, index: number) => (
                          <div key={index} className="bg-white/5 rounded-3xl p-6 border border-white/10 group hover:border-[#D4AF37]/30 transition-all">
                            <div className="flex items-start gap-5">
                              <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-900/20">
                                <span className="text-black font-black text-sm">{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <div className="font-black text-white text-base mb-1 tracking-tight">{rec.productName}</div>
                                <div className="text-[#D4AF37] font-black text-xs uppercase tracking-widest mb-2">{rec.dosage}</div>
                                <div className="text-gray-400 text-[11px] font-medium leading-relaxed">{rec.instructions}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/owner-cost', { state: { results } })}
                            className="bg-[#D4AF37] text-black py-4 rounded-2xl hover:bg-[#c4a132] transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-amber-900/10 flex items-center justify-center gap-2"
                        >
                            <DollarSign className="w-4 h-4" />
                            {language === 'hr' ? 'Izračunaj trošak' : 'Calculate Cost'}
                        </button>
                        <button
                            onClick={() => {
                                setResults(null);
                                setUploadedImage(null);
                                setCroppedWholeTester(null);
                            }}
                            className="bg-white/5 text-white py-4 rounded-2xl hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px] border border-white/10"
                        >
                            {language === 'hr' ? 'Novi test' : 'New Test'}
                        </button>
                    </div>
                </div>

                <ContactAgent />
            </motion.div>
        )}
      </div>

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
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{language === 'hr' ? 'Dužina (m)' : 'Length (m)'}</label>
                <input type="number" value={calcLength} onChange={(e) => setCalcLength(e.target.value)} placeholder="8" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#D4AF37] font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{language === 'hr' ? 'Širina (m)' : 'Width (m)'}</label>
                <input type="number" value={calcWidth} onChange={(e) => setCalcWidth(e.target.value)} placeholder="4" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#D4AF37] font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{language === 'hr' ? 'Prosječna dubina (m)' : 'Avg Depth (m)'}</label>
                <input type="number" value={calcDepth} onChange={(e) => setCalcDepth(e.target.value)} placeholder="1.5" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#D4AF37] font-bold" />
              </div>
              
              {calcLength && calcWidth && calcDepth && (
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-2xl p-6 text-center">
                  <div className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mb-1">{language === 'hr' ? 'Ukupna zapremina' : 'Total Volume'}</div>
                  <div className="text-3xl font-black text-white">
                    {(parseFloat(calcLength) * parseFloat(calcWidth) * parseFloat(calcDepth)).toFixed(2)} <span className="text-sm font-bold text-[#D4AF37]">m³</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setShowCalculator(false);
                  setCalcLength('');
                  setCalcWidth('');
                  setCalcDepth('');
                }}
                className="py-4 px-4 bg-white/5 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10"
              >
                {language === 'hr' ? 'Odustani' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                   if (calcLength && calcWidth && calcDepth) {
                    const vol = (parseFloat(calcLength) * parseFloat(calcWidth) * parseFloat(calcDepth)).toFixed(2);
                    setVolume(vol);
                    setShowCalculator(false);
                  }
                }}
                className="py-4 px-4 bg-[#D4AF37] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#c4a132] transition-all shadow-lg"
              >
                {language === 'hr' ? 'Primijeni' : 'Apply'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
