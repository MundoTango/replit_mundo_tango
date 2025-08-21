/**
 * ESA LIFE CEO 56x21 - Media Processing Service
 * Facebook/Instagram-inspired image and video compression
 * Uses Sharp for images and FFmpeg for videos
 */

import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import bytes from 'bytes';

const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);

// Configuration for different quality presets
const COMPRESSION_PRESETS = {
  thumbnail: {
    width: 150,
    height: 150,
    quality: 70,
    format: 'webp' as const
  },
  small: {
    width: 400,
    height: 400,
    quality: 75,
    format: 'webp' as const
  },
  medium: {
    width: 800,
    height: 800,
    quality: 80,
    format: 'webp' as const
  },
  large: {
    width: 1200,
    height: 1200,
    quality: 85,
    format: 'webp' as const
  },
  original: {
    width: 2000,
    height: 2000,
    quality: 90,
    format: 'webp' as const
  }
};

// Ultra-aggressive video compression (Instagram/TikTok style)
const VIDEO_PRESETS = {
  feed: {
    width: 720,  // Reduced from 1080 for faster processing
    videoBitrate: '600k',  // Ultra compressed from 2000k
    audioBitrate: '48k',  // Reduced audio quality
    fps: 20  // Reduced from 30 fps
  },
  story: {
    width: 480,  // Reduced from 720
    videoBitrate: '400k',  // Ultra compressed from 1500k
    audioBitrate: '32k',  // Lower audio
    fps: 15  // Lower FPS
  },
  thumbnail: {
    width: 360,  // Smaller thumbnail
    videoBitrate: '200k',  // Extreme compression
    audioBitrate: '32k',  // Minimal audio
    fps: 15  // Very low FPS
  }
};

export class MediaProcessor {
  private processingQueue: Map<string, any> = new Map();

  /**
   * Process image with Sharp - Facebook/Instagram style
   * Creates multiple sizes and formats for optimal loading
   */
  async processImage(inputPath: string, outputDir: string = 'uploads/processed'): Promise<{
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    original: string;
    metadata: any;
  }> {
    // Processing image
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = path.basename(inputPath, path.extname(inputPath));
    const timestamp = Date.now();
    const results: any = {};

    try {
      // Read original image stats
      const originalStats = await stat(inputPath);
      console.log(`📊 Original size: ${bytes(originalStats.size)}`);

      // Get image metadata
      const metadata = await sharp(inputPath).metadata();
      console.log(`📐 Original dimensions: ${metadata.width}x${metadata.height}`);

      // Process each preset in parallel for speed
      const processingPromises = Object.entries(COMPRESSION_PRESETS).map(async ([preset, settings]) => {
        const outputFilename = `${filename}-${timestamp}-${preset}.${settings.format}`;
        const outputPath = path.join(outputDir, outputFilename);

        // Don't upscale images
        const width = Math.min(settings.width, metadata.width || settings.width);
        const height = Math.min(settings.height, metadata.height || settings.height);

        await sharp(inputPath)
          .resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true,
            fastShrinkOnLoad: true // Facebook-style fast loading
          })
          .webp({ 
            quality: settings.quality,
            effort: 4, // Balance between speed and compression
            smartSubsample: true
          })
          .toFile(outputPath);

        const processedStats = await stat(outputPath);
        const compressionRatio = ((1 - processedStats.size / originalStats.size) * 100).toFixed(1);
        
        console.log(`✅ ${preset}: ${bytes(processedStats.size)} (-${compressionRatio}%)`);
        
        results[preset] = `/uploads/processed/${outputFilename}`;
      });

      await Promise.all(processingPromises);

      // Clean up original file to save space
      if (process.env.DELETE_ORIGINALS === 'true') {
        await unlink(inputPath);
        console.log('🗑️ Original file deleted');
      }

