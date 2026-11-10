import { useNavigate } from 'react-router';
import { Beaker, MessageCircle, Video, DollarSign, Book, Droplets, Sparkles, Camera, Settings, ArrowLeft, Crown, ShoppingCart, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { AquaSmartAvatar } from './AquaSmartAvatar';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../lib/languageContext';
import { MondoFooter } from './MondoFooter';
import { footerTranslations } from '../lib/translations';

export function OwnerMode() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const ft = footerTranslations[language] || footerTranslations['hr'];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  const isAdmin = 
    user?.email === 'info@mondo-acqua.hr' || 
    user?.email === 'admin@mondo-acqua.hr' || 
    user?.email === 'profesionalac@aquasmart.hr';

  const secondaryActions = [
    { icon: DollarSign, title: language === 'hr' ? 'Cjenik' : 'Prices', path: '/prices', color: 'text-emerald-400' },
    { icon: MessageCircle, title: 'Chat', path: '/owner-chat', color: 'text-blue-400' },
    { icon: Video, title: 'Video', path: '/owner-video', color: 'text-amber-400' },
    { icon: ShoppingCart, title: language === 'hr' ? 'Košarica' : 'Cart', path: '/owner-cost', color: 'text-gold-400' },
    { icon: Settings, title: language === 'hr' ? 'Održavanje' : 'Maintenance', path: '/owner-maintenance', color: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white relative overflow-hidden font-sans">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#D4AF37]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Language Switcher - Very Visible */}
      <div className="fixed top-6 left-6 z-50 flex gap-2">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-white/5 text-gray-400 border border-white/10 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all flex items-center justify-center backdrop-blur-md"
          title="Natrag / Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-full bg-white/5 text-gray-400 border border-white/10 hover:border-red-500/50 hover:text-red-500 transition-all flex items-center justify-center backdrop-blur-md"
          title="Odjava / Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="fixed top-6 right-6 z-50 flex gap-2">
        {['hr', 'en', 'it'].map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang as any)}
            className={`w-10 h-10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center ${
              language === lang 
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-amber-900/20' 
                : 'bg-white/5 text-[#D4AF37] border-white/10 hover:border-[#D4AF37]/30'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
             <Crown className="w-5 h-5 text-[#D4AF37]" />
             <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">Guest Experience</span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-6">
            <AquaSmartAvatar variant="dropbot" size="xl" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">
            ACQUA<span className="text-[#D4AF37]">SMART</span> PRO
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">
            {language === 'hr' ? 'Profesionalna briga o vašem bazenu' : language === 'it' ? 'Cura professionale della tua piscina' : 'Professional care for your pool'}
          </p>
        </motion.div>

        {/* Admin Quick Link */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10"
          >
            <button
              onClick={() => navigate('/mondo-admin')}
              className="w-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-3xl p-5 flex items-center justify-between group hover:bg-[#D4AF37]/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-2xl flex items-center justify-center shadow-lg">
                  <Settings className="w-6 h-6 text-black" />
                </div>
                <div className="text-left">
                  <p className="text-[#D4AF37] font-black text-sm uppercase tracking-tight">Mondo Acqua Admin</p>
                  <p className="text-xs text-[#D4AF37]/60 font-bold">Upravljanje narudžbama i chat porukama</p>
                </div>
              </div>
              <div className="px-5 py-2 bg-[#D4AF37] text-black rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:scale-105 transition-transform shadow-xl shadow-amber-900/10">
                Otvori
              </div>
            </button>
          </motion.div>
        )}

        {/* Action Cards */}
        <div className="space-y-10">
          {/* PRIMARY ACTIONS */}
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6 ml-4"
            >
              {language === 'hr' ? 'Analiza vode' : language === 'it' ? 'Analisi dell\'acqua' : 'Water Analysis'}
            </motion.h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Water Analysis + Buy */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/guest-analysis')}
                className="relative group bg-[#1a1d23] rounded-[2.5rem] p-8 border border-white/5 hover:border-[#D4AF37]/50 transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
                <div className="absolute top-4 right-4">
                  <span className="bg-[#D4AF37] text-black text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest">KUPI</span>
                </div>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Beaker className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl mb-1 tracking-tight">{language === 'hr' ? 'Analiza vode' : language === 'it' ? 'Analisi' : 'Analysis'}</h3>
                    <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider">{language === 'hr' ? 'Analiza + narudžba odmah' : language === 'it' ? 'Analisi + ordina subito' : 'Analyse + order now'}</p>
                  </div>
                </div>
              </motion.button>

              {/* Advanced Analysis (no purchase) */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/owner-analysis')}
                className="relative group bg-[#1a1d23] rounded-[2.5rem] p-8 border border-white/5 hover:border-[#D4AF37]/50 transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl mb-1 tracking-tight">{language === 'hr' ? 'Napredna analiza' : language === 'it' ? 'Analisi avanzata' : 'Advanced analysis'}</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{language === 'hr' ? 'Kalibracija + ORP' : 'Calibration + ORP'}</p>
                  </div>
                </div>
              </motion.button>
            </div>
          </div>

          {/* SECONDARY ACTIONS */}
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6 ml-4"
            >
              {language === 'hr' ? 'Dodatne opcije' : 'More Options'}
            </motion.h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {secondaryActions.map((item, i) => (
                <button
                  key={i}
                  onClick={() => navigate(item.path)}
                  className="bg-[#1a1d23] border border-white/5 rounded-3xl p-6 text-center hover:border-white/20 transition-all group"
                >
                  <item.icon className={`w-6 h-6 mx-auto mb-3 ${item.color} group-hover:scale-110 transition-transform`} />
                  <div className="text-[10px] font-black text-white uppercase tracking-widest">{item.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Professional Access */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
            <p className="text-gray-400 font-medium mb-6">
              <strong className="text-white">{ft.professionalTitle}</strong> {ft.professionalDesc}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-[#D4AF37] text-black px-10 py-4 rounded-2xl hover:bg-[#c4a132] transition-all shadow-xl shadow-amber-900/10 font-black uppercase tracking-widest text-xs"
            >
              {t('auth.login')}
            </button>
          </div>
        </motion.div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
           <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 mx-auto text-gray-700 hover:text-[#D4AF37] transition-all text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <ArrowLeft className="w-3 h-3" />
              {language === 'hr' ? 'Povratak na naslovnicu' : 'Back to home'}
            </button>
        </div>
      </div>
      <MondoFooter />
    </div>
  );
}