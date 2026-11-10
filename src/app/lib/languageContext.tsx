import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { translations } from './translations';

type Language = 'hr' | 'en' | 'it';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('poolapp_lang') as Language) || 'hr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('poolapp_lang', lang);
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let result: any = translations[language];
    
    for (const key of keys) {
      if (result && result[key]) {
        result = result[key];
      } else {
        // Fallback to HR if key missing in current language
        let fallback: any = translations['hr'];
        for (const fKey of keys) {
            if (fallback && fallback[fKey]) {
                fallback = fallback[fKey];
            } else {
                return path; // Key completely missing
            }
        }
        return String(fallback);
      }
    }
    return String(result);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
