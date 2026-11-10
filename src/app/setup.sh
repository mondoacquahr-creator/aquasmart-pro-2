#!/bin/bash

# AquaSmart Pro - Automatski Deployment Setup Script
# Za Mac/Linux korisnike
# © 2026 Mondo Acqua d.o.o.

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║          🌊 AQUASMART PRO - DEPLOYMENT SETUP 🌊           ║"
echo "║                                                            ║"
echo "║                    Mondo Acqua d.o.o.                      ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Boje za output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. PROVJERA DEPENDENCIJA
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}KORAK 1/6: Provjera dependencija...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Provjera Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js nije instaliran!${NC}"
    echo -e "${YELLOW}Preuzmi i instaliraj: https://nodejs.org/${NC}"
    exit 1
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js instaliran: $NODE_VERSION${NC}"
fi

# Provjera npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm nije instaliran!${NC}"
    exit 1
else
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm instaliran: v$NPM_VERSION${NC}"
fi

# Provjera Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git nije instaliran!${NC}"
    echo -e "${YELLOW}Instaliraj Git:${NC}"
    echo "  Mac:   brew install git"
    echo "  Linux: sudo apt-get install git"
    exit 1
else
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✅ Git instaliran: $GIT_VERSION${NC}"
fi

echo ""
echo -e "${GREEN}✅ Sve dependencije instalirane!${NC}"
echo ""
sleep 2

# 2. INSTALACIJA NPM PAKETA
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}KORAK 2/6: Instalacija npm paketa...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -f "package.json" ]; then
    echo -e "${YELLOW}Instaliram pakete... (ovo može trajati 1-2 minute)${NC}"
    npm install
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Svi paketi uspješno instalirani!${NC}"
    else
        echo ""
        echo -e "${RED}❌ Greška pri instalaciji paketa!${NC}"
        echo -e "${YELLOW}Pokušaj ručno: npm install${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ package.json ne postoji!${NC}"
    echo -e "${YELLOW}Jesi li u pravom folderu?${NC}"
    exit 1
fi

echo ""
sleep 2

# 3. TEST BUILD
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}KORAK 3/6: Test build...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}Testiram build... (ovo može trajati 30-60 sekundi)${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Build uspješan!${NC}"
else
    echo ""
    echo -e "${RED}❌ Build neuspješan!${NC}"
    echo -e "${YELLOW}Provjeri TypeScript greške i pokušaj ponovno.${NC}"
    exit 1
fi

echo ""
sleep 2

# 4. GIT INICIJALIZACIJA
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}KORAK 4/6: Git inicijalizacija...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Provjeri je li već Git repo
if [ -d ".git" ]; then
    echo -e "${YELLOW}Git repo već postoji. Preskačem inicijalizaciju.${NC}"
else
    git init
    echo -e "${GREEN}✅ Git repo inicijaliziran!${NC}"
fi

# Git config
echo ""
echo -e "${YELLOW}Konfiguriram Git...${NC}"
read -p "Tvoje ime za Git commits (npr. Ivan Horvat): " GIT_NAME
read -p "Tvoj email za Git commits: " GIT_EMAIL

git config user.name "$GIT_NAME"
git config user.email "$GIT_EMAIL"

echo -e "${GREEN}✅ Git konfiguriran!${NC}"
echo ""
sleep 2

# 5. PRVI COMMIT
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}KORAK 5/6: Kreiranje prvog commita...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

git add .
git commit -m "Initial commit - AquaSmart Pro production ready"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Prvi commit kreiran!${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Commit već postoji ili nema promjena.${NC}"
fi

# Rename branch to main
git branch -M main

echo ""
sleep 2

# 6. GITHUB PUSH
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}KORAK 6/6: GitHub push...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}┌─────────────────────────────────────────────────────┐${NC}"
echo -e "${YELLOW}│ VAŽNO: Najprije kreiraj GitHub repository!          │${NC}"
echo -e "${YELLOW}│                                                     │${NC}"
echo -e "${YELLOW}│ 1. Otvori: https://github.com/new                  │${NC}"
echo -e "${YELLOW}│ 2. Repository name: aquasmart-pro                  │${NC}"
echo -e "${YELLOW}│ 3. Private: ✅ (OBAVEZNO!)                          │${NC}"
echo -e "${YELLOW}│ 4. NEMOJ označiti: README, .gitignore, license     │${NC}"
echo -e "${YELLOW}│ 5. Create repository                                │${NC}"
echo -e "${YELLOW}└─────────────────────────────────────────────────────┘${NC}"
echo ""

read -p "Tvoj GitHub username: " GITHUB_USERNAME

# Dodaj remote origin
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$GITHUB_USERNAME/aquasmart-pro.git"

echo ""
echo -e "${YELLOW}Pushaj kod na GitHub...${NC}"
echo -e "${YELLOW}(Morat ćeš unijeti GitHub username i Personal Access Token)${NC}"
echo ""
echo -e "${YELLOW}NAPOMENA: GitHub NE prihvaća obične passworde!${NC}"
echo -e "${YELLOW}Ako nemaš Personal Access Token:${NC}"
echo -e "${YELLOW}1. Otvori: https://github.com/settings/tokens/new${NC}"
echo -e "${YELLOW}2. Note: AquaSmart Deployment${NC}"
echo -e "${YELLOW}3. Expiration: No expiration${NC}"
echo -e "${YELLOW}4. Scopes: ✅ repo (full control)${NC}"
echo -e "${YELLOW}5. Generate token${NC}"
echo -e "${YELLOW}6. KOPIRAJ TOKEN (vidjet ćeš ga samo jednom!)${NC}"
echo -e "${YELLOW}7. Koristi token kao PASSWORD${NC}"
echo ""

read -p "Pritisni Enter kada si spreman..." DUMMY

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Kod uspješno pushat na GitHub!${NC}"
else
    echo ""
    echo -e "${RED}❌ Git push neuspješan!${NC}"
    echo -e "${YELLOW}Provjeri jesu li credentials točni i pokušaj ručno:${NC}"
    echo "  git push -u origin main"
    exit 1
fi

echo ""
sleep 2

# GOTOVO!
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║              ✅ DEPLOYMENT SETUP USPJEŠAN! ✅              ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SLJEDEĆI KORAK: DEPLOY NA VERCEL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}1. Otvori:${NC} https://vercel.com/new"
echo -e "${YELLOW}2. Import repository:${NC} aquasmart-pro"
echo -e "${YELLOW}3. Framework:${NC} Vite (auto-detect)"
echo -e "${YELLOW}4. Klikni:${NC} Deploy"
echo -e "${YELLOW}5. Čekaj 2 min...${NC}"
echo -e "${GREEN}6. ✅ Gotovo! Dobivaš production URL${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}GitHub repo:${NC} https://github.com/$GITHUB_USERNAME/aquasmart-pro"
echo ""
echo -e "${YELLOW}Za buduće promjene:${NC}"
echo "  git add ."
echo "  git commit -m \"Opis promjene\""
echo "  git push"
echo ""
echo -e "${GREEN}Vercel će automatski deployati svaki git push! 🚀${NC}"
echo ""
echo -e "${BLUE}SRETNO! 🌊${NC}"
echo ""
