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
import EventDetail from '../../../../client/src/components/events/EventDetail';
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

const mockEvent = {
  id: 1,
  title: 'Milonga at Salon Canning',
  description: 'Join us for an unforgettable night of tango at the historic Salon Canning. Live orchestra, professional dancers, and beginners welcome!',
  eventType: 'milonga',
  startDate: '2025-09-01T20:00:00Z',
  endDate: '2025-09-02T02:00:00Z',
  location: {
    venue: 'Salon Canning',
    address: 'Av. Raúl Scalabrini Ortiz 1331',
    city: 'Buenos Aires',
    country: 'Argentina',
    lat: -34.5875,
    lng: -58.4141
  },
  organizer: {
    id: 2,
    name: 'Maria Gonzalez',
    profileImage: '/images/maria.jpg'
  },
  coverImage: '/images/milonga-cover.jpg',
  price: 2000,
  currency: 'ARS',
  capacity: 200,
  attendeeCount: 145,
  isAttending: false,
  tags: ['milonga', 'live-music', 'traditional'],
  requirements: 'Comfortable dance shoes recommended',
  amenities: ['Bar', 'Air conditioning', 'Coat check'],
  lineup: [
    { time: '20:00', description: 'Doors open' },
    { time: '21:00', description: 'Beginner lesson' },
    { time: '22:00', description: 'Live orchestra - Típica Sans Souci' },
    { time: '00:00', description: 'Performance by champions' }
  ]
};

