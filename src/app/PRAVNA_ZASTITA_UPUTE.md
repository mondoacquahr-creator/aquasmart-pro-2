# 🛡️ AquaSmart Pro - Pravna i Tehnička Zaštita

## 📋 Sadržaj
1. [Pravna zaštita](#1-pravna-zaštita)
2. [Tehnička zaštita koda](#2-tehnička-zaštita-koda)
3. [Integritet i distribucija](#3-integritet-i-distribucija)
4. [Praćenje kopija i reakcija](#4-praćenje-kopija-i-reakcija)
5. [Tim i suradnici](#5-tim-i-suradnici)
6. [Što je već implementirano](#što-je-već-implementirano)
7. [Sljedeći koraci](#sljedeći-koraci)

---

## 1. Pravna zaštita

### ✅ **Autorsko pravo**
Kod i dizajn su automatski zaštićeni od trenutka kreiranja, ali je važno jasno označiti vlasništvo:

#### **Što je IMPLEMENTIRANO:**
- ✅ **Terms of Use stranica** (`/terms-of-use`) - Detaljni uvjeti korištenja
- ✅ **Privacy Policy stranica** (`/privacy-policy`) - GDPR usklađena politika privatnosti
- ✅ **Copyright notice** u aplikaciji:
  - Footer u profesionalnom dijelu (`/app/more`)
  - Footer u vlasničkom dijelu (`/owner`)
  - Linkovi dostupni svim korisnicima

#### **Što TREBAŠ NAPRAVITI:**

**a) Registracija autorskih prava (opcionalno, ali preporučeno):**
- **Hrvatska:** DZIV (Državni zavod za intelektualno vlasništvo)
  - Cijena: ~500 kn
  - Rok: 1-2 mjeseca
  - Web: [www.dziv.hr](https://www.dziv.hr)

**b) Ažuriraj placeholder podatke u aplikaciji:**

Zamijeni `[IME VLASNIKA/TVRTKE]` sa stvarnim podacima u:
- `/components/TermsOfUse.tsx` (linija 27)
- `/components/PrivacyPolicy.tsx` (više mjesta)
- `/components/More.tsx` (linija 262)

Zamijeni `[VAŠA EMAIL ADRESA]` sa stvarnom email adresom u:
- `/components/TermsOfUse.tsx`
- `/components/PrivacyPolicy.tsx`

**c) Dodaj podatke o tvrtki:**
```typescript
// Primjer:
© 2024-2025 AquaTech d.o.o., Zagreb, Hrvatska. Sva prava pridržana.
Email: info@aquasmart.hr
OIB: 12345678901
```

---

### ✅ **Žig/Trademark**

#### **Što TREBAŠ NAPRAVITI:**

**a) Registracija žiga u Hrvatskoj:**
- **Gdje:** DZIV (Državni zavod za intelektualno vlasništvo)
- **Što registrirati:**
  - Naziv: "AquaSmart Pro"
  - Logo (ako imaš dizajn)
- **Cijena:** ~700-1000 kn
- **Rok:** 3-6 mjeseci
- **Klase:** Klasa 42 (softver/IT usluge), Klasa 9 (mobilne aplikacije)
- **Web:** [www.dziv.hr](https://www.dziv.hr)

**b) EU žig (opcionalno, ali preporučeno za EU tržište):**
- **Gdje:** EUIPO (EU Intellectual Property Office)
- **Cijena:** ~850 EUR (1 klasa), +150 EUR po dodatnoj klasi
- **Rok:** 4-6 mjeseci
- **Web:** [euipo.europa.eu](https://euipo.europa.eu)

**c) Google Play App Listing:**
- Dodaj **™** simbol uz naziv aplikacije dok čekaš registraciju
- Nakon registracije, koristi **®** simbol

---

### ✅ **Terms of Use + Privacy Policy**

#### **Što je IMPLEMENTIRANO:**
✅ Kompletne stranice s:
- Copyright zaštitom
- Zabranom reverse engineeringa
- GDPR usklađenošću
- Pravima korisnika
- Kontakt podacima za pritužbe

#### **Što TREBAŠ NAPRAVITI:**

**a) Ažuriraj kontakt podatke:**
- Email adresu
- Adresu tvrtke
- Data Protection Officer (ako imaš)
- Telefon

**b) Provjeri pravnu ispravnost:**
- Savjetujem se s odvjetnikom specijaliziranim za IT pravo
- Preporučujem: [odvjetnička komora Zagreb](https://www.zkzg.hr/)

**c) Obvezno prikaži linkove:**
- ✅ Već implementirano u `/app/more` i `/owner`
- Dodaj i u Google Play Store listing (u Description)

---

## 2. Tehnička zaštita koda

### ⚠️ **VAŽNA NAPOMENA: Trenutna aplikacija je React Web App**

Ova aplikacija je trenutno **React web aplikacija**, ne native Android app. 
Za Google Play trebat će **dodatni build proces**:

**Opcije za Android:**
1. **Capacitor** (preporučeno) - pretvara web app u native
2. **React Native** - native rebuild (više posla)
3. **PWA** (Progressive Web App) - web app kao native

---

### 🔐 **R8/ProGuard Obfuscation (za Android build)**

#### **Što TREBAŠ NAPRAVITI:**

Kada budeš radio Android build (Capacitor ili React Native), dodaj:

**a) Za Capacitor build:**

Kreiraj `android/app/proguard-rules.pro`:
```proguard
# AquaSmart Pro - ProGuard Rules
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Obfuscate sve osim Capacitor bridge-a
-keep class com.getcapacitor.** { *; }
-keep class org.apache.cordova.** { *; }

# Minimizacija i obfuscation
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification
-repackageclasses ''
```

U `android/app/build.gradle`:
```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

**b) Za React Native:**
```javascript
// metro.config.js
module.exports = {
  transformer: {
    minifierConfig: {
      keep_classnames: false,
      keep_fnames: false,
      mangle: {
        toplevel: true,
      },
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
};
```

---

### 🔑 **Zaštita API ključeva i tajnih podataka**

#### **Što je TRENUTNO:**
- Aplikacija koristi **localStorage** (lokalno, sigurno)
- Nema hardcoded API ključeva

#### **Što TREBAŠ NAPRAVITI kad dodaš backend (Supabase):**

**a) Nikad ne hardkodiraj:**
```typescript
// ❌ LOŠE:
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// ✅ DOBRO:
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
```

**b) Koristi Environment Variables:**

Kreiraj `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Dodaj u `.gitignore`:
```
.env.local
.env.production
```

**c) Supabase Row Level Security (RLS):**
```sql
-- Svaki korisnik vidi samo svoje podatke
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

### 🧠 **Osjetljiva logika na backend**

#### **Što TREBAŠ NAPRAVITI:**

**a) Prebaci scoring/pricing algoritme na Supabase Functions:**

```typescript
// supabase/functions/calculate-pricing/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { poolVolume, chemicals } = await req.json()
  
  // TAJNI ALGORITAM (nije vidljiv u klijentu!)
  const pricing = calculatePricing(poolVolume, chemicals)
  
  return new Response(JSON.stringify({ pricing }), {
    headers: { "Content-Type": "application/json" },
  })
})
```

**b) Zaštiti API endpoints:**
```typescript
// Provjera autentifikacije
const authHeader = req.headers.get('Authorization')
if (!authHeader) {
  return new Response('Unauthorized', { status: 401 })
}

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  { global: { headers: { Authorization: authHeader } } }
)

