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
    user: { id: 1, name: 'Current User', city: 'Buenos Aires' },
    isAuthenticated: true
  })
}));

// Import component after mocking
import GroupDetail from '../../../../client/src/components/groups/GroupDetail';
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

const mockGroup = {
  id: 1,
  name: 'Buenos Aires Tango Community',
  description: 'The premier tango community in Buenos Aires. Join us for milongas, classes, and social events.',
  city: 'Buenos Aires',
  country: 'Argentina',
  memberCount: 1250,
  eventCount: 45,
  imageUrl: '/images/ba-tango.jpg',
  coverImage: '/images/ba-cover.jpg',
  category: 'city',
  isJoined: false,
  admins: [
    { id: 5, name: 'Admin User', profileImage: '/images/admin.jpg' }
  ],
  rules: [
    'Be respectful to all members',
    'No spam or self-promotion without permission',
    'Share tango-related content only'
  ],
  stats: {
    postsToday: 12,
    activeMembers: 234,
    upcomingEvents: 5
  },
  createdAt: '2024-01-15'
};

describe('GroupDetail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render group details', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, group: mockGroup })
    });

    render(<GroupDetail groupId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Buenos Aires Tango Community')).toBeInTheDocument();
      expect(screen.getByText(/premier tango community/i)).toBeInTheDocument();
      expect(screen.getByText('1,250 members')).toBeInTheDocument();
      expect(screen.getByText('45 events')).toBeInTheDocument();
    });
  });

  it('should handle join group', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, group: mockGroup })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<GroupDetail groupId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /join group/i })).toBeInTheDocument();
    });

    const joinButton = screen.getByRole('button', { name: /join group/i });
    await user.click(joinButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/groups/1/join', {});
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['/api/groups/1']
      });
    });
  });

  it('should handle leave group', async () => {
    const user = userEvent.setup();
    const joinedGroup = { ...mockGroup, isJoined: true };
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, group: joinedGroup })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<GroupDetail groupId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /leave group/i })).toBeInTheDocument();
    });

    const leaveButton = screen.getByRole('button', { name: /leave group/i });
    await user.click(leaveButton);

    // Confirm dialog
    expect(screen.getByText(/are you sure you want to leave/i)).toBeInTheDocument();
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/groups/1/leave', {});
    });
  });

  it('should display group tabs', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, group: mockGroup })
    });

    render(<GroupDetail groupId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /posts/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /events/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /members/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /about/i })).toBeInTheDocument();
    });
  });

  it('should show group posts', async () => {
    const user = userEvent.setup();
    const mockPosts = [
      {
        id: 1,
        content: 'Welcome to our community!',
        author: { name: 'Maria Gonzalez' },
        createdAt: new Date(),
        likes: 24
      }
    ];

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, group: mockGroup })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, posts: mockPosts })
      });

    render(<GroupDetail groupId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /posts/i })).toBeInTheDocument();
    });

    // Posts tab should be default
    await waitFor(() => {
      expect(screen.getByText('Welcome to our community!')).toBeInTheDocument();
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
    });
  });

  it('should show group events', async () => {
    const user = userEvent.setup();
    const mockEvents = [
      {
        id: 1,
        title: 'Weekly Milonga',
        startDate: '2025-09-01T20:00:00Z',
        location: 'Salon Canning',
        attendeeCount: 45
      }
    ];

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, group: mockGroup })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, events: mockEvents })
      });

    render(<GroupDetail groupId={1} />, { wrapper: createWrapper() });

    const eventsTab = screen.getByRole('tab', { name: /events/i });
    await user.click(eventsTab);

    await waitFor(() => {
      expect(screen.getByText('Weekly Milonga')).toBeInTheDocument();
      expect(screen.getByText('Salon Canning')).toBeInTheDocument();
      expect(screen.getByText('45 attending')).toBeInTheDocument();
    });
  });

  it('should show group members', async () => {
    const user = userEvent.setup();
    const mockMembers = [
      {
        id: 2,
        name: 'Maria Gonzalez',
        username: 'mariag',
        profileImage: '/images/maria.jpg',
        role: 'member',
        joinedAt: '2024-02-01'
      }
    ];

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, group: mockGroup })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, members: mockMembers })
      });

    render(<GroupDetail groupId={1} />, { wrapper: createWrapper() });

    const membersTab = screen.getByRole('tab', { name: /members/i });
    await user.click(membersTab);

    await waitFor(() => {
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
      expect(screen.getByText('@mariag')).toBeInTheDocument();
    });
  });

  it('should create post in group', async () => {
    const user = userEvent.setup();
    const joinedGroup = { ...mockGroup, isJoined: true };
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, group: joinedGroup })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, posts: [] })
      })
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true,
          post: {
            id: 2,
            content: 'Hello everyone!',
            author: { id: 1, name: 'Current User' }
          }
        })
      });

    render(<GroupDetail groupId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/share with the group/i)).toBeInTheDocument();
    });

    const postInput = screen.getByPlaceholderText(/share with the group/i);
    await user.type(postInput, 'Hello everyone!');

    const postButton = screen.getByRole('button', { name: /post/i });
    await user.click(postButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/groups/1/posts', {
        content: 'Hello everyone!'
      });
    });
  });

  it('should show admin options for group admins', async () => {
    const user = userEvent.setup();
    const adminGroup = {
      ...mockGroup,
      isJoined: true,
      userRole: 'admin'
    };

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, group: adminGroup })
    });

    render(<GroupDetail groupId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /manage group/i })).toBeInTheDocument();
    });

    const manageButton = screen.getByRole('button', { name: /manage group/i });
    await user.click(manageButton);

    expect(screen.getByRole('menuitem', { name: /edit details/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /manage members/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /group settings/i })).toBeInTheDocument();
  });

  it('should handle member removal by admin', async () => {
    const user = userEvent.setup();
    const adminGroup = {
      ...mockGroup,
      isJoined: true,
      userRole: 'admin'
    };

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, group: adminGroup })
      })
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true, 
          members: [{
            id: 3,
            name: 'Problem User',
            role: 'member'
          }]
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<GroupDetail groupId={1} />, { wrapper: createWrapper() });

    const membersTab = screen.getByRole('tab', { name: /members/i });
    await user.click(membersTab);

    await waitFor(() => {
      expect(screen.getByText('Problem User')).toBeInTheDocument();
    });

    const memberRow = screen.getByText('Problem User').closest('[data-member-id]');
    const removeButton = within(memberRow!).getByRole('button', { name: /remove/i });
    
    await user.click(removeButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/groups/1/members/3/remove', {});
    });
  });

  it('should invite members to group', async () => {
    const user = userEvent.setup();
    const joinedGroup = { ...mockGroup, isJoined: true };
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, group: joinedGroup })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<GroupDetail groupId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /invite members/i })).toBeInTheDocument();
    });

    const inviteButton = screen.getByRole('button', { name: /invite members/i });
    await user.click(inviteButton);

    expect(screen.getByRole('dialog', { name: /invite to group/i })).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText(/enter email addresses/i);
    await user.type(emailInput, 'friend@example.com');

    const sendButton = screen.getByRole('button', { name: /send invites/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/groups/1/invite', {
        emails: ['friend@example.com']
      });
    });
  });

  it('should report inappropriate content', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, group: mockGroup })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<GroupDetail groupId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /more options/i })).toBeInTheDocument();
    });

    const moreButton = screen.getByRole('button', { name: /more options/i });
    await user.click(moreButton);

    const reportButton = screen.getByRole('menuitem', { name: /report group/i });
    await user.click(reportButton);

    expect(screen.getByRole('dialog', { name: /report group/i })).toBeInTheDocument();

    const reasonSelect = screen.getByRole('combobox', { name: /reason/i });
    await user.click(reasonSelect);
    await user.click(screen.getByRole('option', { name: /inappropriate content/i }));

    const submitButton = screen.getByRole('button', { name: /submit report/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/groups/1/report', {
        reason: 'inappropriate_content'
      });
    });
  });

  it('should search within group posts', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, group: mockGroup })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, posts: [] })
      });

    render(<GroupDetail groupId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search posts/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search posts/i);
    await user.type(searchInput, 'milonga');

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        expect.stringMatching(/search=milonga/)
      );
    });
  });

  it('should handle group not found', async () => {
    (apiRequest as jest.Mock).mockRejectedValue(
      new Error('404: Group not found')
    );

    render(<GroupDetail groupId={999} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/group not found/i)).toBeInTheDocument();
    });
  });

  it('should handle auto-join for city groups', async () => {
    const cityGroup = {
      ...mockGroup,
      category: 'city',
      autoJoin: true,
      isJoined: true,
      userRole: 'member'
    };

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, group: cityGroup })
    });

    render(<GroupDetail groupId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/you were automatically added/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /join group/i })).not.toBeInTheDocument();
    });
  });
});