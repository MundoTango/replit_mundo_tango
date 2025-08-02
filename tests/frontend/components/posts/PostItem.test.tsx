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
import PostItem from '../../../../client/src/components/posts/PostItem';
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

const mockPost = {
  id: 1,
  content: 'Just had an amazing milonga at Salon Canning! The energy was incredible #tango #buenosaires',
  author: {
    id: 2,
    name: 'Maria Gonzalez',
    username: 'mariag',
    profileImage: '/images/maria.jpg'
  },
  media: [
    {
      type: 'image',
      url: '/images/milonga1.jpg',
      thumbnail: '/images/milonga1-thumb.jpg'
    }
  ],
  likes: 24,
  comments: 5,
  shares: 2,
  isLiked: false,
  isSaved: false,
  hashtags: ['tango', 'buenosaires'],
  mentions: [],
  createdAt: new Date('2025-08-02T10:00:00Z'),
  visibility: 'public'
};

describe('PostItem Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render post content', () => {
    render(<PostItem post={mockPost} />, { wrapper: createWrapper() });

    expect(screen.getByText(/just had an amazing milonga/i)).toBeInTheDocument();
    expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
    expect(screen.getByText('@mariag')).toBeInTheDocument();
  });

  it('should display hashtags as links', () => {
    render(<PostItem post={mockPost} />, { wrapper: createWrapper() });

    const tangoTag = screen.getByRole('link', { name: /#tango/i });
    const baTag = screen.getByRole('link', { name: /#buenosaires/i });

    expect(tangoTag).toHaveAttribute('href', '/hashtag/tango');
    expect(baTag).toHaveAttribute('href', '/hashtag/buenosaires');
  });

  it('should handle like action', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, likes: 25 })
    });

    render(<PostItem post={mockPost} />, { wrapper: createWrapper() });

    const likeButton = screen.getByRole('button', { name: /like/i });
    expect(likeButton).toHaveTextContent('24');

    await user.click(likeButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/posts/1/like', {});
      expect(likeButton).toHaveTextContent('25');
      expect(likeButton).toHaveClass('text-red-500'); // Liked state
    });
  });

  it('should handle unlike action', async () => {
    const user = userEvent.setup();
    const likedPost = { ...mockPost, isLiked: true };
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, likes: 23 })
    });

    render(<PostItem post={likedPost} />, { wrapper: createWrapper() });

    const likeButton = screen.getByRole('button', { name: /unlike/i });
    await user.click(likeButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('DELETE', '/api/posts/1/like', {});
      expect(likeButton).toHaveTextContent('23');
    });
  });

  it('should show comments', async () => {
    const user = userEvent.setup();
    const mockComments = [
      {
        id: 1,
        content: 'Amazing night!',
        author: { name: 'Carlos Rodriguez' },
        createdAt: new Date()
      }
    ];

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, comments: mockComments })
    });

    render(<PostItem post={mockPost} />, { wrapper: createWrapper() });

    const commentButton = screen.getByRole('button', { name: /comment/i });
    await user.click(commentButton);

    await waitFor(() => {
      expect(screen.getByText('Amazing night!')).toBeInTheDocument();
      expect(screen.getByText('Carlos Rodriguez')).toBeInTheDocument();
    });
  });

  it('should add comment', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, comments: [] })
      })
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true,
          comment: {
            id: 2,
            content: 'Wish I was there!',
            author: { id: 1, name: 'Current User' }
          }
        })
      });

    render(<PostItem post={mockPost} />, { wrapper: createWrapper() });

    const commentButton = screen.getByRole('button', { name: /comment/i });
    await user.click(commentButton);

    const commentInput = screen.getByPlaceholderText(/write a comment/i);
    await user.type(commentInput, 'Wish I was there!');
    
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/posts/1/comments', {
        content: 'Wish I was there!'
      });
      expect(screen.getByText('Wish I was there!')).toBeInTheDocument();
    });
  });

  it('should handle share action', async () => {
    const user = userEvent.setup();
    
    render(<PostItem post={mockPost} />, { wrapper: createWrapper() });

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    expect(screen.getByRole('dialog', { name: /share post/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share to feed/i })).toBeInTheDocument();
  });

  it('should copy post link', async () => {
    const user = userEvent.setup();
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });

    render(<PostItem post={mockPost} />, { wrapper: createWrapper() });

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    const copyLinkButton = screen.getByRole('button', { name: /copy link/i });
    await user.click(copyLinkButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/posts/1')
    );
    expect(screen.getByText(/link copied/i)).toBeInTheDocument();
  });

  it('should save/unsave post', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true })
    });

    render(<PostItem post={mockPost} />, { wrapper: createWrapper() });

    const moreButton = screen.getByRole('button', { name: /more options/i });
    await user.click(moreButton);

    const saveButton = screen.getByRole('menuitem', { name: /save post/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/posts/1/save', {});
    });
  });

  it('should delete own post', async () => {
    const user = userEvent.setup();
    const ownPost = { ...mockPost, author: { id: 1, name: 'Current User' } };
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true })
    });

    render(<PostItem post={ownPost} />, { wrapper: createWrapper() });

    const moreButton = screen.getByRole('button', { name: /more options/i });
    await user.click(moreButton);

    const deleteButton = screen.getByRole('menuitem', { name: /delete/i });
    await user.click(deleteButton);

    // Confirm deletion
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('DELETE', '/api/posts/1', {});
    });
  });

  it('should edit own post', async () => {
    const user = userEvent.setup();
    const ownPost = { ...mockPost, author: { id: 1, name: 'Current User' } };
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true })
    });

    render(<PostItem post={ownPost} />, { wrapper: createWrapper() });

    const moreButton = screen.getByRole('button', { name: /more options/i });
    await user.click(moreButton);

    const editButton = screen.getByRole('menuitem', { name: /edit/i });
    await user.click(editButton);

    // Should show edit form
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(mockPost.content);

    await user.clear(textarea);
    await user.type(textarea, 'Updated content');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('PUT', '/api/posts/1', {
        content: 'Updated content'
      });
    });
  });

  it('should report post', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true })
    });

    render(<PostItem post={mockPost} />, { wrapper: createWrapper() });

    const moreButton = screen.getByRole('button', { name: /more options/i });
    await user.click(moreButton);

    const reportButton = screen.getByRole('menuitem', { name: /report/i });
    await user.click(reportButton);

    expect(screen.getByRole('dialog', { name: /report post/i })).toBeInTheDocument();

    const reasonSelect = screen.getByRole('combobox', { name: /reason/i });
    await user.click(reasonSelect);
    await user.click(screen.getByRole('option', { name: /inappropriate content/i }));

    const submitButton = screen.getByRole('button', { name: /submit report/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/posts/1/report', {
        reason: 'inappropriate_content'
      });
    });
  });

  it('should display media gallery', async () => {
    const user = userEvent.setup();
    const postWithMultipleMedia = {
      ...mockPost,
      media: [
        { type: 'image', url: '/img1.jpg' },
        { type: 'image', url: '/img2.jpg' },
        { type: 'video', url: '/video1.mp4' }
      ]
    };

    render(<PostItem post={postWithMultipleMedia} />, { wrapper: createWrapper() });

    expect(screen.getByAltText(/post media 1/i)).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument(); // More media indicator

    // Click to open gallery
    const firstImage = screen.getByAltText(/post media 1/i);
    await user.click(firstImage);

    expect(screen.getByRole('dialog', { name: /media gallery/i })).toBeInTheDocument();
  });

  it('should show post timestamp', () => {
    render(<PostItem post={mockPost} />, { wrapper: createWrapper() });

    // Should show relative time
    expect(screen.getByText(/ago/i)).toBeInTheDocument();
  });

  it('should handle mentions', () => {
    const postWithMentions = {
      ...mockPost,
      content: 'Great dancing with @carlosr last night!',
      mentions: [{ id: 3, username: 'carlosr', name: 'Carlos Rodriguez' }]
    };

    render(<PostItem post={postWithMentions} />, { wrapper: createWrapper() });

    const mention = screen.getByRole('link', { name: /@carlosr/i });
    expect(mention).toHaveAttribute('href', '/users/carlosr');
  });

  it('should show visibility indicator', () => {
    const privatePost = { ...mockPost, visibility: 'friends' };

    render(<PostItem post={privatePost} />, { wrapper: createWrapper() });

    expect(screen.getByTitle(/friends only/i)).toBeInTheDocument();
  });

  it('should expand long content', async () => {
    const user = userEvent.setup();
    const longPost = {
      ...mockPost,
      content: 'A'.repeat(500) // Long content
    };

    render(<PostItem post={longPost} />, { wrapper: createWrapper() });

    expect(screen.getByText(/read more/i)).toBeInTheDocument();

    await user.click(screen.getByText(/read more/i));

    expect(screen.getByText(/read less/i)).toBeInTheDocument();
    expect(screen.getByText(longPost.content)).toBeInTheDocument();
  });
});