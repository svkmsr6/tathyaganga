import { createContext, useContext, useState, ReactNode } from 'react';
import { Language, translations, getTranslation } from '@/lib/translations';

type TranslationsContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const TranslationsContext = createContext<TranslationsContextType | null>(null);

export function TranslationsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageInternal] = useState<Language>(() => {
    const stored = localStorage.getItem('language') as Language;
    return stored && translations[stored] ? stored : 'en';
  });

  const value = {
    language,
    setLanguage: (newLang: Language) => {
      setLanguageInternal(newLang);
      localStorage.setItem('language', newLang);
      // Force a re-render of all components using translations
      document.documentElement.setAttribute('lang', newLang);
    },
    t: (key: string) => getTranslation(language, key),
  };

  return (
    <TranslationsContext.Provider value={value}>
      {children}
    </TranslationsContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(TranslationsContext);
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationsProvider');
  }
  return context;
}