/**
 * Dedicated Upload Routes
 * Lightweight, memory-efficient upload handling
 * Optimized to prevent heap memory crashes
 */

import { Router } from 'express';
import busboy from 'busboy';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { storage } from '../storage';
import { getUserId } from '../utils/authHelper';

const router = Router();

// Configure Sharp for aggressive memory management
sharp.cache(false);
sharp.concurrency(1);
sharp.simd(false); // Disable SIMD for lower memory usage

/**
 * ESA LIFE CEO 56x21 - Ultra-optimized post creation with media
 * Processes everything in a single stream without loading files into memory
 */
router.post('/api/posts', async (req: any, res) => {
  console.log('🚀 Creating post with optimized upload');
  
  const userId = await getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const bb = busboy({
    headers: req.headers,
    limits: {
      fileSize: 500 * 1024 * 1024, // 500MB max (reduced to prevent memory crashes)
      files: 3, // Reduced to 3 files max
      fields: 10,
      fieldSize: 10 * 1024 // 10KB max for field values
    },
    defParamCharset: 'utf8',
    preservePath: false
  });

  const fields: any = {};
  const mediaUrls: string[] = [];
  let filesProcessed = 0;
  let errorOccurred = false;
  const filePromises: Promise<void>[] = [];

  bb.on('field', (name: string, value: string) => {
    fields[name] = value;
    console.log(`📝 Field: ${name} = ${value}`);
  });

  bb.on('file', (name: string, file: NodeJS.ReadableStream, info: any) => {
    const { filename, mimeType } = info;
    console.log(`📦 Processing file: ${filename} (${mimeType})`);
    
    const uploadDir = path.join('uploads', 'posts', String(userId));
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ESA LIFE CEO 56x21 - Remove spaces from filename to prevent URL issues
    const sanitizedFilename = filename.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${sanitizedFilename}`;
    const filePath = path.join(uploadDir, uniqueName);

    // Create a promise for this file processing
    const filePromise = (async () => {
      try {
        if (mimeType.startsWith('image/')) {
          // Memory-efficient image processing
          const transformer = sharp()
            .resize(1080, 1080, { 
              fit: 'inside',
              withoutEnlargement: true 
            })
            .jpeg({ 
              quality: 75, // Slightly lower quality for faster processing
              progressive: true,
              mozjpeg: true 
            })
            .withMetadata(); // Keep metadata

          // Stream directly to disk with cleanup
          await new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(filePath);
            const pipeline = file.pipe(transformer).pipe(writeStream);
            
            pipeline.on('finish', () => {
              writeStream.end();
              resolve(undefined);
            });
            
            pipeline.on('error', (err) => {
              writeStream.destroy();
              file.resume();
              reject(err);
            });
          });

          const mediaUrl = `/uploads/posts/${userId}/${uniqueName}`;
          mediaUrls.push(mediaUrl);
          // Image saved successfully
        } else if (mimeType.startsWith('video/')) {
          // ESA LIFE CEO 56x21 - Ultra-optimized video streaming
          await new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(filePath, {
              highWaterMark: 64 * 1024 // 64KB chunks for minimal memory
            });
            let bytesWritten = 0;
            
            // Use backpressure-aware streaming
            file.pipe(writeStream, { end: true });
            
            file.on('data', (chunk) => {
              bytesWritten += chunk.length;
              
              // Log progress every 10MB
              if (bytesWritten % (10 * 1024 * 1024) === 0) {
                console.log(`📹 Video progress: ${Math.round(bytesWritten / 1024 / 1024)}MB`);
                
                // Force GC every 50MB for large uploads
                if (global.gc && bytesWritten % (50 * 1024 * 1024) === 0) {
                  console.log('♻️ Forcing garbage collection');
                  global.gc();
                }
              }
            });
            
            writeStream.on('finish', () => {
              console.log(`✅ Video saved: ${Math.round(bytesWritten / 1024 / 1024)}MB total`);
              resolve(undefined);
            });
            
            writeStream.on('error', (err) => {
              console.error('❌ Write stream error:', err);
              file.resume();
              reject(err);
            });
            
            file.on('error', (err) => {
              console.error('❌ File stream error:', err);
              writeStream.destroy();
              reject(err);
            });
          });

          const mediaUrl = `/uploads/posts/${userId}/${uniqueName}`;
          mediaUrls.push(mediaUrl);
          // Video saved successfully
        } else {
          // Handle other file types (including video/mp4 without mime type)
          const isVideo = filename.toLowerCase().endsWith('.mp4') || 
                         filename.toLowerCase().endsWith('.mov') || 
                         filename.toLowerCase().endsWith('.avi');
          
          if (isVideo || mimeType === 'application/octet-stream') {
            // Treat as video
            await new Promise((resolve, reject) => {
              const writeStream = fs.createWriteStream(filePath);
              file.pipe(writeStream)
                .on('finish', () => {
                  writeStream.end();
                  resolve(undefined);
                })
                .on('error', (err) => {
                  writeStream.destroy();
                  file.resume();
                  reject(err);
                });
            });
            
            const mediaUrl = `/uploads/posts/${userId}/${uniqueName}`;
            mediaUrls.push(mediaUrl);
            console.log(`✅ Media saved: ${uniqueName} -> URL: ${mediaUrl}`);
          } else {
            // Skip truly unsupported files
            file.resume();
            console.log(`⚠️ Skipping unsupported file type: ${mimeType}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing ${filename}:`, error);
        file.resume();
        errorOccurred = true;
      }
    })();

    filePromises.push(filePromise);
    filesProcessed++;
  });

  bb.on('close', async () => {
    // Wait for all files to be processed
    await Promise.all(filePromises);
    
    if (errorOccurred) {
      return res.status(500).json({ error: 'Failed to process media files' });
    }

    try {
      console.log('💾 Creating post in database...');
      console.log(`📸 Media URLs collected: ${mediaUrls.length} files`);
      
      // Create the post with media URLs
      // ESA LIFE CEO 56x21 - Fix media URL paths
      // Ensure URLs are properly formatted for client access
      const formattedMediaUrls = mediaUrls.map(url => {
        // Remove any leading slashes for consistent formatting
        return url.startsWith('/') ? url : `/${url}`;
      });
      
      // ESA LIFE CEO 56x21 - Store all media URLs properly
      const postData = {
        userId,
        content: fields.content || '',
        imageUrl: formattedMediaUrls[0] || null, // First media URL as main image
        videoUrl: formattedMediaUrls.find(url => 
          url.toLowerCase().endsWith('.mp4') || 
          url.toLowerCase().endsWith('.mov') ||
          url.toLowerCase().endsWith('.webm') ||
          url.toLowerCase().endsWith('.avi')
        ) || null, // Find first video URL if any
        mediaEmbeds: formattedMediaUrls, // Store ALL media URLs in mediaEmbeds field
        visibility: fields.isPublic === 'true' ? 'public' : 'private',
        location: fields.location || null,
        postType: formattedMediaUrls.length > 0 ? 'media' : 'text'
      } as any;

      const post = await storage.createPost(postData);
      
      // ESA LIFE CEO 56x21 - Trigger city auto-creation from post location
      if (fields.location) {
        try {
          const { CityAutoCreationService } = await import('../services/cityAutoCreationService');
          const locationParts = fields.location.split(',').map((s: string) => s.trim());
          
          if (locationParts.length >= 2) {
            const city = locationParts[0];
            const country = locationParts[locationParts.length - 1];
            
            console.log(`🌍 ESA LIFE CEO 56x21 - Auto-creating city group for: ${city}, ${country}`);
            await CityAutoCreationService.handleLocation(city, country, userId);
          }
        } catch (cityError) {
          console.error('❌ City auto-creation failed:', cityError);
          // Continue even if city creation fails
        }
      }
      
      // ESA LIFE CEO 56x21 - Add properly formatted media URLs to the created post
      const postWithMedia = {
        ...post,
        imageUrl: formattedMediaUrls[0] || post.imageUrl,
        mediaUrls: formattedMediaUrls.length > 0 ? formattedMediaUrls : undefined
      };
      
      // Post created with media
      res.json({
        success: true,
        post: postWithMedia
      });
    } catch (error: any) {
      console.error('❌ Database error:', error);
      
      // Clean up uploaded files on error
      mediaUrls.forEach(url => {
        const filePath = path.join('uploads', url.replace('/uploads/', ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      
      res.status(500).json({ 
        error: 'Failed to create post',
        details: error.message 
      });
    }
  });

  bb.on('error', (err: Error) => {
    console.error('❌ Busboy error:', err);
    errorOccurred = true;
    res.status(400).json({ error: 'Invalid upload data' });
  });

  req.pipe(bb);
});

/**
 * Quick health check for upload service
 */
router.get('/api/upload/health', (req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    status: 'healthy',
    memory: {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
    },
    timestamp: new Date().toISOString()
  });
});

export default router;