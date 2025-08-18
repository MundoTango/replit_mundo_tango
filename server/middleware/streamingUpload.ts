/**
 * ESA LIFE CEO 56x21 - Streaming Upload Handler
 * Implements busboy for memory-efficient large file uploads
 * Prevents JavaScript heap out of memory errors
 */

import busboy, { FileInfo, FieldInfo } from 'busboy';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import bytes from 'bytes';

// ESA LIFE CEO 56x21 - 5MB limit per user request
const UPLOAD_CONFIG = {
  maxFileSize: bytes('5MB'), // ESA LIFE CEO 56x21 - 5MB cap for photos and videos
  maxFiles: 3, // Max 3 files at once
  allowedMimeTypes: /^(image\/(jpeg|jpg|png|gif|webp|bmp|svg\+xml|heic|heif)|video\/(mp4|quicktime|x-msvideo|webm|mov))$/i,
  uploadDir: 'uploads',
  chunkSize: 1024 * 1024, // 1MB chunks for progress tracking
  highWaterMark: 64 * 1024, // 64KB stream buffer - optimal for backpressure
};

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_CONFIG.uploadDir)) {
  fs.mkdirSync(UPLOAD_CONFIG.uploadDir, { recursive: true });
}

// Generate unique filename
const generateFilename = (originalName: string): string => {
  const ext = path.extname(originalName);
  const uniqueSuffix = `${Date.now()}-${randomBytes(16).toString('hex')}`;
  return `upload-${uniqueSuffix}${ext}`;
};

