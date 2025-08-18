import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
import NotificationList from '../../../../client/src/components/notifications/NotificationList';
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

const mockNotifications = [
  {
    id: 1,
    type: 'friend_request',
    title: 'New Friend Request',
    message: 'Maria Gonzalez wants to be your friend',
    from: {
      id: 2,
      name: 'Maria Gonzalez',
      profileImage: '/images/maria.jpg'
    },
    read: false,
    createdAt: new Date('2025-08-02T11:00:00Z'),
    actionUrl: '/friends/requests'
  },
  {
    id: 2,
    type: 'post_like',
    title: 'Someone liked your post',
    message: 'Carlos Rodriguez liked your post',
    from: {
      id: 3,
      name: 'Carlos Rodriguez',
      profileImage: '/images/carlos.jpg'
    },
    read: false,
    createdAt: new Date('2025-08-02T10:30:00Z'),
    actionUrl: '/posts/123'
  },
  {
    id: 3,
    type: 'event_reminder',
    title: 'Event Starting Soon',
    message: 'Milonga at Salon Canning starts in 1 hour',
    read: true,
    createdAt: new Date('2025-08-02T09:00:00Z'),
    actionUrl: '/events/456'
  }
];

describe('NotificationList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render notifications', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, notifications: mockNotifications })
    });

    render(<NotificationList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('New Friend Request')).toBeInTheDocument();
      expect(screen.getByText('Someone liked your post')).toBeInTheDocument();
      expect(screen.getByText('Event Starting Soon')).toBeInTheDocument();
    });
  });

  it('should show unread indicator', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, notifications: mockNotifications })
    });

    render(<NotificationList />, { wrapper: createWrapper() });

    await waitFor(() => {
      const unreadNotifications = screen.getAllByTestId('unread-indicator');
      expect(unreadNotifications).toHaveLength(2); // Two unread notifications
    });
  });

  it('should mark notification as read on click', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, notifications: mockNotifications })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<NotificationList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('New Friend Request')).toBeInTheDocument();
    });

    const firstNotification = screen.getByText('New Friend Request').closest('[data-notification-id]');
    await user.click(firstNotification!);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/notifications/1/read', {});
    });

    // Should navigate to action URL
    expect(window.location.pathname).toBe('/friends/requests');
  });

  it('should mark all as read', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, notifications: mockNotifications })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<NotificationList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /mark all as read/i })).toBeInTheDocument();
    });

    const markAllButton = screen.getByRole('button', { name: /mark all as read/i });
    await user.click(markAllButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/notifications/read-all', {});
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['/api/notifications']
      });
    });
  });

  it('should delete notification', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, notifications: mockNotifications })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<NotificationList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('New Friend Request')).toBeInTheDocument();
    });

    const firstNotification = screen.getByText('New Friend Request').closest('[data-notification-id]');
    const deleteButton = within(firstNotification!).getByRole('button', { name: /delete/i });
    
    await user.click(deleteButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('DELETE', '/api/notifications/1', {});
    });
  });

  it('should filter notifications by type', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, notifications: mockNotifications })
    });

    render(<NotificationList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /filter/i })).toBeInTheDocument();
    });

    const filterSelect = screen.getByRole('combobox', { name: /filter/i });
    await user.click(filterSelect);
    await user.click(screen.getByRole('option', { name: /friend requests/i }));

    await waitFor(() => {
      expect(screen.getByText('New Friend Request')).toBeInTheDocument();
      expect(screen.queryByText('Someone liked your post')).not.toBeInTheDocument();
      expect(screen.queryByText('Event Starting Soon')).not.toBeInTheDocument();
    });
  });

  it('should show empty state', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, notifications: [] })
    });

    render(<NotificationList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
    });
  });

  it('should load more notifications on scroll', async () => {
    const initialNotifications = mockNotifications.slice(0, 2);
    const moreNotifications = [{
      id: 4,
      type: 'comment',
      title: 'New Comment',
      message: 'Someone commented on your post',
      read: false,
      createdAt: new Date()
    }];

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true, 
          notifications: initialNotifications,
          hasMore: true
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true, 
          notifications: moreNotifications,
          hasMore: false
        })
      });

    render(<NotificationList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('New Friend Request')).toBeInTheDocument();
    });

    // Simulate scroll to bottom
    const container = screen.getByTestId('notification-container');
    fireEvent.scroll(container, {
      target: { scrollTop: container.scrollHeight }
    });

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        expect.stringMatching(/offset=2/)
      );
      expect(screen.getByText('New Comment')).toBeInTheDocument();
    });
  });

  it('should group notifications by date', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, notifications: mockNotifications })
    });

    render(<NotificationList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument();
      // Notifications should be grouped by date
    });
  });

  it('should handle notification actions', async () => {
    const user = userEvent.setup();
    
    const notificationWithAction = {
      id: 5,
      type: 'friend_request',
      title: 'Friend Request',
      message: 'Ana Silva wants to be your friend',
      from: { id: 4, name: 'Ana Silva' },
      read: false,
      createdAt: new Date(),
      actions: [
        { label: 'Accept', action: 'accept', type: 'primary' },
        { label: 'Decline', action: 'decline', type: 'secondary' }
      ]
    };

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true, 
          notifications: [notificationWithAction]
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<NotificationList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Friend Request')).toBeInTheDocument();
    });

    const acceptButton = screen.getByRole('button', { name: /accept/i });
    await user.click(acceptButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/notifications/5/action', {
        action: 'accept'
      });
    });
  });

  it('should refresh notifications', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, notifications: mockNotifications })
      })
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true, 
          notifications: [...mockNotifications, {
            id: 6,
            type: 'message',
            title: 'New Message',
            message: 'You have a new message',
            read: false,
            createdAt: new Date()
          }]
        })
      });

    render(<NotificationList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('New Friend Request')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await user.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText('New Message')).toBeInTheDocument();
    });
  });

  it('should handle real-time notifications', async () => {
    // Mock WebSocket
    const mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      off: jest.fn()
    };

    jest.mock('socket.io-client', () => ({
      io: jest.fn(() => mockSocket)
    }));

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, notifications: mockNotifications })
    });

    render(<NotificationList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith('notification:new', expect.any(Function));
    });

    // Simulate receiving new notification
    const notificationHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'notification:new'
    )[1];

    const newNotification = {
      id: 7,
      type: 'event_invite',
      title: 'Event Invitation',
      message: 'You are invited to a special milonga',
      read: false,
      createdAt: new Date()
    };

    notificationHandler(newNotification);

    await waitFor(() => {
      expect(screen.getByText('Event Invitation')).toBeInTheDocument();
    });
  });

  it('should show notification settings', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, notifications: mockNotifications })
    });

    render(<NotificationList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    });

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsButton);

    expect(window.location.pathname).toBe('/settings/notifications');
  });
});