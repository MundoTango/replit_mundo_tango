// ESA LIFE CEO 56x21 - Video Streaming Optimization Module
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// ESA LIFE CEO 56x21 - Stream video with range request support
export function streamVideo(req: Request, res: Response, videoPath: string) {
  try {
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    // Get video extension for content type
    const ext = path.extname(videoPath).toLowerCase();
    const contentType = getVideoContentType(ext);


    if (range) {
      // Parse Range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      };
      
      res.writeHead(206, head);
      file.pipe(res);
      
      file.on('error', (err) => {
        res.status(500).json({ error: 'Stream error' });
      });
    } else {
      // No range request, send entire file
      
      const head = {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      };
      
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to stream video' });
  }
}

// ESA LIFE CEO 56x21 - Get proper content type for video
function getVideoContentType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.m4v': 'video/x-m4v',
  };
  
  return mimeTypes[ext] || 'video/mp4';
}

// ESA LIFE CEO 56x21 - Optimize video metadata for faster loading
export function getVideoMetadata(videoPath: string): Promise<{
  duration?: number;
  width?: number;
  height?: number;
  size: number;
}> {
  return new Promise((resolve) => {
    try {
      const stat = fs.statSync(videoPath);
      
      // Basic metadata
      const metadata = {
        size: stat.size,
      };
      
      resolve(metadata);
    } catch (error) {
      resolve({ size: 0 });
    }
  });
}

// ESA LIFE CEO 56x21 - Generate thumbnail for video
export async function generateVideoThumbnail(videoPath: string): Promise<string | null> {
  try {
    // For now, return null - can be implemented with ffmpeg later
    return null;
  } catch (error) {
    return null;
  }
}

// ESA LIFE CEO 56x21 - Check if file is a video
export function isVideoFile(filename: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];
  const ext = path.extname(filename).toLowerCase();
  return videoExtensions.includes(ext);
}