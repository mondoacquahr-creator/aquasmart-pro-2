# 🎯 AKCIJSKI PLAN ZA VLASNIKA
## AquaSmart Pro - Kompletni vodič za lansiranje aplikacije

**Datum:** 20. veljače 2025.  
**Vlasnik:** Vladimir Perić - Mondo Acqua d.o.o.  
**Status:** ✅ Svi placeholder podaci zamijenjeni - Aplikacija spremna!

---

# 📊 PREGLED STATUSA

## ✅ ŠTO JE GOTOVO (100%)

| Kategorija | Status | Detalji |
|-----------|--------|---------|
| **Pravna dokumentacija** | ✅ 100% | Terms of Use i Privacy Policy gotovi |
| **Copyright footeri** | ✅ 100% | Svi footeri ažurirani |
| **Kontakt podaci** | ✅ 100% | Email, telefon, web, adresa zamijenjeni |
| **Navigacijski linkovi** | ✅ 100% | Svi linkovi aktivni i funkcionalni |
| **React web aplikacija** | ✅ 100% | Potpuno funkcionalna |
| **Upute za zaštitu** | ✅ 100% | Dokumentacija gotova |

---

## ⚠️ ŠTO TI MORAŠ NAPRAVITI

Podjeljeno u 4 kategorije prema prioritetu:

1. **ODMAH** (0-7 dana) - Obavezno prije objave
2. **KRATKOROČNO** (1-4 tjedna) - Za punu zaštitu
3. **SREDNJOROČNO** (1-3 mjeseca) - Optimizacija i proširenje
4. **OPCIONALNO** - Ako planiraš Google Play ili Backend

---

---

# 1️⃣ ODMAH (0-7 dana) - OBAVEZNO

## ✅ KORAK 1: Provjeri sve podatke (30 minuta)

### Što napraviti:
1. Pokreni aplikaciju lokalno (`npm run dev`)
2. Testiraj Professional Mode (`/app/more`):
   - ✅ Provjeri footer: "© 2025 Vladimir Perić - Mondo Acqua d.o.o."
   - ✅ Klikni "Uvjeti korištenja" → Provjeri sve podatke
   - ✅ Klikni "Politika privatnosti" → Provjeri sve podatke
3. Testiraj Owner Mode (`/owner`):
   - ✅ Skrolaj dolje → Provjeri MondoFooter
   - ✅ Provjeri adresu: "Lucinici 17, 51216 Marinici, Hrvatska"
   - ✅ Klikni "Pravila privatnosti" → Trebao bi otvoriti `/privacy-policy`
   - ✅ Klikni "Uvjeti korištenja" → Trebao bi otvoriti `/terms-of-use`

### Kako provjeriti:
```bash
# Otvori terminal u root folderu projekta i pokreni:
grep -r "\[IME VLASNIKA" components/
grep -r "\[VAŠA EMAIL" components/
grep -r "\[VAS WEB\]" components/
grep -r "\[VAS TELEFON\]" components/
```

**Očekivani rezultat:** 0 rezultata (sve je zamijenjeno) ✅

---

## ✅ KORAK 2: Odluči o hostingu (1-2 sata)

### Opcija A: VERCEL (PREPORUČENO - BESPLATNO)

**Zašto Vercel:**
- ✅ Besplatan za osnovne potrebe
- ✅ Automatski SSL certifikat (HTTPS)
- ✅ Globalni CDN (brzo učitavanje)
- ✅ Automatski deploy sa Git-a
- ✅ Custom domena besplatno

**Kako deploy-ati:**

1. **Napravi Vercel account:**
   - Idi na: https://vercel.com
   - Sign up sa GitHub accountom

2. **Povežи Git repo:**
   - Klikni "New Project"
   - Izaberi svoj GitHub/GitLab repo sa AquaSmart Pro kodom
   - Vercel će automatski detektirati Vite projekt

3. **Konfiguracija:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy:**
   - Klikni "Deploy"
   - Čekaj 2-3 minute
   - ✅ Aplikacija je LIVE!

5. **Custom domena (opcionalno):**
   - Settings → Domains → Add Domain
   - Unesi: `aquasmart.mondo-acqua.hr` ili `app.mondo-acqua.hr`
   - Slijedi upute za DNS konfiguraciju

