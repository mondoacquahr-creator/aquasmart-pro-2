// Dostava, povrat i reklamacije – prikazuje se u webshopu (popis proizvoda i narudžba).
const muted = 'rgba(255,255,255,0.72)';

export function ReturnPolicy({ id = 'povrat' }: { id?: string }) {
  return (
    <details
      id={id}
      className="rounded-2xl px-5 py-4 text-sm"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <summary className="cursor-pointer font-semibold text-base" style={{ color: '#fff' }}>
        Dostava, povrat i reklamacije
      </summary>
      <div className="space-y-3 mt-3 leading-relaxed" style={{ color: muted }}>
        <p>
          <b style={{ color: '#fff' }}>Dostava.</b> Dostava na adresu u Hrvatskoj stoji 10 € po narudžbi, a roba stiže
          u roku od 0 do 3 radna dana. Narudžbu možete i besplatno preuzeti osobno na adresi Lučinići 17, 51216 Marinići,
          uz prethodni dogovor.
        </p>
        <p>
          <b style={{ color: '#fff' }}>Odustanak od kupnje (14 dana).</b> Od narudžbe preko webshopa možete odustati
          u roku od 14 dana od dana primitka proizvoda, bez navođenja razloga. Dovoljno je da nam to javite e-mailom na{' '}
          <a href="mailto:info@mondo-acqua.hr" style={{ color: '#5ED6E6' }}>info@mondo-acqua.hr</a> ili na{' '}
          <a href="tel:+385952087321" style={{ color: '#5ED6E6' }}>+385 95 208 7321</a>, uz broj ili datum narudžbe.
        </p>
        <p>
          <b style={{ color: '#fff' }}>Vraćanje proizvoda.</b> Proizvod pošaljite ili donesite najkasnije 14 dana nakon
          obavijesti o odustanku, na adresu Mondo Acqua d.o.o., Lučinići 17, 51216 Marinići. Proizvod treba biti nekorišten,
          neoštećen i u originalnoj ambalaži. Troškove povrata snosi kupac.
        </p>
        <p>
          <b style={{ color: '#fff' }}>Povrat novca.</b> Novac vraćamo najkasnije 14 dana od primitka vaše obavijesti,
          istim načinom plaćanja kojim ste platili. Povrat možemo zadržati dok ne primimo proizvod.
        </p>
        <p>
          <b style={{ color: '#fff' }}>Iznimke.</b> Iz sigurnosnih i higijenskih razloga ne primamo natrag kemikalije
          i sredstva za tretman vode kojima je ambalaža otvorena ili oštećena, ni proizvode izrađene ili naručene po vašoj mjeri.
        </p>
        <p>
          <b style={{ color: '#fff' }}>Reklamacije.</b> Za materijalne nedostatke odgovaramo u skladu sa zakonom, dvije godine
          od preuzimanja proizvoda. Reklamaciju pošaljite e-mailom s brojem narudžbe, opisom problema i fotografijom.
          Pisani odgovor dobit ćete u roku od 15 dana.
        </p>
        <p>
          <b style={{ color: '#fff' }}>Cjenik.</b> Uz svaku cijenu navedena je i sidrena cijena: za kemiju na dan 2. 5. 2025., za ostale proizvode na dan 10. 9. 2026. Cijeli cjenik
          proizvoda i usluga:{' '}
          <a href="https://www.mondo-acqua.hr/cjenik.csv" style={{ color: '#5ED6E6' }}>CSV</a> ·{' '}
          <a href="https://www.mondo-acqua.hr/cjenik.xml" style={{ color: '#5ED6E6' }}>XML</a> ·{' '}
          <a href="https://www.mondo-acqua.hr/cjenik/arhiva" style={{ color: '#5ED6E6' }}>arhiva 30 dana</a>
        </p>
      </div>
    </details>
  );
}
