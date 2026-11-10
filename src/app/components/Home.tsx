import { useNavigate } from 'react-router';
import { Users, PlusCircle, FileText, UserPlus, ClipboardList, Package, ArrowRight, Droplets, Box } from 'lucide-react';
import { storage } from '../lib/storage';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../lib/languageContext';
import { motion } from 'motion/react';
import { syncData } from '../lib/supabase';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [userRole, setUserRole] = useState<'employee' | 'employer' | null>(null);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [myWorkOrders, setMyWorkOrders] = useState<any[]>([]);

  useEffect(() => {
    // Initial sync - this is non-blocking and safe
    syncData();

    // Check if role is selected
    const savedRole = localStorage.getItem('userRole');
    if (!savedRole) {
      navigate('/role-selection');
      return;
    }
    setUserRole(savedRole as 'employee' | 'employer');

    // Load work orders safely
    try {
      const saved = localStorage.getItem('workOrders');
      if (saved) {
        const orders = JSON.parse(saved);
        if (Array.isArray(orders)) {
          setWorkOrders(orders);
          
          // Filter work orders for current employee
          if (savedRole === 'employee') {
            const employeeId = localStorage.getItem('currentEmployeeId') || user?.id;
            if (employeeId) {
              setMyWorkOrders(orders.filter((o: any) => o.assignedTo === employeeId));
            } else {
              setMyWorkOrders([]);
            }
          }
        }
      }
    } catch (e) {
      console.error('Error loading work orders from storage', e);
      setWorkOrders([]);
    }
  }, [navigate]);

  const clients = storage.getClients();

  const LanguageSwitcher = () => (
    <div className="flex gap-2 mb-4">
      {[
        { id: 'hr', flag: '🇭🇷' },
        { id: 'en', flag: '🇬🇧' },
        { id: 'it', flag: '🇮🇹' }
      ].map((lang) => (
        <button
          key={lang.id}
          onClick={() => setLanguage(lang.id as any)}
          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 ${
            language === lang.id 
              ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-amber-900/20' 
              : 'bg-white/5 text-[#D4AF37] border-white/10 hover:border-[#D4AF37]/30'
          }`}
        >
          <span>{lang.flag}</span>
          <span>{lang.id}</span>
        </button>
      ))}
    </div>
  );

  // EMPLOYER VIEW
  if (userRole === 'employer') {
    return (
      <div className="min-h-screen bg-[#030213] text-slate-100 pb-24 font-sans relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />

        {/* HEADER */}
        <div className="relative pt-12 pb-24 border-b border-[#D4AF37]/5 bg-gradient-to-b from-[#D4AF37]/[0.03] to-transparent">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-start mb-10"
            >
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 mb-2"
                >
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]/60">Professional Hub</span>
                </motion.div>
                <h1 className="text-5xl font-black mb-3 tracking-tighter">
                  <span className="text-[#D4AF37]">ACQUA</span>SMART <span className="text-white">PRO</span>
                </h1>
                <p className="text-slate-400 text-lg font-medium">{t('common.welcome')}, <span className="text-white">{user?.name || t('roles.employer')}</span></p>
                <div className="mt-6">
                  <LanguageSwitcher />
                </div>
              </div>
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-16 h-16 bg-gradient-to-br from-[#D4AF37]/20 to-amber-400/5 rounded-2xl border border-[#D4AF37]/20 flex items-center justify-center shadow-2xl backdrop-blur-xl"
              >
                <span className="text-[#D4AF37] font-black text-2xl">{user?.name?.charAt(0) || 'P'}</span>
              </motion.div>
            </motion.div>

            {/* STATS - Glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { label: t('home.stats.clients'), value: clients.length, onClick: () => navigate('/app/clients'), icon: Users },
                { label: t('home.stats.pools'), value: storage.getPools().length, onClick: () => navigate('/app/pools'), icon: Droplets },
                { label: t('home.stats.orders'), value: workOrders.length, onClick: () => navigate('/app/all-work-orders'), icon: FileText }
              ].map((stat, idx) => (
                <button
                  key={idx}
                  onClick={stat.onClick}
                  className="bg-white/[0.03] backdrop-blur-2xl rounded-[2rem] p-6 border border-white/5 hover:border-[#D4AF37]/30 transition-all cursor-pointer group shadow-2xl relative overflow-hidden text-left w-full"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    {stat.icon && <stat.icon className="w-12 h-12 text-[#D4AF37]" />}
                  </div>
                  <div className="text-4xl font-black text-white group-hover:text-amber-400 transition-colors tracking-tighter">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mt-2">{stat.label}</div>
                </button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* MAIN ACTIONS */}
        <div className="max-w-4xl mx-auto px-6 -mt-12 space-y-6 relative z-10">
          <motion.button
            onClick={() => navigate('/app/clients')}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-br from-[#D4AF37] via-amber-500 to-amber-600 text-[#030213] rounded-[2.5rem] shadow-[0_20px_50px_rgba(212,175,55,0.2)] p-10 flex items-center justify-between group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-[#030213]/20 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/10">
                <PlusCircle className="w-12 h-12" />
              </div>
              <div className="text-left">
                <div className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">{t('home.actions.newClient')}</div>
                <div className="text-sm font-bold opacity-70 uppercase tracking-widest">{t('home.actions.addClientPoolInfo')}</div>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full border-2 border-[#030213]/30 flex items-center justify-center group-hover:translate-x-2 transition-transform">
              <ArrowRight className="w-8 h-8" />
            </div>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { label: t('home.actions.employees'), icon: UserPlus, color: 'from-purple-500/20 to-pink-500/20', iconColor: 'text-purple-400', path: '/app/employee-management', count: t('common.edit') },
              { label: t('home.actions.inventory'), icon: Package, color: 'from-orange-500/20 to-red-500/20', iconColor: 'text-orange-400', path: '/app/warehouse', count: t('common.warehouse') },
              { label: t('common.analytics'), icon: ClipboardList, color: 'from-blue-500/20 to-indigo-500/20', iconColor: 'text-blue-400', path: '/app/analytics-dashboard', count: t('common.analytics') },
              { label: t('home.actions.newOrder'), icon: FileText, color: 'from-[#D4AF37]/20 to-amber-700/20', iconColor: 'text-amber-400', path: '/app/work-orders/new', count: t('common.confirm') }
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 text-left hover:border-[#D4AF37]/40 transition-all hover:bg-white/[0.05] group relative overflow-hidden backdrop-blur-xl"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-all border border-white/5`}>
                  <action.icon className={`w-7 h-7 ${action.iconColor}`} />
                </div>
                <div className="font-black text-xl text-white mb-2 tracking-tight">{action.label}</div>
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{action.count}</div>
              </button>
            ))}
          </motion.div>

          {/* Pool Visualizer - Featured CTA */}
          <motion.button
            onClick={() => navigate('/app/pool-visualizer')}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-2 border-cyan-400/20 rounded-[2.5rem] p-8 hover:border-cyan-400/40 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 px-3 py-1 bg-cyan-400/20 text-cyan-300 text-[8px] font-black uppercase tracking-[0.3em] rounded-full border border-cyan-400/30">
              BETA
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-cyan-400/20">
                  <Box className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-black uppercase tracking-tighter leading-none mb-1 text-white">
                    {language === 'hr' ? '3D Pool Visualizer' : language === 'it' ? 'Visualizzatore 3D' : '3D Pool Visualizer'}
                  </div>
                  <div className="text-xs font-bold text-cyan-400/70 uppercase tracking-wider">
                    {language === 'hr' ? 'Alat za graditelje' : language === 'it' ? 'Strumento per costruttori' : 'Builder Tool'}
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-cyan-400/30 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                <ArrowRight className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  // EMPLOYEE VIEW (LUXURY DARK)
  return (
    <div className="min-h-screen bg-[#030213] text-slate-100 pb-24 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#D4AF37]/[0.03] rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/[0.03] rounded-full blur-[120px] -z-10" />

      {/* HEADER */}
      <div className="relative pt-12 pb-24 border-b border-[#D4AF37]/5 bg-gradient-to-b from-[#D4AF37]/[0.02] to-transparent">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-start"
          >
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37]/60">Field Specialist</span>
              </motion.div>
              <h1 className="text-5xl font-black mb-2 tracking-tighter">
                <span className="text-[#D4AF37]">ACQUA</span>SMART
              </h1>
              <p className="text-slate-400 text-lg font-medium">
                {t('common.welcome')}, <span className="text-white">{localStorage.getItem('currentEmployeeName') || t('roles.employee')}</span>
              </p>
              
              <div className="mt-6 flex flex-wrap gap-3 items-center">
                <LanguageSwitcher />
                <button
                  onClick={() => navigate('/app/work-orders/new')}
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-amber-400 rounded-full text-[10px] font-black text-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20"
                >
                  {t('home.actions.newOrder')} +
                </button>
                <button
                  onClick={() => navigate('/app/employee-selector')}
                  className="px-5 py-2.5 bg-white/[0.03] hover:bg-[#D4AF37]/20 rounded-full text-[10px] font-black text-[#D4AF37] uppercase tracking-widest transition-all border border-[#D4AF37]/20 backdrop-blur-md"
                >
                  {t('roles.changeProfile')}
                </button>
              </div>
            </div>
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8, ease: "anticipate" }}
              className="w-16 h-16 bg-gradient-to-br from-[#D4AF37]/20 to-amber-400/5 rounded-3xl flex items-center justify-center shadow-2xl border border-[#D4AF37]/20 backdrop-blur-xl"
            >
              <Users className="w-8 h-8 text-[#D4AF37]" />
            </motion.div>
          </motion.div>

          {/* STATS - Glassmorphism */}
          <div className="grid grid-cols-2 gap-4 mt-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/[0.02] backdrop-blur-2xl rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group"
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#D4AF37]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-5xl font-black text-white tracking-tighter mb-2">{myWorkOrders.filter(o => o.status !== 'completed').length}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/70 font-black">{t('home.stats.active')}</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/[0.02] backdrop-blur-2xl rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group"
            >
              <div className="text-5xl font-black text-slate-500 tracking-tighter mb-2">{myWorkOrders.filter(o => o.status === 'completed').length}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">{t('home.stats.completed')}</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* MAIN ACTIONS */}
      <div className="max-w-4xl mx-auto px-6 -mt-12 space-y-10 relative z-10">
        <motion.button
          onClick={() => navigate('/app/pools/new')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-br from-[#D4AF37] via-amber-500 to-amber-600 text-[#030213] rounded-[2.5rem] p-10 flex items-center justify-between shadow-[0_25px_60px_rgba(212,175,55,0.25)] group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-[#030213]/20 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/10">
              <PlusCircle className="w-12 h-12" />
            </div>
            <div className="text-left">
              <div className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">{t('home.actions.newPool')}</div>
              <div className="text-sm font-bold opacity-70 uppercase tracking-widest">{t('home.actions.addObjectInfo')}</div>
            </div>
          </div>
          <div className="w-14 h-14 rounded-full border-2 border-[#030213]/30 flex items-center justify-center group-hover:translate-x-3 transition-transform">
            <ArrowRight className="w-8 h-8" />
          </div>
        </motion.button>

        {/* WORK ORDERS LIST */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-between items-end mb-6 px-2">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">{t('home.tasks.myTasks')}</h2>
              <div className="h-1 w-12 bg-[#D4AF37] rounded-full mt-1" />
            </div>
            <button 
              onClick={() => navigate('/app/all-work-orders')} 
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-[#D4AF37] transition-colors"
            >
              {t('home.tasks.seeAll')}
            </button>
          </div>
          
          {myWorkOrders.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-20 text-center backdrop-blur-xl">
              <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="w-10 h-10 text-slate-700" />
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{t('home.tasks.noTasks')}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {myWorkOrders.map((order, idx) => {
                if (!order) return null;
                const client = storage.getClients().find(c => c.id === order.clientId);
                const pool = storage.getPools().find(p => p.id === order.poolId);
                
                return (
                  <motion.button
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + (idx * 0.1) }}
                    onClick={() => {
                      if (order.poolId && order.poolId !== 'undefined') {
                        navigate(`/app/pools/${order.poolId}/work-orders/${order.id}`);
                      } else {
                        navigate(`/app/work-orders/${order.id}`);
                      }
                    }}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 text-left hover:border-[#D4AF37]/40 transition-all hover:bg-white/[0.04] group relative overflow-hidden backdrop-blur-xl"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-white group-hover:text-amber-500 transition-colors uppercase tracking-tighter leading-tight mb-1">{client?.name || t('common.noData')}</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#D4AF37]/40" />
                          <p className="text-[#D4AF37]/60 text-xs font-black uppercase tracking-widest">{pool?.name || t('common.pool')}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl ${
                        order.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : order.status === 'in-progress'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-slate-500/10 text-slate-400 border border-white/10'
                      }`}>
                        {order.status === 'completed' ? t('common.confirm') : order.status === 'in-progress' ? t('home.stats.active') : t('common.loading')}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                        <FileText className="w-4 h-4 text-[#D4AF37]/40" />
                        {new Date(order.date).toLocaleDateString(language === 'hr' ? 'hr-HR' : language === 'en' ? 'en-US' : 'it-IT')}
                      </div>
                      <div className="text-[9px] font-black text-[#D4AF37]/40 uppercase tracking-[0.3em] group-hover:text-[#D4AF37] transition-colors">Details →</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}