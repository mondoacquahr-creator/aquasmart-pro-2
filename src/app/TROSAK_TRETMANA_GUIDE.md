# 💰 Trošak Tretmana - Kalkulacija Cijene Kemije

## ✨ Nova Funkcionalnost!

Aplikacija sada **automatski izračunava trošak kemije** koju korisnik mora kupiti za tretman bazenske vode!

---

## 🎯 Što Prikazuje:

### **1. Detaljni Prikaz Po Proizvodu:**

```
┌─────────────────────────────────────────────┐
│ pH Minus                                    │
│ Potrebno: 500 g                             │
│ Kupiti: 1 x 1 kg | Ivero pH Minus     €4.20│
├─────────────────────────────────────────────┤
│ Klor Granule                                │
│ Potrebno: 800 g                             │
│ Kupiti: 1 x 1 kg | Ivero Chlor Granulat   │
│                                      €12.90 │
└─────────────────────────────────────────────┘
```

### **2. Ukupan Trošak:**

```
┌─────────────────────────────────────────────┐
│ UKUPNO:                              €17.10 │
│                                    128.77 kn │
│ PDV uključen u cijenu                       │
└─────────────────────────────────────────────┘
```

---

## 📊 Implementacija:

### **Fajlovi Kreirani:**

#### **1. `/lib/productPrices.ts`** ✅
- **Cijene svih Ivero proizvoda:**
  - pH Plus/Minus (1kg, 5kg)
  - Chlor Granule/Tablete (1kg, 5kg)
  - Multitabs (1kg, 5kg)
  - Flokulant (1L, 3L)
  - Stabilizator (1kg, 5kg)
  - Algistat (1L, 3L)
  - Shock Chlor (1kg, 5kg)
  - Alkalinity Plus (1kg, 5kg)
  - Hardness Plus (1kg, 5kg)

**Primjer cijene:**
```typescript
'ph-minus-1kg': {
  id: 'ph-minus-1kg',
  name: 'Ivero pH Minus',
  size: '1 kg',
  priceEUR: 4.20,
  priceHRK: 31.60
}
```

#### **2. Ažurirano: `/lib/waterAnalysis.ts`** ✅
- Dodao `treatmentCost` u `AnalysisResult`
- Import `calculateTreatmentCost` funkcije
- Automatski izračunava trošak pri analizi

#### **3. Ažurirano: `/components/NewAnalysis.tsx`** ✅
- Prikazuje "Trošak Tretmana" karticu
- Detaljni breakdown po proizvodu
- Ukupan trošak u EUR i HRK
- Disclaimer o informativnim cijenama

---

## 🧮 Kako Radi Kalkulacija:

### **Pametni Odabir Pakovanja:**

```typescript
// Ako trebate 500g pH Minus:
→ Aplikacija bira: 1 x 1 kg (€4.20)

// Ako trebate 3.5kg pH Minus:
→ Aplikacija bira: 1 x 5 kg (€17.50)
  (jeftinije nego 4 x 1 kg = €16.80)

// Ako trebate 12kg pH Minus:
→ Aplikacija bira: 3 x 5 kg (€52.50)
```

**Logika:**
- ≤ 1kg → Bira 1kg pakovanje
- > 1kg → Bira 5kg pakovanje (ekonomičnije)
- Zaokružuje na gore (npr. 3.2kg → 4 x 1kg ili 1 x 5kg)

---

## 💶 Cijene (Informativne):

### **pH Regulatori:**
| Proizvod | Pakovanje | Cijena (EUR) | Cijena (HRK) |
|----------|-----------|--------------|--------------|
| pH Plus  | 1 kg      | €4.50        | 33.90 kn     |
| pH Plus  | 5 kg      | €18.90       | 142.40 kn    |
| pH Minus | 1 kg      | €4.20        | 31.60 kn     |
| pH Minus | 5 kg      | €17.50       | 131.80 kn    |

### **Klor Proizvodi:**
| Proizvod         | Pakovanje     | Cijena (EUR) | Cijena (HRK) |
|------------------|---------------|--------------|--------------|
| Chlor Granulat   | 1 kg          | €12.90       | 97.20 kn     |
| Chlor Granulat   | 5 kg          | €54.90       | 413.60 kn    |
| Chlor Tablete    | 1 kg (5 kom)  | €14.90       | 112.30 kn    |
| Chlor Tablete    | 5 kg (25 kom) | €62.90       | 474.00 kn    |
| Multitabs        | 1 kg (5 kom)  | €16.90       | 127.30 kn    |
| Multitabs        | 5 kg (25 kom) | €72.90       | 549.30 kn    |
| Shock Chlor      | 1 kg          | €13.90       | 104.70 kn    |
| Shock Chlor      | 5 kg          | €59.90       | 451.40 kn    |

### **Dodatci:**
| Proizvod         | Pakovanje | Cijena (EUR) | Cijena (HRK) |
|------------------|-----------|--------------|--------------|
| Flokulant        | 1 L       | €8.90        | 67.00 kn     |
| Flokulant        | 3 L       | €23.90       | 180.10 kn    |
| Stabilizator     | 1 kg      | €9.90        | 74.60 kn     |
| Stabilizator     | 5 kg      | €42.90       | 323.30 kn    |
| Algistat         | 1 L       | €11.90       | 89.70 kn     |
| Algistat         | 3 L       | €31.90       | 240.40 kn    |
| Alkalinity Plus  | 1 kg      | €5.90        | 44.50 kn     |
| Alkalinity Plus  | 5 kg      | €24.90       | 187.70 kn    |
| Hardness Plus    | 1 kg      | €6.90        | 52.00 kn     |
| Hardness Plus    | 5 kg      | €29.90       | 225.30 kn    |

