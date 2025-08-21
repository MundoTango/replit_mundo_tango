/**
 * Utility functions for formatting and displaying user location information
 */

export interface UserLocation {
  city?: string;
  state?: string;
  country?: string;
}

/**
 * Formats user location for display
 * Prioritizes city, falls back to state, then country
 * Returns appropriate emoji prefix
 */
export function formatUserLocation(location: UserLocation): string {
  const { city, state, country } = location;
  
  // Priority: city > state > country
  if (city && country) {
    return `📍 ${city}, ${country}`;
  } else if (city && state) {
    return `📍 ${city}, ${state}`;
  } else if (city) {
    return `📍 ${city}`;
  } else if (state && country) {
    return `📍 ${state}, ${country}`;
  } else if (state) {
    return `📍 ${state}`;
  } else if (country) {
    return `🌍 ${country}`;
  }
  
  return '🌍 Location not set';
}

/**
 * Gets location tooltip text
 */
export function getLocationTooltip(location: UserLocation): string {
  const { city, state, country } = location;
  
  if (city && state && country) {
    return `${city}, ${state}, ${country}`;
  } else if (city && country) {
    return `${city}, ${country}`;
  } else if (city && state) {
    return `${city}, ${state}`;
  } else if (city) {
    return city;
  } else if (state && country) {
    return `${state}, ${country}`;
  } else if (state) {
    return state;
  } else if (country) {
    return country;
  }
  
  return 'Location not specified';
}