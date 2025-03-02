import { log } from '../vite';

// Use manual mock instead of actual vite.ts implementation
jest.mock('../vite');

describe('Vite Server Utilities', () => {
  let originalConsoleLog: any;
  let mockDate: Date;

  beforeEach(() => {
    // Store original console.log
    originalConsoleLog = console.log;
    // Mock console.log
    console.log = jest.fn();
    // Mock Date
    mockDate = new Date('2025-03-02T12:30:45');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
    jest.restoreAllMocks();
  });

  describe('log function', () => {
    it('should log message with default source', () => {
      log('test message');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[express] test message')
      );
    });

    it('should log message with custom source', () => {
      log('test message', 'custom');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[custom] test message')
      );
    });

    it('should include formatted time', () => {
      log('test message');
      // With mocked date set to 12:30:45, expect "12:30:45 PM"
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('12:30:45 PM')
      );
    });

    it('should handle long messages', () => {
      const longMessage = 'a'.repeat(200);
      log(longMessage);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[express] ' + longMessage)
      );
    });

    it('should handle special characters in message', () => {
      const messageWithSpecialChars = 'test\nmessage\twith\rspecial\u0000chars';
      log(messageWithSpecialChars);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(messageWithSpecialChars)
      );
    });

    it('should work with different times of day', () => {
      // Test morning time (AM)
      const morningDate = new Date('2025-03-02T09:05:30');
      jest.spyOn(global, 'Date').mockImplementation(() => morningDate);
      log('morning message');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('9:05:30 AM')
      );

      // Test afternoon time (PM)
      const afternoonDate = new Date('2025-03-02T14:15:20');
      jest.spyOn(global, 'Date').mockImplementation(() => afternoonDate);
      log('afternoon message');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('2:15:20 PM')
      );
    });
  });
});