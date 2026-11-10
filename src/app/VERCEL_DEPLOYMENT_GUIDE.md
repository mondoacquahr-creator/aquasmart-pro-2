# 🚀 VERCEL DEPLOYMENT - BRZI VODIČ

## 📥 KORAK 1: DOWNLOAD KODA

### Što trebaš downloadati:

Svi fileovi tvoje aplikacije su u Figma Make editoru.

**OPCIJA A: Download iz Figma Make (ako dostupno)**
- Menu → Export → Download ZIP
- ILI koristi built-in GitHub sync (ako ima)

**OPCIJA B: Ručno kreiranje projekta**
Slijedi upute ispod ⬇️

---

## 💻 KORAK 2: KREIRAJ LOKALNI PROJEKT

### 1. Napravi novi folder:

```bash
# Windows
mkdir C:\AquaSmart-Pro
cd C:\AquaSmart-Pro

# Mac/Linux
mkdir ~/AquaSmart-Pro
cd ~/AquaSmart-Pro
```

### 2. Kopiraj SVE fileove iz Figma Make u ovaj folder

**Lista fileova koje trebaš:**
```
aquasmart-pro/
├── App.tsx
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── components/
│   ├── (svi .tsx fileovi)
│   └── ui/
├── lib/
│   ├── (svi .ts fileovi)
├── contexts/
│   └── AuthContext.tsx
├── routes.ts
├── src/
│   └── main.tsx
├── styles/
│   └── globals.css
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── offline.html
└── types/
    └── index.ts
```

---

## 📤 KORAK 3: UPLOAD NA GITHUB

### 1. Napravi GitHub repo:

**Otvori:** https://github.com/new

```
Repository name:  aquasmart-pro
Description:      AquaSmart Pro - Pool Water Analysis Application
Private:          ✅ (OBAVEZNO!)

❌ NEMOJ označiti:
- Add README
- Add .gitignore
- Choose license
```

**Klikni:** `Create repository`

---

### 2. Inicijaliziraj Git i pushaj kod:

**Otvori terminal u folderu sa kodom:**

```bash
# 1. Inicijaliziraj Git
git init

# 2. Dodaj sve fileove
git add .

# 3. Prvi commit
git commit -m "Initial commit - AquaSmart Pro production ready"

# 4. Preimenuj branch
git branch -M main

# 5. Poveži sa GitHub (ZAMIJENI [USERNAME] sa svojim!)
git remote add origin https://github.com/[USERNAME]/aquasmart-pro.git

# 6. Push
git push -u origin main
```

---

### ⚠️ Ako traži Password:

GitHub NE prihvaća obične passworde!

**Trebaš Personal Access Token:**

1. **Generiraj token:** https://github.com/settings/tokens/new

2. **Settings:**
   ```
   Note:        AquaSmart Deployment
   Expiration:  No expiration
   Scopes:      ✅ repo (full control)
   ```

3. **Klikni:** `Generate token`

4. **KOPIRAJ token** (vidjet ćeš ga samo JEDNOM!):
   ```
   ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. **Koristi u terminalu:**
   ```
   Username: [tvoj-github-username]
   Password: [ZALIJEPI TOKEN OVDJE]
   ```

---

## 🚀 KORAK 4: DEPLOY NA VERCEL

### 1. Otvori Vercel:

```
https://vercel.com/new
```

### 2. Import Repository:

- Vercel prikazuje listu tvojih GitHub repozitorija
- Pronađi: **aquasmart-pro**
- Klikni: **Import**

### 3. Configure Project:

```
Framework Preset:    Vite  (Vercel automatski detektira)
Root Directory:      ./
Build Command:       npm run build
Output Directory:    dist
Install Command:     npm install
```

**Sve ovo je već AUTO-POPUNJENO! Ne mijenjaj ništa.**

### 4. Environment Variables (skip):

Nemaš environment varijable, **klikni SKIP**.

### 5. Deploy:

**Klikni:** `Deploy`

**Čekaj 1-2 minute...**

---

## ✅ DEPLOYMENT GOTOV!

### Što dobijaš:

```
✅ Production URL: https://aquasmart-pro-abc123.vercel.app
✅ Automatski SSL certifikat (HTTPS)
✅ Globalni CDN
✅ Automatski deploy na svaki git push
```

---

## 🌐 KORAK 5: DODAJ CUSTOM DOMENU (Opcionalno)

### Kada aquasmart.hr bude aktivna:

**1. U Vercel Dashboard:**
- Otvori projekt: `aquasmart-pro`
- Settings → Domains
- Add Domain → `aquasmart.hr`
- Add Domain → `www.aquasmart.hr`

**2. Vercel će dati DNS upute:**

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

**3. Dodaj u CARNet (ili gdje si kupio domenu):**
- Login → DNS Settings
- Dodaj gore navedene recordse
- Spremi

**4. Čekaj 24-48h (DNS propagacija)**

**5. ✅ Tvoja app je na https://aquasmart.hr!**

---

## 🔄 BUDUĆE PROMJENE (Automatski deploy)

### Svaka promjena u kodu:

```bash
# 1. Urediš kod (npr. promijeniš boju)
# 2. Spremiš file (Ctrl+S)

# 3. Git push:
git add .
git commit -m "Opis promjene"
git push

# 4. Vercel AUTOMATSKI deploya novu verziju!
# 5. ✅ Za 1-2 min nova verzija je live!
```

**NE MORAŠ RUČNO NIŠTA! Samo git push!** 🎉

---

## 📞 TROUBLESHOOTING

### Problem: "Build failed"

**Uzrok:** TypeScript greška ili missing dependency

**Rješenje:**
1. Otvori Vercel Dashboard → Deployments
2. Klikni na failed deployment
3. Pregledaj error log
4. Ispravi grešku lokalno
5. Git push ponovno

---

### Problem: "Git push denied"

**Uzrok:** Nevažeći Personal Access Token

**Rješenje:**
- Generiraj novi token (gore ⬆️)
- Koristi novi token kao password

---

### Problem: "Domain not working"

**Uzrok:** DNS još nije propagiran

**Rješenje:**
- Čekaj 24-48h
- Provjeri: `nslookup aquasmart.hr`
- Ako i dalje ne radi → provjeri DNS settings

---

## ✅ CHECKLIST

```
☐ Downloadao/kreirao lokalni projekt sa svim fileovima
☐ Napravio GitHub repository (aquasmart-pro)
☐ Git init + commit + push na GitHub
☐ Vercel account kreiran
☐ Imported repository u Vercel
☐ Deploy kliknut
☐ Deployment uspješan (zeleni checkmark)
☐ Production URL radi
☐ (Opcionalno) Custom domena dodana
```

---

## 🎯 TRENUTNO IMAŠ:

```
✅ Kod na GitHub-u (backup + verzioniranje)
✅ Automatski deployment (git push = deploy)
✅ Production URL (https://aquasmart-xyz.vercel.app)
✅ SSL certifikat (HTTPS)
✅ Globalni CDN (brzo učitavanje)
```

---

## 📧 PODRŠKA

**Vercel dokumentacija:**
- https://vercel.com/docs

**GitHub pomoć:**
- https://docs.github.com

**Mondo Acqua kontakt:**
- Email: info@mondo-acqua.hr
- Tel: +385 95 208 7321

---

**SRETNO! 🚀**
