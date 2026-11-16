// Spa i hidromasažne kade – AstralPool SPA Collection (dobavljač Flusso grupa).
// Prodajna cijena = veleprodajna cijena dobavljača (V.P.C., bez PDV-a) s 25 % PDV-a, kao i ostatak webshopa.
// Fotografije: astralpool.com (AstralPool SPA Collection).
export interface SpaProduct { id: string; name: string; size: string; priceEUR: number; category: string; description: string; imageUrl: string; }

export const SPA_CATEGORY = 'Spa i hidromasažne kade';
const IMG = 'https://asset.productmarketingcloud.com/api/assetstorage/3096_';

// [id, naziv, pakiranje, V.P.C. bez PDV-a, slika, opis]
const ROWS: [string, string, string, number, string, string][] = [
  ['spa-klor-granulat', 'Astral Spa klor granulat', '1 kg', 12.01, '717c95b0-1f8e-482d-896b-62748169f82d', 'Dezinfekcija vode u spa i hidromasažnim kadama'],
  ['spa-brom-tablete', 'Astral Spa brom tablete', '1 kg', 34.40, '9f9ad926-2383-49ee-9204-3c19afd89242', 'Dezinfekcija bromom – stabilan i pri visokoj temperaturi vode'],
  ['spa-ph-minus', 'Astral Spa pH minus', '1 kom', 7.46, '50f6be13-2dc3-4051-99cd-63a011aaf581', 'Snižava pH kad je iznad 7,6'],
  ['spa-stabilizator-tvrdoce', 'Astral Spa stabilizator tvrdoće', '1 kg', 10.43, 'c62fb359-bb2a-4989-9331-7ddf518e10a3', 'Sprječava kamenac na stijenkama i u instalaciji'],
  ['spa-bistrilo', 'Astral Spa bistrilo', '1 L', 9.52, 'd38fb15d-4275-4b5a-bf71-d03f4c9e8f84', 'Uklanja zamućenje, voda ostaje kristalno bistra'],
  ['spa-anti-foam', 'Astral Spa anti foam', '1 L', 16.07, '3ac841bf-8312-4062-8bb3-0b953e5764ac', 'Brzo uklanja i sprječava pjenu'],
  ['spa-cistac-povrsine', 'Astral Spa čistač površine', '1 L', 10.89, '2642aa80-a86c-47d1-a870-e1f8d244f299', 'Čisti rub i stijenke kade bez oštećenja akrila'],
  ['spa-cistac-filtera', 'Astral Spa čistač filtera', '1 L', 12.67, 'f615280c-144f-4d0b-a14e-0952f3c1315e', 'Čisti filterske uloške od masnoće i kamenca'],
  ['spa-cistac-cjevovoda', 'Astral Spa čistač cjevovoda', '1 L', 11.83, '5bfcd28a-99dd-4b38-8937-db39dcd5ef1a', 'Uklanja biofilm iz cijevi i mlaznica prije zamjene vode'],
];

export const SPA_PRODUCTS: SpaProduct[] = ROWS.map(([id, name, size, net, img, description]) => ({
  id, name, size, description, category: SPA_CATEGORY,
  priceEUR: Math.round(net * 1.25 * 100) / 100,
  imageUrl: IMG + img + '/Mobile',
}));
