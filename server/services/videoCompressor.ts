/**
 * ESA LIFE CEO 56x21 - Server-side video compression service
 * Handles 500MB+ videos by streaming to disk and compressing with FFmpeg
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export class VideoCompressor {
  /**
   * Compress video to manageable size using FFmpeg
   * Target: 443MB -> ~20-30MB
   */
  static async compressVideo(inputPath: string, outputPath: string): Promise<void> {
    console.log(`🎬 ESA LIFE CEO 56x21: Compressing video from ${inputPath}`);
    
    try {
      // Check if FFmpeg is available
      await execAsync('which ffmpeg');
    } catch (error) {
      console.error('❌ FFmpeg not installed, using fallback compression');
      // Fallback: just copy the file (no compression)
      await fs.promises.copyFile(inputPath, outputPath);
      return;
    }

    // FFmpeg compression command
    // -i: input file
    // -c:v libx264: use H.264 codec
    // -preset fast: balance speed/compression
    // -crf 28: quality (lower = better, 23 default, 28 = smaller)
    // -vf scale=1280:-2: scale to 720p width, maintain aspect
    // -c:a aac: audio codec
    // -b:a 128k: audio bitrate
    // -movflags +faststart: optimize for streaming
    const command = `ffmpeg -i "${inputPath}" \
      -c:v libx264 \
      -preset fast \
      -crf 28 \
      -vf "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease" \
      -c:a aac \
      -b:a 128k \
      -movflags +faststart \
      -y "${outputPath}"`;

    console.log('🔧 Compression command:', command);
    
    try {
      const startTime = Date.now();
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer for FFmpeg output
      });
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      const inputSize = (await fs.promises.stat(inputPath)).size;
      const outputSize = (await fs.promises.stat(outputPath)).size;
      const compressionRatio = ((1 - outputSize / inputSize) * 100).toFixed(1);
      
      console.log(`✅ Video compressed in ${duration}s`);
      console.log(`📊 Size: ${(inputSize / 1024 / 1024).toFixed(1)}MB → ${(outputSize / 1024 / 1024).toFixed(1)}MB`);
      console.log(`🗜️ Compression: ${compressionRatio}% reduction`);
      
      // Clean up original file
      await fs.promises.unlink(inputPath);
    } catch (error: any) {
      console.error('❌ FFmpeg compression failed:', error.message);
      // Fallback: use original file
      await fs.promises.rename(inputPath, outputPath);
    }
  }

  /**
   * Get video metadata using FFprobe
   */
  static async getVideoInfo(videoPath: string): Promise<any> {
    try {
      const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`;
      const { stdout } = await execAsync(command);
      return JSON.parse(stdout);
    } catch (error) {
      console.error('Failed to get video info:', error);
      return null;
    }
  }
}