**Cijena:** BESPLATNO za osnovnu upotrebu

---

### Opcija B: NETLIFY (Alternative)

**Slično kao Vercel, također besplatno:**
- Idi na: https://netlify.com
- Povežи Git repo
- Automatski deploy

**Cijena:** BESPLATNO

---

### Opcija C: VLASTITI SERVER (Naprednija opcija)

**Ako imaš vlastiti VPS/server:**
- Trebat će ti: Node.js, Nginx/Apache, SSL certifikat
- Kompleksnije za održavati
- Ne preporučujem osim ako već imaš server

---

## ✅ KORAK 3: Provjeri pravne dokumente (1 sat)

### Što napraviti:

1. **Pročitaj "Terms of Use":**
   - Otvori: `/components/TermsOfUse.tsx`
   - Provjeri jesu li svi uvjeti u skladu sa tvojim poslovanjem
   - Provjeri jesu li sve zabrane razumne za tvoju situaciju

2. **Pročitaj "Privacy Policy":**
   - Otvori: `/components/PrivacyPolicy.tsx`
   - Provjeri opisuju li točno što aplikacija radi sa podacima
   - Provjeri GDPR compliance (trenutno je usklađeno)

3. **OPCIONALNO - Savjetovanje s odvjetnikom:**
   - Ako planiraš veliku komercijalizaciju
   - Ako želiš biti 100% siguran
   - Cijena: ~500-1000 kn za pregled dokumenta

**⚠️ NAPOMENA:** Dokumenti su već pripremljeni prema GDPR standardima, ali finalna odluka je uvijek na tebi.

---

## ✅ KORAK 4: Napravi backup podataka (15 minuta)

### Što napraviti:

1. **Backup cijelog projekta:**
   ```bash
   # Napravi ZIP cijelog foldera:
   zip -r aquasmart-backup-$(date +%Y%m%d).zip /path/to/aquasmart-pro
   ```

2. **Backup na cloud:**
   - Google Drive, Dropbox ili OneDrive
   - Spremi ZIP file
   - Datum backupa: 20.02.2025.

3. **Git repo (OBAVEZNO):**
   ```bash
   # Ako još nemaš Git repo:
   cd /path/to/aquasmart-pro
   git init
   git add .
   git commit -m "Initial commit - Production ready"
   
   # Napravi GitHub/GitLab repo i pushaj:
   git remote add origin https://github.com/tvoj-username/aquasmart-pro.git
   git push -u origin main
   ```

**⚠️ KRITIČNO:** Nikad nemoj izgubiti kod! Git + Cloud backup = sigurnost

---

## ✅ KORAK 5: Testiraj na stvarnim uređajima (1-2 sata)

### Desktop:
- ✅ Chrome (Windows/Mac)
- ✅ Firefox
- ✅ Safari (Mac)
- ✅ Edge

### Mobilni:
- ✅ Android - Chrome
- ✅ iPhone - Safari
- ✅ Tablet (ako imaš)

### Što testirati:
1. Login/registracija
2. Dodavanje klijenta
3. Dodavanje bazena
4. Kreiranje radnog naloga
5. Analiza vode
6. PDF ispis
7. Navigacija između stranica
8. Footer linkovi (Terms, Privacy)

**⚠️ВАЖНО:** Aplikacija je responsive, ali testiraj na pravim uređajima!

---

---

# 2️⃣ KRATKOROČNO (1-4 tjedna) - PUNA ZAŠTITA

## 📝 KORAK 6: Registriraj žig "AquaSmart Pro" (PREPORUČENO)

### Zašto registrirati žig:

✅ **Pravna zaštita:**
- Nitko drugi ne može koristiti naziv "AquaSmart Pro"
- Možeš tužiti kopije
- Ekskluzivno pravo na trademark u Hrvatskoj

✅ **Kredibilitet:**
- Profesionalni imidž
- Znak ozbiljnosti
- Povjerenje korisnika

✅ **Monetizacija:**
- Možeš licencirati naziv
- Veća vrijednost branda
- Zaštita ulaganja

---

### Kako registrirati žig (KORAK PO KORAK):

#### **A) PRIPREMA (1-2 sata):**

