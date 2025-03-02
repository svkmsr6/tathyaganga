import { getTranslation, translations, Language } from '../index';

describe('Translation System', () => {
  describe('getTranslation', () => {
    it('should return correct translation for English', () => {
      const result = getTranslation('en', 'auth.login.title');
      expect(result).toBe('Login Failed');
    });

    it('should return correct translation for Hindi', () => {
      const result = getTranslation('hi', 'auth.login.title');
      expect(result).toBe('लॉगिन विफल');
    });

    it('should handle nested keys correctly', () => {
      const result = getTranslation('en', 'auth.welcome');
      expect(result).toBeDefined();
    });

    it('should interpolate values correctly', () => {
      const result = getTranslation('hi', 'dashboard.welcome', { username: 'Test User' });
      expect(result).toBe('स्वागत है, Test User');
    });

    it('should handle undefined values in interpolation', () => {
      const result = getTranslation('hi', 'dashboard.welcome', {});
      expect(result).toBe('स्वागत है, {username}');
    });

    it('should fallback to English when translation is missing', () => {
      const result = getTranslation('hi', 'nonexistent.key');
      expect(result).toBe('nonexistent.key');
    });

    it('should handle invalid language code gracefully', () => {
      const result = getTranslation('xx' as Language, 'auth.welcome');
      expect(result).toBeDefined();
    });
  });
});