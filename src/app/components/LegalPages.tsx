import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Samostalne pravne stranice webshopa: /uvjeti i /povrat (vlastita adresa i naslov).
// Podaci tvrtke na jednom mjestu. OIB i izjavu o PDV-u upisuje vlasnik; dok su prazni, retci se ne prikazuju.
export const SELLER = {
  name: 'Mondo Acqua d.o.o.',
  address: 'Lučinići 17, 51216 Marinići',
  oib: '23570721801',
  email: 'info@mondo-acqua.hr',
  phone: '+385 95 208 7321',
  vatNote: 'Sve cijene uključuju PDV (25 %).',
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
        <a href="/raskid" style={link}>Raskid ugovora</a>
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
        <p>Od narudžbe preko webshopa možete odustati u roku od <b className="text-white">14 dana od dana primitka proizvoda</b>, bez navođenja razloga. Dovoljno je da nam to javite e-mailom na <a href={`mailto:${SELLER.email}`} style={link}>{SELLER.email}</a> ili na <a href={`tel:${SELLER.phone.replace(/\s/g, '')}`} style={link}>{SELLER.phone}</a>, uz broj ili datum narudžbe. Najjednostavnije je upotrijebiti funkciju <a href="/raskid" style={link}>Raskid ugovora</a>: potvrdu primitka dobivate odmah.</p>
      </Section>
      <Section h="Vraćanje proizvoda">
        <p>Proizvod pošaljite ili donesite najkasnije 14 dana nakon obavijesti o odustanku, na adresu {SELLER.name}, {SELLER.address}. Troškove povrata snosi kupac.</p>
        <ReturnConditions />
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

// Funkcija „Raskid ugovora” (ugovori sklopljeni na daljinu): izjava se šalje Mondo Acqui, sprema u evidenciju,
// a kupac odmah dobiva potvrdu sa sadržajem, datumom i vremenom (na zaslonu za spremanje/ispis i e-poštom).
// Uvjeti povrata robe: kemija samo neotvorena (iznimka za zapečaćenu robu zbog zaštite zdravlja), oprema nekorištena.
export function ReturnConditions() {
  return (
    <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(255,176,32,0.08)', border: '1px solid rgba(255,176,32,0.35)' }}>
      <p><b className="text-white">Kemija za bazen i spa:</b> zbog zaštite zdravlja i sigurnosti može se vratiti samo <b className="text-white">neotvorena, u originalnoj ambalaži s neoštećenim zatvaračem</b>. Za otvorenu kemiju pravo na jednostrani raskid ne postoji.</p>
      <p><b className="text-white">Oprema i pribor:</b> vratite <b className="text-white">nekorišteno, neoštećeno i u originalnoj ambalaži</b>. Proizvod smijete pregledati kao u trgovini; ako je korišten više od toga, odgovarate za umanjenje njegove vrijednosti.</p>
    </div>
  );
}

const field = 'w-full rounded-xl px-4 py-3 text-[15px] text-white outline-none';
const fieldStyle = { background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)' };

const L = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block"><span className="block text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{t}</span>{children}</label>;

export function WithdrawalPage({ onBack }: { onBack: () => void }) {
  const [f, setF] = useState({ name: '', email: '', address: '', orderRef: '', orderDate: '', receivedDate: '', items: '', note: '', website: '' });
  const [err, setErr] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | { id: string; receivedAt: string; customerEmail: boolean }>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setF({ ...f, [k]: e.target.value }); setErr(''); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) { setErr('Upišite ime i prezime te ispravnu e-mail adresu.'); return; }
    if (!f.orderRef.trim() && !f.orderDate) { setErr('Upišite broj ili datum narudžbe.'); return; }
    setSending(true);
    try {
      const r = await fetch(`https://${projectId}.supabase.co/functions/v1/mondo-raskid`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}`, apikey: publicAnonKey }, body: JSON.stringify(f),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.success) throw new Error(d.error || 'Slanje nije uspjelo.');
      setDone(d);
      window.scrollTo(0, 0);
    } catch (x: any) {
      setErr(`${x?.message || 'Slanje nije uspjelo.'} Pokušajte ponovno ili pošaljite izjavu na ${SELLER.email}.`);
    } finally { setSending(false); }
  };

  if (done) {
    const kada = new Date(done.receivedAt).toLocaleString('hr-HR', { timeZone: 'Europe/Zagreb' });
    const rows: [string, string][] = ([
      ['Broj zahtjeva', done.id], ['Zaprimljeno', kada], ['Ime i prezime', f.name], ['E-mail', f.email], ['Adresa', f.address],
      ['Broj narudžbe', f.orderRef], ['Datum narudžbe', f.orderDate], ['Datum primitka robe', f.receivedDate], ['Proizvodi', f.items || 'cijela narudžba'], ['Napomena', f.note],
    ] as [string, string][]).filter(([, v]) => v);
    return (
      <Shell title="Raskid ugovora je zaprimljen" lead="Ovo je potvrda primitka vaše izjave o jednostranom raskidu ugovora." onBack={onBack}>
        <section className="rounded-2xl p-5" style={box}>
          <p className="mb-3">Ovime izjavljujem da jednostrano raskidam ugovor o kupnji navedene robe.</p>
          <table className="w-full text-sm"><tbody>
            {rows.map(([k, v]) => <tr key={k}><td className="py-1 pr-4 align-top" style={{ color: 'rgba(255,255,255,0.55)' }}>{k}</td><td className="py-1 text-white font-semibold">{v}</td></tr>)}
          </tbody></table>
        </section>
        <p>{done.customerEmail ? <>Potvrdu smo poslali i na <b className="text-white">{f.email}</b>.</> : <>Spremite ili ispišite ovu potvrdu.</>}</p>
        <p>Proizvod pošaljite ili donesite najkasnije 14 dana od danas na adresu {SELLER.name}, {SELLER.address}. Novac vraćamo najkasnije 14 dana od primitka izjave, istim načinom plaćanja.</p>
        <ReturnConditions />
        <button onClick={() => window.print()} className="px-5 py-3 rounded-xl font-bold text-black" style={{ background: '#4FC3F0' }}>Spremi ili ispiši potvrdu</button>
        <SellerBlock />
      </Shell>
    );
  }

  return (
    <Shell title="Raskid ugovora" lead="Od kupnje u webshopu možete odustati u roku od 14 dana od primitka robe, bez navođenja razloga." onBack={onBack}>
      <form onSubmit={submit} noValidate className="rounded-2xl p-5 space-y-4" style={box}>
        <p className="text-white">Ovime izjavljujem da jednostrano raskidam ugovor o kupnji robe navedene u nastavku.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <L t="Ime i prezime *"><input className={field} style={fieldStyle} value={f.name} onChange={set('name')} autoComplete="name" /></L>
          <L t="E-mail *"><input type="email" className={field} style={fieldStyle} value={f.email} onChange={set('email')} autoComplete="email" /></L>
          <L t="Broj narudžbe"><input className={field} style={fieldStyle} value={f.orderRef} onChange={set('orderRef')} /></L>
          <L t="Datum narudžbe"><input type="date" className={field} style={fieldStyle} value={f.orderDate} onChange={set('orderDate')} /></L>
          <L t="Datum primitka robe"><input type="date" className={field} style={fieldStyle} value={f.receivedDate} onChange={set('receivedDate')} /></L>
          <L t="Adresa"><input className={field} style={fieldStyle} value={f.address} onChange={set('address')} autoComplete="street-address" /></L>
        </div>
        <L t="Proizvodi (prazno = cijela narudžba)"><textarea rows={2} className={field} style={fieldStyle} value={f.items} onChange={set('items')} /></L>
        <L t="Napomena"><textarea rows={2} className={field} style={fieldStyle} value={f.note} onChange={set('note')} /></L>
        <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set('website')} style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />
        <ReturnConditions />
        {err && <p className="text-sm" style={{ color: '#FF8A80' }}>{err}</p>}
        <button type="submit" disabled={sending} className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-black disabled:opacity-60" style={{ background: '#4FC3F0' }}>{sending ? 'Šaljem…' : 'Potvrdi raskid ugovora'}</button>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Nakon slanja odmah dobivate potvrdu primitka s datumom i vremenom. Izjavu možete poslati i e-poštom na {SELLER.email} ili poštom.</p>
      </form>
    </Shell>
  );
}
