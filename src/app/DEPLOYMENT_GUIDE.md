# 🚀 AquaSmart Pro - Deployment Guide za Google Play Store

## 📋 PREGLED

Ova aplikacija je web app koja će biti pakirana kao Android app koristeći **Trusted Web Activity (TWA)**. Svi potrebni PWA fajlovi su kreirani i spremni.

---

## ✅ FAZA 1: PRIPREMA (Vi trebate napraviti)

### 1.1 Hosting Web Aplikacije

**Potrebno vam je:**
- Domena (npr. `aquasmart.pro` ili `aquasmart-app.com`)
- Web hosting sa SSL certifikatom (HTTPS obavezan!)

**Preporučeni hosting provideri:**
- **Vercel** (besplatan, odličan za React): https://vercel.com
- **Netlify** (besplatan tier): https://netlify.com
- **Firebase Hosting**: https://firebase.google.com
- **Render**: https://render.com

**Koraci:**

1. **Build aplikacije:**
```bash
npm run build
```

2. **Upload na hosting:**

**Opcija A - Vercel (najlakše):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

**Opcija B - Netlify:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Production deploy
netlify deploy --prod
```

3. **Provjerite da radi:**
- Otvorite vašu domenu (npr. https://aquasmart.pro)
- Aplikacija mora raditi preko HTTPS-a
- Provjerite da je manifest.json dostupan: https://aquasmart.pro/manifest.json

---

### 1.2 Kreiranje Ikona

**Potrebne veličine:**

```
/public/icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
└── icon-512x512.png
```

**Dodatno za Play Store:**
```
/play-store-assets/
├── icon-512x512.png          # App icon
├── feature-graphic-1024x500.png  # Feature graphic
├── screenshots/
│   ├── phone-1.png (1080x1920)
│   ├── phone-2.png (1080x1920)
│   ├── phone-3.png (1080x1920)
│   ├── phone-4.png (1080x1920)
│   └── phone-5.png (1080x1920)
└── promo-video.mp4 (optional)
```

**Kako kreirati ikone:**

**Opcija A - Online Tool (najbrže):**
1. Idite na https://realfavicongenerator.net/
2. Upload vašu base sliku (min 512x512)
3. Generirajte sve veličine
4. Download i stavite u `/public/icons/`

**Opcija B - Photoshop/Figma:**
1. Kreirajte 512x512 sliku sa logotipom
2. Export u sve potrebne veličine
3. Koristite adaptive icon format:
   - Foreground layer (glavni logo)
   - Background layer (pozadinska boja)

**Design preporuke:**
- Logo: Kap vode + AquaSmart tekst
- Boje: Blue (#0891B2) to Cyan (#06B6D4) gradient
- Minimalistički dizajn
- Čitljivo na malim veličinama

---

### 1.3 Screenshot-i

**Potrebno: Minimum 2, preporučeno 5-8**

**Kako napraviti:**

1. **Otvorite app u Chrome DevTools**
```
- Chrome -> F12
- Toggle device toolbar (Ctrl+Shift+M)
- Odaberite "Pixel 5" ili "Galaxy S20"
- Resolution: 1080 x 1920
```

2. **Capture ekrane:**
```
Home screen → Screenshot 1
Water Analysis input → Screenshot 2
Analysis Results → Screenshot 3
Pool List → Screenshot 4
ORP Insights → Screenshot 5
Client Management → Screenshot 6 (Professional mode)
```

3. **Uređivanje (opciono):**
- Dodajte mockup frame (Android phone frame)
- Tool: https://mockuphone.com/
- Export kao PNG

---

## ✅ FAZA 2: ANDROID STUDIO SETUP

### 2.1 Instalacija Alata

**Potrebno instalirati:**

1. **Android Studio:**
   - Download: https://developer.android.com/studio
   - Instalirajte sa svim default opcijama
   - Otvorite i pričekajte da završi setup

2. **Java Development Kit (JDK):**
   - Android Studio već uključuje JDK
   - Ako ne, download JDK 11: https://adoptium.net/

---

### 2.2 Kreiranje TWA Projekta

**Koraci:**

1. **Download Bubblewrap (TWA tool):**
```bash
npm i -g @bubblewrap/cli
```

2. **Inicijalizacija projekta:**
```bash
# U root folderu vašeg projekta
bubblewrap init --manifest https://vasa-domena.com/manifest.json
```

3. **Odgovorite na pitanja:**
```
Domain: vasa-domena.com
Application name: AquaSmart Pro
Package name: com.aquasmart.pro
Icon path: ./public/icons/icon-512x512.png
Display mode: standalone
Theme color: #0891B2
Background color: #0891B2
Start URL: /
```

4. **Build projekta:**
```bash
bubblewrap build
```

Ovo će kreirati:
- Android project u `./twa-project/`
- `.apk` file za testiranje
- `.aab` file za upload na Play Store

---

### 2.3 Keystore Kreiranje

**Keystore** je sigurnosni ključ za potpisivanje aplikacije.

```bash
# Kreirajte keystore
keytool -genkey -v -keystore aquasmart.keystore -alias aquasmart -keyalg RSA -keysize 2048 -validity 10000

