/**
 * ESA LIFE CEO 56x21 - Debug Routes
 * Diagnostic endpoints to verify upload system functionality
 */

import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * ESA LIFE CEO 56x21 - List all uploaded files
 * Debug endpoint to verify files are being saved correctly
 */
router.get('/api/debug/uploads', async (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        success: false,
        message: 'Uploads directory does not exist',
        path: uploadsDir
      });
    }
    
    // Recursively list all files in uploads directory
    const listFiles = (dir: string, prefix = ''): string[] => {
      const files: string[] = [];
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...listFiles(fullPath, path.join(prefix, item)));
        } else {
          files.push(path.join(prefix, item));
        }
      }
      
      return files;
    };
    
    const allFiles = listFiles(uploadsDir);
    
    // Get file details
    const fileDetails = allFiles.map(file => {
      const fullPath = path.join(uploadsDir, file);
      const stat = fs.statSync(fullPath);
      return {
        path: file,
        url: `/uploads/${file}`,
        size: stat.size,
        sizeFormatted: `${(stat.size / 1024 / 1024).toFixed(2)}MB`,
        created: stat.birthtime,
        modified: stat.mtime
      };
    });
    
    res.json({
      success: true,
      uploadsDirectory: uploadsDir,
      totalFiles: fileDetails.length,
      files: fileDetails
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * ESA LIFE CEO 56x21 - Test direct file access
 * Verify that uploaded files can be accessed via URL
 */
router.get('/api/debug/test-media/:filepath(*)', async (req, res) => {
  try {
    const filepath = req.params.filepath;
    const fullPath = path.join(process.cwd(), 'uploads', filepath);
    
    // Check file existence
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
        requestedPath: filepath,
        fullPath
      });
    }
    
    const stat = fs.statSync(fullPath);
    res.json({
      success: true,
      file: {
        path: filepath,
        url: `/uploads/${filepath}`,
        size: stat.size,
        sizeFormatted: `${(stat.size / 1024 / 1024).toFixed(2)}MB`,
        exists: true,
        canAccess: true
      }
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;