import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';

// Mock API
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
import EventCard from '../../../../client/src/components/events/EventCard';
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
  description: 'Traditional milonga with live orchestra',
  eventType: 'milonga',
  startDate: new Date('2025-09-01T20:00:00Z'),
  endDate: new Date('2025-09-02T02:00:00Z'),
  location: 'Salon Canning',
  address: 'Av. Scalabrini Ortiz 1331',
  city: 'Buenos Aires',
  country: 'Argentina',
  price: '500',
  currency: 'ARS',
  imageUrl: '/images/salon-canning.jpg',
  currentAttendees: 45,
  maxAttendees: 100,
  organizer: {
    id: 2,
    name: 'Tango Organizer',
    username: 'organizer'
  },
  userRsvp: null,
  isPublic: true
};

describe('EventCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render event card with details', () => {
    render(<EventCard event={mockEvent} />, { wrapper: createWrapper() });

    expect(screen.getByText('Milonga at Salon Canning')).toBeInTheDocument();
    expect(screen.getByText('Traditional milonga with live orchestra')).toBeInTheDocument();
    expect(screen.getByText('Salon Canning')).toBeInTheDocument();
    expect(screen.getByText('500 ARS')).toBeInTheDocument();
  });

  it('should display formatted date and time', () => {
    render(<EventCard event={mockEvent} />, { wrapper: createWrapper() });

    // Check for formatted date/time
    expect(screen.getByText(/Sep 1, 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/8:00 PM/i)).toBeInTheDocument();
  });

  it('should show attendee count', () => {
    render(<EventCard event={mockEvent} />, { wrapper: createWrapper() });

    expect(screen.getByText('45/100 attending')).toBeInTheDocument();
  });

  it('should show event type badge', () => {
    render(<EventCard event={mockEvent} />, { wrapper: createWrapper() });

    expect(screen.getByText(/milonga/i)).toHaveClass('bg-red-100');
  });

  it('should handle RSVP - Going', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        rsvp: { status: 'going' } 
      })
    });

    render(<EventCard event={mockEvent} />, { wrapper: createWrapper() });

    const goingButton = screen.getByRole('button', { name: /going/i });
    await user.click(goingButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/events/1/rsvp', {
        status: 'going'
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['/api/events']
      });
    });

    // Button should show selected state
    expect(goingButton).toHaveClass('bg-green-500');
  });

  it('should handle RSVP - Interested', async () => {
    const user = userEvent.setup();
    
    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ 
        success: true, 
        rsvp: { status: 'interested' } 
      })
    });

    render(<EventCard event={mockEvent} />, { wrapper: createWrapper() });

    const interestedButton = screen.getByRole('button', { name: /interested/i });
    await user.click(interestedButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/events/1/rsvp', {
        status: 'interested'
      });
    });
  });

  it('should show existing RSVP status', () => {
    const eventWithRsvp = {
      ...mockEvent,
      userRsvp: { status: 'going', createdAt: new Date() }
    };

    render(<EventCard event={eventWithRsvp} />, { wrapper: createWrapper() });

    const goingButton = screen.getByRole('button', { name: /going/i });
    expect(goingButton).toHaveClass('bg-green-500');
  });

  it('should cancel RSVP', async () => {
    const user = userEvent.setup();
    const eventWithRsvp = {
      ...mockEvent,
      userRsvp: { status: 'going', createdAt: new Date() }
    };

    (apiRequest as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true })
    });

    render(<EventCard event={eventWithRsvp} />, { wrapper: createWrapper() });

    const goingButton = screen.getByRole('button', { name: /going/i });
    await user.click(goingButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('DELETE', '/api/events/1/rsvp', {});
    });
  });

  it('should show full event indicator', () => {
    const fullEvent = {
      ...mockEvent,
      currentAttendees: 100,
      maxAttendees: 100
    };

    render(<EventCard event={fullEvent} />, { wrapper: createWrapper() });

    expect(screen.getByText('FULL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /going/i })).toBeDisabled();
  });

  it('should show canceled event', () => {
    const canceledEvent = {
      ...mockEvent,
      status: 'cancelled'
    };

    render(<EventCard event={canceledEvent} />, { wrapper: createWrapper() });

    expect(screen.getByText('CANCELLED')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /going/i })).toBeDisabled();
  });

  it('should navigate to event details', async () => {
    const user = userEvent.setup();
    
    render(<EventCard event={mockEvent} />, { wrapper: createWrapper() });

    const titleLink = screen.getByRole('link', { name: /milonga at salon canning/i });
    await user.click(titleLink);

    expect(window.location.pathname).toBe('/events/1');
  });

  it('should show organizer info', () => {
    render(<EventCard event={mockEvent} />, { wrapper: createWrapper() });

    expect(screen.getByText('by Tango Organizer')).toBeInTheDocument();
  });

  it('should handle share event', async () => {
    const user = userEvent.setup();
    
    // Mock navigator.share
    Object.defineProperty(navigator, 'share', {
      value: jest.fn().mockResolvedValue(undefined),
      writable: true
    });

    render(<EventCard event={mockEvent} />, { wrapper: createWrapper() });

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    expect(navigator.share).toHaveBeenCalledWith({
      title: 'Milonga at Salon Canning',
      text: 'Traditional milonga with live orchestra',
      url: expect.stringContaining('/events/1')
    });
  });

  it('should copy link if share API not available', async () => {
    const user = userEvent.setup();
    
    // Remove navigator.share
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true
    });

    // Mock clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(undefined)
      },
      writable: true
    });

    render(<EventCard event={mockEvent} />, { wrapper: createWrapper() });

    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/events/1')
    );

    // Should show success toast
    expect(screen.getByText(/link copied/i)).toBeInTheDocument();
  });

  it('should show recurring event indicator', () => {
    const recurringEvent = {
      ...mockEvent,
      isRecurring: true,
      recurringPattern: 'weekly'
    };

    render(<EventCard event={recurringEvent} />, { wrapper: createWrapper() });

    expect(screen.getByText(/weekly/i)).toBeInTheDocument();
    expect(screen.getByTestId('recurring-icon')).toBeInTheDocument();
  });

  it('should show free event', () => {
    const freeEvent = {
      ...mockEvent,
      price: '0'
    };

    render(<EventCard event={freeEvent} />, { wrapper: createWrapper() });

    expect(screen.getByText('FREE')).toBeInTheDocument();
  });

  it('should show event image placeholder if no image', () => {
    const eventWithoutImage = {
      ...mockEvent,
      imageUrl: null
    };

    render(<EventCard event={eventWithoutImage} />, { wrapper: createWrapper() });

    expect(screen.getByTestId('event-placeholder-image')).toBeInTheDocument();
  });

  it('should handle edit event for organizer', async () => {
    const user = userEvent.setup();
    const ownEvent = {
      ...mockEvent,
      organizer: { id: 1, name: 'Test User' }
    };

    render(<EventCard event={ownEvent} />, { wrapper: createWrapper() });

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();

    await user.click(editButton);

    // Would navigate to edit page
    expect(window.location.pathname).toBe('/events/1/edit');
  });

  it('should not show edit button for non-organizer', () => {
    render(<EventCard event={mockEvent} />, { wrapper: createWrapper() });

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });
});