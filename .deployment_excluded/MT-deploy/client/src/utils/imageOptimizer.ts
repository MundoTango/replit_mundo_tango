/**
 * Image Optimization Utilities
 * Phase 8: Performance Optimization (35L Framework Layers 10, 11, 34)
 */

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Compress and optimize image file before upload
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'webp'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          },
          `image/${format}`,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Generate optimized image sizes for responsive display
 */
export async function generateResponsiveImages(
  file: File
): Promise<{
  thumbnail: Blob;
  small: Blob;
  medium: Blob;
  large: Blob;
  original: Blob;
}> {
  const [thumbnail, small, medium, large, original] = await Promise.all([
    optimizeImage(file, { maxWidth: 150, maxHeight: 150, quality: 0.8 }),
    optimizeImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.85 }),
    optimizeImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.85 }),
    optimizeImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.9 }),
    optimizeImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.95 })
  ]);
  
  return { thumbnail, small, medium, large, original };
}

/**
 * Calculate estimated file size after optimization
 */
export function estimateOptimizedSize(
  originalSize: number,
  quality: number = 0.85,
  format: 'webp' | 'jpeg' | 'png' = 'webp'
): number {
  const compressionRatios = {
    webp: 0.3,
    jpeg: 0.4,
    png: 0.7
  };
  
  return Math.round(originalSize * compressionRatios[format] * quality);
}

/**
 * Lazy load images with intersection observer
 */
export function lazyLoadImage(
  imageElement: HTMLImageElement,
  src: string,
  placeholder?: string
): void {
  if (placeholder) {
    imageElement.src = placeholder;
  }
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          imageElement.src = src;
          imageElement.classList.add('loaded');
          observer.unobserve(imageElement);
        }
      });
    },
    {
      rootMargin: '50px'
    }
  );
  
  observer.observe(imageElement);
}

/**
 * Create blur placeholder for images
 */
export async function createBlurPlaceholder(
  file: File,
  size: number = 40
): Promise<string> {
  const optimized = await optimizeImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.4,
    format: 'jpeg'
  });
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(optimized);
  });
}