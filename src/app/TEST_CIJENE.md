# 🧪 Test Cijene - Debug Upute

## 🔍 Kako Testirati Trošak Tretmana:

### **1. Pokrenite Aplikaciju:**
```bash
npm run dev
```

### **2. Otvorite Browser Console:**
```
F12 (ili Right Click → Inspect)
→ Console tab
```

### **3. Nova Analiza:**
```
Home → Bazeni → (Kreirajte bazen ako nemate)
→ "Nova analiza"
```

### **4. Unesite Parametre:**

**Primjer 1 - Samo pH Problem:**
```
pH: 8.0        (previsok - treba pH Minus)
Klor: 1.5      (OK)
Volumen: 40 m³
```

**Primjer 2 - pH + Klor Problem:**
```
pH: 7.8
Klor: 0.3      (nizak - treba klor granule)
Volumen: 50 m³
```

**Primjer 3 - Kompletan Tretman:**
```
pH: 8.2
Klor: 0.2      (vrlo nizak)
Alkalnost: 60  (nizak)
Volumen: 60 m³
```

### **5. Kliknite "Izračunaj Stanje Vode"**

### **6. Provjerite Console:**

**Trebali biste vidjeti:**
```javascript
Calculating with params: {pH: 8, freeChlorine: 1.5, ...}
Analysis result: {status: "warning", message: "...", ...}
Treatment cost: {items: [...], totalEUR: 4.20, totalHRK: 31.626}
```

### **7. Scroll Dolje:**

**Trebali biste vidjeti:**
```
✅ Preporučeni proizvodi (Ivero)
   - pH Minus (granule): 500 g

✅ 💰 Trošak Tretmana
   ┌─────────────────────────────┐
   │ pH Minus (granule)          │
   │ Potrebno: 500 g             │
   │ Kupiti: 1 x 1 kg           │
   │                    €4.20    │
   └─────────────────────────────┘
   
   UKUPNO: €4.20 (31.63 kn)
```

---

## 🐛 Debugging - Ako Ne Radi:

### **Problem 1: "Treatment cost undefined"**

**Razlog:**
- calculateTreatmentCost ne može pronaći product type

**Provjera:**
```javascript
// U Console-u nakon "Calculating with params:"
// Provjerite recommendations array:
console.log(analysisResult.recommendations);

// Trebali biste vidjeti:
[
  {
    productId: "ph-minus-granules",
    productName: "pH Minus (granule)",
    quantity: 500,
    unit: "g",
    dosage: "500 g",
    instructions: "...",
    priority: 1,
    category: "ph"
  }
]
```

**Fix:**
- Provjerite da productName SADRŽI jedan od stringova:
  - "pH Plus"
  - "pH Minus"
  - "Klor Granule"
  - "Klor Tablete"
  - itd.

---

### **Problem 2: "Trošak Tretmana sekcija se ne prikazuje"**

**Razlog:**
- `result.treatmentCost.items.length === 0`

**Provjera Console:**
```javascript
// Nakon "Treatment cost:"
// Provjerite items array:
console.log(result.treatmentCost.items);

// Ako je prazan [], znači da calculateTreatmentCost
// ne prepoznaje product type
```

**Fix u `/lib/productPrices.ts`:**
```typescript
const productTypeMap: Record<string, string> = {
  'pH Plus': 'ph-plus',
  'pH Minus': 'ph-minus',       // ← Treba biti "pH Minus"
  'Klor granule': 'chlor-granule',  // ← NOT "Klor Granule"
  'Klor tablete': 'chlor-tabs',
  'Flokulant': 'flocculant',
  'Stabilizator': 'stabilizer',
  // ...
};
```

**Provjeri TOČAN naziv proizvoda u products.ts:**
```typescript
productName: 'pH Minus (granule)',  // ← "pH Minus"
productName: 'Klor granule (šok)',  // ← "Klor granule"
```

---

### **Problem 3: "Stari rezultat ostaje"**

**Razlog:**
- React ne resetuje state

