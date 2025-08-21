import { Request } from 'express';
import { languageAnalytics } from '@/shared/languageSchema';
import { storage } from '../storage';

// IPGeolocation.io API configuration
const IPGEOLOCATION_API_KEY = process.env.IPGEOLOCATION_API_KEY || '';
const IPGEOLOCATION_API_URL = 'https://api.ipgeolocation.io/v2/ipgeo';

export interface IPLocationData {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  stateProvince: string;
  timezone: string;
  language: string;
  currency: string;
  latitude: number;
  longitude: number;
}

// Language mapping based on country codes
const countryLanguageMap: Record<string, string> = {
  'US': 'en',
  'GB': 'en',
  'CA': 'en',
  'AU': 'en',
  'NZ': 'en',
  'ES': 'es',
  'AR': 'es-ar', // Argentina gets Spanish with lunfardo
  'MX': 'es',
  'CO': 'es',
  'CL': 'es',
  'PE': 'es',
  'VE': 'es',
  'EC': 'es',
  'GT': 'es',
  'CU': 'es',
  'BO': 'es',
  'DO': 'es',
  'HN': 'es',
  'PY': 'es',
  'SV': 'es',
  'NI': 'es',
  'CR': 'es',
  'PA': 'es',
  'UY': 'es',
  'BR': 'pt-br',
  'PT': 'pt',
  'FR': 'fr',
  'DE': 'de',
  'IT': 'it',
  'NL': 'nl',
  'BE': 'nl',
  'CH': 'de',
  'AT': 'de',
  'SE': 'sv',
  'NO': 'no',
  'DK': 'da',
  'FI': 'fi',
  'PL': 'pl',
  'RU': 'ru',
  'UA': 'uk',
  'JP': 'ja',
  'CN': 'zh',
  'TW': 'zh-tw',
  'KR': 'ko',
  'IN': 'hi',
  'PK': 'ur',
  'BD': 'bn',
  'ID': 'id',
  'TH': 'th',
  'VN': 'vi',
  'PH': 'fil',
  'MY': 'ms',
  'SA': 'ar',
  'AE': 'ar',
  'EG': 'ar',
  'IL': 'he',
  'TR': 'tr',
  'GR': 'el',
  'CZ': 'cs',
  'HU': 'hu',
  'RO': 'ro',
  'BG': 'bg',
  'HR': 'hr',
  'RS': 'sr',
  'SK': 'sk',
  'SI': 'sl',
  'EE': 'et',
  'LV': 'lv',
  'LT': 'lt',
  'ZA': 'af',
  'NG': 'en',
  'KE': 'en',
  'GH': 'en',
  'ET': 'am',
  'IR': 'fa',
};

export class IPLocationService {
  /**
   * Get the client's IP address from the request
   */
  static getClientIP(req: Request): string {
    // Check for IP in various headers (in order of reliability)
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      // x-forwarded-for may contain multiple IPs, take the first one
      const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
      return ips.split(',')[0].trim();
    }
    
    // Check other common headers
    const realIP = req.headers['x-real-ip'];
    if (realIP) {
      return Array.isArray(realIP) ? realIP[0] : realIP;
    }
    
    // Fallback to socket address
    return req.socket.remoteAddress || '';
  }

  /**
   * Detect location and language from IP address
   */
  static async detectFromIP(ip: string): Promise<IPLocationData | null> {
    try {
      // Skip for localhost/development IPs
      if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) {
        return {
          ip,
          country: 'United States',
          countryCode: 'US',
          city: 'Local Development',
          stateProvince: 'Development',
          timezone: 'America/New_York',
          language: 'en',
          currency: 'USD',
          latitude: 40.7128,
          longitude: -74.0060,
        };
      }

      // Call IPGeolocation.io API
      const url = `${IPGEOLOCATION_API_URL}?apiKey=${IPGEOLOCATION_API_KEY}&ip=${ip}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('IPGeolocation API error:', response.status);
        return null;
      }

      const data = await response.json();
      
      // Map the response to our format
      const locationData: IPLocationData = {
        ip: data.ip || ip,
        country: data.country_name || '',
        countryCode: data.country_code2 || '',
        city: data.city || '',
        stateProvince: data.state_prov || '',
        timezone: data.time_zone?.name || '',
        language: countryLanguageMap[data.country_code2] || 'en',
        currency: data.currency?.code || 'USD',
        latitude: parseFloat(data.lat) || 0,
        longitude: parseFloat(data.lon) || 0,
      };

      return locationData;
    } catch (error) {
      console.error('Error detecting location from IP:', error);
      return null;
    }
  }

  /**
   * Log language detection analytics
   */
  static async logLanguageDetection(
    userId: number | null,
    detectedLanguage: string,
    locationData: IPLocationData
  ): Promise<void> {
    try {
      const languageId = await storage.getLanguageIdByCode(detectedLanguage);
      if (!languageId) return;

      await storage.logLanguageAnalytics({
        userId,
        languageId,
        action: 'detect',
        contentType: 'ip_detection',
        ipAddress: locationData.ip,
        country: locationData.country,
        city: locationData.city,
      });
    } catch (error) {
      console.error('Error logging language detection:', error);
    }
  }

  /**
   * Get language preference from IP-based location
   */
  static async getLanguageFromRequest(req: Request): Promise<string> {
    const ip = this.getClientIP(req);
    const locationData = await this.detectFromIP(ip);
    
    if (locationData) {
      // Log the detection
      const userId = req.user?.id || null;
      await this.logLanguageDetection(userId, locationData.language, locationData);
      
      return locationData.language;
    }
    
    // Fallback to browser language
    const acceptLanguage = req.headers['accept-language'];
    if (acceptLanguage) {
      const browserLang = acceptLanguage.split(',')[0].split('-')[0];
      return browserLang;
    }
    
    // Default to English
    return 'en';
  }

  /**
   * Get location data for a specific IP
   */
  static async getLocationData(ip: string): Promise<IPLocationData | null> {
    return this.detectFromIP(ip);
  }
}

export default IPLocationService;