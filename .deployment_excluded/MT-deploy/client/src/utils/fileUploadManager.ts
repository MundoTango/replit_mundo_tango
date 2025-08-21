// ESA LIFE CEO 56x21 - Memory-optimized file upload manager
import { toast } from '@/hooks/use-toast';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface ChunkedUploadOptions {
  file: File;
  endpoint: string;
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (response: any) => void;
  onError?: (error: Error) => void;
  chunkSize?: number;
  maxRetries?: number;
  additionalData?: Record<string, any>;
}

class FileUploadManager {
  private static instance: FileUploadManager;
  private uploadQueue: Map<string, AbortController> = new Map();
  private memoryThreshold = 100 * 1024 * 1024; // 100MB threshold
  
  static getInstance(): FileUploadManager {
    if (!FileUploadManager.instance) {
      FileUploadManager.instance = new FileUploadManager();
    }
    return FileUploadManager.instance;
  }
  
  // ESA LIFE CEO 56x21 - Chunked upload for large files
  async uploadChunked({
    file,
    endpoint,
    onProgress,
    onComplete,
    onError,
    chunkSize = 5 * 1024 * 1024, // 5MB chunks
    maxRetries = 3,
    additionalData = {}
  }: ChunkedUploadOptions): Promise<void> {
    const uploadId = `upload_${Date.now()}_${Math.random()}`;
    const abortController = new AbortController();
    this.uploadQueue.set(uploadId, abortController);
    
    try {
      // Check file size and decide upload strategy
      if (file.size > this.memoryThreshold) {
        console.log(`🚀 Large file detected (${(file.size / 1024 / 1024).toFixed(2)}MB), using chunked upload`);
        await this.performChunkedUpload({
          file,
          endpoint,
          onProgress,
          onComplete,
          onError,
          chunkSize,
          maxRetries,
          additionalData,
          abortController
        });
      } else {
        console.log(`📤 Standard upload for file (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        await this.performStandardUpload({
          file,
          endpoint,
          onProgress,
          onComplete,
          onError,
          additionalData,
          abortController
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      onError?.(error as Error);
    } finally {
      this.uploadQueue.delete(uploadId);
      // Force garbage collection hint
      if (file.size > 50 * 1024 * 1024) { // 50MB+
        setTimeout(() => {
          // Allow browser to clean up memory
        }, 100);
      }
    }
  }
  
  private async performChunkedUpload({
    file,
    endpoint,
    onProgress,
    onComplete,
    onError,
    chunkSize,
    maxRetries,
    additionalData,
    abortController
  }: any): Promise<void> {
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadSessionId = `session_${Date.now()}`;
    let uploadedBytes = 0;
    
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      if (abortController.signal.aborted) {
        throw new Error('Upload cancelled');
      }
      
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      
      let retries = 0;
      let success = false;
      
      while (retries < maxRetries && !success) {
        try {
          const formData = new FormData();
          formData.append('chunk', chunk);
          formData.append('chunkIndex', chunkIndex.toString());
          formData.append('totalChunks', totalChunks.toString());
          formData.append('uploadSessionId', uploadSessionId);
          formData.append('fileName', file.name);
          formData.append('fileSize', file.size.toString());
          formData.append('fileType', file.type);
          
          // Add additional data
          Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value as string);
          });
          
          const response = await fetch(`${endpoint}/chunk`, {
            method: 'POST',
            body: formData,
            signal: abortController.signal,
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error(`Chunk upload failed: ${response.statusText}`);
          }
          
          uploadedBytes += chunk.size;
          success = true;
          
          // Report progress
          onProgress?.({
            loaded: uploadedBytes,
            total: file.size,
            percentage: Math.round((uploadedBytes / file.size) * 100)
          });
          
          // Clear chunk reference for garbage collection
          chunk.stream().cancel?.();
          
        } catch (error) {
          retries++;
          if (retries >= maxRetries) {
            throw error;
          }
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
        }
      }
    }
    
    // Finalize upload
    const finalizeResponse = await fetch(`${endpoint}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uploadSessionId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ...additionalData
      }),
      credentials: 'include'
    });
    
    if (!finalizeResponse.ok) {
      throw new Error('Failed to finalize upload');
    }
    
    const result = await finalizeResponse.json();
    onComplete?.(result);
  }
  
  private async performStandardUpload({
    file,
    endpoint,
    onProgress,
    onComplete,
    onError,
    additionalData,
    abortController
  }: any): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional data
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    
    const xhr = new XMLHttpRequest();
    
    // Progress tracking
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress?.({
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100)
        });
      }
    });
    
    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          onComplete?.(response);
        } catch (error) {
          onError?.(new Error('Invalid response format'));
        }
      } else {
        onError?.(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });
    
    // Handle errors
    xhr.addEventListener('error', () => {
      onError?.(new Error('Network error during upload'));
    });
    
    // Handle abort
    abortController.signal.addEventListener('abort', () => {
      xhr.abort();
    });
    
    xhr.open('POST', endpoint);
    xhr.withCredentials = true;
    xhr.send(formData);
  }
  
  // Cancel an ongoing upload
  cancelUpload(uploadId: string): void {
    const controller = this.uploadQueue.get(uploadId);
    if (controller) {
      controller.abort();
      this.uploadQueue.delete(uploadId);
      toast({
        title: 'Upload cancelled',
        description: 'The file upload has been cancelled',
        variant: 'default'
      });
    }
  }
  
  // Cancel all uploads
  cancelAllUploads(): void {
    this.uploadQueue.forEach(controller => controller.abort());
    this.uploadQueue.clear();
    toast({
      title: 'All uploads cancelled',
      description: 'All ongoing uploads have been cancelled',
      variant: 'default'
    });
  }
  
  // Get memory usage estimate
  getMemoryUsage(): { used: number; threshold: number } {
    return {
      used: this.uploadQueue.size * 10 * 1024 * 1024, // Rough estimate
      threshold: this.memoryThreshold
    };
  }
}

export default FileUploadManager.getInstance();
export type { UploadProgress, ChunkedUploadOptions };