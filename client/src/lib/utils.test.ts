import { cn, stripHtml, truncateText } from './utils';

describe('Utility Functions', () => {
  describe('cn function', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', undefined, null, 'bar', false, true, 'baz')).toBe('foo bar baz');
    });

    it('should merge tailwind classes correctly', () => {
      // Test that redundant padding classes are merged
      expect(cn('px-2 py-1', 'p-2')).toBe('p-2');

      // Test conflicting background colors - verify only one remains and hover state is preserved
      const result = cn('bg-red-500 hover:bg-red-700', 'bg-blue-500');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('hover:bg-red-700');
      expect(result).not.toContain('bg-red-500');
    });
  });

  describe('stripHtml function', () => {
    it('should remove HTML tags', () => {
      expect(stripHtml('<p>Hello <strong>World</strong></p>')).toBe('Hello World');
    });

    it('should handle empty string', () => {
      expect(stripHtml('')).toBe('');
    });

    it('should handle text without HTML', () => {
      expect(stripHtml('Plain text')).toBe('Plain text');
    });

    it('should handle nested HTML tags', () => {
      expect(stripHtml('<div><p>Hello <span>Beautiful</span> <strong>World</strong></p></div>'))
        .toBe('Hello Beautiful World');
    });

    it('should handle HTML entities', () => {
      expect(stripHtml('Hello &amp; World')).toBe('Hello & World');
    });
  });

  describe('truncateText function', () => {
    it('should truncate text longer than maxLength', () => {
      expect(truncateText('This is a long text', 7)).toBe('This is...');
    });

    it('should not truncate text shorter than maxLength', () => {
      expect(truncateText('Short', 10)).toBe('Short');
    });

    it('should handle text equal to maxLength', () => {
      expect(truncateText('Exact len', 9)).toBe('Exact len');
    });

    it('should use default maxLength of 100', () => {
      const longText = 'a'.repeat(120);
      expect(truncateText(longText)).toBe('a'.repeat(100) + '...');
    });

    it('should handle empty string', () => {
      expect(truncateText('')).toBe('');
    });
  });
});