import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

// List of all supported languages from the database
export const supportedLanguages = [
  { code: 'en', name: 'English', country: 'US' },
  { code: 'es', name: 'Spanish', country: 'ES' },
  { code: 'es-ar', name: 'Spanish (Argentina)', country: 'AR', isLunfardo: true },
  { code: 'pt', name: 'Portuguese', country: 'PT' },
  { code: 'pt-br', name: 'Portuguese (Brazil)', country: 'BR' },
  { code: 'fr', name: 'French', country: 'FR' },
  { code: 'de', name: 'German', country: 'DE' },
  { code: 'it', name: 'Italian', country: 'IT' },
  { code: 'ru', name: 'Russian', country: 'RU' },
  { code: 'ja', name: 'Japanese', country: 'JP' },
  { code: 'ko', name: 'Korean', country: 'KR' },
  { code: 'zh', name: 'Chinese', country: 'CN' },
  { code: 'zh-tw', name: 'Chinese (Traditional)', country: 'TW' },
  { code: 'ar', name: 'Arabic', country: 'SA', direction: 'rtl' },
  { code: 'he', name: 'Hebrew', country: 'IL', direction: 'rtl' },
  { code: 'tr', name: 'Turkish', country: 'TR' },
  { code: 'pl', name: 'Polish', country: 'PL' },
  { code: 'nl', name: 'Dutch', country: 'NL' },
  { code: 'sv', name: 'Swedish', country: 'SE' },
  { code: 'no', name: 'Norwegian', country: 'NO' },
  { code: 'da', name: 'Danish', country: 'DK' },
  { code: 'fi', name: 'Finnish', country: 'FI' },
  { code: 'cs', name: 'Czech', country: 'CZ' },
  { code: 'hu', name: 'Hungarian', country: 'HU' },
  { code: 'el', name: 'Greek', country: 'GR' },
  { code: 'ro', name: 'Romanian', country: 'RO' },
  { code: 'bg', name: 'Bulgarian', country: 'BG' },
  { code: 'uk', name: 'Ukrainian', country: 'UA' },
  { code: 'hr', name: 'Croatian', country: 'HR' },
  { code: 'sr', name: 'Serbian', country: 'RS' },
  { code: 'sk', name: 'Slovak', country: 'SK' },
  { code: 'sl', name: 'Slovenian', country: 'SI' },
  { code: 'et', name: 'Estonian', country: 'EE' },
  { code: 'lv', name: 'Latvian', country: 'LV' },
  { code: 'lt', name: 'Lithuanian', country: 'LT' },
  { code: 'hi', name: 'Hindi', country: 'IN' },
  { code: 'bn', name: 'Bengali', country: 'BD' },
  { code: 'ta', name: 'Tamil', country: 'IN' },
  { code: 'te', name: 'Telugu', country: 'IN' },
  { code: 'mr', name: 'Marathi', country: 'IN' },
  { code: 'gu', name: 'Gujarati', country: 'IN' },
  { code: 'kn', name: 'Kannada', country: 'IN' },
  { code: 'ml', name: 'Malayalam', country: 'IN' },
  { code: 'pa', name: 'Punjabi', country: 'IN' },
  { code: 'ur', name: 'Urdu', country: 'PK', direction: 'rtl' },
  { code: 'fa', name: 'Persian', country: 'IR', direction: 'rtl' },
  { code: 'th', name: 'Thai', country: 'TH' },
  { code: 'vi', name: 'Vietnamese', country: 'VN' },
  { code: 'id', name: 'Indonesian', country: 'ID' },
  { code: 'ms', name: 'Malay', country: 'MY' },
  { code: 'tl', name: 'Tagalog', country: 'PH' },
  { code: 'fil', name: 'Filipino', country: 'PH' },
  { code: 'af', name: 'Afrikaans', country: 'ZA' },
  { code: 'sq', name: 'Albanian', country: 'AL' },
  { code: 'am', name: 'Amharic', country: 'ET' },
  { code: 'hy', name: 'Armenian', country: 'AM' },
  { code: 'az', name: 'Azerbaijani', country: 'AZ' },
  { code: 'eu', name: 'Basque', country: 'ES' },
  { code: 'be', name: 'Belarusian', country: 'BY' },
  { code: 'bs', name: 'Bosnian', country: 'BA' },
  { code: 'my', name: 'Burmese', country: 'MM' },
  { code: 'km', name: 'Cambodian', country: 'KH' },
  { code: 'ca', name: 'Catalan', country: 'ES' },
  { code: 'gl', name: 'Galician', country: 'ES' },
  { code: 'ka', name: 'Georgian', country: 'GE' },
];

