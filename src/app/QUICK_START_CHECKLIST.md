# ⚡ QUICK START - Koraci koje MORATE napraviti

## 🎯 FAZA 1: HOSTING (Dan 1)

### ☐ Korak 1.1: Odaberite hosting
```bash
# Preporuka: Vercel (besplatno, najlakše)
# Alternativa: Netlify, Firebase Hosting
```

**Akcija:**
1. Idite na https://vercel.com
2. Sign up sa GitHub accountom
3. Import ovaj projekt
4. Deploy!

**Rezultat:** App dostupan na `https://vas-projekt.vercel.app`

---

### ☐ Korak 1.2: Custom domena (opciono ali preporučeno)
```bash
# Kupite domenu ako nemate
# Preporuka: Namecheap, GoDaddy, ili CloudFlare
```

**Akcija:**
1. Kupite domenu (npr. `aquasmart.pro`)
2. U Vercel: Settings → Domains → Add domain
3. Slijedite DNS upute
4. Pričekajte 5-10 min

**Rezultat:** App dostupan na `https://aquasmart.pro`

---

## 🎨 FAZA 2: GRAFIČKI MATERIJALI (Dan 2-3)

### ☐ Korak 2.1: Kreirajte App Icon

**Potrebno:**
- 512x512 PNG sa logotipom
- Transparentna pozadina
- High resolution

**Opcija A - Jednostavno (preporučeno):**
```
1. Idite na https://www.canva.com
2. Odaberite "App Icon" template
3. Koristite:
   - Ikona: 💧 kap vode
   - Tekst: "AS" ili "AquaSmart"
   - Boje: Blue (#0891B2) to Cyan (#06B6D4) gradient
4. Export kao PNG 512x512
```

**Opcija B - Profesionalno:**
```
1. Hire designer na Fiverr (€10-30)
2. Ili koristite Figma za custom design
```

---

### ☐ Korak 2.2: Generirajte sve veličine

**Online tool (najlakše):**
```
1. Idite na https://realfavicongenerator.net/
2. Upload vaš 512x512 icon
3. Generate
4. Download zip
5. Extract u /public/icons/
```

**Potrebne veličine:**
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

---

### ☐ Korak 2.3: Feature Graphic

**Veličina:** 1024 x 500 pixels

**Kako:**
```
1. Canva → Custom size → 1024x500
2. Dodajte:
   - Pozadina: Blue-Cyan gradient
   - App icon lijevo
   - Tekst: "AquaSmart Pro"
   - Subtitle: "Pool Water Analyzer"
3. Export kao PNG
4. Save as feature-graphic.png
```

---

### ☐ Korak 2.4: Screenshot-i

**Potrebno:** Minimum 2, preporučeno 5

**Kako snimiti:**
```bash
# U Chrome browseru:
1. Otvorite https://aquasmart.pro
2. F12 (Dev Tools)
3. Ctrl+Shift+M (Device toolbar)
4. Odaberite "Pixel 5" (1080x1920)
5. Navigate kroz app i screenshot-ajte:
   - Home screen
   - Water Analysis
   - Results sa preporukama
   - Pool List
   - ORP insights screen
```

**Optional - Dodajte phone frame:**
```
1. Idite na https://mockuphone.com
2. Upload screenshot
3. Select Android phone frame
4. Download
```

**Save kao:**
```
/play-store-assets/screenshots/
├── phone-1.png (Home)
├── phone-2.png (Analysis Input)
├── phone-3.png (Results)
├── phone-4.png (Pool List)
└── phone-5.png (ORP Insights)
```

---

## 🤖 FAZA 3: ANDROID BUILD (Dan 4)

### ☐ Korak 3.1: Install Android Studio

**Download:**
```
https://developer.android.com/studio
```

**Instalacija:**
- Instalirajte sa default opcijama
- Pričekajte da završi setup (~30 min)
- Ne trebate otvarati projekt, samo instalirati

---

### ☐ Korak 3.2: Install Bubblewrap

```bash
# U terminalu (Command Prompt na Windows):
npm install -g @bubblewrap/cli
```

**Provjerite:**
```bash
bubblewrap --version
# Trebate vidjeti: @bubblewrap/cli 1.x.x
```

---

### ☐ Korak 3.3: Inicijalizacija TWA

```bash
# U root folderu projekta:
bubblewrap init --manifest https://aquasmart.pro/manifest.json

# Odgovorite:
Host: aquasmart.pro
Name: AquaSmart Pro
Package: com.aquasmart.pro
Icon: /public/icons/icon-512x512.png
Theme color: #0891B2
```

**Rezultat:** Kreiran folder `twa-project/`

---

### ☐ Korak 3.4: Kreiraj Keystore

```bash
keytool -genkey -v -keystore aquasmart.keystore \
  -alias aquasmart -keyalg RSA -keysize 2048 -validity 10000

# VAŽNO: Unesite informacije i SPREMITE PASSWORD!
```

**Pitanja:**
```
Password: [izmislite jak password]
First name: AquaSmart Pro
Organization: [Vaša firma]
City: Zagreb
State: Croatia
Country: HR
```

**⚠️ KRITIČNO:**
```
SPREMITE:
- aquasmart.keystore file (backup!)
- Password (sigurno mjesto!)
Bez ovoga ne možete update-ati app!
```