const { data: { user } } = await supabaseClient.auth.getUser()
if (!user) {
  return new Response('Unauthorized', { status: 401 })
}
```

---

## 3. Integritet i distribucija

### 🔐 **Play App Signing**

#### **Što TREBAŠ NAPRAVITI:**

**a) Google Play App Signing (automatski):**
- Prilikom prvog uploada APK-a na Google Play Console
- Google automatski aktivira App Signing
- ✅ **Preporuka:** Uvijek koristi

**b) Upload Bundle umjesto APK:**
```bash
# Napravi Android App Bundle (.aab) umjesto APK
./gradlew bundleRelease
```

---

### 🛡️ **Play Integrity API**

#### **Što TREBAŠ NAPRAVITI:**

**a) Dodaj Play Integrity API u projekt:**

U `android/app/build.gradle`:
```gradle
dependencies {
    implementation 'com.google.android.play:integrity:1.1.0'
}
```

**b) Implementiraj provjeru:**

```kotlin
// MainActivity.kt
import com.google.android.play.core.integrity.IntegrityManager
import com.google.android.play.core.integrity.IntegrityManagerFactory

class MainActivity : AppCompatActivity() {
    private lateinit var integrityManager: IntegrityManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        integrityManager = IntegrityManagerFactory.create(this)
        
