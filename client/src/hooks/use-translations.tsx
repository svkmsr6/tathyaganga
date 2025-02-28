import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { Language, translations, getTranslation } from '@/lib/translations';

type TranslationsContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const TranslationsContext = createContext<TranslationsContextType | null>(null);

export function TranslationsProvider({ children }: { children: ReactNode }) {
  // Simple state management that will trigger re-renders
  const [language, setLanguageInternal] = useState<Language>(() => {
    const stored = localStorage.getItem('language') as Language;
    return stored && translations[stored] ? stored : 'en';
  });

  // Ensure setLanguage always has the same reference
  const setLanguage = useCallback((newLang: Language) => {
    localStorage.setItem('language', newLang);
    setLanguageInternal(newLang);
  }, []);

  // Create a new context value every time language changes
  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key: string) => getTranslation(language, key),
  }), [language, setLanguage]);

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