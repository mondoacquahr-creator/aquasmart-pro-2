# ⚡ BRZI DEPLOYMENT - 5 KORAKA

**Vrijeme:** 10-15 minuta  
**Težina:** ⭐⭐ Lako

---

## 📥 KORAK 1: DOWNLOAD PROJEKTA (2 min)

### Iz Figma Make editora:

**Potraži jednu od ovih opcija u meniju:**

```
☰ Menu → "Save local copy"
☰ Menu → "Download project"
☰ Menu → "Export"
⚙️ Settings → "Export" / "Download"
```

**Downloadaš:** `aquasmart-pro.zip`

**Unzip u folder:**
- Windows: `C:\AquaSmart-Pro`
- Mac: `~/AquaSmart-Pro`

---

## 💻 KORAK 2: AUTOMATSKI SETUP (3 min)

### Otvori terminal u folderu sa projektom

**Windows:**
```cmd
cd C:\AquaSmart-Pro
setup.bat
```

**Mac/Linux:**
```bash
cd ~/AquaSmart-Pro
chmod +x setup.sh
./setup.sh
```

### Što skripta radi:

```
✓ Provjera: Node.js, npm, Git
✓ Instalacija: npm paketi
✓ Test: Build
✓ Git: Inicijalizacija i config
✓ Commit: Prvi commit
✓ Pita te za GitHub username
```

---

## 🐙 KORAK 3: KREIRAJ GITHUB REPO (1 min)

### Otvori browser:

```
https://github.com/new
```

### Ispuni:

```
Repository name:  aquasmart-pro
Description:      AquaSmart Pro - Pool Water Analysis
Private:          ✅ (OBAVEZNO!)

❌ NEMOJ označiti:
- Add README
- Add .gitignore  
- Choose license
```

### Klikni:

```
Create repository
```

---

## 🔑 KORAK 4: PERSONAL ACCESS TOKEN (2 min)

### GitHub NE prihvaća obične passworde!

**Trebaš Personal Access Token:**

1. **Otvori:** https://github.com/settings/tokens/new

2. **Ispuni:**
   ```
   Note:        AquaSmart Deployment
   Expiration:  No expiration
   Scopes:      ✅ repo (full control)
   ```

3. **Klikni:** `Generate token`

4. **KOPIRAJ TOKEN** (vidjet ćeš ga SAMO JEDNOM!):
   ```
   ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. **SPREMI TOKEN negdje sigurno!** (npr. Notepad)

---

## ⬆️ KORAK 5: GIT PUSH (1 min)

### Nazad u terminal gdje si pokrenuo setup skriptu:

**Skripta će pitati za GitHub credentials:**

```
Username: [tvoj-github-username]
Password: [ZALIJEPI TOKEN OVDJE - ne obični password!]
```

**✅ Kod pushat na GitHub!**

---

## 🚀 KORAK 6: VERCEL DEPLOYMENT (2 min)

### 1. Otvori Vercel:

```
https://vercel.com/new
```

### 2. Login sa GitHub accountom

### 3. Import Repository:

```
- Vercel automatski prikazuje tvoje GitHub repozitorije
- Pronađi: aquasmart-pro
- Klikni: Import
```

### 4. Configure Project:

```
Framework Preset:    Vite  ← (auto-detektira)
Root Directory:      ./
Build Command:       npm run build
Output Directory:    dist

☑️ SVE JE AUTO-POPUNJENO - NE MIJENJAJ NIŠTA!
```

### 5. Deploy:

```
Klikni: Deploy
Čekaj: 1-2 minute...
```

---

## 🎉 GOTOVO!

### Što sada imaš:

```
✅ Kod na GitHub-u
✅ Production app na: https://aquasmart-pro-abc123.vercel.app
✅ Automatski SSL certifikat (HTTPS)
✅ Globalni CDN
✅ Automatski deploy na svaki git push
```

---

## 🔄 BUDUĆE PROMJENE (30 sekundi)

### Svaka izmjena koda:

```bash
# 1. Uredi kod lokalno (npr. promijeni boju)
# 2. Spremi file (Ctrl+S)

# 3. Git push:
git add .
git commit -m "Promjena XYZ"
git push

# 4. Vercel automatski deploya!
# 5. Nova verzija live za 1-2 min! ✅
```

**NE MORAŠ NIŠTA DRUGO! Samo git push!**

---

## 🌐 CUSTOM DOMENA (Opcionalno - kasnije)

### Kada aquasmart.hr bude aktivna:

**1. U Vercel Dashboard:**

```
Settings → Domains → Add Domain
- aquasmart.hr
- www.aquasmart.hr
```

**2. Vercel daje DNS upute** (npr.):

```
A Record:
Name:  @
Value: 76.76.21.21

CNAME:
Name:  www
Value: cname.vercel-dns.com
```

**3. Dodaj u DNS provider:**

```
CARNet (ili gdje si kupio domenu)
→ DNS Settings
→ Dodaj gore navedene recordse
→ Spremi
```

**4. Čekaj 24-48h** (DNS propagacija)

**5. ✅ App na https://aquasmart.hr!**

---

## ⚠️ TROUBLESHOOTING

### "setup.bat ne radi"

**Rješenje:** Pokreni korake ručno:

```bash
npm install
npm run build
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/[USERNAME]/aquasmart-pro.git
git push -u origin main
```

---

### "Git push denied"

**Rješenje:** 
- Provjeri jesi li koristio **TOKEN** kao password (ne obični password!)
- Generiraj novi token ako je potrebno

---

### "Vercel build fails"

**Rješenje:**

```bash
# Testiraj lokalno:
npm run build

# Ako ima greške → ispravi ih
# Zatim:
git add .
git commit -m "Fix build errors"
git push
```

---

## 📋 CHECKLIST

```
☐ Downloadao projekt iz Figma Make
☐ Unzipao u folder
☐ Pokrenuo setup skriptu
☐ Kreirao GitHub repository
☐ Generirao Personal Access Token
☐ Git push uspješan
☐ Vercel account kreiran
☐ Repository importan u Vercel
☐ Deploy uspješan
☐ Production URL radi
☐ 🎉 Gotovo!
```

---

## 📞 POMOĆ

**Detaljne upute:**
- `/DEPLOYMENT_PACKAGE_README.md` - kompletne upute
- `/FIGMA_MAKE_DOWNLOAD_GUIDE.md` - download opcije
- `/VERCEL_DEPLOYMENT_GUIDE.md` - Vercel detalji

**Podrška:**
- Mondo Acqua: info@mondo-acqua.hr
- Tel: +385 95 208 7321

---

## 🎯 TRENUTNO STANJE PROJEKTA

```
✅ Production-ready kod
✅ 100+ komponenti
✅ Responsive design
✅ PWA support
✅ TypeScript
✅ Optimizirani buildovi
✅ Pravna zaštita (Terms, Privacy Policy)
✅ Copyright footers
```

---

**SRETNO SA DEPLOYMENTOM! 🚀🌊**

*Za detaljne upute: `DEPLOYMENT_PACKAGE_README.md`*
