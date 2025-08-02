import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('../../../../client/src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { 
      id: 1, 
      name: 'Admin User',
      roles: ['super_admin']
    },
    isAuthenticated: true
  })
}));

jest.mock('../../../../client/src/lib/queryClient', () => ({
  apiRequest: jest.fn()
}));

// Import component after mocking
import AdminDashboard from '../../../../client/src/components/admin/AdminDashboard';
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

const mockDashboardData = {
  stats: {
    totalUsers: 15420,
    activeUsers: 8234,
    totalEvents: 3456,
    totalGroups: 234,
    revenue: 145678.50,
    subscriptions: 1234
  },
  recentActivity: [
    { id: 1, type: 'user_signup', user: 'John Doe', time: '5 min ago' },
    { id: 2, type: 'event_created', user: 'Maria Garcia', time: '15 min ago' },
    { id: 3, type: 'payment', user: 'Carlos Rodriguez', amount: 50, time: '30 min ago' }
  ],
  systemHealth: {
    uptime: 99.99,
    responseTime: 145,
    errorRate: 0.02,
    activeConnections: 234
  }
};

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render admin dashboard with stats', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, data: mockDashboardData })
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('15,420')).toBeInTheDocument(); // Total users
      expect(screen.getByText('8,234')).toBeInTheDocument(); // Active users
      expect(screen.getByText('$145,678.50')).toBeInTheDocument(); // Revenue
    });
  });

  it('should show loading state', () => {
    (apiRequest as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should handle user management', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, data: mockDashboardData })
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /users/i })).toBeInTheDocument();
    });

    const usersTab = screen.getByRole('tab', { name: /users/i });
    await user.click(usersTab);

    expect(screen.getByPlaceholderText(/search users/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export users/i })).toBeInTheDocument();
  });

  it('should display recent activity', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, data: mockDashboardData })
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('5 min ago')).toBeInTheDocument();
    });
  });

  it('should show system health metrics', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, data: mockDashboardData })
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument();
      expect(screen.getByText('99.99% Uptime')).toBeInTheDocument();
      expect(screen.getByText('145ms Response Time')).toBeInTheDocument();
    });
  });

  it('should handle user search', async () => {
    const user = userEvent.setup();
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockDashboardData })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, users: mockUsers })
      });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /users/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('tab', { name: /users/i }));

    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'john');

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        expect.stringMatching(/search=john/)
      );
    });
  });

  it('should handle user actions', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true })
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    // Navigate to users tab
    await user.click(screen.getByRole('tab', { name: /users/i }));

    // Find user row and action menu
    const userRow = screen.getByText('john@example.com').closest('tr');
    const actionButton = within(userRow!).getByRole('button', { name: /actions/i });
    
    await user.click(actionButton);

    expect(screen.getByRole('menuitem', { name: /view profile/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /suspend/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument();
  });

  it('should handle content moderation', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        reports: [
          { id: 1, type: 'post', content: 'Inappropriate content', reporter: 'User1' }
        ]
      })
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    const moderationTab = screen.getByRole('tab', { name: /moderation/i });
    await user.click(moderationTab);

    await waitFor(() => {
      expect(screen.getByText('Content Reports')).toBeInTheDocument();
      expect(screen.getByText('Inappropriate content')).toBeInTheDocument();
    });
  });

  it('should display revenue analytics', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true,
        revenue: {
          daily: [
            { date: '2025-08-01', amount: 5432.10 },
            { date: '2025-08-02', amount: 6234.50 }
          ],
          subscriptions: {
            basic: 456,
            pro: 234,
            premium: 45
          }
        }
      })
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
    await user.click(analyticsTab);

    await waitFor(() => {
      expect(screen.getByText('Revenue Analytics')).toBeInTheDocument();
      expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
    });
  });

  it('should handle system settings', async () => {
    const user = userEvent.setup();
    
    render(<AdminDashboard />, { wrapper: createWrapper() });

    const settingsTab = screen.getByRole('tab', { name: /settings/i });
    await user.click(settingsTab);

    expect(screen.getByText('System Settings')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /maintenance mode/i })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /registration/i })).toBeInTheDocument();
  });

  it('should export data', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, downloadUrl: '/api/export/users.csv' })
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('tab', { name: /users/i }));

    const exportButton = screen.getByRole('button', { name: /export users/i });
    await user.click(exportButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/admin/export/users', {});
    });
  });

  it('should handle bulk actions', async () => {
    const user = userEvent.setup();
    
    render(<AdminDashboard />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('tab', { name: /users/i }));

    // Select multiple users
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // First user
    await user.click(checkboxes[2]); // Second user

    expect(screen.getByText('2 selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bulk actions/i })).toBeEnabled();
  });

  it('should show audit logs', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true,
        logs: [
          { id: 1, action: 'user.delete', admin: 'Admin1', timestamp: '2025-08-02T10:30:00Z' },
          { id: 2, action: 'settings.update', admin: 'Admin2', timestamp: '2025-08-02T09:15:00Z' }
        ]
      })
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    const logsTab = screen.getByRole('tab', { name: /audit logs/i });
    await user.click(logsTab);

    await waitFor(() => {
      expect(screen.getByText('user.delete')).toBeInTheDocument();
      expect(screen.getByText('Admin1')).toBeInTheDocument();
    });
  });

  it('should require admin role', () => {
    // Mock non-admin user
    jest.mock('../../../../client/src/hooks/useAuth', () => ({
      useAuth: () => ({
        user: { id: 1, name: 'Regular User', roles: ['user'] },
        isAuthenticated: true
      })
    }));

    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });
});