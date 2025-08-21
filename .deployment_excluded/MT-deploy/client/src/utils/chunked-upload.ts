// ESA LIFE CEO 56x21 - Chunked upload for large videos
// Prevents memory crashes by uploading in small chunks

export class ChunkedUploader {
  private chunkSize = 5 * 1024 * 1024; // 5MB chunks
  
  async uploadLargeFile(
    file: File, 
    endpoint: string,
    onProgress?: (percent: number) => void
  ): Promise<Response> {
    // For files under 10MB, use regular upload
    if (file.size < 10 * 1024 * 1024) {
      const formData = new FormData();
      formData.append('media_0', file);
      return fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
    }
    
    // For large files, use chunked upload
    console.log(`📹 ESA: Uploading ${(file.size / 1024 / 1024).toFixed(1)}MB video in chunks`);
    
    const chunks = Math.ceil(file.size / this.chunkSize);
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    for (let i = 0; i < chunks; i++) {
      const start = i * this.chunkSize;
      const end = Math.min(start + this.chunkSize, file.size);
      const chunk = file.slice(start, end);
      
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('uploadId', uploadId);
      formData.append('chunkIndex', String(i));
      formData.append('totalChunks', String(chunks));
      formData.append('filename', file.name);
      formData.append('fileSize', String(file.size));
      
      if (i === chunks - 1) {
        // Last chunk - signal completion
        formData.append('complete', 'true');
      }
      
      const response = await fetch('/api/upload/chunk', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Chunk ${i + 1}/${chunks} upload failed`);
      }
      
      // Report progress
      const progress = ((i + 1) / chunks) * 100;
      onProgress?.(progress);
      console.log(`📊 Upload progress: ${progress.toFixed(0)}%`);
      
      // Small delay between chunks to prevent overload
      if (i < chunks - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Return final response
    return fetch(`/api/upload/complete/${uploadId}`, {
      method: 'POST',
      credentials: 'include'
    });
  }
  
  // Helper to validate file before upload
  validateFile(file: File, maxSizeMB = 500): string | null {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max ${maxSizeMB}MB)`;
    }
    
    const validTypes = ['image/', 'video/'];
    if (!validTypes.some(type => file.type.startsWith(type))) {
      return 'Invalid file type. Only images and videos are allowed.';
    }
    
    return null; // Valid
  }
}

export const chunkedUploader = new ChunkedUploader();