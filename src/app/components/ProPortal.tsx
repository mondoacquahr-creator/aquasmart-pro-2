import { motion } from 'motion/react';
import { useState } from 'react';
import { UserCog, Briefcase, ArrowLeft, Crown, CheckCircle } from 'lucide-react';
import { useLanguage } from '../lib/languageContext';
import { T } from '../lib/theme';
import { WaterBackground } from './WaterBackground';

interface ProPortalProps {
  onBack: () => void;
  onRoleSelect: (role: 'employee' | 'employer') => void;
}

export function ProPortal({ onBack, onRoleSelect }: ProPortalProps) {
  const { t } = useLanguage();

  const handleRoleSelect = (role: 'employee' | 'employer') => {
    console.log('🎯 ProPortal: Role selected:', role);
    localStorage.setItem('userRole', role);
    onRoleSelect(role);
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

      <div className="relative z-10 max-w-6xl w-full">
        {/* Premium header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-xl"
            style={{ background: T.cardBg, border: T.cardBorder }}>
            <Crown className="w-4 h-4" style={{ color: T.cyan }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: T.cyan }}>PREMIUM SYSTEMS</span>
          </div>
          
          <h1 className="text-6xl font-bold mb-6" style={{ letterSpacing: '-0.04em' }}>
            Odaberite Vašu <span style={{ color: T.cyan }}>Razinu Pristupa</span>
          </h1>
          
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Izaberite ulogu koja najbolje odgovara vašem radnom toku
          </p>
        </div>

        {/* Role cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Employee / Izvršitelj */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="rounded-[32px] p-10 cursor-pointer backdrop-blur-xl group relative overflow-hidden"
            onClick={() => handleRoleSelect('employee')}
            style={{
              background: T.cardBg,
              border: T.cardBorder,
              boxShadow: T.cardShadow,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Background tint on Hover */}
            <div className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: 'rgba(92,225,230,0.04)' }}></div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 flex items-center justify-center rounded-3xl transition-all group-hover:scale-110"
                  style={{ background: 'rgba(92,225,230,0.12)', border: '1px solid rgba(92,225,230,0.2)' }}>
                  <UserCog className="w-12 h-12" style={{ color: T.cyan }} />
                </div>
              </div>

              <h2 className="text-4xl font-bold text-center mb-4" style={{ letterSpacing: '-0.02em' }}>Izvršitelj</h2>
              
              <p className="text-center mb-8 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Terenski radnik koji izvršava radne naloge
              </p>

              {/* Features list */}
              <div className="space-y-3 mb-10">
                {[
                  'Pregled dodijeljenih radnih naloga',
                  'Check-in/out sa lokacija',
                  'Unos rezultata servisa',
                  'Evidentiranje utrošenih proizvoda',
                  'Evidencija radnog vremena'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: T.cyan }} />
                    <span className="text-sm" style={{ color: T.muted }}>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center">
                <span className="inline-block px-6 py-3 rounded-xl font-bold transition-all group-hover:scale-105 text-black"
                  style={{ background: T.accent, boxShadow: '0 6px 24px rgba(255,138,31,0.3)' }}>
                  Odaberi Izvršitelj
                </span>
              </div>
            </div>
          </motion.div>

          {/* Employer / Poslodavac */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="rounded-[32px] p-10 cursor-pointer backdrop-blur-xl group relative overflow-hidden"
            onClick={() => handleRoleSelect('employer')}
            style={{
              background: T.cardBg,
              border: T.cardBorder,
              boxShadow: T.cardShadow,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Background tint on Hover */}
            <div className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: 'rgba(255,214,10,0.04)' }}></div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 flex items-center justify-center rounded-3xl transition-all group-hover:scale-110"
                  style={{ background: 'rgba(255,214,10,0.12)', border: '1px solid rgba(255,214,10,0.2)' }}>
                  <Briefcase className="w-12 h-12" style={{ color: T.yellow }} />
                </div>
              </div>

              <h2 className="text-4xl font-bold text-center mb-4" style={{ letterSpacing: '-0.02em' }}>Poslodavac</h2>
              
              <p className="text-center mb-8 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Menadžer koji upravlja timom i klijentima
              </p>

              {/* Features list */}
              <div className="space-y-3 mb-10">
                {[
                  'Kreiranje i dodjela radnih naloga',
                  'Upravljanje timom djelatnika',
                  'Baza klijenata i bazena',
                  'Upravljanje skladištem',
                  'Napredna analitika i izvještaji'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: T.yellow }} />
                    <span className="text-sm" style={{ color: T.muted }}>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center">
                <span className="inline-block px-6 py-3 rounded-xl font-bold transition-all group-hover:scale-105 text-black"
                  style={{ background: T.accent, boxShadow: '0 6px 24px rgba(255,138,31,0.3)' }}>
                  Odaberi Poslodavac
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}