---

## 🎨 Kako Izgleda U Aplikaciji:

### **Lokacija:**
```
Nova Analiza → Unesite parametre → Izračunaj → 
→ Scroll dolje → "Trošak Tretmana" kartica
```

### **Dizajn:**
```
┌─────────────────────────────────────────────────┐
│ 💰 Trošak Tretmana                              │
│ Procijenjeni trošak potrebnih proizvoda        │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ pH Minus                                    │ │
│ │ Potrebno: 500 g                             │ │
│ │ Kupiti: 1 x 1 kg | Ivero pH Minus          │ │
│ │                                       €4.20 │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Klor Granule                                │ │
│ │ Potrebno: 2400 g                            │ │
│ │ Kupiti: 1 x 5 kg | Ivero Chlor Granulat    │ │
│ │                                      €54.90 │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ UKUPNO:                                 €59.10  │
│                                        445.16 kn│
│ PDV uključen u cijenu                           │
├─────────────────────────────────────────────────┤
│ ℹ️  Cijene su informativne i odnose se na      │
│    Ivero proizvode. Stvarne cijene mogu        │
│    varirati ovisno o prodajnom mjestu.         │
└─────────────────────────────────────────────────┘
```

---

## ✅ Primjeri Kalkulacije:

### **Primjer 1: pH Korekcija**
```
Input:
- pH = 8.2 (previsok)
- Volumen = 40 m³

Preporuka:
- pH Minus: 800 g

Kalkulacija:
- Potrebno: 800 g
- Bira: 1 x 1 kg (€4.20)
- Ukupno: €4.20 (31.60 kn)
```

### **Primjer 2: Klor + pH**
```
Input:
- pH = 7.8
- Klor = 0.3 mg/L (nizak)
- Volumen = 50 m³

Preporuke:
- pH Minus: 500 g
- Klor Granule: 2500 g

Kalkulacija:
- pH Minus: 1 x 1 kg = €4.20
- Klor Granule: 1 x 5 kg = €54.90
- Ukupno: €59.10 (445.16 kn)
```

### **Primjer 3: Kompletan Tretman**
```
Input:
- pH = 8.1
- Klor = 0.4 mg/L
- Stabilizator: Dodati
- Volumen = 60 m³

Preporuke:
- pH Minus: 1200 g
- Shock Klor: 3000 g
- Stabilizator: 600 g

Kalkulacija:
- pH Minus: 1 x 5 kg = €17.50
- Shock Chlor: 1 x 5 kg = €59.90
- Stabilizator: 1 x 1 kg = €9.90
- Ukupno: €87.30 (657.60 kn)
```

---

## 🔧 Kako Ažurirati Cijene:

**U `/lib/productPrices.ts`:**

```typescript
export const IVERO_PRICES: Record<string, ProductPrice> = {
  'ph-minus-1kg': {
    id: 'ph-minus-1kg',
    name: 'Ivero pH Minus',
    size: '1 kg',
    priceEUR: 4.20,  // ← Promijeni ovdje
    priceHRK: 31.60  // ← I ovdje
  },
  // ... ostali proizvodi
};
```

**Tečaj EUR → HRK:**
```typescript
const EUR_TO_HRK = 7.53; // ← Ažuriraj tečaj
```

---

## 📱 Test:

```bash
# 1. Run app:
npm run dev

# 2. Navigacija:
Home → Bazeni → Odaberi bazen → Nova analiza

# 3. Unesite parametre:
pH: 8.0
Klor: 0.5

# 4. Klik "Izračunaj stanje vode"

# 5. Scroll dolje:
→ Vidjet ćete "Trošak Tretmana" karticu! ✅
→ Sa detaljima proizvoda
→ I ukupnom cijenom
```

---

## 💡 Savjeti za Korisnika:

**Prikazano u aplikaciji:**
```
ℹ️  Cijene su informativne i odnose se na Ivero 
   proizvode. Stvarne cijene mogu varirati ovisno 
   o prodajnom mjestu.
```

**Dodatne napomene:**
- Cijene uključuju PDV
- Preporučena kupovina u većim pakovanjima (ekonomičnije)
- Mogućnost narudžbe preko trgovina u blizini (LocationPicker)

---

## 🚀 Prednosti:

✅ **Transparentnost** - Korisnik vidi koliko će platiti  
✅ **Planiranje budžeta** - Zna trošak prije kupnje  
✅ **Pametna kupovina** - Aplikacija bira najekonomičniju opciju  
✅ **Edukacija** - Razumije koji proizvodi su potrebni  
✅ **Povjerenje** - Profesionalac može pokazati klijentu trošak  

---

**Trošak kemije je sada LIVE u aplikaciji!** 💰✨

**Test: Nova analiza → Izračunaj → Scroll → Vidi cijene!** 🎯
