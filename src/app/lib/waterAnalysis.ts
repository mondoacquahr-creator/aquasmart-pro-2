import { ProductDosage } from './products';
import * as Products from './products';
import { calculateTreatmentCost, TreatmentCost } from './productPrices';

interface WaterParameters {
  pH?: number;
  freeChlorine?: number;
  alkalinity?: number;
  hardness?: number;
  temperature?: number;
  orp?: number;
}

export interface AnalysisResult {
  status: 'ok' | 'warning' | 'critical';
  message: string;
  issues: string[];
  recommendations: ProductDosage[];
  insights: string[];
  treatmentCost?: TreatmentCost;
}

// Ideal ranges - based on Ivero product specifications and ORP standards
const IDEAL_RANGES = {
  pH: { min: 7.2, max: 7.6, critical: { min: 6.8, max: 8.0 } },
  freeChlorine: { min: 0.5, max: 1.5, critical: { min: 0.2, max: 5.0 } },
  alkalinity: { min: 80, max: 120, critical: { min: 60, max: 180 } },
  hardness: { min: 200, max: 400, critical: { min: 150, max: 500 } },
  orp: { min: 650, max: 750, critical: { min: 600, max: 800 }, publicPool: { min: 720, max: 740 } },
};

// Izgled vode procijenjen s fotografije bazena (AI).
export interface WaterAppearance {
  isPool?: boolean;
  clarity: 'clear' | 'slightly_cloudy' | 'cloudy' | 'green';
  algae: 'none' | 'possible' | 'visible';
  debris?: boolean;
  note?: string;
}

