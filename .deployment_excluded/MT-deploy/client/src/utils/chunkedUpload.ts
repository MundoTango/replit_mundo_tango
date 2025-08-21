/**
 * ESA LIFE CEO 56x21 - Facebook/Instagram-style Chunked Upload
 * Splits large files into chunks for parallel upload
 * Prevents memory crashes and enables resumable uploads
 */

interface ChunkUpload {
  file: File;
  chunkSize: number;
  chunkIndex: number;
  totalChunks: number;
  uploadId: string;
}

const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks like Instagram
const MAX_PARALLEL_UPLOADS = 3; // Upload 3 chunks at once

/**
 * Split file into chunks for upload
 */
export function createFileChunks(file: File): Blob[] {
  const chunks: Blob[] = [];
  let start = 0;
  
  while (start < file.size) {
    const end = Math.min(start + CHUNK_SIZE, file.size);
    chunks.push(file.slice(start, end));
    start = end;
  }
  
  // File split into chunks
  return chunks;
}

/**
 * Upload a single chunk with retry logic
 */
async function uploadChunk(
  chunk: Blob,
  chunkIndex: number,
  totalChunks: number,
  uploadId: string,
  fileName: string,
  fileType: string,
  retries = 3
): Promise<boolean> {
  const formData = new FormData();
  formData.append('chunk', chunk);
  formData.append('chunkIndex', chunkIndex.toString());
  formData.append('totalChunks', totalChunks.toString());
  formData.append('uploadId', uploadId);
  formData.append('fileName', fileName);
  formData.append('fileType', fileType);
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch('/api/upload/chunk', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (response.ok) {
        return true;
      }
      
      // Retry on server errors
      if (response.status >= 500 && attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      
      throw new Error(`Chunk upload failed: ${response.statusText}`);
    } catch (error) {
      if (attempt === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  return false;
}

/**
 * Upload file in chunks with parallel processing
 * This is how Facebook/Instagram handle large uploads
 */
export async function chunkedUpload(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ uploadId: string; success: boolean }> {
  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const chunks = createFileChunks(file);
  const totalChunks = chunks.length;
  let completedChunks = 0;
  
  // Starting chunked upload
  console.log(`📊 File size: ${(file.size / 1024 / 1024).toFixed(2)}MB, Chunks: ${totalChunks}`);
  
  // Upload chunks in parallel batches
  const uploadPromises: Promise<void>[] = [];
  
  for (let i = 0; i < totalChunks; i += MAX_PARALLEL_UPLOADS) {
    const batch = [];
    
    for (let j = 0; j < MAX_PARALLEL_UPLOADS && i + j < totalChunks; j++) {
      const chunkIndex = i + j;
      const chunk = chunks[chunkIndex];
      
      batch.push(
        uploadChunk(chunk, chunkIndex, totalChunks, uploadId, file.name, file.type)
          .then(() => {
            completedChunks++;
            const progress = Math.round((completedChunks / totalChunks) * 100);
            if (onProgress) onProgress(progress);
            console.log(`✅ Chunk ${chunkIndex + 1}/${totalChunks} uploaded (${progress}%)`);
          })
          .catch(error => {
            console.error(`❌ Failed to upload chunk ${chunkIndex}:`, error);
            throw error;
          })
      );
    }
    
    // Wait for batch to complete before starting next
    await Promise.all(batch);
  }
  
  // Notify server that all chunks are uploaded
  const response = await fetch('/api/upload/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uploadId,
      fileName: file.name,
      fileType: file.type,
      totalChunks
    }),
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to complete upload');
  }
  
  const result = await response.json();
  // Upload complete
  
  return {
    uploadId,
    success: true
  };
}

/**
 * Resume an interrupted upload (Facebook-style)
 */
export async function resumeUpload(
  uploadId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<boolean> {
  // Check which chunks are already uploaded
  const response = await fetch(`/api/upload/status/${uploadId}`);
  if (!response.ok) return false;
  
  const { uploadedChunks, totalChunks } = await response.json();
  const chunks = createFileChunks(file);
  
  console.log(`📥 Resuming upload: ${uploadedChunks.length}/${totalChunks} chunks already uploaded`);
  
  // Upload only missing chunks
  const missingChunks = [];
  for (let i = 0; i < totalChunks; i++) {
    if (!uploadedChunks.includes(i)) {
      missingChunks.push(i);
    }
  }
  
  let completed = uploadedChunks.length;
  
  for (const chunkIndex of missingChunks) {
    await uploadChunk(
      chunks[chunkIndex],
      chunkIndex,
      totalChunks,
      uploadId,
      file.name,
      file.type
    );
    completed++;
    if (onProgress) onProgress(Math.round((completed / totalChunks) * 100));
  }
  
  return true;
}