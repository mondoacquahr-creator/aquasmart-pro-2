import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Globe, Facebook, Instagram, ArrowLeft, Clock, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { MondoFooter } from './MondoFooter';
import { useLanguage } from '../lib/languageContext';

export function Contact() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const labels = {
    hr: {
      title: "Kontaktirajte Nas",
      subtitle: "Naš tim stručnjaka stoji vam na raspolaganju za sva pitanja o održavanju bazena i našim uslugama.",
      phone: "Telefon",
      email: "Email",
      address: "Adresa",
      social: "Društvene mreže",
      workHours: "Radno vrijeme",
      back: "Povratak"
    },
    en: {
      title: "Contact Us",
      subtitle: "Our team of experts is at your disposal for all questions about pool maintenance and our services.",
      phone: "Phone",
      email: "Email",
      address: "Address",
      social: "Social Networks",
      workHours: "Working Hours",
      back: "Back"
    },
    it: {
      title: "Contattaci",
      subtitle: "Il nostro team di esperti è a vostra disposizione per tutte le domande sulla manutenzione della piscina e sui nostri servizi.",
      phone: "Telefono",
      email: "Email",
      address: "Indirizzo",
      social: "Social Network",
      workHours: "Orario di lavoro",
      back: "Indietro"
    }
  }[language] || {
    title: "Kontaktirajte Nas",
    subtitle: "Naš tim stručnjaka stoji vam na raspolaganju za sva pitanja o održavanju bazena i našim uslugama.",
    phone: "Telefon",
    email: "Email",
    address: "Adresa",
    social: "Društvene mreže",
    workHours: "Radno vrijeme",
    back: "Povratak"
  };

  return (
    <div className="min-h-screen bg-[#001B3D] text-white font-sans overflow-x-hidden flex flex-col selection:bg-[#D4AF37] selection:text-black">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#001B3D]/80 backdrop-blur-2xl border-b border-white/5 h-20 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
          >
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs uppercase tracking-[0.2em] group-hover:text-[#D4AF37] transition-colors">{labels.back}</span>
          </button>
        </div>
      </nav>

      <main className="flex-grow pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/20 mb-6">
              <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Mondo Acqua Support</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter italic uppercase">
              {labels.title}
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              {labels.subtitle}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Phone Card */}
            <motion.a
              href="tel:+385952087321"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card p-6 hover:bg-white/5 transition-all group"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl shadow-blue-500/30">
                  <Phone className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{labels.phone}</div>
                <div className="text-xl md:text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">+385 95 208 7321</div>
                <div className="text-xs text-gray-500 mt-1">Mon-Fri, 8am - 4pm</div>
              </div>
            </motion.a>

            {/* Email Card */}
            <motion.a
              href="mailto:info@mondo-acqua.hr"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#002452]/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 flex items-center gap-6 hover:border-[#D4AF37]/30 hover:bg-[#002452]/60 transition-all group"
            >
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Mail className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <div className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{labels.email}</div>
                <div className="text-xl md:text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">info@mondo-acqua.hr</div>
                <div className="text-xs text-gray-500 mt-1">24/7 Support</div>
              </div>
            </motion.a>

            {/* Address Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#002452]/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 flex items-center gap-6 hover:border-[#D4AF37]/30 transition-all group md:col-span-2"
            >
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                <MapPin className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <div className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{labels.address}</div>
                <div className="text-xl md:text-2xl font-bold text-white mb-2">Lučinići 17, 51216 Marinići</div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-gray-400 border border-white/10">Hrvatska</span>
                  <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-gray-400 border border-white/10">Mondo Acqua HQ</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Social Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid grid-cols-2 gap-4"
          >
            <a 
              href="https://www.facebook.com/mondoacquabazeni" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#1877F2]/10 border border-[#1877F2]/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-[#1877F2] hover:text-white group transition-all"
            >
              <Facebook className="w-8 h-8 text-[#1877F2] group-hover:text-white transition-colors" />
              <span className="font-black text-sm uppercase tracking-widest">Facebook</span>
            </a>
            
            <a 
              href="https://www.instagram.com/mondo_acqua" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white group transition-all"
            >
              <Instagram className="w-8 h-8 text-pink-500 group-hover:text-white transition-colors" />
              <span className="font-black text-sm uppercase tracking-widest">Instagram</span>
            </a>
          </motion.div>
        </div>
      </main>

      <MondoFooter />
    </div>
  );
}