      return {
        ...results,
        metadata: {
          originalSize: originalStats.size,
          format: metadata.format,
          width: metadata.width,
          height: metadata.height,
          processingTime: Date.now() - timestamp
        }
      };

    } catch (error) {
      console.error('❌ Image processing error:', error);
      throw error;
    }
  }

  /**
   * Process video with FFmpeg - Instagram-style compression
   * Uses streaming to avoid memory issues with large files
   */
  async processVideo(inputPath: string, outputDir: string = 'uploads/processed'): Promise<{
    compressed: string;
    thumbnail: string;
    metadata: any;
  }> {
    // Processing video
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = path.basename(inputPath, path.extname(inputPath));
    const timestamp = Date.now();
    const outputFilename = `${filename}-${timestamp}-compressed.mp4`;
    const outputPath = path.join(outputDir, outputFilename);
    const thumbnailPath = path.join(outputDir, `${filename}-${timestamp}-thumb.jpg`);

    // Check file size for memory management
    const fileStats = await stat(inputPath);
    const fileSizeMB = fileStats.size / (1024 * 1024);
    console.log(`📊 Video size: ${fileSizeMB.toFixed(2)}MB`);

    // For very large files (>50MB), use lower quality preset
    const preset = fileSizeMB > 50 ? VIDEO_PRESETS.story : VIDEO_PRESETS.feed;

    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      // Get video metadata first
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          console.error('❌ FFprobe error:', err);
          return reject(err);
        }

        const originalSize = metadata.format.size || 0;
        console.log(`📊 Original video size: ${bytes(originalSize)}`);
        console.log(`⏱️ Duration: ${metadata.format.duration}s`);

        // Compress video with streaming to avoid memory issues
        const ffmpegCommand = ffmpeg(inputPath)
          .inputOptions([
            '-hwaccel auto' // Use hardware acceleration if available
          ])
          .videoCodec('libx264')
          .audioCodec('aac')
          .size(`${preset.width}x?`) // Maintain aspect ratio
          .videoBitrate(preset.videoBitrate)
          .audioBitrate(preset.audioBitrate)
          .fps(preset.fps)
          .outputOptions([
            '-preset ultrafast', // Much faster encoding for large files
            '-crf 28', // Lower quality for faster processing (28 vs 23)
            '-movflags +faststart', // Enable progressive download
            '-max_muxing_queue_size 9999', // Increase queue size for large files
            '-threads 0', // Use all available CPU threads
            '-avoid_negative_ts make_zero' // Fix timestamp issues
          ])
          .on('progress', (progress) => {
            // Only log every 10% to reduce console spam
            if (progress.percent && progress.percent % 10 < 1) {
              console.log(`⏳ Processing: ${Math.floor(progress.percent)}%`);
            }
          })
          // Add explicit stream handling
          .on('start', (commandLine) => {
            // FFmpeg started with optimized settings
            console.log('Command:', commandLine);
          })
          .on('end', async () => {
            try {
              const compressedStats = await stat(outputPath);
              const compressionRatio = ((1 - compressedStats.size / originalSize) * 100).toFixed(1);
              
              console.log(`✅ Video compressed: ${bytes(compressedStats.size)} (-${compressionRatio}%)`);
              console.log(`⏱️ Processing time: ${Date.now() - startTime}ms`);

              // Generate thumbnail with lower memory usage
              await this.generateVideoThumbnail(outputPath, thumbnailPath);

              // Clean up original to save space
              try {
                await unlink(inputPath);
                console.log('🗑️ Original video deleted to save memory');
              } catch (e) {
                // Ignore cleanup errors
              }

              resolve({
                compressed: `/uploads/processed/${outputFilename}`,
                thumbnail: `/uploads/processed/${path.basename(thumbnailPath)}`,
                metadata: {
                  originalSize,
                  compressedSize: compressedStats.size,
                  duration: metadata.format.duration,
                  processingTime: Date.now() - startTime,
                  compressionRatio
                }
              });
            } catch (error) {
              reject(error);
            }
          })
          .on('error', async (err) => {
            console.error('❌ FFmpeg error:', err);
            // Clean up failed files
            try {
              if (fs.existsSync(outputPath)) await unlink(outputPath);
              if (fs.existsSync(inputPath)) await unlink(inputPath);
            } catch (e) {
              // Ignore cleanup errors
            }
            reject(err);
          });

        // Save with streaming
        ffmpegCommand.save(outputPath);
      });
    });
  }

  /**
   * Generate video thumbnail with low memory usage
   */
  private generateVideoThumbnail(videoPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .inputOptions(['-ss 00:00:01']) // Seek to 1 second (faster than percentage)
        .outputOptions([
          '-vframes 1', // Only extract one frame
          '-an' // No audio needed
        ])
        .size('480x?')
        .on('end', () => {
          console.log('🖼️ Thumbnail generated');
          resolve();
        })
        .on('error', (err) => {
          console.warn('Thumbnail generation failed:', err);
          resolve(); // Don't fail the whole process if thumbnail fails
        })
        .save(outputPath);
    });
  }

  /**
   * Process media based on file type
   */
  async processMedia(filePath: string, mimeType: string): Promise<any> {
    if (mimeType.startsWith('image/')) {
      return this.processImage(filePath);
    } else if (mimeType.startsWith('video/')) {
      return this.processVideo(filePath);
    } else {
      throw new Error(`Unsupported media type: ${mimeType}`);
    }
  }

  /**
   * Batch process multiple files
   */
  async processBatch(files: Array<{ path: string; mimetype: string }>): Promise<any[]> {
    // Batch processing files
    
    const results = await Promise.all(
      files.map(file => this.processMedia(file.path, file.mimetype))
    );
    
    console.log('✅ Batch processing complete');
    return results;
  }
}

// Export singleton instance
export const mediaProcessor = new MediaProcessor();