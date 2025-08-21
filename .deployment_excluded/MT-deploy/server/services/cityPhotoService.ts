/**
 * 🏗️ 11L City Photo Service - Dynamic Photo Fetching for City Groups
 * Automatically fetches authentic city photos from Pexels API
 */

import fetch from 'node-fetch';

interface CityPhoto {
  url: string;
  photographer: string;
  source: string;
  quality: 'high' | 'medium' | 'low';
}

interface PexelsPhoto {
  id: number;
  photographer: string;
  src: {
    large: string;
    medium: string;
    small: string;
  };
  alt: string;
}

export class CityPhotoService {
  private static readonly PEXELS_API_KEY = process.env.PEXELS_API_KEY;
  private static readonly PEXELS_BASE_URL = 'https://api.pexels.com/v1';
  
  // Layer 5: Data Layer - Curated city photo mappings
  private static readonly CURATED_PHOTOS = {
    'Buenos Aires': 'https://images.pexels.com/photos/16228260/pexels-photo-16228260.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&fit=crop',
    'Montevideo': 'https://images.pexels.com/photos/5472862/pexels-photo-5472862.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&fit=crop',
    'Milan': 'https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&fit=crop',
    'Paris': 'https://images.pexels.com/photos/161853/eiffel-tower-paris-france-tower-161853.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&fit=crop',
    'Warsaw': 'https://images.pexels.com/photos/1477430/pexels-photo-1477430.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&fit=crop',
    'São Paulo': 'https://images.pexels.com/photos/3619595/pexels-photo-3619595.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&fit=crop',
    'San Francisco': 'https://images.pexels.com/photos/208745/pexels-photo-208745.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&fit=crop',
    'Rosario': 'https://images.pexels.com/photos/2635011/pexels-photo-2635011.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&fit=crop'
  };

  private static readonly DEFAULT_FALLBACK = 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&fit=crop';

  /**
   * Layer 6: Backend Layer - Fetch city photo from Pexels API
   */
  static async fetchCityPhoto(cityName: string, country?: string): Promise<CityPhoto | null> {
    try {
      // Layer 4: UX Safeguards - Check curated photos first
      if (this.CURATED_PHOTOS[cityName]) {
        console.log(`🎯 Using curated photo for ${cityName}`);
        return {
          url: this.CURATED_PHOTOS[cityName],
          photographer: 'Pexels Curated',
          source: 'pexels',
          quality: 'high'
        };
      }

      // Layer 9: Security - Validate API key
      if (!this.PEXELS_API_KEY) {
        console.log('⚠️ Pexels API key not configured, using curated fallback');
        return this.getFallbackPhoto(cityName);
      }

      // Layer 10: AI & Reasoning - Build intelligent search query
      const searchQuery = this.buildSearchQuery(cityName, country);
      
      console.log(`🔍 Searching Pexels for: "${searchQuery}"`);

      const response = await fetch(
        `${this.PEXELS_BASE_URL}/search?query=${encodeURIComponent(searchQuery)}&per_page=5&orientation=landscape`,
        {
          headers: {
            'Authorization': this.PEXELS_API_KEY,
            'User-Agent': 'MundoTango/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data = await response.json() as { photos: PexelsPhoto[] };
      
      if (data.photos && data.photos.length > 0) {
        const photo = data.photos[0];
        console.log(`✅ Found photo for ${cityName} by ${photo.photographer}`);
        
        return {
          url: photo.src.large,
          photographer: photo.photographer,
          source: 'pexels',
          quality: 'high'
        };
      }

      // Layer 4: UX Safeguards - Fallback to curated photo
      return this.getFallbackPhoto(cityName);

    } catch (error) {
      console.error(`❌ Error fetching photo for ${cityName}:`, error);
      return this.getFallbackPhoto(cityName);
    }
  }

  /**
   * Layer 10: AI & Reasoning - Build intelligent search query
   */
  private static buildSearchQuery(cityName: string, country?: string): string {
    const cityKeywords = [
      cityName,
      `${cityName} skyline`,
      `${cityName} landmark`,
      `${cityName} architecture`
    ];

    if (country) {
      cityKeywords.push(`${cityName} ${country}`);
    }

    // Return the most specific query first
    return country ? `${cityName} ${country} landmark` : `${cityName} skyline`;
  }

  /**
   * Layer 4: UX Safeguards - Fallback photo system
   */
  private static getFallbackPhoto(cityName: string): CityPhoto {
    // Try to find a regional fallback
    const fallbackUrl = this.CURATED_PHOTOS[cityName] || this.DEFAULT_FALLBACK;
    
    return {
      url: fallbackUrl,
      photographer: 'Curated Collection',
      source: 'fallback',
      quality: 'medium'
    };
  }

  /**
   * Layer 8: Automation Layer - Batch update photos for existing groups
   */
  static async updateAllGroupPhotos(storage: any): Promise<void> {
    console.log('🔄 Starting batch photo update for all city groups...');
    
    try {
      // Get all city groups without photos
      const groups = await storage.db.select().from(storage.schema.groups)
        .where(storage.eq(storage.schema.groups.type, 'city'));

      console.log(`📋 Found ${groups.length} city groups to process`);

      let successCount = 0;
      let errorCount = 0;

      for (const group of groups) {
        try {
          console.log(`\n🔍 Processing ${group.name} (${group.city}, ${group.country})`);
          
          const photo = await this.fetchCityPhoto(group.city, group.country);
          
          if (photo) {
            await storage.db.update(storage.schema.groups)
              .set({ 
                imageUrl: photo.url,
                coverImage: photo.url
              })
              .where(storage.eq(storage.schema.groups.id, group.id));
            
            console.log(`✅ Updated photo for ${group.name}`);
            successCount++;
          } else {
            console.log(`⚠️ No photo found for ${group.name}`);
            errorCount++;
          }
          
          // Layer 9: Security - Rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`❌ Error updating ${group.name}:`, error);
          errorCount++;
        }
      }

      console.log(`\n📊 Batch update complete: ${successCount} success, ${errorCount} errors`);
      
    } catch (error) {
      console.error('❌ Batch update failed:', error);
    }
  }

  /**
   * Layer 11: Testing & Observability - Validate photo URLs
   */
  static async validatePhotoUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.startsWith('image/');
    } catch {
      return false;
    }
  }
}

export default CityPhotoService;