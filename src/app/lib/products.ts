// Concrete product definitions based on Ivero product labels

export interface ProductDosage {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  dosage: string; // e.g., "500 g"
  instructions: string;
  priority: number; // 1 = critical, 2 = important, 3 = optional
  category: 'ph' | 'chlorine' | 'clarification' | 'stabilization';
}

// pH Minus - Granules
// For -0.1 pH change: 80-100 g / 10 m³ → 8-10 g/m³
export function calculatePhMinusGranules(
  currentPh: number,
  targetPh: number,
  volume: number
): ProductDosage | null {
  const deltaPh = parseFloat(currentPh as any) - parseFloat(targetPh as any);
  if (deltaPh <= 0) return null;

  const steps = deltaPh / 0.1;
  const safeVolume = parseFloat(volume as any) || 0;
  const defaultDose = 9 * safeVolume * steps;

  return {
    productId: 'ph-minus-granules',
    productName: 'pH Minus (granule)',
    quantity: Math.round(defaultDose * 10) / 10,
    unit: 'g',
    dosage: `${Math.round(defaultDose * 10) / 10} g`,
    instructions: 'Dodati uz uključenu cirkulaciju, izmjeriti nakon 4 sata. Doziranje ovisi o tvrdoći vode.',
    priority: 1,
    category: 'ph',
  };
}

// pH Minus - Liquid
// For -0.1 pH change: 0.3-0.6 L / 10 m³ → 30-60 ml/m³
export function calculatePhMinusLiquid(
  currentPh: number,
  targetPh: number,
  volume: number
): ProductDosage | null {
  const deltaPh = parseFloat(currentPh as any) - parseFloat(targetPh as any);
  if (deltaPh <= 0) return null;

  const steps = deltaPh / 0.1;
  const safeVolume = parseFloat(volume as any) || 0;
  const defaultDose = 45 * safeVolume * steps;

  return {
    productId: 'ph-minus-liquid',
    productName: 'pH Minus (tekući)',
    quantity: Math.round(defaultDose * 10) / 10,
    unit: 'ml',
    dosage: `${Math.round(defaultDose * 10) / 10} ml`,
    instructions: 'Ulijevati na više mjesta u bazenu uz uključenu cirkulacijsku crpku.',
    priority: 1,
    category: 'ph',
  };
}

// pH Plus - Granules
// For +0.2 pH change: 80-100 g / 10 m³ → 8-10 g/m³
export function calculatePhPlusGranules(
  currentPh: number,
  targetPh: number,
  volume: number
): ProductDosage | null {
  const deltaPh = parseFloat(targetPh as any) - parseFloat(currentPh as any);
  if (deltaPh <= 0) return null;

  const steps = deltaPh / 0.2;
  const safeVolume = parseFloat(volume as any) || 0;
  const defaultDose = 9 * safeVolume * steps;

  return {
    productId: 'ph-plus-granules',
    productName: 'pH Plus (granule)',
    quantity: Math.round(defaultDose * 10) / 10,
    unit: 'g',
    dosage: `${Math.round(defaultDose * 10) / 10} g`,
    instructions: 'Dodati uz uključenu cirkulaciju, izmjeriti nakon 4 sata. Točna količina ovisi o tvrdoći vode.',
    priority: 1,
    category: 'ph',
  };
}

// Chlorine Granules - Shock Treatment
// 100-150 g / 10 m³ → 10-15 g/m³
export function calculateChlorineShock(
  currentCl: number,
  volume: number,
  needsShock: boolean = false
): ProductDosage | null {
  // Recommend shock if chlorine is critically low or explicitly requested
  const safeCl = parseFloat(currentCl as any) || 0;
  if (!needsShock && safeCl >= 0.5) return null;

  const safeVolume = parseFloat(volume as any) || 0;
  const defaultDose = 12.5 * safeVolume;

  return {
    productId: 'chlorine-granules-shock',
    productName: 'Klor granule (šok)',
    quantity: Math.round(defaultDose * 10) / 10,
    unit: 'g',
    dosage: `${Math.round(defaultDose * 10) / 10} g`,
    instructions: 'Prvo kloriranje - jednokratno. Može se dodavati direktno ili kao 5% otopina. Optimalan pH: 7.0-7.6.',
    priority: 1,
    category: 'chlorine',
  };
}

// Chlorine Granules - Daily Maintenance
// 10-30 g / 10 m³ / day → 1-3 g/m³/day
export function calculateChlorineDaily(
  currentCl: number,
  targetCl: number,
  volume: number
): ProductDosage | null {
  const safeCl = parseFloat(currentCl as any) || 0;
  const safeTarget = parseFloat(targetCl as any) || 0;
  if (safeCl >= safeTarget) return null;

  const deltaCl = safeTarget - safeCl;
  // Use higher dose if deficit is larger
  const factor = deltaCl > 1 ? 2.5 : deltaCl > 0.5 ? 2 : 1.5;
  const safeVolume = parseFloat(volume as any) || 0;
  const defaultDose = factor * safeVolume;

  return {
    productId: 'chlorine-granules-daily',
    productName: 'Klor granule (dnevno)',
    quantity: Math.round(defaultDose * 10) / 10,
    unit: 'g',
    dosage: `${Math.round(defaultDose * 10) / 10} g`,
    instructions: 'Redovno kloriranje. Dodavati dnevno uz uključenu cirkulaciju. Optimalan pH: 7.0-7.6.',
    priority: 2,
    category: 'chlorine',
  };
}

