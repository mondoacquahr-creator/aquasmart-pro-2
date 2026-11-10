import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, Package, Plus, Minus, Loader2, AlertTriangle } from 'lucide-react';
import { T } from '../lib/theme';
import {
  ShopProduct,
  ProductDetails,
  loadProductDetails,
  setQty,
  isEquipment,
  memberPrice,
  MONDO_CONTACT,
} from '../lib/mondoShop';

// Kartica proizvoda u webshopu: veća slika, opis, upute i doziranje prema proizvođaču, tehnički podaci.

interface Props {
  product: ShopProduct;
  qty: number;
  member: boolean;
  care: boolean;
  onClose: () => void;
  onRegisterMember?: () => void;
}

const fmtEUR = (val: number) => val.toFixed(2).replace('.', ',') + ' €';

export function ProductDetailSheet({ product, qty, member, care, onClose, onRegisterMember }: Props) {
  const [details, setDetails] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [imgOk, setImgOk] = useState(!!product.imageUrl);

  useEffect(() => {
    let alive = true;
    setLoading(true); setFailed(false);
    loadProductDetails()
      .then((all) => { if (alive) setDetails(all[product.id] || null); })
      .catch(() => { if (alive) setFailed(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [product.id]);

  // Zatvaranje tipkom Esc i zaključavanje pomicanja stranice ispod kartice
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const description = details?.description || product.description || '';
  const usage = details?.usage || [];
  const params = (details?.params || []).filter((p) => Array.isArray(p) && p[0] && p[1]);
  const source = details?.source || (isEquipment(product.id) ? 'Vagner Pool' : 'Ivero d.o.o.');

  const sectionTitle = (text: string) => (
    <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: T.cyan }}>{text}</p>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={product.name}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="relative w-full sm:max-w-[560px] max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{ background: '#06161D', border: T.cardBorder, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
      >
        {/* Slika */}
        <div className="relative flex items-center justify-center" style={{ background: '#fff', height: 240 }}>
          {product.imageUrl && imgOk ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-4" onError={() => setImgOk(false)} />
          ) : (
            <Package className="w-16 h-16" style={{ color: T.cyan }} />
          )}
          <button
            onClick={onClose}
            aria-label="Zatvori"
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(2,13,18,0.75)' }}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Naziv, pakiranje, cijena */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: T.cyan }}>{product.category}</p>
            <h2 className="font-bold text-white text-xl leading-tight">{product.name}</h2>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[12px]" style={{ background: 'rgba(255,255,255,0.06)', color: T.muted }}>
              {isEquipment(product.id) ? product.size : `Pakiranje: ${product.size}`}
            </span>

            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                {member ? (
                  <>
                    <p className="text-xs line-through" style={{ color: T.faint }}>{fmtEUR(product.priceEUR)}</p>
                    <p className="font-bold text-white text-2xl leading-tight">{fmtEUR(memberPrice(product.priceEUR, care))}</p>
                    <p className="text-[11px] font-semibold" style={{ color: '#2EFF88' }}>{care ? 'Mondo Care cijena' : 'Cijena za članove'}</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-white text-2xl leading-tight">{fmtEUR(product.priceEUR)}</p>
                    <p
                      className="text-[11px]"
                      style={{ color: '#2EFF88', cursor: onRegisterMember ? 'pointer' : 'default' }}
                      onClick={onRegisterMember}
                    >
                      Članovi: {fmtEUR(memberPrice(product.priceEUR))}
                    </p>
                  </>
                )}
              </div>
              {qty > 0 ? (
                <div className="flex items-center rounded-full overflow-hidden flex-shrink-0" style={{ border: T.cardBorder, background: T.inputBg }}>
                  <button onClick={() => setQty(product.id, qty - 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10" aria-label="Smanji količinu">
                    <Minus className="w-4 h-4" style={{ color: '#FF3B30' }} />
                  </button>
                  <span className="font-bold w-8 text-center">{qty}</span>
                  <button onClick={() => setQty(product.id, qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10" aria-label="Povećaj količinu">
                    <Plus className="w-4 h-4" style={{ color: '#2EFF88' }} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setQty(product.id, 1)}
                  className="flex-shrink-0 px-5 py-2.5 rounded-full font-bold text-[#020D12] text-sm hover:opacity-90"
                  style={{ background: T.accent, boxShadow: '0 0 12px rgba(79,195,240,0.3)' }}
                >
                  + Dodaj u košaricu
                </button>
              )}
            </div>
          </div>

          {loading && (
            <p className="text-sm flex items-center gap-2" style={{ color: T.muted }}>
              <Loader2 className="w-4 h-4 animate-spin" /> Učitavam podatke o proizvodu…
            </p>
          )}

          {!loading && description && (
            <div>
              {sectionTitle('Opis')}
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.85)' }}>{description}</p>
            </div>
          )}

          {!loading && usage.length > 0 && (
            <div>
              {sectionTitle('Upute za uporabu i doziranje')}
              <ul className="space-y-1.5">
                {usage.map((line, i) => (
                  <li key={i} className="text-sm leading-relaxed flex gap-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    <span style={{ color: T.cyan }}>•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!loading && details?.warning && (
            <div className="flex gap-2 rounded-2xl p-3 text-sm" style={{ background: 'rgba(255,176,32,0.08)', border: '1px solid rgba(255,176,32,0.3)', color: '#FFD27A' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{details.warning}</span>
            </div>
          )}

          {!loading && params.length > 0 && (
            <div>
              {sectionTitle('Tehnički podaci')}
              <dl className="rounded-2xl overflow-hidden" style={{ border: T.cardBorder }}>
                {params.map(([label, value], i) => (
                  <div key={i} className="flex justify-between gap-4 px-3 py-2 text-sm" style={i > 0 ? { borderTop: '1px solid rgba(120,220,255,0.08)' } : undefined}>
                    <dt style={{ color: T.muted }}>{label}</dt>
                    <dd className="text-right text-white">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {!loading && !details && (
            <p className="text-sm" style={{ color: T.muted }}>
              {failed ? 'Podatke o proizvodu trenutno nije moguće učitati. ' : ''}
              Za detaljne informacije o ovom proizvodu javite se Mondo Acqui na {MONDO_CONTACT.phone} ili {MONDO_CONTACT.email}.
            </p>
          )}

          {!loading && details && (
            <p className="text-xs pt-1" style={{ color: T.faint }}>
              Podaci proizvođača ({source}).{isEquipment(product.id) ? '' : ' Prije uporabe uvijek pročitajte uputu na pakiranju.'}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
