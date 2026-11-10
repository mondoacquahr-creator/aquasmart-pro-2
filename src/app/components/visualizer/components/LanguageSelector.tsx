import { Globe } from 'lucide-react';
import { Language } from '../i18n/translations';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'home' | 'app';
}

const LANGUAGES = [
  { code: 'hr' as Language, name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
  { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it' as Language, name: 'Italiano', flag: '🇮🇹' },
];

export function LanguageSelector({ variant = 'app' }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();

  if (variant === 'home') {
    // Large button selector for home page
    return (
      <div className="flex flex-wrap justify-center gap-3">
        {LANGUAGES.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`
                group relative px-6 py-3 rounded-2xl
                transition-all duration-300
                ${isActive
                  ? 'bg-gradient-to-r from-blue-500 to-sky-600 shadow-lg shadow-blue-500/50 scale-105'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <span className={`font-semibold ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                  {lang.name}
                </span>
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Compact dropdown for app pages
  return (
    <div className="relative group">
      <button
        className="
          flex items-center gap-2 px-4 py-2 rounded-xl
          bg-white/5 backdrop-blur-md border border-white/10
          hover:bg-white/10 hover:border-white/20
          transition-all duration-300
        "
      >
        <Globe className="w-4 h-4 text-white/70" />
        <span className="text-sm font-medium text-white/90">
          {LANGUAGES.find(l => l.code === language)?.flag}
        </span>
      </button>

      {/* Dropdown */}
      <div className="
        absolute right-0 top-full mt-2
        w-48 rounded-xl overflow-hidden
        bg-slate-900/95 backdrop-blur-xl border border-white/10
        shadow-2xl
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all duration-300
        z-50
      ">
        {LANGUAGES.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`
                w-full px-4 py-3 flex items-center gap-3
                transition-all duration-200
                ${isActive
                  ? 'bg-blue-500/20 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="font-medium text-sm">{lang.name}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}