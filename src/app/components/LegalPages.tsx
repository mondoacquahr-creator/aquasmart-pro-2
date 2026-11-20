import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

// Samostalne pravne stranice webshopa: /uvjeti i /povrat (vlastita adresa i naslov).
// Podaci tvrtke na jednom mjestu. OIB i izjavu o PDV-u upisuje vlasnik; dok su prazni, retci se ne prikazuju.
export const SELLER = {
  name: 'Mondo Acqua d.o.o.',
  address: 'Lučinići 17, 51216 Marinići',
  oib: '',          // upisati OIB tvrtke
  email: 'info@mondo-acqua.hr',
  phone: '+385 95 208 7321',
  vatNote: '',      // npr. „Sve cijene uključuju PDV.” – potvrđuje vlasnik
};

const box = { background: 'rgba(6,30,42,0.6)', border: '1px solid rgba(120,220,255,0.12)' };
const muted = 'rgba(255,255,255,0.75)';
const link = { color: '#5ED6E6' };

function Shell({ title, lead, children, onBack }: { title: string; lead: string; children: React.ReactNode; onBack: () => void }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-semibold" style={{ color: '#5ED6E6' }}>
        <ArrowLeft className="w-4 h-4" /> Natrag u webshop
      </button>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{title}</h1>
      <p className="mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>{lead}</p>
      <div className="space-y-5 leading-relaxed text-[15px]" style={{ color: muted }}>{children}</div>
      <nav className="mt-10 pt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <a href="/uvjeti" style={link}>Uvjeti kupnje</a>
        <a href="/povrat" style={link}>Dostava, povrat i reklamacije</a>
        <a href="/privatnost.html" style={link}>Pravila privatnosti</a>
      </nav>
    </div>
  );
}

const Section = ({ h, children }: { h: string; children: React.ReactNode }) => (
  <section className="rounded-2xl p-5" style={box}>
    <h2 className="text-lg font-bold text-white mb-2">{h}</h2>
    <div className="space-y-2">{children}</div>
  </section>
);

export function SellerBlock() {
  return (
    <p>
      <b className="text-white">{SELLER.name}</b>, {SELLER.address}
      {SELLER.oib ? <>, OIB {SELLER.oib}</> : null}
      <br />E-mail: <a href={`mailto:${SELLER.email}`} style={link}>{SELLER.email}</a> · Telefon:{' '}
      <a href={`tel:${SELLER.phone.replace(/\s/g, '')}`} style={link}>{SELLER.phone}</a>
    </p>
  );
}

export function ReturnsPage({ onBack }: { onBack: () => void }) {
  return (
    <Shell title="Dostava, povrat i reklamacije" lead="Sve što trebate znati o dostavi, odustanku od kupnje u 14 dana i reklamacijama." onBack={onBack}>
      <Section h="Dostava">
        <p>Dostava na adresu u Hrvatskoj stoji <b className="text-white">10 € po narudžbi</b>, a roba stiže u roku od <b className="text-white">0 do 3 radna dana</b>. Narudžbu možete i besplatno preuzeti osobno na adresi {SELLER.address}, uz prethodni dogovor.</p>
      </Section>
      <Section h="Odustanak od kupnje (14 dana)">
        <p>Od narudžbe preko webshopa možete odustati u roku od <b className="text-white">14 dana od dana primitka proizvoda</b>, bez navođenja razloga. Dovoljno je da nam to javite e-mailom na <a href={`mailto:${SELLER.email}`} style={link}>{SELLER.email}</a> ili na <a href={`tel:${SELLER.phone.replace(/\s/g, '')}`} style={link}>{SELLER.phone}</a>, uz broj ili datum narudžbe.</p>
      </Section>
      <Section h="Vraćanje proizvoda">
        <p>Proizvod pošaljite ili donesite najkasnije 14 dana nakon obavijesti o odustanku, na adresu {SELLER.name}, {SELLER.address}. Proizvod treba biti nekorišten, neoštećen i u originalnoj ambalaži. Troškove povrata snosi kupac.</p>
      </Section>
      <Section h="Povrat novca">
        <p>Novac vraćamo najkasnije 14 dana od primitka vaše obavijesti, istim načinom plaćanja kojim ste platili. Povrat možemo zadržati dok ne primimo proizvod.</p>
      </Section>
      <Section h="Iznimke">
        <p>Iz sigurnosnih i higijenskih razloga ne primamo natrag kemikalije i sredstva za tretman vode kojima je ambalaža otvorena ili oštećena, ni proizvode izrađene ili naručene po vašoj mjeri.</p>
      </Section>
      <Section h="Reklamacije">
        <p>Za materijalne nedostatke odgovaramo u skladu sa zakonom, dvije godine od preuzimanja proizvoda. Reklamaciju pošaljite e-mailom s brojem narudžbe, opisom problema i fotografijom. Pisani odgovor dobit ćete u roku od 15 dana.</p>
      </Section>
      <Section h="Prodavatelj"><SellerBlock /></Section>
    </Shell>
  );
}

