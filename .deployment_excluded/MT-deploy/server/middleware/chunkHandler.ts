/**
 * ESA LIFE CEO 56x21 - Chunk Upload Handler
 * Facebook/Instagram-style chunked upload processing
 * Assembles chunks without loading entire file in memory
 */

import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import busboy from 'busboy';

// Store upload progress in memory (use Redis in production)
const uploadProgress = new Map<string, {
  uploadedChunks: Set<number>;
  totalChunks: number;
  fileName: string;
  fileType: string;
  tempDir: string;
  createdAt: Date;
}>();

// Clean up old uploads every hour
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [uploadId, data] of uploadProgress.entries()) {
    if (data.createdAt.getTime() < oneHourAgo) {
      // Clean up temp files
      if (fs.existsSync(data.tempDir)) {
        fs.rmSync(data.tempDir, { recursive: true, force: true });
      }
      uploadProgress.delete(uploadId);
      console.log(`🗑️ Cleaned up stale upload: ${uploadId}`);
    }
  }
}, 60 * 60 * 1000);

/**
 * Handle individual chunk upload
 */
export const uploadChunk = (req: Request, res: Response) => {
  const bb = busboy({
    headers: req.headers,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max per chunk
      files: 1,
      fields: 10
    }
  });
  
  let chunkData: Buffer | null = null;
  const fields: any = {};
  
  bb.on('file', (name: string, file: NodeJS.ReadableStream, info: any) => {
    const chunks: Buffer[] = [];
    
    file.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    file.on('end', () => {
      chunkData = Buffer.concat(chunks);
    });
  });
  
  bb.on('field', (name: string, value: string) => {
    fields[name] = value;
  });
  
  bb.on('close', async () => {
    try {
      const { uploadId, chunkIndex, totalChunks, fileName, fileType } = fields;
      
      if (!uploadId || !chunkIndex || !totalChunks || !fileName || !chunkData) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const chunkIdx = parseInt(chunkIndex);
      const total = parseInt(totalChunks);
      
      // Initialize upload progress if new
      if (!uploadProgress.has(uploadId)) {
        const tempDir = path.join('uploads', 'chunks', uploadId);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        uploadProgress.set(uploadId, {
          uploadedChunks: new Set(),
          totalChunks: total,
          fileName,
          fileType,
          tempDir,
          createdAt: new Date()
        });
      }
      
      const progress = uploadProgress.get(uploadId)!;
      
      // Save chunk to temp file
      const chunkPath = path.join(progress.tempDir, `chunk_${chunkIdx}`);
      fs.writeFileSync(chunkPath, chunkData);
      
      progress.uploadedChunks.add(chunkIdx);
      
      console.log(`📦 Chunk ${chunkIdx + 1}/${total} saved for upload ${uploadId}`);
      
      res.json({
        success: true,
        uploadId,
        chunksReceived: progress.uploadedChunks.size,
        totalChunks: total
      });
      
    } catch (error: any) {
      console.error('❌ Chunk upload error:', error);
      res.status(500).json({ error: 'Chunk upload failed' });
    }
  });
  
  bb.on('error', (err: Error) => {
    console.error('❌ Busboy error:', err);
    res.status(400).json({ error: 'Invalid upload data' });
  });
  
  req.pipe(bb);
};

/**
 * Complete the upload by assembling chunks
 */
export const completeUpload = async (req: Request, res: Response) => {
  try {
    const { uploadId, fileName, fileType, totalChunks } = req.body;
    
    const progress = uploadProgress.get(uploadId);
    if (!progress) {
      return res.status(404).json({ error: 'Upload not found' });
    }
    
    // Verify all chunks are uploaded
    if (progress.uploadedChunks.size !== totalChunks) {
      return res.status(400).json({
        error: 'Missing chunks',
        received: progress.uploadedChunks.size,
        expected: totalChunks
      });
    }
    
    // Assemble chunks into final file using streams (memory efficient)
    const finalPath = path.join('uploads', `${uploadId}_${fileName}`);
    const writeStream = fs.createWriteStream(finalPath);
    
    console.log(`🔧 Assembling ${totalChunks} chunks for ${fileName}`);
    
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(progress.tempDir, `chunk_${i}`);
      const chunkData = fs.readFileSync(chunkPath);
      writeStream.write(chunkData);
      
      // Delete chunk after writing to free memory
      fs.unlinkSync(chunkPath);
    }
    
    writeStream.end();
    
    // Clean up temp directory
    fs.rmSync(progress.tempDir, { recursive: true, force: true });
    uploadProgress.delete(uploadId);
    
    console.log(`✅ File assembled: ${finalPath}`);
    
    // Return file info for further processing
    res.json({
      success: true,
      uploadId,
      filePath: finalPath,
      fileName,
      fileType,
      fileSize: fs.statSync(finalPath).size
    });
    
  } catch (error: any) {
    console.error('❌ Complete upload error:', error);
    res.status(500).json({ error: 'Failed to complete upload' });
  }
};

/**
 * Get upload status for resumable uploads
 */
export const getUploadStatus = (req: Request, res: Response) => {
  const { uploadId } = req.params;
  
  const progress = uploadProgress.get(uploadId);
  if (!progress) {
    return res.status(404).json({ error: 'Upload not found' });
  }
  
  res.json({
    uploadId,
    uploadedChunks: Array.from(progress.uploadedChunks),
    totalChunks: progress.totalChunks,
    fileName: progress.fileName,
    fileType: progress.fileType
  });
};