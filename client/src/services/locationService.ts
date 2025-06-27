import countriesData from '../../../data/location/countries.json';
import statesData from '../../../data/location/states.json';
import citiesData from '../../../data/location/cities.json';

export interface Country {
  id: number;
  name: string;
  iso3: string;
  iso2: string;
  numeric_code: string;
  phonecode: string;
  capital: string;
  currency: string;
  currency_name: string;
  currency_symbol: string;
  tld: string;
  native: string;
  region: string;
  region_id: number;
  subregion: string;
  subregion_id: number;
  nationality: string;
  timezones: Array<{
    zoneName: string;
    gmtOffset: number;
    gmtOffsetName: string;
    abbreviation: string;
    tzName: string;
  }>;
  translations: Record<string, string>;
  latitude: string;
  longitude: string;
  emoji: string;
  emojiU: string;
}

export interface State {
  id: number;
  name: string;
  country_id: number;
  country_code: string;
  country_name: string;
  state_code: string;
  type: string;
  latitude: string;
  longitude: string;
}

export interface City {
  id: number;
  name: string;
  state_id: number;
  state_code: string;
  state_name: string;
  country_id: number;
  country_code: string;
  country_name: string;
  latitude: string;
  longitude: string;
  wikiDataId: string;
}

class LocationService {
  private countries: Country[] = countriesData as Country[];
  private states: State[] = statesData as State[];
  private cities: City[] = citiesData as City[];

  getAllCountries(): Country[] {
    return this.countries.sort((a, b) => a.name.localeCompare(b.name));
  }

  getCountryById(id: number): Country | undefined {
    return this.countries.find(country => country.id === id);
  }

  getCountryByCode(code: string): Country | undefined {
    return this.countries.find(country => 
      country.iso2.toLowerCase() === code.toLowerCase() || 
      country.iso3.toLowerCase() === code.toLowerCase()
    );
  }

  getStatesByCountryId(countryId: number): State[] {
    return this.states
      .filter(state => state.country_id === countryId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getStateById(id: number): State | undefined {
    return this.states.find(state => state.id === id);
  }

  getCitiesByStateId(stateId: number): City[] {
    return this.cities
      .filter(city => city.state_id === stateId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getCitiesByCountryId(countryId: number): City[] {
    return this.cities
      .filter(city => city.country_id === countryId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getCityById(id: number): City | undefined {
    return this.cities.find(city => city.id === id);
  }

  searchCountries(query: string): Country[] {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return this.countries
      .filter(country => 
        country.name.toLowerCase().includes(lowerQuery) ||
        (country.native && country.native.toLowerCase().includes(lowerQuery)) ||
        country.iso2.toLowerCase().includes(lowerQuery) ||
        country.iso3.toLowerCase().includes(lowerQuery) ||
        country.capital.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => {
        // Prioritize exact matches at the beginning
        const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
        const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 20);
  }

  searchStates(query: string, countryId?: number): State[] {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    let filteredStates = this.states;

    if (countryId) {
      filteredStates = filteredStates.filter(state => state.country_id === countryId);
    }

    return filteredStates
      .filter(state => 
        state.name.toLowerCase().includes(lowerQuery) ||
        state.state_code.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
        const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 50);
  }

  searchCities(query: string, stateId?: number, countryId?: number): City[] {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    let filteredCities = this.cities;

    if (stateId) {
      filteredCities = filteredCities.filter(city => city.state_id === stateId);
    } else if (countryId) {
      filteredCities = filteredCities.filter(city => city.country_id === countryId);
    }

    return filteredCities
      .filter(city => city.name.toLowerCase().includes(lowerQuery))
      .sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
        const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 100);
  }

  // Get popular/major cities for a country
  getMajorCitiesByCountry(countryId: number, limit: number = 20): City[] {
    return this.cities
      .filter(city => city.country_id === countryId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, limit);
  }

  // Get timezone info for a country
  getTimezonesForCountry(countryId: number): Array<{zoneName: string; gmtOffset: number; gmtOffsetName: string}> {
    const country = this.getCountryById(countryId);
    return country?.timezones || [];
  }
}

export const locationService = new LocationService();