**Fix:** ✅ **RIJEŠENO!**
- Dodao sam `setResult(null)` na početku `handleCalculate()`

**Provjera:**
```typescript
const handleCalculate = () => {
  if (!pool) return;
  
  setResult(null); // ← OVO resetuje stari rezultat
  
  const params = { ... };
  const analysisResult = analyzeWater(params, pool.volume);
  setResult(analysisResult);
};
```

---

## ✅ Checklist Debug-a:

```
[ ] npm run dev
[ ] F12 → Console tab otvoren
[ ] Nova analiza
[ ] Unio parametre (npr. pH 8.0)
[ ] Klik "Izračunaj"
[ ] Console pokazuje:
    [ ] "Calculating with params: ..."
    [ ] "Analysis result: ..."
    [ ] "Treatment cost: ..."
[ ] Scroll dolje
[ ] Vidim "Preporučeni proizvodi"
[ ] Vidim "💰 Trošak Tretmana" (ako ima stavki)
```

---

## 🔧 Manual Test - Console:

**Ako ništa ne radi, testirajte manual u Console-u:**

```javascript
// 1. Import funkcije
import { calculateTreatmentCost } from './lib/productPrices';

// 2. Test recommendation
const testRec = {
  productName: 'pH Minus (granule)',
  quantity: 500,
  unit: 'g'
};

// 3. Pozovi funkciju
const cost = calculateTreatmentCost([testRec]);

// 4. Provjeri rezultat
console.log(cost);
// Trebao bi pokazati:
// {
//   items: [{
//     productType: "pH Minus (granule)",
//     productName: "Ivero pH Minus",
//     amountNeeded: 500,
//     unit: "g",
//     product: {...},
//     quantity: 1,
//     quantityText: "1 x 1 kg",
//     totalCost: 4.20
//   }],
//   totalEUR: 4.20,
//   totalHRK: 31.626
// }
```

---

## 📊 Očekivani Rezultati:

### **pH 8.0, Klor 1.5, Volumen 40 m³:**
```
Preporuke:
- pH Minus (granule): 540 g

Trošak:
- Potrebno: 540 g
- Kupiti: 1 x 1 kg
- Cijena: €4.20 (31.63 kn)

UKUPNO: €4.20
```

### **pH 7.8, Klor 0.3, Volumen 50 m³:**
```
Preporuke:
- pH Minus (granule): 360 g
- Klor granule (dnevno): 100 g

Trošak:
- pH Minus: 1 x 1 kg = €4.20
- Klor Granule: 1 x 1 kg = €12.90

UKUPNO: €17.10 (128.77 kn)
```

### **pH 8.2, Klor 0.2, Volumen 60 m³:**
```
Preporuke:
- pH Minus (granule): 1080 g
- Klor granule (šok): 750 g
- Stabilizator klora: 900 g

Trošak:
- pH Minus: 1 x 5 kg = €17.50
- Klor Granule: 1 x 1 kg = €12.90
- Stabilizator: 1 x 1 kg = €9.90

UKUPNO: €40.30 (303.46 kn)
```

---

## 🚨 Ako Još Ne Radi:

**Pošaljite Screenshot:**
1. Console output (sa "Calculating with params", "Analysis result", "Treatment cost")
2. Recommendations sekcija (proizvodi)
3. Da li vidite "💰 Trošak Tretmana" sekciju

**I napišite:**
- Koje parametre ste unijeli
- Što vidite u Console-u
- Da li vidite preporuke
- Da li vidite trošak

---

**DEBUG MODE:**
```javascript
// Dodajte u calculateTreatmentCost():
console.log('=== TREATMENT COST DEBUG ===');
console.log('Recommendations:', recommendations);

for (const rec of recommendations) {
  console.log('Processing:', rec.productName);
  console.log('Product type found:', productType);
  console.log('Quantity:', rec.quantity, rec.unit);
}

console.log('Final items:', items);
console.log('Total EUR:', totalEUR);
```

**To će pokazati GDJE se zaustavlja!** 🔍
