import { apiRequest, getQueryFn } from './queryClient';
import { type QueryKey } from '@tanstack/react-query';

describe('Query Client Utilities', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('apiRequest', () => {
    it('should make successful API requests', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const response = await apiRequest('GET', '/api/test');
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {},
        body: undefined,
        credentials: 'include'
      });
      expect(response.ok).toBe(true);
    });

    it('should include JSON body and headers for POST requests with data', async () => {
      const mockData = { test: 'data' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await apiRequest('POST', '/api/test', mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockData),
        credentials: 'include'
      });
    });

    it('should throw error for non-ok responses', async () => {
      const errorMessage = 'Test error';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () => Promise.resolve(errorMessage)
      });

      await expect(apiRequest('GET', '/api/test')).rejects.toThrow('400: Test error');
    });
  });

  describe('getQueryFn', () => {
    // Create a mock AbortSignal for testing
    const mockSignal = new AbortController().signal;
    const mockMeta = {};

    it('should return null on 401 when configured to do so', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 401
      });

      const queryFn = getQueryFn({ on401: 'returnNull' });
      const result = await queryFn({ 
        queryKey: ['/api/test'] as QueryKey,
        signal: mockSignal,
        meta: mockMeta
      });
      expect(result).toBeNull();
    });

    it('should throw on 401 when configured to throw', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 401,
        ok: false,
        text: () => Promise.resolve('Unauthorized')
      });

      const queryFn = getQueryFn({ on401: 'throw' });
      await expect(queryFn({ 
        queryKey: ['/api/test'] as QueryKey,
        signal: mockSignal,
        meta: mockMeta
      })).rejects.toThrow();
    });

    it('should return JSON response for successful requests', async () => {
      const mockData = { test: 'data' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const queryFn = getQueryFn({ on401: 'throw' });
      const result = await queryFn({ 
        queryKey: ['/api/test'] as QueryKey,
        signal: mockSignal,
        meta: mockMeta
      });
      expect(result).toEqual(mockData);
    });
  });
});