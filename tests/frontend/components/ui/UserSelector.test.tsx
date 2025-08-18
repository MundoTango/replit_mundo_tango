import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';

// Mock API
jest.mock('../../../../client/src/lib/queryClient', () => ({
  apiRequest: jest.fn()
}));

// Import component after mocking
import UserSelector from '../../../../client/src/components/ui/UserSelector';
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

const mockUsers = [
  {
    id: 1,
    name: 'Maria Gonzalez',
    username: 'mariag',
    profileImage: '/images/maria.jpg',
    city: 'Buenos Aires'
  },
  {
    id: 2,
    name: 'Carlos Rodriguez',
    username: 'carlosr',
    profileImage: '/images/carlos.jpg',
    city: 'New York'
  },
  {
    id: 3,
    name: 'Ana Silva',
    username: 'anas',
    profileImage: '/images/ana.jpg',
    city: 'Paris'
  }
];

describe('UserSelector Component', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render user selector input', () => {
    render(
      <UserSelector onSelect={mockOnSelect} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByPlaceholderText(/search users/i)).toBeInTheDocument();
  });

  it('should search users on input', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, users: mockUsers })
    });

    render(
      <UserSelector onSelect={mockOnSelect} />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText(/search users/i);
    await user.type(input, 'maria');

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        expect.stringMatching(/search=maria/)
      );
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
      expect(screen.getByText('@mariag')).toBeInTheDocument();
    });
  });

  it('should debounce search requests', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, users: [] })
    });

    render(
      <UserSelector onSelect={mockOnSelect} />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText(/search users/i);
    
    // Type quickly
    await user.type(input, 'm');
    await user.type(input, 'a');
    await user.type(input, 'r');

    // API should not be called immediately
    expect(apiRequest).not.toHaveBeenCalled();

    // Advance timers
    jest.advanceTimersByTime(300);

    // Now API should be called once with final value
    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(
      expect.stringMatching(/search=mar/)
    );

    jest.useRealTimers();
  });

  it('should handle user selection', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, users: mockUsers })
    });

    render(
      <UserSelector onSelect={mockOnSelect} />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText(/search users/i);
    await user.type(input, 'maria');

    await waitFor(() => {
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Maria Gonzalez'));

    expect(mockOnSelect).toHaveBeenCalledWith({
      id: 1,
      name: 'Maria Gonzalez',
      username: 'mariag',
      profileImage: '/images/maria.jpg',
      city: 'Buenos Aires'
    });

    // Input should clear after selection
    expect(input).toHaveValue('');
  });

  it('should support multiple selection', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, users: mockUsers })
    });

    render(
      <UserSelector 
        onSelect={mockOnSelect} 
        multiple 
      />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText(/search users/i);
    
    // Select first user
    await user.type(input, 'maria');
    await waitFor(() => screen.getByText('Maria Gonzalez'));
    await user.click(screen.getByText('Maria Gonzalez'));

    // Select second user
    await user.clear(input);
    await user.type(input, 'carlos');
    await waitFor(() => screen.getByText('Carlos Rodriguez'));
    await user.click(screen.getByText('Carlos Rodriguez'));

    // Should show selected users
    expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
    expect(screen.getByText('Carlos Rodriguez')).toBeInTheDocument();

    // Should have called onSelect with array
    expect(mockOnSelect).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'Maria Gonzalez' }),
      expect.objectContaining({ name: 'Carlos Rodriguez' })
    ]);
  });

  it('should remove selected users in multiple mode', async () => {
    const user = userEvent.setup();
    
    render(
      <UserSelector 
        onSelect={mockOnSelect} 
        multiple
        value={[mockUsers[0], mockUsers[1]]}
      />,
      { wrapper: createWrapper() }
    );

    // Should show initial selected users
    expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
    expect(screen.getByText('Carlos Rodriguez')).toBeInTheDocument();

    // Remove first user
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    expect(mockOnSelect).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Carlos Rodriguez' })
    ]);
  });

  it('should show loading state', () => {
    (apiRequest as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <UserSelector onSelect={mockOnSelect} />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText(/search users/i);
    fireEvent.change(input, { target: { value: 'test' } });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show no results message', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, users: [] })
    });

    render(
      <UserSelector onSelect={mockOnSelect} />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText(/search users/i);
    await user.type(input, 'nonexistent');

    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });

  it('should filter by role', async () => {
    const user = userEvent.setup();
    
    render(
      <UserSelector 
        onSelect={mockOnSelect}
        filterRole="teacher"
      />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText(/search teachers/i);
    await user.type(input, 'test');

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        expect.stringMatching(/role=teacher/)
      );
    });
  });

  it('should exclude certain users', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        users: mockUsers.filter(u => u.id !== 1) // Exclude Maria
      })
    });

    render(
      <UserSelector 
        onSelect={mockOnSelect}
        excludeUserIds={[1]}
      />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText(/search users/i);
    await user.type(input, 'test');

    await waitFor(() => {
      expect(screen.queryByText('Maria Gonzalez')).not.toBeInTheDocument();
      expect(screen.getByText('Carlos Rodriguez')).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(
      <UserSelector onSelect={mockOnSelect} />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText(/search users/i);
    await user.type(input, 'test');

    await waitFor(() => {
      expect(screen.getByText(/error loading users/i)).toBeInTheDocument();
    });
  });

  it('should show recent selections', async () => {
    const user = userEvent.setup();
    
    // Mock localStorage
    const recentUsers = [mockUsers[0], mockUsers[1]];
    Storage.prototype.getItem = jest.fn(() => JSON.stringify(recentUsers));

    render(
      <UserSelector 
        onSelect={mockOnSelect}
        showRecent
      />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText(/search users/i);
    await user.click(input);

    expect(screen.getByText('Recent')).toBeInTheDocument();
    expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
    expect(screen.getByText('Carlos Rodriguez')).toBeInTheDocument();
  });

  it('should validate minimum selection', async () => {
    const user = userEvent.setup();
    
    render(
      <UserSelector 
        onSelect={mockOnSelect}
        multiple
        minSelection={2}
        value={[mockUsers[0]]}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/select at least 2 users/i)).toBeInTheDocument();

    // Add another user
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, users: mockUsers })
    });

    const input = screen.getByPlaceholderText(/search users/i);
    await user.type(input, 'carlos');
    
    await waitFor(() => screen.getByText('Carlos Rodriguez'));
    await user.click(screen.getByText('Carlos Rodriguez'));

    // Error should be gone
    expect(screen.queryByText(/select at least 2 users/i)).not.toBeInTheDocument();
  });

  it('should limit maximum selection', async () => {
    const user = userEvent.setup();
    
    render(
      <UserSelector 
        onSelect={mockOnSelect}
        multiple
        maxSelection={2}
        value={[mockUsers[0], mockUsers[1]]}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/maximum 2 users/i)).toBeInTheDocument();

    // Try to add another user
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, users: mockUsers })
    });

    const input = screen.getByPlaceholderText(/search users/i);
    expect(input).toBeDisabled();
  });
});