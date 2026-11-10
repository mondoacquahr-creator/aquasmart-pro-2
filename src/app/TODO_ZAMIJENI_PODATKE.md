# 📝 Popis podataka za zamjenu

## ✅ SVE JE ZAMIJENJENO! (20. veljače 2025.)

Svi placeholder podaci zamijenjeni sa stvarnim informacijama za **Vladimir Perić - Mondo Acqua d.o.o.**

---

## ✅ Zamijenjeni podaci:

### **1. Vlasničke informacije**
- ✅ `[IME VLASNIKA/TVRTKE]` → **Vladimir Perić - Mondo Acqua d.o.o.**
- **Lokacije:**
  - `/components/TermsOfUse.tsx` - ✅ Zamijenjeno
  - `/components/More.tsx` - ✅ Zamijenjeno
  - `/components/MondoFooter.tsx` - ✅ Zamijenjeno

---

### **2. Kontakt email**
- ✅ `[VAŠA EMAIL ADRESA]` → **info@mondo-acqua.hr**
- **Lokacije:**
  - `/components/TermsOfUse.tsx` - ✅ Zamijenjeno (2 mjesta)
  - `/components/PrivacyPolicy.tsx` - ✅ Zamijenjeno (2 mjesta)

---

### **3. Web stranica**
- ✅ `[VAS WEB]` → **www.mondo-acqua.hr**
- **Lokacije:**
  - `/components/TermsOfUse.tsx` - ✅ Zamijenjeno
  - `/components/MondoFooter.tsx` - ✅ Već postojalo

---

### **4. Telefon**
- ✅ `[VAS TELEFON]` → **095 208 7321** (+385 95 208 7321)
- **Lokacije:**
  - `/components/TermsOfUse.tsx` - ✅ Zamijenjeno
  - `/components/MondoFooter.tsx` - ✅ Već postojalo

---

### **5. Adresa tvrtke**
- ✅ `[ADRESA TVRTKE]` → **Lucinici 17, 51216 Marinici**
- **Lokacije:**
  - `/components/PrivacyPolicy.tsx` - ✅ Zamijenjeno
  - `/components/MondoFooter.tsx` - ✅ Dodano

---

### **6. Data Protection Officer**
- ✅ `[IME I EMAIL]` → **Vladimir Perić - info@mondo-acqua.hr**
- **Lokacije:**
  - `/components/PrivacyPolicy.tsx` - ✅ Zamijenjeno

---

## ✅ Dodatne izmjene:

### **MondoFooter.tsx:**
- ✅ Dodano `useNavigate` import
- ✅ Dodani onClick eventi za "Pravila privatnosti" i "Uvjeti korištenja" buttone
- ✅ Dodana puna adresa umjesto samo "Hrvatska"
- ✅ Copyright ažuriran sa punim imenom vlasnika

---

## 🎯 Checklist - Sve gotovo! ✅

- [x] `[IME VLASNIKA/TVRTKE]` zamijenjeno svugdje
- [x] `[VAŠA EMAIL ADRESA]` zamijenjeno svugdje  
- [x] `[VAS WEB]` zamijenjeno
- [x] `[VAS TELEFON]` zamijenjeno
- [x] `[ADRESA TVRTKE]` dodana u Privacy Policy i MondoFooter
- [x] `[IME I EMAIL]` DPO zamijenjeno
- [x] MondoFooter linkovi aktivirani (navigacija radi)
- [x] Copyright ažuriran sa punim imenom

---

## 🔍 Kako provjeriti:

```bash
# Pokreni pretragu - NE bi trebalo biti rezultata!
grep -r "\\[IME VLASNIKA" components/
grep -r "\\[VAŠA EMAIL" components/
grep -r "\\[VAS WEB\\]" components/
grep -r "\\[VAS TELEFON\\]" components/
grep -r "\\[ADRESA TVRTKE\\]" components/
grep -r "\\[IME I EMAIL\\]" components/
```

**Rezultat:** Sve pretrage bi trebale vratiti 0 rezultata! ✅

---

## 📱 Test u aplikaciji:

### **Professional Mode (`/app`):**
1. ✅ Idi na `/app/more`
2. ✅ Skrolaj dolje → provjeri footer: "© 2025 Vladimir Perić - Mondo Acqua d.o.o."
3. ✅ Klikni "Uvjeti korištenja" → sve podatke provjeri
4. ✅ Klikni "Politika privatnosti" → sve podatke provjeri

### **Owner Mode (`/owner`):**
1. ✅ Idi na `/owner`
2. ✅ Skrolaj dolje → provjeri MondoFooter
3. ✅ Provjeri punu adresu: "Lucinici 17, 51216 Marinici, Hrvatska"
4. ✅ Klikni "Pravila privatnosti" button → trebao bi otvoriti `/privacy-policy`
5. ✅ Klikni "Uvjeti korištenja" button → trebao bi otvoriti `/terms-of-use`

---

## ✅ STATUS: GOTOVO!

**Sve placeholder vrijednosti su zamijenjene sa stvarnim podacima.**  
**Aplikacija je spremna za produkciju u pogledu pravne zaštite i kontakt podataka.**

---

**Verzija:** 2.0 - FINALNA  
**Datum:** 20. veljače 2025.  
**Ažurirano od strane:** AI Asistent