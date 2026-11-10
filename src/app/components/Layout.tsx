import { Outlet, useLocation, useNavigate } from 'react-router';
import { BottomNav } from './BottomNav';
import { NotificationCenter } from './NotificationCenter';
import { OfflineSyncStatus } from './OfflineSyncStatus';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Home } from 'lucide-react';
import { useLanguage } from '../lib/languageContext';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  // Provjeri da li je korisnik na glavnoj stranici (/app)
  const isHomePage = location.pathname === '/app';
  
  // Pool Visualizer treba full-screen bez Layout wrappera
  const isPoolVisualizer = location.pathname === '/app/pool-visualizer';
  
  // Provjeri može li se vratiti nazad
  const canGoBack = window.history.length > 1 && !isHomePage;

  const translations = {
    hr: { back: 'Nazad', home: 'Početna' },
    en: { back: 'Back', home: 'Home' },
    de: { back: 'Zurück', home: 'Startseite' },
    it: { back: 'Indietro', home: 'Home' }
  };
  
  const t = translations[language as keyof typeof translations] || translations.hr;

  // Pool Visualizer renderuje se bez Layout wrappera
  if (isPoolVisualizer) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[#030213] pb-24 overflow-x-hidden">
      {/* Top Navigation Header */}
      {!isHomePage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-[#030213]/80 backdrop-blur-xl border-b border-white/5"
        >
          <div className="flex items-center justify-between px-4 py-3">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-wider">{t.back}</span>
            </button>

            {/* Home Button */}
            <button
              onClick={() => navigate('/app')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 transition-all text-[#D4AF37] group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-wider">{t.home}</span>
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Content Area with padding for header */}
      <div className={!isHomePage ? 'pt-16' : ''}>
        {/* Floating Global Components - Above BottomNav */}
        <div className="fixed bottom-24 left-4 right-4 z-[60] flex justify-between items-end pointer-events-none">
          <div className="pointer-events-auto">
            <OfflineSyncStatus />
          </div>
          <div className="pointer-events-auto">
            <NotificationCenter />
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
      
      <BottomNav />
    </div>
  );
}