# Pitanja:
Keystore password: [unesite siguran password - SPREMITE GA!]
First and Last Name: AquaSmart Pro
Organizational Unit: Development
Organization: Vaša Firma
City: Zagreb
State: Croatia
Country Code: HR
```

**VAŽNO:**
- ⚠️ **NIKADA ne gubite ovaj keystore!**
- ⚠️ **SPREMITE password na sigurno mjesto!**
- Bez keystore-a ne možete update-ati app

**Gdje spremiti:**
```
/android-keys/
├── aquasmart.keystore
└── keystore-info.txt (password i alias)
```

---

### 2.4 Generiranje SHA-256 Fingerprint

```bash
# Extract SHA-256 iz keystore-a
keytool -list -v -keystore aquasmart.keystore -alias aquasmart

# Kopirajte SHA256 vrijednost (izgleda ovako):
# AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90
```

**Koristite ovaj SHA-256:**
1. Otvorite `/public/.well-known/assetlinks.json`
2. Zamijenite `PLACEHOLDER_SHA256_FINGERPRINT_FROM_YOUR_KEYSTORE`
3. Upload novi `assetlinks.json` na vaš hosting

**Provjerite:**
```
https://vasa-domena.com/.well-known/assetlinks.json
```

Mora biti dostupan!

---

## ✅ FAZA 3: GOOGLE PLAY CONSOLE

### 3.1 Kreiranje Developer Accounta

1. **Idite na:** https://play.google.com/console
2. **Platite $25** (one-time registration fee)
3. **Ispunite podatke:**
   - Developer name: Vaša Firma ili ime
   - Email kontakt
   - Website (opciono, ali preporučeno)

4. **Prihvatite:**
   - Developer Distribution Agreement
   - Google Play Terms of Service

---

### 3.2 Kreiranje Nove Aplikacije

1. **U Play Console:**
   - Click "Create app"

2. **Osnovne informacije:**
```
App name: AquaSmart Pro
Default language: Croatian (Hrvatski)
App or game: App
Free or paid: Free
```

3. **Declarations:**
```
- [ ] This app contains ads: NO
- [x] Comply with Google Play policies: YES
- [x] Comply with US export laws: YES
```

---

### 3.3 Store Listing

**Kopirajte sadržaj iz `/PLAY_STORE_LISTING.md`**

1. **App Details:**
```
Short description: [Copy from PLAY_STORE_LISTING.md]
Full description: [Copy from PLAY_STORE_LISTING.md]
```

2. **Graphics:**
```
App icon: Upload icon-512x512.png
Feature graphic: Upload feature-graphic-1024x500.png
Phone screenshots: Upload minimum 2, max 8
```

3. **Categorization:**
```
Category: Productivity
Tags: pool, water analysis, professional, business
```

4. **Contact Details:**
```
Email: support@aquasmart.pro (ili vaš email)
Phone: +385... (opciono)
Website: https://vasa-domena.com
Privacy policy: https://vasa-domena.com/privacy
```

---

### 3.4 Content Rating

1. **Start questionnaire:**
```
Category: Utility, Productivity, or Resources

