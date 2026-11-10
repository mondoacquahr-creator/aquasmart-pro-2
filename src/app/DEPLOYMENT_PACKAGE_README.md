# 📦 AQUASMART PRO - DEPLOYMENT PACKAGE

**Verzija:** 1.0.0  
**Datum:** 20. veljače 2026  
**Autor:** Mondo Acqua d.o.o.

---

## 🎯 SADRŽAJ PAKETA

Ovaj deployment package sadrži:

✅ **Kompletnu AquaSmart Pro aplikaciju** (svi fileovi)  
✅ **Automatsku setup skriptu** (Windows i Mac/Linux)  
✅ **Deployment upute za Vercel**  
✅ **Git konfiguraciju**  
✅ **Environment setup**

---

## ⚡ BRZI START (3 KORAKA)

### KORAK 1: DOWNLOAD PROJEKTA IZ FIGMA MAKE

**OPCIJA A: "Save local copy" (Najlakše)**

1. U Figma Make editoru → **Menu (3 crte gore lijevo)**
2. Klikni → **"Save local copy"** ili **"Download"** ili **"Export"**
3. Downloada se ZIP file sa svim fileovima
4. Unzip u folder (npr. `C:\AquaSmart-Pro` ili `~/AquaSmart-Pro`)
5. ✅ Gotovo - preskoči na KORAK 2!

**OPCIJA B: Ručno kreiranje (Ako nema download opcije)**

```bash
# 1. Napravi folder
mkdir AquaSmart-Pro
cd AquaSmart-Pro

# 2. Kopiraj SVE fileove iz Figma Make u ovaj folder
# (scroll do kraja ovog dokumenta za KOMPLETNU LISTU fileova)
```

---

### KORAK 2: AUTOMATSKI SETUP

**WINDOWS korisnici:**

1. Otvori folder sa projektom
2. Desni klik → **Git Bash Here** (ili Command Prompt)
3. Pokreni:

```cmd
setup.bat
```

4. Slijedi upute na ekranu!

---

**MAC/LINUX korisnici:**

1. Otvori Terminal
2. Navigiraj u folder:

```bash
cd ~/AquaSmart-Pro  # Ili gdje god si spremio
```

3. Daj permisije i pokreni:

```bash
chmod +x setup.sh
./setup.sh
```

4. Slijedi upute na ekranu!

---

### KORAK 3: DEPLOY NA VERCEL

**Automatski (ako setup skripta uspije):**

```bash
# Setup skripta automatski deploya!
# Samo prati upute na ekranu.
```

**Ručno (ako setup skripta ne radi):**

1. **Otvori:** https://vercel.com/new
2. **Import repository:** `aquasmart-pro`
3. **Configure:**
   - Framework: Vite (auto-detect)
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: dist
4. **Klikni:** Deploy
5. **Čekaj 2 min...**
6. ✅ **Gotovo!** Dobivaš production URL

---

## 📁 KOMPLETNA STRUKTURA PROJEKTA

