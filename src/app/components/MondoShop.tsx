import React, { useState, useEffect, useRef } from 'react';
import { anchorDateLabel, anchorPrice } from '../lib/anchorPrices';
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
  hasRobotBonus,
  bfPrice,
  bfSlotsLeft,
  BF_SLOTS_TOTAL,
  loadProductDetails,
  calcCartTotals,
} from '../lib/mondoShop';
import { T } from '../lib/theme';
import { MemberChip } from './MemberChip';
import { useAuth } from '../contexts/AuthContext';
import { memberApi, isMemberLoggedIn } from '../lib/memberApi';
import { WaterBackground } from './WaterBackground';
import { ProductDetailSheet } from './ProductDetailSheet';
import { PayPalCheckout } from './PayPalCheckout';
import { ReturnPolicy } from './ReturnPolicy';
import { api } from '../lib/supabase';

interface MondoShopProps {
  onBack: () => void;
  onRegisterMember?: () => void;
  // Nakon poslane narudžbe: član se vraća na Moj bazen, gost na početnu
  onFinished?: () => void;
}

// Glavne skupine webshopa i njihove podkategorije (p.category)
const GROUPS: { name: string; subs: string[] }[] = [
  { name: 'Kemija za bazen', subs: ['pH regulacija', 'Dezinfekcija', 'Alge', 'Bistrenje', 'Održavanje', 'Ostalo'] },
  { name: 'Spa kemija', subs: ['Spa i hidromasažne kade'] },
  { name: 'Testiranje vode', subs: ['Testiranje'] },
  { name: 'Strojarnica', subs: ['Pumpe', 'Filteri', 'Doziranje', 'Elektroliza', 'Toplinske pumpe'] },
  { name: 'Oprema i čišćenje', subs: ['Robotski usisavači', 'Baterijski usisavači', 'Pribor za čišćenje', 'Ljestve', 'Rasvjeta', 'Solarne folije', 'Folije za bazen'] },
];
// ── Pretraga: bez kvačica, sve riječi, oblici riječi (pumpa/pumpe), kategorija i opis ──
const norm = (t: string) => t.toLowerCase().replace(/đ/g, 'd').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const SYNONYMS: Record<string, string> = {
  usisavac: 'robot', usisavaci: 'robot', cistac: 'robot', cetka: 'cetk', cetke: 'cetk', mreza: 'mrez', mrezica: 'mrez', sipka: 'sipk', stap: 'sipk', crijevo: 'crijev', termometar: 'termometar', toplomjer: 'termometar', reflektor: 'svjetl', reflektori: 'svjetl', lampa: 'svjetl',
  rasvjeta: 'svjetl', grijanje: 'toplinsk', grijac: 'toplinsk', kemija: 'kemija', pokrivac: 'solarn', prekrivac: 'solarn',
  stepenice: 'ljestv', merdevine: 'ljestv', tester: 'test', klora: 'klor', ph: 'ph',
};
const haystackOf = (p: { name: string; size: string; category: string; description?: string }) => {
  const g = GROUPS.find((x) => x.subs.includes(p.category));
  return norm([p.name, p.size, p.category, SUB_LABEL[p.category] || '', g ? g.name : '', p.description || ''].join(' '));
};
const matchesSearch = (p: { name: string; size: string; category: string; description?: string }, q: string) => {
  const hay = haystackOf(p);
  return norm(q).split(/\s+/).filter(Boolean).every((w) => {
    // broj mora biti cijeli broj: "4" ne smije pogoditi "304"
    if (/^\d+([.,]\d+)?$/.test(w)) return new RegExp(`(^|[^\\d,.])${w.replace('.', ',').replace(/[.,]/, '[.,]')}([^\\d]|$)`).test(hay);
    if (hay.includes(w)) return true;
    const syn = SYNONYMS[w];
    if (syn && hay.includes(syn)) return true;
    // osnova riječi: "pumpe" -> "pump", "ljestvama" -> "ljestv"
    const stem = w.length > 4 ? w.slice(0, Math.max(4, w.length - 2)) : w;
    return hay.includes(stem);
  });
};

