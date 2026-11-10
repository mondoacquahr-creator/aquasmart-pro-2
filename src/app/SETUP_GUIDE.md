# 🚀 Setup Guide - AquaSmart Pro

## 📥 Način 1: Download iz Figma Make

Ako koristiš Figma Make IDE:

### Koraci:

1. **Klikni na File menu** (ikona foldera gore lijevo)
2. **Download Project** ili **Export**
3. **Skineš ZIP fajl**
4. **Unzip folder**
5. **Otvori terminal u folderu:**

```bash
cd aquasmart-pro
npm install
npm run dev
```

**Gotovo!** ✅

---

## 📥 Način 2: Koristi GitHub (ako deployano)

```bash
# Clone repo:
git clone <your-repo-url>
cd aquasmart-pro

# Install:
npm install

# Run:
npm run dev
```

---

## 📥 Način 3: Manual Setup (Copy-Paste)

Ako nemaš download opciju, napravi ovako:

### 1. Kreiraj folder:

```bash
mkdir aquasmart-pro
cd aquasmart-pro
```

### 2. Kopiraj config fajlove:

Svi potrebni fajlovi su sada u projektu:
- ✅ `package.json`
- ✅ `vite.config.ts`
- ✅ `tsconfig.json`
- ✅ `tsconfig.node.json`
- ✅ `index.html`

### 3. Install dependencies:

```bash
npm install
```

### 4. Kopiraj source fajlove:

Trebaju ti fajlovi iz `/src` foldera:
- `main.tsx`
- `App.tsx`
- `routes.ts`
- `styles/globals.css`
- `types/index.ts`
- `lib/storage.ts`
- `lib/dosing-engine.ts`
- Svi iz `components/`

### 5. Run:

```bash
npm run dev
```

---

## 🔧 Ako Dobiješ Greške:

### "Cannot find module":

```bash
npm install
```

### "Port already in use":

```bash
# Kill port 5173:
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9

# Ili koristi drugi port:
npm run dev -- --port 3000
```

### TypeScript errors:

```bash
npm run build
# Fix errors
```

---

## 📱 Deploy Instructions

### Vercel:

```bash
npm install -g vercel
vercel login
vercel
```

### Netlify:

```bash
npm run build
# Upload dist/ folder
```

### GitHub Pages:

```bash
npm run build
# Push dist/ to gh-pages branch
```

---

## ✅ Verify Setup:

```bash
# Development server running:
npm run dev

# Should see:
# ➜  Local:   http://localhost:5173/
# ➜  Network: http://192.168.1.X:5173/
```

Otvori `http://localhost:5173` → Vidiš dark landing page! ✅

---

## 🎯 Next Steps:

1. ✅ **Test lokalno** - `npm run dev`
2. ✅ **Test na mobitelu** - `npm run dev -- --host`
3. ✅ **Deploy** - `vercel`
4. ✅ **Install kao app** - "Add to Home Screen"

---

## 📚 Dokumentacija:

- **DEPLOY_NOW.md** - Deploy upute
- **MOBILE_TEST_GUIDE.md** - Testiranje na mobitelu
- **MODERN_REDESIGN_GUIDE.md** - Design detalji
- **README.md** - Project overview

---

**Pitanja?** Javi! 🚀
