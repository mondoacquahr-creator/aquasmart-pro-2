# 📱 Testiraj App na Mobitelu - 3 Načina

## 🚀 NAČIN 1: PWA Install (Najbrže - 5 min)

### Korak 1: Deploy na Vercel (Besplatno)

```bash
# Install Vercel CLI
npm install -g vercel

# U APP_SOURCE folderu:
vercel

# Slijedi promptove:
# → Set up and deploy? Yes
# → Which scope? Your account
# → Link to existing project? No
# → Project name? aquasmart-pro
# → Directory? ./
# → Override settings? No

# Deploy!
```

**Dobit ćete URL:** `https://aquasmart-pro-xyz.vercel.app`

### Korak 2: Otvori na Mobitelu

1. **Otvorite Chrome/Safari na mobitelu**
2. **Idite na:** `https://aquasmart-pro-xyz.vercel.app`
3. **App radi! ✅**

### Korak 3: Instaliraj kao App

**Android (Chrome):**
```
1. Otvori site u Chrome
2. Klikni na ⋮ (3 dots) gore desno
3. "Add to Home screen"
4. Klikni "Install"
5. App je sada na Home screen-u! 🎉
```

**iPhone (Safari):**
```
1. Otvori site u Safari
2. Klikni Share button (□↑)
3. Scroll i klikni "Add to Home Screen"
4. Klikni "Add"
5. App je sada na Home screen-u! 🎉
```

**Rezultat:**
- ✅ Puni ekran (bez browser UI)
- ✅ App ikona na home screen
- ✅ Offline funkcionalnost
- ✅ Kao native app!

---

## 🔧 NAČIN 2: Local Network Testing (Odmah, bez deploya)

### Korak 1: Start Dev Server sa Network Access

```bash
# U APP_SOURCE folderu:
npm run dev -- --host

# Output:
# ➜  Local:   http://localhost:5173/
# ➜  Network: http://192.168.1.50:5173/  ← KLJUČNO!
```

### Korak 2: Otvori na Mobitelu

1. **Provjeri da su PC i mobitel na istom WiFi-u**
2. **Na mobitelu otvori browser**
3. **Upišite Network URL:** `http://192.168.1.50:5173`
4. **App radi!** ✅

**Prednosti:**
- ✅ Real-time development
- ✅ Promjene se odmah vide
- ✅ Bez deploya

**Mane:**
- ❌ Samo dok dev server radi
- ❌ Mora biti isti WiFi
- ❌ Nema PWA install

---

## 🌐 NAČIN 3: Ngrok Tunnel (Za remote testing)

### Korak 1: Install Ngrok

```bash
# Download: https://ngrok.com/download
# Ili sa npm:
npm install -g ngrok

# Sign up na https://ngrok.com (besplatno)
# Copy auth token
ngrok authtoken YOUR_AUTH_TOKEN
```

### Korak 2: Start Tunnel

```bash
# U jednom terminalu:
npm run dev

# U drugom terminalu:
ngrok http 5173

# Output:
# Forwarding  https://abc123.ngrok.io -> http://localhost:5173
```

### Korak 3: Otvori na Mobitelu

1. **Kopiraj ngrok URL:** `https://abc123.ngrok.io`
2. **Otvori na bilo kojem mobitelu (bilo gdje u svijetu!)**
3. **App radi!** ✅

**Prednosti:**
- ✅ Radi sa bilo kojeg uređaja
- ✅ Ne mora biti isti WiFi
- ✅ Možete dijeliti link prijateljima za testing
- ✅ HTTPS (PWA install će raditi!)

**Mane:**
- ❌ Zahtijeva ngrok account
- ❌ Free tier ima limite

---

## 🤖 NAČIN 4: Build APK (Pravi Android App)

### Prerequisites:
```bash
# Android Studio instaliran
# Bubblewrap instaliran
npm install -g @bubblewrap/cli
```

### Korak 1: Deploy Web App

Prvo morate deploy-ati web app (Način 1 gore).

### Korak 2: Init Bubblewrap

```bash
# Kreirajte novi folder:
mkdir android-build
cd android-build

# Init TWA:
bubblewrap init --manifest https://aquasmart-pro-xyz.vercel.app/manifest.json

# Odgovorite na pitanja:
Domain: aquasmart-pro-xyz.vercel.app
Name: AquaSmart Pro
Package: com.aquasmart.pro
```

### Korak 3: Build APK (Debug - za testiranje)

