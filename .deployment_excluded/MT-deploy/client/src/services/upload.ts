// Upload service for media files
export interface UploadResponse {
  success: boolean;
  data?: {
    id: string;
    url: string;
    path: string;
    mediaAsset?: any;
  };
  error?: string;
}

export const uploadMedia = async (formData: FormData): Promise<UploadResponse> => {
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.code === 200) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        error: result.message || 'Upload failed'
      };
    }
  } catch (error) {
    console.error('Upload service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

export const deleteMedia = async (mediaId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`/api/media/${mediaId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const result = await response.json();
    
    if (result.code === 200) {
      return { success: true };
    } else {
      return { success: false, error: result.message || 'Delete failed' };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Delete failed' 
    };
  }
};

export const getMediaAsset = async (mediaId: string) => {
  try {
    const response = await fetch(`/api/media/${mediaId}`, {
      credentials: 'include'
    });

    const result = await response.json();
    
    if (result.code === 200) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.message };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch media' 
    };
  }
};

export const getUserMedia = async (userId: number, folder?: string, limit?: number) => {
  try {
    const params = new URLSearchParams();
    if (folder) params.append('folder', folder);
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(`/api/media/user/${userId}?${params}`, {
      credentials: 'include'
    });

    const result = await response.json();
    
    if (result.code === 200) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.message };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch user media' 
    };
  }
};