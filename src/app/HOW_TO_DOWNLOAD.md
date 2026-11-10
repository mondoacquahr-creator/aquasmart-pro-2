# 📥 Kako Downloadati Projekt - Detaljne Upute

## 🎯 NAČIN 1: Figma Make Interface Download

### Potrazi za:

#### A) File Menu (Toolbar):
```
Gore lijevo → File → Download / Export Project
```

#### B) Hamburger Menu (☰):
```
☰ (hamburger ikona) → Download Project
```

#### C) File Explorer (Lijevo):
```
Desni klik na root folder → Export / Download
```

#### D) Share Menu:
```
Share button → Download ZIP
```

---

## 🎯 NAČIN 2: Ako Nemaš Download Opciju

### Koristi Figma Make GitHub Integration:

1. **Push to GitHub:**
   - Settings → GitHub Integration
   - Connect repo
   - Push code

2. **Clone sa GitHub:**
   ```bash
   git clone <your-repo>
   cd aquasmart-pro
   npm install
   npm run dev
   ```

---

## 🎯 NAČIN 3: Manual Copy-Paste

Ako stvarno nemaš download opciju, evo **STEP-BY-STEP**:

### 1. Kreiraj Local Folder:

```bash
mkdir aquasmart-pro
cd aquasmart-pro
```

### 2. Kopiraj Config Fajlove:

Otvori svaki fajl u Figma Make i copy-paste u local:

**Root level:**
- ✅ `package.json` → Copy content → Paste u local fajl
- ✅ `vite.config.ts` → Copy → Paste
- ✅ `tsconfig.json` → Copy → Paste
- ✅ `tsconfig.node.json` → Copy → Paste
- ✅ `index.html` → Copy → Paste
- ✅ `README.md` → Copy → Paste

### 3. Kreiraj Folder Strukturu:

```bash
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/styles
mkdir -p public
```

### 4. Kopiraj Source Fajlove:

**src/ fajlovi:**
- ✅ `src/main.tsx`
- ✅ `src/App.tsx`
- ✅ `src/routes.ts`

**src/components/ fajlovi:**
- ✅ `src/components/HomeModern.tsx`
- ✅ `src/components/PoolListModern.tsx`
- ✅ `src/components/NewAnalysis.tsx`
- ✅ `src/components/PoolDetails.tsx`
- ✅ `src/components/NewPool.tsx`
- ✅ `src/components/ClientList.tsx`
- ✅ `src/components/ClientDetails.tsx`
- ✅ `src/components/AnalysisHistory.tsx`

**src/lib/ fajlovi:**
- ✅ `src/lib/storage.ts`
- ✅ `src/lib/dosing-engine.ts`

**src/types/ fajlovi:**
- ✅ `src/types/index.ts`

**src/styles/ fajlovi:**
- ✅ `src/styles/globals.css`

**public/ fajlovi:**
- ✅ `public/manifest.json`
- ✅ `public/service-worker.js`

### 5. Dodaj Ikone:

**Kreiraj placeholder ikone ili generiraj prave:**

```bash
# Download placeholder:
curl https://via.placeholder.com/192x192/0EA5E9/FFFFFF?text=AS -o public/icon-192.png
curl https://via.placeholder.com/512x512/0EA5E9/FFFFFF?text=AS -o public/icon-512.png
```

### 6. Install Dependencies:

```bash
npm install
```

### 7. Run:

```bash
npm run dev
```

---

## 🎯 NAČIN 4: Koristim Automatic Script

Kreirao sam `CREATE_PROJECT.sh` script koji automatski:
1. Kreira folder strukturu
2. Kreira sve config fajlove
3. Pokazuje što još treba

**Run:**
```bash
chmod +x CREATE_PROJECT.sh
./CREATE_PROJECT.sh
```

Zatim samo kopiraj source code fajlove!

---

## 📊 Provjera - Trebaju Ti Ovi Fajlovi:

### Minimalno za Run:

```
✅ package.json
✅ vite.config.ts
✅ tsconfig.json
✅ index.html
✅ src/main.tsx
✅ src/App.tsx
✅ src/routes.ts
✅ src/styles/globals.css
✅ Sve komponente
✅ src/lib/storage.ts
✅ src/lib/dosing-engine.ts
✅ src/types/index.ts
```

### Za PWA (Opciono):

```
✅ public/manifest.json
✅ public/service-worker.js
⚠️ public/icon-192.png
⚠️ public/icon-512.png
```

---

## 🐛 Troubleshooting:

### "Cannot find package.json":
```bash
# Provjeri da si u pravom folderu:
ls -la
# Trebao bi vidjeti package.json
```

### "Module not found":
```bash
# Install dependencies:
npm install
```

### "Port in use":
```bash
# Koristi drugi port:
npm run dev -- --port 3000
```

---

## ✅ Success Checklist:

```
[ ] Projekt folder kreiran
[ ] package.json prisutan
[ ] npm install završio uspješno
[ ] node_modules/ folder kreiran
[ ] src/ folder sa svim fajlovima
[ ] npm run dev radi
[ ] Browser otvara http://localhost:5173
[ ] Vidiš dark landing page
```

---

## 🚀 Kada Sve Radi:

### Test Lokalno:
```bash
npm run dev
# Otvori http://localhost:5173
```

### Test na Mobitelu:
```bash
npm run dev -- --host
# Otvori http://192.168.1.X:5173 na mobitelu
```

### Deploy:
```bash
npm install -g vercel
vercel
# Share link!
```

---

## 💡 Pro Tip:

Najbrži način:
1. **Traži Download button u Figma Make**
2. Ako nema → **GitHub integration**
3. Ako ni to → **Manual copy-paste** (20 min)

**Koji način koristiš?** Javi pa mogu pomoći dalje! 🚀
