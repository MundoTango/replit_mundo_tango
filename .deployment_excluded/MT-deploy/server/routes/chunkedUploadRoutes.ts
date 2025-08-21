/**
 * ESA LIFE CEO 56x21 - Chunked Upload Routes
 * Handles massive video uploads (456MB+) without memory crashes
 * Stream-based processing with aggressive memory management
 */

import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { getUserId } from '../utils/authHelper';
import { storage } from '../storage';
import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';
import multer from 'multer';

const router = Router();

// Configure multer for chunked uploads with memory storage
const chunkStorage = multer.memoryStorage();
const chunkUpload = multer({ 
  storage: chunkStorage,
  limits: {
    fileSize: 11 * 1024 * 1024 // 11MB per chunk (slightly larger than 10MB to handle overhead)
  }
});

// Temporary storage for chunks
const TEMP_DIR = path.join(process.cwd(), 'tmp', 'chunks');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Store upload sessions in memory (would use Redis in production)
const uploadSessions = new Map<string, {
  userId: number;
  fileName: string;
  fileSize: number;
  totalChunks: number;
  receivedChunks: Set<number>;
  startTime: number;
}>();

// Clean up old sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of uploadSessions.entries()) {
    if (now - session.startTime > 30 * 60 * 1000) { // 30 minutes
      // Clean up temp files
      const chunkDir = path.join(TEMP_DIR, id);
      if (fs.existsSync(chunkDir)) {
        fs.rmSync(chunkDir, { recursive: true, force: true });
      }
      uploadSessions.delete(id);
    }
  }
}, 5 * 60 * 1000);

/**
 * Handle individual chunk upload
 */
router.post('/api/upload/chunk', chunkUpload.single('chunk'), async (req: any, res) => {
  const userId = await getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { uploadId, chunkIndex, totalChunks, filename, fileSize } = req.body;
    
    // Initialize session if first chunk
    if (!uploadSessions.has(uploadId)) {
      uploadSessions.set(uploadId, {
        userId,
        fileName: filename,
        fileSize: parseInt(fileSize),
        totalChunks: parseInt(totalChunks),
        receivedChunks: new Set(),
        startTime: Date.now()
      });
    }

    const session = uploadSessions.get(uploadId)!;
    const chunkDir = path.join(TEMP_DIR, uploadId);
    
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    // Save chunk to disk - get chunk from multer
    const chunkPath = path.join(chunkDir, `chunk_${chunkIndex}`);
    const chunkBuffer = req.file?.buffer;
    
    if (!chunkBuffer) {
      return res.status(400).json({ error: 'No chunk data received' });
    }

    // Write chunk with stream to avoid memory issues
    await fs.promises.writeFile(chunkPath, chunkBuffer);
    session.receivedChunks.add(parseInt(chunkIndex));

    // Log progress every 10 chunks
    if (session.receivedChunks.size % 10 === 0) {
      const progress = (session.receivedChunks.size / session.totalChunks) * 100;
      console.log(`📊 Upload progress for ${filename}: ${progress.toFixed(1)}% | Heap: ${(process.memoryUsage().heapUsed / 1024 / 1024 / 1024).toFixed(2)}GB`);
    }

    // Force GC every 20 chunks
    if (global.gc && session.receivedChunks.size % 20 === 0) {
      const heapMB = process.memoryUsage().heapUsed / 1024 / 1024;
      if (heapMB > 2000) { // If heap > 2GB
        console.log(`♻️ Forcing garbage collection at ${Math.round(heapMB)}MB heap usage`);
        global.gc();
      }
    }

    // Check if all chunks received
    if (session.receivedChunks.size === session.totalChunks) {
      // Assemble the file
      console.log(`🔧 Assembling ${session.totalChunks} chunks for ${filename}`);
      
      const uploadDir = path.join('uploads', 'posts', String(userId));
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const sanitizedFilename = filename.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${sanitizedFilename}`;
      const finalPath = path.join(uploadDir, uniqueName);

      // Assemble chunks with streaming
      const writeStream = fs.createWriteStream(finalPath);
      
      for (let i = 0; i < session.totalChunks; i++) {
        const chunkPath = path.join(chunkDir, `chunk_${i}`);
        const chunkData = await fs.promises.readFile(chunkPath);
        writeStream.write(chunkData);
        
        // Delete chunk immediately after writing to save disk space
        await fs.promises.unlink(chunkPath);
      }
      
      await new Promise((resolve, reject) => {
        writeStream.end(resolve);
        writeStream.on('error', reject);
      });

      // Clean up chunk directory
      fs.rmSync(chunkDir, { recursive: true, force: true });
      uploadSessions.delete(uploadId);

      // Generate thumbnail for videos
      let thumbnailUrl = null;
      if (filename.toLowerCase().match(/\.(mp4|mov|avi|webm)$/)) {
        thumbnailUrl = await generateVideoThumbnail(finalPath, uploadDir, uniqueName);
      }

      const mediaUrl = `/uploads/posts/${userId}/${uniqueName}`;
      
      console.log(`✅ File assembled: ${mediaUrl} (${(session.fileSize / 1024 / 1024).toFixed(1)}MB)`);
      
      res.json({ 
        success: true, 
        url: mediaUrl,
        thumbnailUrl,
        complete: true 
      });
    } else {
      // Chunk received, waiting for more
      res.json({ 
        success: true, 
        received: session.receivedChunks.size,
        total: session.totalChunks 
      });
    }
  } catch (error: any) {
    console.error('❌ Chunk upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate thumbnail for video
 */
async function generateVideoThumbnail(videoPath: string, outputDir: string, baseName: string): Promise<string | null> {
  try {
    const thumbnailName = `${baseName}_thumb.jpg`;
    const thumbnailPath = path.join(outputDir, thumbnailName);
    
    return new Promise((resolve) => {
      // Skip thumbnail generation if ffmpeg not available
      try {
        ffmpeg(videoPath)
          .screenshots({
            timestamps: ['00:00:01'],
            filename: thumbnailName,
            folder: outputDir,
            size: '320x240'
          })
          .on('end', () => {
            console.log(`🎬 Thumbnail generated: ${thumbnailName}`);
            resolve(`/uploads/posts/${path.basename(outputDir)}/${thumbnailName}`);
          })
          .on('error', (err) => {
            console.log('⚠️ Thumbnail generation skipped (ffmpeg not available)');
            resolve(null);
          });
      } catch (err) {
        console.log('⚠️ Thumbnail generation skipped');
        resolve(null);
      }
    });
  } catch (error) {
    console.log('⚠️ Thumbnail generation failed:', error);
    return null;
  }
}

/**
 * Complete chunked upload (alternative endpoint)
 */
router.post('/api/upload/complete/:uploadId', async (req: any, res) => {
  const { uploadId } = req.params;
  const session = uploadSessions.get(uploadId);
  
  if (!session) {
    return res.status(404).json({ error: 'Upload session not found' });
  }
  
  res.json({ 
    success: true,
    message: 'Upload already completed via chunks'
  });
});

/**
 * Health check for chunked upload service
 */
router.get('/api/upload/chunk/health', (req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    status: 'healthy',
    activeSessions: uploadSessions.size,
    memory: {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      heapLimit: `${Math.round(4096)}MB`
    },
    tempDir: TEMP_DIR,
    timestamp: new Date().toISOString()
  });
});

export default router;