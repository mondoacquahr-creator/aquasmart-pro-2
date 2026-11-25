import { SHOP_PRODUCTS } from './src/app/lib/shopCatalog'
import { merchantAssets } from './scripts/merchant-feed.mjs'
import { buildCjenikRows } from './scripts/cjenik-data.mjs'
import { mondoWebPages } from './scripts/mondo-web-pages.mjs'
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
      async generateBundle() {
        // Ivero slike: kopija na naš poslužitelj (/proizvodi-slike/<id>.<ext>). Uspješno preuzete slike čuvaju se i u
        // node_modules/.cache (Netlify ga čuva između objava), pa privremeni pad izvora ne briše slike sa stranice.
        const cacheDir = path.resolve(__dirname, 'node_modules/.cache/proizvodi-slike');
        fs.mkdirSync(cacheDir, { recursive: true });
        const todo = SHOP_PRODUCTS.filter((p) => p.sourceImageUrl && p.imageUrl?.startsWith('/proizvodi-slike/'));
        let fetched = 0, cached = 0, missing = 0;
        await Promise.all(todo.map(async (p) => {
          const fileName = p.imageUrl!.slice(1);
          const cacheFile = path.join(cacheDir, path.basename(fileName));
          let data: Buffer | null = null;
          try {
            const res = await fetch(p.sourceImageUrl!, { signal: AbortSignal.timeout(20000) });
            const type = res.headers.get('content-type') || '';
            if (res.ok && type.startsWith('image/')) {
              data = Buffer.from(await res.arrayBuffer());
              fs.writeFileSync(cacheFile, data);
              fetched++;
            }
          } catch { /* izvor nedostupan */ }
          if (!data && fs.existsSync(cacheFile)) { data = fs.readFileSync(cacheFile); cached++; }
          if (data) this.emitFile({ type: 'asset', fileName, source: data });
          else missing++;
        }));
        console.log(`[proizvodi-slike] preuzeto ${fetched}, iz predmemorije ${cached}, nedostaje ${missing} (prikaz koristi izvornu sliku)`);

        // Podaci za javni cjenik (Netlify funkcija cjenik)
        fs.writeFileSync(path.resolve(__dirname, 'netlify/functions/cjenik-data.json'), JSON.stringify(buildCjenikRows(SHOP_PRODUCTS, path.resolve(__dirname, 'public/mondo-web/index.html'))));
        // Glavni web: zasebna kopija za svaku podstranicu s vlastitim naslovom i opisom (scripts/mondo-web-pages.mjs)
        for (const page of mondoWebPages(fs.readFileSync(path.resolve(__dirname, 'public/mondo-web/index.html'), 'utf8'))) {
          this.emitFile({ type: 'asset', ...page });
        }
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
