import { supabase } from '../supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Upload media file to Supabase Storage
 * @param file - File buffer or Uint8Array
 * @param originalName - Original filename
 * @param folder - Folder path (e.g., 'profile-images', 'posts', 'events')
 * @param userId - User ID for organization
 */
export async function uploadMedia(
  file: Buffer | Uint8Array,
  originalName: string,
  folder: string = 'general',
  userId?: number
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const fileExtension = originalName.split('.').pop();
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}.${fileExtension}`;
    const filePath = userId ? `${folder}/${userId}/${fileName}` : `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('media-uploads')
      .upload(filePath, file, {
        contentType: getContentType(originalName),
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media-uploads')
      .getPublicUrl(filePath);

    console.log('📁 File uploaded successfully:', filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
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