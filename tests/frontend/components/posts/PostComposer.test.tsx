import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';

// Mock API and components
jest.mock('../../../../client/src/lib/queryClient', () => ({
  apiRequest: jest.fn(),
  queryClient: {
    invalidateQueries: jest.fn()
  }
}));

jest.mock('../../../../client/src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User' },
    isAuthenticated: true
  })
}));

// Import component after mocking
import PostComposer from '../../../../client/src/components/posts/PostComposer';
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

describe('PostComposer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render post composer', () => {
    render(<PostComposer />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText(/what's on your mind/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /post/i })).toBeInTheDocument();
  });

  it('should enable/disable post button based on content', async () => {
    const user = userEvent.setup();
    render(<PostComposer />, { wrapper: createWrapper() });

    const postButton = screen.getByRole('button', { name: /post/i });
    const textarea = screen.getByPlaceholderText(/what's on your mind/i);

    // Initially disabled
    expect(postButton).toBeDisabled();

    // Type content
    await user.type(textarea, 'This is a test post');
    expect(postButton).not.toBeDisabled();

    // Clear content
    await user.clear(textarea);
    expect(postButton).toBeDisabled();
  });

  it('should create a post successfully', async () => {
    const user = userEvent.setup();
    const mockPost = {
      id: 1,
      content: 'Test post content',
      userId: 1,
      createdAt: new Date().toISOString()
    };

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, post: mockPost })
    });

    render(<PostComposer />, { wrapper: createWrapper() });

    const textarea = screen.getByPlaceholderText(/what's on your mind/i);
    await user.type(textarea, 'Test post content');

    const postButton = screen.getByRole('button', { name: /post/i });
    await user.click(postButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/posts', {
        content: 'Test post content'
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['/api/posts/feed']
      });
    });

    // Should clear textarea after successful post
    expect(textarea).toHaveValue('');
  });

  it('should handle hashtags', async () => {
    const user = userEvent.setup();
    render(<PostComposer />, { wrapper: createWrapper() });

    const textarea = screen.getByPlaceholderText(/what's on your mind/i);
    await user.type(textarea, 'Going to #milonga tonight! #tango #buenosaires');

    // Should highlight hashtags
    await waitFor(() => {
      expect(screen.getByText('#milonga')).toHaveClass('text-blue-500');
      expect(screen.getByText('#tango')).toHaveClass('text-blue-500');
      expect(screen.getByText('#buenosaires')).toHaveClass('text-blue-500');
    });
  });

  it('should handle mentions', async () => {
    const user = userEvent.setup();
    
    // Mock user search for mentions
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({
        users: [
          { id: 2, username: 'johndoe', name: 'John Doe' },
          { id: 3, username: 'janedoe', name: 'Jane Doe' }
        ]
      })
    });

    render(<PostComposer />, { wrapper: createWrapper() });

    const textarea = screen.getByPlaceholderText(/what's on your mind/i);
    await user.type(textarea, 'Hey @john');

    // Should show mention suggestions
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Select mention
    await user.click(screen.getByText('John Doe'));

    expect(textarea).toHaveValue('Hey @johndoe ');
  });

  it('should handle emoji picker', async () => {
    const user = userEvent.setup();
    render(<PostComposer />, { wrapper: createWrapper() });

    const emojiButton = screen.getByRole('button', { name: /add emoji/i });
    await user.click(emojiButton);

    // Should show emoji picker
    expect(screen.getByRole('dialog', { name: /emoji picker/i })).toBeInTheDocument();

    // Select an emoji
    const smileEmoji = screen.getByText('😊');
    await user.click(smileEmoji);

    const textarea = screen.getByPlaceholderText(/what's on your mind/i);
    expect(textarea).toHaveValue('😊');
  });

  it('should handle image upload', async () => {
    const user = userEvent.setup();
    render(<PostComposer />, { wrapper: createWrapper() });

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;

    await user.upload(input, file);

    // Should show image preview
    await waitFor(() => {
      expect(screen.getByAltText(/preview/i)).toBeInTheDocument();
    });

    // Should show remove button
    expect(screen.getByRole('button', { name: /remove image/i })).toBeInTheDocument();
  });

  it('should handle multiple images', async () => {
    const user = userEvent.setup();
    render(<PostComposer />, { wrapper: createWrapper() });

    const files = [
      new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      new File(['test3'], 'test3.jpg', { type: 'image/jpeg' })
    ];

    const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;
    await user.upload(input, files);

    // Should show all image previews
    await waitFor(() => {
      const previews = screen.getAllByAltText(/preview/i);
      expect(previews).toHaveLength(3);
    });
  });

  it('should validate image size', async () => {
    const user = userEvent.setup();
    render(<PostComposer />, { wrapper: createWrapper() });

    // Create a large file (> 10MB)
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg'
    });

    const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;
    await user.upload(input, largeFile);

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/file size must be less than 10MB/i)).toBeInTheDocument();
    });
  });

  it('should handle location tagging', async () => {
    const user = userEvent.setup();
    render(<PostComposer />, { wrapper: createWrapper() });

    const locationButton = screen.getByRole('button', { name: /add location/i });
    await user.click(locationButton);

    // Should show location search
    const locationInput = screen.getByPlaceholderText(/search location/i);
    await user.type(locationInput, 'Buenos Aires');

    // Mock location search results
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({
        locations: [
          { id: 1, name: 'Buenos Aires, Argentina' },
          { id: 2, name: 'Buenos Aires Province' }
        ]
      })
    });

    await waitFor(() => {
      expect(screen.getByText('Buenos Aires, Argentina')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Buenos Aires, Argentina'));

    // Should show selected location
    expect(screen.getByText(/📍 Buenos Aires, Argentina/i)).toBeInTheDocument();
  });

  it('should handle visibility settings', async () => {
    const user = userEvent.setup();
    render(<PostComposer />, { wrapper: createWrapper() });

    const visibilityButton = screen.getByRole('button', { name: /public/i });
    await user.click(visibilityButton);

    // Should show visibility options
    expect(screen.getByRole('option', { name: /public/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /friends/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /private/i })).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: /friends/i }));

    // Should update visibility
    expect(screen.getByRole('button', { name: /friends/i })).toBeInTheDocument();
  });

  it('should show character count', async () => {
    const user = userEvent.setup();
    render(<PostComposer />, { wrapper: createWrapper() });

    const textarea = screen.getByPlaceholderText(/what's on your mind/i);
    const longText = 'a'.repeat(450);
    
    await user.type(textarea, longText);

    // Should show character count when approaching limit
    expect(screen.getByText(/450\/500/i)).toBeInTheDocument();

    // Should show warning color when near limit
    expect(screen.getByText(/450\/500/i)).toHaveClass('text-yellow-500');
  });

  it('should enforce character limit', async () => {
    const user = userEvent.setup();
    render(<PostComposer />, { wrapper: createWrapper() });

    const textarea = screen.getByPlaceholderText(/what's on your mind/i);
    const longText = 'a'.repeat(501);
    
    await user.type(textarea, longText);

    // Should truncate to 500 characters
    expect(textarea).toHaveValue('a'.repeat(500));
  });

  it('should handle post error', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(<PostComposer />, { wrapper: createWrapper() });

    const textarea = screen.getByPlaceholderText(/what's on your mind/i);
    await user.type(textarea, 'Test post');

    const postButton = screen.getByRole('button', { name: /post/i });
    await user.click(postButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to create post/i)).toBeInTheDocument();
    });

    // Should not clear textarea on error
    expect(textarea).toHaveValue('Test post');
  });

  it('should save draft automatically', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup();
    
    render(<PostComposer />, { wrapper: createWrapper() });

    const textarea = screen.getByPlaceholderText(/what's on your mind/i);
    await user.type(textarea, 'Draft content');

    // Advance timers to trigger auto-save
    jest.advanceTimersByTime(5000);

    // Should save to localStorage
    expect(localStorage.getItem('post-draft')).toBe('Draft content');

    jest.useRealTimers();
  });

  it('should restore draft on mount', () => {
    localStorage.setItem('post-draft', 'Saved draft content');

    render(<PostComposer />, { wrapper: createWrapper() });

    const textarea = screen.getByPlaceholderText(/what's on your mind/i);
    expect(textarea).toHaveValue('Saved draft content');
  });
});