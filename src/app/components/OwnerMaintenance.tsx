import { useNavigate } from 'react-router';
import { ArrowLeft, Waves, Wind, Trash2, CheckCircle2, Info, ChevronRight, Droplets, Sparkles, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/languageContext';
import { MondoFooter } from './MondoFooter';

export function OwnerMaintenance() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const t = {
    hr: {
      title: "Održavanje bazena",
      subtitle: "Profesionalni vodič za njegu",
      backwash: "Ispiranje filtera (Backwash)",
      backwashDesc: "Čišćenje filtarskog pijeska ili stakla radi boljeg protoka.",
      vacuum: "Usisavanje bazena",
      vacuumDesc: "Uklanjanje nečistoća s dna bazena.",
      skimmer: "Čišćenje skimera",
      skimmerDesc: "Uklanjanje lišća i krupnog otpada iz košarica.",
      winter: "Zimsko održavanje",
      winterDesc: "Priprema bazena za niske temperature.",
      steps: "Koraci:",
      done: "Završi zadatak",
      caution: "PAŽNJA: Uvijek ugasite pumpu prije okretanja ventila!",
      backwashSteps: [
        "Ugasite cirkulacijsku pumpu.",
        "Okrenite 6-putni ventil u položaj 'BACKWASH'.",
        "Upalite pumpu i pustite da radi dok voda u kontrolnom staklu ne postane čista (2-3 min).",
        "Ugasite pumpu.",
        "Okrenite ventil u položaj 'RINSE' (Ispiranje).",
        "Upalite pumpu na 30 sekundi.",
        "Ugasite pumpu i vratite ventil u položaj 'FILTER'."
      ],
      vacuumSteps: [
        "Spojite crijevo usisavača na tanjur skimera ili usisnu mlaznicu.",
        "Potopite crijevo u vodu kako biste istisnuli zrak.",
        "Provjerite je li ventil usisa otvoren, a ostali ventili (skimeri, podni ispust) djelomično zatvoreni za jači potisak.",
        "Polako usisavajte dno bazena.",
        "Nakon završetka, očistite predfilter pumpe."
      ],
      skimmerSteps: [
        "Otvorite poklopac skimera.",
        "Izvadite košaricu i ispraznite sadržaj.",
        "Isperite košaricu vodom pod pritiskom.",
        "Vratite košaricu i provjerite je li pravilno sjela.",
        "Ponovite postupak za sve skimere u bazenu."
      ]
    },
    en: {
      title: "Pool Maintenance",
      subtitle: "Professional Care Guide",
      backwash: "Filter Backwash",
      backwashDesc: "Cleaning filter sand or glass for better flow.",
      vacuum: "Pool Vacuuming",
      vacuumDesc: "Removing debris from the pool floor.",
      skimmer: "Skimmer Cleaning",
      skimmerDesc: "Removing leaves and large debris from baskets.",
      winter: "Winterization",
      winterDesc: "Preparing the pool for low temperatures.",
      steps: "Steps:",
      done: "Finish Task",
      caution: "CAUTION: Always turn off the pump before turning the valve!",
      backwashSteps: [
        "Turn off the circulation pump.",
        "Turn the 6-way valve to 'BACKWASH' position.",
        "Turn on the pump and let it run until water in sight glass is clear (2-3 min).",
        "Turn off the pump.",
        "Turn the valve to 'RINSE' position.",
        "Turn on the pump for 30 seconds.",
        "Turn off the pump and return valve to 'FILTER' position."
      ],
      vacuumSteps: [
        "Connect the vacuum hose to the skimmer plate or suction nozzle.",
        "Submerge the hose to push out all air.",
        "Ensure suction valve is open, partially close others for stronger suction.",
        "Slowly vacuum the pool floor.",
        "Clean the pump pre-filter after finishing."
      ],
      skimmerSteps: [
        "Open the skimmer lid.",
        "Remove the basket and empty contents.",
        "Rinse the basket with pressurized water.",
        "Return the basket and ensure it fits correctly.",
        "Repeat for all skimmers."
      ]
    }
  }[language === 'hr' ? 'hr' : 'en'];

  const [activeTask, setActiveTask] = useState<string | null>(null);

  const tasks = [
    { id: 'backwash', icon: Filter, title: t.backwash, desc: t.backwashDesc, steps: t.backwashSteps, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'vacuum', icon: Waves, title: t.vacuum, desc: t.vacuumDesc, steps: t.vacuumSteps, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'skimmer', icon: Trash2, title: t.skimmer, desc: t.skimmerDesc, steps: t.skimmerSteps, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white pb-24 relative overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#D4AF37]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <div className="bg-[#0a0c10]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-xl transition-all border border-white/5">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <h1 className="text-lg font-black uppercase tracking-tight">{t.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8 relative z-10">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a1d23] to-[#0a0c10] rounded-[2.5rem] p-8 border border-white/5"
        >
          <p className="text-gray-400 text-sm font-medium leading-relaxed italic">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Task List */}
        <div className="grid gap-4">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-[#1a1d23] rounded-[2rem] border transition-all overflow-hidden ${
                activeTask === task.id ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/30' : 'border-white/5'
              }`}
            >
              <button
                onClick={() => setActiveTask(activeTask === task.id ? null : task.id)}
                className="w-full p-6 flex items-center justify-between group"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 ${task.bg} rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform`}>
                    <task.icon className={`w-7 h-7 ${task.color}`} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-lg tracking-tight uppercase italic">{task.title}</h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{task.desc}</p>
                  </div>
                </div>
                <ChevronRight className={`w-6 h-6 text-gray-700 transition-transform ${activeTask === task.id ? 'rotate-90 text-[#D4AF37]' : ''}`} />
              </button>

              {activeTask === task.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-6 pb-8 border-t border-white/5"
                >
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6">
                    <div className="flex items-center gap-3 text-red-500">
                       <Info className="w-5 h-5 flex-shrink-0" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{t.caution}</span>
                    </div>
                  </div>

                  <h4 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-4 ml-1">{t.steps}</h4>
                  <div className="space-y-3">
                    {task.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="w-6 h-6 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-black text-[#D4AF37]">{idx + 1}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-300 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveTask(null)}
                    className="w-full mt-8 bg-[#D4AF37] text-black py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t.done}
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Pro Tip */}
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-6 flex gap-4">
          <Info className="w-6 h-6 text-blue-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            <strong className="text-blue-400 uppercase tracking-widest block mb-1">Savjet stručnjaka</strong>
            Redovito održavanje produžuje vijek trajanja vaše opreme i štedi novac na kemikalijama. Ispiranje filtera preporučuje se barem jednom tjedno tijekom sezone.
          </p>
        </div>
      </div>

      <MondoFooter />
    </div>
  );
}
