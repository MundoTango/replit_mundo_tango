import { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

interface CDNConfig {
  enabled: boolean;
  baseUrl?: string;
  maxAge: number;
  immutablePaths: string[];
  versionedPaths: string[];
}

// CDN configuration
const cdnConfig: CDNConfig = {
  enabled: process.env.CDN_ENABLED === 'true',
  baseUrl: process.env.CDN_URL || '', // e.g., 'https://cdn.mundotango.life'
  maxAge: parseInt(process.env.CDN_MAX_AGE || '31536000'), // 1 year default
  immutablePaths: ['/assets/', '/fonts/', '/images/'],
  versionedPaths: ['/js/', '/css/'],
};

// Generate ETag for static files
function generateETag(content: Buffer | string): string {
  return crypto
    .createHash('md5')
    .update(content)
    .digest('hex');
}

// Middleware to set CDN-friendly headers
export function cdnHeaders(req: Request, res: Response, next: NextFunction) {
  const filePath = req.path;
  
  // Set CORS headers for CDN
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD');
  
  // Check if path should be cached
  const isImmutable = cdnConfig.immutablePaths.some(path => filePath.startsWith(path));
  const isVersioned = cdnConfig.versionedPaths.some(path => filePath.startsWith(path));
  
  if (isImmutable || isVersioned) {
    // Set aggressive caching for immutable assets
    res.setHeader('Cache-Control', `public, max-age=${cdnConfig.maxAge}, immutable`);
  } else if (filePath.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|eot)$/i)) {
    // Set long cache for images and fonts
    res.setHeader('Cache-Control', `public, max-age=${cdnConfig.maxAge}`);
  } else if (filePath.match(/\.(js|css)$/i)) {
    // Set shorter cache for JS/CSS without version hash
    res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week
  }
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  next();
}

// Middleware to rewrite asset URLs to CDN
export function cdnRewrite(req: Request, res: Response, next: NextFunction) {
  if (!cdnConfig.enabled || !cdnConfig.baseUrl) {
    return next();
  }
  
  // Store original res.send
  const originalSend = res.send;
  
  // Override res.send to rewrite URLs
  res.send = function(data: any): Response {
    if (res.getHeader('Content-Type')?.toString().includes('text/html')) {
      // Convert data to string
      let html = data.toString();
      
      // Rewrite asset URLs to CDN
      const assetPatterns = [
        /src="(\/(?:js|css|images|assets|fonts)\/[^"]+)"/g,
        /href="(\/(?:css|fonts)\/[^"]+)"/g,
        /url\((\/(?:images|fonts)\/[^)]+)\)/g,
      ];
      
      assetPatterns.forEach(pattern => {
        html = html.replace(pattern, (match, url) => {
          return match.replace(url, cdnConfig.baseUrl + url);
        });
      });
      
      data = html;
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}

// Helper to generate versioned asset URLs
export function assetUrl(path: string): string {
  if (!cdnConfig.enabled) {
    return path;
  }
  
  // Add version hash to URL for cache busting
  const version = process.env.APP_VERSION || 'dev';
  const separator = path.includes('?') ? '&' : '?';
  
  return `${cdnConfig.baseUrl}${path}${separator}v=${version}`;
}

// Middleware for image optimization hints
export function imageOptimization(req: Request, res: Response, next: NextFunction) {
  const filePath = req.path;
  
  if (filePath.match(/\.(jpg|jpeg|png|webp)$/i)) {
    // Add responsive image hints
    res.setHeader('Accept-CH', 'DPR, Width, Viewport-Width');
    res.setHeader('Vary', 'Accept, DPR, Width');
    
    // Enable image lazy loading hint
    res.setHeader('X-Image-Loading', 'lazy');
  }
  
  next();
}

// Compression settings for different content types
export function compressionSettings(req: Request, res: Response, next: NextFunction) {
  const contentType = res.getHeader('Content-Type')?.toString() || '';
  
  // Set compression hints based on content type
  if (contentType.includes('text/') || 
      contentType.includes('application/javascript') ||
      contentType.includes('application/json')) {
    res.setHeader('Content-Encoding', 'gzip');
  }
  
  // Brotli for modern browsers
  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (acceptEncoding.includes('br')) {
    res.setHeader('Content-Encoding', 'br');
  }
  
  next();
}

// Helper to purge CDN cache
export async function purgeCDNCache(paths: string[]): Promise<void> {
  if (!cdnConfig.enabled || !cdnConfig.baseUrl) {
    return;
  }
  
  // This would integrate with your CDN provider's API
  // Example for Cloudflare:
  if (process.env.CLOUDFLARE_ZONE_ID && process.env.CLOUDFLARE_API_TOKEN) {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: paths.map(path => cdnConfig.baseUrl + path),
        }),
      }
    );
    
    if (!response.ok) {
      console.error('Failed to purge CDN cache:', await response.text());
    }
  }
}

// Export all middleware
export const cdnMiddleware = {
  headers: cdnHeaders,
  rewrite: cdnRewrite,
  imageOptimization,
  compressionSettings,
};