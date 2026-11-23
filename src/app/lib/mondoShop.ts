import { useState, useEffect } from 'react';
import { api } from './supabase';

export const MONDO_CONTACT = {
  name: 'Mondo Acqua d.o.o.',
  email: 'info@mondo-acqua.hr',
  phone: '+385 95 208 7321',
  whatsapp: '385952087321',
  web: 'https://www.mondo-acqua.hr',
  address: '',
  hours: '',
};

export { SHOP_PRODUCTS, PRODUCT_IMAGES, findProduct } from './shopCatalog';
export type { ShopProduct } from './shopCatalog';
import { SHOP_PRODUCTS, findProduct } from './shopCatalog';
import type { ShopProduct } from './shopCatalog';

// Detalji proizvoda (opis, upute i doziranje prema proizvođaču, tehnički podaci) – učitavaju se sa servera jednom.
export interface ProductDetails {
  description?: string;
  usage?: string[];
  warning?: string;
  params?: [string, string][];
  source?: string;
  sourceUrl?: string;
}

let detailsPromise: Promise<Record<string, ProductDetails>> | null = null;

export function loadProductDetails(): Promise<Record<string, ProductDetails>> {
  if (!detailsPromise) {
    // Opisi Vagner opreme (vh-) dolaze iz repozitorija; podaci sa servera imaju prednost.
    const local = import('./vagnerDetails.json').then((m: any) => (m.default || m) as Record<string, ProductDetails>);
    detailsPromise = api.get('shop/details')
      .then(async (d: any) => {
        const server = d && typeof d === 'object' && !d.error ? d : {};
        const left = Number(server._bf?.left);
        if (Number.isFinite(left)) bfSlotsLeft = Math.max(0, left);
        return { ...(await local), ...server };
      })
      .catch(async (err: any) => {
        detailsPromise = null;
        const fallback = await local.catch(() => null);
        if (fallback) return fallback;
        throw err;
      });
  }
  return detailsPromise;
}

export const isEquipment = (id: string): boolean => id.startsWith('vg-');

export const MEMBER_DISCOUNT = 0.10;
export const CARE_DISCOUNT = 0.10;
export const EXTRA_DISCOUNT = 0.05;
export const CARE_EXTRA_DISCOUNT = 0.10;
// Dodatni popust: registrirani +5 %, Mondo Care +10 %, oboje iznad 1.500 €.
export const EXTRA_THRESHOLD = 1500;
export const CARE_EXTRA_THRESHOLD = 1500;
// Roboti u Black Friday akciji (WYBOT S1, iGarden K40). Stalni članski popust na njih je 10 % kao na sve ostalo.
export const ROBOT_BONUS = 0.05;
export const ROBOT_BONUS_IDS = new Set(['vh-60WS1', 'vh-60K040']);
export const hasRobotBonus = (id?: string): boolean => !!id && ROBOT_BONUS_IDS.has(id);

// ---------- Black Friday (samo uz uplatu na račun, ne PayPal; do isteka zaliha) ----------
// Dozirni sustavi Vagner: 10 % za sve, 25 % za članove. Roboti S1 i K40: 5 % za sve, 15 % za članove.
export const BLACK_FRIDAY_END = new Date('2026-12-01T00:00:00+01:00');
export const isBlackFriday = (now = new Date()): boolean => now < BLACK_FRIDAY_END;
// Članska Black Friday cijena vrijedi za prvih 20 plaćenih narudžbi novih članova. Broj preostalih mjesta
// Mondo ručno mijenja u bazi (kv ključ "shop:details:_bf" → { "left": N }); kad je 0, članovi imaju klasičnih 10 %.
export const BF_SLOTS_TOTAL = 20;
export let bfSlotsLeft = BF_SLOTS_TOTAL;
export const bfMembersOpen = (): boolean => bfSlotsLeft > 0;
export const bfRate = (p: { id: string; category: string } | undefined, member: boolean): number => {
  if (!p || !isBlackFriday()) return 0;
  if (member && !bfMembersOpen()) return 0;
  if (p.id.startsWith('vg-') && p.category === 'Doziranje') return member ? 0.25 : 0.10;
  if (hasRobotBonus(p.id)) return member ? 0.15 : 0.05;
  return 0;
};
export const bfPrice = (p: { id: string; category: string; priceEUR: number }, member: boolean): number | null => {
  const r = bfRate(p, member);
  return r ? Math.round(p.priceEUR * (1 - r) * 100) / 100 : null;
};

export const isMemberUser = (): boolean => {
  try {
    return localStorage.getItem('userRole') === 'member';
  } catch {
    return false;
  }
};

