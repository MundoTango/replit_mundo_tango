import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);

interface ChunkInfo {
  uploadId: string;
  chunkIndex: number;
  totalChunks: number;
  filename: string;
}

// Store active uploads in memory (in production, use Redis)
const activeUploads = new Map<string, {
  chunks: Buffer[];
  receivedChunks: Set<number>;
  totalChunks: number;
  filename: string;
  startTime: number;
}>();

// Clean up old uploads every 5 minutes
setInterval(() => {
  const now = Date.now();
  const timeout = 30 * 60 * 1000; // 30 minutes
  
  for (const [uploadId, upload] of activeUploads.entries()) {
    if (now - upload.startTime > timeout) {
      console.log(`🧹 Cleaning up stale upload: ${uploadId}`);
      activeUploads.delete(uploadId);
    }
  }
}, 5 * 60 * 1000);

export async function handleChunkedUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const { uploadId, chunkIndex, totalChunks, filename } = req.body as ChunkInfo;
    const chunkData = req.body.chunk; // Base64 encoded chunk
    
    if (!uploadId || chunkIndex === undefined || !totalChunks || !filename) {
      return res.status(400).json({ 
        error: 'Missing required chunk information' 
      });
    }

    // Initialize upload if first chunk
    if (!activeUploads.has(uploadId)) {
      console.log(`📦 Starting chunked upload: ${uploadId}, file: ${filename}, chunks: ${totalChunks}`);
      activeUploads.set(uploadId, {
        chunks: new Array(totalChunks),
        receivedChunks: new Set(),
        totalChunks,
        filename,
        startTime: Date.now()
      });
    }

    const upload = activeUploads.get(uploadId)!;
    
    // Store chunk
    const buffer = Buffer.from(chunkData, 'base64');
    upload.chunks[chunkIndex] = buffer;
    upload.receivedChunks.add(chunkIndex);
    
    // Log progress every 10 chunks
    if (chunkIndex % 10 === 0) {
      const progress = Math.round((upload.receivedChunks.size / totalChunks) * 100);
      console.log(`📊 Upload progress: ${uploadId} - ${progress}% (${upload.receivedChunks.size}/${totalChunks} chunks)`);
    }

    // Check if all chunks received
    if (upload.receivedChunks.size === totalChunks) {
      console.log(`✅ All chunks received for ${uploadId}, assembling file...`);
      
      // Assemble file
      const fullBuffer = Buffer.concat(upload.chunks);
      
      // Ensure upload directory exists
      const uploadDir = path.join('uploads', 'chunked');
      await mkdir(uploadDir, { recursive: true });
      
      // Save file
      const uniqueSuffix = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const ext = path.extname(filename);
      const finalFilename = `${path.basename(filename, ext)}_${uniqueSuffix}${ext}`;
      const filepath = path.join(uploadDir, finalFilename);
      
      await writeFile(filepath, fullBuffer);
      
      // Clean up
      activeUploads.delete(uploadId);
      
      // Free memory immediately
      if (global.gc) {
        global.gc();
      }
      
      console.log(`💾 File saved: ${filepath} (${(fullBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
      
      return res.json({
        success: true,
        filename: finalFilename,
        path: filepath,
        size: fullBuffer.length
      });
    }
    
    // Acknowledge chunk received
    res.json({
      success: true,
      chunkIndex,
      received: upload.receivedChunks.size,
      total: totalChunks
    });
    
  } catch (error) {
    console.error('❌ Chunked upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process chunk',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Middleware to enable chunked uploads for large files
export function enableChunkedUploads(sizeThreshold: number = 50 * 1024 * 1024) { // 50MB default
  return (req: Request, res: Response, next: NextFunction) => {
    // Check Content-Length header
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > sizeThreshold) {
      console.log(`🔄 Large upload detected (${(contentLength / 1024 / 1024).toFixed(2)} MB), enabling chunked mode`);
      req.headers['x-chunked-upload'] = 'true';
    }
    
    next();
  };
}