1. **Provjerite dostupnost naziva:**
   - Idi na: https://www.dziv.hr
   - Klikni: "Baza podataka" → "Pretraživi žigovi"
   - Pretraži: "AquaSmart" i "AquaSmart Pro"
   - ✅ Ako nema rezultata → možeš registrirati!
   - ❌ Ako ima rezultata → trebaš advokat ili drugi naziv

2. **Odluči klase proizvoda/usluga:**
   - Klasa 9: Software, mobilne aplikacije
   - Klasa 42: Software development, IT usluge
   - Klasa 37: Održavanje bazena (opcionalno)
   
   **Preporuka:** Registriraj klase 9 i 42 (sigurno)

3. **Pripremi logotip (ako ga imaš):**
   - Format: JPG, 8x8 cm, 300 DPI
   - Crno-bijela verzija ili u boji
   - Ako nemaš logo → registriraj samo tekst "AquaSmart Pro"

---

#### **B) PRIJAVA (Online - 30 minuta):**

1. **Otvori online prijavu:**
   - https://www.dziv.hr/hr/intelektualno-vlasnistvo/zigovi/
   - Klikni: "e-Prijava žiga"

2. **Ispuni obrazac:**
   - **Podnositelj:** Vladimir Perić (ili Mondo Acqua d.o.o.)
   - **OIB:** Tvoj OIB ili OIB tvrtke
   - **Adresa:** Lucinici 17, 51216 Marinici
   - **Email:** info@mondo-acqua.hr
   - **Telefon:** +385 95 208 7321
   - **Naziv žiga:** AquaSmart Pro
   - **Vrsta žiga:** Riječi (ili kombinacija riječi i slike ako imaš logo)
   - **Klase:** 9, 42 (označi obje)

3. **Opiši proizvode/usluge:**
   - **Klasa 9:** "Računalni programi (software) za analizu vode, mobilne aplikacije za održavanje bazena"
   - **Klasa 42:** "Razvoj i dizajn računalnih programa, SaaS usluge za analizu bazenske vode"

4. **Učitaj logo (ako imaš):**
   - Format: JPG, PNG
   - Dimenzije: 8x8 cm
   - Rezolucija: 300 DPI

5. **Plati administrativnu pristojbu:**
   - **1 klasa:** ~700 kn
   - **2 klase:** ~1000 kn
   - Plaćanje: internet banking, uplatnica

---

#### **C) ČEKANJE I PRAĆENJE:**

**Timeline:**
- **Dan 1-30:** Formalna provjera (DZIV provjerava obrazac)
- **Dan 30-60:** Materijalna provjera (provjera dostupnosti)
- **Dan 60-90:** Objava u Glasniku (javna objava)
- **Dan 90-180:** Razdoblje prigovora (netko može prigovoriti)
- **Dan 180-270:** Registracija i certifikat

**✅ Uspješna registracija = Zaštita 10 godina (s mogućnošću produljenja)**

---

#### **D) CIJENA:**

| Stavka | Cijena |
|--------|--------|
| Administrativna pristojba (1 klasa) | ~700 kn |
| Dodatna klasa | ~300 kn |
| **UKUPNO (2 klase):** | **~1000 kn** |
| Odvjetnik (opcionalno) | 1000-3000 kn |

**💡 TIP:** Možeš sam prijaviti bez odvjetnika ako si pažljiv!

---

#### **E) ŠTO NAKON REGISTRACIJE:**

✅ **Certifikat:**
- Dobit ćeš službeni certifikat DZIV-a
- Čuvaj ga kao PDF i fizički

✅ **Korištenje znaka:**
- Možeš koristiti ® simbol uz naziv
- "AquaSmart Pro®" ili "AquaSmart Pro™"

✅ **Obnovljavanje:**
- Svake 10 godine moraš obnoviti
- Cijena obnove: ~500-700 kn
- DZIV te obavijesti 6 mjeseci prije isteka

---

### ALTERNATIVE - EU žig (opcionalno)

Ako planiraš širenje u EU:
- **EUIPO:** https://euipo.europa.eu
- **Cijena:** ~850 EUR
- **Zaštita:** Svih 27 EU zemalja odjednom
- **Proces:** Slično kao DZIV, ali na engleskom

**Preporuka:** Prvo registriraj u Hrvatskoj, pa kasnije EU ako treba.

---

