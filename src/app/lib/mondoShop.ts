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
      .then(async (d: any) => ({ ...(await local), ...(d && typeof d === 'object' && !d.error ? d : {}) }))
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
export const EXTRA_THRESHOLD = 1000;
// Dodatni popust za registrirane samo na odabrane robote (WYBOT S1, iGarden K40) – 10 % + 5 %.
export const ROBOT_BONUS = 0.05;
export const ROBOT_BONUS_IDS = new Set(['vh-60WS1', 'vh-60K040']);
export const hasRobotBonus = (id?: string): boolean => !!id && ROBOT_BONUS_IDS.has(id);

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
  const discount = (care ? CARE_DISCOUNT : MEMBER_DISCOUNT) + (hasRobotBonus(productId) ? ROBOT_BONUS : 0);
  return Math.round(price * (1 - discount) * 100) / 100;
};

export function calcCartTotals(
  items: { productId: string; quantity: number }[],
  member: boolean,
  care = false
): { subtotal: number; memberDiscount: number; extraDiscount: number; robotDiscount: number; total: number; toExtra: number } {
  const subtotal = Math.round(
    items.reduce((sum, item) => {
      const p = findProduct(item.productId);
      return sum + (p ? p.priceEUR * item.quantity : 0);
    }, 0) * 100
  ) / 100;
  const activeDiscount = care ? CARE_DISCOUNT : MEMBER_DISCOUNT;
  const memberDiscount = member ? Math.round(subtotal * activeDiscount * 100) / 100 : 0;
  const extraDiscount = member && subtotal >= EXTRA_THRESHOLD ? Math.round(subtotal * (care ? CARE_EXTRA_DISCOUNT : EXTRA_DISCOUNT) * 100) / 100 : 0;
  // Dodatnih 5 % na odabrane robote; ne zbraja se s dodatnim popustom iznad 1.000 €.
  const robotDiscount = member && extraDiscount === 0 ? Math.round(
    items.reduce((sum, item) => {
      const p = findProduct(item.productId);
      return sum + (p && hasRobotBonus(item.productId) ? p.priceEUR * item.quantity * ROBOT_BONUS : 0);
    }, 0) * 100
  ) / 100 : 0;
  const total = Math.round((subtotal - memberDiscount - extraDiscount - robotDiscount) * 100) / 100;
  const toExtra = member && subtotal < EXTRA_THRESHOLD ? Math.round((EXTRA_THRESHOLD - subtotal) * 100) / 100 : 0;
  return { subtotal, memberDiscount, extraDiscount, robotDiscount, total, toExtra };
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
