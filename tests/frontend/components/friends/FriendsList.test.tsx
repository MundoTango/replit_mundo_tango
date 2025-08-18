import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('../../../../client/src/lib/queryClient', () => ({
  apiRequest: jest.fn(),
  queryClient: {
    invalidateQueries: jest.fn()
  }
}));

jest.mock('../../../../client/src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Current User' },
    isAuthenticated: true
  })
}));

// Import component after mocking
import FriendsList from '../../../../client/src/components/friends/FriendsList';
import { apiRequest, queryClient } from '../../../../client/src/lib/queryClient';

const createWrapper = () => {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const mockFriends = [
  {
    id: 2,
    name: 'Maria Gonzalez',
    username: 'mariag',
    profileImage: '/images/maria.jpg',
    city: 'Buenos Aires',
    country: 'Argentina',
    mutualFriends: 12,
    status: 'online',
    friendshipDate: '2025-01-15'
  },
  {
    id: 3,
    name: 'Carlos Rodriguez',
    username: 'carlosr',
    profileImage: '/images/carlos.jpg',
    city: 'New York',
    country: 'USA',
    mutualFriends: 5,
    status: 'offline',
    lastSeen: '2 hours ago',
    friendshipDate: '2024-12-20'
  }
];

const mockRequests = [
  {
    id: 4,
    name: 'Ana Silva',
    username: 'anas',
    profileImage: '/images/ana.jpg',
    city: 'Paris',
    country: 'France',
    mutualFriends: 3,
    requestDate: '2025-08-01'
  }
];

describe('FriendsList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render friends list', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, friends: mockFriends })
    });

    render(<FriendsList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
      expect(screen.getByText('Carlos Rodriguez')).toBeInTheDocument();
      expect(screen.getByText('12 mutual friends')).toBeInTheDocument();
    });
  });

  it('should show online status', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, friends: mockFriends })
    });

    render(<FriendsList />, { wrapper: createWrapper() });

    await waitFor(() => {
      const mariaCard = screen.getByText('Maria Gonzalez').closest('[data-friend-id]');
      expect(within(mariaCard!).getByTestId('online-indicator')).toBeInTheDocument();
      
      const carlosCard = screen.getByText('Carlos Rodriguez').closest('[data-friend-id]');
      expect(within(carlosCard!).getByText('2 hours ago')).toBeInTheDocument();
    });
  });

  it('should handle friend requests tab', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, friends: mockFriends })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, requests: mockRequests })
      });

    render(<FriendsList />, { wrapper: createWrapper() });

    const requestsTab = screen.getByRole('tab', { name: /requests/i });
    await user.click(requestsTab);

    await waitFor(() => {
      expect(screen.getByText('Ana Silva')).toBeInTheDocument();
      expect(screen.getByText('3 mutual friends')).toBeInTheDocument();
    });
  });

  it('should accept friend request', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, friends: [] })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, requests: mockRequests })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<FriendsList />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('tab', { name: /requests/i }));

    await waitFor(() => {
      expect(screen.getByText('Ana Silva')).toBeInTheDocument();
    });

    const acceptButton = screen.getByRole('button', { name: /accept/i });
    await user.click(acceptButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/friends/requests/4/accept', {});
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['/api/friends']
      });
    });
  });

  it('should decline friend request', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, friends: [] })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, requests: mockRequests })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<FriendsList />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('tab', { name: /requests/i }));

    await waitFor(() => {
      expect(screen.getByText('Ana Silva')).toBeInTheDocument();
    });

    const declineButton = screen.getByRole('button', { name: /decline/i });
    await user.click(declineButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/friends/requests/4/decline', {});
    });
  });

  it('should search friends', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, friends: mockFriends })
    });

    render(<FriendsList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search friends/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search friends/i);
    await user.type(searchInput, 'maria');

    await waitFor(() => {
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
      expect(screen.queryByText('Carlos Rodriguez')).not.toBeInTheDocument();
    });
  });

  it('should unfriend user', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, friends: mockFriends })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<FriendsList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
    });

    const mariaCard = screen.getByText('Maria Gonzalez').closest('[data-friend-id]');
    const moreButton = within(mariaCard!).getByRole('button', { name: /more/i });
    
    await user.click(moreButton);

    const unfriendButton = screen.getByRole('menuitem', { name: /unfriend/i });
    await user.click(unfriendButton);

    // Confirm dialog
    expect(screen.getByText(/are you sure you want to unfriend/i)).toBeInTheDocument();
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('DELETE', '/api/friends/2', {});
    });
  });

  it('should navigate to friend profile', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, friends: mockFriends })
    });

    render(<FriendsList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
    });

    const profileLink = screen.getByRole('link', { name: /maria gonzalez/i });
    await user.click(profileLink);

    expect(window.location.pathname).toBe('/users/mariag');
  });

  it('should send message to friend', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, friends: mockFriends })
    });

    render(<FriendsList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
    });

    const mariaCard = screen.getByText('Maria Gonzalez').closest('[data-friend-id]');
    const messageButton = within(mariaCard!).getByRole('button', { name: /message/i });
    
    await user.click(messageButton);

    expect(window.location.pathname).toBe('/messages');
    expect(window.location.search).toContain('user=2');
  });

  it('should show mutual friends', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, friends: mockFriends })
      })
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true, 
          mutualFriends: [
            { id: 10, name: 'John Doe', profileImage: '/images/john.jpg' },
            { id: 11, name: 'Jane Smith', profileImage: '/images/jane.jpg' }
          ]
        })
      });

    render(<FriendsList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('12 mutual friends')).toBeInTheDocument();
    });

    const mutualLink = screen.getByText('12 mutual friends');
    await user.click(mutualLink);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /mutual friends/i })).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should show friend suggestions', async () => {
    const user = userEvent.setup();
    
    const suggestions = [
      {
        id: 5,
        name: 'Pedro Martinez',
        username: 'pedrom',
        mutualFriends: 8,
        city: 'Buenos Aires'
      }
    ];

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, friends: mockFriends })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, suggestions })
      });

    render(<FriendsList />, { wrapper: createWrapper() });

    const suggestionsTab = screen.getByRole('tab', { name: /suggestions/i });
    await user.click(suggestionsTab);

    await waitFor(() => {
      expect(screen.getByText('Pedro Martinez')).toBeInTheDocument();
      expect(screen.getByText('8 mutual friends')).toBeInTheDocument();
    });
  });

  it('should send friend request', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, friends: [] })
      })
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true, 
          suggestions: [{
            id: 5,
            name: 'Pedro Martinez',
            username: 'pedrom'
          }]
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<FriendsList />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('tab', { name: /suggestions/i }));

    await waitFor(() => {
      expect(screen.getByText('Pedro Martinez')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add friend/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/friends/requests', {
        userId: 5
      });
      expect(screen.getByText(/request sent/i)).toBeInTheDocument();
    });
  });

  it('should filter friends by location', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, friends: mockFriends })
    });

    render(<FriendsList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /filter by city/i })).toBeInTheDocument();
    });

    const cityFilter = screen.getByRole('combobox', { name: /filter by city/i });
    await user.click(cityFilter);
    await user.click(screen.getByRole('option', { name: /buenos aires/i }));

    await waitFor(() => {
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
      expect(screen.queryByText('Carlos Rodriguez')).not.toBeInTheDocument();
    });
  });

  it('should show empty state', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, friends: [] })
    });

    render(<FriendsList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/no friends yet/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /find friends/i })).toBeInTheDocument();
    });
  });
});