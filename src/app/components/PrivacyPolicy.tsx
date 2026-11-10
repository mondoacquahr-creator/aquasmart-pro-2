import { GlassCard } from './GlassCard';
import { Shield } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <GlassCard className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Politika Privatnosti
            </h1>
          </div>

          <div className="space-y-6 text-white/80">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Uvod</h2>
              <p>
                Mondo Acqua Pool Designer ("Aplikacija") poštuje vašu privatnost. Ova politika
                objašnjava kako prikupljamo, koristimo i štitimo vaše podatke.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Podaci koje prikupljamo</h2>
              <p className="mb-2">Aplikacija NE prikuplja osobne podatke. Svi podaci se pohranjuju lokalno na vašem uređaju:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Fotografije koje uploadate (pohranjene u localStorage)</li>
                <li>Crop koordinate i dizajn postavke</li>
                <li>Jezične preference</li>
                <li>Spremljeni objekti (bazeni)</li>
              </ul>
              <p className="mt-2 text-amber-400 font-semibold">
                ⚠️ Podaci NIKADA ne napuštaju vaš uređaj i nisu poslani na servere.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. Kako koristimo podatke</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Za funkcionalnost aplikacije (crop, dizajn, spremanje projekata)</li>
                <li>Za generiranje PDF izvještaja lokalno na vašem uređaju</li>
                <li>Za slanje ponuda putem email-a (samo ako vi to odaberete)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. Dijeljenje podataka</h2>
              <p>
                <strong className="text-white">Aplikacija NE dijeli vaše podatke s trećim stranama.</strong> 
                Kada koristite funkciju "Send Offer", email se šalje direktno iz vašeg uređaja 
                koristeći mailto: protokol - mi ne pristupamo tim podacima.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">5. Sigurnost</h2>
              <p>
                Svi podaci su pohranjeni u localStorage vašeg browsera/uređaja. Vi imate potpunu 
                kontrolu nad brisanjem podataka (cleareanjem cache-a ili deinstalacijom aplikacije).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">6. Kolačići (Cookies)</h2>
              <p>
                Aplikacija koristi localStorage (tehnički nije cookie) za pohranu vaših projekata. 
                Ne koristimo tracking cookies ili analytics.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">7. Vaša prava</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Možete izbrisati sve podatke cleareanjem browser cache-a</li>
                <li>Možete deinstalirati aplikaciju bilo kada</li>
                <li>Imate potpunu kontrolu nad svojim fotografijama i projektima</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">8. Promjene politike</h2>
              <p>
                Zadržavamo pravo ažuriranja ove politike. Promjene će biti objavljene na ovoj stranici.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">9. Kontakt</h2>
              <p>
                Za pitanja o privatnosti kontaktirajte:<br />
                <strong className="text-cyan-400">MONDO ACQUA D.O.O.</strong><br />
                Email: <a href="mailto:info@mondoacqua.hr" className="text-amber-400 hover:underline">info@mondoacqua.hr</a>
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-white/10 text-sm text-white/60">
              <p>Zadnje ažurirano: 19. Februar 2026</p>
              <p className="mt-2">© 2026 MONDO ACQUA D.O.O. Sva prava pridržana.</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