export const SHIPPING_EUR = 10;
// Lokalna kopija slike nije dostupna -> jednom probaj izvornu sliku dobavljača
const swapToSource = (el: HTMLImageElement) => {
  const fb = el.dataset.fallback;
  if (!fb || el.src === fb) return false;
  delete el.dataset.fallback;
  el.src = fb;
  return true;
};
const SUB_LABEL: Record<string, string> = { 'Održavanje': 'Zimovanje i zaštita', 'Ostalo': 'Ostala kemija', 'Robotski usisavači': 'Roboti', 'Baterijski usisavači': 'Ručni baterijski' };
const DIVIDER_AFTER = 'Testiranje';
// Straničenje i filteri kataloga (stanje se čuva u adresi: ?stranica=webshop&skupina=…&kat=…&cijena=…&poredak=…&str=…&q=…)
const PAGE_SIZE = 24;
const PRICE_RANGES: { key: string; label: string; min: number; max: number }[] = [
  { key: 'do-20', label: 'do 20 €', min: 0, max: 20 },
  { key: '20-100', label: '20–100 €', min: 20, max: 100 },
  { key: '100-500', label: '100–500 €', min: 100, max: 500 },
  { key: 'iznad-500', label: 'iznad 500 €', min: 500, max: Infinity },
];
const inRange = (price: number, key: string) => {
  const r = PRICE_RANGES.find((x) => x.key === key);
  return !r || (price >= r.min && price < r.max);
};
const urlParam = (k: string) => { try { return new URLSearchParams(window.location.search).get(k) || ''; } catch { return ''; } };



