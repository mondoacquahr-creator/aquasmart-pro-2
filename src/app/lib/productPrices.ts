// Ivero Product Prices (EUR)
// Source: shop.ivero.hr

export interface ProductPrice {
  id: string;
  name: string;
  size: string;
  priceEUR: number;
  priceHRK: number;
}

export const IVERO_PRICES: Record<string, ProductPrice> = {
  // pH PLUS GRANULE
  'ph-plus-1kg': {
    id: 'ph-plus-1kg',
    name: 'pH Plus Granule',
    size: '1 kg',
    priceEUR: 4.75,
    priceHRK: 35.79
  },
  'ph-plus-5kg': {
    id: 'ph-plus-5kg',
    name: 'pH Plus Granule',
    size: '5 kg',
    priceEUR: 19.75,
    priceHRK: 148.80
  },

  // pH MINUS GRANULE
  'ph-minus-1kg': {
    id: 'ph-minus-1kg',
    name: 'pH Minus Granule',
    size: '1 kg',
    priceEUR: 4.75,
    priceHRK: 35.79
  },
  'ph-minus-5kg': {
    id: 'ph-minus-5kg',
    name: 'pH Minus Granule',
    size: '5 kg',
    priceEUR: 19.75,
    priceHRK: 148.80
  },

  // KLOR GRANULE (56% aktivnog klora)
  'chlor-granule-1kg': {
    id: 'chlor-granule-1kg',
    name: 'Klor Granule',
    size: '1 kg',
    priceEUR: 11.55,
    priceHRK: 87.01
  },
  'chlor-granule-5kg': {
    id: 'chlor-granule-5kg',
    name: 'Klor Granule',
    size: '5 kg',
    priceEUR: 47.25,
    priceHRK: 356.06
  },

  // KLOR TABLETE 200g (90% aktivnog klora)
  'chlor-tabs-1kg': {
    id: 'chlor-tabs-1kg',
    name: 'Klor Tablete 200 g',
    size: '1 kg',
    priceEUR: 13.75,
    priceHRK: 103.60
  },
  'chlor-tabs-5kg': {
    id: 'chlor-tabs-5kg',
    name: 'Klor Tablete 200 g',
    size: '5 kg',
    priceEUR: 48.00,
    priceHRK: 361.66
  },

  // KLOR TABLETE 20g
  'chlor-tabs-20g-1kg': {
    id: 'chlor-tabs-20g-1kg',
    name: 'Klor Tablete 20 g',
    size: '1 kg',
    priceEUR: 15.00,
    priceHRK: 113.02
  },
  'chlor-tabs-20g-5kg': {
    id: 'chlor-tabs-20g-5kg',
    name: 'Klor Tablete 20 g',
    size: '5 kg',
    priceEUR: 57.00,
    priceHRK: 429.47
  },

  // MULTIFUNKCIONALNE TABLETE 200g
  'multitabs-1kg': {
    id: 'multitabs-1kg',
    name: 'Multifunkcionalne Tablete 200 g',
    size: '1 kg',
    priceEUR: 11.55,
    priceHRK: 87.01
  },
  'multitabs-5kg': {
    id: 'multitabs-5kg',
    name: 'Multifunkcionalne Tablete 200 g',
    size: '5 kg',
    priceEUR: 47.25,
    priceHRK: 356.06
  },

  // MULTIFUNKCIONALNE TABLETE 20g
  'multitabs-20g-1kg': {
    id: 'multitabs-20g-1kg',
    name: 'Multifunkcionalne Tablete 20 g',
    size: '1 kg',
    priceEUR: 12.08,
    priceHRK: 91.04
  },
  'multitabs-20g-5kg': {
    id: 'multitabs-20g-5kg',
    name: 'Multifunkcionalne Tablete 20 g',
    size: '5 kg',
    priceEUR: 48.30,
    priceHRK: 363.92
  },

  // KLOR MINUS (neutralizator klora)
  'chlor-minus-1kg': {
    id: 'chlor-minus-1kg',
    name: 'Klor Minus',
    size: '1 kg',
    priceEUR: 6.88,
    priceHRK: 51.84
  },
  'chlor-minus-5kg': {
    id: 'chlor-minus-5kg',
    name: 'Klor Minus',
    size: '5 kg',
    priceEUR: 30.00,
    priceHRK: 226.04
  },

  // IVERO ALGACID
  'algaecide-1l': {
    id: 'algaecide-1l',
    name: 'Ivero Algacid',
    size: '1 L',
    priceEUR: 5.20,
    priceHRK: 39.18
  },

  // ALGICID PREMIUM
  'algaecide-premium-1l': {
    id: 'algaecide-premium-1l',
    name: 'Algicid Premium',
    size: '1 L',
    priceEUR: 13.25,
    priceHRK: 99.83
  },

  // IVERO FLOKULANT
  'flocculant-1l': {
    id: 'flocculant-1l',
    name: 'Ivero Flokulant',
    size: '1 L',
    priceEUR: 5.00,
    priceHRK: 37.67
  },
  'flocculant-5l': {
    id: 'flocculant-5l',
    name: 'Ivero Flokulant',
    size: '5 L',
    priceEUR: 22.50,
    priceHRK: 169.53
  },

  // STABILIZATOR KLORA (cijanurna kiselina)
  'stabilizer-1kg': {
    id: 'stabilizer-1kg',
    name: 'Stabilizator Klora',
    size: '1 kg',
    priceEUR: 20.00,
    priceHRK: 150.69
  },
  'stabilizer-5kg': {
    id: 'stabilizer-5kg',
    name: 'Stabilizator Klora',
    size: '5 kg',
    priceEUR: 87.50,
    priceHRK: 659.52
  },

  // IVERO WINTER
  'winter-1l': {
    id: 'winter-1l',
    name: 'Ivero Winter',
    size: '1 L',
    priceEUR: 6.10,
    priceHRK: 45.97
  },

  // IVEKOR (uklanja kamenac i hrđu)
  'ivekor-1l': {
    id: 'ivekor-1l',
    name: 'Ivekor',
    size: '1 L',
    priceEUR: 6.88,
    priceHRK: 51.84
  },
  'ivekor-5l': {
    id: 'ivekor-5l',
    name: 'Ivekor',
    size: '5 L',
    priceEUR: 31.25,
    priceHRK: 235.46
  },

  // POOLTESTER
  'pooltester': {
    id: 'pooltester',
    name: 'Pooltester',
    size: '1 kom',
    priceEUR: 26.25,
    priceHRK: 197.78
  },

  // DPD TABLETE ZA POOLTESTER
  'dpd-tablets': {
    id: 'dpd-tablets',
    name: 'DPD Tablete za Pooltester',
    size: '10 kom',
    priceEUR: 1.99,
    priceHRK: 15.00
  },

  // PHENOL RED TABLETE ZA POOLTESTER
  'phenol-red-tablets': {
    id: 'phenol-red-tablets',
    name: 'Phenol Red Tablete za Pooltester',
    size: '10 kom',
    priceEUR: 1.99,
    priceHRK: 15.00
  },

  // pH MINUS TEKUĆI (sumporna kiselina 5-15%)
  'ph-minus-liquid-5l': {
    id: 'ph-minus-liquid-5l',
    name: 'pH Minus - Sumporna Kiselina 5–15%',
    size: '5 L',
    priceEUR: 10.00,
    priceHRK: 75.35
  },

  // SOLNA KISELINA
  'solna-9-1l': {
    id: 'solna-9-1l',
    name: 'Solna Kiselina 9%',
    size: '1 L',
    priceEUR: 1.15,
    priceHRK: 8.67
  },
  'solna-9-5l': {
    id: 'solna-9-5l',
    name: 'Solna Kiselina 9%',
    size: '5 L',
    priceEUR: 5.11,
    priceHRK: 38.51
  },
  'solna-18-1l': {
    id: 'solna-18-1l',
    name: 'Solna Kiselina 18–20%',
    size: '1 L',
    priceEUR: 2.18,
    priceHRK: 16.43
  },
  'solna-18-5l': {
    id: 'solna-18-5l',
    name: 'Solna Kiselina 18–20%',
    size: '5 L',
    priceEUR: 9.31,
    priceHRK: 70.16
  },

  // TABLETIRANA SOL
  'salt-25kg': {
    id: 'salt-25kg',
    name: 'Tabletirana Sol',
    size: '25 kg',
    priceEUR: 16.59,
    priceHRK: 124.99
  },

  // DEMINERALIZIRANA VODA
  'demin-water-1l': {
    id: 'demin-water-1l',
    name: 'Demineralizirana Voda',
    size: '1 L',
    priceEUR: 0.66,
    priceHRK: 4.97
  },
  'demin-water-5l': {
    id: 'demin-water-5l',
    name: 'Demineralizirana Voda',
    size: '5 L',
    priceEUR: 2.92,
    priceHRK: 22.00
  },
};

