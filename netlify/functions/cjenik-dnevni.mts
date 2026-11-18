// Svaki dan u 6:00 po hrvatskom vremenu (5:00 UTC zimi) sprema dnevni cjenik u arhivu – prije roka od 8:00.
import { snapshot } from '../lib/cjenik.mts';
export default async () => { await snapshot(); };
export const config = { schedule: '0 4 * * *' };