// Streaming upload handler
export const streamingUpload = (fieldName: string = 'media') => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if request contains multipart data
    if (!req.headers['content-type']?.includes('multipart/form-data')) {
      return next();
    }

    
    const uploadedFiles: any[] = [];
    const fields: any = {};
    let filesProcessed = 0;
    let hasError = false;
    const compressionPromises: Promise<void>[] = []; // ESA LIFE CEO 56x21 - Track compression tasks

    // Force garbage collection before processing large uploads
    if (global.gc) {
      global.gc();
    }

    // Initialize busboy with optimized settings for large files
    const bb = busboy({ 
      headers: req.headers,
      limits: {
        fileSize: UPLOAD_CONFIG.maxFileSize,
        files: UPLOAD_CONFIG.maxFiles,
        fields: 20, // Reduced field limit
        fieldSize: 512 * 1024, // 512KB max field size
        highWaterMark: UPLOAD_CONFIG.highWaterMark
      } as any // Fix type issue
    });

    // Handle file uploads
    bb.on('file', (name: string, file: NodeJS.ReadableStream, info: FileInfo) => {
      const { filename, encoding, mimeType } = info;
      
      console.log(`📁 Streaming file: ${filename}, type: ${mimeType}, field: ${name}`);

      // Validate mime type
      if (!UPLOAD_CONFIG.allowedMimeTypes.test(mimeType)) {
        console.error(`❌ Invalid file type: ${mimeType}`);
        file.resume(); // Discard file stream
        hasError = true;
        return;
      }

      const savedFilename = generateFilename(filename);
      const savePath = path.join(UPLOAD_CONFIG.uploadDir, savedFilename);
      
      // Create write stream with optimized buffer for large files
      const writeStream = fs.createWriteStream(savePath, {
        highWaterMark: UPLOAD_CONFIG.highWaterMark // Small buffer to prevent memory issues
      });
      let uploadedBytes = 0;
      let lastProgressReport = 0;
      let isPaused = false;

      // CRITICAL FIX: Use pipe for proper backpressure handling
      // This prevents memory explosion
      file.pipe(writeStream);
      
      // Track upload progress without interfering with stream
      file.on('data', (chunk: Buffer) => {
        uploadedBytes += chunk.length;
        
        // Report progress every MB
        if (uploadedBytes - lastProgressReport >= UPLOAD_CONFIG.chunkSize) {
          const progress = bytes(uploadedBytes);
          const memUsage = process.memoryUsage();
          console.log(`📊 Upload progress for ${filename}: ${progress} | Heap: ${bytes(memUsage.heapUsed)}`);
          lastProgressReport = uploadedBytes;
          
          // Force GC on very large files to prevent memory buildup
          if (uploadedBytes > 100 * 1024 * 1024 && global.gc) { // Every 100MB
            global.gc();
            console.log('🧹 Mid-upload memory cleanup');
          }
        }
      });

      // Handle file size limit
      file.on('limit', () => {
        console.error(`❌ File size limit exceeded for ${filename}`);
        hasError = true;
        // Delete partial file
        fs.unlink(savePath, (err) => {
          if (err) console.error('Failed to delete partial file:', err);
        });
      });

      // Stream complete
      file.on('close', () => {
        if (!hasError) {
          console.log(`✅ File streamed successfully: ${savedFilename} (${bytes(uploadedBytes)})`);
          
          // ESA LIFE CEO 56x21 - Videos under 5MB don't need compression
          if (mimeType.startsWith('video/') && uploadedBytes > 5 * 1024 * 1024) {
            const compressionPromise = (async () => {
              console.log(`🎬 ESA LIFE CEO 56x21: Compressing ${filename} (${(uploadedBytes / 1024 / 1024).toFixed(1)}MB)`);
              
              let finalPath = savePath;
              let finalSize = uploadedBytes;
              
              try {
                const { VideoCompressor } = await import('../services/videoCompressor');
                const compressedPath = savePath + '_compressed.mp4';
                await VideoCompressor.compressVideo(savePath, compressedPath);
                
                // Get compressed file size
                const stats = fs.statSync(compressedPath);
                finalPath = compressedPath;
                finalSize = stats.size;
                
                console.log(`✅ Compressed: ${(uploadedBytes / 1024 / 1024).toFixed(1)}MB → ${(finalSize / 1024 / 1024).toFixed(1)}MB`);
              } catch (error) {
                console.error('❌ Compression failed, using original:', error);
              }
              
              uploadedFiles.push({
                fieldname: name,
                originalname: filename,
                encoding,
                mimetype: mimeType,
                filename: savedFilename,
                path: finalPath,
                size: finalSize,
              });
            })();
            
            compressionPromises.push(compressionPromise);
          } else {
            // Non-video or small file - add immediately
            uploadedFiles.push({
              fieldname: name,
              originalname: filename,
              encoding,
              mimetype: mimeType,
              filename: savedFilename,
              path: savePath,
              size: uploadedBytes,
            });
          }
        }
      });

      // Handle stream errors
      file.on('error', (err: Error) => {
        console.error(`❌ Stream error for ${filename}:`, err);
        hasError = true;
        // Clean up partial file
        fs.unlink(savePath, (unlinkErr) => {
          if (unlinkErr) console.error('Failed to delete partial file:', unlinkErr);
        });
      });

      writeStream.on('error', (err: Error) => {
        console.error(`❌ Write stream error for ${filename}:`, err);
        hasError = true;
        file.resume(); // Drain the file stream
      });

      // Stream is properly piped above with automatic backpressure handling
      
      filesProcessed++;
    });

    // Handle regular form fields
    bb.on('field', (name: string, value: string, info: FieldInfo) => {
      console.log(`📝 Field: ${name} = ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
      fields[name] = value;
    });

    // Handle errors
    bb.on('error', (err: Error) => {
      console.error('❌ Busboy error:', err);
      hasError = true;
      res.status(400).json({ 
        error: 'Upload failed',
        message: err.message 
      });
    });

    // Upload complete
    bb.on('close', async () => {
      console.log(`🎉 Upload complete. Files: ${filesProcessed}, Error: ${hasError}`);
      
      if (hasError && !res.headersSent) {
        return res.status(400).json({ 
          error: 'Upload failed',
          message: 'One or more files failed to upload'
        });
      }

      // ESA LIFE CEO 56x21 - Wait for all compressions to complete
      if (compressionPromises.length > 0) {
        console.log(`⏳ ESA LIFE CEO 56x21: Waiting for ${compressionPromises.length} compression(s)...`);
        await Promise.all(compressionPromises);
        console.log(`✅ All compressions complete!`);
      }

      // Attach files and fields to request
      (req as any).files = uploadedFiles;
      (req as any).body = { ...fields, ...req.body };
      
      // Calculate total uploaded size
      const totalSize = uploadedFiles.reduce((sum, f) => sum + (f.size || 0), 0);
      console.log(`📊 Total uploaded: ${bytes(totalSize)}`);
      
      // Clean up memory after large uploads
      if ((totalSize > 20 * 1024 * 1024 || filesProcessed > 2) && global.gc) {
        global.gc();
      }

      // Add small delay for very large uploads to let memory settle
      if (totalSize > 100 * 1024 * 1024) {
        console.log('⏳ Large upload detected, allowing memory to settle...');
        setTimeout(() => next(), 100);
      } else {
        next();
      }
    });

    // Handle request abort
    req.on('aborted', () => {
      console.warn('⚠️ Request aborted by client');
      bb.destroy();
      // Clean up any partial files
      uploadedFiles.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Failed to clean up file:', err);
        });
      });
    });

    // Pipe request to busboy
    req.pipe(bb);
  };
};

// Helper to clean up uploaded files (for error handling)
export const cleanupUploadedFiles = (files: any[]) => {
  files.forEach(file => {
    if (file.path) {
      fs.unlink(file.path, (err) => {
        if (err) console.error(`Failed to delete file ${file.path}:`, err);
        else console.log(`🗑️ Cleaned up file: ${file.path}`);
      });
    }
  });
};

// Export configuration for other modules
export { UPLOAD_CONFIG };