Questions:
- Does app depict violence? NO
- Does app contain sexual content? NO
- Does app contain profanity? NO
- Does app simulate gambling? NO
- Does app allow users to interact? NO
- Does app share user location? YES (optional for pool GPS)
- Does app share personal info? NO
```

2. **Get rating:**
```
Expected: PEGI 3 / Everyone
```

---

### 3.5 App Content

1. **Privacy Policy:**
```
URL: https://vasa-domena.com/privacy
```
(Upload `/PRIVACY_POLICY.md` na vaš hosting)

2. **Data Safety:**
```
Data collection:
- Location: YES (optional, for pool GPS)
- Device ID: NO
- Personal info: NO

Data usage:
- App functionality only
- Not shared with third parties
- Data encrypted in transit
- User can request deletion

Data security:
- All data stored locally
- Optional cloud backup (encrypted)
```

3. **Ads:**
```
Contains ads: NO
```

4. **Target Audience:**
```
Primary: Adults (18+)
Secondary: All ages (if appropriate)
```

---

## ✅ FAZA 4: UPLOAD APK/AAB

### 4.1 Internal Testing

**Prvo testirajte interno!**

1. **U Play Console:**
   - Release → Testing → Internal testing
   - Create new release

2. **Upload AAB:**
```
Upload: ./twa-project/app-release-signed.aab
```

3. **Release notes:**
```
Version 1.0.0 - Initial Release
- Water analysis with Ivero products
- Professional and home user modes
- ORP intelligence
- Offline support
```

4. **Add testers:**
   - Create email list
   - Dodajte 5-10 testera
   - Šaljite im test link

5. **Test period:** 1-2 dana

**Što testeri provjeravaju:**
- [ ] App instalira i pokreće
- [ ] Sve funkcije rade
- [ ] Analiza vode izračunava točno
- [ ] GPS radi (ako dozvolite)
- [ ] Offline mode radi
- [ ] Nema crasheva

---

### 4.2 Production Release

**Nakon uspješnog testiranja:**

1. **Create production release:**
   - Release → Production → Create new release

2. **Upload isti AAB:**
```
Upload: ./twa-project/app-release-signed.aab
```

3. **Release notes:**
```
[Copy from PLAY_STORE_LISTING.md - What's New section]
```

4. **Countries/Regions:**
```
Primary: Croatia, Slovenia, Bosnia and Herzegovina, Serbia
Optional: All EU, USA, UK, Australia
```

5. **Pricing:**
```
Free (no in-app purchases in v1)
```

6. **Review summary:**
   - Check all information
   - Ensure all sections complete

7. **Submit for Review:**
   - Click "Send for review"
   - Wait 1-7 days

---

## ✅ FAZA 5: NAKON OBJAVE

### 5.1 Post-Launch Monitoring

**Prvi tjedan provjerite:**
- [ ] Crash reports (0 očekivano)
- [ ] User reviews
- [ ] Install numbers
- [ ] Uninstall rate

**Alati:**
```
Google Play Console → Statistics
Google Play Console → Crashes & ANRs
Google Play Console → User feedback
```

---

### 5.2 Marketing

**Odmah nakon objave:**

1. **Website:**
   - Dodajte Google Play badge
   - Link: https://play.google.com/store/apps/details?id=com.aquasmart.pro

2. **Social media:**
   - Objava o launch-u
   - Screenshot-i
   - Features highlight

3. **Email kampanja:**
   - Postojeći klijenti (profesionalci)
   - Pool shop partneri

4. **SEO:**
   - Keywords: pool water analysis, analiza vode bazen
   - Blog post o app-u

---

### 5.3 Update Proces

**Za buduće update-e:**

1. **Napravite izmjene u web app-u**
2. **Deploy na hosting** (Vercel/Netlify auto-deploy)
3. **Ako trebate update TWA:**
```bash
# Povećajte version u twa-manifest.json
bubblewrap update
bubblewrap build

# Upload novi AAB na Play Console
```

**Versioning:**
```
1.0.0 → Initial release
1.0.1 → Bug fixes
1.1.0 → Minor features
2.0.0 → Major update
```

---

## 📝 CHECKLIST - PRIJE UPLOADA

```
PRE-UPLOAD CHECKLIST:

Web Hosting:
[ ] Aplikacija hostana na domeni sa HTTPS
[ ] manifest.json dostupan
[ ] assetlinks.json dostupan
[ ] Service worker radi
[ ] App radi u browseru

Assets:
[ ] Ikone sve veličine (72-512px)
[ ] Feature graphic (1024x500)
[ ] Screenshot-i (min 2, 1080x1920)
[ ] Privacy policy na web-u

Android:
[ ] Bubblewrap TWA kreiran
[ ] Keystore kreiran i SIGURNO spremljen
[ ] SHA-256 dodan u assetlinks.json
[ ] AAB build uspješan
[ ] Test na physical device

Google Play Console:
[ ] Developer account ($25 plaćeno)
[ ] App kreirana
[ ] Store listing popunjen
[ ] Content rating dobiven
[ ] Privacy policy URL dodan
[ ] Data safety ispunjeno

Testing:
[ ] Internal testing završen
[ ] Testers dali OK
[ ] Nema kritičnih bugova
[ ] Sve funkcije rade

Legal:
[ ] Privacy policy finalizirana
[ ] Terms of service (ako trebaju)
[ ] GDPR compliance check
[ ] Export compliance check
```

---

## 🆘 TROUBLESHOOTING

### Problem: "Digital Asset Links error"

**Rješenje:**
1. Provjerite da je `assetlinks.json` dostupan na:
   ```
   https://vasa-domena.com/.well-known/assetlinks.json
   ```
2. Provjerite SHA-256 fingerprint je točan
3. Wait 5-10 minuta za propagaciju

**Test tool:**
```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://vasa-domena.com&relation=delegate_permission/common.handle_all_urls
```

---

### Problem: "App not installable"

**Rješenje:**
1. Check minimum SDK version:
```xml
<!-- U AndroidManifest.xml -->
<uses-sdk android:minSdkVersion="21" />
```

2. Check permissions:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

---

### Problem: "Signing error"

**Rješenje:**
```bash
# Rebuild sa keystore:
bubblewrap build --skipPwaValidation

# Ili manually sign:
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore aquasmart.keystore \
  app-release-unsigned.apk aquasmart
```

---

### Problem: "App crashes on start"

**Rješenje:**
1. Check console logs:
```bash
adb logcat | grep aquasmart
```

2. Check service worker nije u blokiranju
3. Check manifest.json sintaksa
4. Testirajte u Chrome prvo

---

## 📞 SUPPORT

**Ako imate problema:**

1. **Google Play Help:**
   https://support.google.com/googleplay/android-developer

2. **Bubblewrap Docs:**
   https://github.com/GoogleChromeLabs/bubblewrap

3. **Stack Overflow:**
   Tag: `trusted-web-activity`

4. **Email support:**
   support@aquasmart.pro (zamijeni sa svojim)

---

## 🎉 ZAVRŠNE NAPOMENE

**Čestitamo!** Pratili ste kompletan deployment guide.

**Ključne točke:**
- ✅ Hosting sa HTTPS obavezan
- ✅ Keystore nikada ne gubite
- ✅ SHA-256 mora biti točan u assetlinks.json
- ✅ Testirajte interno prije production-a
- ✅ Pratite crash reports

**Timeline:**
- Hosting setup: 1 dan
- Assets kreiranje: 2-3 dana
- Android build: 1 dan
- Play Console setup: 1 dan
- Internal testing: 2-3 dana
- Google review: 1-7 dana
- **TOTAL: ~2 tjedna**

**Sretno sa launch-om! 🚀**
