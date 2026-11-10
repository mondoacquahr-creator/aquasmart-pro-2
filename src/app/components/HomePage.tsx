import { motion, AnimatePresence } from 'motion/react';
import { Video, Layers, Droplets, Users, PlusCircle, FileText, Package, BarChart3, Settings, Shield, Globe, ChevronDown, UserCog, Warehouse, TrendingUp, LogIn, UserPlus, Lock, Unlock, BeakerIcon, ShoppingCart, MapPin } from 'lucide-react';
import { useState } from 'react';

interface HomePageProps {
  onNavigate: (page: 'visualizer' | 'promo' | 'analysis' | 'products' | 'login' | 'register') => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hr');

  const languages = [
    { id: 'hr', flag: '🇭🇷', name: 'Hrvatski' },
    { id: 'en', flag: '🇬🇧', name: 'English' },
    { id: 'it', flag: '🇮🇹', name: 'Italiano' },
    { id: 'de', flag: '🇩🇪', name: 'Deutsch' },
  ];

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

      {/* TOP BAR - Language & Auth */}
      <div className="relative z-20 border-b border-cyan-500/10 bg-slate-900/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl px-4 py-2 hover:border-cyan-500/40 transition-all"
            >
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-medium">
                {languages.find(l => l.id === selectedLanguage)?.flag} {languages.find(l => l.id === selectedLanguage)?.name}
              </span>
              <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform ${showQuickMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showQuickMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 bg-slate-800/95 backdrop-blur-xl border border-cyan-500/20 rounded-xl overflow-hidden shadow-2xl min-w-[200px] z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setSelectedLanguage(lang.id);
                        setShowQuickMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-cyan-500/10 transition-all ${
                        selectedLanguage === lang.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-white'
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl px-4 py-2 hover:border-cyan-500/40 transition-all text-white hover:text-cyan-300"
            >
              <LogIn className="w-4 h-4" />
              <span className="font-medium">Prijava</span>
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl px-4 py-2 hover:shadow-lg hover:shadow-cyan-500/30 transition-all text-white font-bold"
            >
              <UserPlus className="w-4 h-4" />
              <span>Registracija</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-8">
        {/* Logo & Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* 3D Logo with glow */}
            <div className="relative group">
              {/* Outer glow ring */}
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              
              {/* Middle ring */}
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-xl opacity-50"></div>
              
              {/* Logo circle */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50 border-2 border-cyan-300/20">
                {/* Inner shine */}
                <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                <svg viewBox="0 0 24 24" fill="white" className="w-14 h-14 relative z-10 drop-shadow-lg">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 drop-shadow-2xl mb-4">
            <span className="tracking-tight font-extrabold">AquaSmart</span>
            <span className="text-3xl md:text-5xl text-cyan-400 font-light tracking-wider ml-4">Pro</span>
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
            <p className="text-cyan-300/80 text-lg tracking-widest uppercase font-medium">AI-Powered Pool Management Platform</p>
          </div>
          
          <p className="text-cyan-100/60 text-xl max-w-2xl mx-auto">
            Profesionalna platforma za upravljanje bazenima s AI analizom i naprednim vizualizacijama
          </p>
        </motion.div>

        {/* FREE FEATURES SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-7xl mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Unlock className="w-6 h-6 text-emerald-400" />
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-200">
              BESPLATNE FUNKCIJE
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Water Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              onClick={() => onNavigate('analysis')}
              className="relative group cursor-pointer"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border-2 border-emerald-500/20 hover:border-emerald-500/40 transition-all shadow-2xl hover:scale-105 transform duration-300">
                {/* Icon */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl blur-lg opacity-60"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <BeakerIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Analiza Vode</h3>
                <p className="text-emerald-400 font-semibold mb-3">Water Analysis</p>
                <p className="text-emerald-100/60 text-sm mb-4 leading-relaxed">
                  Besplatna analiza parametara vode s preporukama za tretman
                </p>
                
                {/* Free badge */}
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-3 py-1">
                  <Unlock className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300 text-xs font-bold uppercase">Besplatno</span>
                </div>
              </div>
            </motion.div>

            {/* Chemical Products */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              onClick={() => onNavigate('products')}
              className="relative group cursor-pointer"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border-2 border-blue-500/20 hover:border-blue-500/40 transition-all shadow-2xl hover:scale-105 transform duration-300">
                {/* Icon */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl blur-lg opacity-60"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Kemijski Proizvodi</h3>
                <p className="text-blue-400 font-semibold mb-3">Chemical Products</p>
                <p className="text-blue-100/60 text-sm mb-4 leading-relaxed">
                  Katalog kemikalija za održavanje bazena i online naručivanje
                </p>
                
                {/* Free badge */}
                <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-3 py-1">
                  <Unlock className="w-3 h-3 text-blue-400" />
                  <span className="text-blue-300 text-xs font-bold uppercase">Besplatno</span>
                </div>
              </div>
            </motion.div>

            {/* Nearby Stores */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative group cursor-pointer opacity-75"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border-2 border-purple-500/20 hover:border-purple-500/40 transition-all shadow-2xl hover:scale-105 transform duration-300">
                {/* Icon */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl blur-lg opacity-60"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Prodajna Mjesta</h3>
                <p className="text-purple-400 font-semibold mb-3">Store Locator</p>
                <p className="text-purple-100/60 text-sm mb-4 leading-relaxed">
                  Pronađi najbliže MONDO ACQUA prodajne partnere
                </p>
                
                {/* Free badge */}
                <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 rounded-full px-3 py-1">
                  <Unlock className="w-3 h-3 text-purple-400" />
                  <span className="text-purple-300 text-xs font-bold uppercase">Besplatno</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* PROFESSIONAL TOOLS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-7xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-cyan-400" />
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-200">
              PROFESIONALNI ALATI
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
          </div>

          {/* Pool Visualizer - Featured */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mb-6"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-cyan-500/30 shadow-2xl">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Left - Info */}
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl blur-lg opacity-60"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                          <Layers className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-4xl font-bold text-white">MONDO ACQUA</h3>
                        <p className="text-2xl font-bold text-cyan-400">Pool Visualizer</p>
                      </div>
                    </div>
                    
                    <p className="text-cyan-100/70 text-base mb-6 leading-relaxed">
                      Napredni AI-powered alat za vizualizaciju bazena s perspective transform tehnologijom. 
                      Profesionalna prezentacija projekata klijentima.
                    </p>
                    
                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3 text-sm text-cyan-200/60 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                        <span>4-point polygon</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                        <span>Perspective warp</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                        <span>40x40 mesh</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                        <span>Full canvas render</span>
                      </div>
                    </div>

                    {/* Pro badge */}
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-full px-4 py-2 mb-4">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-300 font-bold uppercase text-sm">Professional Tool</span>
                    </div>

                    {/* CTA */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => onNavigate('login')}
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-6 rounded-xl font-bold text-center hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                      >
                        Prijavi se za pristup →
                      </button>
                      <button
                        onClick={() => onNavigate('promo')}
                        className="bg-purple-500/20 border border-purple-400/30 text-purple-300 py-3 px-6 rounded-xl font-bold hover:bg-purple-500/30 transition-all flex items-center gap-2"
                      >
                        <Video className="w-5 h-5" />
                        Demo
                      </button>
                    </div>
                  </div>

                  {/* Right - Preview */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-2xl"></div>
                    <div className="relative bg-slate-800/50 rounded-2xl p-6 border border-cyan-500/20">
                      <div className="aspect-video bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-xl flex items-center justify-center border border-cyan-500/10">
                        <div className="text-center">
                          <Layers className="w-16 h-16 text-cyan-400/50 mx-auto mb-3" />
                          <p className="text-cyan-300/50 font-bold text-sm">Professional Pool Visualization</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Other Pro Tools */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { 
                title: 'Klijenti',
                subtitle: 'Client Management',
                icon: Users,
                color: 'from-teal-500/20 to-cyan-500/20',
                iconColor: 'text-teal-400',
                borderColor: 'border-teal-500/20',
              },
              {
                title: 'Analitika',
                subtitle: 'Advanced Analytics',
                icon: BarChart3,
                color: 'from-blue-500/20 to-indigo-500/20',
                iconColor: 'text-blue-400',
                borderColor: 'border-blue-500/20',
              },
              {
                title: 'Skladište',
                subtitle: 'Warehouse',
                icon: Warehouse,
                color: 'from-orange-500/20 to-amber-500/20',
                iconColor: 'text-orange-400',
                borderColor: 'border-orange-500/20',
              },
              {
                title: 'Djelatnici',
                subtitle: 'Employees',
                icon: UserCog,
                color: 'from-violet-500/20 to-purple-500/20',
                iconColor: 'text-violet-400',
                borderColor: 'border-violet-500/20',
              },
            ].map((tool, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 + idx * 0.1 }}
                className="relative group cursor-not-allowed opacity-60"
              >
                <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-4 border-2 border-slate-700/30 shadow-xl">
                  <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                    <tool.icon className={`w-6 h-6 ${tool.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{tool.title}</h3>
                  <p className="text-xs text-slate-400 mb-2">{tool.subtitle}</p>
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-300 text-xs font-bold">PRO</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-16 text-center"
        >
          <div className="inline-block relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl px-8 py-4 border border-cyan-500/20">
              <p className="text-white font-bold text-xl mb-1">MONDO ACQUA D.O.O.</p>
              <p className="text-cyan-400 text-lg mb-2">www.aquasmart.hr</p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Shield className="w-4 h-4" />
                  <span>GDPR Protected</span>
                </div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Globe className="w-4 h-4" />
                  <span>4 Languages</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