## 📄 KORAK 7: Registriraj autorska prava (OPCIONALNO)

### Što je autorsko pravo:

- **Automatski si zaštićen** čim napraviš kod (ne treba registracija!)
- Registracija daje **službeni dokaz** vlasništva
- Korisno u sudskim sporovima

---

### Kako registrirati (ako želiš):

1. **DZIV - Autorska prava:**
   - https://www.dziv.hr/hr/intelektualno-vlasnistvo/autorsko-pravo/
   - Prijavi: "Računalni program - AquaSmart Pro"
   - Cijena: ~500 kn

2. **Dokumentacija:**
   - Upload ZIP sa kodom
   - Tehnička dokumentacija
   - Datum kreiranja

**⚠️ NAPOMENA:** Ovo je OPCIONALNO - žig je važniji!

---

## 🔐 KORAK 8: Osiguraj domenu (1 sat)

### Registriraj vlastitu domenu:

**Opcije:**
1. **aquasmart.hr** (ako je dostupna)
2. **aquasmart.com** 
3. **aquasmart.app** (Google Domains)
4. **aquasmart.mondo-acqua.hr** (subdomena)

**Gdje kupiti:**
- **CARNet (Hrvatska):** https://domene.hr (~100 kn/godinu)
- **Namecheap:** https://namecheap.com (~$10/godinu)
- **Cloudflare:** https://cloudflare.com (~$9/godinu)

**Što napraviti:**
1. Registriraj domenu
2. Poveži sa Vercel/Netlify (DNS settings)
3. Čekaj 24h dok se DNS propagira

---

---

# 3️⃣ SREDNJOROČNO (1-3 mjeseca) - OPTIMIZACIJA

## 📊 KORAK 9: Analytics i praćenje (2-3 sata)

### Dodaj Google Analytics (OPCIONALNO):

**Zašto:**
- Vidi koliko ljudi koristi aplikaciju
- Koje stranice su najpopularnije
- Koliko dugo korisnici ostaju
- Demografski podaci

**Kako dodati:**

1. **Napravi Google Analytics account:**
   - https://analytics.google.com
   - Kreiraj property: "AquaSmart Pro"
   - Dobij Measurement ID (npr. G-XXXXXXXXXX)

2. **Dodaj u kod:**
   - Otvori `/index.html`
   - Dodaj Google tag u `<head>`:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

3. **Deploy:**
   - Push na Git
   - Vercel auto-deploy

**⚠️ GDPR:** Ako koristiš Analytics, ažuriraj Privacy Policy!

---

## 💰 KORAK 10: Odluči o monetizaciji (planiranje)

### Opcije:

**A) BESPLATNA + PREMIUM:**
- Owner Mode: Besplatno (osnovna analiza)
- Professional Mode: Pretplata (€9.99/mjesec)
- Premium features: Radni nalozi, izvještaji, skladište

**B) FREEMIUM:**
- Prvih 30 dana besplatno
- Nakon toga: €9.99/mjesec

**C) ONE-TIME PAYMENT:**
- Jednokratna kupnja: €49.99
- Doživotna licenca

**D) PAY-PER-USE:**
- Po radnom nalogu: €0.50
- Po analizi: €0.20

**Preporuka:** Počni besplatno → prikupi korisnike → uvedi pricing nakon 3-6 mjeseci

---

## 🎨 KORAK 11: Marketing materijali (ako planiraš promoviranja)

### Što napraviti:

1. **Logo dizajn:**
   - Ako nemaš logo → angažiraj dizajnera (Fiverr, 99designs)
   - Cijena: $50-200

2. **Screenshots za marketing:**
   - Napravi lijepe screenshote app-a
   - Dodaj na web stranicu
   - Koristi za social media

3. **Demo video:**
   - Snimi kako app radi (OBS Studio - besplatno)
   - Upload na YouTube
   - Dijeli na LinkedIn, Facebook

4. **Promocija:**
   - LinkedIn posteri
   - Facebook grupe za bazene
   - Instagram stories
   - Email na postojeće klijente Mondo Acqua

---

---

# 4️⃣ OPCIONALNO - Android App + Backend

## 📱 KORAK 12: Kreiraj Android aplikaciju (SAMO AKO ŽELIŠ GOOGLE PLAY)

