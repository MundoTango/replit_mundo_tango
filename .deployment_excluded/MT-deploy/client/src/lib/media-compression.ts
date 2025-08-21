import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  initialQuality: number;
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

// Default compression settings
export const DEFAULT_IMAGE_COMPRESSION: CompressionOptions = {
  maxSizeMB: 10, // Target max size for images
  maxWidthOrHeight: 4000,
  useWebWorker: true,
  initialQuality: 0.8
};

export const DEFAULT_VIDEO_COMPRESSION: CompressionOptions = {
  maxSizeMB: 50, // Target max size for videos  
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.7
};

/**
 * Compress an image file using browser-image-compression
 */
export async function compressImage(
  file: File, 
  options: Partial<CompressionOptions> = {}
): Promise<CompressionResult> {
  const compressionOptions = { ...DEFAULT_IMAGE_COMPRESSION, ...options };
  
  console.log(`[Image Compression] Starting: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  
  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    
    const result: CompressionResult = {
      compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      compressionRatio: Math.round(((file.size - compressedFile.size) / file.size) * 100)
    };
    
    console.log(`[Image Compression] Complete: ${file.name}`);
    console.log(`  Original: ${(result.originalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Compressed: ${(result.compressedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Saved: ${result.compressionRatio}%`);
    
    return result;
  } catch (error) {
    console.error(`[Image Compression] Failed for ${file.name}:`, error);
    // Return original file if compression fails
    return {
      compressedFile: file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0
    };
  }
}

/**
 * Compress a video file using Canvas API and MediaRecorder
 * Note: This is a simplified approach. For production, consider using FFmpeg.wasm
 */
export async function compressVideo(
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<CompressionResult> {
  const compressionOptions = { ...DEFAULT_VIDEO_COMPRESSION, ...options };
  
  console.log(`[Video Compression] Starting: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  
  try {
    // For now, if video is already under target size, return as-is
    if (file.size <= compressionOptions.maxSizeMB * 1024 * 1024) {
      console.log(`[Video Compression] File already optimal: ${file.name}`);
      return {
        compressedFile: file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0
      };
    }
    
    // Create video element for processing
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    
    return new Promise((resolve) => {
      video.addEventListener('loadedmetadata', async () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Calculate new dimensions
          const { width, height } = calculateOptimalDimensions(
            video.videoWidth,
            video.videoHeight,
            compressionOptions.maxWidthOrHeight
          );
          
          canvas.width = width;
          canvas.height = height;
          
          // Setup MediaRecorder for compression
          const stream = canvas.captureStream(30); // 30 FPS
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 1000000 // 1 Mbps
          });
          
          const chunks: Blob[] = [];
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            const compressedBlob = new Blob(chunks, { type: 'video/webm' });
            const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.webm'), {
              type: 'video/webm'
            });
            
            const result: CompressionResult = {
              compressedFile,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatio: Math.round(((file.size - compressedFile.size) / file.size) * 100)
            };
            
            console.log(`[Video Compression] Complete: ${file.name}`);
            console.log(`  Original: ${(result.originalSize / 1024 / 1024).toFixed(2)}MB`);
            console.log(`  Compressed: ${(result.compressedSize / 1024 / 1024).toFixed(2)}MB`);
            console.log(`  Saved: ${result.compressionRatio}%`);
            
            URL.revokeObjectURL(video.src);
            resolve(result);
          };
          
          // Start recording and draw frames
          mediaRecorder.start();
          video.currentTime = 0;
          
          const drawFrame = () => {
            ctx.drawImage(video, 0, 0, width, height);
            if (video.currentTime < video.duration) {
              video.currentTime += 1/30; // Advance by frame
              requestAnimationFrame(drawFrame);
            } else {
              mediaRecorder.stop();
            }
          };
          
          video.addEventListener('seeked', drawFrame, { once: true });
          video.currentTime = 0;
          
        } catch (error) {
          console.error(`[Video Compression] Error processing ${file.name}:`, error);
          URL.revokeObjectURL(video.src);
          resolve({
            compressedFile: file,
            originalSize: file.size,
            compressedSize: file.size,
            compressionRatio: 0
          });
        }
      });
      
      video.addEventListener('error', (error) => {
        console.error(`[Video Compression] Video load error for ${file.name}:`, error);
        URL.revokeObjectURL(video.src);
        resolve({
          compressedFile: file,
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatio: 0
        });
      });
    });
    
  } catch (error) {
    console.error(`[Video Compression] Failed for ${file.name}:`, error);
    return {
      compressedFile: file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0
    };
  }
}

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxDimension: number
): { width: number; height: number } {
  if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
    return { width: originalWidth, height: originalHeight };
  }
  
  const aspectRatio = originalWidth / originalHeight;
  
  if (originalWidth > originalHeight) {
    return {
      width: maxDimension,
      height: Math.round(maxDimension / aspectRatio)
    };
  } else {
    return {
      width: Math.round(maxDimension * aspectRatio),
      height: maxDimension
    };
  }
}

/**
 * Batch compress multiple files
 */
export async function batchCompressFiles(
  files: File[],
  onProgress?: (processed: number, total: number, currentFile: string) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];
  
  console.log(`[Batch Compression] Starting ${files.length} files`);
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i, files.length, file.name);
    
    let result: CompressionResult;
    
    if (file.type.startsWith('image/')) {
      result = await compressImage(file);
    } else if (file.type.startsWith('video/')) {
      result = await compressVideo(file);
    } else {
      // Unsupported file type, return as-is
      result = {
        compressedFile: file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0
      };
    }
    
    results.push(result);
  }
  
  onProgress?.(files.length, files.length, 'Complete');
  console.log(`[Batch Compression] Completed ${files.length} files`);
  
  return results;
}