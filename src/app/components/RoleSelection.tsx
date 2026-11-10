import { useNavigate } from 'react-router';
import { Users, Briefcase, ArrowLeft, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/languageContext';

export function RoleSelection() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const selectRole = (role: 'employee' | 'employer') => {
    localStorage.setItem('userRole', role);
    
    // Ako je employee, navigiraj na employee selector (za odabir zaposlenika)
    // Ako je employer, navigiraj direktno u app
    if (role === 'employee') {
      navigate('/app/employee-selector');
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
             <Crown className="w-6 h-6 text-[#D4AF37]" />
             <span className="text-xs font-black text-[#D4AF37] uppercase tracking-[0.4em]">Premium Systems</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">
            AQUA<span className="text-[#D4AF37]">SMART</span> PRO
          </h1>
          <div className="h-1.5 w-24 bg-[#D4AF37] mx-auto rounded-full mb-6"></div>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">{t('roleSelection.title')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* IZVRŠITELJ (Employee) */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => selectRole('employee')}
            className="group relative overflow-hidden bg-[#1a1d23] border-2 border-white/5 rounded-[2.5rem] p-10 hover:border-[#D4AF37]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-8 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-12 h-12 text-blue-400" />
              </div>
              
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">{t('roles.employee')}</h2>
              
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-8 leading-relaxed px-4">
                {t('roleSelection.employeeDesc')}
              </p>
              
              <div className="space-y-3 mb-10">
                {[
                  t('roleSelection.employeeFeature1'),
                  t('roleSelection.employeeFeature2'),
                  t('roleSelection.employeeFeature3'),
                  t('roleSelection.employeeFeature4')
                ].map((feature, i) => (
                  <div key={i} className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>
                    {feature}
                  </div>
                ))}
              </div>
              
              <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-sm uppercase tracking-widest group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-500">
                {t('roleSelection.accessAsEmployee')}
              </div>
            </div>
          </motion.button>

          {/* POSLODAVAC (Employer) */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => selectRole('employer')}
            className="group relative overflow-hidden bg-[#1a1d23] border-2 border-white/5 rounded-[2.5rem] p-10 hover:border-[#D4AF37]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#D4AF37]/20 to-amber-700/20 flex items-center justify-center mx-auto mb-8 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                <Briefcase className="w-12 h-12 text-[#D4AF37]" />
              </div>
              
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">{t('roles.employer')}</h2>
              
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-8 leading-relaxed px-4">
                {t('roleSelection.employerDesc')}
              </p>
              
              <div className="space-y-3 mb-10">
                {[
                  t('roleSelection.employerFeature1'),
                  t('roleSelection.employerFeature2'),
                  t('roleSelection.employerFeature3'),
                  t('roleSelection.employerFeature4')
                ].map((feature, i) => (
                  <div key={i} className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>
                    {feature}
                  </div>
                ))}
              </div>
              
              <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-sm uppercase tracking-widest group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-500 shadow-xl shadow-amber-900/10">
                {t('roleSelection.accessAsEmployer')}
              </div>
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => navigate('/owner')}
            className="flex items-center gap-2 mx-auto text-gray-600 hover:text-[#D4AF37] transition-all text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="w-3 h-3" />
            {t('roleSelection.backToHome')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}