import { useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Mail, Lock, User, Building, Eye, EyeOff, Droplets, ArrowLeft, Sparkles, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { T } from '../lib/theme';
import { WaterBackground } from './WaterBackground';

interface RegisterPageProps {
  onBack: () => void;
  onRegisterSuccess: () => void;
  onGoToLogin?: () => void;
  initialType?: 'member' | 'pro';
}

export function RegisterPage({ onBack, onRegisterSuccess, onGoToLogin, initialType = 'pro' }: RegisterPageProps) {
  const { register } = useAuth();
  const [accountType, setAccountType] = useState<'member' | 'pro'>(initialType);

  // Pro form state
  const [proData, setProData] = useState({ name: '', company: '', email: '', password: '', confirmPassword: '' });
  const [showProPassword, setShowProPassword] = useState(false);
  const [showProConfirm, setShowProConfirm] = useState(false);

  // Member form state
  const [memberData, setMemberData] = useState({ name: '', email: '', phone: '', city: '', password: '', confirmPassword: '' });
  const [showMemberPassword, setShowMemberPassword] = useState(false);
  const [showMemberConfirm, setShowMemberConfirm] = useState(false);
  const [consent, setConsent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const inputStyle = {
    background: T.inputBg,
    border: T.inputBorder,
    fontSize: '16px',
    outline: 'none',
  };

  const handleProSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!proData.name.trim()) { setError('Upišite ime i prezime.'); return; }
    if (!proData.email.trim()) { setError('Upišite e-mail adresu.'); return; }
    if (proData.password.length < 8) { setError('Lozinka mora imati najmanje 8 znakova.'); return; }
    if (proData.password !== proData.confirmPassword) { setError('Lozinke se ne podudaraju.'); return; }
    setIsLoading(true);
    try {
      await register({ email: proData.email, password: proData.password, name: proData.name, role: 'professional', companyName: proData.company });
      onRegisterSuccess();
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('registered')) {
        setError('Račun s tim e-mailom već postoji.');
      } else {
        setError('Registracija nije uspjela. Pokušajte ponovno.');
      }
    }
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!memberData.name.trim()) { setError('Upišite ime i prezime.'); return; }
    if (!memberData.email.trim()) { setError('Upišite e-mail adresu.'); return; }
    if (memberData.password.length < 8) { setError('Lozinka mora imati najmanje 8 znakova.'); return; }
    if (memberData.password !== memberData.confirmPassword) { setError('Lozinke se ne podudaraju.'); return; }
    if (!consent) { setError('Za registraciju je potrebna privola.'); return; }
    setIsLoading(true);
    try {
      await register({
        email: memberData.email,
        password: memberData.password,
        name: memberData.name,
        role: 'member',
        consent: true,
        phone: memberData.phone || undefined,
        city: memberData.city || undefined,
      });
      onRegisterSuccess();
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('registered')) {
        setError('Račun s tim e-mailom već postoji.');
      } else {
        setError('Registracija nije uspjela. Pokušajte ponovno.');
      }
    }
  };

  const handleDemoRegister = () => {
    setIsLoading(true);
    setTimeout(() => { onRegisterSuccess(); }, 500);
  };

  const isMember = accountType === 'member';

  return (
    <div className="min-h-screen relative overflow-hidden flex items-start justify-center p-4 pt-20 pb-12" style={{ background: T.pageBg }}>
      <WaterBackground />

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="fixed top-8 left-8 z-50 px-5 py-3 flex items-center gap-3 rounded-2xl backdrop-blur-xl transition-all hover:scale-105"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.2)' }}
      >
        <ArrowLeft className="w-4 h-4" style={{ color: T.cyan }} />
        <span className="text-sm font-medium">Natrag</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-6 rounded-3xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0ABFCF 0%, #5CE1E6 100%)', boxShadow: '0 8px 32px rgba(92,225,230,0.35)' }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Droplets className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold mb-1" style={{ letterSpacing: '-0.02em' }}>
            {isMember ? 'Moj bazen – besplatna registracija' : 'Pridružite se Mondo Pool Care'}
          </h1>
          {!isMember && (
            <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Započnite 30 dana besplatnog probnog razdoblja</p>
          )}
        </div>

        {/* Segmented switch */}
        <div className="flex rounded-2xl p-1 mb-6" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(92,225,230,0.12)' }}>
          <button
            type="button"
            onClick={() => { setAccountType('member'); setError(''); }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
            style={isMember ? { background: T.cardBg, color: T.cyan, border: '1px solid rgba(92,225,230,0.25)' } : { color: 'rgba(255,255,255,0.45)' }}
          >
            Vlasnik bazena
          </button>
          <button
            type="button"
            onClick={() => { setAccountType('pro'); setError(''); }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
            style={!isMember ? { background: T.cardBg, color: T.cyan, border: '1px solid rgba(92,225,230,0.25)' } : { color: 'rgba(255,255,255,0.45)' }}
          >
            Serviser ili tvrtka
          </button>
        </div>

        {/* Benefits box - member only */}
        {isMember && (
          <div className="mb-6 p-4 rounded-2xl" style={{ background: 'rgba(92,225,230,0.06)', border: '1px solid rgba(92,225,230,0.18)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: T.cyan }}>BESPLATNO:</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Povijest svih analiza · Moj bazen s podsjetnicima · 10 % popusta na kemiju i opremu (+5 % iznad 2.000 €) · pregled opreme na vašem bazenu (besplatan uz kupnju od 150 €)
            </p>
          </div>
        )}

        {/* Form Card */}
        <div className="p-8 rounded-[32px] backdrop-blur-xl" style={{ background: T.cardBg, border: T.cardBorder, boxShadow: T.cardShadow }}>

          {/* Quick Demo - pro only */}
          {!isMember && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDemoRegister}
                disabled={isLoading}
                className="w-full py-4 text-sm font-medium rounded-2xl transition-all mb-6 hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)' }}
              >
                {isLoading ? 'Izrada računa...' : '⚡ Brza demo registracija'}
              </motion.button>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>ILI PUNA REGISTRACIJA</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
              </div>
            </>
          )}

          {/* MEMBER FORM */}
          {isMember && (
            <form onSubmit={handleMemberSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.5)' }}>IME I PREZIME *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <input type="text" value={memberData.name} onChange={e => setMemberData({ ...memberData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl text-white transition-all" placeholder="Ivan Horvat"
                    style={inputStyle} />
                </div>
              </div>
              {/* Email */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.5)' }}>E-MAIL *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: T.cyan }} />
                  <input type="email" value={memberData.email} onChange={e => setMemberData({ ...memberData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl text-white transition-all" placeholder="ivan@gmail.com"
                    style={inputStyle} />
                </div>
              </div>
              {/* Phone */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.5)' }}>TELEFON</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <input type="tel" value={memberData.phone} onChange={e => setMemberData({ ...memberData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl text-white transition-all" placeholder="+385 91 234 5678"
                    style={inputStyle} />
                </div>
              </div>
              {/* City */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.5)' }}>MJESTO</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <input type="text" value={memberData.city} onChange={e => setMemberData({ ...memberData, city: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl text-white transition-all" placeholder="Zagreb"
                    style={inputStyle} />
                </div>
              </div>
              {/* Password */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.5)' }}>LOZINKA *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: T.cyan }} />
                  <input type={showMemberPassword ? 'text' : 'password'} value={memberData.password} onChange={e => setMemberData({ ...memberData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-4 rounded-2xl text-white transition-all" placeholder="••••••••"
                    style={inputStyle} />
                  <button type="button" onClick={() => setShowMemberPassword(!showMemberPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {showMemberPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.5)' }}>POTVRDITE LOZINKU *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: T.cyan }} />
                  <input type={showMemberConfirm ? 'text' : 'password'} value={memberData.confirmPassword} onChange={e => setMemberData({ ...memberData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-4 rounded-2xl text-white transition-all" placeholder="••••••••"
                    style={inputStyle} />
                  <button type="button" onClick={() => setShowMemberConfirm(!showMemberConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {showMemberConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {/* Consent checkbox */}
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl transition-all hover:bg-white/5">
                <div className="relative mt-0.5 shrink-0">
                  <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="sr-only" />
                  <div className="w-5 h-5 rounded-md border flex items-center justify-center transition-all"
                    style={{ background: consent ? T.cyan : 'transparent', borderColor: consent ? T.cyan : 'rgba(92,225,230,0.3)' }}>
                    {consent && <CheckCircle2 className="w-3 h-3 text-black" />}
                  </div>
                </div>
                <span className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Slažem se da Mondo Acqua d.o.o. sprema moje podatke, podatke o bazenu i analize vode radi savjeta, podsjetnika i ponuda. Privolu mogu povući brisanjem računa u profilu.
                </span>
              </label>

              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl text-sm" style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF3B30' }}>
                  {error}
                </motion.div>
              )}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit" disabled={isLoading}
                className="w-full py-4 text-base font-bold flex items-center justify-center gap-3 rounded-2xl mt-2 transition-all relative overflow-hidden group"
                style={{ background: 'linear-gradient(90deg, #0ABFCF 0%, #5CE1E6 100%)', boxShadow: '0 8px 30px rgba(92,225,230,0.25)', color: '#000', opacity: isLoading ? 0.7 : 1 }}>
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div><span>Registracija...</span></>
                ) : (
                  <><UserPlus className="w-4 h-4" /><span>Registrirajte se besplatno</span></>
                )}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              </motion.button>
            </form>
          )}

          {/* PRO FORM */}
          {!isMember && (
            <form onSubmit={handleProSubmit} className="space-y-5">
              <div>
                <label className="caption mb-3 block" style={{ color: 'rgba(255,255,255,0.5)' }}>IME I PREZIME</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <input type="text" value={proData.name} onChange={e => setProData({ ...proData, name: e.target.value })}
                    className="w-full pl-14 pr-5 py-4 rounded-2xl text-white transition-all focus:scale-[1.01]" placeholder="Ivan Horvat"
                    style={{ ...inputStyle }} />
                </div>
              </div>
              <div>
                <label className="caption mb-3 block" style={{ color: 'rgba(255,255,255,0.5)' }}>TVRTKA (NIJE OBAVEZNO)</label>
                <div className="relative">
                  <Building className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <input type="text" value={proData.company} onChange={e => setProData({ ...proData, company: e.target.value })}
                    className="w-full pl-14 pr-5 py-4 rounded-2xl text-white transition-all focus:scale-[1.01]" placeholder="Vaša tvrtka d.o.o."
                    style={{ ...inputStyle }} />
                </div>
              </div>
              <div>
                <label className="caption mb-3 block" style={{ color: 'rgba(255,255,255,0.5)' }}>E-MAIL ADRESA</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 gradient-text" />
                  <input type="email" value={proData.email} onChange={e => setProData({ ...proData, email: e.target.value })}
                    className="w-full pl-14 pr-5 py-4 rounded-2xl text-white transition-all focus:scale-[1.01]" placeholder="vas@tvrtka.hr"
                    style={{ ...inputStyle }} />
                </div>
              </div>
              <div>
                <label className="caption mb-3 block" style={{ color: 'rgba(255,255,255,0.5)' }}>LOZINKA</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 gradient-text" />
                  <input type={showProPassword ? 'text' : 'password'} value={proData.password} onChange={e => setProData({ ...proData, password: e.target.value })}
                    className="w-full pl-14 pr-14 py-4 rounded-2xl text-white transition-all focus:scale-[1.01]" placeholder="••••••••"
                    style={{ ...inputStyle }} />
                  <button type="button" onClick={() => setShowProPassword(!showProPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 transition-all hover:scale-110" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {showProPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="caption mb-3 block" style={{ color: 'rgba(255,255,255,0.5)' }}>POTVRDITE LOZINKU</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 gradient-text" />
                  <input type={showProConfirm ? 'text' : 'password'} value={proData.confirmPassword} onChange={e => setProData({ ...proData, confirmPassword: e.target.value })}
                    className="w-full pl-14 pr-14 py-4 rounded-2xl text-white transition-all focus:scale-[1.01]" placeholder="••••••••"
                    style={{ ...inputStyle }} />
                  <button type="button" onClick={() => setShowProConfirm(!showProConfirm)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 transition-all hover:scale-110" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {showProConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl text-sm" style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.3)', color: '#FF3B30' }}>
                  {error}
                </motion.div>
              )}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit" disabled={isLoading}
                className="w-full py-5 text-lg font-bold flex items-center justify-center gap-3 rounded-2xl mt-8 transition-all relative overflow-hidden group text-black"
                style={{ background: T.accent, boxShadow: '0 8px 30px rgba(79,195,240,0.35)' }}>
                {isLoading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Izrada računa...</span></>
                ) : (
                  <><UserPlus className="w-5 h-5" /><span>Izradi račun</span></>
                )}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              </motion.button>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <span>Već imate račun? </span>
            <button onClick={onGoToLogin || onBack} className="font-semibold gradient-text transition-all hover:opacity-80">
              Prijavite se
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Registracijom prihvaćate Uvjete korištenja i Pravila privatnosti
        </p>
      </motion.div>
    </div>
  );
}
