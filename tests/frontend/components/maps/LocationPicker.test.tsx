import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';

// Mock Google Maps
global.google = {
  maps: {
    Map: jest.fn(() => ({
      setCenter: jest.fn(),
      setZoom: jest.fn(),
      panTo: jest.fn()
    })),
    Marker: jest.fn(() => ({
      setPosition: jest.fn(),
      setMap: jest.fn()
    })),
    places: {
      Autocomplete: jest.fn(() => ({
        addListener: jest.fn(),
        getPlace: jest.fn(() => ({
          geometry: {
            location: {
              lat: () => -34.6037,
              lng: () => -58.3816
            }
          },
          formatted_address: 'Buenos Aires, Argentina',
          name: 'Buenos Aires',
          address_components: [
            { long_name: 'Buenos Aires', types: ['locality'] },
            { long_name: 'Argentina', types: ['country'] }
          ]
        }))
      })),
      PlacesServiceStatus: {
        OK: 'OK'
      }
    },
    MapTypeId: {
      ROADMAP: 'roadmap'
    },
    LatLng: jest.fn((lat, lng) => ({ lat, lng }))
  }
} as any;

// Import component after mocking
import LocationPicker from '../../../../client/src/components/maps/LocationPicker';

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

describe('LocationPicker Component', () => {
  const mockOnLocationSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render location picker input', () => {
    render(
      <LocationPicker onLocationSelect={mockOnLocationSelect} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByPlaceholderText(/search for a location/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show map/i })).toBeInTheDocument();
  });

  it('should initialize Google Maps autocomplete', async () => {
    render(
      <LocationPicker onLocationSelect={mockOnLocationSelect} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(google.maps.places.Autocomplete).toHaveBeenCalled();
    });
  });

  it('should handle location selection', async () => {
    const user = userEvent.setup();
    
    render(
      <LocationPicker onLocationSelect={mockOnLocationSelect} />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText(/search for a location/i);
    await user.type(input, 'Buenos Aires');

    // Simulate place selection
    const mockAutocomplete = google.maps.places.Autocomplete.mock.results[0].value;
    const placeChangedCallback = mockAutocomplete.addListener.mock.calls[0][1];
    
    placeChangedCallback();

    await waitFor(() => {
      expect(mockOnLocationSelect).toHaveBeenCalledWith({
        address: 'Buenos Aires, Argentina',
        city: 'Buenos Aires',
        country: 'Argentina',
        lat: -34.6037,
        lng: -58.3816
      });
    });
  });

  it('should toggle map view', async () => {
    const user = userEvent.setup();
    
    render(
      <LocationPicker onLocationSelect={mockOnLocationSelect} />,
      { wrapper: createWrapper() }
    );

    const toggleButton = screen.getByRole('button', { name: /show map/i });
    await user.click(toggleButton);

    expect(screen.getByTestId('location-map')).toBeInTheDocument();
    expect(google.maps.Map).toHaveBeenCalled();
    expect(toggleButton).toHaveTextContent(/hide map/i);
  });

  it('should update map on location change', async () => {
    const user = userEvent.setup();
    
    render(
      <LocationPicker onLocationSelect={mockOnLocationSelect} showMap />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(google.maps.Map).toHaveBeenCalled();
    });

    const mockMap = google.maps.Map.mock.results[0].value;
    const mockMarker = google.maps.Marker.mock.results[0].value;

    // Simulate location selection
    const input = screen.getByPlaceholderText(/search for a location/i);
    await user.type(input, 'Buenos Aires');

    const mockAutocomplete = google.maps.places.Autocomplete.mock.results[0].value;
    const placeChangedCallback = mockAutocomplete.addListener.mock.calls[0][1];
    
    placeChangedCallback();

    await waitFor(() => {
      expect(mockMap.panTo).toHaveBeenCalled();
      expect(mockMarker.setPosition).toHaveBeenCalled();
    });
  });

  it('should handle current location', async () => {
    const user = userEvent.setup();
    
    // Mock geolocation
    const mockGeolocation = {
      getCurrentPosition: jest.fn((success) => {
        success({
          coords: {
            latitude: -34.6037,
            longitude: -58.3816
          }
        });
      })
    };
    
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    });

    render(
      <LocationPicker onLocationSelect={mockOnLocationSelect} />,
      { wrapper: createWrapper() }
    );

    const currentLocationButton = screen.getByRole('button', { name: /use current location/i });
    await user.click(currentLocationButton);

    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
      expect(mockOnLocationSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          lat: -34.6037,
          lng: -58.3816
        })
      );
    });
  });

  it('should handle geolocation error', async () => {
    const user = userEvent.setup();
    
    // Mock geolocation with error
    const mockGeolocation = {
      getCurrentPosition: jest.fn((success, error) => {
        error({ code: 1, message: 'User denied geolocation' });
      })
    };
    
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    });

    render(
      <LocationPicker onLocationSelect={mockOnLocationSelect} />,
      { wrapper: createWrapper() }
    );

    const currentLocationButton = screen.getByRole('button', { name: /use current location/i });
    await user.click(currentLocationButton);

    await waitFor(() => {
      expect(screen.getByText(/location access denied/i)).toBeInTheDocument();
    });
  });

  it('should show loading state', async () => {
    const user = userEvent.setup();
    
    // Mock slow geolocation
    const mockGeolocation = {
      getCurrentPosition: jest.fn(() => {
        // Don't call success or error immediately
      })
    };
    
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    });

    render(
      <LocationPicker onLocationSelect={mockOnLocationSelect} />,
      { wrapper: createWrapper() }
    );

    const currentLocationButton = screen.getByRole('button', { name: /use current location/i });
    await user.click(currentLocationButton);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should clear location', async () => {
    const user = userEvent.setup();
    
    render(
      <LocationPicker 
        onLocationSelect={mockOnLocationSelect}
        initialLocation={{
          address: 'Buenos Aires, Argentina',
          city: 'Buenos Aires',
          country: 'Argentina',
          lat: -34.6037,
          lng: -58.3816
        }}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByDisplayValue('Buenos Aires, Argentina')).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(mockOnLocationSelect).toHaveBeenCalledWith(null);
    expect(screen.getByPlaceholderText(/search for a location/i)).toHaveValue('');
  });

  it('should validate location input', async () => {
    const user = userEvent.setup();
    
    render(
      <LocationPicker 
        onLocationSelect={mockOnLocationSelect}
        required
      />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText(/search for a location/i);
    await user.type(input, 'Invalid Location 123');
    await user.tab(); // Blur input

    await waitFor(() => {
      expect(screen.getByText(/please select a valid location/i)).toBeInTheDocument();
    });
  });

  it('should handle city-only mode', () => {
    render(
      <LocationPicker 
        onLocationSelect={mockOnLocationSelect}
        cityOnly
      />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText(/search for a city/i);
    expect(input).toBeInTheDocument();

    // Verify autocomplete was configured for cities only
    expect(google.maps.places.Autocomplete).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        types: ['(cities)']
      })
    );
  });

  it('should handle event location mode', () => {
    render(
      <LocationPicker 
        onLocationSelect={mockOnLocationSelect}
        mode="event"
      />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText(/search for venue or address/i);
    expect(input).toBeInTheDocument();

    // Should allow more detailed location types
    expect(google.maps.places.Autocomplete).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        types: ['establishment', 'geocode']
      })
    );
  });

  it('should be disabled when specified', () => {
    render(
      <LocationPicker 
        onLocationSelect={mockOnLocationSelect}
        disabled
      />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText(/search for a location/i);
    expect(input).toBeDisabled();
    
    const mapButton = screen.queryByRole('button', { name: /show map/i });
    expect(mapButton).toBeDisabled();
  });
});