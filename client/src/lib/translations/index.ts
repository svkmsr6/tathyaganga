import en from './en';
import hi from './hi';
import bn from './bn';
import kn from './kn';

export const translations = {
  en,
  hi,
  bn,
  kn,
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof en;

export const languageNames = {
  en: "English",
  hi: "हिंदी",
  bn: "বাংলা",
  kn: "ಕನ್ನಡ",
} as const;

export function getTranslation(lang: Language, key: string) {
  const keys = key.split('.');
  let current: any = translations[lang];
  
  for (const k of keys) {
    if (current[k] === undefined) {
      console.warn(`Translation missing for key: ${key} in language: ${lang}`);
      return translations.en[k] || key;
    }
    current = current[k];
  }
  
  return current;
}