export function analyzeWater(
  params: WaterParameters, 
  poolVolume: number, 
  disinfectionSystem?: 'salt-electrolysis' | 'chlorine+ph' | 'peroxide' | 'tablets' | '',
  appearance?: WaterAppearance | null
): AnalysisResult {
  console.log('🔬 === WATER ANALYSIS START ===');
  console.log('📊 Input Parameters:', params);
  console.log('💧 Pool Volume:', poolVolume, 'm³');
  console.log('⚙️ Disinfection System:', disinfectionSystem);
  
  const issues: string[] = [];
  const recommendations: ProductDosage[] = [];
  const insights: string[] = [];
  let overallStatus: 'ok' | 'warning' | 'critical' = 'ok';

  // Target values for corrections
  const targetPh = 7.4; // Midpoint of 7.2-7.6
  const targetCl = 1.0; // Target for ideal range 0.5-1.5

  // Check pH status
  let phStatus: 'ok' | 'low' | 'high' | 'critical-low' | 'critical-high' | null = null;
  
  if (params.pH !== undefined) {
    if (params.pH < IDEAL_RANGES.pH.critical.min) {
      overallStatus = 'critical';
      phStatus = 'critical-low';
      issues.push(`pH kritično nizak (${params.pH})`);
    } else if (params.pH > IDEAL_RANGES.pH.critical.max) {
      overallStatus = 'critical';
      phStatus = 'critical-high';
      issues.push(`pH kritično visok (${params.pH})`);
    } else if (params.pH < IDEAL_RANGES.pH.min) {
      if (overallStatus !== 'critical') overallStatus = 'warning';
      phStatus = 'low';
      issues.push(`pH nizak (${params.pH})`);
    } else if (params.pH > IDEAL_RANGES.pH.max) {
      if (overallStatus !== 'critical') overallStatus = 'warning';
      phStatus = 'high';
      issues.push(`pH visok (${params.pH})`);
    } else {
      phStatus = 'ok';
    }

    // Add pH correction products
    if (phStatus === 'high' || phStatus === 'critical-high') {
      // Offer both liquid and granules
      const phMinusLiquid = Products.calculatePhMinusLiquid(params.pH, targetPh, poolVolume);
      const phMinusGranules = Products.calculatePhMinusGranules(params.pH, targetPh, poolVolume);
      
      if (phMinusLiquid) recommendations.push(phMinusLiquid);
      if (phMinusGranules) {
        phMinusGranules.productName = phMinusGranules.productName + ' (alternativa)';
        phMinusGranules.priority = 2;
        recommendations.push(phMinusGranules);
      }
      
      insights.push('💡 Možete koristiti pH Minus tekući ili granule prema preferenciji.');
    } else if (phStatus === 'low' || phStatus === 'critical-low') {
      const phPlus = Products.calculatePhPlusGranules(params.pH, targetPh, poolVolume);
      if (phPlus) recommendations.push(phPlus);
    }
  }

  // pH in optimal range for chlorine effectiveness (7.2-7.6)
  const phInChlorineRange = params.pH ? (params.pH >= 7.2 && params.pH <= 7.6) : true;
  const phInIdealRange = params.pH ? (params.pH >= IDEAL_RANGES.pH.min && params.pH <= IDEAL_RANGES.pH.max) : true;

  // ORP Analysis - Critical for understanding sanitization effectiveness
  let orpStatus: 'ok' | 'low' | 'high' | 'critical-low' | 'critical-high' | null = null;
  let orpSanitizationEffective = true;

  if (params.orp !== undefined) {
    if (params.orp < IDEAL_RANGES.orp.critical.min) {
      overallStatus = 'critical';
      orpStatus = 'critical-low';
      orpSanitizationEffective = false;
      issues.push(`ORP kritično nizak (${params.orp} mV)`);
      insights.push('🚨 ORP pokazuje da dezinfekcija NIJE učinkovita, čak i ako je razina klora prisutna! Potrebna je hitna korekcija.');
    } else if (params.orp > IDEAL_RANGES.orp.critical.max) {
      if (overallStatus !== 'critical') overallStatus = 'critical';
      orpStatus = 'critical-high';
      issues.push(`ORP kritično visok (${params.orp} mV)`);
      insights.push('⚠️ Pretjerano visok ORP može ukazivati na prekomjernu oksidaciju.');
    } else if (params.orp < IDEAL_RANGES.orp.min) {
      if (overallStatus === 'ok') overallStatus = 'warning';
      orpStatus = 'low';
      orpSanitizationEffective = false;
      issues.push(`ORP nizak (${params.orp} mV)`);
      insights.push('⚠️ Nizak ORP znači da klor nije učinkovit u dezinfekciji. Provjerite pH, razinu klora i stabilizator (CYA).');
    } else if (params.orp > IDEAL_RANGES.orp.max) {
      if (overallStatus === 'ok') overallStatus = 'warning';
      orpStatus = 'high';
      issues.push(`ORP visok (${params.orp} mV)`);
    } else {
      orpStatus = 'ok';
      insights.push('✅ ORP je u idealnom rasponu - dezinfekcija je učinkovita!');
    }

    // Special insight: ORP vs Free Chlorine discrepancy
    if (params.freeChlorine !== undefined && params.orp !== undefined) {
      const hasAdequateChlorine = params.freeChlorine >= IDEAL_RANGES.freeChlorine.min;
      const hasLowORP = params.orp < IDEAL_RANGES.orp.min;
      
      if (hasAdequateChlorine && hasLowORP) {
        insights.push('🔬 VAŽNO: Razina klora je prisutna, ali ORP pokazuje da nije UČINKOVIT. Mogući uzroci:');
        
        if (params.pH && params.pH > 7.6) {
          insights.push('   • pH je previsok (>' + params.pH.toFixed(1) + ') - klor gubi učinkovitost');
          insights.push('   • Prioritet: Prvo snizite pH na 7.2-7.6, zatim ponovno izmjerite ORP');
        } else {
          insights.push('   • Visoka razina stabilizatora (CYA) - "veže" klor i smanjuje učinkovitost');
          insights.push('   • Kontaminanti u vodi (organske tvari, alge) troše aktivan klor');
          insights.push('   • Preporuka: Razmislite o šok kloriranju nakon korekcije pH');
        }
      }
    }

    // Public pool ORP requirements
    if (params.orp && params.orp >= IDEAL_RANGES.orp.publicPool.min && params.orp <= IDEAL_RANGES.orp.publicPool.max) {
      insights.push('✓ ORP zadovoljava standarde za javne bazene (720-740 mV)');
    }
  }

  // Check Chlorine status
  if (params.freeChlorine !== undefined) {
    if (params.freeChlorine < IDEAL_RANGES.freeChlorine.critical.min) {
      overallStatus = 'critical';
      issues.push(`Slobodni klor kritično nizak (${params.freeChlorine} mg/L)`);
      
      // Recommend shock treatment
      const shock = Products.calculateChlorineShock(params.freeChlorine, poolVolume, true);
      if (shock) recommendations.push(shock);
      
      if (!phInChlorineRange) {
        insights.push('⚠️ Prije kloriranja, dovedite pH u optimalan raspon (7.2-7.6) za maksimalnu učinkovitost klora.');
      }
      
      // If ORP is also provided and low, add context
      if (params.orp && params.orp < IDEAL_RANGES.orp.min) {
        insights.push('📊 Nizak klor I nizak ORP = urgentno potrebna dezinfekcija!');
      }
    } else if (params.freeChlorine > IDEAL_RANGES.freeChlorine.critical.max) {
      overallStatus = 'critical';
      issues.push(`Slobodni klor kritično visok (${params.freeChlorine} mg/L)`);
      
      const neutralizer = Products.calculateChlorineNeutralizer(params.freeChlorine, targetCl, poolVolume);
      if (neutralizer) recommendations.push(neutralizer);
      
      insights.push('⚠️ Visok klor može iritirati kožu i oči. Preporučuje se smanjenje prije kupanja.');
    } else if (params.freeChlorine < IDEAL_RANGES.freeChlorine.min) {
      if (overallStatus !== 'critical') overallStatus = 'warning';
      issues.push(`Slobodni klor nizak (${params.freeChlorine} mg/L)`);
      
      // Recommend daily chlorination
      const daily = Products.calculateChlorineDaily(params.freeChlorine, targetCl, poolVolume);
      if (daily) recommendations.push(daily);
      
      // Also suggest tablets for maintenance
      const tablets = Products.calculateChlorineTablets(poolVolume, phInIdealRange, params.temperature);
      if (tablets) {
        tablets.priority = 3;
        recommendations.push(tablets);
      }
      
      // ORP context
      if (params.orp && params.orp < IDEAL_RANGES.orp.min) {
        insights.push('📊 Nizak klor je glavna uzrok niskog ORP-a. Povećanje klora će poboljšati ORP.');
      }
    } else if (params.freeChlorine > IDEAL_RANGES.freeChlorine.max) {
      if (overallStatus !== 'critical') overallStatus = 'warning';
      issues.push(`Slobodni klor visok (${params.freeChlorine} mg/L)`);
      
      // Recommend Klor Minus for high chlorine
      const neutralizer = Products.calculateChlorineNeutralizer(params.freeChlorine, targetCl, poolVolume);
      if (neutralizer) {
        neutralizer.instructions = 'Za brže sniženje klora. ' + neutralizer.instructions;
        recommendations.push(neutralizer);
      }
      
      insights.push('💡 Možete pričekati prirodno smanjenje klora (24-48h) ili koristiti Klor Minus za bržu neutralizaciju.');
    }
    
    // Add maintenance suggestions if chlorine is OK
    if (params.freeChlorine >= IDEAL_RANGES.freeChlorine.min && 
        params.freeChlorine <= IDEAL_RANGES.freeChlorine.max &&
        phInIdealRange) {
      const tablets = Products.calculateChlorineTablets(poolVolume, true, params.temperature);
      if (tablets) {
        tablets.instructions = 'Za dugotrajno održavanje. ' + tablets.instructions;
        recommendations.push(tablets);
      }
    }
  }

  // Special case: Good chlorine but bad ORP due to pH
  if (params.pH && params.freeChlorine && params.orp) {
    const chlorineOK = params.freeChlorine >= IDEAL_RANGES.freeChlorine.min && 
                       params.freeChlorine <= IDEAL_RANGES.freeChlorine.max;
    const orpLow = params.orp < IDEAL_RANGES.orp.min;
    const phHigh = params.pH > IDEAL_RANGES.pH.max;
    
    if (chlorineOK && orpLow && phHigh) {
      insights.push('🎯 KLJUČNI PROBLEM: pH je previsok! To čini klor neučinkovitim unatoč dobroj koncentraciji.');
      insights.push('   → Akcija: Snizite pH na 7.2-7.6 i ORP će se automatski poboljšati');
    }
  }

  // Izgled vode s fotografije bazena (AI procjena)
  if (appearance && appearance.isPool !== false) {
    const hasFloc = () => recommendations.some(r => r.productId === 'flocculant');
    if (appearance.clarity === 'green' || appearance.algae === 'visible') {
      overallStatus = 'critical';
      issues.push('Voda je zelena ili s vidljivim algama (fotografija bazena)');
      if (!recommendations.some(r => r.productId === 'chlorine-granules-shock')) {
        const shock = Products.calculateChlorineShock(params.freeChlorine ?? 0, poolVolume, true);
        if (shock) recommendations.push(shock);
      }
      const floc = Products.calculateFlocculant(poolVolume, 'very-cloudy');
      if (floc && !hasFloc()) {
        floc.priority = 3;
        floc.instructions = 'Nakon šok kloriranja, kad voda više nije zelena. ' + floc.instructions;
        recommendations.push(floc);
      }
      insights.push('🟢 Na fotografiji je voda zelena ili s algama: prvo šok kloriranje i filtracija 24 sata, zatim algicid prema uputi na pakiranju i flokulant.');
    } else if (appearance.clarity === 'cloudy' || appearance.clarity === 'slightly_cloudy') {
      if (overallStatus === 'ok') overallStatus = 'warning';
      issues.push(appearance.clarity === 'cloudy' ? 'Voda je mutna (fotografija bazena)' : 'Voda je blago mutna (fotografija bazena)');
      const floc = Products.calculateFlocculant(poolVolume, appearance.clarity === 'cloudy' ? 'very-cloudy' : 'slightly-cloudy');
      if (floc && !hasFloc()) recommendations.push(floc);
      insights.push('💧 Mutna voda: provjerite filter i vrijeme filtracije, a nakon flokulanta usisajte talog s dna.');
      if (appearance.algae === 'possible') insights.push('🔎 Na fotografiji su moguće početne alge: pratite boju vode i razinu klora idućih dana.');
    } else if (appearance.clarity === 'clear') {
      insights.push('📷 Na fotografiji je voda bistra.');
      if (appearance.algae === 'possible') insights.push('🔎 Na fotografiji su moguće početne alge: pratite boju vode i razinu klora idućih dana.');
    }
    if (appearance.debris) insights.push('🍂 Na fotografiji se vide lišće ili nečistoće: očistite skimmer i usisajte dno.');
  }

  // Alkalinity Analysis
  if (params.alkalinity !== undefined) {
    if (params.alkalinity < IDEAL_RANGES.alkalinity.critical.min) {
      overallStatus = 'critical';
      issues.push(`Alkalnost kritično niska (${params.alkalinity} mg/L)`);
      insights.push('⚠️ Niska alkalnost može uzrokovati brze promjene pH vrijednosti.');
    } else if (params.alkalinity > IDEAL_RANGES.alkalinity.critical.max) {
      overallStatus = 'critical';
      issues.push(`Alkalnost kritično visoka (${params.alkalinity} mg/L)`);
      insights.push('💡 Visoka alkalnost otežava podešavanje pH. Preporučuje se postupno snižavanje.');
    } else if (params.alkalinity < IDEAL_RANGES.alkalinity.min) {
      if (overallStatus !== 'critical') overallStatus = 'warning';
      issues.push(`Alkalnost niska (${params.alkalinity} mg/L)`);
    } else if (params.alkalinity > IDEAL_RANGES.alkalinity.max) {
      if (overallStatus !== 'critical') overallStatus = 'warning';
      issues.push(`Alkalnost visoka (${params.alkalinity} mg/L)`);
    }
  }

  // Hardness Analysis
  if (params.hardness !== undefined) {
    if (params.hardness < IDEAL_RANGES.hardness.critical.min) {
      overallStatus = 'critical';
      issues.push(`Tvrdoća kritično niska (${params.hardness} mg/L)`);
      insights.push('⚠️ Niska tvrdoća može oštetiti površine bazena (korozija).');
    } else if (params.hardness > IDEAL_RANGES.hardness.critical.max) {
      overallStatus = 'critical';
      issues.push(`Tvrdoća kritično visoka (${params.hardness} mg/L)`);
      insights.push('⚠️ Visoka tvrdoća može uzrokovati kamenac i mutnu vodu.');
      
      // Suggest flocculant for clarity
      const floc = Products.calculateFlocculant(poolVolume, 'slightly-cloudy');
      if (floc && !recommendations.some(r => r.productId === 'flocculant')) {
        floc.priority = 3;
        recommendations.push(floc);
      }
    } else if (params.hardness < IDEAL_RANGES.hardness.min) {
      if (overallStatus !== 'critical') overallStatus = 'warning';
      issues.push(`Tvrdoća niska (${params.hardness} mg/L)`);
    } else if (params.hardness > IDEAL_RANGES.hardness.max) {
      if (overallStatus !== 'critical') overallStatus = 'warning';
      issues.push(`Tvrdoća visoka (${params.hardness} mg/L)`);
    }
  }

  // Generate status message
  let message = '';
  if (overallStatus === 'ok') {
    message = '✅ Voda je u idealnom stanju';
    if (recommendations.length === 0) {
      insights.push('💧 Nastavite s redovitim održavanjem. Provjeravajte parametre tjedno.');
    }
    
    // Special mention if ORP is excellent
    if (params.orp && params.orp >= IDEAL_RANGES.orp.min && params.orp <= IDEAL_RANGES.orp.max) {
      insights.push('🌟 ORP potvrđuje da je dezinfekcija učinkovita i voda sigurna za kupanje!');
    }
  } else if (overallStatus === 'warning') {
    message = '⚠️ Voda zahtijeva korekcije';
    insights.push('📋 Slijedite preporuke i izmjerite ponovno nakon 4-6 sati.');
    
    // Add ORP monitoring tip
    if (params.orp !== undefined) {
      insights.push('🔬 Pratite ORP zajedno sa slobodnim klorom - to pokazuje stvarnu učinkovitost dezinfekcije.');
    }
  } else {
    message = '🚨 Voda je u kritičnom stanju';
    insights.push('⚠️ Hitno potrebne korekcije! Ne koristite bazen dok se parametri ne normaliziraju.');
    
    if (!orpSanitizationEffective && params.orp !== undefined) {
      insights.push('🛑 ORP pokazuje da dezinfekcija nije učinkovita - bazen NIJE siguran!');
    }
  }

  // Educational insight about ORP
  if (params.orp === undefined && params.freeChlorine !== undefined) {
    insights.push('💡 Savjet: Mjerenje ORP-a (redox potencijal) pokazuje stvarnu učinkovitost klora, ne samo koncentraciju. Preporučujemo dodavanje ORP mjerenja u buduće analize.');
  }

  // Automated system recommendations - suggest liquid programs
  if (disinfectionSystem === 'salt-electrolysis') {
    insights.push('⚡ ELEKTROLIZA SOLI - Redoviti program:');
    insights.push('   • Tjedno: Provjerite razinu soli (3-4 g/L optimalno)');
    insights.push('   • Mjesečno: Alginox (tekući algicid) - 1L/100m³');
    insights.push('   • Sezonski: Klorfix Plus (stabilizator) - po potrebi');
    insights.push('   • Kontinuirano: pH automatika sa tekućim pH Minus/Plus');
    
    // Add weekly algaecide if water is ok
    if (overallStatus === 'ok') {
      recommendations.push({
        productId: 'alginox-liquid',
        productName: 'Alginox tekući (prevencija algi)',
        quantity: Math.round((poolVolume / 100) * 1000),
        unit: 'ml',
        dosage: `${Math.round((poolVolume / 100) * 1000)} ml`,
        instructions: 'Mjesečna prevencija algi. Dodati uz uključenu cirkulaciju.',
        priority: 4,
        category: 'algaecide',
      });
    }
  } else if (disinfectionSystem === 'chlorine+ph') {
    insights.push('💉 KLOR + pH AUTOMATIKA - Redoviti program:');
    insights.push('   • Tjedno: Provjerite rezervoare tekućeg klora i pH regulatora');
    insights.push('   • Nadopunite: Klorex tekući (klor) prema potrošnji');
    insights.push('   • Nadopunite: pH Minus tekući (za automatiku)');
    insights.push('   • Mjesečno: Alginox tekući - 1L/100m³');
    insights.push('   • Kalibracija: Mjesečno kalibrirajte pH i klor sonde');
    
    // Add recommendations for liquid products
    if (phStatus === 'high' || phStatus === 'critical-high') {
      insights.push('   ⚠️ VAŽNO: Koristite pH Minus TEKUĆI za automatiku, ne granule!');
    }
    
    // Add liquid algaecide
    if (overallStatus === 'ok' || overallStatus === 'warning') {
      recommendations.push({
        productId: 'alginox-liquid',
        productName: 'Alginox tekući (za automatiku)',
        quantity: Math.round((poolVolume / 100) * 1000),
        unit: 'ml',
        dosage: `${Math.round((poolVolume / 100) * 1000)} ml`,
        instructions: 'Mjesečna prevencija. Dozira se automatski ili ručno.',
        priority: 4,
        category: 'algaecide',
      });
    }
  } else if (disinfectionSystem === 'peroxide') {
    insights.push('💧 PEROKSID SUSTAV - Redoviti program:');
    insights.push('   • Tjedno: Nadopunite rezervoar sa aktivnim kisikom');
    insights.push('   • Tekući peroksid: Prema uputama dozatora');
    insights.push('   • pH regulacija: pH Minus/Plus tekući');
    insights.push('   • Mjesečno: Provjerite rad dozatora i kvalitetu vode');
    insights.push('   • Napomena: Peroksid ne ostavlja rezidual - testiranje je ključno!');
  } else if (disinfectionSystem === 'tablets') {
    insights.push('💊 TABLETE KLORA - Redoviti program:');
    insights.push('   • Tjedno: Provjerite skimmer ili plutajući dozator');
    insights.push('   • Dodajte: 200g tablete (1-2 komada po 10m³)');
    insights.push('   • Stabilizator: Redovito pratite CYA razinu (30-50 ppm)');
    insights.push('   • pH korekcija: Granule ili tekući prema potrebi');
    insights.push('   • Napomena: Tablete sadrže stabilizator - pažnja na akumulaciju!');
  }

  // Sort recommendations by priority
  recommendations.sort((a, b) => a.priority - b.priority);

  // Calculate treatment cost
  const treatmentCost = calculateTreatmentCost(recommendations);

  console.log('🔬 === WATER ANALYSIS RESULT ===');
  console.log('📊 Status:', overallStatus);
  console.log('💬 Message:', message);
  console.log('⚠️ Issues:', issues);
  console.log('💊 Recommendations:', recommendations.length, 'products');
  console.log('💡 Insights:', insights.length, 'tips');
  console.log('💰 Treatment Cost:', treatmentCost);
  console.log('🔬 === END ANALYSIS ===');

  return {
    status: overallStatus,
    message,
    issues,
    recommendations,
    insights,
    treatmentCost,
  };
}

export { IDEAL_RANGES };