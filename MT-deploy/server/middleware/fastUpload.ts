/**
 * ESA LIFE CEO 56x21 - Fast Upload Middleware
 * Facebook/Instagram-style instant response upload handler
 * Returns immediately, processes in background
 */

import { Request, Response, NextFunction } from 'express';
import { streamingUpload } from './streamingUpload';
import { uploadQueue } from '../services/uploadQueue';
import { getUserId } from '../utils/authHelper';

/**
 * Fast upload handler - returns immediately like Instagram
 * Combines streaming upload with background processing
 */
export const fastUploadHandler = [
  // Stream files to disk without memory buffering
  streamingUpload('media'),
  
  // Queue for background processing and return immediately
  async (req: any, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    try {
      
      // Get user ID
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'Please log in to post content'
        });
      }
      
      // Get uploaded files
      const files = req.files || [];
      console.log(`📊 Received ${files.length} files for instant processing`);
      
      // Extract post data from request
      const postData = {
        content: req.body.content || '',
        location: req.body.location || null,
        hashtags: req.body.hashtags || [],
        isPublic: req.body.isPublic !== false,
        visibility: req.body.isPublic === false ? 'private' : 'public',
        contextType: req.body.contextType || null,
        contextId: req.body.contextId || null,
        isRecommendation: req.body.isRecommendation === true,
        recommendationType: req.body.recommendationType || null,
        priceRange: req.body.priceRange || null
      };
      
      // Add job to queue for background processing
      const jobId = await uploadQueue.addJob(userId, files, postData);
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      console.log(`🎯 Instant response in ${responseTime}ms (Facebook-style!)`);
      console.log(`📝 Job ${jobId} queued for background processing`);
      
      // Return immediately with job ID
      // This is how Facebook/Instagram work - instant feedback
      res.json({
        success: true,
        jobId,
        message: 'Your post is being created',
        estimatedTime: files.length > 0 ? 3000 : 1000, // 3s with media, 1s without
        responseTime
      });
      
    } catch (error: any) {
      console.error('❌ Fast upload error:', error);
      
      // Clean up files if error occurs
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file: any) => {
          try {
            const fs = require('fs');
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (e) {
            // Ignore cleanup errors
          }
        });
      }
      
      res.status(500).json({
        error: 'Upload failed',
        message: error.message || 'Failed to process upload'
      });
    }
  }
];

/**
 * Get upload job status endpoint
 */
export const getUploadStatus = (req: Request, res: Response) => {
  const { jobId } = req.params;
  
  const job = uploadQueue.getJob(jobId);
  
  if (!job) {
    return res.status(404).json({
      error: 'Job not found',
      message: 'Upload job not found or expired'
    });
  }
  
  res.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    result: job.result || null,
    error: job.error || null,
    createdAt: job.createdAt,
    completedAt: job.completedAt || null
  });
};

/**
 * Get queue statistics
 */
export const getQueueStats = (req: Request, res: Response) => {
  const stats = uploadQueue.getStats();
  
  res.json({
    success: true,
    stats
  });
};