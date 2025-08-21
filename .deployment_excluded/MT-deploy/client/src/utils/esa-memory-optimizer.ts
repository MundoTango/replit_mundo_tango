/**
 * ESA LIFE CEO 56x21 - Memory Optimizer for Large File Uploads
 * Prevents browser memory crashes during 456MB+ video uploads
 */

export class ESAMemoryOptimizer {
  private static instance: ESAMemoryOptimizer;
  private uploadQueue: Map<string, AbortController> = new Map();
  
  static getInstance(): ESAMemoryOptimizer {
    if (!this.instance) {
      this.instance = new ESAMemoryOptimizer();
    }
    return this.instance;
  }

  /**
   * Upload large file with chunking and memory management
   */
  async uploadLargeFile(
    file: File, 
    onProgress?: (percent: number) => void
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const abortController = new AbortController();
    
    this.uploadQueue.set(uploadId, abortController);
    
    try {
      console.log(`Starting chunked upload for ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploadedChunks = 0;
      let finalUrl = '';
      
      for (let i = 0; i < totalChunks; i++) {
        if (abortController.signal.aborted) {
          throw new Error('Upload cancelled');
        }
        
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('uploadId', uploadId);
        formData.append('chunkIndex', String(i));
        formData.append('totalChunks', String(totalChunks));
        formData.append('filename', file.name);
        formData.append('fileSize', String(file.size));
        
        const response = await fetch('/api/upload/chunk', {
          method: 'POST',
          body: formData,
          credentials: 'include',
          signal: abortController.signal
        });
        
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Chunk ${i + 1}/${totalChunks} failed: ${error}`);
        }
        
        const result = await response.json();
        if (result.complete) {
          finalUrl = result.url;
        }
        
        uploadedChunks++;
        const progress = (uploadedChunks / totalChunks) * 100;
        onProgress?.(progress);
        
        // Small delay between chunks to prevent overload
        if (i < totalChunks - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Release memory periodically
        if (i % 10 === 0 && (window as any).gc) {
          (window as any).gc();
        }
      }
      
      this.uploadQueue.delete(uploadId);
      return { success: true, url: finalUrl };
      
    } catch (error: any) {
      console.error('Upload error:', error);
      this.uploadQueue.delete(uploadId);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Cancel an upload in progress
   */
  cancelUpload(uploadId: string) {
    const controller = this.uploadQueue.get(uploadId);
    if (controller) {
      controller.abort();
      this.uploadQueue.delete(uploadId);
    }
  }
  
  /**
   * Process image with memory-efficient compression
   */
  async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        // Calculate optimal dimensions (max 1920px)
        let { width, height } = img;
        const maxSize = 1920;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Image compression failed'));
          }
        }, 'image/jpeg', 0.85);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
  
  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE_MB = 500;
    const ALLOWED_TYPES = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'
    ];
    
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return { 
        valid: false, 
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max ${MAX_SIZE_MB}MB)` 
      };
    }
    
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|webm)$/i)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Only images and videos are allowed.' 
      };
    }
    
    return { valid: true };
  }
}

// Export singleton instance
export const esaMemoryOptimizer = ESAMemoryOptimizer.getInstance();

export const esaMemoryOptimizer = ESAMemoryOptimizer.getInstance();