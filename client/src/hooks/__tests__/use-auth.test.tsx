import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../use-auth';
import { User } from '@shared/schema';
import { toast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
  toast: jest.fn(),
}));

// Mock translations
jest.mock('@/hooks/use-translations', () => ({
  useTranslations: () => ({
    t: (key: string) => key,
  }),
}));

describe('useAuth Hook', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  it('should provide auth context', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.loginMutation).toBeDefined();
    expect(result.current.logoutMutation).toBeDefined();
    expect(result.current.registerMutation).toBeDefined();
  });

  it('should handle successful login', async () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      password: 'hashedpassword',
    };

    // Mock fetch for login
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })
    ) as jest.Mock;

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.loginMutation.mutateAsync({
        username: 'testuser',
        password: 'password123',
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'auth.login.success',
      })
    );
  });

  it('should handle login failure', async () => {
    // Mock fetch for failed login
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      })
    ) as jest.Mock;

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.loginMutation.mutateAsync({
          username: 'testuser',
          password: 'wrongpassword',
        });
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.user).toBeNull();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'auth.login.title',
        variant: 'destructive',
      })
    );
  });

  it('should handle successful registration', async () => {
    const mockUser: User = {
      id: 1,
      username: 'newuser',
      password: 'hashedpassword',
    };

    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })
    ) as jest.Mock;

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.registerMutation.mutateAsync({
        username: 'newuser',
        password: 'password123',
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'auth.register.success',
      })
    );
  });

  it('should handle registration failure', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Username already exists' }),
      })
    ) as jest.Mock;

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.registerMutation.mutateAsync({
          username: 'existinguser',
          password: 'password123',
        });
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.user).toBeNull();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'auth.register.title',
        variant: 'destructive',
      })
    );
  });

  it('should handle logout', async () => {
    // Mock fetch for logout
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
      })
    ) as jest.Mock;

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logoutMutation.mutateAsync();
    });

    expect(result.current.user).toBeNull();
  });

  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});