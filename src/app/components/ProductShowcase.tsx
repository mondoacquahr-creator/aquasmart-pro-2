import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import {
  X, ChevronLeft, ChevronRight,
  Droplets, BeakerIcon, ShoppingCart, MapPin,
  Users, FileText, Package, BarChart3, Warehouse,
  Sparkles, Zap, TrendingUp, DollarSign, Clock, Shield,
  Check, Lock, Unlock, ArrowRight, Play, Pause,
  Target, Award, Settings, Database, Video
} from 'lucide-react';
import { T } from '../lib/theme';
import { WaterBackground } from './WaterBackground';

interface ProductShowcaseProps {
  onClose: () => void;
  onNavigate: (page: 'visualizer' | 'analysis' | 'products' | 'free-portal' | 'pro-portal' | 'register') => void;
}

export function ProductShowcase({ onClose, onNavigate }: ProductShowcaseProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });

  const sections = [
    { id: 0, title: 'Početak', color: T.cyan },
    { id: 1, title: 'Funkcije', color: T.cyan },
    { id: 2, title: 'Proces', color: T.cyan },
    { id: 3, title: 'Cijene', color: T.cyan },
  ];

  const freeFeatures = [
    {
      icon: BeakerIcon,
      title: 'Analiza Vode',
      subtitle: 'Profesionalno testiranje',
      description: 'Precizna kemijska analiza parametara vode bazena s AI preporukama za tretman.',
      image: '💧',
      color: '#00FF88',
      features: ['pH, Klor, Alkalitet', 'AI Preporuke', 'Kalkulator doziranja'],
      action: () => onNavigate('analysis')
    },
    {
      icon: ShoppingCart,
      title: 'Kemijski Proizvodi',
      subtitle: 'IVERO katalog',
      description: 'Kompletan katalog profesionalnih kemijskih proizvoda za održavanje bazena.',
      image: '🧪',
      color: T.cyan,
      features: ['IVERO proizvodi', 'Cijene', 'Doziranje'],
      action: () => onNavigate('products')
    },
    {
      icon: MapPin,
      title: 'Prodajna Mjesta',
      subtitle: 'Lokator trgovina',
      description: 'Pronađite najbližu trgovinu s kemijskim proizvodima i opremom za bazene.',
      image: '📍',
      color: '#32CD32',
      features: ['Interaktivna karta', 'Kontakt podaci', 'Radno vrijeme'],
      action: () => onNavigate('free-portal')
    },
  ];

  const proFeatures = [
    {
      icon: Droplets,
      title: 'Pool Visualizer™',
      subtitle: 'AR Vizualizacija',
      description: 'Revolucionarna AR tehnologija za vizualizaciju bazena u stvarnom prostoru.',
      image: '🏊',
      gradient: true,
      features: ['AR Tehnologija', 'Alat perspektive', 'Pregled uživo'],
      action: () => onNavigate('visualizer'),
      badge: 'GLAVNI PROIZVOD'
    },
    {
      icon: FileText,
      title: 'Radni Nalozi',
      subtitle: 'Upravljanje poslovima',
      description: 'Kompletan sustav za kreiranje, praćenje i fakturiranje radnih naloga.',
      image: '📋',
      gradient: true,
      features: ['Kreiranje naloga', 'Praćenje statusa', 'E-Fakture'],
      action: () => onNavigate('pro-portal')
    },
    {
      icon: Users,
      title: 'Upravljanje Klijentima',
      subtitle: 'CRM sustav',
      description: 'Profesionalna baza klijenata s poviješću servisa i automatskim podsjetnicima.',
      image: '👥',
      gradient: true,
      features: ['Baza klijenata', 'Povijest servisa', 'Automatski podsjetnci'],
      action: () => onNavigate('pro-portal')
    },
    {
      icon: Package,
      title: 'Skladište',
      subtitle: 'Upravljanje zalihama',
      description: 'Praćenje zaliha kemikalija i opreme u stvarnom vremenu sa automatskim upozorenjima.',
      image: '📦',
      gradient: true,
      features: ['Praćenje uživo', 'Upozorenja niskih zaliha', 'QR kodovi'],
      action: () => onNavigate('pro-portal')
    },
    {
      icon: BarChart3,
      title: 'Napredna Analitika',
      subtitle: 'Poslovna inteligencija',
      description: 'Detaljni izvještaji, statistika i uvidi za optimizaciju poslovanja.',
      image: '📊',
      gradient: true,
      features: ['Praćenje prihoda', 'Metrike performansi', 'Prilagođeni izvještaji'],
      action: () => onNavigate('pro-portal')
    },
    {
      icon: Database,
      title: 'Cloud Sigurnosna Kopija',
      subtitle: 'Sigurnost podataka',
      description: 'Automatska cloud sigurnosna kopija svih podataka sa 99.9% garancijom dostupnosti.',
      image: '☁️',
      gradient: true,
      features: ['Automatska kopija', '256-bit enkripcija', '99.9% dostupnost'],
      action: () => onNavigate('pro-portal')
    },
  ];

  const workflowSteps = [
    { icon: Users, title: 'Dodaj Klijenta', desc: 'Kreiraj profil s bazenom i kontaktom', color: T.cyan },
    { icon: BeakerIcon, title: 'Analiza Vode', desc: 'Unesi parametre i dobij AI preporuke', color: '#00FF88' },
    { icon: FileText, title: 'Radni Nalog', desc: 'Kreiraj nalog sa kemikalijama', color: T.cyan },
    { icon: Package, title: 'Skladište', desc: 'Automatsko skidanje sa zaliha', color: '#FF6B35' },
    { icon: DollarSign, title: 'Faktura', desc: 'Generiraj PDF fakturu', color: '#FFB020' },
    { icon: BarChart3, title: 'Analitika', desc: 'Prati prihode i performanse', color: T.cyan },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: T.pageBg }} />
      <WaterBackground />

      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={onClose}
        className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl"
        style={{
          background: T.cardBg,
          border: T.cardBorder,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="w-6 h-6 text-white" />
      </motion.button>

      {/* Section Indicator */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              const element = document.getElementById(`section-${section.id}`);
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="relative px-4 py-2 rounded-full backdrop-blur-xl transition-all"
            style={{
              background: activeSection === section.id ? `${T.cyan}20` : T.cardBg,
              border: activeSection === section.id ? `1px solid ${T.cyan}` : T.cardBorder,
            }}
          >
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: activeSection === section.id ? T.cyan : T.muted }}>
              {section.title}
            </span>
          </button>
        ))}
      </div>

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto scroll-smooth relative z-10"
        style={{ scrollSnapType: 'y mandatory' }}
        onScroll={(e) => {
          const container = e.currentTarget;
          const scrollPosition = container.scrollTop;
          const sectionHeight = container.scrollHeight / sections.length;
          const currentSection = Math.floor(scrollPosition / sectionHeight);
          setActiveSection(currentSection);
        }}
      >
        {/* SECTION 1: HERO */}
        <section
          id="section-0"
          className="min-h-screen relative flex items-center justify-center"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="relative z-10 max-w-6xl mx-auto px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 backdrop-blur-xl"
                style={{ background: T.cardBg, border: T.cardBorder }}>
                <Sparkles className="w-4 h-4" style={{ color: T.cyan }} />
                <span className="text-xs font-bold uppercase tracking-wider text-white">Centar za Iskustvo Proizvoda</span>
              </div>

              <h1 className="text-8xl font-black mb-6" style={{ letterSpacing: '-0.05em', lineHeight: '1' }}>
                <span className="text-white">MONDO </span>
                <span className="bg-gradient-to-r from-[#7FDBFF] to-[#1E88E5] bg-clip-text text-transparent">POOL CARE</span>
              </h1>

              <p className="text-2xl mb-12 max-w-3xl mx-auto leading-relaxed" style={{ color: T.muted }}>
                Profesionalna platforma za upravljanje bazenima s AI vizualizacijom,
                <br />
                analizom vode i kompletnim poslovnim alatima za moderne pool servisere.
              </p>

              <div className="flex flex-wrap gap-4 justify-center mb-16">
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-xl"
                  style={{ background: T.cardBg, border: T.cardBorder }}>
                  <Check className="w-5 h-5 text-[#00FF88]" />
                  <span className="text-white font-medium">3 Besplatne Funkcije</span>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-xl"
                  style={{ background: T.cardBg, border: T.cardBorder }}>
                  <Shield className="w-5 h-5" style={{ color: T.cyan }} />
                  <span className="text-white font-medium">6 Pro Alata</span>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-xl"
                  style={{ background: T.cardBg, border: T.cardBorder }}>
                  <Zap className="w-5 h-5" style={{ color: T.cyan }} />
                  <span className="text-white font-medium">AI-Powered</span>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ color: T.muted }}
                className="text-sm uppercase tracking-wider"
              >
                Skrolaj za više ↓
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2: FEATURES SHOWCASE */}
        <section
          id="section-1"
          className="min-h-screen relative py-24"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="max-w-7xl mx-auto px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-6xl font-black mb-4 text-white" style={{ letterSpacing: '-0.03em' }}>
                Sve što trebate.
                <br />
                <span className="bg-gradient-to-r from-[#5CE1E6] to-[#00FF88] bg-clip-text text-transparent">
                  I još više.
                </span>
              </h2>
              <p className="text-xl" style={{ color: T.muted }}>Profesionalni alati za svaki aspekt vašeg poslovanja</p>
            </motion.div>

            {/* FREE FEATURES */}
            <div className="mb-20">
              <div className="flex items-center gap-3 mb-8">
                <Unlock className="w-6 h-6 text-[#00FF88]" />
                <h3 className="text-3xl font-bold text-white">Besplatno za sve</h3>
                <div className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(0,255,136,0.2)', color: '#00FF88' }}>
                  BESPLATNO
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {freeFeatures.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    onClick={feature.action}
                    className="group cursor-pointer p-8 rounded-3xl relative overflow-hidden backdrop-blur-xl"
                    style={{
                      background: T.cardBg,
                      border: T.cardBorder,
                      boxShadow: T.cardShadow,
                    }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `linear-gradient(135deg, ${feature.color}10 0%, transparent 100%)` }}></div>

                    <div className="relative z-10">
                      <div className="text-6xl mb-4">{feature.image}</div>
                      <h4 className="text-2xl font-bold mb-2 text-white">{feature.title}</h4>
                      <p className="text-sm mb-4" style={{ color: T.muted }}>{feature.subtitle}</p>
                      <p className="text-sm mb-6 leading-relaxed" style={{ color: T.faint }}>{feature.description}</p>

                      <div className="space-y-2 mb-6">
                        {feature.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4" style={{ color: feature.color }} />
                            <span style={{ color: T.muted }}>{f}</span>
                          </div>
                        ))}
                      </div>

                      <button className="flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all"
                        style={{ color: feature.color }}>
                        Probaj besplatno
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* PRO FEATURES */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Lock className="w-6 h-6" style={{ color: T.cyan }} />
                <h3 className="text-3xl font-bold text-white">Profesionalni alati</h3>
                <div className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ background: T.accent, color: '#000' }}>
                  PRO
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {proFeatures.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    onClick={feature.action}
                    className="group cursor-pointer p-8 rounded-3xl relative overflow-hidden backdrop-blur-xl"
                    style={{
                      background: T.cardBg,
                      border: T.cardBorder,
                      boxShadow: T.cardShadow,
                    }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `linear-gradient(135deg, ${T.cyan}0A 0%, transparent 100%)` }}></div>

                    {feature.badge && (
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                        style={{ background: T.accent, color: '#000' }}>
                        {feature.badge}
                      </div>
                    )}

                    <div className="relative z-10">
                      <div className="text-6xl mb-4">{feature.image}</div>
                      <h4 className="text-2xl font-bold mb-2 text-white">{feature.title}</h4>
                      <p className="text-sm mb-4" style={{ color: T.muted }}>{feature.subtitle}</p>
                      <p className="text-sm mb-6 leading-relaxed" style={{ color: T.faint }}>{feature.description}</p>

                      <div className="space-y-2 mb-6">
                        {feature.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4" style={{ color: T.cyan }} />
                            <span style={{ color: T.muted }}>{f}</span>
                          </div>
                        ))}
                      </div>

                      <button className="flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all" style={{ color: T.cyan }}>
                        Isprobaj sada
                        <ArrowRight className="w-4 h-4" style={{ color: T.cyan }} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: WORKFLOW */}
        <section
          id="section-2"
          className="min-h-screen relative py-24"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="max-w-7xl mx-auto px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-6xl font-black mb-4 text-white" style={{ letterSpacing: '-0.03em' }}>
                Kompletan radni proces.
                <br />
                <span className="bg-gradient-to-r from-[#7FDBFF] to-[#1E88E5] bg-clip-text text-transparent">
                  Od klijenta do fakture.
                </span>
              </h2>
              <p className="text-xl" style={{ color: T.muted }}>Automatski proces koji štedi vaše vrijeme</p>
            </motion.div>

            <div className="relative">
              {/* Connection Lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>

              <div className="grid md:grid-cols-6 gap-8 relative z-10">
                {workflowSteps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.15, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center relative overflow-hidden"
                      style={{
                        background: `${step.color}20`,
                        border: `2px solid ${step.color}`,
                        boxShadow: `0 0 30px ${step.color}40`
                      }}
                    >
                      <step.icon className="w-10 h-10" style={{ color: step.color }} />
                      <div className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: step.color, color: '#000' }}>
                        {idx + 1}
                      </div>
                    </motion.div>

                    <h4 className="text-sm font-bold text-white mb-2">{step.title}</h4>
                    <p className="text-xs" style={{ color: T.faint }}>{step.desc}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                viewport={{ once: true }}
                className="mt-16 p-8 rounded-3xl backdrop-blur-xl text-center"
                style={{
                  background: T.cardBg,
                  border: T.cardBorder,
                  boxShadow: T.cardShadow,
                }}
              >
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-[#00FF88]" />
                <h3 className="text-2xl font-bold text-white mb-2">Rezultat?</h3>
                <p className="text-lg mb-6" style={{ color: T.muted }}>
                  <span style={{ color: T.cyan }} className="font-bold">75% brže</span> procesiranje naloga,{' '}
                  <span className="text-[#00FF88] font-bold">0% grešaka</span> u fakturiranju,{' '}
                  <span style={{ color: T.cyan }} className="font-bold">100% zadovoljstvo</span> klijenata
                </p>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-8 py-4 rounded-2xl font-bold flex items-center gap-3 mx-auto"
                  style={{
                    background: T.accent,
                    color: '#000',
                    boxShadow: '0 8px 30px rgba(79,195,240,0.35)',
                  }}
                >
                  Započni besplatno
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 4: PRICING */}
        <section
          id="section-3"
          className="min-h-screen relative py-24"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="max-w-7xl mx-auto px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-6xl font-black mb-4 text-white" style={{ letterSpacing: '-0.03em' }}>
                Odaberite svoj plan.
                <br />
                <span className="bg-gradient-to-r from-[#00FF88] to-[#5CE1E6] bg-clip-text text-transparent">
                  Jednostavno i transparentno.
                </span>
              </h2>
              <p className="text-xl" style={{ color: T.muted }}>Bez skrivenih troškova. Bez obveza.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* FREE PLAN */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="p-10 rounded-3xl backdrop-blur-xl relative overflow-hidden"
                style={{
                  background: T.cardBg,
                  border: '2px solid rgba(0,255,136,0.3)',
                  boxShadow: T.cardShadow,
                }}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <Unlock className="w-6 h-6 text-[#00FF88]" />
                    <h3 className="text-2xl font-bold text-white">BESPLATNO</h3>
                  </div>

                  <div className="mb-8">
                    <div className="text-6xl font-black text-white mb-2">0€</div>
                    <div style={{ color: T.muted }}>Zauvijek besplatno</div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {[
                      'Analiza vode',
                      'Kemijski proizvodi katalog',
                      'Lokator prodajnih mjesta',
                      'AI preporuke za tretman',
                      'Kalkulator doziranja',
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-[#00FF88]" />
                        <span style={{ color: T.muted }}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => onNavigate('analysis')}
                    className="w-full py-4 rounded-2xl font-bold transition-all btn-primary"
                  >
                    Započni odmah
                  </button>
                </div>
              </motion.div>

              {/* PRO PLAN */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="p-10 rounded-3xl backdrop-blur-xl relative overflow-hidden"
                style={{
                  background: T.cardBg,
                  border: `2px solid ${T.cyan}50`,
                  boxShadow: `${T.cardShadow}, 0 0 50px ${T.cyan}15`,
                }}
              >
                <div className="absolute top-4 right-4 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ background: T.accent, color: '#000' }}>
                  PREPORUČENO
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <Lock className="w-6 h-6" style={{ color: T.cyan }} />
                    <h3 className="text-2xl font-bold" style={{ color: T.cyan }}>PRO</h3>
                  </div>

                  <div className="mb-8">
                    <div className="text-6xl font-black text-white mb-2">
                      <span style={{ color: T.cyan }}>Kontakt</span>
                    </div>
                    <div style={{ color: T.muted }}>Prilagođena cijena</div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {[
                      'SVE iz BESPLATNOG plana',
                      'Pool Visualizer™ AR',
                      'Upravljanje radnim nalozima',
                      'CRM sustav za klijente',
                      'Skladište i upravljanje zalihama',
                      'Napredna analitika',
                      'E-Fakture i dokumenti',
                      'Cloud sigurnosna kopija 24/7',
                      'Prioritetna podrška',
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Check className="w-5 h-5" style={{ color: T.cyan }} />
                        <span className="text-white font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => onNavigate('register')}
                    className="w-full py-4 rounded-2xl font-bold transition-all relative overflow-hidden group btn-primary"
                  >
                    <span className="relative z-10">Registriraj se sada</span>
                  </button>

                  <p className="text-xs text-center mt-4" style={{ color: T.faint }}>
                    30 dana besplatno probno razdoblje • Bez kreditne kartice
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Final CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              viewport={{ once: true }}
              className="mt-20 text-center"
            >
              <p className="mb-6" style={{ color: T.muted }}>Imate pitanja?</p>
              <a
                href="mailto:info@mondo-acqua.hr"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold backdrop-blur-xl transition-all hover:opacity-90"
                style={{
                  background: T.cardBg,
                  border: T.cardBorder,
                  color: '#FFFFFF'
                }}
              >
                Kontaktirajte nas
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
