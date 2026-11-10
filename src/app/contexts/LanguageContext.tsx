import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language, translations, Translations } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  currentLanguage: Language; // Alias za kompatibilnost
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'mondo-acqua-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Try to get saved language from localStorage, default to Croatian
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved && ['hr', 'en', 'de', 'it'].includes(saved)) {
        return saved as Language;
      }
    }
    return 'hr'; // DEFAULT: Hrvatski
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  };

  // Auto-reset na Hrvatski ako localStorage ima nevalidan jezik
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (!saved || !['hr', 'en', 'de', 'it'].includes(saved)) {
        setLanguage('hr');
      }
    }
  }, []);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, currentLanguage: language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
