// Svaki ponedjeljak u 6:17 po hrvatskom vremenu (5:17 UTC zimi): usporedba naših cijena s cjenikom dobavljača.
import { pokreniProvjeru } from '../lib/provjera-cijena.mts';
export default async () => { await pokreniProvjeru(); };
export const config = { schedule: '17 5 * * 1' };
