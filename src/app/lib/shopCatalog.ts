// Shared catalog: storefront and Merchant feed use the same retail prices.
import { IVERO_PRICES } from './productPrices';
import { VAGNER_EQUIPMENT } from './vagnerEquipment';
import { anchorPrice } from './anchorPrices';
import { SPA_PRODUCTS } from './spaProducts';

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
  anchorEUR?: number; // sidrena cijena (10. 9. 2026.)
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
  // Use the same hosted JPEG as the product page and Google feed.
  // vg-: lokalna JPG kopija; vh-: izvorna slika s vagnerpool.hr
  imageUrl: p.id.startsWith('vg-') ? `https://poolcare.mondo-acqua.hr/merchant-images/${encodeURIComponent(p.id)}.jpg` : encodeURI(p.imageUrl),
  description: p.description,
}));

export const SHOP_PRODUCTS: ShopProduct[] = [...chemProducts, ...SPA_PRODUCTS, ...equipmentProducts]
  .map((p) => ({ ...p, anchorEUR: anchorPrice(p.id, p.priceEUR) }));

export const findProduct = (id: string): ShopProduct | undefined => SHOP_PRODUCTS.find((p) => p.id === id);

