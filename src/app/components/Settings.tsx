import { Moon, Sun, Globe, Download, Trash2, Save, FileText, Shield, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../lib/languageContext';
import { NavigationHeader } from './NavigationHeader';

export function Settings() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  
  const [units, setUnits] = useState('metric');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUnits(parsed.units || 'metric');
        setNotifications(parsed.notifications !== false);
        setDarkMode(parsed.darkMode !== false);
      } catch (e) {
        console.error("Error loading settings", e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('app_settings', JSON.stringify({
      units,
      notifications,
      darkMode
    }));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleClearData = async () => {
    if (confirm(t('common.clearData') + '?')) {
      localStorage.clear();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white pb-24">
      {/* Header */}
      <NavigationHeader
        title={t('common.settings')}
        icon={<SettingsIcon className="w-6 h-6 text-[#D4AF37]" />}
        backAction={() => navigate(-1)}
      />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Success Message */}
        {showSuccess && (
          <div className="bg-[#D4AF37] text-black rounded-xl p-4 shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle className="w-6 h-6" />
            <span className="font-bold">{t('common.settingsSaved')}</span>
          </div>
        )}

        {/* Language Selection - GOLD ACCENTED */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest px-1 ml-1 border-l-2 border-[#D4AF37] pl-3">
            {t('common.language')}
          </h2>
          <div className="bg-[#1a1d23] rounded-2xl p-6 shadow-xl border border-amber-500/10">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                <Globe className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-100">{t('common.language')}</h3>
                <p className="text-xs text-gray-400">{t('common.selectLanguage')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
                { id: 'en', name: 'English', flag: '🇬🇧' },
                { id: 'it', name: 'Italiano', flag: '🇮🇹' }
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id as any)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    language === lang.id
                      ? 'border-[#D4AF37] bg-amber-500/5 text-[#D4AF37]'
                      : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-semibold">{lang.name}</span>
                  </div>
                  {language === lang.id && <CheckCircle className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Units Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest px-1 ml-1 border-l-2 border-[#D4AF37] pl-3">
            {t('common.units')}
          </h2>
          <div className="bg-[#1a1d23] rounded-2xl p-6 shadow-xl border border-amber-500/10">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                <Ruler className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-100">{t('common.units')}</h3>
                <p className="text-xs text-gray-400">Metričke ili imperijalne</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setUnits('metric')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  units === 'metric'
                    ? 'border-[#D4AF37] bg-amber-500/5'
                    : 'border-white/5 bg-white/5'
                }`}
              >
                <div className={`font-bold ${units === 'metric' ? 'text-[#D4AF37]' : 'text-gray-300'}`}>
                  {t('common.metric')}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-tight mt-1">Standard Europe</div>
              </button>
              <button
                onClick={() => setUnits('imperial')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  units === 'imperial'
                    ? 'border-[#D4AF37] bg-amber-500/5'
                    : 'border-white/5 bg-white/5'
                }`}
              >
                <div className={`font-bold ${units === 'imperial' ? 'text-[#D4AF37]' : 'text-gray-300'}`}>
                  {t('common.imperial')}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-tight mt-1">USA / UK Standard</div>
              </button>
            </div>
          </div>
        </section>

        {/* Toggle Settings */}
        <div className="bg-[#1a1d23] rounded-2xl p-6 shadow-xl border border-amber-500/10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                <Bell className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-100">{t('common.notifications')}</h3>
                <p className="text-xs text-gray-400">Push obavijesti i upozorenja</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${
                notifications ? 'bg-[#D4AF37]' : 'bg-gray-700'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all transform ${
                notifications ? 'translate-x-6' : 'translate-x-0'
              }`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between opacity-80">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center border border-white/5">
                <Moon className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-300">{t('common.darkMode')}</h3>
                <p className="text-xs text-gray-500">Uvijek aktivno za AcquaSmart Pro</p>
              </div>
            </div>
            <button
              disabled
              className="w-14 h-8 rounded-full bg-[#D4AF37] flex items-center px-1 opacity-50 cursor-not-allowed"
            >
              <div className="w-6 h-6 bg-white rounded-full shadow-md translate-x-6"></div>
            </button>
          </div>
        </div>

        {/* Data Management Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest px-1 ml-1 border-l-2 border-[#D4AF37] pl-3">
            {t('common.dataManagement')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                const data = {
                  pools: storage.getPools(),
                  analyses: storage.getAnalyses(),
                  clients: storage.getClients()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `aquasmart-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
              className="bg-[#1a1d23] rounded-2xl p-5 shadow-lg border border-white/5 hover:border-amber-500/30 transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                <Download className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-200">{t('common.exportData')}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Download JSON Backup</div>
              </div>
            </button>

            <button
              onClick={handleClearData}
              className="bg-[#1a1d23] rounded-2xl p-5 shadow-lg border border-white/5 hover:border-red-500/30 transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 group-hover:bg-red-500/20 transition-all">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-200">{t('common.clearData')}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Reset App State</div>
              </div>
            </button>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <button
            onClick={handleSave}
            className="w-full bg-[#D4AF37] text-black py-4 rounded-2xl hover:bg-[#c4a132] transition-all shadow-xl font-black text-lg flex items-center justify-center gap-2"
          >
            {t('common.saveSettings')}
          </button>
        </div>

        {/* Corporate Branding */}
        <div className="bg-gradient-to-br from-zinc-800 to-black rounded-3xl p-8 border border-amber-500/20 relative overflow-hidden mt-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <div className="flex items-start gap-6 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-amber-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-900/40">
              <Building2 className="w-10 h-10 text-black" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-2xl text-white mb-1">Mondo Acqua <span className="text-[#D4AF37]">d.o.o.</span></h3>
              <p className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.2em] mb-4">Elite Pool Systems</p>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Premium održavanje i automatizirani sustavi za rezidencijalne i komercijalne objekte. 
              </p>
              <a 
                href="https://www.mondo-acqua.hr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] rounded-xl transition-all font-bold text-sm border border-[#D4AF37]/30"
              >
                <ExternalLink className="w-4 h-4" />
                mondo-acqua.hr
              </a>
            </div>
          </div>
          
          <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <div>AcquaSmart Pro v1.0.0 Gold</div>
            <div>© {new Date().getFullYear()} Mondo Acqua d.o.o.</div>
          </div>
        </div>
      </div>
    </div>
  );
}