import { SHOP_PRODUCTS } from './src/app/lib/shopCatalog'
import { merchantAssets } from './scripts/merchant-feed.mjs'
import { buildCjenikRows } from './scripts/cjenik-data.mjs'
import fs from 'fs'
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    {
      name: 'google-merchant-catalog',
      generateBundle() {
        // Podaci za javni cjenik (Netlify funkcija cjenik)
        fs.writeFileSync(path.resolve(__dirname, 'netlify/functions/cjenik-data.json'), JSON.stringify(buildCjenikRows(SHOP_PRODUCTS, path.resolve(__dirname, 'public/mondo-web/index.html'))));
        for (const asset of merchantAssets(SHOP_PRODUCTS)) {
          this.emitFile({ type: 'asset', ...asset });
        }
      },
    },
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/app'),
      'sonner@2.0.3': 'sonner',
      'react-hook-form@7.55.0': 'react-hook-form',
    },
  },
})
