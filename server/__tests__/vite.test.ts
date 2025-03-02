import { log } from '../vite';

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
  });
});
