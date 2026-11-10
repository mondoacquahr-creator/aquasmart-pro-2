# 📁 AquaSmart Pro v1.0 - Kompletna Struktura Projekta

## 🗂️ Kako Organizirati Fajlove

Kreirajte folder: **`pool-app-v1/`** i organizirajte ovako:

```
pool-app-v1/
│
├── 📱 APP_SOURCE/                    # Izvorni kod aplikacije
│   ├── src/
│   │   ├── components/              # React komponente
│   │   │   ├── Home.tsx
│   │   │   ├── PoolList.tsx
│   │   │   ├── PoolDetails.tsx
│   │   │   ├── NewPool.tsx
│   │   │   ├── NewAnalysis.tsx
│   │   │   ├── AnalysisHistory.tsx
│   │   │   ├── ClientList.tsx
│   │   │   └── ClientDetails.tsx
│   │   │
│   │   ├── lib/                     # Business logic
│   │   │   ├── waterAnalysis.ts     # Analiza vode engine
│   │   │   ├── products.ts          # Ivero proizvodi
│   │   │   └── storage.ts           # LocalStorage management
│   │   │
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   │
│   │   ├── App.tsx                  # Main app component
│   │   └── routes.ts                # React Router config
│   │
│   ├── public/                      # Public assets
│   │   ├── icons/                   # App icons (kreirajte!)
│   │   │   ├── icon-72x72.png
│   │   │   ├── icon-96x96.png
│   │   │   ├── icon-128x128.png
│   │   │   ├── icon-144x144.png
│   │   │   ├── icon-152x152.png
│   │   │   ├── icon-192x192.png
│   │   │   ├── icon-384x384.png
│   │   │   └── icon-512x512.png
│   │   │
│   │   ├── .well-known/
│   │   │   └── assetlinks.json      # TWA verification
│   │   │
│   │   ├── manifest.json            # PWA manifest
│   │   ├── sw.js                    # Service Worker
│   │   └── offline.html             # Offline page
│   │
│   ├── styles/
│   │   └── globals.css              # Global styles
│   │
│   ├── index.html                   # HTML entry point
│   ├── package.json                 # Dependencies (kreirajte)
│   └── tsconfig.json                # TypeScript config (kreirajte)
│
├── 📄 DOCUMENTATION/                 # Sva dokumentacija
│   ├── DEPLOYMENT_GUIDE.md          # Master deployment guide
│   ├── QUICK_START_CHECKLIST.md     # Brzi start
│   ├── ICONS_GUIDE.md               # Dizajn upute za ikone
│   ├── PLAY_STORE_LISTING.md        # Store listing content
│   ├── PRIVACY_POLICY.md            # Privacy policy
│   └── PROJECT_STRUCTURE.md         # Ovaj fajl
│
├── 🎨 DESIGN_ASSETS/                 # Grafički materijali (VI kreirate)
│   ├── icons/                       # Source icons
│   │   ├── icon-source.png          # Original 1024x1024
│   │   ├── icon-512x512.png
│   │   └── adaptive-icon/
│   │       ├── foreground.png
│   │       └── background.png
│   │
│   ├── screenshots/                 # App screenshots
│   │   ├── phone-1-home.png         # 1080x1920
│   │   ├── phone-2-analysis.png
│   │   ├── phone-3-results.png
│   │   ├── phone-4-pools.png
│   │   └── phone-5-orp.png
│   │
│   ├── feature-graphic.png          # 1024x500
│   └── promo-video.mp4              # Optional
│
├── 🤖 ANDROID_BUILD/                 # Android TWA build
│   ├── twa-manifest.json            # TWA config (generiše Bubblewrap)
│   ├── aquasmart.keystore           # ⚠️ BACKUP KLJUČNO!
│   ├── keystore-info.txt            # Password i alias
│   └── builds/                      # Build output
│       ├── app-release-signed.aab   # Za Play Store
│       └── app-release-signed.apk   # Za testiranje
│
├── 🌐 WEB_HOSTING/                   # Web hosting info
│   ├── vercel.json                  # Vercel config (opciono)
│   ├── netlify.toml                 # Netlify config (opciono)
│   └── deployment-notes.txt         # Deployment credentials
│
└── 📋 README.md                      # Glavni README projekta
```

---

## 📦 Fajlovi za Kopiranje

### Iz trenutnog projekta kopirajte:

**Source Code:**
```
/App.tsx                          → APP_SOURCE/src/
/routes.ts                        → APP_SOURCE/src/
/components/*.tsx                 → APP_SOURCE/src/components/
/lib/*.ts                         → APP_SOURCE/src/lib/
/types/*.ts                       → APP_SOURCE/src/types/
/styles/globals.css               → APP_SOURCE/styles/
/index.html                       → APP_SOURCE/
```

**Public Assets:**
```
/public/manifest.json             → APP_SOURCE/public/
/public/sw.js                     → APP_SOURCE/public/
/public/offline.html              → APP_SOURCE/public/
/public/.well-known/assetlinks.json → APP_SOURCE/public/.well-known/
```

**Documentation:**
```
/DEPLOYMENT_GUIDE.md              → DOCUMENTATION/
/QUICK_START_CHECKLIST.md         → DOCUMENTATION/
/ICONS_GUIDE.md                   → DOCUMENTATION/
/PLAY_STORE_LISTING.md            → DOCUMENTATION/
/PRIVACY_POLICY.md                → DOCUMENTATION/
/PROJECT_STRUCTURE.md             → DOCUMENTATION/
```

---

## 🎯 Što Trebate Kreirati

### 1. Icons (DESIGN_ASSETS/icons/)
```bash
# Koristite Canva ili Icon Kitchen:
- icon-source.png (1024x1024)
- icon-512x512.png
- icon-192x192.png
- icon-144x144.png
- icon-128x128.png
- icon-96x96.png
- icon-72x72.png

# Kopirajte u:
APP_SOURCE/public/icons/
```

