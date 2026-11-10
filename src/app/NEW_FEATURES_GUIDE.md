# 🎉 Nove Funkcionalnosti - AquaSmart Pro

## ✨ Što Je Novo (5 Featuera):

### 1. 📸 **Slanje Slike Bazena**
- **Komponenta**: `PhotoUpload.tsx`
- **Lokacija**: U analizi vode
- **Funkcionalnost**:
  - 📷 Fotografiranje direktno sa kamere (mobile)
  - 🖼️ Upload iz galerije
  - Drag & drop (desktop)
  - Preview prije slanja
  - Priložena slika pomaže agentima

**Integracija**: Automatski se pojavljuje u `NewAnalysis` komponenti

---

### 2. 💬 **Kontakt sa Agentom**
- **Komponenta**: `ContactAgent.tsx`
- **Funkcionalnost**:
  - **WhatsApp Chat** - Izravna poruka agenta
  - **Telefonski Poziv** - Jedan klik za poziv
  - **Video Poziv** - WhatsApp video
  - **Viber Chat** - Alternativni chat
  - **Email Podrška** - Za detaljna pitanja

**Kako Radi**:
```typescript
// Automatski popunjava poruku sa pool ID
"Pozdrav! Trebam pomoć sa analizom vode za bazen ${poolId}"
```

**Broj Agenta**: `+385911234567` (konfiguriraj u komponenti)

---

### 3. 🗺️ **Ručni Unos Lokacije + Mapa Trgovina**
- **Komponenta**: `LocationPicker.tsx`
- **Funkcionalnost**:
  - 📍 **GPS Auto-Detect** - Jedan klik za lokaciju
  - ✍️ **Ručni Unos** - Ako je GPS isključen
  - 🏪 **Trgovine U Blizini** - Lista sa udaljenostima
  - 🧭 **Navigacija** - Google Maps integracija
  - 📏 **Izračun Distance** - Automatski

**Trgovine**:
- Ivero Pool Shop Zagreb
- Bazeni i Oprema Split
- Pool Expert Rijeka
- Bauhaus Zagreb
- Vrtni Centar Zagreb

**Kako Dodati Nove Trgovine**:
```typescript
const stores: Store[] = [
  {
    id: '6',
    name: 'Nova Trgovina',
    address: 'Ulica 123, Grad',
    lat: 45.8150,
    lng: 15.9819,
    type: 'pool-shop' // ili 'hardware', 'garden-center'
  }
];
```

---

### 4. 📚 **Upute za Rad s Bazenom**
- **Komponenta**: `PoolInstructions.tsx`
- **Route**: `/instructions`
- **Kategorije**:

#### 🔹 Ispiranje Filtera:
  - Backwash pješčanog filtera
  - Čišćenje filtarskih uložaka

#### 🔹 Čišćenje Predfiltera Pumpe:
  - Step-by-step upute
  - Sigurnosne napomene

#### 🔹 Kalibracija Sondi:
  - pH sonda kalibracija
  - ORP sonda kalibracija
  - Čišćenje sondi

#### 🔹 Opće Održavanje:
  - Usisavanje bazena
  - Čišćenje skimmera

**Format Uputa**:
```typescript
{
  title: "Naslov",
  steps: ["Korak 1", "Korak 2", ...],
  frequency: "Tjedno",
  difficulty: "easy" | "medium" | "hard",
  warnings: ["⚠️ Važno upozorenje"],
  tips: ["💡 Koristan savjet"]
}
```

---

## 🚀 Kako Koristiti:

### PhotoUpload u Analizi:

```typescript
import { PhotoUpload } from './PhotoUpload';

<PhotoUpload
  onPhotoCapture={(photoUrl, file) => {
    setPoolPhoto(photoUrl);
    // Pošalji na server ili spremi lokalno
  }}
  existingPhoto={poolPhoto}
/>
```

### Contact Agent Anywhere:

```typescript
import { ContactAgent } from './ContactAgent';

<ContactAgent
  poolId={pool.id}
  analysisId={analysis.id}
/>
```

### Location Picker:

```typescript
import { LocationPicker } from './LocationPicker';

<LocationPicker
  onLocationSelect={(location) => {
    console.log(location.lat, location.lng);
  }}
  initialLocation={{ lat: 45.8150, lng: 15.9819 }}
/>
```

### Pool Instructions:

Navigacija na `/instructions` pokazuje sve upute!

---

## 📱 Mobile Features:

### Camera Access:
```html
<input 
  type="file" 
  accept="image/*" 
  capture="environment"  ← Otvara kameru na mobilnom
/>
```

### Tel/Video Links:
```javascript
// Direktan poziv:
window.location.href = `tel:+385911234567`;

// WhatsApp:
window.open(`https://wa.me/385911234567?text=...`, '_blank');

// GPS:
navigator.geolocation.getCurrentPosition(...);
```

---

## 🎨 Design:

Sve komponente koriste **isti moderni stil**:
- ✅ Glassmorphism
- ✅ Gradients
- ✅ Framer Motion animations
- ✅ Responsive design
- ✅ Touch-friendly buttons

---

## 🔧 Konfiguracija:

### Agent Broj:
```typescript
// U ContactAgent.tsx:
const agentPhone = "+385911234567";  // Promijeni ovdje
const agentEmail = "info@aquasmart.hr";
```

### Trgovine:
```typescript
// U LocationPicker.tsx:
const stores: Store[] = [...]; // Dodaj/ukloni
```

### Upute:
```typescript
// U PoolInstructions.tsx:
const instructions: Record<string, Instruction[]> = {
  'nova-kategorija': [...] // Dodaj novu kategoriju
};
```

---

## ✅ Testing Checklist:

### Photo Upload:
- [ ] Camera radi na mobilnom
- [ ] Galerija radi
- [ ] Drag & drop radi (desktop)
- [ ] Preview se prikazuje
- [ ] Remove button radi

### Contact Agent:
- [ ] WhatsApp otvara chat
- [ ] Phone poziv radi
- [ ] Video poziv radi
- [ ] Viber link radi
- [ ] Email compose radi

### Location Picker:
- [ ] GPS dohvaća lokaciju
- [ ] Ručni unos radi
- [ ] Trgovine se sortiraju po udaljenosti
- [ ] Navigacija otvara Google Maps
- [ ] Distance calculation točan

### Instructions:
- [ ] Sve kategorije se otvaraju
- [ ] Upute se prikazuju
- [ ] Steps su readable
- [ ] Warnings highlighted
- [ ] Tips prikazani

---

## 🎯 Next Steps:

1. **Testiraj na mobitelu** - Sve featuree
2. **Konfiguriraj brojeve** - Agent kontakt
3. **Dodaj trgovine** - Lokalne lokacije
4. **Proširi upute** - Dodaj više tutoriala
5. **Backend Integration** - Spremi slike na server

---

## 📚 Dokumentacija:

- `/components/PhotoUpload.tsx` - Photo upload komponenta
- `/components/ContactAgent.tsx` - Agent kontakt
- `/components/LocationPicker.tsx` - Lokacija i trgovine
- `/components/PoolInstructions.tsx` - Upute i tutoriali

**Sve komponente su standalone i mogu se koristiti bilo gdje!** ✨
