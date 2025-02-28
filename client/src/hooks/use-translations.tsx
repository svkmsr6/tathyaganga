import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Language, translations, getTranslation } from '@/lib/translations';

type TranslationsContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const TranslationsContext = createContext<TranslationsContextType | null>(null);

export function TranslationsProvider({ children }: { children: ReactNode }) {
  // Use a tuple to force re-renders when language changes
  const [state, setState] = useState<[Language, number]>(() => {
    const stored = localStorage.getItem('language') as Language;
    return [stored && translations[stored] ? stored : 'en', 0];
  });

  const [language] = state;

  const setLanguage = useCallback((newLang: Language) => {
    localStorage.setItem('language', newLang);
    // Increment the counter to force a re-render
    setState([newLang, state[1] + 1]);
  }, [state]);

  const value = {
    language,
    setLanguage,
    t: useCallback((key: string) => getTranslation(language, key), [language]),
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