export const isCareUser = (): boolean => {
  try {
    return isMemberUser() && localStorage.getItem('memberPlan') === 'care';
  } catch {
    return false;
  }
};

export const memberPrice = (price: number, care = false, productId?: string): number => {
  void productId; // zadržano radi kompatibilnosti poziva
  const discount = care ? CARE_DISCOUNT : MEMBER_DISCOUNT;
  return Math.round(price * (1 - discount) * 100) / 100;
};

export function calcCartTotals(
  allItems: { productId: string; quantity: number }[],
  member: boolean,
  care = false,
  bankTransfer = false
): { subtotal: number; memberDiscount: number; extraDiscount: number; robotDiscount: number; bfDiscount: number; total: number; toExtra: number } {
  // Black Friday stavke (uz uplatu na račun) imaju svoj popust umjesto članskog.
  const isBf = (id: string) => bankTransfer && bfRate(findProduct(id), member) > 0;
  const bfDiscount = Math.round(allItems.reduce((sum, item) => {
    const p = findProduct(item.productId);
    return sum + (p && isBf(item.productId) ? p.priceEUR * item.quantity * bfRate(p, member) : 0);
  }, 0) * 100) / 100;
  const items = allItems.filter((i) => !isBf(i.productId));
  const fullSubtotal = Math.round(allItems.reduce((sum, item) => {
    const p = findProduct(item.productId);
    return sum + (p ? p.priceEUR * item.quantity : 0);
  }, 0) * 100) / 100;
  const subtotal = Math.round(
    items.reduce((sum, item) => {
      const p = findProduct(item.productId);
      return sum + (p ? p.priceEUR * item.quantity : 0);
    }, 0) * 100
  ) / 100;
  const activeDiscount = care ? CARE_DISCOUNT : MEMBER_DISCOUNT;
  const memberDiscount = member ? Math.round(subtotal * activeDiscount * 100) / 100 : 0;
  const threshold = care ? CARE_EXTRA_THRESHOLD : EXTRA_THRESHOLD;
  const extraDiscount = member && fullSubtotal >= threshold ? Math.round(subtotal * (care ? CARE_EXTRA_DISCOUNT : EXTRA_DISCOUNT) * 100) / 100 : 0;
  // Stalnih +5 % na robote nema; roboti imaju dodatni popust samo kroz Black Friday.
  const robotDiscount = 0;
  const total = Math.round((fullSubtotal - memberDiscount - extraDiscount - robotDiscount - bfDiscount) * 100) / 100;
  const toExtra = member && fullSubtotal < threshold && subtotal > 0 ? Math.round((threshold - fullSubtotal) * 100) / 100 : 0;
  return { subtotal: fullSubtotal, memberDiscount, extraDiscount, robotDiscount, bfDiscount, total, toExtra };
}

export interface Cart {
  items: { productId: string; quantity: number }[];
  analysis?: string;
  openCheckout?: boolean;
}

const CART_KEY = 'mondo_cart';

export function getCart(): Cart {
  try {
    const raw = sessionStorage.getItem(CART_KEY);
    if (raw) return JSON.parse(raw) as Cart;
  } catch {}
  return { items: [] };
}

export function setCart(cart: Cart): void {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('mondo-cart-changed'));
}

export function addToCart(productId: string, qty = 1): void {
  const cart = getCart();
  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.items.push({ productId, quantity: qty });
  }
  setCart(cart);
}

export function setQty(productId: string, qty: number): void {
  const cart = getCart();
  if (qty <= 0) {
    cart.items = cart.items.filter((i) => i.productId !== productId);
  } else {
    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity = qty;
    } else {
      cart.items.push({ productId, quantity: qty });
    }
  }
  setCart(cart);
}

export function clearCart(): void {
  setCart({ items: [] });
}

export function addRecommended(
  items: { productId: string; quantity: number }[],
  analysisSummary: string
): void {
  const cart = getCart();
  for (const item of items) {
    const existing = cart.items.find((i) => i.productId === item.productId);
    if (existing) {
      existing.quantity = item.quantity;
    } else {
      cart.items.push({ productId: item.productId, quantity: item.quantity });
    }
  }
  cart.analysis = analysisSummary;
  cart.openCheckout = true;
  setCart(cart);
}

export function useCart(): Cart {
  const [cart, setCartState] = useState<Cart>(getCart);

  useEffect(() => {
    const handler = () => setCartState(getCart());
    window.addEventListener('mondo-cart-changed', handler);
    return () => window.removeEventListener('mondo-cart-changed', handler);
  }, []);

  return cart;
}
