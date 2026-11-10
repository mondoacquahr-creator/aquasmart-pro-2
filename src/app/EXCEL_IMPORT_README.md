# 📊 Excel Import Klijenata - Dokumentacija

## Pregled

Funkcionalnost za masovni uvoz klijenata i njihovih bazena iz Excel (.xlsx/.xls) datoteke.

---

## 📍 Lokacija u Aplikaciji

**Navigacija:** Više → Upravljanje Podacima → **Import Klijenata**

---

## 📋 Format Excel Datoteke

### Obvezni stupci:

| Stupac | Tip | Primjer | Napomena |
|--------|-----|---------|----------|
| **Ime** | Tekst | Marko | Obvezno |
| **Prezime** | Tekst | Marković | Obvezno |
| **Adresa** | Tekst | Ilica 123, Zagreb | Preporučeno |
| **Mobitel** | Tekst | +385 91 234 5678 | Obvezno |
| **Lokacija** | GPS | 45.8150,15.9819 | Format: latitude,longitude |
| **Dimenzije** | Tekst | 8x4x1.5 | Format: dužina x širina x dubina (m) |
| **Zapremina** | Broj | 48 | Broj u m³ (obvezno) |

---

## 🎯 Kako koristiti?

### 1️⃣ Preuzmi predložak
- Klikni "**Preuzmi Excel predložak**"
- Dobiti ćeš `AquaSmart_Template.xlsx` sa primjerima

### 2️⃣ Ispuni podatke
- Otvori datoteku u Excel/Google Sheets/LibreOffice
- Popuni redove sa podacima klijenata
- **NAPOMENA:** Prvi red je header (nazivi stupaca), ne brisati!

### 3️⃣ Upload datoteke
- Klikni upload area ili povuci datoteku
- Aplikacija automatski parsira podatke

### 4️⃣ Pregled i validacija
- Vidi **preview tablicu** sa svim podacima
- Zelena kvačica ✅ = valjani podaci
- Crveni upozorenja ⚠️ = greške

### 5️⃣ Import
- Klikni "**Uvezi X klijenata**"
- Samo valjani redovi će biti uvezeni
- Redovi sa greškama će biti preskočeni

---

## 📊 Primjer Excel Datoteke

```
| Ime    | Prezime  | Adresa              | Mobitel           | Lokacija         | Dimenzije | Zapremina |
|--------|----------|---------------------|-------------------|------------------|-----------|-----------|
| Marko  | Marković | Ilica 123, Zagreb   | +385 91 234 5678  | 45.8150,15.9819  | 8x4x1.5   | 48        |
| Ana    | Anić     | Obala 45, Split     | +385 92 345 6789  | 43.5081,16.4402  | 10x5x1.8  | 90        |
| Ivana  | Horvat   | Trg 7, Rijeka       | +385 93 456 7890  | 45.3271,14.4422  | 6x3x1.2   | 21.6      |
```

---

## ✅ Validacije

Aplikacija provjerava:

1. **Ime i Prezime** - moraju biti popunjeni
2. **Mobitel** - mora biti popunjen
3. **Zapremina** - mora biti broj (ne tekst)
4. **Lokacija** - format lat,lng (opciono, ali preporučeno)

---

## 🔄 Što se dogodi nakon importa?

Za svaki valjani red:
1. Kreira se **Client** objekt sa osobnim podacima
2. Kreira se **Pool** objekt sa dimenzijama bazena
3. Pool se automatski povezuje sa klijentom
4. GPS lokacija se sprema (ako je dostupna)

---

## 🎨 Tehnički Detalji

### Komponenta
- **Putanja:** `/components/ClientImport.tsx`
- **Route:** `/client-import`

### Dependencies
- `xlsx` - Excel parsiranje

### Storage
- Koristi `storage.saveClient()` i `storage.savePool()`
- Kompatibilno sa postojećim Client/Pool tipovima

---

## 🚀 Testiranje

**Test Case 1: Uspješan import**
```bash
1. Preuzmi template
2. Popuni 3 reda sa validnim podacima
3. Upload → Trebalo bi prikazati "3 valjana unosa"
4. Import → Success ekran sa "Uvezeno 3 klijenta"
```

**Test Case 2: Parcijalni import (sa greškama)**
```bash
1. Kreiraj Excel sa 5 redova
2. U 2 reda ostavi prazno "Ime"
3. Upload → "3 valjana, 2 greške"
4. Import → Uvozi samo 3 valjana
```

**Test Case 3: GPS lokacija**
```bash
1. Dodaj validne GPS koordinate
2. Import
3. Otvori bazen → Trebalo bi vidjeti lokaciju na mapi
```

---

## 💡 Tips

- **Veliki uvoz:** Preporučeno do 100 klijenata odjednom
- **GPS:** Možeš koristiti Google Maps (klikni na lokaciju, kopiraj koordinate)
- **Dimenzije:** Format je fleksibilan (8x4x1.5 ili 8 x 4 x 1.5)
- **Backup:** Prije velikog importa, exportaj postojeće podatke (Postavke → Izvezi podatke)

---

## 🐛 Troubleshooting

**Problem:** "Greška pri čitanju datoteke"
- **Rješenje:** Provjeri da je datoteka .xlsx ili .xls format

**Problem:** Svi redovi imaju greške
- **Rješenje:** Provjeri nazive stupaca (mora biti točno: Ime, Prezime, itd.)

**Problem:** GPS lokacija ne radi
- **Rješenje:** Provjeri format (lat,lng BEZ razmaka)

---

## 📞 Podrška

Za dodatnu pomoć: **Više → Pomoć i podrška**