// Helper function to calculate product cost
export function calculateProductCost(
  productType: 'ph-plus' | 'ph-minus' | 'chlor-granule' | 'chlor-tabs' |
               'flocculant' | 'stabilizer' | 'algaecide' | 'shock' |
               'chlor-minus' | 'alk-plus' | 'hardness-plus',
  amountKg: number
): {
  product: ProductPrice;
  quantity: number;
  totalCost: number;
  quantityText: string;
} {
  let productKey: string;
  let quantity: number;

  // shock maps to chlor-granule, alk-plus/hardness-plus have no direct match — fallback to ph-plus
  const normalizedType = productType === 'shock' ? 'chlor-granule'
    : productType === 'alk-plus' || productType === 'hardness-plus' ? 'ph-plus'
    : productType;

  const isLiquid = normalizedType === 'flocculant' || normalizedType === 'algaecide';

  if (isLiquid) {
    if (amountKg <= 1) {
      productKey = `${normalizedType}-1l`;
      quantity = Math.ceil(amountKg);
    } else {
      productKey = `${normalizedType}-5l`;
      quantity = Math.ceil(amountKg / 5);
    }
  } else {
    if (amountKg <= 1) {
      productKey = `${normalizedType}-1kg`;
      quantity = Math.ceil(amountKg);
    } else {
      productKey = `${normalizedType}-5kg`;
      quantity = Math.ceil(amountKg / 5);
    }
  }

  const product = IVERO_PRICES[productKey];
  
  if (!product) {
    // Fallback if specific size not found
    return {
      product: {
        id: 'unknown',
        name: String(productType),
        size: '1 kg/l',
        priceEUR: 0,
        priceHRK: 0
      },
      quantity: Math.ceil(amountKg),
      totalCost: 0,
      quantityText: `${Math.ceil(amountKg)} x ?`
    };
  }

  const totalCost = (product.priceEUR || 0) * quantity;

  return {
    product,
    quantity,
    totalCost,
    quantityText: `${quantity} x ${product.size}`
  };
}

