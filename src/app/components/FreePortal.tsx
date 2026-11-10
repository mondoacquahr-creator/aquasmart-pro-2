import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BeakerIcon, Package, MapPin, CheckCircle, Phone, Mail, ArrowLeft, ShoppingCart, MessageCircle, Droplets } from 'lucide-react';
import { MONDO_CONTACT } from '../lib/mondoShop';
import { T } from '../lib/theme';
import { WaterBackground } from './WaterBackground';

interface FreePortalProps {
  onBack: () => void;
  onGuestAnalysis?: () => void;
  onOpenShop?: () => void;
  onMemberArea?: () => void;
}

export function FreePortal({ onBack, onGuestAnalysis, onOpenShop, onMemberArea }: FreePortalProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'products' | 'stores'>('stores');

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: T.pageBg }}>
      <WaterBackground />

      {/* Header */}
      <div className="relative z-10" style={{ background: T.cardBg, borderBottom: T.cardBorder, backdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <ArrowLeft className="w-5 h-5" style={{ color: T.cyan }} />
              </button>
              <div className="w-10 h-10 flex items-center justify-center" style={{ background: '#2EFF88', borderRadius: '12px' }}>
                <MapPin className="w-6 h-6" style={{ color: '#000000' }} />
              </div>
              <div>
                <h1 className="font-bold text-lg">Besplatni Portal</h1>
                <p className="text-sm" style={{ color: '#2EFF88' }}>Free Access</p>
              </div>
            </div>
            <div className="caption px-4 py-2" style={{ background: '#2EFF8820', color: '#2EFF88', borderRadius: '12px', border: '1px solid #2EFF8840' }}>
              BESPLATNO
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { id: 'stores', label: 'Prodajna Mjesta', icon: MapPin },
              { id: 'products', label: 'Proizvodi', icon: Package },
              { id: 'analysis', label: 'Brza Analiza', icon: BeakerIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-all ${
                  activeTab === tab.id ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* STORES */}
          {activeTab === 'stores' && (
            <motion.div key="stores" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="mb-6">
                <h2 className="text-3xl font-semibold mb-2">Prodajna Mjesta</h2>
                <p style={{ color: 'rgba(255,255,255,0.65)' }}>Proizvode možete naručiti online s dostavom ili preuzeti osobno.</p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 max-w-lg rounded-3xl backdrop-blur-xl"
                style={{ background: T.cardBg, border: T.cardBorder, boxShadow: T.cardShadow }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0" style={{ background: '#2EFF8820', borderRadius: '12px' }}>
                    <MapPin className="w-6 h-6" style={{ color: '#2EFF88' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{MONDO_CONTACT.name}</h3>
                    {MONDO_CONTACT.address && (
                      <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{MONDO_CONTACT.address}</p>
                    )}
                    {MONDO_CONTACT.hours && (
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{MONDO_CONTACT.hours}</p>
                    )}
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
            </motion.div>
          )}

          {/* PRODUCTS */}
          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="mb-6">
                <h2 className="text-3xl font-semibold mb-2">Kemijski Proizvodi</h2>
                <p style={{ color: 'rgba(255,255,255,0.65)' }}>Ivero bazenska kemija dostupna online</p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 flex flex-col items-center text-center gap-6 max-w-md rounded-3xl backdrop-blur-xl"
                style={{ background: T.cardBg, border: T.cardBorder, boxShadow: T.cardShadow }}
              >
                <div className="w-20 h-20 flex items-center justify-center rounded-3xl" style={{ background: 'rgba(92,225,230,0.12)' }}>
                  <Package className="w-10 h-10" style={{ color: T.cyan }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Mondo Acqua webshop</h3>
                  <p className="text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    Pretraži proizvode, postavi količine i naruči s dostavom ili osobnim preuzimanjem.
                  </p>
                </div>
                <button
                  onClick={() => onOpenShop?.()}
                  className="btn-primary w-full max-w-xs py-4 text-lg font-bold flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Otvori webshop
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ANALYSIS */}
          {activeTab === 'analysis' && (
            <motion.div key="analysis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="mb-8">
                <h2 className="text-3xl font-semibold mb-2">Analiza Vode</h2>
                <p style={{ color: 'rgba(255,255,255,0.65)' }}>Unesite parametre vode i dobijte preporuke za kemikalije</p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-8 flex flex-col items-center text-center gap-6 rounded-3xl backdrop-blur-xl"
                style={{ background: T.cardBg, border: T.cardBorder, boxShadow: T.cardShadow }}
              >
                <div className="w-20 h-20 flex items-center justify-center rounded-3xl" style={{ background: 'rgba(92,225,230,0.12)' }}>
                  <BeakerIcon className="w-10 h-10" style={{ color: T.cyan }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Puni Kalkulator Kemikalija</h3>
                  <p className="text-base mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Unesite pH, klor, alkalnost i volumen bazena — dobijete točne preporuke s dozažom i mogućnošću narudžbe Ivero proizvoda.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-xs text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {['✅ pH, klor, alkalnost, tvrdoća', '✅ Automatske preporuke + doza', '✅ Direktna narudžba WhatsApp / email'].map((f, i) => (
                    <div key={i} className="text-left">{f}</div>
                  ))}
                </div>
                <button
                  onClick={() => onGuestAnalysis?.()}
                  className="btn-primary w-full max-w-xs py-4 text-lg font-bold flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Analiziraj vodu
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Moj bazen persistent card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 p-6 rounded-3xl backdrop-blur-xl"
          style={{ background: T.cardBg, border: '1px solid rgba(92,225,230,0.2)', boxShadow: T.cardShadow }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl" style={{ background: 'rgba(92,225,230,0.12)' }}>
              <Droplets className="w-6 h-6" style={{ color: T.cyan }} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Moj bazen</h3>
              <p className="text-sm" style={{ color: T.muted }}>Povijest analiza, podsjetnici i pogodnosti</p>
            </div>
          </div>
          <ul className="space-y-1 text-sm mb-5" style={{ color: T.muted }}>
            {['Povijest svih analiza vode', 'Podsjetnici za tretman', '10 % popusta na opremu', 'Besplatni pregled opreme godišnje'].map(b => (
              <li key={b} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#2EE6A6' }} />
                {b}
              </li>
            ))}
          </ul>
          <button
            onClick={() => onMemberArea?.()}
            className="w-full py-3 rounded-xl text-black font-bold hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(90deg, #0ABFCF 0%, #5CE1E6 100%)' }}
          >
            Otvori Moj bazen
          </button>
        </motion.div>
      </div>
    </div>
  );
}