---

### ☐ Korak 3.5: Extract SHA-256

```bash
keytool -list -v -keystore aquasmart.keystore -alias aquasmart

# Kopirajte SHA256 liniju (ovako izgleda):
# AB:CD:EF:12:34:56:...
```

**Update assetlinks.json:**
```json
// U /public/.well-known/assetlinks.json
// Zamijenite PLACEHOLDER sa vašim SHA256
"sha256_cert_fingerprints": [
  "AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:..."
]
```

**Upload na hosting:**
```bash
# Deploy update
vercel --prod
# ili
netlify deploy --prod
```

**Provjerite:**
```
https://aquasmart.pro/.well-known/assetlinks.json
```
Mora biti dostupan!

---

### ☐ Korak 3.6: Build APK/AAB

```bash
# U twa-project/ folderu:
bubblewrap build

# Rezultat:
# ✅ app-release-signed.apk (za testiranje)
# ✅ app-release-signed.aab (za Play Store)
```

---

## 📱 FAZA 4: GOOGLE PLAY CONSOLE (Dan 5)

### ☐ Korak 4.1: Kreiraj Developer Account

**URL:** https://play.google.com/console

**Akcija:**
1. Sign in sa Google accountom
2. Pay $25 (one-time fee)
3. Ispuni developer podatke
4. Prihvati terms

**Rezultat:** Developer account aktivan

---

### ☐ Korak 4.2: Kreiraj Novu App

**U Play Console:**
```
1. Click "Create app"
2. App name: AquaSmart Pro
3. Language: Croatian
4. Type: App
5. Free: YES
6. Declarations: Check sve
7. Create
```

---

### ☐ Korak 4.3: Store Listing

**Kopiraj sadržaj iz `/PLAY_STORE_LISTING.md`**

```
Store Listing → Main store listing:

Short description: [Copy odavde]
Full description: [Copy odavde]

Graphics:
- App icon: Upload icon-512x512.png
- Feature graphic: Upload feature-graphic.png
- Screenshots: Upload 2-5 PNG files

Contact:
- Email: vas@email.com
- Website: https://aquasmart.pro
- Privacy policy: https://aquasmart.pro/privacy
```

**Save draft**

---

### ☐ Korak 4.4: Content Rating

```
Store presence → Content rating → Start:

Category: Utility/Productivity

Questions (sve NO osim):
- Share location: YES (optional za GPS)

Get rating → Apply
```

**Rezultat:** PEGI 3 / Everyone

---

### ☐ Korak 4.5: App Content

```
Policy → App content:

Privacy policy: https://aquasmart.pro/privacy
Ads: NO
Target audience: 18+
Data safety: Fill form (Location optional, No sharing)
```

---

### ☐ Korak 4.6: Upload AAB (Internal Testing)

```
Testing → Internal testing → Create release:

1. Upload: app-release-signed.aab
2. Release notes: "v1.0.0 - Initial release"
3. Save
4. Add testers: [vaš email + 2-3 prijatelja]
5. Start rollout
```

**Testirajte 2-3 dana!**

---

### ☐ Korak 4.7: Production Release

**Nakon uspješnog testiranja:**

```
Production → Create release:

1. Upload: isti AAB file
2. Release notes: [Copy from PLAY_STORE_LISTING.md]
3. Countries: Croatia (+ ostale)
4. Review → Submit for review
```

**Pričekajte 1-7 dana za Google review**

---

## ✅ FINAL CHECKLIST

```
Pre-submission:
[ ] Web app na HTTPS (https://aquasmart.pro)
[ ] manifest.json dostupan
[ ] assetlinks.json sa SHA-256
[ ] Icons sve veličine
[ ] Feature graphic 1024x500
[ ] Screenshots (min 2)
[ ] Privacy policy na web-u
[ ] Keystore safely backed up
[ ] AAB built successfully
[ ] Internal testing completed
[ ] All Play Console sections green
[ ] Ready for production!
```

---

## 📧 ŠTO AKO IMAM PROBLEMA?

### Android Build Issues:
```bash
# Clean build:
cd twa-project
./gradlew clean
bubblewrap build
```

### Digital Asset Links Error:
```
1. Check assetlinks.json dostupan
2. Check SHA-256 je točan
3. Wait 10 minutes
4. Test: https://digitalassetlinks.googleapis.com/...
```

### Play Console Rejection:
```
- Check emails od Google
- Čitajte rejection reason
- Fix issue
- Re-submit
```

---

## 🎯 TIMELINE

```
Dan 1: Hosting setup + deploy
Dan 2-3: Grafika (icons, screenshots)
Dan 4: Android build
Dan 5: Play Console setup + internal testing
Dan 6-8: Internal testing
Dan 9: Production submit
Dan 10-16: Google review (1-7 dana)
Dan 17: LIVE! 🎉
```

---

## 🚀 NAKON OBJAVE

```
[ ] Objava na social media
[ ] Email klijentima
[ ] Update website sa Play Store badge
[ ] Monitor reviews
[ ] Monitor crashes (trebalo bi biti 0)
[ ] Plan za update v1.1
```

---

**SRETNO! Vi to možete! 💪**

_Ako zaglibite negdje, vrati se na `/DEPLOYMENT_GUIDE.md` za detaljnije upute._