        checkAppIntegrity()
    }
    
    private fun checkAppIntegrity() {
        // Request integrity token
        val integrityTokenResponse = integrityManager
            .requestIntegrityToken(
                IntegrityTokenRequest.builder()
                    .setCloudProjectNumber(YOUR_CLOUD_PROJECT_NUMBER)
                    .build()
            )
            
        integrityTokenResponse.addOnSuccessListener { response ->
            val token = response.token()
            // Verify token na backend-u
        }
    }
}
```

---

### 🚫 **Anti-tamper provjere**

#### **Što TREBAŠ NAPRAVITI:**

**a) Detekcija root/jailbreak:**

```typescript
// Capacitor plugin
import { Device } from '@capacitor/device';

async function checkDeviceSecurity() {
  const info = await Device.getInfo();
  
  if (info.isRooted || info.isJailbroken) {
    alert('Aplikacija ne može raditi na root/jailbreak uređajima.');
    return false;
  }
  
  return true;
}
```

**b) Provjera package signature:**

```kotlin
// Android
fun verifySignature(context: Context): Boolean {
    val packageInfo = context.packageManager.getPackageInfo(
        context.packageName,
        PackageManager.GET_SIGNATURES
    )
    
    val signature = packageInfo.signatures[0].toCharsString()
    val expectedSignature = "YOUR_RELEASE_SIGNATURE_HASH"
    
    return signature == expectedSignature
}
```

---

## 4. Praćenje kopija i reakcija

### 🔍 **Praćenje**

#### **Što TREBAŠ RADITI:**

**a) Povremeno pretraživanje Google Play:**
- Pretraži: "pool water analysis" "bazen analiza vode" "aquasmart"
- Gledaj screenshotove i opise
- Koristi Google Alerts za automatske notifikacije

**b) Reverse Image Search:**
- Screenshotove aplikacije uploadaj na [images.google.com](https://images.google.com/)
- Provjeri se li netko ukrao tvoje screenshot-e

**c) Code Search (GitHub, GitLab):**
- Pretraži dijelove tvog koda na GitHubu
- Primjer: pretraži jedinstvene stringove iz aplikacije

**d) App Store Monitoring Tools:**
- [App Annie](https://www.appannie.com/)
- [Sensor Tower](https://sensortower.com/)
- [Mobile Action](https://www.mobileaction.co/)

---

### ⚖️ **Reakcija na kršenje**

#### **Što TREBAŠ NAPRAVITI ako nađeš kopiju:**

**a) Dokumentiraj:**
- Screenshot aplikacije
- Link na Google Play
- Datum otkrivanja
- Sličnosti s tvojom aplikacijom

**b) Google Play DMCA/IP prijava:**

1. Idi na [Google Play Console](https://play.google.com/console/)
2. Klikni **Help** → **Contact us** → **Copyright infringement**
3. Popuni **DMCA Takedown Notice**:
   - Tvoji kontakt podaci
   - Link na aplikaciju koja krši prava
   - Dokaz da si vlasnik (screenshot, kod, dokumentacija)
   - Izjava pod zakletvom

**c) Direktni kontakt:**
- Pošalji **Cease and Desist** email developeru
- Template:
```
Subject: Copyright Infringement Notice - AquaSmart Pro

