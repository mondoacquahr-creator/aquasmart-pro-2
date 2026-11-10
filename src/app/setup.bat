@echo off
REM AquaSmart Pro - Automatski Deployment Setup Script
REM Za Windows korisnike
REM (c) 2026 Mondo Acqua d.o.o.

color 0B
cls

echo ================================================================
echo.
echo          AQUASMART PRO - DEPLOYMENT SETUP
echo.
echo                    Mondo Acqua d.o.o.
echo.
echo ================================================================
echo.

REM 1. PROVJERA DEPENDENCIJA
echo ================================================================
echo KORAK 1/6: Provjera dependencija...
echo ================================================================
echo.

REM Provjera Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Node.js nije instaliran!
    echo.
    echo Preuzmi i instaliraj: https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js instaliran: %NODE_VERSION%
)

REM Provjera npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] npm nije instaliran!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [OK] npm instaliran: v%NPM_VERSION%
)

REM Provjera Git
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Git nije instaliran!
    echo.
    echo Preuzmi i instaliraj: https://git-scm.com/download/win
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
    echo [OK] Git instaliran: %GIT_VERSION%
)

echo.
echo [OK] Sve dependencije instalirane!
echo.
timeout /t 2 >nul

REM 2. INSTALACIJA NPM PAKETA
echo ================================================================
echo KORAK 2/6: Instalacija npm paketa...
echo ================================================================
echo.

if exist package.json (
    echo Instaliram pakete... ^(ovo moze trajati 1-2 minute^)
    echo.
    call npm install
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [OK] Svi paketi uspjesno instalirani!
    ) else (
        echo.
        echo [X] Greska pri instalaciji paketa!
        echo Pokusaj rucno: npm install
        pause
        exit /b 1
    )
) else (
    echo [X] package.json ne postoji!
    echo Jesi li u pravom folderu?
    pause
    exit /b 1
)

echo.
timeout /t 2 >nul

REM 3. TEST BUILD
echo ================================================================
echo KORAK 3/6: Test build...
echo ================================================================
echo.

echo Testiram build... ^(ovo moze trajati 30-60 sekundi^)
echo.
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Build uspjesan!
) else (
    echo.
    echo [X] Build neuspjesan!
    echo Provjeri TypeScript greske i pokusaj ponovno.
    pause
    exit /b 1
)

echo.
timeout /t 2 >nul

REM 4. GIT INICIJALIZACIJA
echo ================================================================
echo KORAK 4/6: Git inicijalizacija...
echo ================================================================
echo.

REM Provjeri je li vec Git repo
if exist .git\ (
    echo Git repo vec postoji. Preskacemo inicijalizaciju.
) else (
    git init
    echo [OK] Git repo inicijaliziran!
)

REM Git config
echo.
echo Konfiguriram Git...
echo.
set /p GIT_NAME="Tvoje ime za Git commits (npr. Ivan Horvat): "
set /p GIT_EMAIL="Tvoj email za Git commits: "

git config user.name "%GIT_NAME%"
git config user.email "%GIT_EMAIL%"

echo.
echo [OK] Git konfiguriran!
echo.
timeout /t 2 >nul

REM 5. PRVI COMMIT
echo ================================================================
echo KORAK 5/6: Kreiranje prvog commita...
echo ================================================================
echo.

git add .
git commit -m "Initial commit - AquaSmart Pro production ready"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Prvi commit kreiran!
) else (
    echo.
    echo [!] Commit vec postoji ili nema promjena.
)

REM Rename branch to main
git branch -M main

echo.
timeout /t 2 >nul

REM 6. GITHUB PUSH
echo ================================================================
echo KORAK 6/6: GitHub push...
echo ================================================================
echo.

echo --------------------------------------------------------
echo  VAZNO: Najprije kreiraj GitHub repository!
echo.
echo  1. Otvori: https://github.com/new
echo  2. Repository name: aquasmart-pro
echo  3. Private: [X] (OBAVEZNO!)
echo  4. NEMOJ oznaciti: README, .gitignore, license
echo  5. Create repository
echo --------------------------------------------------------
echo.

set /p GITHUB_USERNAME="Tvoj GitHub username: "

REM Dodaj remote origin
git remote remove origin 2>nul
git remote add origin "https://github.com/%GITHUB_USERNAME%/aquasmart-pro.git"

echo.
echo Pushaj kod na GitHub...
echo (Morat ces unijeti GitHub username i Personal Access Token)
echo.
echo NAPOMENA: GitHub NE prihvaca obicne passworde!
echo.
echo Ako nemas Personal Access Token:
echo 1. Otvori: https://github.com/settings/tokens/new
echo 2. Note: AquaSmart Deployment
echo 3. Expiration: No expiration
echo 4. Scopes: [X] repo (full control)
echo 5. Generate token
echo 6. KOPIRAJ TOKEN (vidjet ces ga samo jednom!)
echo 7. Koristi token kao PASSWORD
echo.
pause

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Kod uspjesno pushat na GitHub!
) else (
    echo.
    echo [X] Git push neuspjesan!
    echo Provjeri jesu li credentials tocni i pokusaj rucno:
    echo   git push -u origin main
    pause
    exit /b 1
)

echo.
timeout /t 2 >nul

REM GOTOVO!
cls
color 0A
echo ================================================================
echo.
echo              DEPLOYMENT SETUP USPJESAN!
echo.
echo ================================================================
echo.
echo ================================================================
echo SLJEDECI KORAK: DEPLOY NA VERCEL
echo ================================================================
echo.
echo 1. Otvori: https://vercel.com/new
echo 2. Import repository: aquasmart-pro
echo 3. Framework: Vite (auto-detect)
echo 4. Klikni: Deploy
echo 5. Cekaj 2 min...
echo 6. [OK] Gotovo! Dobivas production URL
echo.
echo ================================================================
echo.
echo GitHub repo: https://github.com/%GITHUB_USERNAME%/aquasmart-pro
echo.
echo Za buduce promjene:
echo   git add .
echo   git commit -m "Opis promjene"
echo   git push
echo.
echo Vercel ce automatski deployati svaki git push!
echo.
echo SRETNO!
echo.
pause
