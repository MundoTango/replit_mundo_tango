/**
 * ESA LIFE CEO 56x21 - Upload Queue Service
 * Facebook/Instagram-style instant response with background processing
 * Returns immediately to user, processes in background
 */

import { mediaProcessor } from './mediaProcessor';
import { storage } from '../storage';
import path from 'path';
import fs from 'fs';
import v8 from 'v8';

// Run with increased heap: node --max-old-space-size=4096
if (process.env.NODE_ENV !== 'production') {
  // Upload Queue Memory Settings
  console.log('  Heap Limit:', (v8.getHeapStatistics().heap_size_limit / 1024 / 1024 / 1024).toFixed(2), 'GB');
}

interface UploadJob {
  id: string;
  userId: string;
  files: Array<{
    path: string;
    mimetype: string;
    originalname: string;
    size: number;
  }>;
  postData: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

class UploadQueueService {
  private jobs: Map<string, UploadJob> = new Map();
  private processing: boolean = false;
  private processInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start background processor
    this.startProcessor();
    // Upload Queue Service initialized
  }

  /**
   * Add upload job to queue - returns immediately
   * This is the Facebook/Instagram approach - instant response
   */
  async addJob(userId: string, files: any[], postData: any): Promise<string> {
    const jobId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: UploadJob = {
      id: jobId,
      userId,
      files: files.map(f => ({
        path: f.path,
        mimetype: f.mimetype,
        originalname: f.originalname,
        size: f.size
      })),
      postData,
      status: 'pending',
      progress: 0,
      createdAt: new Date()
    };

    this.jobs.set(jobId, job);
    
    // Job queued for user
    console.log(`📊 Queue size: ${this.jobs.size} jobs`);
    
    // Process immediately if not already processing
    this.processNext();
    
    return jobId;
  }

  /**
   * Get job status - for polling or WebSocket updates
   */
  getJob(jobId: string): UploadJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Start background processor
   */
  private startProcessor() {
    if (this.processInterval) return;
    
    // Process queue every 500ms
    this.processInterval = setInterval(() => {
      this.processNext();
    }, 500);
    
    // Upload processor started
  }

  /**
   * Process next job in queue
   */
  private async processNext() {
    if (this.processing) return;
    
    const pendingJob = Array.from(this.jobs.values())
      .find(job => job.status === 'pending');
    
    if (!pendingJob) return;
    
    this.processing = true;
    pendingJob.status = 'processing';
    pendingJob.progress = 10;
    
    console.log(`⚙️ Processing job ${pendingJob.id}`);
    
    try {
      // Process media files with compression
      const processedMedia = await this.processMediaFiles(pendingJob);
      pendingJob.progress = 70;
      
      // Create post in database with processed media
      const post = await this.createPost(pendingJob, processedMedia);
      pendingJob.progress = 90;
      
      // Mark job as completed
      pendingJob.status = 'completed';
      pendingJob.progress = 100;
      pendingJob.result = post;
      pendingJob.completedAt = new Date();
      
      const processingTime = pendingJob.completedAt.getTime() - pendingJob.createdAt.getTime();
      console.log(`✅ Job ${pendingJob.id} completed in ${processingTime}ms`);
      
      // Clean up completed job after 5 minutes
      setTimeout(() => {
        this.jobs.delete(pendingJob.id);
      }, 5 * 60 * 1000);
      
    } catch (error: any) {
      console.error(`❌ Job ${pendingJob.id} failed:`, error);
      pendingJob.status = 'failed';
      pendingJob.error = error.message;
      
      // Clean up failed files
      this.cleanupFiles(pendingJob.files);
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process media files with compression - one at a time to save memory
   */
  private async processMediaFiles(job: UploadJob): Promise<any[]> {
    console.log(`🖼️ Processing ${job.files.length} media files for job ${job.id}`);
    
    const results = [];
    
    for (let i = 0; i < job.files.length; i++) {
      const file = job.files[i];
      job.progress = 10 + (i / job.files.length) * 50; // Progress from 10% to 60%
      
      // Skip processing for already compressed images from client
      if (file.mimetype.startsWith('image/') && file.size < 2 * 1024 * 1024) {
        console.log(`✅ Image already compressed: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        results.push({
          type: 'image',
          medium: `/uploads/${path.basename(file.path)}`,
          large: `/uploads/${path.basename(file.path)}`
        });
        continue;
      }
      
      try {
        const processed = await mediaProcessor.processMedia(file.path, file.mimetype);
        results.push({
          type: file.mimetype.startsWith('image/') ? 'image' : 'video',
          ...processed
        });
        
        // Clean up original file after processing to free memory
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log(`🗑️ Cleaned up original: ${file.path}`);
        }
      } catch (error) {
        console.error(`Failed to process ${file.originalname}:`, error);
        // Continue with other files
      }
      
      // Force GC after each file to keep memory low
      if (global.gc) {
        global.gc();
      }
    }
    
    return results;
  }

  /**
   * Create post with processed media
   */
  private async createPost(job: UploadJob, processedMedia: any[]): Promise<any> {
    const { postData, userId } = job;
    
    // Extract URLs from processed media
    const imageUrls: string[] = [];
    const videoUrls: string[] = [];
    
    processedMedia.forEach(media => {
      if (media.type === 'image') {
        // Use medium size for feed, keep others for different views
        imageUrls.push(media.medium || media.large);
      } else if (media.type === 'video') {
        videoUrls.push(media.compressed);
      }
    });
    
    // Create post with optimized media
    const post = await storage.createPost({
      userId,
      content: postData.content || '',
      imageUrl: imageUrls[0] || null,
      videoUrl: videoUrls[0] || null,
      location: postData.location || null,
      visibility: postData.isPublic ? 'public' : 'private',
      hashtags: postData.hashtags || [],
      metadata: {
        processedMedia, // Store all versions for different uses
        originalFiles: job.files.length,
        processingJobId: job.id
      }
    });
    
    console.log(`📝 Post created with ID: ${post.id}`);
    return post;
  }

  /**
   * Clean up uploaded files
   */
  private cleanupFiles(files: any[]) {
    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log(`🗑️ Cleaned up: ${file.path}`);
      }
    });
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length
    };
  }
}

// Export singleton instance
export const uploadQueue = new UploadQueueService();

// Log initialization
// Facebook/Instagram-style fast upload system ready