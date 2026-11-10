import { ArrowLeft, MapPin, Phone, Mail, MessageCircle, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { MONDO_CONTACT } from '../lib/mondoShop';
import { T } from '../lib/theme';
import { WaterBackground } from './WaterBackground';

interface StoreLocatorProps {
  onBack?: () => void;
  onOpenShop?: () => void;
}

export function StoreLocator({ onBack, onOpenShop }: StoreLocatorProps) {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: T.pageBg }}>
      <WaterBackground />

      {/* Header */}
      <div className="relative z-10" style={{ background: T.cardBg, borderBottom: T.cardBorder, backdropFilter: 'blur(20px)' }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <ArrowLeft className="w-5 h-5" style={{ color: T.cyan }} />
            </button>
          )}
          <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ background: 'rgba(92,225,230,0.15)', border: '1px solid rgba(92,225,230,0.25)' }}>
            <MapPin className="w-6 h-6" style={{ color: T.cyan }} />
          </div>
          <div>
            <h1 className="font-bold text-lg">Prodajna Mjesta</h1>
            <p className="text-sm" style={{ color: T.cyan }}>Gdje kupiti</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold mb-2">Naruči proizvode</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)' }}>
            Proizvode možete naručiti online s dostavom ili preuzeti osobno.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 max-w-lg rounded-3xl backdrop-blur-xl"
          style={{ background: T.cardBg, border: T.cardBorder, boxShadow: T.cardShadow }}
        >
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 rounded-xl" style={{ background: 'rgba(92,225,230,0.15)', border: '1px solid rgba(92,225,230,0.25)' }}>
              <MapPin className="w-6 h-6" style={{ color: T.cyan }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{MONDO_CONTACT.name}</h3>
              {MONDO_CONTACT.address && (
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{MONDO_CONTACT.address}</p>
              )}
              {MONDO_CONTACT.hours && (
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{MONDO_CONTACT.hours}</p>
              )}
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Proizvode možete naručiti online s dostavom ili preuzeti osobno.
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4" style={{ color: T.cyan }} />
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>{MONDO_CONTACT.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4" style={{ color: T.cyan }} />
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>{MONDO_CONTACT.email}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <a
              href={`tel:${MONDO_CONTACT.phone.replace(/\s/g, '')}`}
              className="btn-secondary px-4 py-2 text-sm font-semibold flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Nazovi
            </a>
            <a
              href={`https://wa.me/${MONDO_CONTACT.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-semibold flex items-center gap-2 rounded-xl transition-all hover:opacity-90"
              style={{ background: '#25D366', color: '#fff' }}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            {MONDO_CONTACT.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MONDO_CONTACT.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-4 py-2 text-sm font-semibold flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Navigacija
              </a>
            )}
          </div>

          <button
            onClick={() => onOpenShop?.()}
            className="btn-primary w-full py-3 font-semibold flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Naruči proizvode
          </button>
        </motion.div>
      </div>
    </div>
  );
}
