// Geocoding Service
// Converts addresses to latitude/longitude coordinates for map display

import fetch from 'node-fetch';

// Use Nominatim OpenStreetMap API for free geocoding (no API key required)
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

// Geocode an address to get latitude and longitude
export async function geocodeAddress(address, city, country) {
  try {
    // Build search query
    const query = [address, city, country].filter(Boolean).join(', ');
    
    if (!query) {
      console.log('⚠️ No address provided for geocoding');
      return null;
    }
    
    // Make request to Nominatim
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
      addressdetails: '1'
    });
    
    const response = await fetch(`${NOMINATIM_API}?${params}`, {
      headers: {
        'User-Agent': 'MundoTango/1.0' // Required by Nominatim
      }
    });
    
    if (!response.ok) {
      console.error('❌ Geocoding API error:', response.statusText);
      return null;
    }
    
    const results = await response.json();
    
    if (results.length === 0) {
      console.log(`⚠️ No coordinates found for: ${query}`);
      return null;
    }
    
    const location = results[0];
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lon);
    
    console.log(`✅ Geocoded "${query}" to: ${lat}, ${lng}`);
    
    return {
      lat,
      lng,
      display_name: location.display_name,
      address_components: {
        house_number: location.address?.house_number,
        road: location.address?.road,
        suburb: location.address?.suburb,
        city: location.address?.city || location.address?.town || location.address?.village,
        state: location.address?.state,
        postcode: location.address?.postcode,
        country: location.address?.country,
        country_code: location.address?.country_code
      }
    };
  } catch (error) {
    console.error('❌ Geocoding error:', error);
    return null;
  }
}

// Batch geocode multiple addresses (with rate limiting)
export async function batchGeocodeAddresses(locations) {
  const results = [];
  
  for (const location of locations) {
    const geocoded = await geocodeAddress(location.address, location.city, location.country);
    results.push({
      ...location,
      ...geocoded
    });
    
    // Rate limit: 1 request per second (Nominatim requirement)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

// Reverse geocode coordinates to get address
export async function reverseGeocode(lat, lng) {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
      addressdetails: '1'
    });
    
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      headers: {
        'User-Agent': 'MundoTango/1.0'
      }
    });
    
    if (!response.ok) {
      console.error('❌ Reverse geocoding API error:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    return {
      display_name: data.display_name,
      address: data.address?.road || '',
      city: data.address?.city || data.address?.town || data.address?.village || '',
      state: data.address?.state || '',
      country: data.address?.country || '',
      postcode: data.address?.postcode || ''
    };
  } catch (error) {
    console.error('❌ Reverse geocoding error:', error);
    return null;
  }
}

// Get coordinates for a city (for city groups)
export async function getCityCoordinates(city, country) {
  try {
    const query = `${city}, ${country}`;
    
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
      featuretype: 'city'
    });
    
    const response = await fetch(`${NOMINATIM_API}?${params}`, {
      headers: {
        'User-Agent': 'MundoTango/1.0'
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const results = await response.json();
    
    if (results.length === 0) {
      return null;
    }
    
    return {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon)
    };
  } catch (error) {
    console.error('❌ City geocoding error:', error);
    return null;
  }
}