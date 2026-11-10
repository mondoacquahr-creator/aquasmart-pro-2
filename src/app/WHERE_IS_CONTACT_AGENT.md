# ✅ Gdje Su Opcije za Chat i Video Poziv

## 📍 Lokacije:

### **1. Nova Analiza Vode** (`/pools/:poolId/analysis/new`)

Kad otvorite stranicu za novu analizu:
1. Unesite parametre vode
2. **Scroll dolje** → Vidjet ćete:

```
┌─────────────────────────────────────┐
│  📸 PHOTO UPLOAD SECTION            │
│  - Fotografiraj / Upload sliku      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  💬 CONTACT AGENT                   │
│  ┌──────────┐  ┌──────────┐        │
│  │WhatsApp  │  │  Poziv   │        │
│  │  Chat    │  │Telefonski│        │
│  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐        │
│  │  Video   │  │  Viber   │        │
│  │  Poziv   │  │  Chat    │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  [Email podrška]                    │
└─────────────────────────────────────┘
```

---

### **2. Pool Details** (`/pools/:poolId`)

Kad otvorite detalje bazena:
1. Vidite status vode
2. **Scroll na dno** → Ista **Contact Agent** kartica!

```
┌─────────────────────────────────────┐
│  📝 Napomene (ako postoje)          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  💬 KONTAKTIRAJ AGENTA              │
│  ✅ Agenti trenutno dostupni        │
│                                     │
│  [WhatsApp]  [Poziv]                │
│  [Video]     [Viber]                │
│  [Email podrška]                    │
└─────────────────────────────────────┘
```

---

## 🎯 Kako Testirati:

### **Test 1: Na Nova Analiza:**
```bash
1. npm run dev
2. Home → Bazeni → Odaberi bazen
3. "Nova analiza vode"
4. Scroll dolje
5. Vidi "Kontaktiraj agenta" karticu! ✅
```

### **Test 2: Na Pool Details:**
```bash
1. Home → Bazeni → Odaberi bazen
2. Scroll dolje
3. Vidi "Kontaktiraj agenta" karticu! ✅
```

---

## 📱 Što Svaki Button Radi:

### **WhatsApp Chat** 💬
```
Klik → Otvara WhatsApp sa:
"Pozdrav! Trebam pomoć sa analizom vode za bazen [pool_id]"
```

### **Telefonski Poziv** ☎️
```
Klik → Direktno poziva:
tel:+385911234567
```

### **Video Poziv** 📹
```
Klik → Otvara WhatsApp (za video):
https://wa.me/385911234567
```

### **Viber Chat** 💜
```
Klik → Otvara Viber chat:
viber://chat?number=+385911234567
```

### **Email** 📧
```
Klik → Otvara email sa:
Subject: "Analiza vode - [pool_id]"
Body: Auto-popunjena poruka
```

---

## 🔧 Konfiguriraj Broj:

**U `/components/ContactAgent.tsx`:**

```typescript
// Linija 8-9:
const agentPhone = "+385911234567";  // ← PROMIJENI OVDJE
const agentEmail = "info@aquasmart.hr"; // ← I OVDJE
```

---

## 🎨 Kako Izgleda:

### Desktop View:
```
┌────────────────────────────────────────┐
│  💬 Kontaktiraj agenta                 │
│  Dostupni 24/7 za pomoć                │
│  ┌─────────────────────────────────┐  │
│  │ ✅ Agenti trenutno dostupni     │  │
│  └─────────────────────────────────┘  │
│                                        │
│  [WhatsApp] [Poziv]                    │
│  [Video]    [Viber]                    │
│                                        │
│  [Email podrška]                       │
│                                        │
│  📞 +385911234567                      │
└────────────────────────────────────────┘
```

### Mobile View:
- Touch-optimized buttoni
- Larger tap targets
- Native app deep links

---

## ✅ Checklist:

```
[ ] npm run dev radi
[ ] Otvori /pools
[ ] Odaberi bazen
[ ] Klikni "Nova analiza"
[ ] Scroll dolje
[ ] Vidiš "Photo Upload" sekciju
[ ] Vidiš "Contact Agent" sekciju sa 5 buttona
[ ] Klikni WhatsApp → Otvara WhatsApp
[ ] Klikni Phone → Pokreće poziv
[ ] Klikni Video → Otvara WhatsApp
[ ] Klikni Viber → Otvara Viber
[ ] Klikni Email → Otvara email client
```

---

## 🐛 Ako Ne Vidiš:

### Problem: Kartice nisu vidljive

**Rješenje:**
```bash
# Provjeri da su fajlovi spremljeni:
ls components/ContactAgent.tsx
ls components/PhotoUpload.tsx

# Provjeri import u NewAnalysis.tsx:
grep "ContactAgent" components/NewAnalysis.tsx
grep "PhotoUpload" components/NewAnalysis.tsx

# Rebuild:
npm run dev
```

### Problem: Buttoni ne rade

**Provjeri:**
- WhatsApp/Viber instaliran na uređaju?
- Browser dozvoljava tel: linkove?
- Deep links rade na mobitelu (ne desktop simulator)

---

## 🚀 Deploy & Test:

```bash
# Deploy:
vercel

# Test na mobitelu:
1. Otvori vercel URL
2. Nova analiza
3. Scroll dolje
4. Klikni WhatsApp → Trebao bi otvoriti WhatsApp app! ✅
```

---

**Sada idi u app i scroll dolje u "Nova analiza" - vidjet ćeš sve buttone!** 📱✨
