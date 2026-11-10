import { useNavigate } from 'react-router';
import { ArrowLeft, Zap, Info, TrendingUp, AlertCircle } from 'lucide-react';

export function ORPIntelligence() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-slate-900 to-black pb-24">
      {/* Header */}
      <div className="bg-zinc-900/90 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-600" />
            <h1 className="text-xl font-bold">ORP Inteligencija</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-yellow-600 via-yellow-700 to-orange-700 rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Zap className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">ORP Inteligencija</h2>
                <p className="text-yellow-100">Napredna analiza redox potencijala</p>
              </div>
            </div>
          </div>
        </div>

        {/* What is ORP */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Što je ORP (Redox Potencijal)?
          </h3>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              <strong>ORP (Oxidation-Reduction Potential)</strong> mjeri oksidacijsko-redukcijski potencijal vode u miliVoltima (mV).
            </p>
            <p>
              Za razliku od mjerenja slobodnog klora koje pokazuje samo <em>koncentraciju</em> dezinficijensa, 
              ORP pokazuje <strong>stvarnu učinkovitost</strong> dezinfekcije.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="font-medium text-blue-900 mb-2">💡 Ključna razlika:</div>
              <ul className="space-y-1 text-blue-800">
                <li>• <strong>Klor:</strong> Govori koliko dezinficijensa ima u vodi</li>
                <li>• <strong>ORP:</strong> Govori koliko dezinfekcija zapravo RADI</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ORP Ranges */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Idealni rasponi ORP
          </h3>
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-green-900">Privatni bazeni</div>
                <div className="text-2xl font-bold text-green-600">650-750 mV</div>
              </div>
              <div className="text-sm text-green-700">
                Optimalna dezinfekcija za kućne bazene
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-blue-900">Hotelski bazeni</div>
                <div className="text-2xl font-bold text-blue-600">700-750 mV</div>
              </div>
              <div className="text-sm text-blue-700">
                Viša dezinfekcija zbog intenzivnije uporabe
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-purple-900">Javni bazeni</div>
                <div className="text-2xl font-bold text-purple-600">720-740 mV</div>
              </div>
              <div className="text-sm text-purple-700">
                Stroga regulativa za javno zdravlje
              </div>
            </div>
          </div>
        </div>

        {/* pH and ORP Relationship */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Veza između pH i ORP
          </h3>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              pH i ORP su <strong>obrnuto proporcionalni</strong>:
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-orange-600">▲</span>
                <div>
                  <strong className="text-orange-900">Viši pH (npr. 8.0):</strong>
                  <div className="text-orange-700">ORP pada → slabija dezinfekcija čak i s istom količinom klora</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-600">▼</span>
                <div>
                  <strong className="text-orange-900">Niži pH (npr. 7.2):</strong>
                  <div className="text-orange-700">ORP raste → jača dezinfekcija s istom količinom klora</div>
                </div>
              </div>
            </div>
            <p className="font-medium text-gray-900">
              💡 Zato je KLJUČNO održavati pH između 7.2-7.6 za optimalnu učinkovitost klora!
            </p>
          </div>
        </div>

        {/* Practical Example */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
          <h3 className="font-semibold text-gray-900 text-lg mb-4">📊 Praktični primjer</h3>
          <div className="space-y-4 text-sm">
            <div className="bg-white/80 rounded-xl p-4">
              <div className="font-medium text-gray-900 mb-2">Scenarij A: Dobar pH</div>
              <div className="space-y-1 text-gray-700">
                <div>• pH: 7.4 (idealno)</div>
                <div>• Slobodni klor: 1.5 mg/L</div>
                <div>• ORP: 720 mV ✓ (odlična dezinfekcija)</div>
              </div>
            </div>

            <div className="bg-white/80 rounded-xl p-4">
              <div className="font-medium text-gray-900 mb-2">Scenarij B: Loš pH</div>
              <div className="space-y-1 text-gray-700">
                <div>• pH: 8.2 (previsok)</div>
                <div>• Slobodni klor: 1.5 mg/L (ista količina!)</div>
                <div>• ORP: 580 mV ⚠️ (slaba dezinfekcija)</div>
              </div>
            </div>

            <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4">
              <div className="font-bold text-yellow-900">Zaključak:</div>
              <div className="text-yellow-800">
                Ista količina klora, ali u Scenariju B dezinfekcija je <strong>25% slabija</strong> 
                samo zbog visokog pH!
              </div>
            </div>
          </div>
        </div>

        {/* How to use ORP */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="font-semibold text-gray-900 text-lg mb-4">🎯 Kako koristiti ORP u praksi</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">Prvo namjestite pH</div>
                <div>Uvijek prvo dovedite pH na 7.2-7.6 prije regulacije klora</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">Izmjerite ORP</div>
                <div>Provjerite je li ORP u idealnom rasponu (650-750 mV)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">Regulirajte klor prema ORP</div>
                <div>Ako je ORP nizak (&lt; 650), dodajte klor. Ako je visok (&gt; 750), reducirao doziranje.</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/')}
          className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-4 rounded-2xl hover:from-yellow-700 hover:to-orange-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] font-bold text-lg"
        >
          ⚡ Započni analizu sa ORP mjerenjem
        </button>
      </div>
    </div>
  );
}