Dear [Developer Name],

I am the owner of AquaSmart Pro (https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME), 
registered under copyright © 2024 [YOUR NAME/COMPANY].

It has come to my attention that your application [APP NAME] (https://play.google.com/...) 
infringes on my intellectual property rights, including but not limited to:
- Identical UI/UX design
- Copied functionality and algorithms
- Similar branding and naming

I hereby request that you:
1. Immediately remove the infringing application from all app stores
2. Cease all development and distribution
3. Provide written confirmation within 7 days

Failure to comply will result in legal action and DMCA takedown notices to Google Play.

Sincerely,
[YOUR NAME]
[YOUR EMAIL]
[YOUR PHONE]
```

**d) Odvjetnik:**
- Ako je šteta velika, uključi odvjetnika za IP
- Može tražiti naknadu štete
- Troškovi: obično 3000-10000 kn

---

## 5. Tim i suradnici

### 📝 **Ugovori**

#### **Što TREBAŠ IMATI:**

**a) IP Assignment Agreement (Prijenos autorskih prava):**

```
UGOVOR O PRIJENOSU AUTORSKIH PRAVA

Ugovorene strane:
1. NARUČITELJ: [TVOJE IME/TVRTKA], OIB: [...]
2. IZVRŠITELJ: [IME DEVELOPERA/AGENCIJE], OIB: [...]

Članak 1: Predmet ugovora
Izvršitelj se obvezuje razviti softversku aplikaciju "AquaSmart Pro" prema specifikacijama.

Članak 2: Autorska prava
Izvršitelj prenosi sva autorska i imovinsko prava na Naručitelja, uključujući:
- Izvorni kod
- Dizajn i grafički elementi
- Dokumentacija
- Baze podataka

Članak 3: Tajnost
Izvršitelj se obvezuje čuvati tajnost poslovnih informacija i koda.

Članak 4: Odricanje
Izvršitelj se odriče svih prava na dalju uporabu, distribuciju ili prodaju koda.

Članak 5: Jamstvo
Izvršitelj jamči da kod ne krši prava trećih strana.

Mjesto i datum: _______________

Potpis Naručitelja: _______________
Potpis Izvršitelja: _______________
```

**b) Non-Disclosure Agreement (NDA):**

```
UGOVOR O POVJERLJIVOSTI (NDA)

[TVOJE IME/TVRTKA] i [IME SURADNIKA] se dogovaraju:

1. POVJERLJIVE INFORMACIJE uključuju:
   - Poslovne planove i strategije
   - Softverski kod i algoritmi
   - Korisničke baze i podatke
   - Tehničku dokumentaciju

2. ZABRANA OTKRIVANJA:
   Primatelj se obvezuje ne otkrivati povjerljive informacije trećim stranama.

3. TRAJANJE: 
   Ovaj ugovor vrijedi 5 godina od datuma potpisivanja.

4. KAZNE:
   Kršenje ugovora rezultira naknadom štete u iznosu od [IZNOS] kn.

Potpisi: _______________
```

**c) Work for Hire Agreement:**
- Jasno navedi da je sav rad "work for hire"
- Sve što developer napravi pripada tebi

---

## Što je već implementirano ✅

### **Pravna zaštita:**
- ✅ **Terms of Use** stranica (`/terms-of-use`)
  - Copyright notice
  - Zabrana reverse engineeringa
  - Zabrana neovlaštenog korištenja
  - Pravna zaštita IP-a
  
- ✅ **Privacy Policy** (`/privacy-policy`)
  - GDPR usklađena
  - Prava korisnika (GDPR čl. 15-21)
  - Transparentno objašnjenje spremanja podataka
  - Kontakt za DPO i AZOP

- ✅ **Copyright Footer**
  - Prikazan u `/app/more` (profesionalci)
  - Prikazan u `/owner` (vlasnici bazena)
  - Linkovi ka Terms i Privacy

- ✅ **Rute**
  - `/terms-of-use` - javno dostupno
  - `/privacy-policy` - javno dostupno
  - `/app/terms-of-use` - za profesionalce
  - `/app/privacy-policy` - za profesionalce

### **Tehnička priprema:**
- ✅ Čist, organiziran kod
- ✅ Nema hardcoded API ključeva
- ✅ LocalStorage za sigurno lokalno spremanje
- ✅ Spremno za Supabase backend integraciju

---

## Sljedeći koraci 📋

### **PRIJE Google Play Objave:**

**1. Ažuriraj podatke u aplikaciji** (30 min):
- [ ] Zamijeni `[IME VLASNIKA/TVRTKE]` sa stvarnim imenom
- [ ] Zamijeni `[VAŠA EMAIL ADRESA]` sa stvarnim emailom
- [ ] Dodaj podatke o tvrtki (OIB, adresa, telefon)

**2. Pravne dokumente** (1-2 dana):
- [ ] Provjeri Terms & Privacy s odvjetnikom
- [ ] Registriraj autorska prava (DZIV) - opcionalno
- [ ] Registriraj žig "AquaSmart Pro" (DZIV) - preporučeno

**3. Android Build** (2-3 dana):
- [ ] Odluči: Capacitor, React Native ili PWA
- [ ] Setup build environmenta
- [ ] Dodaj ProGuard obfuscation
- [ ] Dodaj Play Integrity API
- [ ] Test na pravom Android uređaju

**4. Google Play Setup** (1 dan):
- [ ] Kreiraj Google Play Developer account (25 USD jednokratno)
- [ ] Popuni Store Listing:
  - Opis aplikacije
  - Screenshots
  - Privacy Policy URL (link na `/privacy-policy`)
  - Terms of Use URL (link na `/terms-of-use`)
- [ ] Aktiviraj Play App Signing (automatski)

**5. Monitoring** (kontinuirano):
- [ ] Setup Google Alerts za "AquaSmart Pro"
- [ ] Mjesečno pretraživanje Google Play za kopije
- [ ] Pripremi DMCA template

---

## Kontakti i resursi 📞

### **Pravna zaštita:**
- **DZIV** (Žig i autorsko pravo): [www.dziv.hr](https://www.dziv.hr), tel: +385 1 6117 111
- **EUIPO** (EU žig): [euipo.europa.eu](https://euipo.europa.eu)
- **AZOP** (GDPR): [www.azop.hr](https://www.azop.hr), tel: +385 1 4609 000

### **Odvjetnici specijalizirani za IT:**
- **Odvjetnička komora Zagreb**: [www.zkzg.hr](https://www.zkzg.hr)
- **IT odvjetnici**: Pretraži "IT pravo odvjetnik Hrvatska"

### **Android Development:**
- **Capacitor dokumentacija**: [capacitorjs.com](https://capacitorjs.com)
- **Google Play Console**: [play.google.com/console](https://play.google.com/console)
- **Play Integrity API**: [developer.android.com/google/play/integrity](https://developer.android.com/google/play/integrity)

---

## ⚠️ DISCLAIMER

Ove upute pružaju opće smjernice i nisu pravni savjet. 
Za specifična pravna pitanja savjetujem se s odvjetnikom specijaliziranim za intelektualno vlasništvo i IT pravo.

---

**Verzija:** 1.0  
**Datum:** 20. veljače 2025.  
**Autor:** AquaSmart Pro Development Team