// Calculate total treatment cost
export interface TreatmentCost {
  items: {
    productType: string;
    productName: string;
    amountNeeded: number;
    unit: string;
    product: ProductPrice;
    quantity: number;
    quantityText: string;
    totalCost: number;
  }[];
  totalEUR: number;
  totalHRK: number;
}

export function calculateTreatmentCost(recommendations: any[]): TreatmentCost {
  const items: TreatmentCost['items'] = [];
  let totalEUR = 0;

  // Map product names to types
  const productTypeMap: Record<string, string> = {
    'pH Plus': 'ph-plus',
    'pH Minus': 'ph-minus',
    'Klor granule': 'chlor-granule',
    'Klor tablete': 'chlor-tabs',
    'Klor Minus': 'chlor-minus',
    'Flokulant': 'flocculant',
    'Stabilizator': 'stabilizer',
    'Shock Klor': 'shock',
    'Algistat': 'algaecide',
    'Multifunkcionalne tablete': 'chlor-tabs', // Fallback to tabs
  };

  for (const rec of recommendations) {
    console.log('🔍 Processing recommendation:', rec.productName, rec.quantity, rec.unit);
    
    const safeProductName = String(rec.productName || "");

    // Alternative (npr. granule uz tekući pH Minus) ne idu u košaricu
    if (safeProductName.toLowerCase().includes('(alternativa)')) continue;

    // Tekući pH Minus: kanister 5 L, količina = broj kanistera
    if (rec.productId === 'ph-minus-liquid' && rec.quantity) {
      const product = IVERO_PRICES['ph-minus-liquid-5l'];
      const litres = rec.unit === 'ml' ? rec.quantity / 1000 : rec.quantity;
      const quantity = Math.max(1, Math.ceil(litres / 5));
      items.push({
        productType: rec.productName,
        productName: product.name,
        amountNeeded: rec.quantity,
        unit: rec.unit,
        product,
        quantity,
        quantityText: `${quantity} x ${product.size}`,
        totalCost: quantity * product.priceEUR,
      });
      totalEUR += quantity * product.priceEUR;
      continue;
    }

    // Extract product type from productName
    let productType: string | null = null;
    
    for (const [key, value] of Object.entries(productTypeMap)) {
      if (safeProductName.toLowerCase().includes(key.toLowerCase())) {
        productType = value;
        console.log('✅ Product type matched:', key, '→', value);
        break;
      }
    }

    if (!productType) {
      console.warn('❌ Product type not found for:', rec.productName);
      continue;
    }

    // Get amount from quantity field (not dosage string)
    const amountNeeded = rec.quantity;
    const unit = rec.unit;

    if (!amountNeeded || !unit) {
      console.log('Missing quantity or unit for:', rec.productName);
      continue;
    }

    // Convert to kg or L for cost calculation
    let amountInKgOrL = amountNeeded;
    if (unit === 'g') {
      amountInKgOrL = amountNeeded / 1000;
    } else if (unit === 'ml') {
      amountInKgOrL = amountNeeded / 1000;
    } else if (String(unit).startsWith('tablet')) {
      // Klor tablete: broj tableta u kg (1 tableta = 200 g)
      amountInKgOrL = amountNeeded * 0.2;
    }

    try {
      const cost = calculateProductCost(productType as any, amountInKgOrL);
      
      items.push({
        productType: rec.productName,
        productName: cost.product.name,
        amountNeeded,
        unit,
        product: cost.product,
        quantity: cost.quantity,
        quantityText: cost.quantityText,
        totalCost: cost.totalCost
      });
      
      totalEUR += cost.totalCost;
    } catch (error) {
      console.error('Error calculating cost for:', rec.productName, error);
    }
  }

  const EUR_TO_HRK = 7.53; // Current exchange rate
  const totalHRK = totalEUR * EUR_TO_HRK;

  return {
    items,
    totalEUR,
    totalHRK
  };
}

export function getProductUnitPrice(productName: string): number | undefined {
  // Map product names to types
  const productTypeMap: Record<string, string> = {
    'pH Plus': 'ph-plus',
    'pH Minus': 'ph-minus',
    'Klor granule': 'chlor-granule',
    'Klor tablete': 'chlor-tabs',
    'Klor Minus': 'chlor-minus',
    'Flokulant': 'flocculant',
    'Stabilizator': 'stabilizer',
    'Shock Klor': 'shock',
    'Algistat': 'algaecide',
    'Multifunkcionalne tablete': 'multitabs',
  };

  let productType: string | null = null;
  const safeProductName = String(productName || "");
  
  for (const [key, value] of Object.entries(productTypeMap)) {
    if (safeProductName.toLowerCase().includes(key.toLowerCase())) {
      productType = value;
      break;
    }
  }

  if (!productType) return undefined;

  // Try to find 1kg/1l version for unit price
  const isLiquid = productType === 'flocculant' || productType === 'algaecide';
  const suffix = isLiquid ? '-1l' : '-1kg';
  const productKey = `${productType}${suffix}`;

  const product = IVERO_PRICES[productKey];
  return product ? product.priceEUR : undefined;
}