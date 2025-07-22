// Life CEO: CDN and Static Asset Configuration
import { Router } from 'express';
import { cacheControl } from '../middleware/cache-control.js';

// CDN configuration for static assets
export const configureCDN = (app: any) => {
  // Static asset caching headers
  const staticOptions = {
    maxAge: '1y',
    immutable: true,
    etag: true,
    lastModified: true,
  };

  // Image optimization middleware
  app.use('/images', cacheControl('1y'), (req: any, res: any, next: any) => {
    // Add responsive image headers
    res.set({
      'Accept-CH': 'DPR, Width, Viewport-Width',
      'Vary': 'Accept-Encoding, Accept, DPR, Width',
    });
    next();
  });

  // Font caching
  app.use('/fonts', cacheControl('1y'), (req: any, res: any, next: any) => {
    res.set({
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    });
    next();
  });

  // JavaScript and CSS caching
  app.use(['/js', '/css'], cacheControl('1y'), (req: any, res: any, next: any) => {
    res.set({
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    next();
  });

  console.log('🌐 Life CEO: CDN configuration applied');
};

// Edge location configuration
export const edgeLocations = {
  'us-east': { region: 'US East', latency: 10 },
  'us-west': { region: 'US West', latency: 15 },
  'eu-west': { region: 'EU West', latency: 20 },
  'eu-central': { region: 'EU Central', latency: 25 },
  'asia-pacific': { region: 'Asia Pacific', latency: 30 },
  'south-america': { region: 'South America', latency: 5 }, // Buenos Aires optimized
};

// Asset optimization configuration
export const assetOptimization = {
  images: {
    formats: ['webp', 'avif', 'jpg'],
    sizes: [320, 640, 768, 1024, 1366, 1920],
    quality: {
      webp: 85,
      avif: 80,
      jpg: 85,
    },
  },
  css: {
    minify: true,
    criticalInline: true,
    purgeCss: true,
  },
  js: {
    minify: true,
    treeShake: true,
    splitChunks: true,
    lazyLoad: true,
  },
};

// CDN purge helper
export const purgeCDNCache = async (paths: string[] = ['/*']) => {
  console.log(`🗑️ Life CEO: Purging CDN cache for paths:`, paths);
  
  // In production, this would call your CDN API
  // Example for Cloudflare:
  // await fetch('https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ files: paths }),
  // });
  
  return { success: true, purged: paths };
};

// Preload critical resources
export const criticalResources = [
  '/css/main.css',
  '/js/app.js',
  '/fonts/inter-var.woff2',
];

// Generate preload links
export const generatePreloadLinks = () => {
  return criticalResources.map(resource => {
    const type = resource.endsWith('.css') ? 'style' :
                 resource.endsWith('.js') ? 'script' :
                 resource.endsWith('.woff2') ? 'font' : 'fetch';
    
    return `<link rel="preload" href="${resource}" as="${type}" ${type === 'font' ? 'crossorigin' : ''}>`;
  }).join('\n');
};