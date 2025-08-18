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
import ChatWindow from '../../../../client/src/components/chat/ChatWindow';
import { apiRequest } from '../../../../client/src/lib/queryClient';

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

const mockRoom = {
  id: 'tango-chat',
  name: 'Tango Community Chat',
  description: 'General discussion about tango',
  participants: 45,
  isJoined: false,
  moderators: [
    { id: 2, name: 'Maria Gonzalez' }
  ],
  rules: [
    'Be respectful',
    'No spam',
    'Tango topics only'
  ]
};

const mockMessages = [
  {
    id: 1,
    content: 'Welcome to the tango chat!',
    userId: 2,
    userName: 'Maria Gonzalez',
    userAvatar: '/images/maria.jpg',
    timestamp: new Date('2025-08-02T10:00:00Z'),
    type: 'message'
  },
  {
    id: 2,
    content: 'Anyone going to the milonga tonight?',
    userId: 3,
    userName: 'Carlos Rodriguez',
    userAvatar: '/images/carlos.jpg',
    timestamp: new Date('2025-08-02T10:05:00Z'),
    type: 'message'
  }
];

describe('ChatWindow Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render chat room details', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, room: mockRoom, messages: [] })
    });

    render(<ChatWindow roomId="tango-chat" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Tango Community Chat')).toBeInTheDocument();
      expect(screen.getByText('45 participants')).toBeInTheDocument();
    });
  });

  it('should join chat room', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, room: mockRoom, messages: [] })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<ChatWindow roomId="tango-chat" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /join chat/i })).toBeInTheDocument();
    });

    const joinButton = screen.getByRole('button', { name: /join chat/i });
    await user.click(joinButton);

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith('room:join', { roomId: 'tango-chat' });
    });
  });

  it('should display chat messages', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        room: { ...mockRoom, isJoined: true }, 
        messages: mockMessages 
      })
    });

    render(<ChatWindow roomId="tango-chat" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Welcome to the tango chat!')).toBeInTheDocument();
      expect(screen.getByText('Anyone going to the milonga tonight?')).toBeInTheDocument();
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
      expect(screen.getByText('Carlos Rodriguez')).toBeInTheDocument();
    });
  });

  it('should send message', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        room: { ...mockRoom, isJoined: true }, 
        messages: [] 
      })
    });

    render(<ChatWindow roomId="tango-chat" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/type a message/i);
    await user.type(input, 'Hello everyone!');

    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith('message:send', {
        roomId: 'tango-chat',
        content: 'Hello everyone!'
      });
    });

    // Input should be cleared
    expect(input).toHaveValue('');
  });

  it('should receive real-time messages', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        room: { ...mockRoom, isJoined: true }, 
        messages: mockMessages 
      })
    });

    render(<ChatWindow roomId="tango-chat" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith('message:new', expect.any(Function));
    });

    // Simulate receiving a message
    const messageHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'message:new'
    )[1];

    const newMessage = {
      id: 3,
      roomId: 'tango-chat',
      content: 'Count me in for the milonga!',
      userId: 4,
      userName: 'Ana Silva',
      timestamp: new Date()
    };

    messageHandler(newMessage);

    await waitFor(() => {
      expect(screen.getByText('Count me in for the milonga!')).toBeInTheDocument();
      expect(screen.getByText('Ana Silva')).toBeInTheDocument();
    });
  });

  it('should show typing indicators', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        room: { ...mockRoom, isJoined: true }, 
        messages: [] 
      })
    });

    render(<ChatWindow roomId="tango-chat" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith('user:typing', expect.any(Function));
    });

    // Simulate typing event
    const typingHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'user:typing'
    )[1];

    typingHandler({ 
      roomId: 'tango-chat',
      userId: 2, 
      userName: 'Maria Gonzalez',
      isTyping: true 
    });

    await waitFor(() => {
      expect(screen.getByText('Maria Gonzalez is typing...')).toBeInTheDocument();
    });
  });

  it('should handle user joining/leaving', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        room: { ...mockRoom, isJoined: true }, 
        messages: [] 
      })
    });

    render(<ChatWindow roomId="tango-chat" />, { wrapper: createWrapper() });

    // Simulate user join event
    const joinHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'user:joined'
    )[1];

    joinHandler({
      roomId: 'tango-chat',
      userId: 5,
      userName: 'Pedro Martinez'
    });

    await waitFor(() => {
      expect(screen.getByText(/pedro martinez joined the chat/i)).toBeInTheDocument();
    });

    // Simulate user leave event
    const leaveHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'user:left'
    )[1];

    leaveHandler({
      roomId: 'tango-chat',
      userId: 5,
      userName: 'Pedro Martinez'
    });

    await waitFor(() => {
      expect(screen.getByText(/pedro martinez left the chat/i)).toBeInTheDocument();
    });
  });

  it('should handle emoji reactions', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        room: { ...mockRoom, isJoined: true }, 
        messages: mockMessages 
      })
    });

    render(<ChatWindow roomId="tango-chat" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Welcome to the tango chat!')).toBeInTheDocument();
    });

    // Hover over message to show reaction button
    const message = screen.getByText('Welcome to the tango chat!').closest('[data-message-id]');
    fireEvent.mouseEnter(message!);

    const reactionButton = screen.getByRole('button', { name: /add reaction/i });
    await user.click(reactionButton);

    const heartEmoji = screen.getByRole('button', { name: /❤️/i });
    await user.click(heartEmoji);

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith('message:react', {
        roomId: 'tango-chat',
        messageId: 1,
        emoji: '❤️'
      });
    });
  });

  it('should handle mentions', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        room: { ...mockRoom, isJoined: true }, 
        messages: [] 
      })
    });

    render(<ChatWindow roomId="tango-chat" />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/type a message/i);
    await user.type(input, '@');

    // Should show mention suggestions
    await waitFor(() => {
      expect(screen.getByText('Maria Gonzalez')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Maria Gonzalez'));

    expect(input).toHaveValue('@Maria Gonzalez ');
  });

  it('should show participant list', async () => {
    const user = userEvent.setup();
    const participants = [
      { id: 1, name: 'Current User', status: 'online' },
      { id: 2, name: 'Maria Gonzalez', status: 'online', role: 'moderator' },
      { id: 3, name: 'Carlos Rodriguez', status: 'away' }
    ];

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true, 
          room: { ...mockRoom, isJoined: true }, 
          messages: [] 
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, participants })
      });

    render(<ChatWindow roomId="tango-chat" />, { wrapper: createWrapper() });

    const participantsButton = screen.getByRole('button', { name: /participants/i });
    await user.click(participantsButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /participants/i })).toBeInTheDocument();
      expect(screen.getByText('Maria Gonzalez (Moderator)')).toBeInTheDocument();
      expect(screen.getByTestId('status-online-2')).toBeInTheDocument();
      expect(screen.getByTestId('status-away-3')).toBeInTheDocument();
    });
  });

  it('should handle file sharing', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        room: { ...mockRoom, isJoined: true }, 
        messages: [] 
      })
    });

    render(<ChatWindow roomId="tango-chat" />, { wrapper: createWrapper() });

    const file = new File(['test'], 'tango-steps.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/attach file/i) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith('file:upload', 
        expect.objectContaining({
          roomId: 'tango-chat',
          fileName: 'tango-steps.pdf',
          fileType: 'application/pdf'
        })
      );
    });
  });

  it('should handle moderation actions', async () => {
    const user = userEvent.setup();
    const moderatorRoom = {
      ...mockRoom,
      isJoined: true,
      isModerator: true
    };

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        room: moderatorRoom, 
        messages: mockMessages 
      })
    });

    render(<ChatWindow roomId="tango-chat" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Anyone going to the milonga tonight?')).toBeInTheDocument();
    });

    // Right-click on message
    const message = screen.getByText('Anyone going to the milonga tonight?').closest('[data-message-id]');
    fireEvent.contextMenu(message!);

    expect(screen.getByRole('menuitem', { name: /delete message/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /mute user/i })).toBeInTheDocument();
  });

  it('should leave chat room', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        room: { ...mockRoom, isJoined: true }, 
        messages: [] 
      })
    });

    render(<ChatWindow roomId="tango-chat" />, { wrapper: createWrapper() });

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsButton);

    const leaveButton = screen.getByRole('menuitem', { name: /leave chat/i });
    await user.click(leaveButton);

    // Confirm dialog
    expect(screen.getByText(/are you sure you want to leave/i)).toBeInTheDocument();
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith('room:leave', { roomId: 'tango-chat' });
    });
  });

  it('should handle connection status', () => {
    mockSocket.connected = false;

    render(<ChatWindow roomId="tango-chat" />, { wrapper: createWrapper() });

    expect(screen.getByText(/reconnecting/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type a message/i)).toBeDisabled();
  });
});