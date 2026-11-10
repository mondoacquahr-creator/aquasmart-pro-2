import { useState } from 'react';
import { ChevronDown, Filter, Droplet, Activity, BookOpen, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';

interface Instruction {
  id: string;
  title: string;
  steps: string[];
  frequency: string;
  difficulty: 'easy' | 'medium' | 'hard';
  warnings?: string[];
  tips?: string[];
}

const instructions: Record<string, Instruction[]> = {
  'filter-cleaning': [
    {
      id: 'sand-filter-backwash',
      title: 'Ispiranje pješčanog filtera (Backwash)',
      frequency: 'Tjedno ili kada tlak poraste za 50 kPa (7.2 psi)',
      difficulty: 'easy',
      steps: [
        'Provjerite manometar - ako je očitanje 50 kPa (7.2 psi) veće od početnog tlaka, vrijeme je za ispiranje',
        'Ugasite pumpu i pričekajte da se voda smiri',
        'Okrenite ventil na poziciju "BACKWASH"',
        'Upalite pumpu i pustite vodu da teče 2-3 minute dok ne postane potpuno bistra',
        'Pratite izlaznu vodu kroz prozirčić - mora biti kristalno čista',
        'Ugasite pumpu',
        'Okrenite ventil na poziciju "RINSE" (ispiranje)',
        'Upalite pumpu na 30-60 sekundi za završno ispiranje',
        'Ugasite pumpu i vratite ventil na poziciju "FILTER"',
        'Upalite pumpu - normalan rad je vraćen',
        'Zapišite datum i početni tlak nakon ispiranja'
      ],
      warnings: [
        '⚠️ NIKADA ne okrećite ventil dok pumpa radi - može doći do oštećenja!',
        '⚠️ Provjerite da li je ventil zaista na "FILTER" poziciji prije uključivanja',
        '⚠️ Ako je filter spojen na vodovodnu mrežu, porast tlaka nije točan pokazatelj jer mrežni tlak fluktuira - oslonite se na brzinu protoka',
        '⚠️ Gusti filterski medij može postati "nabijen" bez pravilnog i dovoljnog ispiranja'
      ],
      tips: [
        '💡 PREPORUČUJE SE: Isperite pješčani filter barem jednom mjesečno',
        '💡 Zapisujte tlak nakon svakog ispiranja u dnevnik održavanja',
        '💡 Voda iz backwash-a ne bi smjela ići natrag u bazen',
        '💡 Prije ispiranja obavezno očistite košaru pumpe i košare u skimmerima',
        '💡 Provjera brzine protoka je najbolji pokazatelj - ne samo tlak!',
        '💡 Ako se krhotine ne isperu redovno, sloj filtera postaje sve prljaviji i rad postaje neefikasan'
      ]
    },
    {
      id: 'backwash-theory',
      title: 'Razumijevanje Povratnog Ispiranja',
      frequency: 'Znanje - pročitajte prije prvog korištenja',
      difficulty: 'easy',
      steps: [
        'FUNKCIJA: Povratno ispiranje odvaja taložene nečistoće iz filterskog pijeska',
        'PRINCIP RADA: Ispiranje se postiže promjenom smjera protoka vode',
        'Voda teče kroz filter u suprotnom smjeru i izbacuje zarobljene čestice',
        'Nečistoće se ispiru kroz odvodni otvor van sustava',
        'Filter se vraća u normalan rad nakon ispiranja',
        'Učinkovitost filtera je obnovljena na maksimum'
      ],
      warnings: [
        '⚠️ BEZ pravilnog ispiranja: Krhotine ostaju zarobljene i stvaraju kanale unutar sloja filtera',
        '⚠️ Kanali uzrokuju: Voda "preskače" filtraciju i vraća se nefiltrirana u bazen',
        '⚠️ Rezultat: Kvaliteta vode se pogoršava i više nije prihvatljiva'
      ],
      tips: [
        '💡 UVJET 1 za ispiranje: Brzina protoka se smanjuje i postaje nedovoljna',
        '💡 UVJET 2 za ispiranje: Učinkovitost uklanjanja se smanjuje do neprihvatljive razine',
        '💡 VAŽNOST: Povratno ispiranje je VRLO BITNO za dugovječnost i rad filtera',
        '💡 Redovno ispiranje produljuje životni vijek filterskog pijeska za godine'
      ]
    },
    {
      id: 'cartridge-filter-clean',
      title: 'Čišćenje filtarskih uloška',
      frequency: 'Svakih 2-4 tjedna',
      difficulty: 'easy',
      steps: [
        'Ugasite pumpu i zatvorite sve ventile',
        'Otpustite zračni ventil na vrhu filtera',
        'Otvorite kućište filtera',
        'Izvadite filtarske uloške',
        'Isperite uloške jakim mlazom vode (garden hose)',
        'Za dubinsko čišćenje: namočite u otopinu za čišćenje 12-24h',
        'Isperite i vratite uloške u filter',
        'Zatvorite kućište i provjerite brtve',
        'Otvorite ventile i upalite pumpu'
      ],
      warnings: [
        '⚠️ Pazite da ne oštetite nabore uloška',
        '⚠️ Provjerite stanje brtvi prilikom svakog otvaranja'
      ],
      tips: [
        '💡 Imajte rezervni set uložaka za zamjenu',
        '💡 Označite datum prvog korištenja na ulošku'
      ]
    }
  ],
  'pump-maintenance': [
    {
      id: 'pump-prefilter-clean',
      title: 'Čišćenje predfiltera pumpe',
      frequency: 'Tjedno ili po potrebi',
      difficulty: 'easy',
      steps: [
        'Ugasite pumpu',
        'Zatvorite ventile ili skimmer',
        'Odvrnite poklopac predfiltera (obično se okreće ulijevo)',
        'Izvadite košaru predfiltera',
        'Isperite košaru pod mlazom vode',
        'Očistite kućište od prljavštine',
        'Provjerite brtvu poklopca - zamijenite ako je oštećena',
        'Vratite košaru i zatvorite poklopac čvrsto',
        'Otvorite ventile',
        'Upalite pumpu - provjerite curenje'
      ],
      warnings: [
        '⚠️ NE pokušavajte otvoriti pod tlakom!',
        '⚠️ Pazite da brtva bude pravilno postavljena'
      ],
      tips: [
        '💡 Čist predfilter = bolja cirkulacija i niži tlak',
        '💡 Ako pumpa gubi snagu, prvo provjerite predfilter'
      ]
    }
  ],
  'probe-calibration': [
    {
      id: 'ph-probe-calibration',
      title: 'Kalibracija pH sonde',
      frequency: 'Mjesečno ili pri nepravilnim očitanjima',
      difficulty: 'medium',
      steps: [
        'PRIPREMA: Prije kalibracije isperite sondu destiliranom vodom i nježno obrišite',
        'Pripremite kalibracijske otopine prema uputi na uređaju (pH 4, pH 7 i/ili pH 9)',
        'TEMPERATURA: Stavite elektrodu u otopinu na preporučenu temperaturu',
        'Ako temperatura nije optimalna, upotrijebite priloženu tablicu korekcije temperature',
        'KALIBRACIJA TOČKA 1 (pH 7.0 - neutralna):',
        '  → Uronite sondu u pH 7.0 otopinu',
        '  → Pričekajte da se očitanje stabilizira (1-2 minute)',
        '  → Pritisnite "CAL" na uređaju i izvršite kalibraciju prema uputama instrumenta',
        'ISPIRANJE: Isperite sondu destiliranom vodom nakon pH 7',
        'KALIBRACIJA TOČKA 2 (pH 4.0 - kisela):',
        '  → Uronite sondu u pH 4.0 otopinu',
        '  → Pričekajte stabilizaciju očitanja',
        '  → Potvrdite kalibraciju na uređaju',
        'ZAVRŠNO ISPIRANJE: Naknadno isperite sondu destiliranom vodom',
        'POHRANA: Pohranite sondu prema preporuci proizvođača (obino u KCl 3M otopini)',
        'PROVJERA: Provjerite kalibraciju u pH 7.0 otopini - trebao bi pokazati 7.0 ± 0.1'
      ],
      warnings: [
        '⚠️ Koristite SVJEŽE kalibracijske otopine (provjerite rok trajanja!)',
        '⚠️ NIKADA ne vraćajte korištenu otopinu u originalnu bocu - kontaminacija!',
        '⚠️ Sonda mora biti POTPUNO uronjena - mora prekriti keramičku membranu',
        '⚠️ Temperatura otopine utječe na očitanje - koristite tablicu korekcije',
        '⚠️ NE obrišite sondu suhom krpom - samo destilirana voda!'
      ],
      tips: [
        '💡 TEMPERATURA: Kalibrirajte na temperaturi vode u bazenu za najtočnije rezultate',
        '💡 SKLADIŠTENJE: Čuvajte sondu u KCl 3M otopini za skladištenje - NIKADA u destiliranoj vodi!',
        '💡 DNEVNIK: Zapišite datum kalibracije i vrijednosti u dnevnik održavanja',
        '💡 REDOSLIJED: Uvijek prvo pH 7 (neutralna), pa onda pH 4 ili pH 10 (kisela/lužnata)',
        '💡 STABILIZACIJA: Pričekajte da očitanje prestane skakati prije potvrde',
        '💡 TABLICA KOREKCIJE: Ako kalibrirate na drugoj temperaturi, koristite priloženu tablicu',
        '💡 PROVJERA: Nakon kalibracije, testirajte u svim otopinama za verifikaciju'
      ]
    },
    {
      id: 'ph-temperature-correction',
      title: 'Tablica Korekcije Temperатуре za pH',
      frequency: 'Referentni materijal',
      difficulty: 'easy',
      steps: [
        'pH buffer otopine mijenjaju vrijednost sa temperaturom:',
        '',
        'pH 4.01 buffer:',
        '  • 0°C  → pH 4.01',
        '  • 25°C → pH 4.01 (referentna temperatura)',
        '  • 50°C → pH 4.02',
        '',
        'pH 7.00 buffer:',
        '  • 0°C  → pH 7.12',
        '  • 25°C → pH 7.00 (referentna temperatura)',
        '  • 50°C → pH 6.88',
        '',
        'pH 10.01 buffer:',
        '  • 0°C  → pH 10.32',
        '  • 25°C → pH 10.01 (referentna temperatura)',
        '  • 50°C → pH 9.82',
        '',
        'PRIMJENA: Ako kalibrirate na 15°C umjesto 25°C, uzmite u obzir ove vrijednosti'
      ],
      warnings: [
        '⚠️ Većina modernih pH metara ima automatsku temperaturnu kompenzaciju (ATC)',
        '⚠️ Provjerite da li vaš uređaj ima ATC prije ručne korekcije'
      ],
      tips: [
        '💡 Najbolje je kalibrirati na temperaturi blizu radne temperature bazena',
        '💡 Ako imate ATC sondu, ona automatski korigira temperaturu',
        '💡 Tablica je samo za manual korekciju ako nemate ATC'
      ]
    },
    {
      id: 'orp-probe-calibration',
      title: 'Kalibracija ORP (Redox) sonde',
      frequency: 'Mjesečno',
      difficulty: 'medium',
      steps: [
        'Pripremite ORP kalibracijski buffer (obično 470 mV)',
        'Isperite sondu destiliranom vodom',
        'Obrišite sondu mekom krpom',
        'Uronite sondu u kalibracijski buffer',
        'Pričekajte 5-10 minuta za stabilizaciju',
        'Pritisnite "CAL" na uređaju',
        'Unesite vrijednost buffera (npr. 470 mV)',
        'Potvrdite kalibraciju',
        'Isperite sondu destiliranom vodom',
        'Provjerite očitanje - trebalo bi biti ± 10 mV od buffer vrijednosti'
      ],
      warnings: [
        '���️ ORP sonda MORA biti čista (bez naslaga)',
        '⚠️ Buffer otopina se može koristiti samo JEDNOM',
        '⚠️ Temperatura buffera utječe na očitanje'
      ],
      tips: [
        '💡 Ako sonda ne reagira, možda treba zamjena',
        '💡 ORP vrijednost ovisi o temperaturi vode',
        '💡 Nakon kalibracije, pričekajte 24h za stabilne rezultate'
      ]
    },
    {
      id: 'probe-cleaning',
      title: 'Čišćenje pH i ORP sondi',
      frequency: 'Tjedno ili po potrebi',
      difficulty: 'easy',
      steps: [
        'Isperite sondu destiliranom vodom',
        'Za pH sondu: namočite u 0.1M HCl otopini 10-15 min',
        'Za ORP sondu: nježno izribajte mekom četkom',
        'Isperite destiliranom vodom',
        'Ako ima kamenca: namočite u octenu kiselinu 30 min',
        'Ponovno isperite',
        'Provjerite kalibraciju nakon čišćenja',
        'Vratite u KCl otopinu za skladitenje'
      ],
      warnings: [
        '⚠️ Ne koristite abrazivna sredstva',
        '⚠️ Pazite da ne oštetite keramičku membranu'
      ],
      tips: [
        '💡 Redovno čišćenje produljuje životni vijek sonde',
        '💡 Znak za čišćenje: sporo reagiranje ili nepravilna očitanja'
      ]
    }
  ],
  'general-maintenance': [
    {
      id: 'pool-vacuuming',
      title: 'Usisavanje bazena',
      frequency: 'Tjedno',
      difficulty: 'easy',
      steps: [
        'Spojite usisač na skimmer ili vakuum priključak',
        'Okrenite ventil na "WASTE" ako ima puno prljavštine',
        'Polako usisavajte dno bazena',
        'Pazite da se cijev ne isključi (gubi vakuum)',
        'Nakon završetka, okrenite ventil natrag na "FILTER"',
        'Provjerite razinu vode i dopunite ako treba'
      ],
      tips: [
        '💡 Četkajte zidove prije usisavanja',
        '💡 Krećite se polako da ne podignete prljavštinu'
      ]
    },
    {
      id: 'skimmer-cleaning',
      title: 'Čišćenje skimmera',
      frequency: 'Svakodnevno ili po potrebi',
      difficulty: 'easy',
      steps: [
        'Izvadite košaru skimmera',
        'Ispraznite lišće i prljavštinu',
        'Isperite košaru',
        'Provjerite poklopac skimmera',
        'Vratite košaru na mjesto'
      ],
      tips: [
        '💡 Čist skimmer = bolja cirkulacija',
        '💡 Posebno važno u jesen (lišće)'
      ]
    }
  ]
};

export function PoolInstructions() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openInstruction, setOpenInstruction] = useState<string | null>(null);
  const navigate = useNavigate();

  const categories = [
    {
      id: 'filter-cleaning',
      title: 'Ispiranje filtera',
      icon: Filter,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'pump-maintenance',
      title: 'Čišćenje predfiltera pumpe',
      icon: Droplet,
      color: 'from-teal-500 to-emerald-500'
    },
    {
      id: 'probe-calibration',
      title: 'Kalibracija sondi pH i ORP',
      icon: Activity,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'general-maintenance',
      title: 'Opće održavanje',
      icon: BookOpen,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const getDifficultyBadge = (difficulty: Instruction['difficulty']) => {
    const badges = {
      easy: { text: 'Jednostavno', color: 'bg-green-100 text-green-700' },
      medium: { text: 'Srednje', color: 'bg-yellow-100 text-yellow-700' },
      hard: { text: 'Zahtjevno', color: 'bg-red-100 text-red-700' }
    };
    const badge = badges[difficulty];
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-slate-900 to-black pb-20">
      {/* Header */}
      <div className="bg-zinc-900/90 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Upute za rad s bazenom</h1>
              <p className="text-sm text-gray-600">Priručnik za održavanje</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Categories */}
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
              className="w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-200 overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${category.color} p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <category.icon className="w-6 h-6 text-white" />
                  <h2 className="font-bold text-white text-lg">{category.title}</h2>
                </div>
                <motion.div
                  animate={{ rotate: activeCategory === category.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-6 h-6 text-white" />
                </motion.div>
              </div>

              <AnimatePresence>
                {activeCategory === category.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4 space-y-3">
                      {instructions[category.id]?.map((instruction) => (
                        <div key={instruction.id} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenInstruction(openInstruction === instruction.id ? null : instruction.id);
                            }}
                            className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-2">{instruction.title}</h3>
                                <div className="flex flex-wrap items-center gap-2">
                                  {getDifficultyBadge(instruction.difficulty)}
                                  <span className="text-xs text-gray-600">🕐 {instruction.frequency}</span>
                                </div>
                              </div>
                              <ChevronDown
                                className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                                  openInstruction === instruction.id ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </button>

                          <AnimatePresence>
                            {openInstruction === instruction.id && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 space-y-4">
                                  {/* Warnings */}
                                  {instruction.warnings && instruction.warnings.length > 0 && (
                                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
                                      <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                        <div className="space-y-1">
                                          {instruction.warnings.map((warning, i) => (
                                            <p key={i} className="text-sm text-red-800">{warning}</p>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Steps */}
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                      <CheckCircle className="w-5 h-5 text-blue-600" />
                                      Koraci:
                                    </h4>
                                    <ol className="space-y-2">
                                      {instruction.steps.map((step, i) => (
                                        <li key={i} className="flex gap-3">
                                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                                            {i + 1}
                                          </span>
                                          <span className="text-sm text-gray-700 pt-0.5">{step}</span>
                                        </li>
                                      ))}
                                    </ol>
                                  </div>

                                  {/* Tips */}
                                  {instruction.tips && instruction.tips.length > 0 && (
                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
                                      <div className="space-y-1">
                                        {instruction.tips.map((tip, i) => (
                                          <p key={i} className="text-sm text-blue-900">{tip}</p>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}