import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Droplets, Sparkles, Waves, ChevronRight, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeScreenProps {
  onStart: () => void;
}

export function HomeScreen({ onStart }: HomeScreenProps) {
  const { t, language, setLanguage } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // DEBUG: Force Hrvatski kao default ako nije eksplicitno odabran
    if (!localStorage.getItem('mondo-acqua-language')) {
      setLanguage('hr');
    }
  }, [setLanguage]);

  const languages = [
    { code: 'hr', label: 'Hrvatski' },
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Bubbles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 backdrop-blur-sm"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Wave Pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-64 opacity-10">
          <svg viewBox="0 0 1440 320" className="w-full h-full">
            <motion.path
              fill="url(#wave-gradient)"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,122.7C1248,107,1344,85,1392,74.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              animate={{
                d: [
                  "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,122.7C1248,107,1344,85,1392,74.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,160L48,144C96,128,192,96,288,90.7C384,85,480,107,576,128C672,149,768,171,864,165.3C960,160,1056,128,1152,117.3C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,122.7C1248,107,1344,85,1392,74.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Language Selector - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <div className="flex gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
          <Globe className="w-5 h-5 text-amber-400 my-auto ml-2" />
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                language === lang.code
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl w-full"
        >
          {/* Logo/Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-3xl blur-2xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-amber-500 to-yellow-600 rounded-3xl p-8 shadow-2xl">
                <Waves className="w-20 h-20 md:w-24 md:h-24 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Brand Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-2">
              <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                MONDO ACQUA
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-xl md:text-2xl text-cyan-400 font-light">
              <Sparkles className="w-5 h-5" />
              <span>Pool Design Studio</span>
              <Sparkles className="w-5 h-5" />
            </div>
          </motion.div>

          {/* Glass Card with Description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
              {language === 'hr' && 'Ultra-moderna aplikacija za dizajn bazena'}
              {language === 'en' && 'Ultra-modern pool design application'}
              {language === 'de' && 'Ultramoderne Pool-Design-Anwendung'}
              {language === 'it' && 'Applicazione ultra-moderna per il design di piscine'}
            </h2>
            
            <p className="text-white/70 text-center mb-8 text-lg">
              {language === 'hr' && 'Napredni crop alati • Perspektivna transformacija • Design Canvas • PDF Export'}
              {language === 'en' && 'Advanced crop tools • Perspective transformation • Design Canvas • PDF Export'}
              {language === 'de' && 'Erweiterte Zuschneidewerkzeuge • Perspektivtransformation • Design Canvas • PDF-Export'}
              {language === 'it' && 'Strumenti di ritaglio avanzati • Trasformazione prospettica • Design Canvas • Esportazione PDF'}
            </p>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                {
                  icon: <Droplets className="w-8 h-8 text-cyan-400" />,
                  title: language === 'hr' ? 'Odaberi Prostor' : language === 'en' ? 'Select Space' : language === 'de' ? 'Raum Auswählen' : 'Seleziona Spazio',
                  desc: language === 'hr' ? 'Uploadaj fotografiju' : language === 'en' ? 'Upload photo' : language === 'de' ? 'Foto hochladen' : 'Carica foto',
                },
                {
                  icon: <Waves className="w-8 h-8 text-blue-400" />,
                  title: language === 'hr' ? 'Dodaj Bazen' : language === 'en' ? 'Add Pool' : language === 'de' ? 'Pool Hinzufügen' : 'Aggiungi Piscina',
                  desc: language === 'hr' ? 'Prilagodi poziciju' : language === 'en' ? 'Adjust position' : language === 'de' ? 'Position anpassen' : 'Regola posizione',
                },
                {
                  icon: <Sparkles className="w-8 h-8 text-amber-400" />,
                  title: language === 'hr' ? 'Izvezi Ponudu' : language === 'en' ? 'Export Offer' : language === 'de' ? 'Angebot Exportieren' : 'Esporta Offerta',
                  desc: language === 'hr' ? 'PDF i ispis' : language === 'en' ? 'PDF and print' : language === 'de' ? 'PDF und Druck' : 'PDF e stampa',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all"
                >
                  <div className="flex justify-center mb-3">{feature.icon}</div>
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              onClick={onStart}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-xl py-6 px-8 rounded-2xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group"
            >
              <span>
                {language === 'hr' && 'Započni Dizajn'}
                {language === 'en' && 'Start Design'}
                {language === 'de' && 'Design Starten'}
                {language === 'it' && 'Inizia Design'}
              </span>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="flex flex-col items-center gap-4 text-center text-white/40 text-sm"
          >
            <div>
              <p>© 2026 MONDO ACQUA D.O.O.</p>
              <p className="mt-1">
                {language === 'hr' && 'Profesionalna rješenja za dizajn bazena'}
                {language === 'en' && 'Professional pool design solutions'}
                {language === 'de' && 'Professionelle Pool-Design-Lösungen'}
                {language === 'it' && 'Soluzioni professionali per il design di piscine'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}