```
aquasmart-pro/
│
├── 📄 App.tsx                          (Main app entry)
├── 📄 index.html                       (HTML template)
├── 📄 package.json                     (Dependencies)
├── 📄 vite.config.ts                   (Vite config)
├── 📄 tsconfig.json                    (TypeScript config)
├── 📄 tsconfig.node.json               (TypeScript Node config)
├── 📄 routes.ts                        (React Router config)
├── 📄 .gitignore                       (Git ignore rules)
│
├── 📁 components/                      (React components)
│   ├── AIRecommendations.tsx
│   ├── AlertPoolsModal.tsx
│   ├── AllWorkOrders.tsx
│   ├── AnalysisDetails.tsx
│   ├── AnalysisHistory.tsx
│   ├── AnalysisNotes.tsx
│   ├── AnalysisNotesForm.tsx
│   ├── AnalyticsDashboard.tsx
│   ├── AquaSmartAvatar.tsx
│   ├── BottomNav.tsx
│   ├── BottomSheet.tsx
│   ├── ClientDetails.tsx
│   ├── ClientImport.tsx
│   ├── ClientList.tsx
│   ├── ContactAgent.tsx
│   ├── DataExport.tsx
│   ├── EditAnalysisNotes.tsx
│   ├── EmployeeManagement.tsx
│   ├── EmployeeSelector.tsx
│   ├── GuestAnalysis.tsx
│   ├── Help.tsx
│   ├── Home.tsx
│   ├── HomeModern.tsx
│   ├── ImageCropTool.tsx
│   ├── IssuesList.tsx
│   ├── Layout.tsx
│   ├── LocationPicker.tsx
│   ├── Login.tsx
│   ├── MondoFooter.tsx
│   ├── More.tsx
│   ├── NearbyStores.tsx
│   ├── NewAnalysis.tsx
│   ├── NewPool.tsx
│   ├── NewWorkOrder.tsx
│   ├── ORPIntelligence.tsx
│   ├── OwnerAnalysis.tsx
│   ├── OwnerChat.tsx
│   ├── OwnerCost.tsx
│   ├── OwnerMode.tsx
│   ├── OwnerVideo.tsx
│   ├── PhotoUpload.tsx
│   ├── PoolAnalysisHistory.tsx
│   ├── PoolDetails.tsx
│   ├── PoolInstructions.tsx
│   ├── PoolList.tsx
│   ├── PoolListModern.tsx
│   ├── PrivacyPolicy.tsx
│   ├── ProductPrices.tsx
│   ├── ProtectedRoute.tsx
│   ├── Register.tsx
│   ├── RoleSelection.tsx
│   ├── RootLayout.tsx
│   ├── ScrollToTop.tsx
│   ├── Settings.tsx
│   ├── StoreLocator.tsx
│   ├── TermsOfUse.tsx
│   ├── VisualTest.tsx
│   ├── Warehouse.tsx
│   ├── WaterConditionPicker.tsx
│   ├── WorkOrderDetails.tsx
│   ├── WorkOrderImport.tsx
│   ├── WorkOrderPrint.tsx
│   ├── WorkOrderPrintView.tsx
│   │
│   ├── 📁 figma/
│   │   └── ImageWithFallback.tsx
│   │
│   └── 📁 ui/                          (shadcn/ui components)
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       ├── tooltip.tsx
│       ├── use-mobile.ts
│       └── utils.ts
│
├── 📁 contexts/
│   └── AuthContext.tsx                 (Authentication context)
│
├── 📁 lib/                             (Utility libraries)
│   ├── analytics.ts
│   ├── auth.ts
│   ├── dosing-engine.ts
│   ├── parameterStatus.ts
│   ├── pdfExport.ts
│   ├── productPrices.ts
│   ├── products.ts
│   ├── storage.ts
│   ├── stores-data.ts
│   ├── warehouseStorage.ts
│   ├── waterAnalysis.ts
│   └── workOrderStorage.ts
│
├── 📁 src/
│   └── main.tsx                        (React entry point)
│
├── 📁 styles/
│   └── globals.css                     (Global styles)
│
├── 📁 types/
│   └── index.ts                        (TypeScript types)
│
└── 📁 public/                          (Static assets)
    ├── manifest.json                   (PWA manifest)
    ├── sw.js                           (Service worker)
    ├── offline.html                    (Offline page)
    └── assetlinks.json                 (Android deep links)
```

---

## 🔧 TEHNIČKI DETALJI

### Stack:

```
Frontend:       React 18.3.1
Router:         React Router 7.1.1
Build Tool:     Vite 6.0.5
Language:       TypeScript 5.7.2
Styling:        Tailwind CSS 4.0.0
Icons:          Lucide React
Animation:      Motion (Framer Motion)
UI Components:  shadcn/ui
```

### Deployment platforme:

```
✅ Vercel (Preporučeno)
✅ Netlify
✅ Cloudflare Pages
✅ GitHub Pages
✅ Azure Static Web Apps
```

---

## 🌐 DEPLOYMENT UPUTE (DETALJNO)

### VERCEL (Preporučeno)

**Prednosti:**
- ✅ Besplatno
- ✅ Automatski SSL
- ✅ Globalni CDN
- ✅ Automatski deploy na git push
- ✅ Custom domene

**Koraci:**

1. **GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/[USERNAME]/aquasmart-pro.git
   git push -u origin main
   ```

2. **Vercel:**
   - Otvori: https://vercel.com/new
   - Import `aquasmart-pro` repository
   - Framework: Vite (auto-detect)
   - Klikni Deploy
   - ✅ Gotovo!

3. **Custom domena (kada aquasmart.hr bude aktivna):**
   - Vercel → Settings → Domains
   - Add: `aquasmart.hr` i `www.aquasmart.hr`
   - Dodaj DNS recordse (Vercel daje upute)
   - Čekaj 24-48h

---

### NETLIFY (Alternativa)

```bash
# 1. Instaliraj Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod
```

---

### CLOUDFLARE PAGES (Alternativa)

1. Otvori: https://dash.cloudflare.com
2. Pages → Create a project
3. Connect to Git → Odaberi `aquasmart-pro`
4. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
5. Deploy

---

## 🔐 ENVIRONMENT VARIABLES

**Za produkciju (kada budeš imao):**

```env
# Supabase (ako budeš koristio)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Analytics (ako budeš dodao)
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X

