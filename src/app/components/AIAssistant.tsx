import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { MessageCircle, X, Send, Sparkles, Lightbulb, Wand2, MessageSquare } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { toast } from 'sonner@2.0.3';

interface AIAssistantProps {
  projectType: 'interior' | 'exterior' | null;
  currentStep: string;
}

export function AIAssistant({ projectType, currentStep }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'generate'>('suggestions');

  const getSuggestions = () => {
    const suggestions = {
      'project-type': [
        'Za kupaonicu preporučujemo unutarnji dizajn s jacuzzijem',
        'Vanjski prostori savršeni su za bazene i outdoor spa zone',
        'Razmislite o kombinaciji saune i jacuzzija za wellness zonu',
      ],
      'dimensions': [
        'Standardna sauna zahtijeva minimalno 2m × 2m prostora',
        'Za jacuzzi za 4 osobe potrebno je oko 220cm × 220cm',
        'Bazen olimpijskih dimenzija: 25m × 12.5m × 2m',
      ],
      'photo-upload': [
        'Slikajte prostor s dobrim osvjetljenjem za najbolje rezultate',
        'Snimite fotografiju iz kuta koji prikazuje cijeli prostor',
        'Uklonite nepotrebne predmete prije fotografiranja',
      ],
      'photo-edit': [
        'Koristite alat za brisanje za uklanjanje postojećeg namještaja',
        'Obrezivanje može pomoći fokusirati se na relevantno područje',
        'Osigurajte da su granice prostora jasno vidljive',
      ],
      'boundary-draw': [
        'Označite granice gdje želite postaviti objekt',
        'Crtajte linije duž zidova ili rubova bazena',
        'Točne granice osiguravaju bolju vizualizaciju',
      ],
      'object-upload': [
        'Za najbolje rezultate koristite PNG slike s prozirnom pozadinom',
        'Standardne dimenzije saune: 200cm × 200cm × 200cm',
        'Jacuzzi dimenzije variraju: od 180cm do 250cm',
      ],
      'design-canvas': [
        'Povucite objekte za premještanje po prostoru',
        'Koristite kontrole za precizno skaliranje',
        'Rotirajte objekte za savršeno pozicioniranje',
      ],
    };

    return suggestions[currentStep as keyof typeof suggestions] || [
      'Koristite AI asistenta za prijedloge dizajna',
      'Kliknite na "Generiraj" za automatske preporuke',
      'Kontaktirajte nas za profesionalnu pomoć',
    ];
  };

  const getGeneratedDesigns = () => {
    if (projectType === 'interior') {
      return [
        {
          title: 'Luksuzni Wellness Paket',
          description: 'Finska sauna (200×180cm) + Jacuzzi (220×220cm) s ambient osvjetljenjem',
          icon: '🧖',
        },
        {
          title: 'Kompaktna Spa Zona',
          description: 'Infrared sauna (150×150cm) + Mini bazen za hidromasažu',
          icon: '💆',
        },
        {
          title: 'Premium Home Spa',
          description: 'Velike sauna kabine (250×200cm) + Premium jacuzzi s mlaznicama',
          icon: '✨',
        },
      ];
    } else {
      return [
        {
          title: 'Obiteljski Bazen',
          description: 'Pravokutni bazen (8m×4m) + Vanjski jacuzzi (220×220cm)',
          icon: '🏊',
        },
        {
          title: 'Infinity Pool Dizajn',
          description: 'Infinity edge bazen (10m×5m) + Pool bar zona',
          icon: '🌊',
        },
        {
          title: 'Spa Garden',
          description: 'Prirodni bazen (6m×4m) + Outdoor sauna + Lounge područje',
          icon: '🌿',
        },
      ];
    }
  };

  const handleApplyDesign = (design: { title: string; description: string; icon: string }) => {
    toast.success('💡 Prijedlog dizajna', {
      description: `${design.title}: Ovo su prijedlozi dimenzija - slobodno prilagodite objekte prema ovim preporukama. ${design.description}`,
      duration: 6000,
    });
  };

  const handleGenerateCustom = () => {
    toast.info('✨ Prilagođeni dizajn', {
      description: 'Ovo su prijedlozi dimenzija - slobodno prilagodite objekte prema ovim preporukama. Koristite alate za promjenu veličine i pozicije.',
      duration: 5000,
    });
  };

  const handleAskAI = () => {
    toast.info('💬 AI Asistent', {
      description: 'Pregledajte prijedloge za trenutni korak ili istražite generirane dizajne za inspiraciju.',
      duration: 4000,
    });
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 group ${
          projectType === 'exterior'
            ? 'bg-gradient-to-r from-amber-500 to-yellow-600 shadow-amber-500/50'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-500/50'
        }`}
      >
        <Sparkles className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-h-[600px] animate-in slide-in-from-bottom-5">
          <GlassCard className="p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  projectType === 'exterior'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                }`}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Asistent</h3>
                  <p className="text-xs text-white/60">Vaš dizajnerski pomoćnik</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={activeTab === 'suggestions' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('suggestions')}
                className={
                  activeTab === 'suggestions'
                    ? projectType === 'exterior'
                      ? 'flex-1 bg-gradient-to-r from-amber-500 to-yellow-600'
                      : 'flex-1 bg-gradient-to-r from-indigo-600 to-purple-600'
                    : 'flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10'
                }
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Prijedlozi
              </Button>
              <Button
                variant={activeTab === 'generate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('generate')}
                className={
                  activeTab === 'generate'
                    ? projectType === 'exterior'
                      ? 'flex-1 bg-gradient-to-r from-amber-500 to-yellow-600'
                      : 'flex-1 bg-gradient-to-r from-indigo-600 to-purple-600'
                    : 'flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10'
                }
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generiraj
              </Button>
            </div>

            {/* Content */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {activeTab === 'suggestions' && (
                <>
                  <div className={`rounded-xl p-3 ${
                    projectType === 'exterior'
                      ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30'
                      : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                  }`}>
                    <p className={`text-xs font-semibold mb-1 ${
                      projectType === 'exterior' ? 'text-amber-200' : 'text-purple-200'
                    }`}>💡 Savjet za trenutni korak</p>
                    <p className="text-sm text-white/90">
                      {getSuggestions()[0]}
                    </p>
                  </div>

                  {getSuggestions().slice(1).map((suggestion, index) => (
                    <div
                      key={index}
                      className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <p className="text-sm text-white/80">{suggestion}</p>
                    </div>
                  ))}

                  <div className="pt-2">
                    <Button 
                      className={`w-full ${
                        projectType === 'exterior'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                      }`} 
                      onClick={handleAskAI}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Pitaj AI asistenta
                    </Button>
                  </div>
                </>
              )}

              {activeTab === 'generate' && (
                <>
                  <div className={`rounded-xl p-3 mb-3 ${
                    projectType === 'exterior'
                      ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30'
                      : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                  }`}>
                    <p className={`text-xs font-semibold mb-1 ${
                      projectType === 'exterior' ? 'text-amber-200' : 'text-purple-200'
                    }`}>✨ AI Generirani Dizajni</p>
                    <p className="text-sm text-white/90">
                      Kliknite na dizajn za automatsku primjenu
                    </p>
                  </div>

                  {getGeneratedDesigns().map((design, index) => (
                    <div
                      key={index}
                      className={`bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer group ${
                        projectType === 'exterior'
                          ? 'hover:border-amber-500/50'
                          : 'hover:border-purple-500/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{design.icon}</div>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-white transition-colors ${
                            projectType === 'exterior'
                              ? 'group-hover:text-amber-300'
                              : 'group-hover:text-purple-300'
                          }`}>
                            {design.title}
                          </h4>
                          <p className="text-xs text-white/70 mt-1">{design.description}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className={`w-full mt-3 ${
                          projectType === 'exterior'
                            ? 'bg-gradient-to-r from-amber-600/50 to-yellow-600/50 hover:from-amber-600 hover:to-yellow-600'
                            : 'bg-gradient-to-r from-purple-600/50 to-pink-600/50 hover:from-purple-600 hover:to-pink-600'
                        }`}
                        onClick={() => handleApplyDesign(design)}
                      >
                        <Wand2 className="w-3 h-3 mr-2" />
                        Primijeni dizajn
                      </Button>
                    </div>
                  ))}

                  <div className="pt-2">
                    <Button 
                      className={`w-full ${
                        projectType === 'exterior'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                      }`} 
                      onClick={handleGenerateCustom}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generiraj prilagođeni dizajn
                    </Button>
                  </div>
                </>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}