```bash
# Build debug APK (ne treba keystore):
bubblewrap build --skipPwaValidation

# Output:
# ✓ APK built: app-debug.apk
```

### Korak 4: Install na Mobitel

**Način A - USB Cable:**
```bash
# Enable USB debugging na mobitelu:
# Settings → About phone → Tap "Build number" 7x
# Settings → Developer options → USB debugging ON

# Connect USB cable
# U terminalu:
adb install app-debug.apk

# App instaliran! ✅
```

**Način B - File Transfer:**
```bash
# Kopiraj app-debug.apk na mobitel (USB, Email, Drive)
# Na mobitelu:
# 1. Otvori Files app
# 2. Klikni na app-debug.apk
# 3. "Install" (možda treba dozvoliti "Unknown sources")
# 4. App instaliran! ✅
```

---

## ⚡ QUICK COMPARISON

| Način | Brzina | Setup | Offline | Native Look | Update |
|-------|--------|-------|---------|-------------|--------|
| **PWA (Vercel)** | ⚡⚡⚡ | 5 min | ✅ | ✅ | Auto |
| **Local Network** | ⚡⚡⚡ | 1 min | ❌ | ❌ | Instant |
| **Ngrok** | ⚡⚡ | 10 min | ❌ | ❌ | Instant |
| **APK Build** | ⚡ | 30 min | ✅ | ✅✅ | Manual |

---

## 🎯 PREPORUČENI WORKFLOW

### Za Development & Testing:
```
1. Koristite Local Network (--host)
   → Brze promjene, instant reload

2. Povremeno test sa PWA (Vercel)
   → Provjeri real-world experience
```

### Za Dijeljenje s Klijentima:
```
1. Deploy na Vercel
   → Stable URL, lako dijeliti
   → PWA install opcija
```

### Za Final Testing prije Play Store:
```
1. Build APK sa Bubblewrap
   → Test exact Play Store experience
   → Test na različitim Android devices
```

---

## 🐛 Troubleshooting

### "Add to Home Screen" ne pokazuje se:

**Android:**
- Provjeri da je HTTPS (Vercel uvijek je)
- Provjeri manifest.json dostupan
- Clear cache i refresh

**iOS:**
- Mora biti Safari browser
- Mora biti HTTPS
- iOS PWA je limitiran (no service worker background)

### Local Network ne radi:

```bash
# Provjeri IP:
# Windows: ipconfig
# Mac/Linux: ifconfig

# Provjeri firewall:
# Možda blokira port 5173
```

### Ngrok limit reached:

```
Free tier: 40 requests/min
Solution: Sign up za besplatni account (više limita)
Ili: Koristite Vercel deploy
```

### APK won't install:

```
Settings → Security → Unknown sources → Enable
Ili
Settings → Apps → Special access → Install unknown apps → Enable for Files/Chrome
```

---

## 📱 iOS Napomena

iOS ima **ograničenja** za PWA:
- ❌ No push notifications
- ❌ No background sync
- ❌ Limited storage
- ✅ Ali app idalje radi odlično!

Za full iOS experience, trebali bi:
1. Build React Native verziju, ili
2. Use Capacitor (hybrid app)

Ali za v1, PWA je dovoljno! ✅

---

## 🎉 Success Checklist

```
PWA Install Test:
[ ] Deploy na Vercel
[ ] Otvori na mobitelu
[ ] "Add to Home Screen" radi
[ ] App ikona na home screen
[ ] App se otvara puni ekran
[ ] Offline mode radi (airplane mode test)

Local Testing:
[ ] npm run dev --host radi
[ ] Mobitel vidi app na local IP
[ ] Hot reload radi

APK Test (optional):
[ ] Bubblewrap build uspješan
[ ] APK instalira na device
[ ] App radi kao native
[ ] Svi featuri funkcionalni
```

---

## 🚀 Next Steps

Nakon što testirate:

1. **Feedback Loop:**
   ```
   Test na mobitelu → Note bugs/UX issues → Fix → Re-deploy → Test again
   ```

2. **Share sa drugima:**
   ```
   Vercel link → Šalji prijateljima/beta testerima
   Ngrok link → Temporary share (expires)
   APK file → Email/Drive share
   ```

3. **Prepare for Production:**
   ```
   Kad sve radi perfect → Build production APK → Submit to Play Store
   ```

---

**Preporuka:** Start sa **Način 1 (PWA)** - najbrže i najlakše! 🚀
