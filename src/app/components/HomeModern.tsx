import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Droplet, Sparkles, BarChart3, Users, Shield, Zap, ArrowRight, Layers, Globe, ChevronDown, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function HomeModern() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('hr');

  const content = {
    hr: {
      subtitle: 'Profesionalna platforma za upravljanje bazenom s AI inteligencijom i naprednom analizom vode',
      loginBtn: 'Login (Professional)',
      ownerBtn: 'Owner Mode',
      features: [
        { title: 'Analiza Vode', desc: 'Precizna kemijska analiza bazena' },
        { title: 'Pool Visualizer', desc: 'AI vizualizacija bazena u prostoru', badge: 'NOVO' },
        { title: 'Analytics', desc: 'Napredna statistika i izvještaji' },
        { title: 'Klijenti', desc: 'Upravljanje klijentskom bazom' },
        { title: 'Radni Nalozi', desc: 'Kompletan workflow sustav' },
        { title: 'ORP Intelligence', desc: 'Automatska redox optimizacija' }
      ],
      benefits: [
        'Potpuna kontrola nad kvalitetom vode',
        'Realtime notifikacije i upozorenja',
        'AI asistent za profesionalce',
        'Cloud sync svih podataka'
      ]
    },
    en: {
      subtitle: 'Professional pool management platform with AI intelligence and advanced water analysis',
      loginBtn: 'Login (Professional)',
      ownerBtn: 'Owner Mode',
      features: [
        { title: 'Water Analysis', desc: 'Precise pool chemistry analysis' },
        { title: 'Pool Visualizer', desc: 'AI pool visualization in space', badge: 'NEW' },
        { title: 'Analytics', desc: 'Advanced statistics and reports' },
        { title: 'Clients', desc: 'Client database management' },
        { title: 'Work Orders', desc: 'Complete workflow system' },
        { title: 'ORP Intelligence', desc: 'Automatic redox optimization' }
      ],
      benefits: [
        'Complete water quality control',
        'Realtime notifications and alerts',
        'AI assistant for professionals',
        'Cloud sync of all data'
      ]
    },
    it: {
      subtitle: 'Piattaforma professionale per la gestione della piscina con intelligenza AI e analisi avanzata dell\'acqua',
      loginBtn: 'Login (Professionale)',
      ownerBtn: 'Modalità Proprietario',
      features: [
        { title: 'Analisi Acqua', desc: 'Analisi chimica precisa della piscina' },
        { title: 'Pool Visualizer', desc: 'Visualizzazione AI della piscina', badge: 'NUOVO' },
        { title: 'Analytics', desc: 'Statistiche e report avanzati' },
        { title: 'Clienti', desc: 'Gestione database clienti' },
        { title: 'Ordini di Lavoro', desc: 'Sistema workflow completo' },
        { title: 'ORP Intelligence', desc: 'Ottimizzazione redox automatica' }
      ],
      benefits: [
        'Controllo completo della qualità dell\'acqua',
        'Notifiche e avvisi in tempo reale',
        'Assistente AI per professionisti',
        'Sincronizzazione cloud di tutti i dati'
      ]
    }
  };

  const t = content[language as keyof typeof content] || content.hr;
  const features = t.features;
  const featureIcons = [Droplet, Layers, BarChart3, Users, Shield, Zap];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Language Selector - Top Right */}
      <div className="fixed top-6 right-6 z-50 flex gap-2">
        {['hr', 'en', 'it'].map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`w-10 h-10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center ${
              language === lang 
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg' 
                : 'bg-white/5 text-[#D4AF37] border-white/10 hover:border-[#D4AF37]/30'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
          <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute w-64 h-64 bg-purple-500/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          {/* Logo & Title */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                <Droplet className="w-12 h-12 text-[#D4AF37]" />
              </motion.div>
              <h1 className="text-6xl font-black tracking-tighter">
                <span className="text-[#D4AF37]">AQUA</span>
                <span className="text-white">SMART</span>
                <span className="text-slate-400 ml-3 text-4xl">PRO</span>
              </h1>
            </div>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            <button
              onClick={() => navigate('/login')}
              className="group px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#F4C430] text-black font-bold rounded-xl shadow-lg hover:shadow-[#D4AF37]/50 transition-all flex items-center gap-2"
            >
              <Shield className="w-5 h-5" />
              {t.loginBtn}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/owner')}
              className="px-8 py-4 bg-blue-600/20 backdrop-blur-sm text-blue-400 font-semibold rounded-xl border border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-600/30 transition-all flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              {t.ownerBtn}
            </button>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
          >
            {t.benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">{benefit}</p>
              </div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 mb-16"
          >
            {features.map((feature, index) => {
              const Icon = featureIcons[index];
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="relative group"
                >
                  <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-[#D4AF37]/30 transition-all">
                    {feature.badge && (
                      <div className="absolute -top-3 -right-3 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {feature.badge}
                      </div>
                    )}
                    <Icon className="w-8 h-8 text-[#D4AF37] mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center mt-16 pt-8 border-t border-slate-800/50"
          >
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Mondo Acqua d.o.o. • AquaSmart Pro v1.0.0
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}