# API Keys (ako budeš koristio)
VITE_API_KEY=your-api-key
```

**Dodavanje u Vercel:**
- Vercel Dashboard → Project → Settings → Environment Variables
- Dodaj svaku varijablu
- Redeploy

---

## 📱 CUSTOM DOMENA (aquasmart.hr)

### Kada domena bude aktivna:

**1. U Vercel:**
```
Settings → Domains → Add Domain
- aquasmart.hr
- www.aquasmart.hr
```

**2. DNS Settings (u CARNet ili gdje si kupio domenu):**

```
A Record:
Name:  @
Type:  A
Value: 76.76.21.21

CNAME Record:
Name:  www
Type:  CNAME
Value: cname.vercel-dns.com
```

**3. Čekaj 24-48h (DNS propagacija)**

**4. ✅ App na https://aquasmart.hr**

---

## 🔄 BUDUĆE PROMJENE (Workflow)

### Svaka izmjena koda:

```bash
# 1. Uredi kod lokalno
# 2. Testiraj lokalno: npm run dev

# 3. Git commit i push:
git add .
git commit -m "Opis promjene (npr: Dodao novu feature)"
git push

# 4. Vercel AUTOMATSKI deploya novu verziju za 1-2 min!
# 5. ✅ Nova verzija live na productionu!
```

**NE MORAŠ RUČNO NIŠTA! Samo git push!**

---

## ✅ DEPLOYMENT CHECKLIST

```
☐ Downloadao projekt iz Figma Make
☐ Unzip u folder
☐ Pokrenuo setup skriptu (setup.bat ili setup.sh)
☐ Kreiran GitHub repository
☐ Kod pushat na GitHub
☐ Vercel account kreiran
☐ Repository importan u Vercel
☐ Deployment uspješan
☐ Production URL radi
☐ SSL certifikat aktivan (HTTPS)
☐ (Opcionalno) Custom domena dodana
```

---

## 🐛 TROUBLESHOOTING

### "npm install fails"

**Problem:** Node.js nije instaliran ili stara verzija

**Rješenje:**
```bash
# Preuzmi i instaliraj Node.js 18+
https://nodejs.org/

# Provjeri verziju:
node --version  # Treba biti v18.0.0 ili novije
npm --version   # Treba biti 9.0.0 ili novije
```

---

### "Git not found"

**Problem:** Git nije instaliran

**Rješenje:**
```bash
# Windows: Preuzmi Git
https://git-scm.com/download/win

# Mac:
brew install git

# Linux:
sudo apt-get install git  # Debian/Ubuntu
sudo yum install git      # RedHat/CentOS
```

---

### "Vercel build fails"

**Problem:** TypeScript greška ili missing dependency

**Rješenje:**
```bash
# 1. Testiraj lokalno:
npm run build

# 2. Ispravi greške
# 3. Commit i push ponovno
git add .
git commit -m "Fix build errors"
git push
```

---

### "Git push denied"

**Problem:** GitHub traži Personal Access Token

**Rješenje:**
1. Idi na: https://github.com/settings/tokens/new
2. Note: "AquaSmart Deployment"
3. Expiration: No expiration
4. Scopes: ✅ repo (full control)
5. Generate token
6. KOPIRAJ TOKEN (vidjet ćeš ga samo jednom!)
7. Koristi kao password kada git push traži credentials

---

## 📞 PODRŠKA

**Mondo Acqua:**
- Email: info@mondo-acqua.hr
- Tel: +385 95 208 7321
- Web: https://mondo-acqua.hr

**Tehnička dokumentacija:**
- Vercel Docs: https://vercel.com/docs
- GitHub Docs: https://docs.github.com
- Vite Docs: https://vitejs.dev

---

## 📊 TRENUTNI STATUS

```
✅ Aplikacija production-ready
✅ Sve komponente funkcionalne
✅ Responsive design (mobile + desktop)
✅ PWA ready (offline support)
✅ TypeScript tipizacija
✅ Optimizirani buildovi
✅ SEO friendly
✅ Pravna zaštita implementirana
```

---

## 🎯 SLJEDEĆI KORACI (Nakon deploya)

```
☐ Testiraj production deployment
☐ Dodaj custom domenu (aquasmart.hr)
☐ Setup analytics (Google Analytics)
☐ Setup error tracking (Sentry)
☐ Pripremi marketing materijale
☐ Launch! 🚀
```

---

## 📄 LICENCA

**© 2026 Mondo Acqua d.o.o.**  
**Sva prava pridržana.**

**Zaštićeno:**
- ™ AquaSmart Pro (Trademark pending - DZIV)
- 🌐 aquasmart.hr (Domain registration pending - CARNet)
- 📜 Terms of Use & Privacy Policy implementirani

---

**SRETNO SA DEPLOYMENTOM! 🚀**

*Ako imaš bilo kakvih pitanja, javi se!*
