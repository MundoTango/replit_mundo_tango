// City Validation Service
// Ensures only valid cities can be used in group creation

import { db } from '../db';
import * as fs from 'fs';
import * as path from 'path';

interface ValidCity {
  id: number;
  name: string;
  state: string;
  country: string;
  countryCode: string;
  stateCode?: string;
  lat?: number;
  lng?: number;
}

class CityValidationService {
  private citiesCache: Map<string, ValidCity> = new Map();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🌍 Initializing city validation service...');
    
    try {
      // Load cities from JSON database
      const citiesData = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'data/location/cities.json'), 'utf8')
      );
      const countriesData = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'data/location/countries.json'), 'utf8')
      );
      const statesData = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'data/location/states.json'), 'utf8')
      );

      // Create lookup maps
      const countryMap = new Map(countriesData.map((c: any) => [c.id, c]));
      const stateMap = new Map(statesData.map((s: any) => [s.id, s]));

      // Build city cache with full location data
      for (const city of citiesData) {
        const state = stateMap.get(city.state_id);
        const country = countryMap.get(city.country_id);
        
        if (country) {
          const cacheKey = this.getCacheKey(city.name, country.name);
          this.citiesCache.set(cacheKey, {
            id: city.id,
            name: city.name,
            state: state?.name || '',
            country: country.name,
            countryCode: country.iso2,
            stateCode: state?.state_code,
            lat: city.latitude,
            lng: city.longitude
          });
        }
      }

      this.initialized = true;
      console.log(`✅ City validation service initialized with ${this.citiesCache.size} cities`);
    } catch (error) {
      console.error('❌ Failed to initialize city validation service:', error);
      throw error;
    }
  }

  private getCacheKey(city: string, country: string): string {
    return `${city.toLowerCase().trim()}_${country.toLowerCase().trim()}`;
  }

  async validateCity(city: string, country: string): Promise<ValidCity | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    const cacheKey = this.getCacheKey(city, country);
    const validCity = this.citiesCache.get(cacheKey);

    if (!validCity) {
      console.log(`⚠️ Invalid city: ${city}, ${country}`);
      return null;
    }

    return validCity;
  }

  async findSimilarCities(city: string, limit: number = 5): Promise<ValidCity[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const searchTerm = city.toLowerCase().trim();
    const results: ValidCity[] = [];

    for (const [key, validCity] of this.citiesCache) {
      if (validCity.name.toLowerCase().includes(searchTerm)) {
        results.push(validCity);
        if (results.length >= limit) break;
      }
    }

    return results;
  }

  async geocodeCity(city: string, country: string): Promise<{lat: number, lng: number} | null> {
    const validCity = await this.validateCity(city, country);
    
    if (!validCity || !validCity.lat || !validCity.lng) {
      return null;
    }

    return { lat: validCity.lat, lng: validCity.lng };
  }
}

export const cityValidationService = new CityValidationService();