import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../lib/languageContext';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, LogIn, Droplets, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { T } from '../lib/theme';
import { WaterBackground } from './WaterBackground';

interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess: () => void;
  onGoToRegister?: () => void;
}

export function LoginPage({ onBack, onLoginSuccess, onGoToRegister }: LoginPageProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Upišite e-mail i lozinku.');
      return;
    }

    setIsLoading(true);

    try {
      await login({ email: formData.email, password: formData.password });
      onLoginSuccess();
    } catch (err: any) {
      if (err?.message?.startsWith('Račun je deaktiviran')) {
        setError(err.message);
      } else {
        setError('Neispravan e-mail ili lozinka.');
      }
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await login({ email: 'employer@aquasmart.hr', password: 'employer123' });
      onLoginSuccess();
    } catch (err) {
      setError('Demo prijava nije uspjela.');
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (type: 'employee' | 'employer' | 'admin' | 'mondo') => {
    setIsLoading(true);

    const credentials =
      type === 'employee' ? { email: 'employee@aquasmart.hr', password: 'employee123' } :
      type === 'employer' ? { email: 'employer@aquasmart.hr', password: 'employer123' } :
      type === 'mondo' ? { email: 'info@mondo-acqua.hr', password: 'mondoadmin123' } :
      { email: 'admin@aquasmart.hr', password: 'admin123' };

    try {
      await login(credentials);
      onLoginSuccess();
    } catch (err) {
      setError('Demo prijava nije uspjela.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-8" style={{ background: T.pageBg }}>
      <WaterBackground />

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="fixed top-8 left-8 z-50 px-5 py-3 flex items-center gap-3 rounded-2xl backdrop-blur-xl transition-all hover:scale-105"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <ArrowLeft className="w-4 h-4" style={{ color: T.cyan }} />
        <span className="text-sm font-medium">Natrag</span>
      </motion.button>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-8 rounded-3xl glow-pulse overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0ABFCF 0%, #5CE1E6 100%)',
              boxShadow: '0 8px 32px rgba(92,225,230,0.35)'
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Droplets className="w-10 h-10" style={{ color: '#FFFFFF' }} />
            </div>
          </motion.div>
          
          <h1 className="text-5xl font-bold mb-3" style={{ letterSpacing: '-0.03em' }}>
            Dobrodošli <span className="gradient-text">natrag</span>
          </h1>

          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Prijavite se u svoj profesionalni portal
          </p>
        </div>

        {/* Form Card */}
        <div className="p-10 rounded-[32px] backdrop-blur-xl" style={{
          background: T.cardBg,
          border: T.cardBorder,
          boxShadow: T.cardShadow
        }}>

          {/* Forgot Password View */}
          {view === 'forgot' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Zaboravljena lozinka</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Upišite e-mail adresu i poslat ćemo vam poveznicu za novu lozinku.
                </p>
              </div>

              {resetSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl text-sm"
                  style={{
                    background: 'rgba(52, 199, 89, 0.1)',
                    border: '1px solid rgba(52, 199, 89, 0.3)',
                    color: '#34C759'
                  }}
                >
                  Ako račun s tom adresom postoji, poslali smo vam e-mail s poveznicom za novu lozinku.
                </motion.div>
              ) : (
                <>
                  <div>
                    <label className="caption mb-3 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      E-MAIL ADRESA
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 gradient-text" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-14 pr-5 py-4 rounded-2xl text-white transition-all focus:scale-[1.01]"
                        placeholder="vas@tvrtka.hr"
                        style={{
                          background: T.inputBg,
                          border: T.inputBorder,
                          fontSize: '16px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {resetError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl text-sm"
                      style={{
                        background: 'rgba(255, 59, 48, 0.1)',
                        border: '1px solid rgba(255, 59, 48, 0.3)',
                        color: '#FF3B30'
                      }}
                    >
                      {resetError}
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    disabled={resetSending}
                    onClick={async () => {
                      if (!resetEmail.trim()) {
                        setResetError('Upišite e-mail adresu.');
                        return;
                      }
                      setResetError('');
                      setResetSending(true);
                      await supabase.auth.resetPasswordForEmail(resetEmail, {
                        redirectTo: window.location.origin,
                      });
                      setResetSending(false);
                      setResetSuccess(true);
                    }}
                    className="w-full py-5 text-lg font-bold flex items-center justify-center gap-3 rounded-2xl transition-all relative overflow-hidden group text-black"
                    style={{
                      background: T.accent,
                      boxShadow: '0 8px 30px rgba(255,138,31,0.35)'
                    }}
                  >
                    {resetSending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Slanje...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Pošalji poveznicu</span>
                      </>
                    )}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  </motion.button>
                </>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setView('login'); setResetSuccess(false); setResetError(''); }}
                  className="text-sm font-medium gradient-text transition-all hover:opacity-80"
                >
                  Natrag na prijavu
                </button>
              </div>
            </div>
          )}

          {view === 'login' && (<><form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="caption mb-3 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                E-MAIL ADRESA
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 gradient-text" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-14 pr-5 py-4 rounded-2xl text-white transition-all focus:scale-[1.01]"
                  placeholder="vas@tvrtka.hr"
                  style={{
                    background: T.inputBg,
                    border: T.inputBorder,
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="caption mb-3 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                LOZINKA
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 gradient-text" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-14 pr-14 py-4 rounded-2xl text-white transition-all focus:scale-[1.01]"
                  placeholder="••••••••"
                  style={{
                    background: T.inputBg,
                    border: T.inputBorder,
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 transition-all hover:scale-110"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onClick={() => {
                  setResetEmail(formData.email);
                  setResetError('');
                  setResetSuccess(false);
                  setView('forgot');
                }}
              >
                <span className="gradient-text font-medium">Zaboravljena lozinka?</span>
              </button>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-5 text-lg font-bold flex items-center justify-center gap-3 rounded-2xl mt-8 transition-all relative overflow-hidden group text-black"
              style={{
                background: T.accent,
                boxShadow: '0 8px 30px rgba(255,138,31,0.35)'
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Prijava...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Prijava</span>
                </>
              )}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </motion.button>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl text-sm"
                style={{
                  background: 'rgba(255, 59, 48, 0.1)',
                  border: '1px solid rgba(255, 59, 48, 0.3)',
                  color: '#FF3B30'
                }}
              >
                {error}
              </motion.div>
            )}
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>ILI</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
          </div>

          {/* Demo Login */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-4 text-sm font-medium rounded-2xl transition-all backdrop-blur-xl mb-3 hover:bg-white/10"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.85)'
            }}
          >
            Brzi demo pristup
          </motion.button>

          {/* Test Accounts */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickLogin('employee')}
              disabled={isLoading}
              className="py-3 text-xs font-medium rounded-xl transition-all backdrop-blur-xl"
              style={{
                background: 'rgba(0,240,255,0.05)',
                border: '1px solid rgba(0,240,255,0.2)',
                color: '#00F0FF'
              }}
            >
              🔧 Demo izvršitelj
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickLogin('employer')}
              disabled={isLoading}
              className="py-3 text-xs font-medium rounded-xl transition-all backdrop-blur-xl"
              style={{
                background: 'rgba(255,215,0,0.05)',
                border: '1px solid rgba(255,215,0,0.2)',
                color: '#FFD700'
              }}
            >
              👔 Demo poslodavac
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickLogin('admin')}
              disabled={isLoading}
              className="py-3 text-xs font-medium rounded-xl transition-all backdrop-blur-xl"
              style={{
                background: 'rgba(255,0,0,0.05)',
                border: '1px solid rgba(255,0,0,0.2)',
                color: '#FF0000'
              }}
            >
              🛠️ Demo admin
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickLogin('mondo')}
              disabled={isLoading}
              className="py-3 text-xs font-medium rounded-xl transition-all backdrop-blur-xl"
              style={{
                background: 'rgba(212,175,55,0.1)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#D4AF37'
              }}
            >
              👑 Mondo admin
            </motion.button>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <span>Nemate račun? </span>
            <button onClick={onGoToRegister || onBack} className="font-semibold gradient-text transition-all hover:opacity-80">
              Registrirajte se besplatno
            </button>
          </div>
          </>)}
        </div>
      </motion.div>
    </div>
  );
}