export function TermsPage({ onBack }: { onBack: () => void }) {
  return (
    <Shell title="Uvjeti kupnje" lead="Opći uvjeti kupnje u webshopu Mondo Pool Care." onBack={onBack}>
      <Section h="1. Prodavatelj"><SellerBlock /></Section>
      <Section h="2. Narudžba">
        <p>Narudžbu šaljete iz košarice webshopa. Ugovor je sklopljen kad vam potvrdimo narudžbu e-mailom, porukom ili telefonom. Ako proizvod u međuvremenu nije dostupan, javljamo se prije slanja i dogovaramo zamjenu ili otkazivanje.</p>
      </Section>
      <Section h="3. Cijene">
        <p>Cijene su izražene u eurima i vrijede u trenutku narudžbe.{SELLER.vatNote ? ` ${SELLER.vatNote}` : ''} Trošak dostave prikazan je u košarici prije slanja narudžbe. Uz svaku cijenu navedena je i sidrena cijena.</p>
        <p>Popusti za registrirane vlasnike bazena i članove Mondo Care obračunavaju se u košarici i vrijede samo za webshop.</p>
      </Section>
      <Section h="4. Plaćanje">
        <p>Narudžbu možete platiti PayPalom ili prema ponudi koju vam pošaljemo, uplatom na račun prodavatelja.</p>
      </Section>
      <Section h="5. Dostava">
        <p>Dostava na adresu u Hrvatskoj stoji 10 € po narudžbi, a roba stiže u roku od 0 do 3 radna dana. Moguće je i osobno preuzimanje uz prethodni dogovor. Detalji: <a href="/povrat" style={link}>Dostava, povrat i reklamacije</a>.</p>
      </Section>
      <Section h="6. Odustanak od kupnje">
        <p>Kao potrošač možete odustati od kupnje u roku od 14 dana od primitka proizvoda, bez navođenja razloga. Postupak, troškovi povrata i iznimke opisani su na stranici <a href="/povrat" style={link}>Dostava, povrat i reklamacije</a>.</p>
      </Section>
      <Section h="7. Reklamacije i jamstvo">
        <p>Za materijalne nedostatke odgovaramo u skladu sa zakonom, dvije godine od preuzimanja proizvoda. Reklamaciju pošaljite e-mailom; pisani odgovor dobit ćete u roku od 15 dana.</p>
      </Section>
      <Section h="8. Upute za uporabu kemikalija">
        <p>Kemikalije za bazene koristite isključivo prema uputama i doziranju na deklaraciji proizvoda. Preporuke doze u aplikaciji su informativne i ne zamjenjuju deklaraciju.</p>
      </Section>
      <Section h="9. Zaštita podataka">
        <p>Podatke iz narudžbe koristimo samo za obradu i isporuku narudžbe. Više u <a href="/privatnost.html" style={link}>Pravilima privatnosti</a>.</p>
      </Section>
      <Section h="10. Sporovi">
        <p>Prigovor možete poslati na {SELLER.email}; odgovor dajemo u roku od 15 dana. Sporove nastojimo riješiti dogovorom.</p>
      </Section>
    </Shell>
  );
}
