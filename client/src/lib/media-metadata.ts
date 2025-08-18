import EXIF from 'exif-js';

interface MediaMetadata {
  location?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  timestamp?: Date;
  device?: string;
  orientation?: number;
  width?: number;
  height?: number;
}

// Extract metadata from image files
export async function extractImageMetadata(file: File): Promise<MediaMetadata> {
  return new Promise((resolve) => {
    const metadata: MediaMetadata = {};

    // Get basic file info
    metadata.timestamp = new Date(file.lastModified);

    // Read EXIF data
    EXIF.getData(file as any, function() {
      try {
        // Extract GPS coordinates
        const lat = EXIF.getTag(this, 'GPSLatitude');
        const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
        const lng = EXIF.getTag(this, 'GPSLongitude');
        const lngRef = EXIF.getTag(this, 'GPSLongitudeRef');

        if (lat && lng) {
          const latitude = convertDMSToDD(lat, latRef);
          const longitude = convertDMSToDD(lng, lngRef);
          
          if (latitude && longitude) {
            metadata.location = {
              lat: latitude,
              lng: longitude,
              accuracy: EXIF.getTag(this, 'GPSAccuracy') || undefined
            };
          }
        }

        // Extract timestamp
        const dateTime = EXIF.getTag(this, 'DateTime') || EXIF.getTag(this, 'DateTimeOriginal');
        if (dateTime) {
          // EXIF date format: "YYYY:MM:DD HH:MM:SS"
          const parts = dateTime.split(' ');
          if (parts.length === 2) {
            const dateParts = parts[0].split(':');
            const timeParts = parts[1].split(':');
            if (dateParts.length === 3 && timeParts.length === 3) {
              metadata.timestamp = new Date(
                parseInt(dateParts[0]),
                parseInt(dateParts[1]) - 1,
                parseInt(dateParts[2]),
                parseInt(timeParts[0]),
                parseInt(timeParts[1]),
                parseInt(timeParts[2])
              );
            }
          }
        }

        // Extract device info
        const make = EXIF.getTag(this, 'Make');
        const model = EXIF.getTag(this, 'Model');
        if (make || model) {
          metadata.device = [make, model].filter(Boolean).join(' ');
        }

        // Extract dimensions
        metadata.width = EXIF.getTag(this, 'PixelXDimension') || EXIF.getTag(this, 'ImageWidth');
        metadata.height = EXIF.getTag(this, 'PixelYDimension') || EXIF.getTag(this, 'ImageHeight');
        metadata.orientation = EXIF.getTag(this, 'Orientation');

        resolve(metadata);
      } catch (error) {
        console.error('Error parsing EXIF data:', error);
        resolve(metadata);
      }
    });

    // Fallback if EXIF reading fails
    setTimeout(() => resolve(metadata), 5000);
  });
}

// Extract metadata from video files
export async function extractVideoMetadata(file: File): Promise<MediaMetadata> {
  const metadata: MediaMetadata = {};
  
  // Basic file info
  metadata.timestamp = new Date(file.lastModified);
  
  // Create video element to get dimensions
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      metadata.width = video.videoWidth;
      metadata.height = video.videoHeight;
      resolve(metadata);
    };
    
    video.onerror = () => {
      resolve(metadata);
    };
    
    video.src = URL.createObjectURL(file);
    
    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(video.src);
      resolve(metadata);
    }, 10000);
  });
}

// Main function to extract metadata from any media file
export async function extractMediaMetadata(file: File): Promise<MediaMetadata> {
  if (file.type.startsWith('image/')) {
    return extractImageMetadata(file);
  } else if (file.type.startsWith('video/')) {
    return extractVideoMetadata(file);
  }
  
  // Return basic metadata for other file types
  return {
    timestamp: new Date(file.lastModified)
  };
}

// Convert GPS coordinates from DMS to decimal degrees
function convertDMSToDD(
  dms: number[] | undefined,
  ref: string | undefined
): number | null {
  if (!dms || dms.length !== 3) return null;
  
  let dd = dms[0] + dms[1] / 60 + dms[2] / 3600;
  
  if (ref === 'S' || ref === 'W') {
    dd = dd * -1;
  }
  
  return dd;
}

// Correlate media location with known locations
export function correlateWithKnownLocations(
  mediaLocation: { lat: number; lng: number },
  knownLocations: Array<{ lat: number; lng: number; name: string; radius?: number }>
): { location: typeof knownLocations[0]; distance: number } | null {
  const threshold = 0.5; // 500 meters default
  
  for (const known of knownLocations) {
    const distance = calculateDistance(
      mediaLocation.lat,
      mediaLocation.lng,
      known.lat,
      known.lng
    );
    
    const radius = known.radius || threshold;
    if (distance <= radius) {
      return { location: known, distance };
    }
  }
  
  return null;
}

// Calculate distance between two points in kilometers
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}