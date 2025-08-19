let isLoaded = false;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (isLoaded) {
    return Promise.resolve();
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;
  
  loadPromise = new Promise((resolve, reject) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      reject(new Error('Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.'));
      return;
    }

    // Check if already loaded
    if (window.google && window.google.maps) {
      isLoaded = true;
      isLoading = false;
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve();
    };
    
    script.onerror = () => {
      isLoading = false;
      reject(new Error('Failed to load Google Maps script'));
    };
    
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function isGoogleMapsLoaded(): boolean {
  return isLoaded;
}

// Type augmentation for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}