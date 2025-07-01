import fetch from 'node-fetch';

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsResponse {
  photos: PexelsPhoto[];
  total_results: number;
  page: number;
  per_page: number;
  next_page?: string;
}

export class CityPhotoService {
  private static readonly PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'demo-key';
  private static readonly API_BASE = 'https://api.pexels.com/v1';
  
  /**
   * Fetch authentic high-resolution city photo from Pexels API
   * @param city - City name (e.g., "São Paulo", "Buenos Aires")
   * @param country - Country name (e.g., "Brazil", "Argentina")
   * @returns Promise<string> - High-resolution photo URL or fallback
   */
  static async fetchCityPhoto(city: string, country: string): Promise<string> {
    try {
      console.log(`🔍 Fetching authentic photo for ${city}, ${country} from Pexels API`);
      
      // Create search query with city landmarks and architecture keywords
      const searchQuery = `${city} ${country} skyline landmark architecture cityscape`;
      const encodedQuery = encodeURIComponent(searchQuery);
      
      const response = await fetch(
        `${this.API_BASE}/search?query=${encodedQuery}&per_page=10&size=large`,
        {
          headers: {
            'Authorization': this.PEXELS_API_KEY,
            'User-Agent': 'Mundo-Tango-City-Photos/1.0'
          }
        }
      );

      if (!response.ok) {
        console.warn(`⚠️ Pexels API error ${response.status}: ${response.statusText}`);
        return this.getFallbackPhoto(city, country);
      }

      const data = await response.json() as PexelsResponse;
      
      if (data.photos && data.photos.length > 0) {
        // Get the best quality photo (large or landscape format)
        const bestPhoto = data.photos[0];
        const photoUrl = bestPhoto.src.landscape || bestPhoto.src.large;
        
        console.log(`✅ Found authentic ${city} photo:`, {
          photographer: bestPhoto.photographer,
          url: photoUrl,
          alt: bestPhoto.alt
        });
        
        return photoUrl;
      } else {
        console.warn(`⚠️ No photos found for ${city}, ${country}`);
        return this.getFallbackPhoto(city, country);
      }
      
    } catch (error) {
      console.error(`❌ Error fetching photo for ${city}, ${country}:`, error);
      return this.getFallbackPhoto(city, country);
    }
  }

  /**
   * Get curated fallback photo for major cities
   */
  private static getFallbackPhoto(city: string, country: string): string {
    const cityKey = `${city}-${country}`;
    
    // Curated high-quality city photos as fallbacks
    const fallbackPhotos: Record<string, string> = {
      'São Paulo-Brazil': 'https://images.pexels.com/photos/161159/sao-paulo-brazil-skyline-skyscrapers-161159.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'Buenos Aires-Argentina': 'https://images.pexels.com/photos/7061662/pexels-photo-7061662.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'San Francisco-USA': 'https://images.pexels.com/photos/208745/pexels-photo-208745.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'Paris-France': 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'Milan-Italy': 'https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'Warsaw-Poland': 'https://images.pexels.com/photos/5477857/pexels-photo-5477857.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'Montevideo-Uruguay': 'https://images.pexels.com/photos/8828678/pexels-photo-8828678.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'Rosario-Argentina': 'https://images.pexels.com/photos/7205933/pexels-photo-7205933.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };
    
    const fallback = fallbackPhotos[cityKey];
    if (fallback) {
      console.log(`📸 Using curated fallback photo for ${cityKey}`);
      return fallback;
    }
    
    // Generic city skyline as ultimate fallback
    console.log(`🏙️ Using generic city photo for ${cityKey}`);
    return 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  }

  /**
   * Cache photo URL in database to avoid repeated API calls
   */
  static async cachePhotoUrl(groupId: number, photoUrl: string, storage: any): Promise<void> {
    try {
      await storage.updateGroup(groupId, { imageUrl: photoUrl });
      console.log(`💾 Cached photo URL for group ${groupId}`);
    } catch (error) {
      console.error(`❌ Error caching photo URL:`, error);
    }
  }
}