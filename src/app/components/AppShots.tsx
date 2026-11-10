import { motion, AnimatePresence } from 'motion/react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Shield, Zap, Activity, Database, Eye, 
  Cloud, FileText, QrCode, Globe, Box,
  Play, Pause, SkipBack, SkipForward, ArrowLeft,
  Volume2, VolumeX
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useLanguage } from '../lib/languageContext';
import { useNavigate } from 'react-router';

const SHOTS_DATA = (t: any) => [
  {
    id: 'hero',
    title: "ACQUASMART",
    subtitle: t.subtitle,
    image: "https://images.unsplash.com/photo-1763479142885-47f05d01cad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzd2ltbWluZyUyMHBvb2wlMjBleHRlcmlvcnxlbnwxfHx8fDE3NzE5NDc0OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    accent: "#D4AF37",
    icon: Shield,
    tag: t.title,
    desc: "THE NEW STANDARD"
  },
  {
    id: 'pool',
    title: "POOL VISUALIZER",
    subtitle: t.poolViz,
    image: "https://images.unsplash.com/photo-1762917903587-77c20dcbbbc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb29sJTIwd2F0ZXIlMjBjcnlzdGFsJTIwY2xlYXIlMjBibHVlfGVufDF8fHx8MTc3MTk0NzQ5N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    accent: "#8B5CF6",
    icon: Eye,
    tag: "AI TECHNOLOGY",
    desc: t.poolDesc
  },
  {
    id: 'analysis',
    title: "WATER ANALYSIS",
    subtitle: t.analysis,
    image: "https://images.unsplash.com/photo-1628863353691-0071c8c1874c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMHRlc3RpbmclMjBjaGVtaXN0cnklMjBsYWJvcmF0b3J5fGVufDF8fHx8MTc3MTk0NzQ5N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    accent: "#3B82F6",
    icon: Zap,
    tag: "CHEMISTRY ENGINE",
    desc: t.analysisDesc
  },
  {
    id: 'warehouse',
    title: "SMART ASSETS",
    subtitle: t.inventory,
    image: "https://images.unsplash.com/photo-1768796373360-95d80c5830fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBpbnZlbnRvcnklMjBtYW5hZ2VtZW50JTIwbW9kZXJufGVufDF8fHx8MTc3MTk0NzQ5OHww&ixlib=rb-4.1.0&q=80&w=1080",
    accent: "#10B981",
    icon: Box,
    tag: "LOGISTICS 4.0",
    desc: t.invDesc
  },
  {
    id: 'analytics',
    title: "ELITE DATA",
    subtitle: t.analytics,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwYW5hbHl0aWNzJTIwZGFzaGJvYXJkJTIwY2hhcnRzfGVufDF8fHx8MTc3MTgyMzMwM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    accent: "#F59E0B",
    icon: Activity,
    tag: "INTELLIGENCE",
    desc: t.anaDesc
  }
];

