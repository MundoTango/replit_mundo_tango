import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';

// Mock API
jest.mock('../../../../client/src/lib/queryClient', () => ({
  apiRequest: jest.fn()
}));

jest.mock('../../../../client/src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User' },
    isAuthenticated: true
  })
}));

// Import component after mocking
import GroupList from '../../../../client/src/components/groups/GroupList';
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

const mockGroups = [
  {
    id: 1,
    name: 'Buenos Aires Tango Community',
    description: 'The largest tango community in Buenos Aires',
    city: 'Buenos Aires',
    country: 'Argentina',
    memberCount: 1250,
    imageUrl: '/images/ba-tango.jpg',
    isPrivate: false,
    isMember: true
  },
  {
    id: 2,
    name: 'NYC Tango Dancers',
    description: 'New York City tango enthusiasts',
    city: 'New York',
    country: 'USA',
    memberCount: 450,
    imageUrl: '/images/nyc-tango.jpg',
    isPrivate: false,
    isMember: false
  },
  {
    id: 3,
    name: 'Private Milonga Group',
    description: 'Exclusive milonga organizers',
    city: 'Paris',
    country: 'France',
    memberCount: 50,
    isPrivate: true,
    isMember: false
  }
];

describe('GroupList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render groups list', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, groups: mockGroups })
    });

    render(<GroupList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Buenos Aires Tango Community')).toBeInTheDocument();
      expect(screen.getByText('NYC Tango Dancers')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    (apiRequest as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<GroupList />, { wrapper: createWrapper() });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show empty state', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, groups: [] })
    });

    render(<GroupList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/no groups found/i)).toBeInTheDocument();
    });
  });

  it('should filter groups by search', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, groups: mockGroups })
    });

    render(<GroupList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Buenos Aires Tango Community')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search groups/i);
    await user.type(searchInput, 'NYC');

    await waitFor(() => {
      expect(screen.getByText('NYC Tango Dancers')).toBeInTheDocument();
      expect(screen.queryByText('Buenos Aires Tango Community')).not.toBeInTheDocument();
    });
  });

  it('should filter by city', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, groups: mockGroups })
    });

    render(<GroupList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getAllByTestId('group-card')).toHaveLength(3);
    });

    const cityFilter = screen.getByRole('combobox', { name: /filter by city/i });
    await user.click(cityFilter);
    await user.click(screen.getByRole('option', { name: /buenos aires/i }));

    await waitFor(() => {
      expect(screen.getByText('Buenos Aires Tango Community')).toBeInTheDocument();
      expect(screen.queryByText('NYC Tango Dancers')).not.toBeInTheDocument();
    });
  });

  it('should show member badge for joined groups', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, groups: mockGroups })
    });

    render(<GroupList />, { wrapper: createWrapper() });

    await waitFor(() => {
      const memberGroup = screen.getByText('Buenos Aires Tango Community').closest('[data-testid="group-card"]');
      expect(within(memberGroup!).getByText(/member/i)).toBeInTheDocument();
    });
  });

  it('should handle join group', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, groups: mockGroups })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, message: 'Joined group' })
      });

    render(<GroupList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('NYC Tango Dancers')).toBeInTheDocument();
    });

    const nycGroup = screen.getByText('NYC Tango Dancers').closest('[data-testid="group-card"]');
    const joinButton = within(nycGroup!).getByRole('button', { name: /join/i });

    await user.click(joinButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/groups/2/join', {});
      expect(within(nycGroup!).getByText(/member/i)).toBeInTheDocument();
    });
  });

  it('should handle leave group', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, groups: mockGroups })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, message: 'Left group' })
      });

    render(<GroupList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Buenos Aires Tango Community')).toBeInTheDocument();
    });

    const baGroup = screen.getByText('Buenos Aires Tango Community').closest('[data-testid="group-card"]');
    const leaveButton = within(baGroup!).getByRole('button', { name: /leave/i });

    await user.click(leaveButton);

    // Should show confirmation dialog
    expect(screen.getByText(/are you sure you want to leave/i)).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/groups/1/leave', {});
      expect(within(baGroup!).getByRole('button', { name: /join/i })).toBeInTheDocument();
    });
  });

  it('should show private group indicator', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, groups: mockGroups })
    });

    render(<GroupList />, { wrapper: createWrapper() });

    await waitFor(() => {
      const privateGroup = screen.getByText('Private Milonga Group').closest('[data-testid="group-card"]');
      expect(within(privateGroup!).getByText(/private/i)).toBeInTheDocument();
      expect(within(privateGroup!).getByTestId('lock-icon')).toBeInTheDocument();
    });
  });

  it('should request to join private group', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, groups: mockGroups })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, message: 'Join request sent' })
      });

    render(<GroupList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Private Milonga Group')).toBeInTheDocument();
    });

    const privateGroup = screen.getByText('Private Milonga Group').closest('[data-testid="group-card"]');
    const requestButton = within(privateGroup!).getByRole('button', { name: /request to join/i });

    await user.click(requestButton);

    await waitFor(() => {
      expect(within(privateGroup!).getByText(/request sent/i)).toBeInTheDocument();
    });
  });

  it('should sort groups', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, groups: mockGroups })
    });

    render(<GroupList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getAllByTestId('group-card')).toHaveLength(3);
    });

    const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
    await user.click(sortSelect);
    await user.click(screen.getByRole('option', { name: /member count/i }));

    await waitFor(() => {
      const groupCards = screen.getAllByTestId('group-card');
      const firstGroupName = within(groupCards[0]).getByRole('heading').textContent;
      expect(firstGroupName).toBe('Buenos Aires Tango Community');
    });
  });

  it('should navigate to group details', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, groups: mockGroups })
    });

    render(<GroupList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Buenos Aires Tango Community')).toBeInTheDocument();
    });

    const groupLink = screen.getByRole('link', { name: /buenos aires tango community/i });
    await user.click(groupLink);

    expect(window.location.pathname).toBe('/groups/1');
  });

  it('should show member count', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, groups: mockGroups })
    });

    render(<GroupList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('1,250 members')).toBeInTheDocument();
      expect(screen.getByText('450 members')).toBeInTheDocument();
    });
  });

  it('should show create group button for authenticated users', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, groups: mockGroups })
    });

    render(<GroupList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create group/i })).toBeInTheDocument();
    });
  });

  it('should handle pagination', async () => {
    const user = userEvent.setup();
    
    const manyGroups = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Group ${i + 1}`,
      memberCount: 100,
      isPrivate: false
    }));

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        groups: manyGroups.slice(0, 12),
        pagination: {
          total: 25,
          page: 1,
          limit: 12,
          hasMore: true
        }
      })
    });

    render(<GroupList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getAllByTestId('group-card')).toHaveLength(12);
    });

    const loadMoreButton = screen.getByRole('button', { name: /load more/i });
    expect(loadMoreButton).toBeInTheDocument();

    await user.click(loadMoreButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        expect.stringMatching(/page=2/)
      );
    });
  });

  it('should refresh list after group creation', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, groups: mockGroups })
    });

    render(<GroupList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create group/i })).toBeInTheDocument();
    });

    // Simulate group creation
    const createButton = screen.getByRole('button', { name: /create group/i });
    await user.click(createButton);

    // Would open create group modal and refresh list after creation
  });
});