import { useState, useEffect } from 'react';
import { IVERO_PRICES } from './productPrices';
import { VAGNER_EQUIPMENT } from './vagnerEquipment';
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

function deriveCategory(id: string): string {
  if (id.startsWith('ph-') || id.startsWith('solna-')) return 'pH regulacija';
  if (
    id.startsWith('chlor-') ||
    id.startsWith('multitabs') ||
    id.startsWith('stabilizer') ||
    id.startsWith('salt-')
  )
    return 'Dezinfekcija';
  if (id.startsWith('algaecide')) return 'Alge';
  if (id.startsWith('flocculant')) return 'Bistrenje';
  if (id.startsWith('winter') || id.startsWith('ivekor')) return 'Održavanje';
  if (id.startsWith('pooltester') || id.startsWith('dpd') || id.startsWith('phenol'))
    return 'Testiranje';
  return 'Ostalo';
}

export const PRODUCT_IMAGES: Record<string, string> = {
  'ph-plus-1kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_ph-plus-granule-1-kg.jpg',
  'ph-plus-5kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_ph-plus-granule-_5kg.jpg',
  'ph-minus-1kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_ph-minus-granule-1-kg.jpg',
  'ph-minus-5kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_ph-minus-granule_5-i-10-kg.jpg',
  'chlor-granule-1kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_klor-granule-1-kg_kantica.jpg',
  'chlor-granule-5kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_klor-granule_5kg.jpg',
  'chlor-tabs-1kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_klor-tablete-200g_1-kg.jpg',
  'chlor-tabs-5kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_klor-tablete-200-g_5-kg.jpg',
  'chlor-tabs-20g-1kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_klor-tablete-20g_1-kg.jpg',
  'chlor-tabs-20g-5kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_klor-tablete-20g_5-kg-1.jpg',
  'multitabs-1kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_multi-tablete_200g_1kg.jpg',
  'multitabs-5kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_multi-tablete_200g_5kg.jpg',
  'multitabs-20g-1kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_multi-tablete-20-g_-1-kg.jpg',
  'multitabs-20g-5kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_multi-tablete_20g_5kg.jpg',
  'chlor-minus-1kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/Untitled-11222.jpg',
  'chlor-minus-5kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_klor-minus_5kg.jpg',
  'algaecide-1l': 'https://shop.ivero.hr/wp-content/uploads/2026/05/IVERO-ALGACID-boca-1l.png',
  'algaecide-premium-1l': 'https://shop.ivero.hr/wp-content/uploads/2026/05/Algicid-premium_1l-scaled.jpg',
  'flocculant-1l': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_ivero-flokulant_1l_boca.jpg',
  'flocculant-5l': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_ivero-flokulant_5l_kanister.jpg',
  'stabilizer-1kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_stabilizator-klora_1kg.jpg',
  'stabilizer-5kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_stabilizator-klora_5kg.jpg',
  'winter-1l': 'https://shop.ivero.hr/wp-content/uploads/2026/05/IVERO-WINTER-boca-1l.png',
  'ivekor-1l': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_ivekor_1l_boca.jpg',
  'ivekor-5l': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_ivekor_5l_kanister.jpg',
  'pooltester': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_pooltester.jpg',
  'dpd-tablets': 'https://shop.ivero.hr/wp-content/uploads/2021/01/thumb.php_-1.jpg',
  'phenol-red-tablets': 'https://shop.ivero.hr/wp-content/uploads/2021/01/thumb.php_.jpg',
  'ph-minus-liquid-5l': 'https://shop.ivero.hr/wp-content/uploads/2021/01/Untitled-1.jpg',
  'solna-9-1l': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_solna-9-_1l_boca.jpg',
  'solna-9-5l': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_solna-9-_5l_kanister-1.jpg',
  'solna-18-1l': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_solna-18-20-_1l_boca.jpg',
  'solna-18-5l': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_solna-18-20-_5l_kanister.jpg',
  'salt-25kg': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_tabletirana-sol_salinen-1.jpg',
  'demin-water-1l': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_demi-voda_1l_boca.jpg',
  'demin-water-5l': 'https://shop.ivero.hr/wp-content/uploads/2021/01/big_demi-voda_5l_boca-1.jpg',
};

export interface ShopProduct {
  id: string;
  name: string;
  size: string;
  priceEUR: number;
  category: string;
  imageUrl: string | undefined;
  description?: string;
}

const chemProducts: ShopProduct[] = Object.values(IVERO_PRICES).map((p) => ({
  id: p.id,
  name: p.name,
  size: p.size,
  priceEUR: p.priceEUR,
  category: deriveCategory(p.id),
  imageUrl: PRODUCT_IMAGES[p.id],
}));

const equipmentProducts: ShopProduct[] = VAGNER_EQUIPMENT.map((p) => ({
  id: p.id,
  name: p.name,
  size: p.size,
  priceEUR: p.priceEUR,
  category: p.category,
  imageUrl: p.imageUrl,
  description: p.description,
}));

export const SHOP_PRODUCTS: ShopProduct[] = [...chemProducts, ...equipmentProducts];

export const findProduct = (id: string): ShopProduct | undefined => SHOP_PRODUCTS.find((p) => p.id === id);

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
    detailsPromise = api.get('shop/details')
      .then((d: any) => (d && typeof d === 'object' && !d.error ? d : {}))
      .catch((err: any) => { detailsPromise = null; throw err; });
  }
  return detailsPromise;
}

export const isEquipment = (id: string): boolean => id.startsWith('vg-');

export const MEMBER_DISCOUNT = 0.10;
export const CARE_DISCOUNT = 0.10;
export const EXTRA_DISCOUNT = 0.05;
export const CARE_EXTRA_DISCOUNT = 0.10;
export const EXTRA_THRESHOLD = 1000;

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

export const memberPrice = (price: number, care = false): number => {
  const discount = care ? CARE_DISCOUNT : MEMBER_DISCOUNT;
  return Math.round(price * (1 - discount) * 100) / 100;
};

export function calcCartTotals(
  items: { productId: string; quantity: number }[],
  member: boolean,
  care = false
): { subtotal: number; memberDiscount: number; extraDiscount: number; total: number; toExtra: number } {
  const subtotal = Math.round(
    items.reduce((sum, item) => {
      const p = findProduct(item.productId);
      return sum + (p ? p.priceEUR * item.quantity : 0);
    }, 0) * 100
  ) / 100;
  const activeDiscount = care ? CARE_DISCOUNT : MEMBER_DISCOUNT;
  const memberDiscount = member ? Math.round(subtotal * activeDiscount * 100) / 100 : 0;
  const extraDiscount = member && subtotal >= EXTRA_THRESHOLD ? Math.round(subtotal * (care ? CARE_EXTRA_DISCOUNT : EXTRA_DISCOUNT) * 100) / 100 : 0;
  const total = Math.round((subtotal - memberDiscount - extraDiscount) * 100) / 100;
  const toExtra = member && subtotal < EXTRA_THRESHOLD ? Math.round((EXTRA_THRESHOLD - subtotal) * 100) / 100 : 0;
  return { subtotal, memberDiscount, extraDiscount, total, toExtra };
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