### ⚠️ VAŽNO: Ovo je KOMPLEKSAN proces!

**Trenutno stanje:**
- ✅ Imaš React web app (radi u browseru)
- ❌ Nemaš native Android app

**Opcije:**

---

### **Opcija A: Capacitor (PREPORUČENO)**

**Što je Capacitor:**
- Pretvara React web app u Android/iOS app
- Koristi native WebView
- Dodaje pristup kamerama, GPS-u, itd.

**Proces (5-10 sati rada):**

1. **Instaliraj Capacitor:**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   # Ime: AquaSmart Pro
   # Package ID: hr.mondoacqua.aquasmart
   ```

2. **Dodaj Android platform:**
   ```bash
   npm install @capacitor/android
   npx cap add android
   ```

3. **Otvori u Android Studio:**
   ```bash
   npx cap open android
   ```

4. **Konfiguracija:**
   - Promijeni app ikonu
   - Postavi verziju (1.0.0)
   - Konfiguracija permissions (kamera, GPS)

5. **Build APK:**
   - Build → Generate Signed Bundle/APK
   - Kreiraj keystore (ČUVAJ GA SIGURNO!)
   - Izvozi APK

6. **Testiraj:**
   - Instaliraj APK na Android uređaj
   - Testiraj sve funkcionalnosti

**Cijena:** BESPLATNO (ali treba znanja)

---

### **Opcija B: Angažiraj developera**

Ako ne znaš ili nemaš vremena:
- **Fiverr/Upwork:** $200-500
- **Lokalni developer:** 2000-5000 kn
- **Agencija:** 10,000-30,000 kn

**Što će napraviti:**
- Capacitor setup
- Android build
- Play Store upload
- Testing

---

### **Opcija C: PWA (Progressive Web App) - NAJLAKŠE**

**Umjesto native app-a:**
- Korisnici dodaju web app na home screen
- Radi kao app, ali u browseru
- Offline mode (Service Worker)

**Setup (1-2 sata):**
1. Dodaj `manifest.json` (već imaš! ✅)
2. Dodaj Service Worker za offline (već imaš! ✅)
3. Testiranje na mobitelu:
   - Otvori web app u Chrome
   - Klikni "Add to Home Screen"
   - ✅ Radi kao app!

**Prednosti:**
- ✅ Nema Google Play fee ($25)
- ✅ Instant updates (bez review procesa)
- ✅ Radi na Android i iOS
- ✅ Jednostavnije održavanje

**Mane:**
- ❌ Nema u Google Play Store (ali korisnici mogu dodati ručno)
- ❌ Limitiran pristup nekim native features

**Preporuka:** POČNI SA PWA → kasnije napravi native ako treba!

---

## ☁️ KORAK 13: Backend sa Supabase (SAMO AKO ŽELIŠ CLOUD)

### ⚠️ Trenutno stanje:

- ✅ Svi podaci se spremaju u **localStorage** (browser)
- ❌ Nema cloud backupa
- ❌ Nema sinkronizacije između uređaja

**Ako želiš cloud backend:**

---

### **Setup Supabase (2-4 sata):**

1. **Kreiraj Supabase account:**
   - https://supabase.com
   - Sign up sa GitHub accountom
   - Besplatno do 500 MB storage

2. **Kreiraj projekt:**
   - Naziv: "AquaSmart Pro"
   - Regija: Europe (frankfurt) - GDPR compliant
   - Database password: (SPREMI SIGURNO!)

3. **Kreiraj tablice:**
   ```sql
   -- Users (korisnici)
   CREATE TABLE users (
     id UUID PRIMARY KEY,
     email TEXT UNIQUE,
     name TEXT,
     created_at TIMESTAMP
   );

   -- Clients (klijenti)
   CREATE TABLE clients (
     id UUID PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     name TEXT,
     phone TEXT,
     email TEXT,
     address TEXT,
     created_at TIMESTAMP
   );

   -- Pools (bazeni)
   CREATE TABLE pools (
     id UUID PRIMARY KEY,
     client_id UUID REFERENCES clients(id),
     name TEXT,
     volume NUMERIC,
     type TEXT,
     created_at TIMESTAMP
   );

   -- Analyses (analize)
   CREATE TABLE water_analyses (
     id UUID PRIMARY KEY,
     pool_id UUID REFERENCES pools(id),
     ph NUMERIC,
     chlorine NUMERIC,
     alkalinity NUMERIC,
     created_at TIMESTAMP
   );
   ```

4. **Row Level Security (RLS):**
   - Enable RLS na svim tablicama
   - Policy: Korisnik vidi samo svoje podatke

5. **Integracija u kod:**
   - Instalirati `@supabase/supabase-js`
   - Zamijeniti localStorage pozive sa Supabase queries
   - Testiranje

**Cijena:**
- **Free tier:** 500 MB storage, 2 GB bandwidth (dovoljno za početak)
- **Pro tier:** $25/mjesec (5 GB storage, 250 GB bandwidth)

**Preporuka:** Počni sa Free tier!

---

### **Alternative:**

**Firebase (Google):**
- Slično kao Supabase
- Besplatno za male app-ove
- Dobra dokumentacija

**Vlastiti backend:**
- Node.js + PostgreSQL
- Zahtijeva VPS server
- Kompleksnije

---

---

# 5️⃣ DUGOROČNO - Održavanje i rast

## 🔄 KORAK 14: Redovito održavanje

### Mjesečno:
- ✅ Provjeri ima li novih korisnika
- ✅ Provjeri Analytics (ako si dodao)
- ✅ Backup podataka
- ✅ Provjeri radi li aplikacija

### Kvartalno:
- ✅ Ažuriraj dependencies (`npm update`)
- ✅ Security audit (`npm audit`)
- ✅ Testiraj na novim browserima

### Godišnje:
- ✅ Obnovi domenu
- ✅ Provjeri žig (ističe nakon 10 god)
- ✅ Ažuriraj Privacy Policy (ako treba)

---

## 📈 KORAK 15: Skaliranje (kada dođe vrijeme)

### Ako aplikacija raste:

1. **Više korisnika:**
   - Pređi sa Vercel Free → Pro ($20/mjesec)
   - Dodaj CDN za brzinu
   - Load testing

2. **Više podataka:**
   - Supabase Free → Pro ($25/mjesec)
   - Database optimizacije
   - Backup strategija

3. **Više zahtjeva:**
   - Dodaj Redis cache
   - Database indexing
   - API rate limiting

4. **Tim:**
   - Angažiraj developera
   - Customer support
   - Marketing

---

---

# 📋 SAŽETAK - Quick Checklist

## OBAVEZNO (Prije objave):
- [ ] Testirao aplikaciju na desktop i mobile
- [ ] Svi placeholder podaci zamijenjeni (GOTOVO ✅)
- [ ] Pravni dokumenti pregledani
- [ ] Git backup napravljen
- [ ] Deployed na Vercel/Netlify
- [ ] Testirano na production URL-u

## PREPORUČENO (1-4 tjedna):
- [ ] Registriran žig "AquaSmart Pro" (~1000 kn)
- [ ] Registrirana domena (aquasmart.hr)
- [ ] SSL certifikat aktivan (automatski sa Vercel)
- [ ] Pravni dokumenti pregledani s odvjetnikom (opcionalno)

## OPCIONALNO (Kada bude potrebno):
- [ ] Google Analytics dodato
- [ ] Android app (Capacitor ili PWA)
- [ ] Supabase backend
- [ ] Marketing materijali
- [ ] Monetizacija

---

---

# 💰 PROCJENA TROŠKOVA

## Minimalni troškovi (Prvi mjesec):
| Stavka | Cijena |
|--------|--------|
| Hosting (Vercel/Netlify Free) | **0 kn** |
| Domena (.hr) | 100 kn |
| **UKUPNO (minimum):** | **100 kn** |

## Puna zaštita (Prvi mjesec):
| Stavka | Cijena |
|--------|--------|
| Hosting (Vercel Free) | 0 kn |
| Domena (.hr) | 100 kn |
| Žig (2 klase) | 1000 kn |
| Odvjetnik (opcionalno) | 500-1000 kn |
| **UKUPNO (s zaštitom):** | **1600-2100 kn** |

## Sa Android app-om (Prvi mjesec):
| Stavka | Cijena |
|--------|--------|
| Sve gore | 1600-2100 kn |
| Google Play Developer Account | $25 (~190 kn) |
| Android developer (ako angažiraš) | 2000-5000 kn |
| **UKUPNO (sa app-om):** | **3800-7300 kn** |

## Mjesečni troškovi (Nakon 1. mjeseca):
| Stavka | Cijena |
|--------|--------|
| Hosting (Vercel Free) | 0 kn |
| Domena (godišnje / 12) | ~8 kn/mjesec |
| **UKUPNO (mjesečno):** | **~10 kn** |

---

---

# 🆘 PODRŠKA I RESURSI

## Dokumentacija projekta:
- `/PRAVNA_ZASTITA_UPUTE.md` - Kompletan vodič za zaštitu
- `/CHECKLIST_ZASTITA.md` - Brzi checklist
- `/TODO_ZAMIJENI_PODATKE.md` - Status placeholder podataka (✅ GOTOVO)
- `/DEPLOYMENT_GUIDE.md` - Deployment upute (ako postoji)

## Vanjske poveznice:
- **DZIV (Žigovi):** https://www.dziv.hr
- **Vercel:** https://vercel.com
- **Supabase:** https://supabase.com
- **Capacitor:** https://capacitorjs.com
- **AZOP (GDPR):** https://azop.hr

## Za pitanja:
- **Email:** info@mondo-acqua.hr
- **Telefon:** +385 95 208 7321

---

---

# ✅ FINALNI STATUS - ŠTO IMAŠ SADA:

## Aplikacija:
✅ **Potpuno funkcionalna React web aplikacija**
✅ **Responsive design** (desktop + mobile)
✅ **Professional Mode** (login, radni nalozi, klijenti, bazeni)
✅ **Owner Mode** (analiza vode, chat, video)
✅ **PDF izvještaji**
✅ **Lokalno spremanje podataka** (localStorage)

## Pravna zaštita:
✅ **Terms of Use** - kompletno
✅ **Privacy Policy** - GDPR compliant
✅ **Copyright footeri** - svugdje
✅ **Svi kontakt podaci** - ažurirani

## Dokumentacija:
✅ **OVAJ DOKUMENT** - kompletan akcijski plan
✅ **PRAVNA_ZASTITA_UPUTE.md** - tehnička zaštita
✅ **CHECKLIST_ZASTITA.md** - brzi pregled
✅ **TODO_ZAMIJENI_PODATKE.md** - status podataka

---

# 🚀 SLJEDEĆI KORAK - TI ODLUČUJEŠ:

## Opcija A: BRZI LAUNCH (0 kn)
1. Deploy na Vercel (besplatno)
2. Testiraj na production
3. Podijeli link korisnicima
4. ✅ **APP JE LIVE!**

## Opcija B: SA ZAŠTITOM (1600 kn)
1. Sve iz Opcije A
2. Registriraj domenu (100 kn)
3. Registriraj žig (1000 kn)
4. Odvjetnik pregleda pravne dokumente (500 kn)
5. ✅ **APP JE LIVE I ZAŠTIĆEN!**

## Opcija C: FULL PACKAGE (3800-7300 kn)
1. Sve iz Opcije B
2. Android app (Capacitor)
3. Google Play upload
4. Supabase backend
5. Marketing materijali
6. ✅ **PROFESIONALNI LAUNCH!**

---

---

# 📞 TREBAŠ POMOĆ?

## Ako zapneš negdje:

**Za tehničku pomoć:**
- Stack Overflow
- GitHub Issues
- Vercel Support
- Capacitor Documentation

**Za pravnu pomoć:**
- DZIV (žigovi): info@dziv.hr
- AZOP (GDPR): azop@azop.hr
- Odvjetnik specijaliziran za IT

**Za Mondo Acqua pitanja:**
- Email: info@mondo-acqua.hr
- Telefon: +385 95 208 7321

---

---

**🎉 ČESTITAMO!**

**Aplikacija AquaSmart Pro je spremna za lansiranje!**

**Odluči koji put želiš ići (Opcija A, B ili C) i kreni korak po korak.**

**Sve što ti treba je već tu - samo trebaš izvršiti korake! 💪**

---

**Verzija dokumenta:** 1.0  
**Datum:** 20. veljače 2025.  
**Autor:** AI Asistent za AquaSmart Pro  
**Status:** ✅ KOMPLETNO

---

**SRETNO! 🚀**
