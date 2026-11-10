import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, Building2, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '../types';
import { useLanguage } from '../lib/languageContext';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'client' as UserRole,
    companyName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    if (formData.role === 'professional' && !formData.companyName) {
      setError(t('auth.companyRequired'));
      return;
    }

    setIsLoading(true);

    try {
      const user = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        companyName: formData.role === 'professional' ? formData.companyName : undefined,
      });
      
      // Redirect based on role
      if (formData.role === 'client') {
        navigate('/owner');
      } else {
        navigate('/app/role-selection');
      }
    } catch (err: any) {
      setError(err.message || (language === 'hr' ? 'Greška pri registraciji' : 'Registration error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white pb-12 font-sans">
      {/* Header */}
      <div className="bg-[#1a1d23]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-[#D4AF37]"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-black tracking-tight uppercase">{t('auth.register')}</h1>
          </div>
          <div className="px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full">
            <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-wider">AcquaSmart Pro</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 pt-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1d23] rounded-[2.5rem] shadow-2xl p-10 border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="text-center py-8">
             <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                <AlertCircle className="w-10 h-10 text-amber-500" />
             </div>
             <h3 className="text-xl font-black text-white mb-4">Registracija je trenutno onemogućena</h3>
             <p className="text-gray-400 text-sm mb-8 leading-relaxed">
               Trenutno radimo na stabilizaciji sustava. Molimo koristite 
               <span className="text-amber-500 font-bold mx-1">Demo Profesionalac</span> 
               ili 
               <span className="text-amber-500 font-bold mx-1">Gost</span> 
               pristup na ekranu prijave.
             </p>
             <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#D4AF37] text-black py-4 rounded-2xl font-black text-lg hover:bg-[#c4a132] transition-all shadow-xl shadow-amber-900/20"
             >
                Povratak na Prijavu
             </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
