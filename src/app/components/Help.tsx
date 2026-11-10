import { useNavigate } from 'react-router';
import { ArrowLeft, HelpCircle, MessageCircle, Phone, Mail, Book } from 'lucide-react';
import { useState } from 'react';

export function Help() {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Kako često trebam analizirati vodu?',
      answer: 'Preporučujemo 1-2 puta tjedno za privatne bazene, i dnevno za javne/hotelske bazene. Tijekom ljetne sezone i intenzivne uporabe, povećajte učestalost.'
    },
    {
      question: 'Što ako ne mogu izmjeriti sve parametre?',
      answer: 'Nije potrebno unositi sve parametre. Aplikacija će dati preporuke na temelju dostupnih podataka. Minimalno preporučujemo pH i slobodni klor.'
    },
    {
      question: 'Koliko je važan ORP (redox)?',
      answer: 'ORP je vrlo važan jer pokazuje stvarnu učinkovitost dezinfekcije, ne samo koncentraciju klora. Za potpunu sliku stanja vode, preporučujemo mjerenje i klora i ORP-a.'
    },
    {
      question: 'Kako se izračunava trošak tretmana?',
      answer: 'Aplikacija automatski izračunava potrebne količine Ivero proizvoda na temelju volumena bazena i odstupanja parametara. Odabire najekonomičnije pakovanje.'
    },
    {
      question: 'Mogu li izvesti podatke?',
      answer: 'Da! U Postavkama možete preuzeti sve podatke kao JSON datoteku. Također možete generirati PDF izvještaj za svaku analizu.'
    },
    {
      question: 'Što znači "kritično" stanje?',
      answer: 'Kritično stanje označava parametre koji su izvan sigurnih granica i zahtijevaju hitnu intervenciju. Crvena poruka upozorava na potencijalne zdravstvene ili sigurnosne rizike.'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-slate-900 to-black pb-24">
      {/* Header */}
      <div className="bg-zinc-900/90 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-teal-600" />
            <h1 className="text-xl font-bold">Pomoć i Podrška</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Kako Vam možemo pomoći?</h2>
            <p className="text-teal-100">Pronađite odgovore na često postavljana pitanja ili nas kontaktirajte</p>
          </div>
        </div>

        {/* Contact Options */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 px-1">Kontakt</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a
              href="tel:+385123456789"
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-green-200 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 group-hover:text-green-600">
                  Poziv
                </div>
                <div className="text-xs text-gray-600">
                  +385 1 234 5678
                </div>
              </div>
            </a>

            <a
              href="https://wa.me/385123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-green-200 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 group-hover:text-green-600">
                  WhatsApp
                </div>
                <div className="text-xs text-gray-600">
                  Brz odgovor
                </div>
              </div>
            </a>

            <a
              href="mailto:support@aquasmart.hr"
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                  Email
                </div>
                <div className="text-xs text-gray-600">
                  support@aquasmart.hr
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 px-1">Često postavljana pitanja</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900 pr-4">{faq.question}</div>
                  <div className={`text-gray-400 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`}>
                    ▼
                  </div>
                </button>
                {openFAQ === index && (
                  <div className="px-4 pb-4 text-sm text-gray-700 border-t border-gray-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 px-1">Resursi</h2>
          <button
            onClick={() => navigate('/instructions')}
            className="w-full bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200 group flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Book className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                Upute za održavanje bazena
              </div>
              <div className="text-sm text-gray-600">
                Kompletni vodič za rad s bazenom
              </div>
            </div>
            <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
              →
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}