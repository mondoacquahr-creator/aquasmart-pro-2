import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ShoppingCart, Search, Package, Plus, Minus, X, MessageCircle, Mail, CreditCard, CheckCircle, Waves } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MONDO_CONTACT,
  SHOP_PRODUCTS,
  getCart,
  setCart,
  setQty,
  clearCart,
  useCart,
  findProduct,
  isEquipment,
  isMemberUser,
  isCareUser,
  memberPrice,
  calcCartTotals,
} from '../lib/mondoShop';
import { T } from '../lib/theme';
import { MemberChip } from './MemberChip';
import { useAuth } from '../contexts/AuthContext';
import { memberApi, isMemberLoggedIn } from '../lib/memberApi';
import { WaterBackground } from './WaterBackground';
import { ProductDetailSheet } from './ProductDetailSheet';
import { PayPalCheckout } from './PayPalCheckout';
import { api } from '../lib/supabase';

interface MondoShopProps {
  onBack: () => void;
  onRegisterMember?: () => void;
  // Nakon poslane narudžbe: član se vraća na Moj bazen, gost na početnu
  onFinished?: () => void;
}

const CATEGORIES = ['Sve', 'pH regulacija', 'Dezinfekcija', 'Alge', 'Bistrenje', 'Održavanje', 'Testiranje', 'Pumpe', 'Filteri', 'Doziranje', 'Elektroliza', 'Ostalo'];
const DIVIDER_AFTER = 'Testiranje';

