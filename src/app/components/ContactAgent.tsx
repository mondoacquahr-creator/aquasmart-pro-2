import { MessageCircle, Phone, Mail, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

interface ContactAgentProps {
  poolId?: string;
  analysisId?: string;
}

export function ContactAgent({ poolId, analysisId }: ContactAgentProps) {
  const navigate = useNavigate();
  const agentPhone = "+385952087321"; // Mondo Acqua WhatsApp support
  const agentEmail = "info@mondo-acqua.hr"; // Mondo Acqua official email
  
  const handleWhatsAppChat = () => {
    const message = `Pozdrav! Trebam pomoć sa analizom vode${poolId ? ` za bazen ${poolId}` : ''}.`;
    window.open(`https://wa.me/${agentPhone.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleChat = () => {
    navigate('/owner-chat');
  };

  const handlePhoneCall = () => {
    window.location.href = `tel:${agentPhone}`;
  };

  const handleEmail = () => {
    const subject = `Analiza vode - ${poolId || 'Upit'}`;
    const body = `Pozdrav,\n\nTrebam pomoć sa analizom bazenske vode.\n\n${analysisId ? `ID Analize: ${analysisId}\n` : ''}${poolId ? `ID Bazena: ${poolId}\n` : ''}\nHvala!`;
    window.location.href = `mailto:${agentEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kontaktiraj agenta</h2>
          <p className="text-sm text-gray-600">Dostupni 24/7 za pomoć</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 mb-6">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Agenti trenutno dostupni</span>
        </div>
      </div>

      {/* Contact Options Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* WhatsApp Chat */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleWhatsAppChat}
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
        >
          <MessageCircle className="w-6 h-6 mx-auto mb-2" />
          <div className="text-sm font-semibold">WhatsApp</div>
          <div className="text-xs opacity-90">Chat</div>
        </motion.button>

        {/* Phone Call */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePhoneCall}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Phone className="w-6 h-6 mx-auto mb-2" />
          <div className="text-sm font-semibold">Poziv</div>
          <div className="text-xs opacity-90">Telefonski</div>
        </motion.button>

        {/* Chat */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleChat}
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <MessageCircle className="w-6 h-6 mx-auto mb-2" />
          <div className="text-sm font-semibold">Chat</div>
          <div className="text-xs opacity-90">Sustav</div>
        </motion.button>
      </div>

      {/* Email Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleEmail}
        className="w-full bg-gray-100 border-2 border-gray-200 text-gray-700 p-4 rounded-2xl hover:bg-gray-200 hover:border-gray-300 transition-all shadow-md flex items-center justify-center gap-2 font-medium"
      >
        <Mail className="w-5 h-5" />
        Email podrška
      </motion.button>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-xl">
        <div className="flex items-start gap-2 text-sm text-blue-900">
          <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <strong>Radno vrijeme:</strong> Pon-Pet 8:00-20:00, Sub 9:00-15:00
            <br />
            <strong>Hitno:</strong> Dostupni 24/7 za kritične situacije
          </div>
        </div>
      </div>

      {/* Phone Number Display */}
      <div className="mt-4 text-center">
        <a 
          href={`tel:${agentPhone}`}
          className="text-lg font-bold text-blue-600 hover:text-blue-700"
        >
          {agentPhone}
        </a>
      </div>
    </div>
  );
}