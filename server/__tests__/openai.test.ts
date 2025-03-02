/// <reference types="jest" />

// Mock OpenAI module
jest.mock('openai');

describe('Fact Check Service', () => {
  let mockCreate: jest.Mock;
  let factCheck: typeof import('../openai').factCheck;

  beforeEach(() => {
    // Reset all mocks and modules
    jest.resetModules();
    jest.clearAllMocks();

    // Setup fresh mocks for each test
    mockCreate = jest.fn();
    const mockOpenAIInstance = {
      chat: {
        completions: {
          create: mockCreate
        }
      }
    };

    // Update the mock implementation
    const { OpenAI } = require('openai');
    (OpenAI as jest.Mock).mockImplementation(() => mockOpenAIInstance);

    // Re-import the factCheck function after mocks are set up
    factCheck = require('../openai').factCheck;
  });

  describe('factCheck', () => {
    it('should return fact check results in English', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 85,
              explanation: "The content is mostly accurate",
              suggestions: ["Add more references"]
            })
          }
        }]
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result = await factCheck("Test content", "en");

      expect(result).toEqual({
        score: 85,
        explanation: "The content is mostly accurate",
        suggestions: ["Add more references"]
      });

      expect(mockCreate).toHaveBeenCalledWith({
        model: "gpt-4o",
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: "system",
            content: expect.stringContaining("English")
          })
        ]),
        response_format: { type: "json_object" }
      });
    });

    it('should return fact check results in Hindi', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 75,
              explanation: "सामग्री काफी हद तक सटीक है",
              suggestions: ["अधिक संदर्भ जोड़ें"]
            })
          }
        }]
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result = await factCheck("Test content", "hi");

      expect(result).toEqual({
        score: 75,
        explanation: "सामग्री काफी हद तक सटीक है",
        suggestions: ["अधिक संदर्भ जोड़ें"]
      });

      expect(mockCreate).toHaveBeenCalledWith({
        model: "gpt-4o",
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: "system",
            content: expect.stringContaining("Hindi")
          })
        ]),
        response_format: { type: "json_object" }
      });
    });

    it('should handle network errors gracefully', async () => {
      mockCreate.mockRejectedValueOnce({
        code: 'ECONNREFUSED'
      });

      await expect(factCheck("Test content", "en")).rejects.toThrow("network error");
    });

    it('should handle service unavailable errors', async () => {
      mockCreate.mockRejectedValueOnce(
        new Error("service error")
      );

      await expect(factCheck("Test content", "en")).rejects.toThrow("service unavailable");
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: "invalid json"
          }
        }]
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      await expect(factCheck("Test content", "en")).rejects.toThrow("service unavailable");
    });

    it('should handle missing required fields in response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              suggestions: ["Add more references"]
            })
          }
        }]
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      await expect(factCheck("Test content", "en")).rejects.toThrow("service unavailable");
    });

    it('should cap score between 0 and 100', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 120,
              explanation: "Test explanation",
              suggestions: ["Test suggestion"]
            })
          }
        }]
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result = await factCheck("Test content", "en");
      expect(result.score).toBe(100);
    });

    it('should handle empty suggestions array', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 90,
              explanation: "Test explanation",
              suggestions: []
            })
          }
        }]
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result = await factCheck("Test content", "en");
      expect(result.suggestions).toEqual([]);
    });

    it('should fallback to English for unsupported languages', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 85,
              explanation: "The content is mostly accurate",
              suggestions: ["Add more references"]
            })
          }
        }]
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result = await factCheck("Test content", "fr"); // Unsupported language
      expect(result).toBeDefined();
      expect(result.score).toBe(85);
    });

    it('should handle Bengali language responses', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 80,
              explanation: "বিষয়বস্তু বেশিরভাগই সঠিক",
              suggestions: ["আরও তথ্যসূত্র যোগ করুন"]
            })
          }
        }]
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result = await factCheck("Test content", "bn");
      expect(result.explanation).toBe("বিষয়বস্তু বেশিরভাগই সঠিক");
    });

    it('should handle Kannada language responses', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 70,
              explanation: "ವಿಷಯವು ಹೆಚ್ಚಾಗಿ ನಿಖರವಾಗಿದೆ",
              suggestions: ["ಹೆಚ್ಚಿನ ಉಲ್ಲೇಖಗಳನ್ನು ಸೇರಿಸಿ"]
            })
          }
        }]
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result = await factCheck("Test content", "kn");
      expect(result.explanation).toBe("ವಿಷಯವು ಹೆಚ್ಚಾಗಿ ನಿಖರವಾಗಿದೆ");
    });

    it('should handle timeout errors', async () => {
      mockCreate.mockRejectedValueOnce(new Error('timeout'));
      await expect(factCheck("Test content", "en")).rejects.toThrow("network error");
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        choices: []
      };

      mockCreate.mockResolvedValueOnce(mockResponse);
      await expect(factCheck("Test content", "en")).rejects.toThrow("service unavailable");
    });
  });
});