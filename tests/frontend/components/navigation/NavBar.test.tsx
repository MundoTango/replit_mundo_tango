import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('../../../../client/src/hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

jest.mock('../../../../client/src/lib/queryClient', () => ({
  apiRequest: jest.fn()
}));

// Import component after mocking
import NavBar from '../../../../client/src/components/navigation/NavBar';
import { useAuth } from '../../../../client/src/hooks/useAuth';
import { apiRequest } from '../../../../client/src/lib/queryClient';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('NavBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render navigation for authenticated user', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, name: 'Test User', profileImage: '/images/user.jpg' },
      isAuthenticated: true
    });

    render(<NavBar />, { wrapper: createWrapper() });

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText(/memories/i)).toBeInTheDocument();
    expect(screen.getByText(/community/i)).toBeInTheDocument();
    expect(screen.getByText(/events/i)).toBeInTheDocument();
  });

  it('should render login button for unauthenticated user', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false
    });

    render(<NavBar />, { wrapper: createWrapper() });

    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
    expect(screen.queryByText(/memories/i)).not.toBeInTheDocument();
  });

  it('should show user dropdown menu', async () => {
    const user = userEvent.setup();
    
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, name: 'Test User', username: 'testuser' },
      isAuthenticated: true
    });

    render(<NavBar />, { wrapper: createWrapper() });

    const userButton = screen.getByRole('button', { name: /test user/i });
    await user.click(userButton);

    expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument();
  });

  it('should handle logout', async () => {
    const user = userEvent.setup();
    
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, name: 'Test User' },
      isAuthenticated: true
    });

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true })
    });

    render(<NavBar />, { wrapper: createWrapper() });

    const userButton = screen.getByRole('button', { name: /test user/i });
    await user.click(userButton);

    const logoutButton = screen.getByRole('menuitem', { name: /log out/i });
    await user.click(logoutButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/auth/logout', {});
    });

    expect(window.location.pathname).toBe('/');
  });

  it('should show notification badge', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, name: 'Test User' },
      isAuthenticated: true
    });

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ count: 3 })
    });

    render(<NavBar />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByTestId('notification-badge')).toHaveClass('bg-red-500');
    });
  });

  it('should navigate to different sections', async () => {
    const user = userEvent.setup();
    
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, name: 'Test User' },
      isAuthenticated: true
    });

    render(<NavBar />, { wrapper: createWrapper() });

    const memoriesLink = screen.getByRole('link', { name: /memories/i });
    await user.click(memoriesLink);
    expect(window.location.pathname).toBe('/memories');

    const communityLink = screen.getByRole('link', { name: /community/i });
    await user.click(communityLink);
    expect(window.location.pathname).toBe('/community');

    const eventsLink = screen.getByRole('link', { name: /events/i });
    await user.click(eventsLink);
    expect(window.location.pathname).toBe('/events');
  });

  it('should show active link styling', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, name: 'Test User' },
      isAuthenticated: true
    });

    // Mock current location
    Object.defineProperty(window, 'location', {
      value: { pathname: '/memories' },
      writable: true
    });

    render(<NavBar />, { wrapper: createWrapper() });

    const memoriesLink = screen.getByRole('link', { name: /memories/i });
    expect(memoriesLink).toHaveClass('text-blue-600');
  });

  it('should handle mobile menu toggle', async () => {
    const user = userEvent.setup();
    
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, name: 'Test User' },
      isAuthenticated: true
    });

    render(<NavBar />, { wrapper: createWrapper() });

    const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(mobileMenuButton);

    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    
    // Should show navigation links in mobile menu
    expect(screen.getAllByText(/memories/i)).toHaveLength(2); // Desktop + Mobile
  });

  it('should show search functionality', async () => {
    const user = userEvent.setup();
    
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, name: 'Test User' },
      isAuthenticated: true
    });

    render(<NavBar />, { wrapper: createWrapper() });

    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);

    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();

    await user.type(searchInput, 'tango events{enter}');

    expect(window.location.pathname).toBe('/search');
    expect(window.location.search).toContain('q=tango+events');
  });

  it('should show admin link for admin users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { 
        id: 1, 
        name: 'Admin User',
        roles: ['super_admin']
      },
      isAuthenticated: true
    });

    render(<NavBar />, { wrapper: createWrapper() });

    expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument();
  });

  it('should not show admin link for regular users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { 
        id: 1, 
        name: 'Regular User',
        roles: ['user']
      },
      isAuthenticated: true
    });

    render(<NavBar />, { wrapper: createWrapper() });

    expect(screen.queryByRole('link', { name: /admin/i })).not.toBeInTheDocument();
  });

  it('should show friend requests count', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, name: 'Test User' },
      isAuthenticated: true
    });

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({ json: async () => ({ count: 0 }) }) // Notifications
      .mockResolvedValueOnce({ json: async () => ({ count: 2 }) }); // Friend requests

    render(<NavBar />, { wrapper: createWrapper() });

    await waitFor(() => {
      const friendsBadge = screen.getByTestId('friends-badge');
      expect(friendsBadge).toHaveTextContent('2');
    });
  });

  it('should handle theme toggle', async () => {
    const user = userEvent.setup();
    
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, name: 'Test User' },
      isAuthenticated: true
    });

    render(<NavBar />, { wrapper: createWrapper() });

    const themeButton = screen.getByRole('button', { name: /theme/i });
    await user.click(themeButton);

    expect(document.documentElement).toHaveClass('dark');

    await user.click(themeButton);
    expect(document.documentElement).not.toHaveClass('dark');
  });
});