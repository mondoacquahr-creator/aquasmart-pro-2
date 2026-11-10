# 📥 KAKO DOWNLOADATI PROJEKT IZ FIGMA MAKE

## 🎯 OPCIJE ZA DOWNLOAD

Imaš **3 načina** da dobiješ kod iz Figma Make editora:

---

## ✅ OPCIJA 1: "Save local copy" (NAJLAKŠE) ⭐

### Koraci:

1. **U Figma Make editoru:**
   - Potraži **Menu** ikonu (☰ tri crte gore lijevo)
   - ILI potraži **Settings** ⚙️ ikonu

2. **Otvori menu i pronađi:**
   - **"Save local copy"** ILI
   - **"Download project"** ILI
   - **"Export"** ILI
   - **"Download ZIP"**

3. **Klikni na opciju:**
   - Download će započeti automatski
   - Downloada se ZIP file (npr. `aquasmart-pro.zip`)

4. **Unzip file:**
   - Windows: Desni klik → Extract All
   - Mac: Dvostruki klik na ZIP
   - Linux: `unzip aquasmart-pro.zip`

5. **✅ Gotovo!**
   - Imaš folder sa svim fileovima
   - Idi u taj folder
   - Pokreni `setup.bat` (Windows) ili `./setup.sh` (Mac/Linux)

---

## ✅ OPCIJA 2: GitHub Sync (Ako Figma Make ima)

### Koraci:

1. **U Figma Make editoru:**
   - Potraži **"Connect to GitHub"** ili **"GitHub Sync"**
   - Obično u: Menu → Integrations → GitHub

2. **Ako nađeš GitHub integraciju:**
   - Klikni **"Connect to GitHub"**
   - Autoriziraj Figma Make na GitHub
   - Odaberi: **"Create new repository"**
   - Naziv: `aquasmart-pro`
   - Private: ✅
   - Klikni: **"Push to GitHub"**

3. **✅ Gotovo!**
   - Kod automatski pushat na GitHub
   - Preskoči "Git push" korake
   - Idi direktno na Vercel deployment!

---

## ✅ OPCIJA 3: Ručno Copy-Paste (Ako nema download opcije)

### Koraci:

1. **Napravi novi folder:**
   ```bash
   mkdir AquaSmart-Pro
   cd AquaSmart-Pro
   ```

2. **Kreiraj strukturu:**
   ```
   AquaSmart-Pro/
   ├── components/
   ├── lib/
   ├── contexts/
   ├── src/
   ├── styles/
   ├── types/
   └── public/
   ```

3. **Kopiraj SVE fileove iz Figma Make:**
   - Otvori svaki file u editoru
   - Kopiraj sadržaj (Ctrl+A → Ctrl+C)
   - Kreiraj isti file lokalno
   - Zalijepi sadržaj (Ctrl+V)
   - Spremi file

4. **Pokreni setup skriptu:**
   - Windows: `setup.bat`
   - Mac/Linux: `./setup.sh`

---

## 📋 LISTA FILEOVA ZA KOPIRANJE (Opcija 3)

### Root fileovi:
```
✓ App.tsx
✓ index.html
✓ package.json
✓ vite.config.ts
✓ tsconfig.json
✓ tsconfig.node.json
✓ routes.ts
✓ .gitignore
```

### Folders:

**components/** (50+ fileova)
```
✓ AIRecommendations.tsx
✓ AlertPoolsModal.tsx
✓ AllWorkOrders.tsx
✓ AnalysisDetails.tsx
✓ AnalysisHistory.tsx
... (scroll do kraja za kompletnu listu)
```

**components/ui/** (40+ UI komponenti)
```
✓ button.tsx
✓ card.tsx
✓ dialog.tsx
✓ input.tsx
... (sve shadcn/ui komponente)
```

**lib/** (utility fileovi)
```
✓ analytics.ts
✓ auth.ts
✓ dosing-engine.ts
✓ parameterStatus.ts
✓ pdfExport.ts
✓ productPrices.ts
✓ products.ts
✓ storage.ts
✓ stores-data.ts
✓ warehouseStorage.ts
✓ waterAnalysis.ts
✓ workOrderStorage.ts
```

**contexts/**
```
✓ AuthContext.tsx
```

**src/**
```
✓ main.tsx
```

**styles/**
```
✓ globals.css
```

**types/**
```
✓ index.ts
```

**public/**
```
✓ manifest.json
✓ sw.js
✓ offline.html
✓ assetlinks.json
```

---

## 🔍 KAKO PROVJERITI JE LI SVE DOWNLOADANO?

### Brza provjera:

```bash
# 1. Navigiraj u folder
cd AquaSmart-Pro

# 2. Provjeri broj fileova
# Windows (PowerShell):
(Get-ChildItem -Recurse -File).Count

# Mac/Linux:
find . -type f | wc -l

# Trebalo bi biti ~100+ fileova
```

### Detaljnija provjera:

```bash
# Provjeri package.json
cat package.json

# Trebao bi vidjeti:
# "name": "aquasmart-pro",
# "version": "1.0.0",
# ...

# Provjeri postoje li folderi
ls -la

# Trebao bi vidjeti:
# components/
# lib/
# src/
# styles/
# ...
```

---

## ⚠️ ČESTE GREŠKE

### 1. "package.json ne postoji"

**Problem:** Nisi u pravom folderu ili nisi ga kopirao

**Rješenje:**
- Navigiraj u folder gdje si unzipao projekt
- Provjeri postoji li `package.json` file
- Ako ne postoji, downloadaj/kopiraj ponovno

---

### 2. "npm install fails"

**Problem:** Struktura foldera nije točna

**Rješenje:**
- Provjeri da `package.json` postoji u root folderu
- Provjeri da **NISI** u podfolderu
- Provjeri da structure matchira gore navedenu

---

### 3. "Build errors"

**Problem:** Nisu svi fileovi kopirani

**Rješenje:**
- Scroll kroz error log
- Vidi koji file nedostaje
- Kopiraj taj file iz Figma Make
- Pokušaj build ponovno: `npm run build`

---

## 🎯 BRZI CHECKLIST

```
☐ Downloadao/unzipao projekt
☐ Navigirao u root folder (gdje je package.json)
☐ Provjeren broj fileova (~100+)
☐ Postoji package.json
☐ Postoje folderi: components/, lib/, src/, styles/
☐ Spreman za setup skriptu!
```

---

## 📞 POMOĆ

Ako nemaš download opciju u Figma Make:

1. **Provjeri menu opcije:**
   - ☰ Menu
   - ⚙️ Settings
   - ... More options

2. **Provjeri dokumentaciju:**
   - Figma Make Help
   - FAQ
   - Support

3. **Kontaktiraj Figma Make support:**
   - Email: support@figma.com
   - Pitaj: "How to download/export my project?"

---

## ✅ NAKON DOWNLOADA

**Pokreni setup skriptu:**

**Windows:**
```cmd
cd C:\path\to\AquaSmart-Pro
setup.bat
```

**Mac/Linux:**
```bash
cd ~/path/to/AquaSmart-Pro
chmod +x setup.sh
./setup.sh
```

**Skripta će:**
1. ✅ Instalirati npm pakete
2. ✅ Testirati build
3. ✅ Inicijalizirati Git
4. ✅ Kreirati prvi commit
5. ✅ Pushati na GitHub
6. ✅ Dati upute za Vercel deployment

---

**SRETNO! 🚀**

*Nakon downloada, nastavi sa: `DEPLOYMENT_PACKAGE_README.md`*
