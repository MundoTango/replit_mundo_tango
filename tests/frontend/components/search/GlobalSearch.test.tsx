import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('../../../../client/src/lib/queryClient', () => ({
  apiRequest: jest.fn()
}));

jest.mock('../../../../client/src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Current User' },
    isAuthenticated: true
  })
}));

// Import component after mocking
import GlobalSearch from '../../../../client/src/components/search/GlobalSearch';
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

const mockSearchResults = {
  users: [
    {
      id: 2,
      name: 'Maria Gonzalez',
      username: 'mariag',
      profileImage: '/images/maria.jpg',
      city: 'Buenos Aires'
    }
  ],
  posts: [
    {
      id: 1,
      content: 'Amazing milonga last night at Salon Canning!',
      author: { name: 'Carlos Rodriguez' },
      createdAt: '2025-08-01T22:00:00Z',
      likes: 24
    }
  ],
  events: [
    {
      id: 1,
      title: 'Milonga at Salon Canning',
      eventType: 'milonga',
      startDate: '2025-09-01T20:00:00Z',
      location: 'Salon Canning'
    }
  ],
  groups: [
    {
      id: 1,
      name: 'Buenos Aires Tango Community',
      memberCount: 1250,
      imageUrl: '/images/ba-tango.jpg'
    }
  ]
};

describe('GlobalSearch Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input', () => {
    render(<GlobalSearch />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('should perform search on input', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, results: mockSearchResults })
    });

    render(<GlobalSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'tango');

    // Advance timers to trigger debounced search
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        expect.stringMatching(/q=tango/)
      );
    });

    jest.useRealTimers();
  });

  it('should display search results in categories', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, results: mockSearchResults })
    });

    render(<GlobalSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'tango');

    await waitFor(() => {
      // Users section
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
      
      // Posts section
      expect(screen.getByText('Posts')).toBeInTheDocument();
      expect(screen.getByText(/amazing milonga last night/i)).toBeInTheDocument();
      
      // Events section
      expect(screen.getByText('Events')).toBeInTheDocument();
      expect(screen.getByText('Milonga at Salon Canning')).toBeInTheDocument();
      
      // Groups section
      expect(screen.getByText('Groups')).toBeInTheDocument();
      expect(screen.getByText('Buenos Aires Tango Community')).toBeInTheDocument();
    });
  });

  it('should navigate to user profile on click', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, results: mockSearchResults })
    });

    render(<GlobalSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'maria');

    await waitFor(() => {
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Maria Gonzalez'));

    expect(window.location.pathname).toBe('/users/mariag');
  });

  it('should show recent searches', async () => {
    const user = userEvent.setup();
    
    // Mock localStorage
    const recentSearches = ['milonga', 'buenos aires', 'tango lessons'];
    Storage.prototype.getItem = jest.fn(() => JSON.stringify(recentSearches));

    render(<GlobalSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/search/i);
    await user.click(input);

    expect(screen.getByText('Recent Searches')).toBeInTheDocument();
    expect(screen.getByText('milonga')).toBeInTheDocument();
    expect(screen.getByText('buenos aires')).toBeInTheDocument();
    expect(screen.getByText('tango lessons')).toBeInTheDocument();
  });

  it('should clear recent searches', async () => {
    const user = userEvent.setup();
    
    const recentSearches = ['milonga'];
    Storage.prototype.getItem = jest.fn(() => JSON.stringify(recentSearches));
    Storage.prototype.removeItem = jest.fn();

    render(<GlobalSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/search/i);
    await user.click(input);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(Storage.prototype.removeItem).toHaveBeenCalledWith('recentSearches');
  });

  it('should show loading state', () => {
    (apiRequest as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<GlobalSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'test' } });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show no results message', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        results: {
          users: [],
          posts: [],
          events: [],
          groups: []
        }
      })
    });

    render(<GlobalSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'nonexistent');

    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });

  it('should filter results by type', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, results: mockSearchResults })
    });

    render(<GlobalSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'tango');

    await waitFor(() => {
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
    });

    // Click filter for users only
    const usersFilter = screen.getByRole('button', { name: /users only/i });
    await user.click(usersFilter);

    await waitFor(() => {
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
      expect(screen.queryByText(/amazing milonga/i)).not.toBeInTheDocument();
      expect(screen.queryByText('Milonga at Salon Canning')).not.toBeInTheDocument();
    });
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, results: mockSearchResults })
    });

    render(<GlobalSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'tango');

    await waitFor(() => {
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
    });

    // Press down arrow
    await user.keyboard('{ArrowDown}');
    
    const firstResult = screen.getByText('Maria Gonzalez').closest('[role="option"]');
    expect(firstResult).toHaveClass('highlighted');

    // Press Enter to select
    await user.keyboard('{Enter}');
    
    expect(window.location.pathname).toBe('/users/mariag');
  });

  it('should close on escape key', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, results: mockSearchResults })
    });

    render(<GlobalSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'tango');

    await waitFor(() => {
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');

    expect(screen.queryByText('Maria Gonzalez')).not.toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('should save search to recent', async () => {
    const user = userEvent.setup();
    
    Storage.prototype.setItem = jest.fn();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, results: mockSearchResults })
    });

    render(<GlobalSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'milonga{Enter}');

    await waitFor(() => {
      expect(Storage.prototype.setItem).toHaveBeenCalledWith(
        'recentSearches',
        expect.stringContaining('milonga')
      );
    });
  });

  it('should handle search error', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(<GlobalSearch />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'test');

    await waitFor(() => {
      expect(screen.getByText(/error performing search/i)).toBeInTheDocument();
    });
  });

  it('should show trending searches', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        trending: ['milonga tonight', 'tango lessons', 'buenos aires events']
      })
    });

    render(<GlobalSearch showTrending />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/search/i);
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText('Trending')).toBeInTheDocument();
      expect(screen.getByText('milonga tonight')).toBeInTheDocument();
      expect(screen.getByText('tango lessons')).toBeInTheDocument();
    });
  });

  it('should support advanced search', async () => {
    const user = userEvent.setup();
    
    render(<GlobalSearch />, { wrapper: createWrapper() });

    const advancedButton = screen.getByRole('button', { name: /advanced/i });
    await user.click(advancedButton);

    expect(screen.getByRole('dialog', { name: /advanced search/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/search in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date range/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
  });
});