import { db } from '../db';
import { CityPhotoService } from './CityPhotoService';

export interface CityInfo {
  name: string;
  city: string;
  state?: string;
  country: string;
  coordinates?: { lat: number; lng: number };
  normalized: string;
}

export interface NormalizationResult {
  found: boolean;
  cityInfo: CityInfo;
  source: 'database' | 'geocoding' | 'fallback';
}

export class CityNormalizationService {
  // Common abbreviations and their full forms
  private static commonAbbreviations: Record<string, string> = {
    // US Cities
    'nyc': 'New York City',
    'ny': 'New York City',
    'la': 'Los Angeles',
    'sf': 'San Francisco',
    'san fran': 'San Francisco',
    'philly': 'Philadelphia',
    'vegas': 'Las Vegas',
    'nola': 'New Orleans',
    'dc': 'Washington',
    
    // International
    'bsas': 'Buenos Aires',
    'bs as': 'Buenos Aires',
    'ba': 'Buenos Aires',
    'caba': 'Buenos Aires',
    'baires': 'Buenos Aires',
    'rio': 'Rio de Janeiro',
    'sp': 'São Paulo',
    'cdmx': 'Mexico City',
    'df': 'Mexico City',
    'bcn': 'Barcelona',
    'barna': 'Barcelona',
    'ams': 'Amsterdam',
    'dam': 'Amsterdam',
    
    // Add more as needed
  };

  /**
   * Normalize a city name, handling abbreviations and variations
   */
  static async normalizeCity(input: string, country?: string, state?: string): Promise<NormalizationResult> {
    const cleanInput = input.trim().toLowerCase();
    
    // Step 1: Check database for existing normalization
    const dbResult = await this.checkDatabaseNormalization(cleanInput, country);
    if (dbResult) {
      return {
        found: true,
        cityInfo: dbResult,
        source: 'database'
      };
    }
    
    // Step 2: Check common abbreviations
    const expanded = this.commonAbbreviations[cleanInput];
    if (expanded) {
      const expandedResult = await this.checkDatabaseNormalization(expanded.toLowerCase(), country);
      if (expandedResult) {
        // Store this abbreviation for future use
        await this.storeNormalization(input, expandedResult);
        return {
          found: true,
          cityInfo: expandedResult,
          source: 'database'
        };
      }
    }
    
    // Step 3: Try geocoding
    const geocoded = await this.geocodeCity(input, country, state);
    if (geocoded) {
      // Store for future use
      await this.storeNormalization(input, geocoded);
      return {
        found: true,
        cityInfo: geocoded,
        source: 'geocoding'
      };
    }
    
    // Step 4: Fallback - use input as-is
    const fallback: CityInfo = {
      name: input,
      city: input,
      state: state,
      country: country || 'Unknown',
      normalized: input
    };
    
    return {
      found: false,
      cityInfo: fallback,
      source: 'fallback'
    };
  }

  /**
   * Check database for existing normalization
   */
  private static async checkDatabaseNormalization(input: string, country?: string): Promise<CityInfo | null> {
    try {
      let query = `
        SELECT * FROM city_normalizations 
        WHERE LOWER(original_name) = LOWER($1)
      `;
      const params: any[] = [input];
      
      if (country) {
        query += ` AND country = $2`;
        params.push(country);
      }
      
      query += ` LIMIT 1`;
      
      // TODO: Implement with Drizzle
      const result = { rows: [] };
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          name: row.normalized_name,
          city: row.city,
          state: row.state,
          country: row.country,
          coordinates: row.latitude && row.longitude ? {
            lat: parseFloat(row.latitude),
            lng: parseFloat(row.longitude)
          } : undefined,
          normalized: row.normalized_name
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error checking database normalization:', error);
      return null;
    }
  }

  /**
   * Geocode a city using OpenStreetMap Nominatim
   */
  private static async geocodeCity(city: string, country?: string, state?: string): Promise<CityInfo | null> {
    try {
      // Build search query
      let searchQuery = city;
      if (state) searchQuery += `, ${state}`;
      if (country) searchQuery += `, ${country}`;
      
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&featuretype=city`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MundoTango/1.0' // Required by Nominatim
        }
      });
      
      if (!response.ok) {
        console.error('Geocoding failed:', response.status);
        return null;
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        return null;
      }
      
      const result = data[0];
      
      // Parse the display name to extract city, state, country
      const parts = result.display_name.split(',').map((p: string) => p.trim());
      const extractedCity = parts[0];
      const extractedCountry = parts[parts.length - 1];
      const extractedState = parts.length > 2 ? parts[parts.length - 2] : undefined;
      
      return {
        name: extractedCity,
        city: extractedCity,
        state: state || extractedState,
        country: country || extractedCountry,
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        },
        normalized: extractedCity
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Store a normalization for future use
   */
  private static async storeNormalization(original: string, cityInfo: CityInfo): Promise<void> {
    try {
      // TODO: Implement with Drizzle
      console.log('Normalization stored:', { original, cityInfo });
    } catch (error) {
      console.error('Error storing normalization:', error);
    }
  }

  /**
   * Get coordinates for a city (used by existing map features)
   */
  static async getCityCoordinates(city: string, country?: string): Promise<{ lat: number; lng: number } | null> {
    const result = await this.normalizeCity(city, country);
    return result.cityInfo.coordinates || null;
  }

  /**
   * Batch normalize cities (for migrations or bulk operations)
   */
  static async batchNormalize(cities: Array<{ city: string; country?: string }>): Promise<NormalizationResult[]> {
    const results: NormalizationResult[] = [];
    
    for (const { city, country } of cities) {
      const result = await this.normalizeCity(city, country);
      results.push(result);
      
      // Add small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }
}