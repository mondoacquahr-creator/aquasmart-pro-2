import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Droplet, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, ExternalLink, FileText, Shield } from 'lucide-react';
import { useLanguage } from '../lib/languageContext';

export function LandingFooter() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-[#030213] border-t border-white/10">
      {/* Decorative Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-amber-700 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/40">
                <Droplet className="w-7 h-7 text-black" />
              </div>
              <div>
                <div className="text-xl font-black text-white tracking-tight">
                  AQUA<span className="text-[#D4AF37]">SMART</span>
                </div>
                <div className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">
                  Professional
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              {language === 'hr' 
                ? 'Profesionalni sustav za održavanje bazena i upravljanje klijentima.' 
                : language === 'it'
                ? 'Sistema professionale per la manutenzione delle piscine e la gestione dei clienti.'
                : language === 'de'
                ? 'Professionelles System für Poolwartung und Kundenverwaltung.'
                : 'Professional pool maintenance and client management system.'}
            </p>
            <div className="flex items-center gap-1 px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full w-fit">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-wider">
                v1.0.0 Gold
              </span>
            </div>
          </div>

          {/* Mondo Acqua Info */}
          <div>
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">
              {language === 'hr' ? 'Tvrtka' : language === 'it' ? 'Azienda' : language === 'de' ? 'Unternehmen' : 'Company'}
            </h3>
            <div className="space-y-3">
              <div>
                <div className="font-bold text-white mb-1">Mondo Acqua d.o.o.</div>
                <div className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider">
                  Elite Pool Systems
                </div>
              </div>
              
              <a 
                href="https://www.mondo-acqua.hr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors group"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="group-hover:underline">mondo-acqua.hr</span>
              </a>

              <div className="flex items-start gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 mt-0.5 text-[#D4AF37]" />
                <a href="mailto:info@mondo-acqua.hr" className="hover:text-[#D4AF37] transition-colors">
                  info@mondo-acqua.hr
                </a>
              </div>

              <div className="flex items-start gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 mt-0.5 text-[#D4AF37]" />
                <a href="tel:+385952087321" className="hover:text-[#D4AF37] transition-colors">
                  +385 95 208 7321 (WhatsApp support)
                </a>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">
              {language === 'hr' ? 'Pravno' : language === 'it' ? 'Legale' : language === 'de' ? 'Rechtliches' : 'Legal'}
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/terms-of-use')}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors group w-full text-left"
              >
                <FileText className="w-4 h-4" />
                <span className="group-hover:underline">{t('common.termsOfUse')}</span>
              </button>

              <button
                onClick={() => navigate('/privacy-policy')}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors group w-full text-left"
              >
                <Shield className="w-4 h-4" />
                <span className="group-hover:underline">{t('common.privacyPolicy')}</span>
              </button>

              <button
                onClick={() => navigate('/contact')}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors group w-full text-left"
              >
                <Mail className="w-4 h-4" />
                <span className="group-hover:underline">
                  {language === 'hr' ? 'Kontakt' : language === 'it' ? 'Contatto' : language === 'de' ? 'Kontakt' : 'Contact'}
                </span>
              </button>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">
              {language === 'hr' ? 'Društvene mreže' : language === 'it' ? 'Social media' : language === 'de' ? 'Soziale Medien' : 'Social Media'}
            </h3>
            <div className="space-y-3">
              <a
                href="https://www.facebook.com/mondoacqua"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors group"
              >
                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-[#D4AF37]/10 border border-white/5 group-hover:border-[#D4AF37]/30 transition-all">
                  <Facebook className="w-4 h-4" />
                </div>
                <span className="group-hover:underline">Facebook</span>
              </a>

              <a
                href="https://www.instagram.com/mondoacqua"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors group"
              >
                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-[#D4AF37]/10 border border-white/5 group-hover:border-[#D4AF37]/30 transition-all">
                  <Instagram className="w-4 h-4" />
                </div>
                <span className="group-hover:underline">Instagram</span>
              </a>

              <a
                href="https://www.linkedin.com/company/mondoacqua"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors group"
              >
                <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-[#D4AF37]/10 border border-white/5 group-hover:border-[#D4AF37]/30 transition-all">
                  <Linkedin className="w-4 h-4" />
                </div>
                <span className="group-hover:underline">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              © {year} Mondo Acqua d.o.o. {language === 'hr' ? 'Sva prava pridržana' : language === 'it' ? 'Tutti i diritti riservati' : language === 'de' ? 'Alle Rechte vorbehalten' : 'All rights reserved'}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                  {language === 'hr' ? 'Sistem aktivan' : language === 'it' ? 'Sistema attivo' : language === 'de' ? 'System aktiv' : 'System Active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}