### 2. Screenshots (DESIGN_ASSETS/screenshots/)
```bash
# Chrome DevTools → Pixel 5 (1080x1920)
- phone-1-home.png
- phone-2-analysis.png
- phone-3-results.png
- phone-4-pools.png
- phone-5-orp.png
```

### 3. Feature Graphic (DESIGN_ASSETS/)
```bash
# Canva → 1024x500
- feature-graphic.png
```

### 4. Package.json (APP_SOURCE/)
```json
{
  "name": "aquasmart-pro",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router": "^6.20.0",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

### 5. Keystore (ANDROID_BUILD/)
```bash
# Generirajte sa:
keytool -genkey -v -keystore aquasmart.keystore \
  -alias aquasmart -keyalg RSA -keysize 2048 -validity 10000

# BACKUP na više mjesta!
```

---

## 🔐 Backup Prioriteti

### ⚠️ KRITIČNO - NIKAD NE GUBITE:
```
✅ aquasmart.keystore
✅ keystore password (u keystore-info.txt)
✅ SHA-256 fingerprint
✅ Google Play Console credentials
```

### 📁 Preporučeno za backup:
```
✅ Cijeli APP_SOURCE/
✅ DESIGN_ASSETS/ (originalne slike)
✅ DOCUMENTATION/
✅ .env fajlovi (ako postoje)
```

### ☁️ Cloud backup:
```
✅ GitHub private repository
✅ Google Drive
✅ Dropbox
```

---

## 🚀 Deployment Workflow

### Development:
```bash
cd pool-app-v1/APP_SOURCE/
npm install
npm run dev
# → http://localhost:5173
```

### Build za production:
```bash
npm run build
# → dist/ folder
```

### Deploy na Vercel:
```bash
vercel
# ili
vercel --prod
```

### Android build:
```bash
cd pool-app-v1/ANDROID_BUILD/
bubblewrap init --manifest https://aquasmart.pro/manifest.json
bubblewrap build
# → app-release-signed.aab
```

---

## 📊 Version Control

### Git struktur (preporučeno):
```bash
# Kreirajte .gitignore:
node_modules/
dist/
*.keystore
*.log
.env
.env.local
deployment-notes.txt

# Init repository:
git init
git add .
git commit -m "Initial commit - AquaSmart Pro v1.0"

# GitHub:
git remote add origin https://github.com/your-username/aquasmart-pro.git
git push -u origin main
```

---

## 📝 Verzije

### v1.0.0 - Initial Release
```
Features:
✅ Dual user modes (Professional / End User)
✅ Water analysis with ORP intelligence
✅ Ivero product dosing engine
✅ Pool and client management
✅ Analysis history
✅ GPS location support
✅ Offline capability
✅ PWA ready
```

### Planirane verzije:
```
v1.1.0:
- PDF export funkcionalnost
- Trend charts
- Push notifications

v1.2.0:
- Supabase cloud sync
- Multi-user support
- Advanced analytics

v2.0.0:
- Camera integration
- Remote agent support
- AI recommendations
```

---

## 🔗 Važni Linkovi

**Development:**
- Local: http://localhost:5173
- Staging: https://your-project.vercel.app
- Production: https://aquasmart.pro

**Google Play:**
- Console: https://play.google.com/console
- App: https://play.google.com/store/apps/details?id=com.aquasmart.pro

**Tools:**
- Vercel: https://vercel.com/dashboard
- Icon Kitchen: https://icon.kitchen
- Canva: https://canva.com

---

## 💼 Team & Credits

**Development:** [Your Name/Company]
**Design:** [Designer]
**Product Specifications:** Ivero Pool Chemistry
**Platform:** React + TypeScript + Tailwind CSS
**Build Tool:** Vite
**Routing:** React Router v6
**Icons:** Lucide React
**Deployment:** Vercel + Google Play Store

---

## 📞 Support & Contact

**Email:** support@aquasmart.pro
**Website:** https://aquasmart.pro
**Privacy:** https://aquasmart.pro/privacy
**GitHub:** https://github.com/your-username/aquasmart-pro

---

## ✅ Pre-Launch Checklist

```
Development:
[ ] Sav kod commitan na GitHub
[ ] package.json finaliziran
[ ] Build test uspješan (npm run build)
[ ] App testiran lokalno
[ ] Nema console errors

Hosting:
[ ] Deployed na Vercel/Netlify
[ ] Custom domain povezan (opciono)
[ ] HTTPS radi
[ ] manifest.json accessible
[ ] assetlinks.json accessible

Design:
[ ] Svi icons kreirani (72-512px)
[ ] Feature graphic 1024x500
[ ] Screenshots (min 2, 1080x1920)
[ ] Adaptive icons (foreground + background)

Android:
[ ] Keystore kreiran i BACKUP-an
[ ] SHA-256 dodan u assetlinks.json
[ ] TWA build uspješan
[ ] AAB signed
[ ] Test na physical device

Google Play:
[ ] Developer account ($25)
[ ] App kreirana u Console
[ ] Store listing popunjen
[ ] Screenshots uploadani
[ ] Privacy policy URL
[ ] Content rating dobijen
[ ] Internal testing OK
[ ] Production submitted

Legal:
[ ] Privacy policy finalizirana
[ ] GDPR compliance
[ ] Terms of service (ako treba)

Marketing:
[ ] Website updated sa Play badge
[ ] Social media objave spremne
[ ] Email kampanja pripremljena
```

---

**VERZIJA:** 1.0.0  
**DATUM:** 11. veljače 2026  
**STATUS:** Production Ready ✅
