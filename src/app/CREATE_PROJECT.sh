#!/bin/bash

# AquaSmart Pro - Automatic Project Setup Script
# Run this to create the complete project structure

echo "🚀 Creating AquaSmart Pro project..."

# Create project directory
PROJECT_NAME="aquasmart-pro"
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

echo "📁 Creating folder structure..."

# Create directories
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/styles
mkdir -p public

echo "📝 Creating package.json..."

cat > package.json << 'EOF'
{
  "name": "aquasmart-pro",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router": "^7.1.1",
    "lucide-react": "^0.468.0",
    "motion": "^11.15.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.2",
    "vite": "^6.0.5",
    "tailwindcss": "^4.0.0"
  }
}
EOF

echo "⚙️ Creating config files..."

cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
})
EOF

cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
EOF

cat > index.html << 'EOF'
<!doctype html>
<html lang="hr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icon-192.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0EA5E9" />
    <meta name="description" content="AquaSmart Pro - Profesionalna analiza bazenske vode" />
    <link rel="manifest" href="/manifest.json" />
    <title>AquaSmart Pro</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

cat > .gitignore << 'EOF'
# Logs
logs
*.log
npm-debug.log*

# Dependencies
node_modules/

# Build
dist/
dist-ssr/
*.local

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF

echo "📄 Creating README..."

cat > README.md << 'EOF'
# 🏊 AquaSmart Pro

Profesionalna analiza bazenske vode sa Ivero proizvodima.

## Quick Start

```bash
npm install
npm run dev
```

## Deploy

```bash
npm install -g vercel
vercel
```

Otvori na mobitelu → "Add to Home Screen"
EOF

echo ""
echo "✅ Project structure created!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Copy source files to src/ folder:"
echo "   - All .tsx files from components/"
echo "   - lib/storage.ts and lib/dosing-engine.ts"
echo "   - types/index.ts"
echo "   - styles/globals.css"
echo "   - main.tsx, App.tsx, routes.ts"
echo ""
echo "2. Copy public files:"
echo "   - manifest.json"
echo "   - icon-192.png, icon-512.png"
echo "   - service-worker.js"
echo ""
echo "3. Install and run:"
echo "   cd $PROJECT_NAME"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "🚀 Done!"