// Export changeLanguage function
export const changeLanguage = async (lng: string) => {
  try {
    await i18n.changeLanguage(lng);
    // Store preference
    localStorage.setItem('i18nextLng', lng);
    // Update document direction for RTL languages
    const isRTL = supportedLanguages.find(l => l.code === lng)?.direction === 'rtl';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    return true;
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};

// Language detection configuration
const detectionOptions = {
  order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
  caches: ['localStorage', 'cookie'],
  lookupQuerystring: 'lang',
  lookupCookie: 'i18next',
  lookupLocalStorage: 'i18nextLng',
  
  // Exclude path from detection
  excludeCacheFor: ['cimode'],
  
  // Cookie configuration
  cookieMinutes: 60 * 24 * 365, // 1 year
  cookieDomain: 'mundotango.life',
};

// Initialize i18n
i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: supportedLanguages.map(lang => lang.code),
    fallbackLng: 'en',
    debug: false,
    
    detection: detectionOptions,
    
    // Backend configuration for loading translations
    backend: {
      loadPath: '/api/translations/{{lng}}/{{ns}}',
      addPath: '/api/translations/{{lng}}/{{ns}}',
      allowMultiLoading: false,
      crossDomain: false,
      withCredentials: true,
      
      // Client-side caching
      requestOptions: {
        cache: 'default',
      },
      
      // Custom cache implementation using localStorage
      request: async function(options: any, url: string, payload: any, callback: any) {
        const cacheKey = `i18n_cache_${url}`;
        const cacheExpiry = 3600000; // 1 hour
        
        // Check cache first
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < cacheExpiry) {
              callback(null, { status: 200, data });
              return;
            }
          }
        } catch (e) {
          // Cache read error, continue with request
        }
        
        // Make the actual request
        try {
          const response = await fetch(url, {
            method: options.method || 'GET',
            headers: options.headers || {},
            credentials: 'include',
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // Cache the response
            try {
              localStorage.setItem(cacheKey, JSON.stringify({
                data,
                timestamp: Date.now(),
              }));
            } catch (e) {
              // Cache write error, ignore
            }
            
            callback(null, { status: response.status, data });
          } else {
            callback(response.statusText || 'Failed to load translations', { status: response.status });
          }
        } catch (error) {
          callback(error, null);
        }
      },
    },
    
    // Namespaces
    ns: ['common', 'profile', 'events', 'groups', 'messages', 'settings', 'auth', 'errors'],
    defaultNS: 'common',
    
    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes values
      formatSeparator: ',',
    },
    
    // React specific options
    react: {
      useSuspense: false, // We'll handle loading states manually
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    },
    
    // Caching
    saveMissing: true,
    updateMissing: true,
    
    // Load translations on init
    preload: ['en', 'es', 'es-ar'], // Preload English and Spanish
    
    // Special handling for lunfardo
    postProcess: ['lunfardo'],
  });

// Lunfardo post processor for Spanish (Argentina)
i18n.use({
  type: 'postProcessor',
  name: 'lunfardo',
  process: function(value: string, key: string, options: any, translator: any) {
    // Only process for es-ar language
    if (translator && translator.language === 'es-ar' && options.lunfardo) {
      // This will be replaced with actual lunfardo terms from the database
      return value;
    }
    return value;
  }
});

// Function to get user's location from IP
export async function detectLocationFromIP(): Promise<{ country: string; city: string; language: string } | null> {
  try {
    const response = await fetch('/api/location/detect');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to detect location from IP:', error);
  }
  return null;
}

// Function to change language and update user preferences
export async function changeLanguage(languageCode: string) {
  await i18n.changeLanguage(languageCode);
  
  // Update user preferences in the backend
  try {
    await fetch('/api/user/language-preference', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ languageCode }),
      credentials: 'include',
    });
  } catch (error) {
    console.error('Failed to update language preference:', error);
  }
}

// Function to get translated content
export async function getTranslatedContent(
  contentType: string,
  contentId: string,
  targetLanguage: string
): Promise<string | null> {
  try {
    const response = await fetch(`/api/translations/content/${contentType}/${contentId}/${targetLanguage}`);
    if (response.ok) {
      const data = await response.json();
      return data.translatedText;
    }
  } catch (error) {
    console.error('Failed to get translated content:', error);
  }
  return null;
}

// Function to submit a translation
export async function submitTranslation(
  contentType: string,
  contentId: string,
  originalText: string,
  translatedText: string,
  targetLanguage: string
) {
  try {
    const response = await fetch('/api/translations/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType,
        contentId,
        originalText,
        translatedText,
        targetLanguage,
      }),
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to submit translation:', error);
    return false;
  }
}

// Function to vote on a translation
export async function voteOnTranslation(translationId: number, voteType: 'up' | 'down', reason?: string) {
  try {
    const response = await fetch('/api/translations/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        translationId,
        voteType,
        reason,
      }),
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to vote on translation:', error);
    return false;
  }
}

export default i18n;