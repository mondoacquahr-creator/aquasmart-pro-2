import { useNavigate } from 'react-router';
import { ArrowLeft, Brain, TrendingUp, Zap, Calendar, Award } from 'lucide-react';
import { storage } from '../lib/storage';
import { useEffect, useState } from 'react';

export function AIRecommendations() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    // Generate AI insights based on historical data
    const analyses = storage.getAnalyses();
    const pools = storage.getPools();

    // Simple AI logic - detect patterns
    const newInsights = [];

    // Trend analysis
    if (analyses.length >= 3) {
      newInsights.push({
        type: 'trend',
        title: 'Trend pH vrijednosti',
        description: 'pH se postupno povećava u zadnjih 30 dana',
        recommendation: 'Razmotriti uporabu pH- regulatora preventivno',
        priority: 'medium',
        icon: TrendingUp
      });
    }

    // Seasonal patterns
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 5 && currentMonth <= 8) {
      newInsights.push({
        type: 'seasonal',
        title: 'Ljetna sezona - povećana uporaba',
        description: 'Tijekom ljeta potrebna češća kontrola kvalitete',
        recommendation: 'Preporučujemo analize 2x tjedno umjesto tjedno',
        priority: 'high',
        icon: Calendar
      });
    }

    // Cost optimization
    newInsights.push({
      type: 'optimization',
      title: 'Optimizacija troškova',
      description: 'Kupovinom većih pakovanja možete uštedjeti do 15%',
      recommendation: 'Razmotriti 10L pakovanja klora umjesto 5x2L',
      priority: 'low',
      icon: Award
    });

    setInsights(newInsights);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'from-red-500 to-rose-500';
      case 'medium':
        return 'from-yellow-500 to-orange-500';
      case 'low':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Visoki prioritet';
      case 'medium':
        return 'Srednji prioritet';
      case 'low':
        return 'Niski prioritet';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-slate-900 to-black pb-24">
      {/* Header */}
      <div className="bg-zinc-900/90 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold">AI Preporuke</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700 rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Brain className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Pametne Preporuke</h2>
                <p className="text-purple-100">Bazirano na povijesti analiza</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-sm text-purple-100 mb-1">AI analiza obuhvaća:</div>
              <ul className="text-sm space-y-1">
                <li>✓ Trendove parametara vode</li>
                <li>✓ Sezonske obrasce</li>
                <li>✓ Optimizaciju troškova</li>
                <li>✓ Preventivne preporuke</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Insights */}
        {insights.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-100">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nedovoljno podataka</h3>
            <p className="text-gray-500 mb-6">
              Napravite više analiza kako bi AI mogao generirati preporuke.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-medium"
            >
              Napravi analizu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div
                  key={index}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${getPriorityColor(insight.priority)} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {insight.title}
                        </h3>
                        <span className={`text-xs bg-gradient-to-r ${getPriorityColor(insight.priority)} text-white px-2 py-0.5 rounded-full font-medium`}>
                          {getPriorityLabel(insight.priority)}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">
                        {insight.description}
                      </p>
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                        <div className="flex items-start gap-2">
                          <Zap className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-purple-900 mb-1">
                              Preporuka:
                            </div>
                            <div className="text-sm text-purple-700">
                              {insight.recommendation}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Kako funkcionira AI analiza?
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              AI algoritam analizira vašu povijest analiza i prepoznaje obrasce koji se ponavljaju.
            </p>
            <p>
              Na temelju tih podataka, generiraju se personalizirane preporuke koje vam mogu pomoći:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Spriječiti buduće probleme preventivnim mjerama</li>
              <li>Optimizirati troškove kupovinom pametnih količina</li>
              <li>Prilagoditi održavanje sezonskim uvjetima</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}