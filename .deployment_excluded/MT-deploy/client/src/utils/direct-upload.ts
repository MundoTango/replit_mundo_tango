/**
 * Direct-to-storage upload system
 * Bypasses server completely for large files - uploads directly to Supabase Storage
 * This is how YouTube, Vimeo, and all major platforms handle large videos
 */

import { supabase } from '@/lib/supabase-client';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface DirectUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class DirectUploadManager {
  private static instance: DirectUploadManager;
  
  private constructor() {}
  
  static getInstance(): DirectUploadManager {
    if (!this.instance) {
      this.instance = new DirectUploadManager();
    }
    return this.instance;
  }

  /**
   * Upload file directly to Supabase Storage
   * Completely bypasses our server - no memory issues!
   */
  async uploadDirect(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DirectUploadResult> {
    try {
      // Generate unique file path
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 11);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomId}.${fileExt}`;
      
      // Determine bucket and path based on file type
      const isVideo = file.type.startsWith('video/');
      const bucket = 'posts';
      const filePath = isVideo ? `videos/${fileName}` : `images/${fileName}`;
      
      console.log(`Uploading ${file.name} directly to storage (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      
      // Upload directly to Supabase Storage
      // This streams the file directly from browser to storage
      // Our server never touches the data!
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          // Track upload progress
          onUploadProgress: (progress: any) => {
            const percentage = (progress.loaded / progress.total) * 100;
            console.log(`Upload progress: ${percentage.toFixed(0)}%`);
            onProgress?.({
              loaded: progress.loaded,
              total: progress.total,
              percentage
            });
          }
        });
      
      if (error) {
        console.error('Upload error:', error);
        return { 
          success: false, 
          error: error.message 
        };
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      console.log(`Upload complete! File available at: ${publicUrl}`);
      
      return { 
        success: true, 
        url: publicUrl 
      };
      
    } catch (error: any) {
      console.error('Direct upload failed:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Create resumable upload session for very large files
   * Uses TUS protocol for resumable uploads
   */
  async createResumableUpload(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DirectUploadResult> {
    // For now, use regular direct upload
    // TUS implementation can be added later if needed
    return this.uploadDirect(file, onProgress);
  }

  /**
   * Upload multiple files in parallel
   */
  async uploadMultiple(
    files: File[],
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<DirectUploadResult[]> {
    const uploads = files.map((file, index) => 
      this.uploadDirect(file, (progress) => onProgress?.(index, progress))
    );
    
    return Promise.all(uploads);
  }
}

export const directUploadManager = DirectUploadManager.getInstance();