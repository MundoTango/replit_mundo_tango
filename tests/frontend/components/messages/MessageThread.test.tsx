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

// Mock socket.io
const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  off: jest.fn(),
  connected: true
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket)
}));

// Import component after mocking
import MessageThread from '../../../../client/src/components/messages/MessageThread';
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

const mockThread = {
  id: 1,
  participants: [
    { id: 1, name: 'Current User', profileImage: '/images/user1.jpg' },
    { id: 2, name: 'Maria Gonzalez', profileImage: '/images/maria.jpg' }
  ],
  messages: [
    {
      id: 1,
      content: 'Hey, are you coming to the milonga tonight?',
      senderId: 2,
      createdAt: new Date('2025-08-02T10:00:00Z'),
      read: true
    },
    {
      id: 2,
      content: 'Yes! I\'ll be there around 9pm',
      senderId: 1,
      createdAt: new Date('2025-08-02T10:05:00Z'),
      read: true
    }
  ],
  lastMessage: 'Yes! I\'ll be there around 9pm',
  lastMessageAt: new Date('2025-08-02T10:05:00Z'),
  unreadCount: 0
};

describe('MessageThread Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render message thread', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, thread: mockThread })
    });

    render(<MessageThread threadId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
      expect(screen.getByText('Hey, are you coming to the milonga tonight?')).toBeInTheDocument();
      expect(screen.getByText('Yes! I\'ll be there around 9pm')).toBeInTheDocument();
    });
  });

  it('should send a new message', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, thread: mockThread })
      })
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true, 
          message: {
            id: 3,
            content: 'See you there!',
            senderId: 1,
            createdAt: new Date()
          }
        })
      });

    render(<MessageThread threadId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/type a message/i);
    await user.type(input, 'See you there!');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/messages', {
        threadId: 1,
        content: 'See you there!'
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('message:send', expect.any(Object));
    });

    // Input should be cleared
    expect(input).toHaveValue('');
  });

  it('should receive real-time messages', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, thread: mockThread })
    });

    render(<MessageThread threadId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith('message:received', expect.any(Function));
    });

    // Simulate receiving a message
    const messageHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'message:received'
    )[1];

    const newMessage = {
      id: 4,
      threadId: 1,
      content: 'Great! See you at the entrance',
      senderId: 2,
      createdAt: new Date()
    };

    messageHandler(newMessage);

    await waitFor(() => {
      expect(screen.getByText('Great! See you at the entrance')).toBeInTheDocument();
    });
  });

  it('should show typing indicator', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, thread: mockThread })
    });

    render(<MessageThread threadId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith('user:typing', expect.any(Function));
    });

    // Simulate typing event
    const typingHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'user:typing'
    )[1];

    typingHandler({ userId: 2, threadId: 1, isTyping: true });

    await waitFor(() => {
      expect(screen.getByText('Maria is typing...')).toBeInTheDocument();
    });

    // Stop typing
    typingHandler({ userId: 2, threadId: 1, isTyping: false });

    await waitFor(() => {
      expect(screen.queryByText('Maria is typing...')).not.toBeInTheDocument();
    });
  });

  it('should emit typing events', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, thread: mockThread })
    });

    render(<MessageThread threadId={1} />, { wrapper: createWrapper() });

    const input = await screen.findByPlaceholderText(/type a message/i);
    
    await user.type(input, 'H');

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith('user:typing', {
        threadId: 1,
        isTyping: true
      });
    });

    // Clear input and wait
    await user.clear(input);
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 1500));

    expect(mockSocket.emit).toHaveBeenCalledWith('user:typing', {
      threadId: 1,
      isTyping: false
    });
  });

  it('should load more messages on scroll', async () => {
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, thread: mockThread })
      })
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true, 
          messages: [
            {
              id: 0,
              content: 'Previous message',
              senderId: 1,
              createdAt: new Date('2025-08-02T09:00:00Z')
            }
          ],
          hasMore: false
        })
      });

    render(<MessageThread threadId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('message-container')).toBeInTheDocument();
    });

    const container = screen.getByTestId('message-container');
    
    // Simulate scroll to top
    fireEvent.scroll(container, { target: { scrollTop: 0 } });

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        expect.stringMatching(/before=1/)
      );
      expect(screen.getByText('Previous message')).toBeInTheDocument();
    });
  });

  it('should handle message reactions', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, thread: mockThread })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<MessageThread threadId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Hey, are you coming to the milonga tonight?')).toBeInTheDocument();
    });

    // Right-click on message to show reaction menu
    const message = screen.getByText('Hey, are you coming to the milonga tonight?');
    fireEvent.contextMenu(message);

    const heartReaction = screen.getByRole('button', { name: /❤️/i });
    await user.click(heartReaction);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/messages/1/react', {
        emoji: '❤️'
      });
    });
  });

  it('should delete own messages', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, thread: mockThread })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<MessageThread threadId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Yes! I\'ll be there around 9pm')).toBeInTheDocument();
    });

    // Find own message and open menu
    const ownMessage = screen.getByText('Yes! I\'ll be there around 9pm').closest('[data-message-id]');
    const menuButton = within(ownMessage!).getByRole('button', { name: /menu/i });
    
    await user.click(menuButton);

    const deleteButton = screen.getByRole('menuitem', { name: /delete/i });
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('DELETE', '/api/messages/2', {});
    });
  });

  it('should show message status', async () => {
    const threadWithStatus = {
      ...mockThread,
      messages: [
        ...mockThread.messages,
        {
          id: 3,
          content: 'New unread message',
          senderId: 2,
          createdAt: new Date(),
          read: false,
          delivered: true
        }
      ]
    };

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, thread: threadWithStatus })
    });

    render(<MessageThread threadId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('message-delivered-3')).toBeInTheDocument();
      expect(screen.queryByTestId('message-read-3')).not.toBeInTheDocument();
    });
  });

  it('should handle attachment upload', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, thread: mockThread })
      })
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true,
          message: {
            id: 5,
            content: 'Check out this photo from last night!',
            attachments: [{
              url: '/uploads/photo.jpg',
              type: 'image',
              name: 'photo.jpg'
            }],
            senderId: 1,
            createdAt: new Date()
          }
        })
      });

    render(<MessageThread threadId={1} />, { wrapper: createWrapper() });

    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/attach file/i) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/photo.jpg/i)).toBeInTheDocument();
    });

    // Send message with attachment
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    await user.type(messageInput, 'Check out this photo from last night!');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/messages', 
        expect.objectContaining({
          threadId: 1,
          content: 'Check out this photo from last night!',
          attachments: expect.any(Array)
        })
      );
    });
  });

  it('should mark messages as read', async () => {
    const unreadThread = {
      ...mockThread,
      messages: [
        ...mockThread.messages,
        {
          id: 3,
          content: 'Unread message',
          senderId: 2,
          createdAt: new Date(),
          read: false
        }
      ],
      unreadCount: 1
    };

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, thread: unreadThread })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<MessageThread threadId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/messages/read', {
        threadId: 1,
        messageIds: [3]
      });
    });
  });

  it('should handle connection status', () => {
    // Simulate disconnection
    mockSocket.connected = false;

    render(<MessageThread threadId={1} />, { wrapper: createWrapper() });

    expect(screen.getByText(/reconnecting/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type a message/i)).toBeDisabled();
  });
});