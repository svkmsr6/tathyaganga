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

export function getTranslation(lang: Language, key: string, values?: Record<string, any>): string {
  try {
    const keys = key.split('.');
    let current: any = translations[lang];

    for (const k of keys) {
      if (current[k] === undefined) {
        console.warn(`Translation missing for key: ${key} in language: ${lang}`);
        // Fallback to English
        current = translations.en;
        for (const fallbackKey of keys) {
          if (current[fallbackKey] === undefined) {
            return key; // Return the key itself if translation missing in English
          }
          current = current[fallbackKey];
        }
        break;
      }
      current = current[k];
    }

    // If we have values to interpolate
    if (values && typeof current === 'string') {
      return current.replace(/\{(\w+)\}/g, (match, key) => {
        return values[key]?.toString() ?? match;
      });
    }

    return current;
  } catch (error) {
    console.error(`Error getting translation for key: ${key} in language: ${lang}`, error);
    return key;
  }
}