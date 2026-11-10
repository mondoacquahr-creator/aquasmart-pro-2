import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, Droplet, UserCircle, AlertCircle, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/languageContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('[Login] Attempting login with:', email);
      const user = await login({ email, password });
      console.log('[Login] Login successful, user:', user);
      
      // Auto-configure for demo employees
      if (user?.id?.startsWith('emp_')) {
        localStorage.setItem('userRole', 'employee');
        localStorage.setItem('currentEmployeeId', user.id);
        localStorage.setItem('currentEmployeeName', user.name);
      }

      // Role-based redirection
      if (user?.role === 'client') {
        console.log('[Login] Redirecting client to /owner');
        navigate('/owner');
      } else {
        const savedRole = localStorage.getItem('userRole');
        console.log('[Login] Professional user, savedRole:', savedRole);
        if (savedRole) {
          console.log('[Login] Redirecting to /app');
          navigate('/app');
        } else {
          console.log('[Login] Redirecting to /role-selection');
          navigate('/role-selection');
        }
      }
    } catch (err: any) {
      console.error('[Login] Login error:', err);
      setError(err.message || (language === 'hr' ? 'Greška pri prijavi' : language === 'en' ? 'Login error' : 'Errore di accesso'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    navigate('/owner');
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col relative overflow-hidden text-white font-sans">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-[#D4AF37]/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute -bottom-[10%] -left-[5%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]"
        />
      </div>

      {/* Language Switcher - Floating Top Right */}
      <div className="absolute top-6 right-6 z-50 flex gap-2">
        {['hr', 'en', 'it'].map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang as any)}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
              language === lang 
                ? 'bg-[#D4AF37] text-black border-[#D4AF37]' 
                : 'bg-white/5 text-[#D4AF37] border-white/10 hover:border-[#D4AF37]/30'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Header / Logo Section */}
      <div className="relative z-10 pt-16 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-amber-700 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-amber-900/20 mb-6 border border-[#D4AF37]/30">
            <Droplet className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">
            ACQUA<span className="text-[#D4AF37]">SMART</span> PRO
          </h1>
          <div className="h-1 w-12 bg-[#D4AF37] rounded-full mb-4"></div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">{t('auth.professionalLogin')}</p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Login Card */}
          <div className="bg-[#1a1d23]/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-black text-white mb-2">{t('auth.welcomeBack')}</h2>
              <p className="text-gray-500 text-sm font-medium">{t('auth.login')} {t('auth.or')} {t('auth.register')}</p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-xs font-bold text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">
                  {t('auth.email')}
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] transition-transform group-focus-within:scale-110">
                    <Mail className="w-full h-full" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all text-white placeholder:text-gray-600 font-medium"
                    placeholder="vas@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">
                  {t('auth.password')}
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37] transition-transform group-focus-within:scale-110">
                    <Lock className="w-full h-full" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all text-white placeholder:text-gray-600 font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#D4AF37] text-black py-4 rounded-2xl font-black text-lg hover:bg-[#c4a132] transition-all shadow-xl shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    {t('auth.loggingIn')}
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    {t('auth.loginButton')}
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 p-5 bg-white/5 border border-white/5 rounded-[1.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                <Crown className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-3">{t('auth.demoAccess')}</p>
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={async () => {
                    setEmail('profesionalac@aquasmart.hr');
                    setPassword('pro123');
                    // Give a small delay for state update visually
                    setTimeout(() => document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 100);
                  }}
                  className="w-full text-left px-4 py-3 bg-white/5 rounded-xl border border-white/5 hover:border-[#D4AF37]/30 transition-all group/demo"
                >
                  <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                    <span>{t('auth.employer')}:</span>
                    <span className="text-[#D4AF37] group-hover/demo:underline italic">One-click Demo</span>
                  </div>
                  <div className="text-[11px] font-bold text-gray-200">profesionalac@aquasmart.hr / pro123</div>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setEmail('klijent@gmail.com');
                    setPassword('klijent123');
                    setTimeout(() => document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 100);
                  }}
                  className="w-full text-left px-4 py-3 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group/demo"
                >
                  <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                    <span>{t('auth.client')}:</span>
                    <span className="text-blue-400 group-hover/demo:underline italic">One-click Owner</span>
                  </div>
                  <div className="text-[11px] font-bold text-gray-200">klijent@gmail.com / klijent123</div>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="px-4 bg-[#1a1d23] text-gray-500">{t('auth.or')}</span>
              </div>
            </div>

            {/* Guest Access */}
            <button
              onClick={handleGuest}
              className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
            >
              <UserCircle className="w-6 h-6 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              {t('auth.guestAccess')}
            </button>

            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center mt-6 px-4">
              {t('auth.guestDescription')}
            </p>

            {/* Register Link - Disabled temporarily */}
            <div className="mt-10 text-center pb-2">
              <p className="text-sm font-medium text-gray-500">
                {t('auth.noAccount')}{' '}
                <button
                  onClick={() => alert(language === 'hr' ? 'Registracija je trenutno onemogućena radi stabilizacije sustava. Molimo koristite demo pristup.' : 'Registration is temporarily disabled for system stabilization. Please use demo access.')}
                  className="text-gray-500 hover:text-gray-400 font-bold cursor-not-allowed"
                >
                  {t('auth.registerButton')} (Onemogućeno/Disabled)
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Brand Footer */}
      <div className="p-8 text-center text-gray-700 text-[10px] font-black uppercase tracking-[0.4em]">
        © {new Date().getFullYear()} MONDO ACQUA PREMIUM SYSTEMS
      </div>
    </div>
  );
}

function Crown({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}