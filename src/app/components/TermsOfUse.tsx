import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-slate-800/50 border-b border-amber-500/20 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-4 text-amber-500 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
            Uvjeti korištenja
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-slate-800/30 border border-amber-500/20 rounded-xl p-8 space-y-6 text-slate-200">
          
          {/* Header */}
          <div className="border-b border-amber-500/20 pb-4">
            <h2 className="text-2xl font-bold text-amber-400 mb-2">AquaSmart Pro</h2>
            <p className="text-slate-400">Zadnje ažurirano: {new Date().toLocaleDateString('hr-HR')}</p>
          </div>

          {/* Copyright Notice */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2">
              © Autorska prava
            </h3>
            <p className="text-slate-300 leading-relaxed">
              <strong>AquaSmart Pro</strong> je zaštićena aplikacija. Sva autorska prava zadržana.
              Kod, dizajn, logo, naziv aplikacije i sav sadržaj su vlasništvo autora i zaštićeni su 
              hrvatskim i međunarodnim zakonima o autorskim pravima i intelektualnom vlasništvu.
            </p>
            <p className="text-slate-300 leading-relaxed mt-2">
              <strong>© 2024-{new Date().getFullYear()} Vladimir Perić - Mondo Acqua d.o.o. Sva prava pridržana.</strong>
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-3">1. Prihvaćanje uvjeta</h3>
            <p className="text-slate-300 leading-relaxed">
              Korištenjem aplikacije AquaSmart Pro prihvaćate ove Uvjete korištenja u cijelosti. 
              Ako se ne slažete s bilo kojim dijelom ovih uvjeta, nemojte koristiti aplikaciju.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-3">2. Licenca za korištenje</h3>
            <p className="text-slate-300 leading-relaxed mb-2">
              Dodijeljena vam je ograničena, neprenosiva, neekskluzivna licenca za korištenje 
              aplikacije isključivo za osobne ili poslovne potrebe u skladu s ovim uvjetima.
            </p>
            <p className="text-slate-300 leading-relaxed font-semibold text-amber-300">
              ZABRANJENO JE:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4 mt-2">
              <li>Kopiranje, distribuiranje ili modificiranje aplikacije ili njezinog sadržaja</li>
              <li>Dekompiliranje, reverse engineering ili pokušaj izvlačenja izvornog koda</li>
              <li>Uklanjanje autorskih oznaka ili других proprietary notices</li>
              <li>Korištenje aplikacije za kreiranje konkurentskih proizvoda</li>
              <li>Prodaja, iznajmljivanje ili davanje u podlicencu aplikacije trećim stranama</li>
              <li>Korištenje automatiziranih sustava (botova, scrapera) za pristup aplikaciji</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-3">3. Intelektualno vlasništvo</h3>
            <p className="text-slate-300 leading-relaxed">
              Svi elementi aplikacije, uključujući ali ne ograničavajući se na dizajn, logotip, 
              naziv, ikone, grafiku, korisničko sučelje, algoritme, baze podataka, programski kod i 
              sve povezane materijale, zaštićeni su autorskim pravima, žigovima i drugim pravima 
              intelektualnog vlasništva.
            </p>
            <p className="text-slate-300 leading-relaxed mt-2">
              Naziv <strong>"AquaSmart Pro"</strong> i pripadajući logo su registrirani (ili u 
              procesu registracije) žigovi i ne smiju se koristiti bez pisanog dopuštenja vlasnika.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-3">4. Odgovornost za sadržaj</h3>
            <p className="text-slate-300 leading-relaxed">
              Podaci i preporuke koje aplikacija pruža služe isključivo kao pomoć pri analizi vode 
              i ne zamjenjuju profesionalno savjetovanje stručnjaka. Korisnik je odgovoran za sve 
              odluke donesene na temelju podataka iz aplikacije.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-3">5. Ograničenje odgovornosti</h3>
            <p className="text-slate-300 leading-relaxed">
              Aplikacija se pruža "kao takva" bez ikakvih jamstava. Vlasnik aplikacije ne preuzima 
              odgovornost za bilo kakvu štetu nastalu korištenjem ili nemogućnošću korištenja aplikacije.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-3">6. Zaštita od neovlaštenog korištenja</h3>
            <p className="text-slate-300 leading-relaxed">
              Aplikacija koristi napredne tehnologije zaštite uključujući:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4 mt-2">
              <li>Enkripciju koda (code obfuscation)</li>
              <li>Google Play App Signing i Play Integrity API</li>
              <li>Anti-tamper zaštitu</li>
              <li>Detekciju neovlaštenih modifikacija</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-2">
              Bilo kakav pokušaj zaobilaženja ovih zaštita ili neovlaštenog pristupa kodu predstavlja 
              kršenje zakona i ovih uvjeta.
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-3">7. Prijava kršenja</h3>
            <p className="text-slate-300 leading-relaxed">
              Ako primijetite neovlaštenu kopiju, distribuciju ili kršenje autorskih prava ove 
              aplikacije, molimo prijavite putem emaila: <strong className="text-amber-400">info@mondo-acqua.hr</strong>
            </p>
          </div>

          {/* Section 8 */}
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-3">8. Izmjene uvjeta</h3>
            <p className="text-slate-300 leading-relaxed">
              Zadržavamo pravo izmjene ovih uvjeta u bilo kojem trenutku. Korisnici će biti 
              obaviješteni o značajnim promjenama. Nastavak korištenja aplikacije nakon izmjena 
              znači prihvaćanje novih uvjeta.
            </p>
          </div>

          {/* Section 9 */}
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-3">9. Mjerodavno pravo</h3>
            <p className="text-slate-300 leading-relaxed">
              Ovi uvjeti podliježu zakonima Republike Hrvatske. Svi sporovi rješavaju se pred 
              nadležnim sudovima u Hrvatskoj.
            </p>
          </div>

          {/* Contact */}
          <div className="border-t border-amber-500/20 pt-4">
            <h3 className="text-lg font-bold text-amber-400 mb-3">Kontakt</h3>
            <p className="text-slate-300 leading-relaxed">
              Za pitanja o ovim uvjetima ili licenciranju, kontaktirajte nas:
            </p>
            <ul className="text-slate-300 space-y-1 ml-4 mt-2">
              <li>📧 Email: <strong className="text-amber-400">info@mondo-acqua.hr</strong></li>
              <li>🌐 Web: <strong className="text-amber-400">www.mondo-acqua.hr</strong></li>
              <li>📱 Tel: <strong className="text-amber-400">095 208 7321</strong></li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}