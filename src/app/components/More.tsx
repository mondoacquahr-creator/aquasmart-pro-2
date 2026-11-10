import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Brain, 
  Zap, 
  HelpCircle, 
  Book,
  User,
  LogOut,
  Menu,
  FileSpreadsheet,
  Store,
  Download,
  DollarSign,
  BarChart3,
  Settings,
  Home,
  Shield,
  FileText,
  Globe,
  ChevronRight,
  Crown,
  Layers
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../lib/languageContext';

export function More() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [userRole, setUserRole] = useState<'employee' | 'employer' | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    setUserRole(savedRole as 'employee' | 'employer');
  }, []);

  // EMPLOYER MENU ITEMS
  const employerMenuItems = [
    {
      icon: Layers,
      label: 'Pool Visualizer',
      description: 'Vizualizirajte bazen u prostoru s AI asistentom',
      path: '/app/pool-visualizer',
      badge: 'BETA',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      icon: Sparkles,
      label: t('home.actions.newOrder'),
      description: 'Inteligentna analiza parametara',
      path: '/app/ai-recommendations',
      badge: 'NOVO',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20'
    },
    {
      icon: Zap,
      label: 'ORP Inteligencija',
      description: 'Napredna analiza redox potencijala',
      path: '/app/orp-intelligence',
      badge: 'PRO',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20'
    },
    {
      icon: BarChart3,
      label: t('common.analytics'),
      description: 'Dashboard s grafovima i statistikom',
      path: '/app/analytics-dashboard',
      badge: 'PRO',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/20'
    },
    {
      icon: FileSpreadsheet,
      label: 'Import Klijenata',
      description: 'Uvoz klijenata iz Excel datoteke',
      path: '/app/client-import',
      badge: 'PRO',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20'
    },
    {
      icon: FileSpreadsheet,
      label: 'Import Radnih Naloga',
      description: 'Uvoz naloga iz Excel datoteke',
      path: '/app/work-order-import',
      badge: 'NOVO',
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20'
    },
    {
      icon: Download,
      label: t('common.exportData'),
      description: 'Preuzmi sve analize i bazene',
      path: '/app/data-export',
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/20'
    },
    {
      icon: DollarSign,
      label: 'Cjenik proizvoda',
      description: 'Pregled cjenika bazenske kemije',
      path: '/app/product-prices',
      color: 'text-lime-400',
      bgColor: 'bg-lime-500/20'
    },
    {
      icon: Store,
      label: 'Trgovine',
      description: 'Pronađi bazenske proizvode u blizini',
      path: '/app/stores',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    },
    {
      icon: Book,
      label: 'Upute za rad',
      description: 'Vodi za održavanje bazena',
      path: '/instructions',
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20'
    },
    {
      icon: HelpCircle,
      label: 'Pomoć i podrška',
      description: 'Česta pitanja i savjeti',
      path: '/app/help',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      icon: Settings,
      label: t('common.settings'),
      description: 'Prilagodite aplikaciju i jezik',
      path: '/app/settings',
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20'
    },
  ];

  // EMPLOYEE MENU ITEMS (reduced)
  const employeeMenuItems = [
    {
      icon: Sparkles,
      label: 'AI Preporuke',
      description: 'Inteligentna analiza parametara',
      path: '/app/ai-recommendations',
      badge: 'NOVO',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20'
    },
    {
      icon: Zap,
      label: 'ORP Inteligencija',
      description: 'Napredna analiza redox potencijala',
      path: '/app/orp-intelligence',
      badge: 'PRO',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20'
    },
    {
      icon: DollarSign,
      label: 'Cjenik proizvoda',
      description: 'Pregled cjenika bazenske kemije',
      path: '/app/product-prices',
      color: 'text-lime-400',
      bgColor: 'bg-lime-500/20'
    },
    {
      icon: Store,
      label: 'Trgovine',
      description: 'Pronađi bazenske proizvode u blizini',
      path: '/app/stores',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    },
    {
      icon: Book,
      label: 'Upute za rad',
      description: 'Vodi za održavanje bazena',
      path: '/instructions',
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20'
    },
    {
      icon: HelpCircle,
      label: 'Pomoć i podrška',
      description: 'Česta pitanja i savjeti',
      path: '/app/help',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
  ];

  const commonMenuItems = [
    {
      icon: Crown,
      label: 'Showcase',
      description: 'Cinematic App Preview',
      path: '/shots',
      badge: 'ELITE',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
  ];

  const menuItems = [
    ...commonMenuItems,
    ...(userRole === 'employer' ? employerMenuItems : employeeMenuItems)
  ];

  return (
    <div className="min-h-screen bg-[#0a0c10] pb-24 text-white">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-black overflow-hidden border-b border-amber-500/20">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="menu-waves-gold" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M0 50 Q 25 25, 50 50 T 100 50" stroke="#D4AF37" strokeWidth="1" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#menu-waves-gold)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-amber-700 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/20">
                <Menu className="w-8 h-8 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">{t('common.settings')}</h1>
                <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em]">{t('roles.selectRole')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">AquaSmart Pro</span>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-tr from-zinc-700 to-zinc-900 rounded-xl flex items-center justify-center border border-white/10">
                <User className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-100">{user?.name || 'Korisnik'}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                  {userRole === 'employer' ? t('roles.employer') : t('roles.employee')}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all font-bold text-xs border border-red-500/20 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t('common.logout')}
            </button>
          </div>

          {/* QUICK LANGUAGE SELECTOR - DIRECT ACCESS */}
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { id: 'hr', flag: '🇭🇷', label: 'HR' },
              { id: 'en', flag: '🇬🇧', label: 'EN' },
              { id: 'it', flag: '🇮🇹', label: 'IT' }
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all font-bold text-sm ${
                  language === lang.id
                    ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-lg shadow-amber-900/20'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">
              <Globe className="w-3.5 h-3.5" />
              <span>{t('common.language')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-3 mt-6">
        {/* Menu Sections */}
        <div className="grid grid-cols-1 gap-3">
          {menuItems.map((item, itemIndex) => {
            const Icon = item.icon;
            return (
              <button
                key={itemIndex}
                onClick={() => navigate(item.path)}
                className="w-full bg-[#1a1d23] rounded-2xl p-4 shadow-xl border border-white/5 hover:border-[#D4AF37]/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 h-full w-1 bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all"></div>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${item.bgColor} rounded-2xl flex items-center justify-center transition-all group-hover:scale-110`}>
                    <Icon className={`w-7 h-7 ${item.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-black text-white group-hover:text-[#D4AF37] transition-colors tracking-tight">
                        {item.label}
                      </div>
                      {item.badge && (
                        <span className="text-[9px] bg-[#D4AF37] text-black px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">
                      {item.description}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-[#D4AF37] transition-all" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Legal & App Info */}
        <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 px-2">Legal Information</div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/terms-of-use')}
              className="bg-[#1a1d23] rounded-xl p-4 border border-white/5 hover:bg-white/5 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{t('common.termsOfUse')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-700" />
            </button>

            <button
              onClick={() => navigate('/privacy-policy')}
              className="bg-[#1a1d23] rounded-xl p-4 border border-white/5 hover:bg-white/5 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400 group-hover:text-emerald-400" />
                <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{t('common.privacyPolicy')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-700" />
            </button>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="mt-10 mb-6 bg-gradient-to-tr from-zinc-900 to-black border border-[#D4AF37]/10 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[#D4AF37]/5 animate-pulse"></div>
          <div className="relative z-10 space-y-3">
            <div className="text-2xl font-black tracking-tighter text-white">AquaSmart <span className="text-[#D4AF37]">Pro</span></div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} Mondo Acqua d.o.o.
            </div>
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/5">
              <div className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter">Premium Version 1.0.0</div>
              <div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>
              <div className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter">Enterprise Edition</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}