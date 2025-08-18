import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import Profile from '@/pages/profile';
import TravelDetailsComponent from '@/components/profile/TravelDetailsComponent';
import EventAutocomplete from '@/components/autocomplete/EventAutocomplete';
import CityGroupAutocomplete from '@/components/autocomplete/CityGroupAutocomplete';
import { MemoryRouter } from 'react-router-dom';

// Mock modules
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('wouter', () => ({
  useParams: () => ({ username: 'testuser' }),
  useLocation: () => ['/profile/testuser', vi.fn()],
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>
}));

// Mock fetch
global.fetch = vi.fn();

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Profile Page Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unit Tests', () => {
    describe('EventAutocomplete Component', () => {
      it('should render with label and placeholder', () => {
        renderWithProviders(
          <EventAutocomplete
            label="Event"
            placeholder="Search events"
            onSelect={vi.fn()}
          />
        );
        
        expect(screen.getByText('Event')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search events')).toBeInTheDocument();
      });

      it('should show loading state while searching', async () => {
        (global.fetch as any).mockImplementationOnce(() => 
          new Promise(() => {}) // Never resolves to simulate loading
        );

        renderWithProviders(
          <EventAutocomplete onSelect={vi.fn()} />
        );
        
        const input = screen.getByPlaceholderText('Search for an event...');
        await userEvent.type(input, 'Buenos Aires');
        
        await waitFor(() => {
          expect(screen.getByText('Searching events...')).toBeInTheDocument();
        });
      });

      it('should display search results', async () => {
        const mockEvents = [
          {
            id: 1,
            title: 'Buenos Aires Tango Festival',
            startDate: '2025-08-01',
            city: 'Buenos Aires',
            currentAttendees: 50
          }
        ];

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockEvents })
        });

        const onSelect = vi.fn();
        renderWithProviders(
          <EventAutocomplete onSelect={onSelect} />
        );
        
        const input = screen.getByPlaceholderText('Search for an event...');
        await userEvent.type(input, 'Buenos Aires');
        
        await waitFor(() => {
          expect(screen.getByText('Buenos Aires Tango Festival')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Buenos Aires Tango Festival'));
        expect(onSelect).toHaveBeenCalledWith(mockEvents[0]);
      });
    });

    describe('CityGroupAutocomplete Component', () => {
      it('should filter and display city groups', async () => {
        const mockGroups = [
          {
            id: 1,
            name: 'Buenos Aires, Argentina',
            slug: 'buenos-aires-argentina',
            type: 'city',
            memberCount: 100
          },
          {
            id: 2,
            name: 'Paris, France',
            slug: 'paris-france',
            type: 'city',
            memberCount: 50
          },
          {
            id: 3,
            name: 'Tango Teachers Network',
            slug: 'tango-teachers',
            type: 'professional',
            memberCount: 200
          }
        ];

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockGroups })
        });

        renderWithProviders(
          <CityGroupAutocomplete onSelect={vi.fn()} />
        );
        
        const input = screen.getByPlaceholderText('Search for a city...');
        fireEvent.focus(input);
        
        await waitFor(() => {
          // Should only show city groups, not professional groups
          expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
          expect(screen.getByText('Paris')).toBeInTheDocument();
          expect(screen.queryByText('Tango Teachers Network')).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('Integration Tests', () => {
    describe('Travel Details Flow', () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        name: 'Test User',
        profileImage: null,
        backgroundImage: null,
        bio: 'Test bio',
        city: 'Buenos Aires',
        country: 'Argentina'
      };

      it('should integrate event selection with travel form', async () => {
        // Mock user profile fetch
        (global.fetch as any)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, data: mockUser })
          })
          // Mock travel details fetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: [] })
          });

        renderWithProviders(<Profile />);
        
        await waitFor(() => {
          expect(screen.getByText('Travel')).toBeInTheDocument();
        });
        
        // Click Travel tab
        fireEvent.click(screen.getByText('Travel'));
        
        await waitFor(() => {
          expect(screen.getByText('Add Travel')).toBeInTheDocument();
        });
      });
    });
  });

  describe('E2E Tests', () => {
    it('should complete full travel detail creation flow', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        name: 'Test User',
        profileImage: null,
        backgroundImage: null,
        bio: 'Test bio',
        city: 'Buenos Aires',
        country: 'Argentina'
      };

      const mockEvent = {
        id: 1,
        title: 'Buenos Aires Tango Festival',
        startDate: '2025-08-01',
        endDate: '2025-08-05',
        city: 'Buenos Aires',
        country: 'Argentina',
        eventType: 'festival'
      };

      const mockCityGroup = {
        id: 1,
        name: 'Buenos Aires, Argentina',
        slug: 'buenos-aires-argentina',
        type: 'city',
        memberCount: 100
      };

      // Setup all mocks
      (global.fetch as any)
        // User profile
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: mockUser })
        })
        // Travel details (empty)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] })
        })
        // Event search
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockEvent] })
        })
        // City groups
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockCityGroup] })
        })
        // Create travel detail
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        })
        // Refresh travel details
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            data: [{
              id: 1,
              eventName: mockEvent.title,
              city: 'Buenos Aires',
              country: 'Argentina',
              startDate: mockEvent.startDate,
              endDate: mockEvent.endDate,
              status: 'planned'
            }]
          })
        });

      renderWithProviders(<Profile />);
      
      // Wait for profile to load
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
      
      // Navigate to Travel tab
      fireEvent.click(screen.getByText('Travel'));
      
      // Click Add Travel button
      await waitFor(() => {
        expect(screen.getByText('Add Travel')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Add Travel'));
      
      // Modal should open
      await waitFor(() => {
        expect(screen.getByText('Add Travel Detail')).toBeInTheDocument();
      });
      
      // Search for event
      const eventInput = screen.getByPlaceholderText('Search for an event or type a new name');
      await userEvent.type(eventInput, 'Buenos Aires');
      
      // Select event from dropdown
      await waitFor(() => {
        expect(screen.getByText('Buenos Aires Tango Festival')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Buenos Aires Tango Festival'));
      
      // Submit form
      const submitButton = screen.getByText('Add Travel Detail');
      fireEvent.click(submitButton);
      
      // Verify travel detail was created
      await waitFor(() => {
        expect(screen.getByText('Buenos Aires Tango Festival')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle large dataset efficiently', async () => {
      // Generate large dataset
      const largeEventList = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        title: `Event ${i}`,
        startDate: '2025-08-01',
        city: `City ${i}`,
        currentAttendees: i * 10
      }));

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: largeEventList })
      });

      const startTime = performance.now();
      
      renderWithProviders(
        <EventAutocomplete onSelect={vi.fn()} />
      );
      
      const input = screen.getByPlaceholderText('Search for an event...');
      await userEvent.type(input, 'Event');
      
      await waitFor(() => {
        expect(screen.getByText('Event 0')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (< 2 seconds)
      expect(renderTime).toBeLessThan(2000);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(
        <EventAutocomplete onSelect={vi.fn()} />
      );
      
      const input = screen.getByPlaceholderText('Search for an event...');
      await userEvent.type(input, 'Buenos Aires');
      
      // Should not crash and should show no results
      await waitFor(() => {
        expect(screen.getByText('No events found matching "Buenos Aires"')).toBeInTheDocument();
      });
    });

    it('should validate required fields', async () => {
      renderWithProviders(
        <CityGroupAutocomplete 
          required={true}
          onSelect={vi.fn()} 
        />
      );
      
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });
});