export function AppShots() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const duration = 6000; // 6 seconds per shot

  const t = {
    hr: {
      title: "PREMIUM ISKUSTVO",
      subtitle: "Budućnost upravljanja bazenima",
      ai: "AI VISION ENGINE",
      aiDesc: "Analiza boja i kemijskih parametara u realnom vremenu putem neuralne mreže.",
      inventory: "WAREHOUSE 4.0",
      invDesc: "QR praćenje kemikalija i automatsko predviđanje potrošnje.",
      analytics: "ELITE ANALYTICS",
      anaDesc: "Duboki uvid u povijest parametara i ORP inteligencija.",
      sync: "HYBRID SYNC",
      syncDesc: "Besprimjerna sinkronizacija podataka u stvarnom vremenu.",
      pdf: "AUTOMATED PDF",
      pdfDesc: "Generiranje luksuznih izvještaja jednim dodirom.",
      return: "Povratak na početnu",
      next: "Sljedeći",
      prev: "Prethodni",
      poolViz: "VIZUALIZACIJA BAZENA",
      poolDesc: "Real-time vizualizacija stanja bazena putem AI tehnologije.",
      analysis: "ANALIZA VODE",
      analysisDesc: "Automatska analiza kemijskih parametara vode."
    },
    en: {
      title: "PREMIUM EXPERIENCE",
      subtitle: "The Future of Pool Management",
      ai: "AI VISION ENGINE",
      aiDesc: "Real-time color and chemical parameter analysis via neural networks.",
      inventory: "WAREHOUSE 4.0",
      invDesc: "QR chemical tracking and automated consumption forecasting.",
      analytics: "ELITE ANALYTICS",
      anaDesc: "Deep insights into parameter history and ORP intelligence.",
      sync: "HYBRID SYNC",
      syncDesc: "Flawless real-time data synchronization across devices.",
      pdf: "AUTOMATED PDF",
      pdfDesc: "Generate luxury professional reports with a single touch.",
      return: "Return Home",
      next: "Next",
      prev: "Previous",
      poolViz: "POOL VISUALIZER",
      poolDesc: "Real-time pool state visualization using AI technology.",
      analysis: "WATER ANALYSIS",
      analysisDesc: "Automated analysis of water chemical parameters."
    },
    it: {
      title: "ESPERIENZA PREMIUM",
      subtitle: "Il Futuro della Gestione Piscine",
      ai: "AI VISION ENGINE",
      aiDesc: "Analisi dei colori e dei parametri chimici in tempo reale tramite reti neurali.",
      inventory: "MAGAZZINO 4.0",
      invDesc: "Tracciamento chimico QR e previsione automatica dei consumi.",
      analytics: "ANALITICA ELITE",
      anaDesc: "Approfondimenti sulla cronologia dei parametri e intelligenza ORP.",
      sync: "SYNC IBRIDO",
      syncDesc: "Sincronizzazione dei dati in tempo reale senza interruzioni.",
      pdf: "PDF AUTOMATIZZATO",
      pdfDesc: "Genera report professionali di lusso con un solo tocco.",
      return: "Torna alla Home",
      next: "Avanti",
      prev: "Indietro",
      poolViz: "VIZUALIZZATORE DI POOL",
      poolDesc: "Visualizzazione in tempo reale dello stato della piscina tramite tecnologia AI.",
      analysis: "ANALISI DELL'ACQUA",
      analysisDesc: "Analisi automatica dei parametri chimici dell'acqua."
    }
  }[language === 'it' ? 'it' : language === 'hr' ? 'hr' : 'en'];

  const shots = SHOTS_DATA(t);

  const nextShot = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % shots.length);
    setProgress(0);
  }, [shots.length]);

  const prevShot = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + shots.length) % shots.length);
    setProgress(0);
  }, [shots.length]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextShot();
            return 0;
          }
          return prev + (100 / (duration / 50));
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, nextShot]);

  const currentShot = shots[currentIndex];

  return (
    <div className="relative min-h-screen bg-[#030213] text-white overflow-hidden font-sans">
      {/* Background Cinematic Layer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentShot.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.4, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <ImageWithFallback 
            src={currentShot.image} 
            alt={currentShot.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030213] via-[#030213]/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Interface Overlays */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Bar */}
        <div className="p-8 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-white transition-colors">
              {t.return}
            </span>
          </motion.button>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">LIVE PRESENTATION</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex items-center justify-center px-12 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentShot.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "anticipate" }}
              className="max-w-5xl w-full text-center"
            >
              <div className="inline-flex items-center gap-4 mb-10">
                <currentShot.icon className="w-6 h-6" style={{ color: currentShot.accent }} />
                <span className="text-xs font-black uppercase tracking-[0.5em]" style={{ color: currentShot.accent }}>
                  {currentShot.tag}
                </span>
              </div>

              <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter mb-6 italic leading-none">
                {currentShot.title.split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? 'text-[#D4AF37]' : ''}>{word} </span>
                ))}
              </h1>

              <p className="text-gray-400 text-xl md:text-3xl font-light uppercase tracking-[0.3em] mb-12">
                {currentShot.subtitle}
              </p>

              <p className="max-w-2xl mx-auto text-gray-500 text-lg font-medium leading-relaxed italic">
                {currentShot.desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Side Nav Buttons (Floating) */}
          <button 
            onClick={prevShot}
            className="absolute left-8 top-1/2 -translate-y-1/2 p-4 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all group"
          >
            <SkipBack className="w-8 h-8 group-active:scale-90" />
          </button>
          <button 
            onClick={nextShot}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-4 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all group"
          >
            <SkipForward className="w-8 h-8 group-active:scale-90" />
          </button>
        </div>

        {/* Bottom Navigation & Controls */}
        <div className="p-12 bg-gradient-to-t from-black/80 to-transparent">
          {/* Progress Markers */}
          <div className="flex gap-2 mb-8">
            {shots.map((_, i) => (
              <div 
                key={i} 
                className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden"
              >
                <motion.div 
                  className="h-full bg-[#D4AF37]"
                  initial={{ width: "0%" }}
                  animate={{ 
                    width: i === currentIndex ? `${progress}%` : i < currentIndex ? "100%" : "0%"
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-black" /> : <Play className="w-8 h-8 fill-black ml-1" />}
              </button>
              
              <div className="hidden md:block">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Current Segment</div>
                <div className="text-lg font-black uppercase italic">{currentShot.title}</div>
              </div>
            </div>

            <div className="flex items-center gap-12">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Technology</div>
                <div className="text-sm font-black text-[#D4AF37] uppercase tracking-widest">ELITE B2B STACK</div>
              </div>
              
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                <div className="text-sm font-black">0{currentIndex + 1}</div>
                <div className="h-4 w-px bg-white/20" />
                <div className="text-sm font-black text-gray-500">0{shots.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient Visuals */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[150px]" />
      </div>
    </div>
  );
}