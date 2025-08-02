import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { jest } from '@jest/globals';

// Mock API
jest.mock('../../../client/src/lib/queryClient', () => ({
  apiRequest: jest.fn()
}));

// Import hook after mocking
import { useAuth } from '../../../client/src/hooks/useAuth';
import { apiRequest } from '../../../client/src/lib/queryClient';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user data on mount', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser'
    };

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => mockUser
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeUndefined();
    expect(result.current.isAuthenticated).toBe(false);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(apiRequest).toHaveBeenCalledWith('GET', '/api/auth/user');
  });

  it('should handle unauthenticated state', async () => {
    (apiRequest as jest.Mock).mockRejectedValue(
      new Error('401: Unauthorized')
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should provide login function', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    };

    (apiRequest as jest.Mock)
      .mockRejectedValueOnce(new Error('401: Unauthorized')) // Initial load
      .mockResolvedValueOnce({ // Login request
        json: async () => ({ success: true, user: mockUser })
      })
      .mockResolvedValueOnce({ // Refresh after login
        json: async () => mockUser
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Initially not authenticated
    expect(result.current.isAuthenticated).toBe(false);

    // Call login
    await result.current.login({
      email: 'test@example.com',
      password: 'password123'
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(apiRequest).toHaveBeenCalledWith('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should provide logout function', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User'
    };

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({ // Initial load
        json: async () => mockUser
      })
      .mockResolvedValueOnce({ // Logout request
        json: async () => ({ success: true })
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    // Call logout
    await result.current.logout();

    expect(apiRequest).toHaveBeenCalledWith('POST', '/api/auth/logout', {});
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should provide register function', async () => {
    const newUser = {
      id: 1,
      name: 'New User',
      email: 'new@example.com'
    };

    (apiRequest as jest.Mock)
      .mockRejectedValueOnce(new Error('401: Unauthorized')) // Initial load
      .mockResolvedValueOnce({ // Register request
        json: async () => ({ success: true, user: newUser })
      })
      .mockResolvedValueOnce({ // Auto-login after register
        json: async () => newUser
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Call register
    await result.current.register({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123'
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(newUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should provide updateProfile function', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      bio: 'Original bio'
    };

    const updatedUser = {
      ...mockUser,
      bio: 'Updated bio'
    };

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({ // Initial load
        json: async () => mockUser
      })
      .mockResolvedValueOnce({ // Update request
        json: async () => ({ success: true, user: updatedUser })
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    // Call updateProfile
    await result.current.updateProfile({
      bio: 'Updated bio'
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(updatedUser);
    });

    expect(apiRequest).toHaveBeenCalledWith('PUT', '/api/user/profile', {
      bio: 'Updated bio'
    });
  });

  it('should check permissions', async () => {
    const mockUser = {
      id: 1,
      name: 'Admin User',
      roles: ['admin', 'moderator']
    };

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => mockUser
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('moderator')).toBe(true);
    expect(result.current.hasRole('super_admin')).toBe(false);
    expect(result.current.hasAnyRole(['user', 'admin'])).toBe(true);
    expect(result.current.hasAllRoles(['admin', 'moderator'])).toBe(true);
    expect(result.current.hasAllRoles(['admin', 'super_admin'])).toBe(false);
  });

  it('should handle network errors', async () => {
    (apiRequest as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toEqual(new Error('Network error'));
  });

  it('should refresh user data', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      credits: 100
    };

    const updatedUser = {
      ...mockUser,
      credits: 150
    };

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => mockUser
      })
      .mockResolvedValueOnce({
        json: async () => updatedUser
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    // Call refresh
    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.user).toEqual(updatedUser);
    });
  });

  it('should handle token refresh', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User'
    };

    let tokenExpired = true;

    (apiRequest as jest.Mock).mockImplementation((method, url) => {
      if (url === '/api/auth/user' && tokenExpired) {
        tokenExpired = false;
        return Promise.reject(new Error('401: Token expired'));
      }
      
      if (url === '/api/auth/refresh') {
        return Promise.resolve({
          json: async () => ({ success: true, token: 'new-token' })
        });
      }

      return Promise.resolve({
        json: async () => mockUser
      });
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have attempted refresh and succeeded
    expect(apiRequest).toHaveBeenCalledWith('POST', '/api/auth/refresh', {});
    expect(result.current.user).toEqual(mockUser);
  });
});