describe('EventDetail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render event details', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, event: mockEvent })
    });

    render(<EventDetail eventId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Milonga at Salon Canning')).toBeInTheDocument();
      expect(screen.getByText(/unforgettable night of tango/i)).toBeInTheDocument();
      expect(screen.getByText('Salon Canning')).toBeInTheDocument();
      expect(screen.getByText('145 attending')).toBeInTheDocument();
    });
  });

  it('should handle RSVP', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, event: mockEvent })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<EventDetail eventId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /attend event/i })).toBeInTheDocument();
    });

    const attendButton = screen.getByRole('button', { name: /attend event/i });
    await user.click(attendButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/events/1/attend', {});
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['/api/events/1']
      });
    });
  });

  it('should handle cancel RSVP', async () => {
    const user = userEvent.setup();
    const attendingEvent = { ...mockEvent, isAttending: true };
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, event: attendingEvent })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<EventDetail eventId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel attendance/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel attendance/i });
    await user.click(cancelButton);

    // Confirm dialog
    expect(screen.getByText(/are you sure you want to cancel/i)).toBeInTheDocument();
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('DELETE', '/api/events/1/attend', {});
    });
  });

  it('should display event schedule', async () => {
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, event: mockEvent })
    });

    render(<EventDetail eventId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Schedule')).toBeInTheDocument();
      expect(screen.getByText('20:00')).toBeInTheDocument();
      expect(screen.getByText('Doors open')).toBeInTheDocument();
      expect(screen.getByText('Live orchestra - Típica Sans Souci')).toBeInTheDocument();
    });
  });

  it('should show event location on map', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, event: mockEvent })
    });

    render(<EventDetail eventId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Av. Raúl Scalabrini Ortiz 1331')).toBeInTheDocument();
    });

    const mapContainer = screen.getByTestId('event-map');
    expect(mapContainer).toBeInTheDocument();
  });

  it('should show attendees list', async () => {
    const user = userEvent.setup();
    const mockAttendees = [
      {
        id: 2,
        name: 'Carlos Rodriguez',
        profileImage: '/images/carlos.jpg',
        role: 'leader'
      },
      {
        id: 3,
        name: 'Ana Silva',
        profileImage: '/images/ana.jpg',
        role: 'follower'
      }
    ];

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, event: mockEvent })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, attendees: mockAttendees })
      });

    render(<EventDetail eventId={1} />, { wrapper: createWrapper() });

    const attendeesTab = screen.getByRole('tab', { name: /attendees/i });
    await user.click(attendeesTab);

    await waitFor(() => {
      expect(screen.getByText('Carlos Rodriguez')).toBeInTheDocument();
      expect(screen.getByText('Ana Silva')).toBeInTheDocument();
    });
  });

  it('should add event to calendar', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, event: mockEvent })
    });

    render(<EventDetail eventId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add to calendar/i })).toBeInTheDocument();
    });

    const calendarButton = screen.getByRole('button', { name: /add to calendar/i });
    await user.click(calendarButton);

    expect(screen.getByRole('menuitem', { name: /google calendar/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /apple calendar/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /download .ics/i })).toBeInTheDocument();
  });

  it('should share event', async () => {
    const user = userEvent.setup();
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, event: mockEvent })
    });

    render(<EventDetail eventId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    });

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    const copyLinkButton = screen.getByRole('button', { name: /copy link/i });
    await user.click(copyLinkButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/events/1')
    );
    expect(screen.getByText(/link copied/i)).toBeInTheDocument();
  });

  it('should post comment on event', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, event: mockEvent })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, comments: [] })
      })
      .mockResolvedValueOnce({
        json: async () => ({ 
          success: true,
          comment: {
            id: 1,
            content: 'Looking forward to this!',
            author: { id: 1, name: 'Current User' },
            createdAt: new Date()
          }
        })
      });

    render(<EventDetail eventId={1} />, { wrapper: createWrapper() });

    const discussionTab = screen.getByRole('tab', { name: /discussion/i });
    await user.click(discussionTab);

    const commentInput = screen.getByPlaceholderText(/add a comment/i);
    await user.type(commentInput, 'Looking forward to this!');

    const postButton = screen.getByRole('button', { name: /post/i });
    await user.click(postButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/events/1/comments', {
        content: 'Looking forward to this!'
      });
    });
  });

  it('should handle ticket purchase for paid events', async () => {
    const user = userEvent.setup();
    const paidEvent = {
      ...mockEvent,
      requiresPayment: true,
      ticketTypes: [
        { id: 1, name: 'General Admission', price: 2000, available: 50 },
        { id: 2, name: 'VIP', price: 5000, available: 10 }
      ]
    };

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, event: paidEvent })
    });

    render(<EventDetail eventId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /buy tickets/i })).toBeInTheDocument();
    });

    const buyButton = screen.getByRole('button', { name: /buy tickets/i });
    await user.click(buyButton);

    expect(screen.getByRole('dialog', { name: /select tickets/i })).toBeInTheDocument();
    expect(screen.getByText('General Admission')).toBeInTheDocument();
    expect(screen.getByText('ARS 2,000')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('ARS 5,000')).toBeInTheDocument();
  });

  it('should show event status indicators', async () => {
    const soldOutEvent = {
      ...mockEvent,
      attendeeCount: 200,
      status: 'sold_out'
    };

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, event: soldOutEvent })
    });

    render(<EventDetail eventId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/sold out/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /attend event/i })).toBeDisabled();
    });
  });

  it('should handle event cancellation notification', async () => {
    const cancelledEvent = {
      ...mockEvent,
      status: 'cancelled',
      cancellationReason: 'Due to weather conditions'
    };

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, event: cancelledEvent })
    });

    render(<EventDetail eventId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/event cancelled/i)).toBeInTheDocument();
      expect(screen.getByText(/due to weather conditions/i)).toBeInTheDocument();
    });
  });

  it('should show organizer options', async () => {
    const user = userEvent.setup();
    const ownEvent = {
      ...mockEvent,
      organizer: { id: 1, name: 'Current User' },
      isOrganizer: true
    };

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, event: ownEvent })
    });

    render(<EventDetail eventId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /manage event/i })).toBeInTheDocument();
    });

    const manageButton = screen.getByRole('button', { name: /manage event/i });
    await user.click(manageButton);

    expect(screen.getByRole('menuitem', { name: /edit event/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /cancel event/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /download attendees/i })).toBeInTheDocument();
  });

  it('should handle recurring events', async () => {
    const recurringEvent = {
      ...mockEvent,
      isRecurring: true,
      recurrenceRule: 'Weekly on Fridays',
      nextOccurrence: '2025-09-08T20:00:00Z'
    };

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, event: recurringEvent })
    });

    render(<EventDetail eventId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/weekly on fridays/i)).toBeInTheDocument();
      expect(screen.getByText(/next: september 8/i)).toBeInTheDocument();
    });
  });

  it('should report inappropriate event', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, event: mockEvent })
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true })
      });

    render(<EventDetail eventId={1} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /more options/i })).toBeInTheDocument();
    });

    const moreButton = screen.getByRole('button', { name: /more options/i });
    await user.click(moreButton);

    const reportButton = screen.getByRole('menuitem', { name: /report event/i });
    await user.click(reportButton);

    expect(screen.getByRole('dialog', { name: /report event/i })).toBeInTheDocument();

    const reasonSelect = screen.getByRole('combobox', { name: /reason/i });
    await user.click(reasonSelect);
    await user.click(screen.getByRole('option', { name: /misleading information/i }));

    const submitButton = screen.getByRole('button', { name: /submit report/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/events/1/report', {
        reason: 'misleading_information'
      });
    });
  });
});