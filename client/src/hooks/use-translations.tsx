import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Language, translations, getTranslation } from '@/lib/translations';

type TranslationsContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const TranslationsContext = createContext<TranslationsContextType | null>(null);

export function TranslationsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language') as Language;
    return stored && translations[stored] ? stored : 'en';
  });

  // Memoize the translation function to prevent unnecessary re-renders
  const t = useMemo(() => 
    (key: string) => getTranslation(language, key),
    [language]
  );

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('language', newLang);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, t]);

  return (
    <TranslationsContext.Provider value={contextValue}>
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