export function MondoShop({ onBack, onRegisterMember, onFinished }: MondoShopProps) {
  // Učitava broj preostalih Black Friday mjesta za nove članove (i opise proizvoda) pa osvježi prikaz.
  const [, setBfTick] = useState(0);
  useEffect(() => { loadProductDetails().then(() => setBfTick((t) => t + 1)).catch(() => {}); }, []);
  const cart = useCart();
  const [member] = useState<boolean>(() => isMemberUser());
  const [care] = useState<boolean>(() => isCareUser());
  const [view, setView] = useState<'shop' | 'checkout' | 'confirmed'>('shop');
  const [emptyCart, setEmptyCart] = useState(false);
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior }); }, [view]);
  const [search, setSearch] = useState(() => urlParam('q'));
  const [group, setGroup] = useState(() => (GROUPS.some((g) => g.name === urlParam('skupina')) ? urlParam('skupina') : 'Sve'));
  const [category, setCategory] = useState(() => (SHOP_PRODUCTS.some((p) => p.category === urlParam('kat')) ? urlParam('kat') : 'Sve'));
  const [priceRange, setPriceRange] = useState(() => (PRICE_RANGES.some((r) => r.key === urlParam('cijena')) ? urlParam('cijena') : ''));
  const [sort, setSort] = useState<'' | 'cijena-rastuce' | 'cijena-padajuce'>(() => {
    const v = urlParam('poredak');
    return v === 'cijena-rastuce' || v === 'cijena-padajuce' ? v : '';
  });
  const [page, setPage] = useState(() => Math.max(1, parseInt(urlParam('str'), 10) || 1));
  const [confirmedVia, setConfirmedVia] = useState<'whatsapp' | 'email' | 'paypal' | null>(null);
  const [detailId, setDetailId] = useState<string | null>(() => {
    const id = new URLSearchParams(window.location.search).get('proizvod');
    return id && findProduct(id) ? id : null;
  });

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

  // Narudžba WhatsAppom/e-mailom plaća se uplatom na račun → vrijede Black Friday cijene; PayPal bez njih.
  const totals = calcCartTotals(cart.items, member, care, true);
  const paypalTotals = calcCartTotals(cart.items, member, care, false);
  const cartTotal = totals.total;
  // Dostava: fiksno 10 € (isto kao u Google Merchant Centeru); osobno preuzimanje je besplatno.
  const shippingEUR = delivery === 'Dostava' && totals.total > 0 ? SHIPPING_EUR : 0;
  const grandTotal = Math.round((totals.total + shippingEUR) * 100) / 100;
  const paypalGrandTotal = Math.round((paypalTotals.total + shippingEUR) * 100) / 100;

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const query = search.trim();
  const filteredProducts = SHOP_PRODUCTS.filter((p) => {
    // Kad se pretražuje, traži se kroz sve proizvode, bez obzira na odabranu skupinu.
    if (query) return matchesSearch(p, query);
    const g = GROUPS.find((x) => x.name === group);
    return category !== 'Sve' ? p.category === category : !g || g.subs.includes(p.category);
  });
  const rangeCount = (key: string) => filteredProducts.filter((p) => inRange(p.priceEUR, key)).length;
  const shownProducts = filteredProducts.filter((p) => inRange(p.priceEUR, priceRange));
  if (sort) shownProducts.sort((a, b) => (sort === 'cijena-rastuce' ? a.priceEUR - b.priceEUR : b.priceEUR - a.priceEUR));
  const pageCount = Math.max(1, Math.ceil(shownProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageProducts = shownProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  // Promjena filtra vraća na prvu stranicu
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    setPage(1);
  }, [query, group, category, priceRange, sort]);
  // Stanje kataloga i otvoreni proizvod zapisuju se u adresu (bez novog unosa u povijest)
  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      const sp = u.searchParams;
      if (!sp.get('stranica')) sp.set('stranica', 'webshop');
      const set = (k: string, v: string) => (v ? sp.set(k, v) : sp.delete(k));
      set('q', query);
      set('skupina', group !== 'Sve' ? group : '');
      set('kat', category !== 'Sve' ? category : '');
      set('cijena', priceRange);
      set('poredak', sort);
      set('str', currentPage > 1 ? String(currentPage) : '');
      set('proizvod', detailId || '');
      const next = u.pathname + (sp.toString() ? `?${sp.toString()}` : '') + u.hash;
      if (next !== window.location.pathname + window.location.search + window.location.hash) window.history.replaceState(window.history.state, '', next);
    } catch { /* adresa nije ključna */ }
  }, [query, group, category, priceRange, sort, currentPage, detailId]);
  // Naslov i kanonska adresa otvorenog proizvoda
  useEffect(() => {
    const prod = detailId ? findProduct(detailId) : undefined;
    if (!prod) return;
    const prevTitle = document.title;
    document.title = `${prod.name} – ${prod.size} | Mondo Pool Care`;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const prevHref = link?.href;
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
    link.href = `https://www.mondo-acqua.hr/proizvodi/${encodeURIComponent(prod.id)}/`;
    return () => {
      document.title = prevTitle;
      if (prevHref) link!.href = prevHref; else link!.remove();
    };
  }, [detailId]);
  const goToPage = (n: number) => {
    setPage(n);
    productListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const fmtEUR = (val: number) => val.toFixed(2).replace('.', ',') + ' €';

  const buildOrderText = (paypal = false) => {
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
    const t = calcCartTotals(cart.items, member, care, !paypal);
    lines.push('', `Međuzbroj: ${t.subtotal.toFixed(2)} €`);
    if (member && t.memberDiscount > 0) lines.push(`${care ? 'Popust Mondo Care 10 %' : 'Popust za članove 10 %'}: -${t.memberDiscount.toFixed(2)} €`);
    if (member && t.extraDiscount > 0) lines.push(`Dodatni popust ${care ? 10 : 5} %: -${t.extraDiscount.toFixed(2)} €`);
    if (member && t.robotDiscount > 0) lines.push(`Dodatni popust 5 % na robote: -${t.robotDiscount.toFixed(2)} €`);
    if (t.bfDiscount > 0) lines.push(`Black Friday popust (uplata na račun): -${t.bfDiscount.toFixed(2)} €`);
    if (shippingEUR > 0) lines.push(`Dostava: ${shippingEUR.toFixed(2)} €`);
    lines.push(`Ukupno: ${(paypal ? paypalGrandTotal : grandTotal).toFixed(2)} € (PDV uključen)`);
    if (!paypal) lines.push('Plaćanje: uplata na račun.');
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
    memberApi.saveMemberOrder({ channel, items, total: channel === 'paypal' ? paypalGrandTotal : grandTotal, delivery, address: delivery === 'Dostava' ? address : '', note, paypalOrderId }).catch(() => {});
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
    const text = buildOrderText(true) + `\n\nPLAĆENO PAYPALOM: ${paypalGrandTotal.toFixed(2)} € (transakcija ${info.paypalOrderId})`;
    try {
      await api.post('shop/paypal-order', {
        paypalOrderId: info.paypalOrderId, amount: paypalGrandTotal, payerEmail: info.payerEmail || '', payerName: info.payerName || '',
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
                            data-fallback={shopProduct.sourceImageUrl}
                            alt={p.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              if (swapToSource(e.currentTarget)) return;
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
                  <span style={{ color: '#2EFF88' }}>{care ? 'Popust Mondo Care (10 %)' : 'Popust za članove (10 %)'}</span>
                  <span style={{ color: '#2EFF88' }}>−{fmtEUR(totals.memberDiscount)}</span>
                </div>
              )}
              {member && totals.extraDiscount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#2EFF88' }}>Dodatni popust {care ? 10 : 5} % (iznad {care ? '1.000' : '1.500'} €)</span>
                  <span style={{ color: '#2EFF88' }}>−{fmtEUR(totals.extraDiscount)}</span>
                </div>
              )}
              {totals.bfDiscount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#2EFF88' }}>Black Friday popust (uplata na račun)</span>
                  <span style={{ color: '#2EFF88' }}>−{fmtEUR(totals.bfDiscount)}</span>
                </div>
              )}
              {member && totals.robotDiscount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#2EFF88' }}>Dodatni popust 5 % na robote</span>
                  <span style={{ color: '#2EFF88' }}>−{fmtEUR(totals.robotDiscount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: T.muted }}>Dostava</span>
                <span>{delivery === 'Dostava' ? fmtEUR(SHIPPING_EUR) : 'besplatno (osobno preuzimanje)'}</span>
              </div>
              <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(120,220,255,0.08)' }}>
                <span className="font-medium">Ukupno:</span>
                <span className="text-2xl font-bold">{fmtEUR(grandTotal)}</span>
              </div>
              <p className="text-[11px] text-right -mt-1" style={{ color: T.faint }}>Sve cijene uključuju PDV (25 %).</p>
              {member && totals.toExtra > 0 && (
                <p className="text-xs" style={{ color: T.muted }}>
                  Još {fmtEUR(totals.toExtra)} do dodatnih {care ? 10 : 5} % popusta.
                </p>
              )}
              {!member && totals.subtotal > 0 && (
                <div className="mt-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(46,255,136,0.08)', border: '1px solid rgba(46,255,136,0.25)' }}>
                  <span className="text-sm" style={{ color: '#2EFF88' }}>
                    Kao registrirani član platili biste {fmtEUR(calcCartTotals(cart.items, true, false, true).total)}.{' '}
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
                    {d === 'Dostava' ? `Dostava · ${fmtEUR(SHIPPING_EUR)}` : 'Osobno preuzimanje · besplatno'}
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
                  <CreditCard className="w-4 h-4" /> Ili platite odmah ({fmtEUR(paypalGrandTotal)}) – PayPal ili kartica
                </p>
                {totals.bfDiscount > 0 && (
                  <p className="text-xs mb-2" style={{ color: T.faint }}>Black Friday cijene vrijede samo uz uplatu na račun (narudžba WhatsAppom ili e-mailom).</p>
                )}
                <PayPalCheckout
                  amountEUR={paypalGrandTotal}
                  description="Narudžba – Mondo Pool Care"
                  canPay={validate}
                  onPaid={handlePayPalPaid}
                />
              </div>
            )}
          </div>

          <ReturnPolicy id="povrat-narudzba" />
        </div>
      </div>
    );
  }

  // ── SHOP VIEW ───────────────────────────────────────────────────────────────
  const productCount = shownProducts.length;
  const productCountLabel = productCount === 1 ? '1 proizvod' : `${productCount} proizvoda`;
  const activeGroup = GROUPS.find((x) => x.name === group);
  const categoryLabel = query ? `Rezultati za „${query}”` : category !== 'Sve' ? (SUB_LABEL[category] || category) : activeGroup ? activeGroup.name : 'Svi proizvodi';

  const deriveDescription = (product: { name: string; description?: string }): string | null => {
    if ('description' in product && typeof product.description === 'string' && product.description) {
      return product.description;
    }
    const lower = product.name.toLowerCase();
    if (lower.startsWith('klor minus')) return 'Snižava koncentraciju klora u vodi';
    if (lower.startsWith('ph plus')) return 'Podiže pH vrijednost vode';
    if (lower.startsWith('ph minus')) return 'Snižava pH vrijednost vode';
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
                setEmptyCart(true);
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
              Kemija i oprema za bazen – pronađite proizvod po nazivu ili namjeni. Sve cijene su s PDV-om.
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

        {/* Glavne skupine – kartice s brojem proizvoda */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-5">
          {[{ name: 'Sve', subs: [] as string[] }, ...GROUPS].map(({ name, subs }) => {
            const on = group === name;
            const n = name === 'Sve' ? SHOP_PRODUCTS.length : SHOP_PRODUCTS.filter((p) => subs.includes(p.category)).length;
            return (
              <button
                key={name}
                onClick={() => { setGroup(name); setCategory('Sve'); }}
                className="text-left rounded-2xl px-4 py-3 transition-all"
                style={on
                  ? { background: T.cyan, color: '#020D12', border: `1px solid ${T.cyan}` }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
              >
                <span className="block text-sm font-semibold leading-tight">{name === 'Sve' ? 'Svi proizvodi' : name}</span>
                <span className="block text-xs mt-1" style={{ opacity: on ? 0.75 : 0.55 }}>{n} proizvoda</span>
              </button>
            );
          })}
        </div>

        {/* Podkategorije odabrane skupine */}
        {activeGroup && activeGroup.subs.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {['Sve', ...activeGroup.subs].map((sub) => {
              const on = category === sub;
              const n = sub === 'Sve'
                ? SHOP_PRODUCTS.filter((p) => activeGroup.subs.includes(p.category)).length
                : SHOP_PRODUCTS.filter((p) => p.category === sub).length;
              return (
                <button
                  key={sub}
                  onClick={() => setCategory(sub)}
                  className="px-3.5 py-1.5 text-sm font-medium transition-all rounded-full"
                  style={on
                    ? { background: 'rgba(94,214,230,0.16)', border: `1px solid ${T.cyan}`, color: '#fff' }
                    : { background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.8)' }}
                >
                  {sub === 'Sve' ? 'Sve' : SUB_LABEL[sub] || sub}
                  <span className="ml-1.5" style={{ opacity: 0.5 }}>{n}</span>
                </button>
              );
            })}
          </div>
        )}

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
                ? '✓ Mondo Care: −10 % na sve proizvode i dodatnih −10 % iznad 1.000 €.'
                : '✓ Kao član ostvarujete −10 % na sve proizvode i dodatnih −5 % iznad 1.500 €.'
              : 'Registrirani vlasnici bazena: −10 % na kemiju i opremu, dodatnih −5 % za narudžbe iznad 1.500 €.'}
            <span className="block mt-1 text-[13px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <b style={{ color: '#2EFF88', fontWeight: 600 }}>Uskoro: Pool Care Klub</b> · pokloni za kupnju kemije{member ? ' za registrirane članove.' : '. Registrirajte se besplatno.'}
            </span>
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

        {/* Cijena i poredak */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs mr-1" style={{ color: T.faint }}>Cijena:</span>
          {[{ key: '', label: 'Sve' }, ...PRICE_RANGES].map(({ key, label }) => {
            const on = priceRange === key;
            const n = key ? rangeCount(key) : filteredProducts.length;
            if (key && n === 0 && !on) return null;
            return (
              <button
                key={key || 'sve'}
                onClick={() => setPriceRange(key)}
                className="px-3 py-1 text-xs font-medium rounded-full transition-all"
                style={on
                  ? { background: 'rgba(94,214,230,0.16)', border: `1px solid ${T.cyan}`, color: '#fff' }
                  : { background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.8)' }}
              >
                {label}<span className="ml-1.5" style={{ opacity: 0.5 }}>{n}</span>
              </button>
            );
          })}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            aria-label="Poredak"
            className="ml-auto text-xs rounded-full px-3 py-1.5"
            style={{ background: T.inputBg, border: '1px solid rgba(255,255,255,0.14)', color: '#fff' }}
          >
            <option value="">Preporučeno</option>
            <option value="cijena-rastuce">Cijena: od najniže</option>
            <option value="cijena-padajuce">Cijena: od najviše</option>
          </select>
        </div>

        {/* Divider row */}
        <div
          className="flex items-center justify-between mt-4 pb-3"
          style={{ borderBottom: T.cardBorder }}
        >
          <span className="font-semibold text-sm text-white">{categoryLabel}</span>
          <span className="text-sm" style={{ color: T.muted }}>
            {pageCount > 1 ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, productCount)} od ${productCount}` : productCountLabel}
          </span>
        </div>
      </div>

      {/* ── PRODUCT LIST ─────────────────────────────────────────────────── */}
      <div ref={productListRef} className="relative z-10 max-w-[1180px] mx-auto px-4 pb-8 grid gap-3 lg:grid-cols-2">
        {shownProducts.length === 0 ? (
          <div className="text-center py-12 lg:col-span-2" style={{ color: T.muted }}>
            <p>{priceRange && filteredProducts.length > 0 ? 'Nema proizvoda u odabranom rasponu cijena.' : 'Nema proizvoda za zadani pojam.'}</p>
            {priceRange && filteredProducts.length > 0 && (
              <button onClick={() => setPriceRange('')} className="mt-3 text-sm underline" style={{ color: T.cyan }}>Prikaži sve cijene</button>
            )}
          </div>
        ) : (
          pageProducts.map((product, idx) => {
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
                          data-fallback={product.sourceImageUrl}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            if (swapToSource(e.currentTarget)) return;
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
                    <p className="font-bold text-white text-[18px] leading-tight break-words">{product.name}</p>
                    {description && (
                      <p className="text-sm mt-0.5 break-words" style={{ color: T.muted }}>{description}</p>
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
                        <p className="font-bold text-white text-[20px] leading-tight">{fmtEUR(bfPrice(product, true) ?? memberPrice(product.priceEUR, care, product.id))}</p>
                        <p className="text-[11px] font-semibold" style={{ color: '#2EFF88' }}>{bfPrice(product, true) ? `Prvih ${BF_SLOTS_TOTAL} novih članova · još ${bfSlotsLeft} mjesta` : <>{care ? 'Mondo Care cijena' : 'Cijena za članove'}{hasRobotBonus(product.id) ? ' −15 %' : ''}</>}</p>
                      </>
                    ) : (
                      <>
                        {bfPrice(product, false) && <p className="text-[11px] line-through" style={{ color: T.faint }}>{fmtEUR(product.priceEUR)}</p>}
                        <p className="font-bold text-white text-[20px] leading-tight">{fmtEUR(bfPrice(product, false) ?? product.priceEUR)}</p>
                        <p
                          className="text-[11px]"
                          style={{ color: '#2EFF88', cursor: onRegisterMember ? 'pointer' : 'default' }}
                          onClick={onRegisterMember}
                        >
                          {bfPrice(product, false) ? `Prvih ${BF_SLOTS_TOTAL} novih članova (još ${bfSlotsLeft}): ` : 'Članovi: '} {fmtEUR(bfPrice(product, true) ?? memberPrice(product.priceEUR, false, product.id))}
                        </p>
                      </>
                    )}
                    <p className="text-[10px] mt-0.5 leading-snug" style={{ color: T.faint }}>Cijena na dan {anchorDateLabel(product.category)}:<br />{fmtEUR(anchorPrice(product.id, product.priceEUR))}</p>
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
                            data-fallback={product.sourceImageUrl}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              if (swapToSource(e.currentTarget)) return;
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
                          <p className="font-bold text-white text-lg leading-tight">{fmtEUR(bfPrice(product, true) ?? memberPrice(product.priceEUR, care, product.id))}</p>
                          <p className="text-[10px] font-semibold" style={{ color: '#2EFF88' }}>{bfPrice(product, true) ? `Prvih ${BF_SLOTS_TOTAL} novih članova · još ${bfSlotsLeft} mjesta` : <>{care ? 'Mondo Care cijena' : 'Cijena za članove'}{hasRobotBonus(product.id) ? ' −15 %' : ''}</>}</p>
                        </>
                      ) : (
                        <>
                          {bfPrice(product, false) && <p className="text-[11px] line-through" style={{ color: T.faint }}>{fmtEUR(product.priceEUR)}</p>}
                        <p className="font-bold text-white text-lg leading-tight">{fmtEUR(bfPrice(product, false) ?? product.priceEUR)}</p>
                          <p
                            className="text-[10px]"
                            style={{ color: '#2EFF88', cursor: onRegisterMember ? 'pointer' : 'default' }}
                            onClick={onRegisterMember}
                          >
                            {bfPrice(product, false) ? `Prvih ${BF_SLOTS_TOTAL} novih članova (još ${bfSlotsLeft}): ` : 'Članovi: '} {fmtEUR(bfPrice(product, true) ?? memberPrice(product.priceEUR, false, product.id))}
                          </p>
                        </>
                      )}
                      <p className="text-[10px] mt-0.5" style={{ color: T.faint }}>Cijena na dan {anchorDateLabel(product.category)}: {fmtEUR(anchorPrice(product.id, product.priceEUR))}</p>
                    </div>
                    {ActionEl}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        {/* Straničenje */}
        {pageCount > 1 && (
          <nav aria-label="Stranice kataloga" className="lg:col-span-2 flex items-center justify-center gap-1.5 pt-4 flex-wrap">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 h-9 rounded-full text-sm disabled:opacity-30"
              style={{ border: '1px solid rgba(255,255,255,0.14)', color: '#fff' }}
            >‹ Prethodna</button>
            {Array.from({ length: pageCount }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === pageCount || Math.abs(n - currentPage) <= 1)
              .map((n, i, arr) => (
                <span key={n} className="flex items-center gap-1.5">
                  {i > 0 && n - arr[i - 1] > 1 && <span style={{ color: T.faint }}>…</span>}
                  <button
                    onClick={() => goToPage(n)}
                    aria-current={n === currentPage ? 'page' : undefined}
                    className="w-9 h-9 rounded-full text-sm font-semibold"
                    style={n === currentPage
                      ? { background: T.cyan, color: '#020D12' }
                      : { border: '1px solid rgba(255,255,255,0.14)', color: '#fff' }}
                  >{n}</button>
                </span>
              ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === pageCount}
              className="px-3 h-9 rounded-full text-sm disabled:opacity-30"
              style={{ border: '1px solid rgba(255,255,255,0.14)', color: '#fff' }}
            >Sljedeća ›</button>
          </nav>
        )}

        {/* Bottom hint */}
        {cartCount === 0 && shownProducts.length > 0 && (
          <p className="text-center pt-4 text-sm" style={{ color: T.faint }}>
            Odaberi proizvod za nastavak ›
          </p>
        )}

        <div className="pt-6">
          <ReturnPolicy />
          <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href="/uvjeti" style={{ color: '#5ED6E6' }}>Uvjeti kupnje</a>
            <a href="/povrat" style={{ color: '#5ED6E6' }}>Dostava, povrat i reklamacije</a>
            <a href="/raskid" style={{ color: '#5ED6E6' }}>Raskid ugovora</a>
            <a href="/privatnost.html" style={{ color: '#5ED6E6' }}>Pravila privatnosti</a>
          </nav>
        </div>

        {emptyCart && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setEmptyCart(false)}>
            <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-3xl p-6 text-center" style={{ background: '#06161D', border: '1px solid rgba(120,220,255,0.15)' }} onClick={(e) => e.stopPropagation()}>
              <ShoppingCart className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.35)' }} />
              <h2 className="text-lg font-bold text-white mb-1">Košarica je prazna</h2>
              <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>Dodajte proizvode iz kataloga pa se vratite u košaricu.</p>
              <button
                onClick={() => { setEmptyCart(false); productListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                className="w-full py-3 rounded-xl font-bold text-black" style={{ background: '#4FC3F0' }}>
                Natrag u katalog
              </button>
            </div>
          </div>
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
