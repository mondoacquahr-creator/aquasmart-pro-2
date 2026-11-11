import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

// PayPal plaćanje (PayPal račun ili kartica). Client ID je javan podatak; tajni ključ se ne koristi u aplikaciji.
export const PAYPAL_CLIENT_ID = 'BAAayDreo2PaElYOaINwhGKVn0kGahiAyXzIICN3-sjmgdgwtspBJWioi_t5ZygzvRONVQIUTdfab3koKE';

let sdkPromise: Promise<any> | null = null;
function loadPayPal(): Promise<any> {
  if ((window as any).paypal) return Promise.resolve((window as any).paypal);
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}&currency=EUR&intent=capture&components=buttons&locale=hr_HR`;
      s.async = true;
      s.onload = () => ((window as any).paypal ? resolve((window as any).paypal) : reject(new Error('PayPal nije učitan')));
      s.onerror = () => { sdkPromise = null; reject(new Error('PayPal nije dostupan')); };
      document.head.appendChild(s);
    });
  }
  return sdkPromise;
}

interface Props {
  amountEUR: number;
  description: string;
  canPay: () => boolean;            // provjera obrasca prije otvaranja PayPala
  onPaid: (info: { paypalOrderId: string; payerEmail?: string; payerName?: string }) => void;
}

export function PayPalCheckout({ amountEUR, description, canPay, onPaid }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [msg, setMsg] = useState('');
  const latest = useRef({ amountEUR, description, canPay, onPaid });
  latest.current = { amountEUR, description, canPay, onPaid };

  useEffect(() => {
    let alive = true;
    loadPayPal().then((paypal) => {
      if (!alive || !ref.current) return;
      ref.current.innerHTML = '';
      paypal.Buttons({
        style: { layout: 'vertical', shape: 'pill', label: 'pay' },
        onClick: (_data: any, actions: any) => (latest.current.canPay() ? actions.resolve() : actions.reject()),
        createOrder: (_data: any, actions: any) => actions.order.create({
          purchase_units: [{
            description: latest.current.description.slice(0, 120),
            amount: { currency_code: 'EUR', value: latest.current.amountEUR.toFixed(2) },
          }],
        }),
        onApprove: async (_data: any, actions: any) => {
          const d = await actions.order.capture();
          const status = d?.status;
          if (status !== 'COMPLETED') { setMsg('Plaćanje nije završeno. Pokušajte ponovno.'); return; }
          latest.current.onPaid({
            paypalOrderId: d.id,
            payerEmail: d?.payer?.email_address,
            payerName: [d?.payer?.name?.given_name, d?.payer?.name?.surname].filter(Boolean).join(' '),
          });
        },
        onError: () => setMsg('Plaćanje putem PayPala nije uspjelo. Pokušajte ponovno ili pošaljite narudžbu WhatsAppom.'),
      }).render(ref.current).then(() => alive && setState('ready')).catch(() => alive && setState('error'));
    }).catch(() => alive && setState('error'));
    return () => { alive = false; };
  }, []);

  return (
    <div className="rounded-2xl p-4" style={{ background: '#fff' }}>
      {state === 'loading' && (
        <p className="text-sm flex items-center justify-center gap-2 py-3" style={{ color: '#333' }}>
          <Loader2 className="w-4 h-4 animate-spin" /> Učitavam PayPal…
        </p>
      )}
      {state === 'error' && (
        <p className="text-sm py-3 text-center" style={{ color: '#a00' }}>PayPal trenutno nije dostupan. Narudžbu pošaljite WhatsAppom ili e-mailom.</p>
      )}
      <div ref={ref} />
      {msg && <p className="text-sm mt-2 text-center" style={{ color: '#a00' }}>{msg}</p>}
    </div>
  );
}
