// Centralized Google Maps loader to ensure single async load
import { Loader } from '@googlemaps/js-api-loader';

let loaderInstance: Loader | null = null;
let loadPromise: Promise<void> | null = null;

export function getGoogleMapsLoader(): Loader {
  if (!loaderInstance) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }
    
    loaderInstance = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
      // Ensure async loading
      authReferrerPolicy: 'origin',
      language: 'en',
      region: 'US'
    });
  }
  
  return loaderInstance;
}

export async function loadGoogleMaps(): Promise<void> {
  if (loadPromise) {
    return loadPromise;
  }
  
  const loader = getGoogleMapsLoader();
  loadPromise = loader.load().then(() => {
    console.log('Google Maps loaded successfully');
  }).catch((error) => {
    console.error('Failed to load Google Maps:', error);
    loadPromise = null; // Reset to allow retry
    throw error;
  });
  
  return loadPromise;
}

export function isGoogleMapsLoaded(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.google !== 'undefined' && 
         typeof window.google.maps !== 'undefined';
}