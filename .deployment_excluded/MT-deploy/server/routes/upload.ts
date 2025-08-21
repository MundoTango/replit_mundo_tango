import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const router = Router();

// ESA Layer 13: Internal File Management - Complete upload solution
// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `${timestamp}-${uniqueId}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
    files: 30 // Maximum 30 files
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`), false);
    }
  }
});

// ESA Layer 13: Internal upload endpoint
router.post('/api/upload', upload.array('files', 30), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = [];
    
    for (const file of req.files as Express.Multer.File[]) {
      console.log(`[Internal Upload] Processing: ${file.filename} (${file.mimetype})`);
      
      let processedPath = file.path;
      let thumbnailPath = null;
      
      // Generate thumbnails for images and videos
      if (file.mimetype.startsWith('image/')) {
        // Optimize images with Sharp
        const optimizedFilename = `optimized-${file.filename}`;
        const optimizedPath = path.join(uploadsDir, optimizedFilename);
        
        await sharp(file.path)
          .resize(1920, 1080, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .jpeg({ quality: 85 })
          .toFile(optimizedPath);
        
        // Create thumbnail
        const thumbnailFilename = `thumb-${file.filename}`;
        thumbnailPath = path.join(uploadsDir, thumbnailFilename);
        
        await sharp(file.path)
          .resize(300, 300, { 
            fit: 'cover',
            position: 'center' 
          })
          .jpeg({ quality: 70 })
          .toFile(thumbnailPath);
        
        processedPath = optimizedPath;
      }
      
      const fileUrl = `/uploads/${path.basename(processedPath)}`;
      const thumbnailUrl = thumbnailPath ? `/uploads/${path.basename(thumbnailPath)}` : null;
      
      uploadedFiles.push({
        id: uuidv4(),
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl,
        thumbnailUrl,
        uploadedAt: new Date().toISOString()
      });
      
      console.log(`[Internal Upload] ✅ Processed: ${fileUrl}`);
    }
    
    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });
    
  } catch (error) {
    console.error('[Internal Upload] Error:', error);
    res.status(500).json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ESA Layer 13: File serving endpoint (already exists in main server)
// This is handled by express.static('/uploads') in main server

export default router;