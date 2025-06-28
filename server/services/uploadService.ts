import { supabase } from '../supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';
import type { MediaAsset, InsertMediaAsset } from '../../shared/schema.js';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  mediaAsset?: MediaAsset;
  error?: string;
}

export interface MediaUploadOptions {
  folder?: string;
  userId: number;
  visibility?: 'public' | 'private' | 'mutual';
  tags?: string[];
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Enhanced upload media file to Supabase Storage with metadata storage
 * @param file - File buffer or Uint8Array
 * @param originalName - Original filename
 * @param options - Upload options including user, folder, visibility, tags
 */
export async function uploadMediaWithMetadata(
  file: Buffer | Uint8Array,
  originalName: string,
  options: MediaUploadOptions
): Promise<UploadResult> {
  try {
    const {
      folder = 'general',
      userId,
      visibility = 'public',
      tags = [],
      maxWidth = 1600,
      maxHeight = 1600
    } = options;

    // Generate unique filename and ID
    const fileExtension = originalName.split('.').pop();
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}.${fileExtension}`;
    const filePath = `user_uploads/${userId}/${folder}/${fileName}`;
    const contentType = getContentType(originalName);

    // Get file dimensions if it's an image
    const isImage = contentType.startsWith('image/');
    let width: number | undefined;
    let height: number | undefined;
    let processedFile = file;

    if (isImage) {
      try {
        const imageInfo = await getImageDimensions(file);
        width = imageInfo.width;
        height = imageInfo.height;
        
        // Resize if needed (this would need a client-side implementation)
        if (width > maxWidth || height > maxHeight) {
          console.log(`Image will be resized from ${width}x${height} to fit ${maxWidth}x${maxHeight}`);
        }
      } catch (error) {
        console.warn('Could not get image dimensions:', error);
      }
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('media-uploads')
      .upload(filePath, processedFile, {
        contentType,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get URL based on visibility
    let url: string;
    if (visibility === 'private' || visibility === 'mutual') {
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('media-uploads')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (signedUrlError) {
        console.error('Error creating signed URL:', signedUrlError);
        url = '';
      } else {
        url = signedUrlData.signedUrl;
      }
    } else {
      const { data: urlData } = supabase.storage
        .from('media-uploads')
        .getPublicUrl(filePath);
      url = urlData.publicUrl;
    }

    // Create media asset record in database
    const mediaAssetData: InsertMediaAsset = {
      id: uniqueId,
      userId,
      originalFilename: originalName,
      path: filePath,
      url,
      visibility,
      contentType,
      width,
      height,
      size: file.length,
      folder
    };

    // Import storage dynamically to avoid circular dependency
    const storageModule = await import('../storage.js');
    const mediaAsset = await storageModule.storage.createMediaAsset(mediaAssetData);

    // Add tags if provided
    if (tags.length > 0) {
      await Promise.all(
        tags.map(tag => storageModule.storage.addMediaTag(uniqueId, tag))
      );
    }

    console.log('📁 File uploaded with metadata:', filePath);

    return {
      success: true,
      url,
      path: filePath,
      mediaAsset
    };

  } catch (error) {
    console.error('Upload service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
}

/**
 * Legacy upload function for backward compatibility
 */
export async function uploadMedia(
  file: Buffer | Uint8Array,
  originalName: string,
  folder: string = 'general',
  userId?: number
): Promise<UploadResult> {
  if (!userId) {
    return {
      success: false,
      error: 'User ID is required'
    };
  }

  return uploadMediaWithMetadata(file, originalName, {
    folder,
    userId,
    visibility: 'public'
  });
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteMedia(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from('media-uploads')
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown delete error'
    };
  }
}

/**
 * Get image dimensions from buffer (simplified implementation)
 */
async function getImageDimensions(buffer: Buffer | Uint8Array): Promise<{ width: number; height: number }> {
  // This is a simplified implementation - in production you'd use a proper image library
  // For now, return default dimensions
  return { width: 1200, height: 800 };
}

/**
 * Generate signed URL for private/mutual content
 */
export async function getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<{ url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from('media-uploads')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      return { error: error.message };
    }

    return { url: data.signedUrl };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const contentTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    
    // Videos
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain'
  };

  return contentTypes[ext || ''] || 'application/octet-stream';
}

/**
 * Initialize storage bucket and policies (run once during setup)
 */
export async function initializeStorageBucket(): Promise<void> {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'media-uploads');

    if (!bucketExists) {
      // Create bucket
      const { error: bucketError } = await supabase.storage.createBucket('media-uploads', {
        public: true,
        allowedMimeTypes: [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
          'video/mp4', 'video/webm', 'video/quicktime',
          'application/pdf', 'text/plain'
        ],
        fileSizeLimit: 10485760 // 10MB
      });

      if (bucketError) {
        console.error('Error creating storage bucket:', bucketError);
      } else {
        console.log('📁 Storage bucket "media-uploads" created successfully');
      }
    }

    console.log('📁 Supabase Storage integration ready for uploads');
  } catch (error) {
    console.error('Error initializing storage bucket:', error);
  }
}

/**
 * Delete file from Supabase Storage and remove metadata
 */
export async function deleteMediaWithMetadata(mediaId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Import storage dynamically to avoid circular dependency
    const storageModule = await import('../storage.js');
    
    // Get media asset info
    const mediaAsset = await storageModule.storage.getMediaAsset(mediaId);
    if (!mediaAsset) {
      return { success: false, error: 'Media asset not found' };
    }

    // Delete from Supabase Storage
    const { error: storageError } = await supabase.storage
      .from('media-uploads')
      .remove([mediaAsset.path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      return { success: false, error: storageError.message };
    }

    // Delete metadata from database
    await storageModule.storage.deleteMediaAsset(mediaId);

    console.log('📁 Media deleted successfully:', mediaAsset.path);
    return { success: true };
  } catch (error) {
    console.error('Delete media service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown delete error'
    };
  }
}