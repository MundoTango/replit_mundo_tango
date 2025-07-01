import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

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

interface PhotoDownloadResult {
  localPath: string;
  originalUrl: string;
  photographer: string;
  pexelsId: number;
}

export class CityPhotoService {
  private static readonly PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'demo-key';
  private static readonly API_BASE = 'https://api.pexels.com/v1';
  private static readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'group-photos');
  
  /**
   * Download and store authentic high-resolution city photo from Pexels API
   * @param city - City name (e.g., "São Paulo", "Buenos Aires")
   * @param country - Country name (e.g., "Brazil", "Argentina")
   * @param groupId - Group ID for file organization
   * @returns Promise<PhotoDownloadResult> - Local file path and metadata
   */
  static async downloadAndStoreCityPhoto(city: string, country: string, groupId: number): Promise<PhotoDownloadResult> {
    try {
      console.log(`🔍 [11L Photo Flow] Starting photo download for ${city}, ${country} (Group ID: ${groupId})`);
      
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
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data = await response.json() as PexelsResponse;
      
      if (data.photos && data.photos.length > 0) {
        // Get the best quality photo (large or landscape format)
        const bestPhoto = data.photos[0];
        
        console.log(`✅ Found authentic ${city} photo by ${bestPhoto.photographer}`);
        
        // Download and store the photo locally
        const downloadResult = await this.downloadPhotoToLocal(bestPhoto, city, country, groupId);
        console.log(`💾 [11L Photo Flow] Photo downloaded and stored: ${downloadResult.localPath}`);
        
        return downloadResult;
      } else {
        console.warn(`⚠️ No photos found for ${city}, ${country}`);
        throw new Error('No photos found');
      }
      
    } catch (error) {
      console.error(`❌ Error in photo download workflow for ${city}, ${country}:`, error);
      
      // Return fallback result structure
      const fallbackUrl = this.getFallbackPhoto(city, country);
      return {
        localPath: fallbackUrl,
        originalUrl: fallbackUrl,
        photographer: 'Mundo Tango',
        pexelsId: 0
      };
    }
  }

  /**
   * Download photo from Pexels and store locally
   */
  private static async downloadPhotoToLocal(photo: PexelsPhoto, city: string, country: string, groupId: number): Promise<PhotoDownloadResult> {
    try {
      // Ensure upload directory exists
      await this.ensureUploadDirectory();
      
      // Generate unique filename
      const timestamp = Date.now();
      const photoExtension = 'jpg'; // Pexels photos are typically JPEG
      const filename = `group-${groupId}-${city.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.${photoExtension}`;
      const localPath = path.join(this.UPLOAD_DIR, filename);
      
      console.log(`📥 Downloading photo from: ${photo.src.large}`);
      
      // Download the photo
      const photoResponse = await fetch(photo.src.large);
      if (!photoResponse.ok) {
        throw new Error(`Failed to download photo: ${photoResponse.status}`);
      }
      
      // Get photo buffer
      const photoBuffer = await photoResponse.buffer();
      
      // Save to local file system
      await writeFile(localPath, photoBuffer);
      
      console.log(`💾 Photo saved to: ${localPath}`);
      
      return {
        localPath: `/uploads/group-photos/${filename}`, // Relative path for web serving
        originalUrl: photo.src.large,
        photographer: photo.photographer,
        pexelsId: photo.id
      };
      
    } catch (error) {
      console.error('❌ Error downloading photo to local storage:', error);
      throw error;
    }
  }

  /**
   * Ensure upload directory exists
   */
  private static async ensureUploadDirectory(): Promise<void> {
    try {
      await mkdir(this.UPLOAD_DIR, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
      console.log('📁 Upload directory ready');
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
   * Backward compatibility: Fetch city photo URL (legacy method)
   * @deprecated Use downloadAndStoreCityPhoto instead
   */
  static async fetchCityPhoto(city: string, country: string): Promise<string> {
    try {
      // Use the new download method but return just the URL for compatibility
      const result = await this.downloadAndStoreCityPhoto(city, country, 0);
      return result.localPath;
    } catch (error) {
      console.error(`❌ Legacy fetchCityPhoto error for ${city}, ${country}:`, error);
      return this.getFallbackPhoto(city, country);
    }
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