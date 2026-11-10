import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplet, Sparkles, ChevronDown, Menu, X, ArrowRight,
  Shield, Users, Zap, BarChart3, Layers, Globe, Play,
  Settings, HelpCircle, FileText, Lock, Mail, Video,
  Wrench, DollarSign, Camera, ImageIcon, Package
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function LandingHero() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [language, setLanguage] = useState('hr');
  const [showScreenshot, setShowScreenshot] = useState(false);

  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);

  const content = {
    hr: {
      tagline: 'Budućnost upravljanja bazenima',
      hero: 'Profesionalna AI platforma za analizu vode i vizualizaciju bazena',
      cta: 'Istraži Platformu',
      watch: 'Pogledaj Demo',
      features: 'Značajke',
      about: 'O Nama',
      contact: 'Kontakt',
      login: 'Prijava',
      menuItems: [
        { label: 'Platforma', path: '/platform' },
        { label: 'Pool Visualizer', path: '/login' },
        { label: 'Owner Mode', path: '/owner' },
        { label: 'Kontakt', path: '/contact' },
      ],
      stats: [
        { value: '7', label: 'Mondo Acqua Modela' },
        { value: '4', label: 'Jezika' },
        { value: 'AI', label: 'Computer Vision' },
      ],
      dropdown: {
        more: 'Više',
        allFeatures: 'Sve Značajke',
        professional: 'Profesionalno',
        poolVisualizer: 'Vizualizator Bazena',
        poolVisualizerDesc: 'AI Alat za Dizajn Bazena',
        platformDetails: 'Detalji Platforme',
        platformDetailsDesc: 'Pregled svih mogućnosti',
        publicAccess: 'Javni Pristup',
        ownerMode: 'Vlasnički Mod',
        ownerModeDesc: 'Besplatna analiza vode i briga',
        showcase: 'Prikaz',
        appScreenshots: 'Snimke Aplikacije',
        appScreenshotsDesc: 'Kinematografska prezentacija',
        productPrices: 'Cijene Proizvoda',
        productPricesDesc: 'Mondo Acqua katalog',
        supportLegal: 'Podrška i Pravno',
        contactUs: 'Kontaktirajte Nas',
        contactUsDesc: 'Javite nam se',
        termsOfUse: 'Uvjeti Korištenja',
        termsOfUseDesc: 'Pravne informacije',
        privacyPolicy: 'Politika Privatnosti',
        privacyPolicyDesc: 'Zaštita podataka',
        footerText: 'Mondo Acqua d.o.o.'
      },
      featureCards: {
        poolVisualizer: 'Vizualizator',
        waterAnalysis: 'Analiza Vode',
        analytics: 'Analitika',
        orpIntelligence: 'ORP Inteligencija'
      }
    },
    en: {
      tagline: 'The future of pool management',
      hero: 'Professional AI platform for water analysis and pool visualization',
      cta: 'Explore Platform',
      watch: 'Watch Demo',
      features: 'Features',
      about: 'About',
      contact: 'Contact',
      login: 'Login',
      menuItems: [
        { label: 'Platform', path: '/platform' },
        { label: 'Pool Visualizer', path: '/login' },
        { label: 'Owner Mode', path: '/owner' },
        { label: 'Contact', path: '/contact' },
      ],
      stats: [
        { value: '7', label: 'Mondo Acqua Models' },
        { value: '4', label: 'Languages' },
        { value: 'AI', label: 'Computer Vision' },
      ],
      dropdown: {
        more: 'More',
        allFeatures: 'All Features',
        professional: 'Professional',
        poolVisualizer: 'Pool Visualizer',
        poolVisualizerDesc: 'AI Pool Design Tool',
        platformDetails: 'Platform Details',
        platformDetailsDesc: 'Full feature overview',
        publicAccess: 'Public Access',
        ownerMode: 'Owner Mode',
        ownerModeDesc: 'Free water analysis & pool care',
        showcase: 'Showcase',
        appScreenshots: 'App Screenshots',
        appScreenshotsDesc: 'Cinematic presentation',
        productPrices: 'Product Prices',
        productPricesDesc: 'Mondo Acqua catalog',
        supportLegal: 'Support & Legal',
        contactUs: 'Contact Us',
        contactUsDesc: 'Get in touch',
        termsOfUse: 'Terms of Use',
        termsOfUseDesc: 'Legal information',
        privacyPolicy: 'Privacy Policy',
        privacyPolicyDesc: 'Data protection',
        footerText: 'Mondo Acqua d.o.o.'
      },
      featureCards: {
        poolVisualizer: 'Pool Visualizer',
        waterAnalysis: 'Water Analysis',
        analytics: 'Analytics',
        orpIntelligence: 'ORP Intelligence'
      }
    },
    it: {
      tagline: 'Il futuro della gestione delle piscine',
      hero: 'Piattaforma AI professionale per l\'analisi dell\'acqua e la visualizzazione delle piscine',
      cta: 'Esplora Piattaforma',
      watch: 'Guarda Demo',
      features: 'Caratteristiche',
      about: 'Chi Siamo',
      contact: 'Contatto',
      login: 'Accedi',
      menuItems: [
        { label: 'Piattaforma', path: '/platform' },
        { label: 'Pool Visualizer', path: '/login' },
        { label: 'Owner Mode', path: '/owner' },
        { label: 'Contatto', path: '/contact' },
      ],
      stats: [
        { value: '7', label: 'Modelli Mondo Acqua' },
        { value: '4', label: 'Lingue' },
        { value: 'AI', label: 'Computer Vision' },
      ],
      dropdown: {
        more: 'Di più',
        allFeatures: 'Tutte le Funzionalità',
        professional: 'Professionale',
        poolVisualizer: 'Visualizzatore Piscina',
        poolVisualizerDesc: 'Strumento AI Design',
        platformDetails: 'Dettagli Piattaforma',
        platformDetailsDesc: 'Panoramica completa',
        publicAccess: 'Accesso Pubblico',
        ownerMode: 'Modalità Proprietario',
        ownerModeDesc: 'Analisi acqua gratuita',
        showcase: 'Vetrina',
        appScreenshots: 'Screenshot App',
        appScreenshotsDesc: 'Presentazione cinematica',
        productPrices: 'Prezzi Prodotti',
        productPricesDesc: 'Catalogo Mondo Acqua',
        supportLegal: 'Supporto e Legale',
        contactUs: 'Contattaci',
        contactUsDesc: 'Mettiti in contatto',
        termsOfUse: 'Termini d\'Uso',
        termsOfUseDesc: 'Informazioni legali',
        privacyPolicy: 'Politica Privacy',
        privacyPolicyDesc: 'Protezione dati',
        footerText: 'Mondo Acqua d.o.o.'
      },
      featureCards: {
        poolVisualizer: 'Pool Visualizer',
        waterAnalysis: 'Analisi Acqua',
        analytics: 'Analitica',
        orpIntelligence: 'Intelligenza ORP'
      }
    }
  };

  const t = content[language as keyof typeof content] || content.hr;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80"
          alt="Pool background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-slate-900/70 to-black/90" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="relative z-50 border-b border-white/5 bg-black/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Droplet className="w-8 h-8 text-[#D4AF37]" />
            <div className="text-xl font-black tracking-tighter">
              <span className="text-[#D4AF37]">AQUA</span>
              <span className="text-white">SMART</span>
              <span className="text-slate-400 text-sm ml-2">PRO</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Removed "Značajke" and "Kontakt" - they are in dropdown menu */}
            
            {/* MEGA DROPDOWN - All Pages */}
            <div 
              className="relative" 
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                onMouseEnter={() => setDropdownOpen(true)}
                className="flex items-center gap-1 text-slate-300 hover:text-[#D4AF37] transition-colors text-sm font-medium py-2"
              >
                <Menu className="w-4 h-4" />
                <span>{t.dropdown?.more || 'More'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-0 w-80 bg-slate-950/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                    onMouseEnter={() => setDropdownOpen(true)}
                  >
                    {/* Dropdown Header */}
                    <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#D4AF37]/10 to-transparent">
                      <div className="text-xs font-black uppercase tracking-wider text-[#D4AF37]">{t.dropdown?.allFeatures || 'All Features'}</div>
                    </div>

                    <div className="p-3 space-y-1 max-h-[70vh] overflow-y-auto">
                      {/* Professional Section */}
                      <div className="mb-3">
                        <div className="px-3 py-2 text-[9px] font-black uppercase tracking-wider text-gray-500">{t.dropdown?.professional || 'Professional'}</div>
                        <button onClick={() => { navigate('/login'); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group text-left">
                          <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                            <Layers className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-white">{t.dropdown?.poolVisualizer || 'Pool Visualizer'}</div>
                            <div className="text-[10px] text-gray-500">{t.dropdown?.poolVisualizerDesc || 'AI Pool Design Tool'}</div>
                          </div>
                          <div className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[8px] font-bold rounded-full">BETA</div>
                        </button>
                        <button onClick={() => { navigate('/platform'); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group text-left">
                          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <Shield className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-white">{t.dropdown?.platformDetails || 'Platform Details'}</div>
                            <div className="text-[10px] text-gray-500">{t.dropdown?.platformDetailsDesc || 'Full feature overview'}</div>
                          </div>
                        </button>
                      </div>

                      {/* Public Access */}
                      <div className="mb-3">
                        <div className="px-3 py-2 text-[9px] font-black uppercase tracking-wider text-gray-500">{t.dropdown?.publicAccess || 'Public Access'}</div>
                        <button onClick={() => { navigate('/owner'); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group text-left">
                          <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                            <Users className="w-4 h-4 text-[#D4AF37]" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-white">{t.dropdown?.ownerMode || 'Owner Mode'}</div>
                            <div className="text-[10px] text-gray-500">{t.dropdown?.ownerModeDesc || 'Free water analysis & pool care'}</div>
                          </div>
                        </button>
                      </div>

                      {/* Demos & Showcase */}
                      <div className="mb-3">
                        <div className="px-3 py-2 text-[9px] font-black uppercase tracking-wider text-gray-500">{t.dropdown?.showcase || 'Showcase'}</div>
                        <button onClick={() => { navigate('/shots'); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group text-left">
                          <div className="w-8 h-8 bg-pink-500/10 rounded-lg flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                            <Camera className="w-4 h-4 text-pink-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-white">{t.dropdown?.appScreenshots || 'App Screenshots'}</div>
                            <div className="text-[10px] text-gray-500">{t.dropdown?.appScreenshotsDesc || 'Cinematic presentation'}</div>
                          </div>
                        </button>
                        <button onClick={() => { navigate('/prices'); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group text-left">
                          <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                            <DollarSign className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-white">{t.dropdown?.productPrices || 'Product Prices'}</div>
                            <div className="text-[10px] text-gray-500">{t.dropdown?.productPricesDesc || 'Mondo Acqua catalog'}</div>
                          </div>
                        </button>
                      </div>

                      {/* Support & Legal */}
                      <div className="mb-3">
                        <div className="px-3 py-2 text-[9px] font-black uppercase tracking-wider text-gray-500">{t.dropdown?.supportLegal || 'Support & Legal'}</div>
                        <button onClick={() => { navigate('/contact'); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group text-left">
                          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <Mail className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-white">{t.dropdown?.contactUs || 'Contact Us'}</div>
                            <div className="text-[10px] text-gray-500">{t.dropdown?.contactUsDesc || 'Get in touch'}</div>
                          </div>
                        </button>
                        <button onClick={() => { navigate('/terms-of-use'); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group text-left">
                          <div className="w-8 h-8 bg-gray-500/10 rounded-lg flex items-center justify-center group-hover:bg-gray-500/20 transition-colors">
                            <FileText className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-white">{t.dropdown?.termsOfUse || 'Terms of Use'}</div>
                            <div className="text-[10px] text-gray-500">{t.dropdown?.termsOfUseDesc || 'Legal information'}</div>
                          </div>
                        </button>
                        <button onClick={() => { navigate('/privacy-policy'); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group text-left">
                          <div className="w-8 h-8 bg-gray-500/10 rounded-lg flex items-center justify-center group-hover:bg-gray-500/20 transition-colors">
                            <Lock className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-white">{t.dropdown?.privacyPolicy || 'Privacy Policy'}</div>
                            <div className="text-[10px] text-gray-500">{t.dropdown?.privacyPolicyDesc || 'Data protection'}</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Dropdown Footer */}
                    <div className="p-3 border-t border-white/10 bg-gradient-to-r from-[#D4AF37]/5 to-transparent">
                      <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider text-center">
                        {t.dropdown?.footerText || 'Mondo Acqua d.o.o.'} • {new Date().getFullYear()}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-2">
              {['hr', 'en', 'it'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`w-8 h-8 rounded-full text-[9px] font-black uppercase transition-all border flex items-center justify-center ${
                    language === lang 
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37]' 
                      : 'bg-white/5 text-[#D4AF37] border-white/10 hover:border-[#D4AF37]/30'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#F4C430] transition-all text-sm"
            >
              {t.login}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-white hover:text-[#D4AF37] transition-colors"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
          >
            <div className="p-6 space-y-4">
              {t.menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    navigate(item.path);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/50 text-white transition-all"
                >
                  {item.label}
                </button>
              ))}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                {['hr', 'en', 'it'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all border ${
                      language === lang 
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37]' 
                        : 'bg-white/5 text-[#D4AF37] border-white/10'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
                {t.tagline}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              <span className="text-[#D4AF37]">AQUA</span>
              <span className="text-white">SMART</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">
                PRO
              </span>
            </h1>

            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              {t.hero}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <button
                onClick={() => setShowScreenshot(true)}
                className="group px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#F4C430] text-black font-bold rounded-xl shadow-lg hover:shadow-[#D4AF37]/50 transition-all flex items-center gap-2"
              >
                {t.cta}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => toast.info('Video demo dolazi uskoro!', { description: 'Pripremamo detaljnu video prezentaciju svih funkcionalnosti.' })}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:border-[#D4AF37]/50 hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                {t.watch}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {t.stats.map((stat, index) => (
                <div key={index} className="text-center md:text-left">
                  <div className="text-3xl font-black text-[#D4AF37] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: Layers, label: t.featureCards?.poolVisualizer || 'Pool Visualizer', color: 'purple' },
              { icon: Shield, label: t.featureCards?.waterAnalysis || 'Water Analysis', color: 'blue' },
              { icon: BarChart3, label: t.featureCards?.analytics || 'Analytics', color: 'green' },
              { icon: Zap, label: t.featureCards?.orpIntelligence || 'ORP Intelligence', color: 'amber' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#D4AF37]/30 transition-all cursor-default group"
              >
                <feature.icon className="w-8 h-8 text-[#D4AF37] mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-bold text-white">{feature.label}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
          }}
        >
          <span className="text-xs text-slate-400 uppercase tracking-wider">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-[#D4AF37]" />
          </motion.div>
        </motion.div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#D4AF37]/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      {/* Screenshot Modal */}
      <AnimatePresence>
        {showScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
            onClick={() => setShowScreenshot(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full bg-slate-900 rounded-2xl border border-[#D4AF37]/30 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-[#D4AF37]/10 to-transparent">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#D4AF37]" />
                  {t.cta}
                </h3>
                <button 
                  onClick={() => setShowScreenshot(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="relative aspect-video bg-black/50">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1770734360042-676ef707d022?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80"
                  alt="Platform Dashboard"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-50" />
                <div className="absolute bottom-8 left-8 right-8">
                  <h4 className="text-2xl font-bold text-white mb-2">{t.hero}</h4>
                  <p className="text-slate-300">{t.dropdown?.platformDetailsDesc}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}