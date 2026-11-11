import { Waves, Mail, Phone, MapPin, ExternalLink, Facebook, Instagram } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/languageContext';
import { footerTranslations } from '../lib/translations';

interface MondoFooterProps {
  variant?: 'full' | 'compact';
}

export function MondoFooter({ variant = 'full' }: MondoFooterProps) {
  const { language } = useLanguage();
  const ft = footerTranslations[language] || footerTranslations['hr'];
  
  const labels = {
    hr: {
      contact: "Kontakt",
      about: "O Mondo Pool Care",
      tags: ["Analiza vode", "Dosing engine", "IVERO proizvodi"],
      privacy: "Pravila privatnosti",
      terms: "Uvjeti korištenja",
      rights: "Sva prava pridržana"
    },
    en: {
      contact: "Contact",
      about: "About Mondo Pool Care",
      tags: ["Water Analysis", "Dosing Engine", "IVERO Products"],
      privacy: "Privacy Policy",
      terms: "Terms of Use",
      rights: "All rights reserved"
    },
    it: {
      contact: "Contatto",
      about: "Info Mondo Pool Care",
      tags: ["Analisi Acqua", "Motore di Dosaggio", "Prodotti IVERO"],
      privacy: "Privacy Policy",
      terms: "Termini d'uso",
      rights: "Tutti i diritti riservati"
    }
  }[language] || {
    contact: "Kontakt",
    about: "O Mondo Pool Care",
    tags: ["Analiza vode", "Dosing engine", "IVERO proizvodi"],
    privacy: "Pravila privatnosti",
    terms: "Uvjeti korištenja",
    rights: "Sva prava pridržana"
  };

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-3">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm">
                <div className="font-bold">Mondo Acqua d.o.o.</div>
              </div>
            </div>
            
            {/* Link */}
            <a 
              href="https://www.mondo-acqua.hr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-teal-300 hover:text-teal-200 transition-colors flex items-center gap-1"
            >
              www.mondo-acqua.hr
              <ExternalLink className="w-3 h-3" />
            </a>
            
            {/* Copyright */}
            <div className="text-xs text-gray-400 text-center">
              © {new Date().getFullYear()} Mondo Pool Care - Powered by Mondo Acqua d.o.o.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <footer className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white py-12 mt-auto border-t-4 border-teal-500">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Waves className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-lg">Mondo Acqua</h3>
                <p className="text-xs text-gray-400">d.o.o.</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              {ft.mondoDesc}
            </p>
            <a 
              href="https://www.mondo-acqua.hr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-teal-300 hover:text-teal-200 transition-colors text-sm font-semibold"
            >
              <ExternalLink className="w-4 h-4" />
              www.mondo-acqua.hr
            </a>

            <div className="flex gap-4 mt-6">
              <a 
                href="https://www.facebook.com/people/Mondo-Acqua-HR/100064917164727/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-[#1877F2] transition-colors group"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-gray-300 group-hover:text-white" />
              </a>
              <a 
                href="https://www.instagram.com/mondoacquahr/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-gray-300 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-teal-300">{labels.contact}</h4>
            <div className="space-y-3">
              <a 
                href="mailto:info@mondo-acqua.hr" 
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center group-hover:bg-teal-600 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span>info@mondo-acqua.hr</span>
              </a>
              
              <a 
                href="tel:+385952087321" 
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center group-hover:bg-teal-600 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+385 95 208 7321</span>
              </a>
              
              <div className="flex items-start gap-3 text-sm text-gray-300">
                <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Lučinići 17, 51216 Marinići, Hrvatska</span>
              </div>
            </div>
          </div>

          {/* About Mondo Pool Care */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-cyan-300">{labels.about}</h4>
            <p className="text-sm text-gray-300 leading-relaxed mb-3">
              {ft.aquaDesc}
            </p>
            <div className="flex flex-wrap gap-2">
              {labels.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-teal-600/20 text-teal-300 rounded-full text-xs font-semibold border border-teal-500/30">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} <span className="text-white font-semibold">Vladimir Perić - Mondo Acqua d.o.o.</span> - {labels.rights}
            </p>
            <div className="flex gap-4">
              <span className="text-gray-500">
                {labels.privacy}
              </span>
              <span className="text-gray-500">
                {labels.terms}
              </span>
            </div>
          </div>
          
          {/* Trademark Notice */}
          <div className="mt-6 pt-4 border-t border-gray-800/50">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Mondo Pool Care™, Pool Visualizer™ i svi povezani logotipi vlasništvo su MONDO ACQUA d.o.o.<br/>
              Sva prava pridržana. Neovlaštena upotreba zaštićenih znakova je zabranjena.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}