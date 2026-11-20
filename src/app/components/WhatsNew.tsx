import { useEffect, useState } from 'react';
import { X, WifiOff, Camera, FileSpreadsheet, Image as ImageIcon, Users } from 'lucide-react';

// Obavijest o novostima u Pro portalu. Prikazuje se jednom po korisniku i uređaju.
const NEWS_ID = 'pro-2026-11-offline';
const KEY = 'pc_news_seen';

export function WhatsNew({ isOwner }: { isOwner: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try { if (localStorage.getItem(KEY) !== NEWS_ID) setOpen(true); } catch {}
  }, []);
  if (!open) return null;
  const close = () => { try { localStorage.setItem(KEY, NEWS_ID); } catch {} setOpen(false); };

  const item = (Icon: any, title: string, text: string) => (
    <div className="flex gap-3">
      <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#4FC3F0' }} />
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{text}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={close}>
      <div className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6"
        style={{ background: '#06161D', border: '1px solid rgba(120,220,255,0.15)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#5CE1E6' }}>Novo u aplikaciji</p>
            <h2 className="text-xl font-bold text-white mt-1">Radite i bez signala</h2>
          </div>
          <button onClick={close} aria-label="Zatvori" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-4">
          {item(WifiOff, 'Nalozi bez signala',
            'U strojarnici ili podrumu nalog normalno otvorite, ispunite i spremite. Izmjene se čuvaju na mobitelu, a traka na vrhu ekrana pokazuje koliko ih čeka slanje. Čim se signal vrati, šalju se same.')}
          {item(Camera, 'Fotografije bez signala',
            'Fotografija se odmah sprema na mobitel. Ispod nje piše „šalje se samo kad bude signala” i ne morate ništa raditi. Samo ako piše crveno „Poslužitelj nije primio fotografiju”, dodirnite taj natpis da je pošaljete ponovno.')}
          {item(Users, 'Dvoje na istom nalogu',
            'Ako dvoje mijenja isti nalog bez signala, izmjene se spajaju: npr. jedan označi čišćenje, drugi upiše kemiju, sačuva se oboje. Ako ste oboje mijenjali isto polje (npr. napomenu), zadrži se zadnja poslana verzija i aplikacija vas upozori da je provjerite.')}
          {isOwner && item(FileSpreadsheet, 'Izvoz podataka u Excel',
            'Više → Izvoz podataka: nalozi, klijenti, bazeni, analize, skladište i djelatnici u jednoj datoteci.')}
          {isOwner && item(ImageIcon, 'Vaš logo na izvještaju',
            'Više → Postavke tvrtke → Učitaj logo. Logo se ispisuje na izvještajima i ponudama za klijente.')}
        </div>

        <div className="mt-5 p-3 rounded-xl text-sm" style={{ background: 'rgba(255,210,122,0.08)', border: '1px solid rgba(255,210,122,0.3)', color: '#FFD27A' }}>
          Dok traka na vrhu pokazuje da nešto čeka slanje, nemojte se odjavljivati ni brisati podatke preglednika ili aplikacije.
        </div>

        <button onClick={close} className="w-full mt-5 py-3.5 rounded-xl font-bold text-black"
          style={{ background: 'linear-gradient(90deg, #0ABFCF 0%, #5CE1E6 100%)' }}>
          Razumijem
        </button>
      </div>
    </div>
  );
}
