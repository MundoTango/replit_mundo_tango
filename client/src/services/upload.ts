import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UploadResponse {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Upload file to Supabase Storage from client
 */
export async function uploadFile(
  file: File,
  folder: string = 'general',
  userId?: number
): Promise<UploadResponse> {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 10MB' };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filePath = userId ? `${folder}/${userId}/${fileName}` : `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('media-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media-uploads')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    };

  } catch (error) {
    console.error('Client upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
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
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
}

/**
 * Get download URL for a file
 */
export function getFileUrl(filePath: string): string {
  const { data } = supabase.storage
    .from('media-uploads')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * List files in a folder
 */
export async function listFiles(folder: string = '', limit: number = 100) {
  try {
    const { data, error } = await supabase.storage
      .from('media-uploads')
      .list(folder, {
        limit,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, files: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'List failed'
    };
  }
}

export { supabase };