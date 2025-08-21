import multer from "multer";
import path from "path";
import { existsSync, mkdirSync } from "fs";

export function setupUpload() {
  // Ensure uploads directory exists
  const uploadsDir = 'uploads';
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 500 * 1024 * 1024, // 500MB limit (reduced to prevent memory crashes)
      files: 3, // Max 3 files at once to conserve memory
      parts: 1000, // Reduced parts for multipart
      fieldSize: 10 * 1024 * 1024 // 10MB max field size
    },
    fileFilter: (req, file, cb) => {
      // Allow images and videos
      const allowedExtensions = /\.(jpeg|jpg|png|gif|mp4|mov|avi|webm|heic|heif|webp|bmp|svg)$/i;
      const allowedMimeTypes = /^(image\/(jpeg|jpg|png|gif|webp|bmp|svg\+xml|heic|heif)|video\/(mp4|quicktime|x-msvideo|webm))$/i;
      
      const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedMimeTypes.test(file.mimetype);
      
      console.log(`📁 File validation - Name: ${file.originalname}, MIME: ${file.mimetype}, Ext valid: ${extname}, MIME valid: ${mimetype}`);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        console.error(`❌ File rejected - Name: ${file.originalname}, MIME: ${file.mimetype}`);
        cb(new Error(`File type not allowed: ${file.originalname} (${file.mimetype})` ));
      }
    }
  });

  return upload;
}