// Chlorine Tablets - Weekly Maintenance
// Nova formula: 1 tableta na 15-20 m³ za 7 dana (temp ≤25°C)
//               2 tablete na 15-20 m³ za 7 dana (temp >25°C)
export function calculateChlorineTablets(
  volume: number,
  phInRange: boolean,
  temperature?: number
): ProductDosage | null {
  // Prosječan volumen za doziranje je 17.5 m³ (sredina između 15-20)
  const referenceVolume = 17.5;
  
  // Određivanje broja tableta prema temperaturi
  const tabletsPerReference = (temperature && parseFloat(temperature as any) > 25) ? 2 : 1;
  
  // Izračun tableta za stvarni volumen bazena
  const safeVolume = parseFloat(volume as any) || 0;
  const tabletsNeeded = (safeVolume / referenceVolume) * tabletsPerReference;
  
  // Zaokruživanje na razumnu preciznost
  const roundedTablets = Math.ceil(tabletsNeeded * 2) / 2; // Zaokružuje na 0.5

  const tempNote = temperature 
    ? (temperature > 25 
        ? ` (visoka temperatura: ${temperature}°C)` 
        : ` (temperatura: ${temperature}°C)`)
    : '';

  return {
    productId: 'chlorine-tablets',
    productName: 'Klor tablete',
    quantity: roundedTablets,
    unit: 'tableta/tjedan',
    dosage: `${roundedTablets} ${roundedTablets === 1 ? 'tableta' : roundedTablets < 5 ? 'tablete' : 'tableta'}/tjedan${tempNote}`,
    instructions: `Doziranje: ${tabletsPerReference === 1 ? '1 tableta na 15-20 m³' : '2 tablete na 15-20 m³'} za 7 dana${temperature && temperature > 25 ? ' (povećano zbog visoke temperature)' : ''}. Dodati SAMO u skimmer ili plutajući dozator - NIKADA direktno u bazen! Optimalan pH: 7.2-7.6.`,
    priority: phInRange ? 2 : 3,
    category: 'chlorine',
  };
}

// Multifunctional Tablets
// 1 tablet / 2 m³ / 7-10 days → 0.5 tabs/m³
export function calculateMultifunctionalTablets(
  volume: number,
  phInRange: boolean
): ProductDosage | null {
  const safeVolume = parseFloat(volume as any) || 0;
  const defaultDose = 0.5 * safeVolume;

  return {
    productId: 'multifunctional-tablets',
    productName: 'Multifunkcionalne tablete',
    quantity: Math.round(defaultDose * 10) / 10,
    unit: 'tableta/7-10 dana',
    dosage: `${Math.round(defaultDose * 10) / 10} tableta/7-10 dana`,
    instructions: 'Dodati SAMO u skimmer ili plutajući dozator. Dugotrajno održavanje. pH: 7.2-7.6. Cilj: 0.5-2 mg/L klora.',
    priority: phInRange ? 2 : 3,
    category: 'chlorine',
  };
}

// Chlorine Neutralizer (Klor Minus)
// To reduce 0.1 mg/L: 5-10 g/m³ → default 7.5 g/m³
export function calculateChlorineNeutralizer(
  currentCl: number,
  targetCl: number,
  volume: number
): ProductDosage | null {
  const safeCl = parseFloat(currentCl as any) || 0;
  const safeTarget = parseFloat(targetCl as any) || 0;
  const deltaCl = safeCl - safeTarget;
  if (deltaCl <= 0) return null;

  const steps = deltaCl / 0.1;
  const safeVolume = parseFloat(volume as any) || 0;
  const defaultDose = 7.5 * safeVolume * steps;

  return {
    productId: 'chlorine-neutralizer',
    productName: 'Klor Minus',
    quantity: Math.round(defaultDose * 10) / 10,
    unit: 'g',
    dosage: `${Math.round(defaultDose * 10) / 10} g`,
    instructions: 'Neutralizacija klora. Dodati postupno uz cirkulaciju, izmjeriti nakon 2 sata.',
    priority: 1,
    category: 'chlorine',
  };
}

// Flocculant
// 0.05-0.10 L / 10 m³ → 5-10 ml/m³ → default 7.5 ml/m³
export function calculateFlocculant(
  volume: number,
  waterClarity: 'clear' | 'slightly-cloudy' | 'very-cloudy' = 'slightly-cloudy'
): ProductDosage | null {
  if (waterClarity === 'clear') return null;

  const factor = waterClarity === 'very-cloudy' ? 10 : 7.5;
  const safeVolume = parseFloat(volume as any) || 0;
  const defaultDose = factor * safeVolume;

  return {
    productId: 'flocculant',
    productName: 'Flokulant',
    quantity: Math.round(defaultDose * 10) / 10,
    unit: 'ml',
    dosage: `${Math.round(defaultDose * 10) / 10} ml`,
    instructions: 'Za bistrenje vode. Dodati uz cirkulaciju, ostaviti da djeluje 6-8 sati, zatim usisati talog.',
    priority: 2,
    category: 'clarification',
  };
}

// Chlorine Stabilizer
// Initial: 30-50 g/m³ → default 40 g/m³
// Seasonal: 10-20 g/m³ of fresh water → default 15 g/m³
export function calculateChlorineStabilizer(
  volume: number,
  isInitial: boolean = false
): ProductDosage | null {
  const safeVolume = parseFloat(volume as any) || 0;
  const defaultDose = isInitial ? 40 * safeVolume : 15 * safeVolume;

  return {
    productId: 'chlorine-stabilizer',
    productName: 'Stabilizator klora',
    quantity: Math.round(defaultDose * 10) / 10,
    unit: 'g',
    dosage: `${Math.round(defaultDose * 10) / 10} g`,
    instructions: isInitial 
      ? 'Početno doziranje prilikom punjenja bazena. Dodati uz cirkulaciju.'
      : 'Dodati nakon dopune svježe vode tijekom sezone.',
    priority: isInitial ? 2 : 3,
    category: 'stabilization',
  };
}