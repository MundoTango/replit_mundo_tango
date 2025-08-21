/**
 * ESA LIFE CEO 56x21 - Client-side Media Compression
 * Facebook/Instagram-style browser compression before upload
 * Reduces upload time and server processing
 */

import imageCompression from 'browser-image-compression';

/**
 * Compress image before upload - Facebook/Instagram approach
 * Reduces file size by 60-80% while maintaining quality
 */
export async function compressImage(file: File): Promise<File> {
  const sizeMB = file.size / 1024 / 1024;
  // Compressing file
  
  // Ultra-aggressive compression like Instagram
  const options = {
    maxSizeMB: sizeMB > 10 ? 0.5 : 0.8, // Ultra compress large images
    maxWidthOrHeight: 1080, // Instagram max resolution
    useWebWorker: true, // Don't block UI thread
    fileType: file.type === 'image/png' ? 'image/jpeg' : file.type as any, // Convert PNG to JPEG
    initialQuality: sizeMB > 5 ? 0.7 : 0.8, // Lower quality for large files
    alwaysKeepResolution: false // Allow aggressive downsizing
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    const compressionRatio = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
    console.log(`✅ Compressed to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB (-${compressionRatio}%)`);
    return compressedFile;
  } catch (error) {
    console.error('❌ Compression failed:', error);
    return file; // Return original if compression fails
  }
}

/**
 * ESA LIFE CEO 56x21 - Compress video using browser's built-in capabilities
 * Reduces 443MB videos to manageable sizes
 */
export async function compressVideo(file: File): Promise<File> {
  const sizeMB = file.size / 1024 / 1024;
  console.log(`🎥 Compressing video: ${sizeMB.toFixed(2)}MB`);
  
  // If video is already small, skip compression
  if (sizeMB < 50) {
    console.log('✅ Video already optimized');
    return file;
  }
  
  try {
    // Create video element to load the video
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Use MediaRecorder API for compression
    const stream = canvas.captureStream(30); // 30 fps
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 1000000 // 1 Mbps (will reduce 443MB to ~20MB for 2min video)
    });
    
    const chunks: Blob[] = [];
    
    return new Promise((resolve) => {
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webm'), {
          type: 'video/webm'
        });
        const compressionRatio = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
        console.log(`✅ Video compressed to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB (-${compressionRatio}%)`);
        resolve(compressedFile);
      };
      
      // Load and play video to record compressed version
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        canvas.width = Math.min(video.videoWidth, 1280); // Max 720p
        canvas.height = Math.min(video.videoHeight, 720);
        video.play();
        mediaRecorder.start();
        
        // Draw frames to canvas
        const drawFrame = () => {
          if (!video.ended && ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(drawFrame);
          } else {
            mediaRecorder.stop();
          }
        };
        drawFrame();
      };
    });
  } catch (error) {
    console.error('❌ Video compression failed, using original:', error);
    return file; // Return original if compression fails
  }
}

/**
 * Compress multiple files in parallel
 */
export async function compressMediaFiles(files: File[]): Promise<File[]> {
  // ESA LIFE CEO 56x21: Compress BOTH images and videos
  
  const compressionPromises = files.map(async (file) => {
    if (file.type.startsWith('image/')) {
      return compressImage(file);
    } else if (file.type.startsWith('video/')) {
      // NEW: Compress videos too!
      return compressVideo(file);
    }
    return file;
  });
  
  return Promise.all(compressionPromises);
}

import { chunkedUpload } from './chunkedUpload';

/**
 * Fast upload with compression and chunked transfer
 * Facebook/Instagram-style implementation
 */
export async function fastUpload(
  files: File[],
  postData: any,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    // Starting optimized upload
    console.log(`📊 Files to upload: ${files.length}, Total size: ${(files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)}MB`);
    
    // Phase 1: Compress files CLIENT-SIDE FIRST (0-30% progress)
    if (onProgress) onProgress(5);
    const compressedFiles = await compressMediaFiles(files);
    const compressedSize = compressedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024;
    console.log(`✨ Compressed to: ${compressedSize.toFixed(2)}MB`);
    if (onProgress) onProgress(30);
    
    // Phase 2: Skip chunked upload, go direct for compressed files (30-90% progress)
    // ESA LIFE CEO 56x21: Compressed files are already small enough
    if (onProgress) onProgress(40);
    let currentProgress = 40;
    const progressPerFile = 50 / compressedFiles.length;
    
    // Skip intermediate uploads - send everything in one efficient request
    // This prevents the 100% progress but no post issue
    console.log('📤 Uploading compressed media directly with post creation...');
    
    // Phase 3: Create post with uploaded files (90-100% progress)
    if (onProgress) onProgress(90);
    
    // ESA LIFE CEO 56x21 FIX: Use the actual /api/posts endpoint that exists
    const formData = new FormData();
    formData.append('content', postData.content || '');
    formData.append('isPublic', String(postData.isPublic !== false));
    if (postData.location) formData.append('location', postData.location);
    
    // Add media file references
    compressedFiles.forEach((file, index) => {
      formData.append(`media`, file);
    });
    
    console.log('📮 Creating post with media...');
    const response = await fetch('/api/posts', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Post creation failed:', error);
      throw new Error(`Failed to create post: ${error}`);
    }
    
    const result = await response.json();
    if (onProgress) onProgress(100);
    
    // Post created successfully
    return { success: true, ...result };
    
  } catch (error: any) {
    console.error('❌ Fast upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
}

/**
 * Poll for upload status
 */
export async function checkUploadStatus(jobId: string): Promise<any> {
  try {
    const response = await fetch(`/api/upload/status/${jobId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to get status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Status check error:', error);
    return null;
  }
}

/**
 * Wait for upload completion with polling
 */
export async function waitForUpload(
  jobId: string,
  onProgress?: (status: any) => void,
  maxWaitTime: number = 30000
): Promise<any> {
  const startTime = Date.now();
  const pollInterval = 500; // Check every 500ms
  
  while (Date.now() - startTime < maxWaitTime) {
    const status = await checkUploadStatus(jobId);
    
    if (status) {
      if (onProgress) onProgress(status);
      
      if (status.status === 'completed') {
        return status.result;
      } else if (status.status === 'failed') {
        throw new Error(status.error || 'Upload processing failed');
      }
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  throw new Error('Upload timeout - processing taking too long');
}