export function MondoShop({ onBack, onRegisterMember, onFinished }: MondoShopProps) {
  const cart = useCart();
  const [member] = useState<boolean>(() => isMemberUser());
  const [care] = useState<boolean>(() => isCareUser());
  const [view, setView] = useState<'shop' | 'checkout' | 'confirmed'>('shop');
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior }); }, [view]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Sve');
  const [confirmedVia, setConfirmedVia] = useState<'whatsapp' | 'email' | 'paypal' | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [delivery, setDelivery] = useState<'Dostava' | 'Osobno preuzimanje'>('Dostava');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState('');
  const { user } = useAuth();
  const [memberName, setMemberName] = useState<string>(() => user?.name || localStorage.getItem('memberName') || '');

  // Registrirani član: podaci za narudžbu popunjavaju se iz profila
  useEffect(() => {
    if (!member || !isMemberLoggedIn()) return;
    memberApi.getMemberMe().then((d: any) => {
      const pr = d?.profile || {};
      if (pr.name) setMemberName(pr.name);
      setName((v) => v || pr.name || user?.name || '');
      setPhone((v) => v || pr.phone || '');
      setEmail((v) => v || pr.email || user?.email || '');
      const addr = [pr.address, pr.city].filter(Boolean).join(', ');
      setAddress((v) => v || addr);
    }).catch(() => {
      setName((v) => v || user?.name || '');
      setEmail((v) => v || user?.email || '');
    });
  }, [member]);

  // Open checkout immediately if openCheckout flag is set
  useEffect(() => {
    const c = getCart();
    if (c.openCheckout) {
      setCart({ ...c, openCheckout: false });
      setView('checkout');
    }
  }, []);

  const productListRef = useRef<HTMLDivElement>(null);

  const totals = calcCartTotals(cart.items, member, care);
  const cartTotal = totals.total;

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = SHOP_PRODUCTS.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'Sve' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const fmtEUR = (val: number) => val.toFixed(2).replace('.', ',') + ' €';

  const buildOrderText = () => {
    const lines: string[] = [
      'Narudžba – Mondo Pool Care',
      '',
      `Ime: ${name}`,
      `Telefon: ${phone}`,
    ];
    if (email) lines.push(`E-mail: ${email}`);
    lines.push(`Način preuzimanja: ${delivery}`);
    if (delivery === 'Dostava') lines.push(`Adresa dostave: ${address}`);
    if (note) lines.push(`Napomena: ${note}`);
    lines.push('');
    if (cart.analysis) {
      lines.push(`Prema analizi vode: ${cart.analysis}`, '');
    }
    lines.push('Proizvodi:');
    for (const item of cart.items) {
      const p = findProduct(item.productId);
      if (p) {
        lines.push(`${item.quantity}x ${p.name} ${p.size} = ${(p.priceEUR * item.quantity).toFixed(2)} €`);
      }
    }
    const t = calcCartTotals(cart.items, member, care);
    lines.push('', `Međuzbroj: ${t.subtotal.toFixed(2)} €`);
    if (member && t.memberDiscount > 0) lines.push(`${care ? 'Popust Mondo Care 15 %' : 'Popust za članove 10 %'}: -${t.memberDiscount.toFixed(2)} €`);
    if (member && t.extraDiscount > 0) lines.push(`Dodatni popust 5 %: -${t.extraDiscount.toFixed(2)} €`);
    lines.push(`Ukupno: ${t.total.toFixed(2)} €`);
    if (member) lines.push(care ? 'Kupac je Mondo Care član.' : 'Kupac je registrirani član (Moj bazen).');
    return lines.join('\n');
  };

  const validate = () => {
    const missing: string[] = [];
    if (!name.trim()) missing.push('ime');
    if (!phone.trim()) missing.push('telefon');
    if (delivery === 'Dostava' && !address.trim()) missing.push('adresu dostave');
    if (missing.length > 0) {
      setValidationError(`Upišite ${missing.join(', ')}.`);
      return false;
    }
    setValidationError('');
    return true;
  };

  // Registrirani član: narudžba se sprema u Moj bazen → Narudžbe
  const saveForMember = (channel: 'whatsapp' | 'email' | 'paypal', paypalOrderId?: string) => {
    if (!member || !isMemberLoggedIn()) return;
    const items = cart.items.map((i) => {
      const p = findProduct(i.productId);
      return { productId: i.productId, name: p?.name || i.productId, size: p?.size || '', quantity: i.quantity, price: p?.priceEUR || 0 };
    });
    memberApi.saveMemberOrder({ channel, items, total: totals.total, delivery, address: delivery === 'Dostava' ? address : '', note, paypalOrderId }).catch(() => {});
  };

  const handleWhatsApp = () => {
    if (!validate()) return;
    saveForMember('whatsapp');
    window.open(`https://wa.me/${MONDO_CONTACT.whatsapp}?text=${encodeURIComponent(buildOrderText())}`, '_blank');
    setConfirmedVia('whatsapp');
    setView('confirmed');
  };

  const handleEmail = () => {
    if (!validate()) return;
    saveForMember('email');
    window.open(
      `mailto:${MONDO_CONTACT.email}?subject=${encodeURIComponent('Narudžba – Mondo Pool Care')}&body=${encodeURIComponent(buildOrderText())}`,
      '_blank'
    );
    setConfirmedVia('email');
    setView('confirmed');
  };

  // Plaćeno PayPalom: narudžba se šalje Mondo Acqui e-mailom (s PayPal brojem transakcije)
  const handlePayPalPaid = async (info: { paypalOrderId: string; payerEmail?: string; payerName?: string }) => {
    const text = buildOrderText() + `\n\nPLAĆENO PAYPALOM: ${totals.total.toFixed(2)} € (transakcija ${info.paypalOrderId})`;
    try {
      await api.post('shop/paypal-order', {
        paypalOrderId: info.paypalOrderId, amount: totals.total, payerEmail: info.payerEmail || '', payerName: info.payerName || '',
        name, phone, email, delivery, address, note, orderText: text,
      });
    } catch { /* uplata je prošla; Mondo vidi transakciju u PayPalu */ }
    saveForMember('paypal', info.paypalOrderId);
    setConfirmedVia('paypal');
    setView('confirmed');
  };

  // ── CONFIRMED VIEW ──────────────────────────────────────────────────────────
  if (view === 'confirmed') {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-8" style={{ background: T.pageBg }}>
        <WaterBackground />
        <div className="relative z-10 max-w-md w-full space-y-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center"
            style={{ background: '#2EFF8820' }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: '#2EFF88' }} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="text-2xl font-bold mb-3">{confirmedVia === 'paypal' ? 'Plaćanje je primljeno' : 'Narudžba je pripremljena'}</h2>
            <p style={{ color: T.muted }}>
              {confirmedVia === 'paypal'
                ? 'Hvala! Narudžba je plaćena PayPalom i poslana Mondo Acqui, koja će vas kontaktirati oko dostave.'
                : <>Narudžba je pripremljena i otvorena u {confirmedVia === 'whatsapp' ? 'WhatsAppu' : 'e-mailu'}. Pošaljite poruku i Mondo Acqua će vas kontaktirati.</>}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-3">
            <button
              onClick={() => { clearCart(); if (onFinished) onFinished(); else setView('shop'); }}
              className="btn-primary w-full py-4 font-semibold"
            >
              {member ? 'Gotovo – natrag na Moj bazen' : 'Gotovo – natrag na početnu'}
            </button>
            <button
              onClick={() => { clearCart(); setView('shop'); }}
              className="btn-secondary w-full py-4 font-semibold"
            >
              Nova narudžba u trgovini
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── CHECKOUT VIEW ───────────────────────────────────────────────────────────
  if (view === 'checkout') {
    return (
      <div className="relative min-h-screen pb-12" style={{ background: T.pageBg }}>
        <WaterBackground />

        {/* Header */}
        <div className="relative z-10" style={{ background: T.cardBg, backdropFilter: 'blur(20px)', borderBottom: T.cardBorder }}>
          <div className="max-w-[1180px] mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={() => setView('shop')} className="glass-card w-10 h-10 flex items-center justify-center hover:bg-white/5 transition-all">
              <ArrowLeft className="w-5 h-5" style={{ color: T.cyan }} />
            </button>
            <div className="w-10 h-10 flex items-center justify-center" style={{ background: T.cyan, borderRadius: '12px' }}>
              <ShoppingCart className="w-6 h-6" style={{ color: '#000' }} />
            </div>
            <h1 className="font-bold text-lg">Završi narudžbu</h1>
          </div>
        </div>

        <div className="relative z-10 max-w-[1180px] mx-auto px-6 py-8 space-y-6">
          {/* Cart items */}
          <div className="glass-card p-6">
            <h2 className="font-semibold text-lg mb-4">Vaša košarica</h2>
            <div className="flex flex-col">
              {cart.items.map((item, idx) => {
                const p = findProduct(item.productId);
                if (!p) return null;
                const shopProduct = p;
                return (
                  <div
                    key={item.productId}
                    className="py-3 flex flex-col gap-2"
                    style={idx > 0 ? { borderTop: '1px solid rgba(120,220,255,0.08)' } : undefined}
                  >
                    {/* Line 1: image + name/size + remove */}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
                        style={{ background: '#fff' }}
                      >
                        {shopProduct?.imageUrl ? (
                          <img
                            src={shopProduct.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                              const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                              if (fb) fb.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span
                          className="w-full h-full items-center justify-center"
                          style={{ display: shopProduct?.imageUrl ? 'none' : 'flex' }}
                        >
                          <Package className="w-5 h-5" style={{ color: T.cyan }} />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-white leading-snug">{p.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: T.faint }}>{p.size}</div>
                      </div>
                      <button
                        onClick={() => setQty(item.productId, 0)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 flex-shrink-0 mt-0.5"
                      >
                        <X className="w-3 h-3" style={{ color: T.faint }} />
                      </button>
                    </div>
                    {/* Line 2: stepper + price aligned right */}
                    <div className="flex items-center justify-end gap-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setQty(item.productId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5">
                          <Minus className="w-3 h-3" style={{ color: '#FF3B30' }} />
                        </button>
                        <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => setQty(item.productId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5">
                          <Plus className="w-3 h-3" style={{ color: '#2EFF88' }} />
                        </button>
                      </div>
                      <div className="font-bold text-sm text-white w-20 text-right">{fmtEUR(p.priceEUR * item.quantity)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setView('shop')}
              className="w-full mt-3 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-white/5"
              style={{ border: `1px solid ${T.cyan}55`, color: T.cyan }}
            >
              <Plus className="w-4 h-4" />
              Dodaj još proizvoda
            </button>

            <div className="mt-4 pt-4 space-y-2" style={{ borderTop: T.cardBorder }}>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: T.muted }}>Međuzbroj</span>
                <span>{fmtEUR(totals.subtotal)}</span>
              </div>
              {member && totals.memberDiscount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#2EFF88' }}>{care ? 'Popust Mondo Care (15 %)' : 'Popust za članove (10 %)'}</span>
                  <span style={{ color: '#2EFF88' }}>−{fmtEUR(totals.memberDiscount)}</span>
                </div>
              )}
              {member && totals.extraDiscount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#2EFF88' }}>Dodatni popust 5 % (iznad 2.000 €)</span>
                  <span style={{ color: '#2EFF88' }}>−{fmtEUR(totals.extraDiscount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(120,220,255,0.08)' }}>
                <span className="font-medium">Ukupno:</span>
                <span className="text-2xl font-bold">{fmtEUR(totals.total)}</span>
              </div>
              {member && totals.toExtra > 0 && (
                <p className="text-xs" style={{ color: T.muted }}>
                  Još {fmtEUR(totals.toExtra)} do dodatnih 5 % popusta.
                </p>
              )}
              {!member && totals.subtotal > 0 && (
                <div className="mt-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(46,255,136,0.08)', border: '1px solid rgba(46,255,136,0.25)' }}>
                  <span className="text-sm" style={{ color: '#2EFF88' }}>
                    Kao registrirani član platili biste {fmtEUR(calcCartTotals(cart.items, true).total)}.{' '}
                  </span>
                  {onRegisterMember && (
                    <button
                      onClick={onRegisterMember}
                      className="text-sm font-semibold underline"
                      style={{ color: '#2EFF88' }}
                    >
                      Besplatna registracija
                    </button>
                  )}
                </div>
              )}
              {cart.items.some(i => isEquipment(i.productId)) && (
                <p className="text-xs mt-2" style={{ color: T.muted }}>
                  Za opremu Mondo Acqua potvrđuje dostupnost, rok isporuke i po želji ugradnju.
                </p>
              )}
            </div>
            <p className="text-xs mt-2" style={{ color: T.faint }}>
              Cijene su informativne. Mondo Acqua potvrđuje dostupnost, konačnu cijenu i dostavu.
            </p>
          </div>

          {/* Analysis summary */}
          {cart.analysis && (
            <div className="glass-card p-4" style={{ border: T.cardBorder, background: `${T.cyan}08` }}>
              <p className="text-xs font-semibold mb-1" style={{ color: T.cyan }}>Prema analizi vode</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{cart.analysis}</p>
            </div>
          )}

          {/* Customer form */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Vaši podaci</h2>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: T.muted }}>Ime i prezime *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-glass w-full px-4 py-3" placeholder="Marko Horvat" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: T.muted }}>Telefon *</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-glass w-full px-4 py-3" placeholder="+385 91 234 5678" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: T.muted }}>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-glass w-full px-4 py-3" placeholder="marko@email.hr" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: T.muted }}>Način preuzimanja</label>
              <div className="flex gap-2">
                {(['Dostava', 'Osobno preuzimanje'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDelivery(d)}
                    className="flex-1 py-2.5 rounded-xl font-medium text-sm transition-all"
                    style={delivery === d
                      ? { background: `${T.cyan}18`, border: `1px solid ${T.cyan}`, color: T.cyan }
                      : { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }
                    }
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {delivery === 'Dostava' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: T.muted }}>Adresa dostave *</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input-glass w-full px-4 py-3" placeholder="Ilica 1, 10000 Zagreb" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: T.muted }}>Napomena</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input-glass w-full px-4 py-3 resize-none"
                placeholder="Npr. dostava u poslijepodnevnim satima..."
                rows={3}
              />
            </div>
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF3B30' }}>
              {validationError}
            </div>
          )}

          {/* Send buttons */}
          <div className="space-y-3">
            <button
              onClick={handleWhatsApp}
              className="w-full py-4 font-semibold text-base flex items-center justify-center gap-3 rounded-2xl transition-all hover:opacity-90"
              style={{ background: '#25D366', color: '#fff' }}
            >
              <MessageCircle className="w-5 h-5" />
              Pošalji narudžbu WhatsAppom
            </button>
            <button
              onClick={handleEmail}
              className="btn-secondary w-full py-4 font-semibold text-base flex items-center justify-center gap-3"
            >
              <Mail className="w-5 h-5" />
              Pošalji narudžbu e-mailom
            </button>
            {totals.total > 0 && (
              <div className="pt-2">
                <p className="text-sm font-semibold flex items-center gap-2 mb-2" style={{ color: T.muted }}>
                  <CreditCard className="w-4 h-4" /> Ili platite odmah ({fmtEUR(totals.total)}) – PayPal ili kartica
                </p>
                <PayPalCheckout
                  amountEUR={totals.total}
                  description="Narudžba – Mondo Pool Care"
                  canPay={validate}
                  onPaid={handlePayPalPaid}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── SHOP VIEW ───────────────────────────────────────────────────────────────
  const productCount = filteredProducts.length;
  const productCountLabel = productCount === 1 ? '1 proizvod' : `${productCount} proizvoda`;
  const categoryLabel = category === 'Sve' ? 'Svi proizvodi' : category;

  const deriveDescription = (product: { name: string; description?: string }): string | null => {
    if ('description' in product && typeof product.description === 'string' && product.description) {
      return product.description;
    }
    const lower = product.name.toLowerCase();
    if (lower.includes('plus')) return 'Podiže pH vrijednost vode';
    if (lower.includes('minus')) return 'Snižava pH vrijednost vode';
    return null;
  };

  return (
    <div className="relative min-h-screen pb-32" style={{ background: T.pageBg }}>
      <WaterBackground />

      {/* ── STICKY HEADER ────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(2,13,18,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: T.cardBorder,
        }}
      >
        <div className="max-w-[1180px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.15)' }}
              aria-label="Natrag"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: T.cyan }} />
            </button>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: T.cyan }}
            >
              <Waves className="w-5 h-5" style={{ color: '#020D12' }} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white leading-tight">Mondo Acqua</div>
              <div className="text-xs leading-tight" style={{ color: T.muted }}>webshop</div>
            </div>
          </div>

          {/* Right – ime člana + Košarica */}
          <div className="flex items-center gap-2 flex-shrink-0">
          {member && memberName && <div className="hidden sm:block"><MemberChip name={memberName} label="član · popust" /></div>}
          <button
            onClick={() => {
              if (cartCount > 0) {
                setView('checkout');
              } else {
                productListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[#020D12] flex-shrink-0 transition-all hover:opacity-90"
            style={{
              background: T.accent,
              boxShadow: '0 0 16px rgba(79,195,240,0.35)',
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm">Košarica</span>
            {cartCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full"
                style={{ background: '#fff', color: '#000' }}
              >
                {cartCount}
              </span>
            )}
          </button>
          </div>
        </div>
      </div>

      {/* ── INTRO ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-[1180px] mx-auto px-4 pt-8 pb-6">
        {/* Title + Search: two-col on desktop, stacked on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-4">
          {/* Title block */}
          <div className="sm:flex-1 min-w-0">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: T.cyan }}
            >
              Mondo Acqua · Webshop
            </p>
            <h1
              className="font-bold text-white leading-tight mb-2"
              style={{ fontSize: 'clamp(32px, 6vw, 44px)' }}
            >
              Proizvodi za bazen
            </h1>
            <p className="text-sm" style={{ color: T.muted }}>
              Kemija i oprema za bazen – pronađite proizvod po nazivu ili namjeni.
            </p>
          </div>

          {/* Search */}
          <div className="relative sm:w-64 sm:flex-shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: T.faint }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pretraži proizvode..."
              className="input-glass w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm"
              style={{ background: T.inputBg, border: T.inputBorder, paddingLeft: 40 }}
            />
          </div>
        </div>

        {/* Category pills – wrap so every category (incl. equipment) is always visible */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pb-1">
          {CATEGORIES.map((cat) => (
            <React.Fragment key={cat}>
              {cat === 'Pumpe' && (
                <div
                  className="flex-shrink-0 self-center"
                  style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)' }}
                />
              )}
              <button
                onClick={() => setCategory(cat)}
                className="flex-shrink-0 px-4 py-1.5 text-sm font-semibold transition-all rounded-full"
                style={
                  category === cat
                    ? { background: T.cyan, color: '#020D12', scrollSnapAlign: 'start' }
                    : {
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        scrollSnapAlign: 'start',
                      }
                }
              >
                {cat}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Benefit banner */}
        <div
          className="mt-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          style={{
            background: 'rgba(46,255,136,0.08)',
            border: '1px solid rgba(46,255,136,0.25)',
            padding: '12px 14px',
          }}
        >
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {member
              ? care
                ? '✓ Mondo Care: −15 % na sve proizvode i dodatnih −5 % iznad 2.000 €.'
                : '✓ Kao član ostvarujete −10 % na sve proizvode i dodatnih −5 % iznad 2.000 €.'
              : 'Registrirani vlasnici bazena: −10 % na kemiju i opremu, dodatnih −5 % za narudžbe iznad 2.000 €.'}
          </p>
          {!member && onRegisterMember && (
            <button
              onClick={onRegisterMember}
              className="flex-shrink-0 px-4 py-1.5 rounded-xl text-sm font-semibold transition-all"
              style={{ color: '#2EFF88', border: '1px solid rgba(46,255,136,0.5)', background: 'transparent' }}
            >
              Besplatna registracija
            </button>
          )}
        </div>

        {/* Divider row */}
        <div
          className="flex items-center justify-between mt-4 pb-3"
          style={{ borderBottom: T.cardBorder }}
        >
          <span className="font-semibold text-sm text-white">{categoryLabel}</span>
          <span className="text-sm" style={{ color: T.muted }}>{productCountLabel}</span>
        </div>
      </div>

      {/* ── PRODUCT LIST ─────────────────────────────────────────────────── */}
      <div ref={productListRef} className="relative z-10 max-w-[1180px] mx-auto px-4 pb-8 grid gap-3 lg:grid-cols-2">
        {filteredProducts.length === 0 ? (
          <p className="text-center py-12 lg:col-span-2" style={{ color: T.muted }}>
            Nema proizvoda za zadani pojam.
          </p>
        ) : (
          filteredProducts.map((product, idx) => {
            const cartItem = cart.items.find((i) => i.productId === product.id);
            const qty = cartItem?.quantity || 0;
            const description = deriveDescription(product as any);

            const ActionEl = qty > 0 ? (
              <div
                className="flex items-center gap-0 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: T.cardBorder, background: T.inputBg }}
              >
                <button
                  onClick={() => setQty(product.id, qty - 1)}
                  className="w-8 h-8 flex items-center justify-center transition-all hover:bg-white/10"
                >
                  <Minus className="w-3.5 h-3.5" style={{ color: '#FF3B30' }} />
                </button>
                <span className="font-bold text-sm w-7 text-center">{qty}</span>
                <button
                  onClick={() => setQty(product.id, qty + 1)}
                  className="w-8 h-8 flex items-center justify-center transition-all hover:bg-white/10"
                >
                  <Plus className="w-3.5 h-3.5" style={{ color: '#2EFF88' }} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setQty(product.id, 1)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full font-bold text-[#020D12] text-sm transition-all hover:opacity-90"
                style={{
                  background: T.accent,
                  boxShadow: '0 0 12px rgba(79,195,240,0.3)',
                }}
              >
                + Dodaj
              </button>
            );

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.025, 0.35) }}
                className="rounded-3xl p-[14px] transition-all"
                style={{
                  background: T.cardBg,
                  border: T.cardBorder,
                  boxShadow: T.cardShadow,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.border = '1px solid rgba(92,225,230,0.3)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.border = T.cardBorder;
                }}
              >
                {/* ── DESKTOP layout (sm+): single row ── */}
                <div className="hidden sm:flex items-center gap-4">
                  {/* Image */}
                  <div
                    className="rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer"
                    style={{ width: 88, height: 72, background: '#fff' }}
                    onClick={() => setDetailId(product.id)}
                  >
                    {product.imageUrl ? (
                      <>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const el = e.currentTarget;
                            el.style.display = 'none';
                            const fb = el.nextElementSibling as HTMLElement | null;
                            if (fb) fb.style.display = 'flex';
                          }}
                        />
                        <span className="w-full h-full items-center justify-center" style={{ display: 'none' }}>
                          <Package className="w-8 h-8" style={{ color: T.cyan }} />
                        </span>
                      </>
                    ) : (
                      <Package className="w-8 h-8" style={{ color: T.cyan }} />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setDetailId(product.id)}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: T.cyan }}>
                      {product.category}
                    </p>
                    <p className="font-bold text-white text-[18px] leading-tight truncate">{product.name}</p>
                    {description && (
                      <p className="text-sm mt-0.5 truncate" style={{ color: T.muted }}>{description}</p>
                    )}
                    <span
                      className="inline-block mt-1 px-2 py-0.5 rounded-md text-[12px]"
                      style={{ background: 'rgba(255,255,255,0.06)', color: T.muted }}
                    >
                      {isEquipment(product.id) ? product.size : `Pakiranje: ${product.size}`}
                    </span>
                    <span className="ml-2 text-[12px] font-semibold" style={{ color: T.cyan }}>Detalji ›</span>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    {member ? (
                      <>
                        <p className="text-xs line-through" style={{ color: T.faint }}>{fmtEUR(product.priceEUR)}</p>
                        <p className="font-bold text-white text-[20px] leading-tight">{fmtEUR(memberPrice(product.priceEUR, care))}</p>
                        <p className="text-[11px] font-semibold" style={{ color: '#2EFF88' }}>{care ? 'Mondo Care cijena' : 'Cijena za članove'}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-white text-[20px] leading-tight">{fmtEUR(product.priceEUR)}</p>
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

                  {/* Action */}
                  {ActionEl}
                </div>

                {/* ── MOBILE layout (<sm): two rows ── */}
                <div className="flex sm:hidden flex-col gap-2">
                  {/* Row 1: image + text */}
                  <div className="flex items-start gap-3 cursor-pointer" onClick={() => setDetailId(product.id)}>
                    {/* Image */}
                    <div
                      className="rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                      style={{ width: 72, height: 64, background: '#fff' }}
                    >
                      {product.imageUrl ? (
                        <>
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const el = e.currentTarget;
                              el.style.display = 'none';
                              const fb = el.nextElementSibling as HTMLElement | null;
                              if (fb) fb.style.display = 'flex';
                            }}
                          />
                          <span className="w-full h-full items-center justify-center" style={{ display: 'none' }}>
                            <Package className="w-7 h-7" style={{ color: T.cyan }} />
                          </span>
                        </>
                      ) : (
                        <Package className="w-7 h-7" style={{ color: T.cyan }} />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: T.cyan }}>
                        {product.category}
                      </p>
                      <p className="font-bold text-white text-base leading-tight">{product.name}</p>
                      {description && (
                        <p className="text-xs mt-0.5" style={{ color: T.muted }}>{description}</p>
                      )}
                      <span
                        className="inline-block mt-1 px-2 py-0.5 rounded-md text-[11px]"
                        style={{ background: 'rgba(255,255,255,0.06)', color: T.muted }}
                      >
                        {isEquipment(product.id) ? product.size : `Pakiranje: ${product.size}`}
                      </span>
                      <span className="ml-2 text-[11px] font-semibold" style={{ color: T.cyan }}>Detalji ›</span>
                    </div>
                  </div>

                  {/* Row 2: price + action aligned right */}
                  <div className="flex items-center justify-end gap-3">
                    <div className="text-right">
                      {member ? (
                        <>
                          <p className="text-[11px] line-through" style={{ color: T.faint }}>{fmtEUR(product.priceEUR)}</p>
                          <p className="font-bold text-white text-lg leading-tight">{fmtEUR(memberPrice(product.priceEUR, care))}</p>
                          <p className="text-[10px] font-semibold" style={{ color: '#2EFF88' }}>{care ? 'Mondo Care cijena' : 'Cijena za članove'}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-white text-lg leading-tight">{fmtEUR(product.priceEUR)}</p>
                          <p
                            className="text-[10px]"
                            style={{ color: '#2EFF88', cursor: onRegisterMember ? 'pointer' : 'default' }}
                            onClick={onRegisterMember}
                          >
                            Članovi: {fmtEUR(memberPrice(product.priceEUR))}
                          </p>
                        </>
                      )}
                    </div>
                    {ActionEl}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        {/* Bottom hint */}
        {cartCount === 0 && filteredProducts.length > 0 && (
          <p className="text-center pt-4 text-sm" style={{ color: T.faint }}>
            Odaberi proizvod za nastavak ›
          </p>
        )}
      </div>

      {/* ── KARTICA PROIZVODA ────────────────────────────────────────────── */}
      <AnimatePresence>
        {detailId && findProduct(detailId) && (
          <ProductDetailSheet
            key={detailId}
            product={findProduct(detailId)!}
            qty={cart.items.find((i) => i.productId === detailId)?.quantity || 0}
            member={member}
            care={care}
            onClose={() => setDetailId(null)}
            onRegisterMember={onRegisterMember}
          />
        )}
      </AnimatePresence>

      {/* ── STICKY BOTTOM BAR ────────────────────────────────────────────── */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-30 p-4"
            style={{ background: 'rgba(2,13,18,0.96)', backdropFilter: 'blur(12px)', borderTop: T.cardBorder }}
          >
            <div className="max-w-[1180px] mx-auto">
              <button
                onClick={() => setView('checkout')}
                className="btn-primary w-full py-4 text-base font-semibold flex items-center justify-between px-6"
              >
                <span>
                  {cartCount} {cartCount === 1 ? 'proizvod' : 'proizvoda'} · ukupno {fmtEUR(totals.total)}
                </span>
                <span>Završi narudžbu →</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
