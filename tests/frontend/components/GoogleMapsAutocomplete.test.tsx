import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoogleMapsAutocomplete from '@/components/maps/GoogleMapsAutocomplete';

// Mock the Google Maps loader
jest.mock('@googlemaps/js-api-loader', () => ({
  Loader: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockResolvedValue({
      maps: {
        places: {
          Autocomplete: jest.fn().mockImplementation(() => ({
            addListener: jest.fn(),
            getPlace: jest.fn().mockReturnValue({
              formatted_address: 'Buenos Aires, Argentina',
              geometry: {
                location: {
                  lat: () => -34.6037,
                  lng: () => -58.3816
                }
              },
              address_components: [
                { types: ['locality'], long_name: 'Buenos Aires' },
                { types: ['country'], long_name: 'Argentina' }
              ]
            })
          }))
        }
      }
    }))
  }))
}));

describe('GoogleMapsAutocomplete Component', () => {
  const mockOnLocationSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <GoogleMapsAutocomplete
        onLocationSelect={mockOnLocationSelect}
        placeholder="Search for a location"
      />
    );

    expect(screen.getByText('Loading location search...')).toBeInTheDocument();
  });

  it('renders search input when loaded', async () => {
    render(
      <GoogleMapsAutocomplete
        onLocationSelect={mockOnLocationSelect}
        placeholder="Search for a location"
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search for a location')).toBeInTheDocument();
    });
  });

  it('handles input changes', async () => {
    const user = userEvent.setup();
    
    render(
      <GoogleMapsAutocomplete
        onLocationSelect={mockOnLocationSelect}
        placeholder="Search for a location"
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search for a location')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Search for a location');
    await user.type(input, 'Buenos Aires');

    expect(input).toHaveValue('Buenos Aires');
  });

  it('clears input when clear button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <GoogleMapsAutocomplete
        onLocationSelect={mockOnLocationSelect}
        placeholder="Search for a location"
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search for a location')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Search for a location');
    await user.type(input, 'Buenos Aires');

    const clearButton = screen.getByRole('button');
    await user.click(clearButton);

    expect(input).toHaveValue('');
  });

  it('shows selected location information', async () => {
    const mockLocation = {
      city: 'Buenos Aires',
      state: 'Buenos Aires',
      country: 'Argentina',
      latitude: -34.6037,
      longitude: -58.3816,
      formattedAddress: 'Buenos Aires, Argentina'
    };

    render(
      <GoogleMapsAutocomplete
        onLocationSelect={mockOnLocationSelect}
        placeholder="Search for a location"
        selectedLocation={mockLocation}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Buenos Aires, Buenos Aires, Argentina')).toBeInTheDocument();
      expect(screen.getByText(/Coordinates: -34\.603700, -58\.381600/)).toBeInTheDocument();
    });
  });

  it('displays error message when provided', async () => {
    render(
      <GoogleMapsAutocomplete
        onLocationSelect={mockOnLocationSelect}
        placeholder="Search for a location"
        error="Failed to load location data"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load location data')).toBeInTheDocument();
    });
  });

  it('shows map when showMap prop is true', async () => {
    render(
      <GoogleMapsAutocomplete
        onLocationSelect={mockOnLocationSelect}
        placeholder="Search for a location"
        showMap={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Map Preview')).toBeInTheDocument();
      expect(screen.getByText('Click on map or drag marker to adjust location')).toBeInTheDocument();
    });
  });
});