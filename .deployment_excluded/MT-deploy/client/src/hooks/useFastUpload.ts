/**
 * ESA LIFE CEO 56x21 - Fast Upload Hook
 * Facebook/Instagram-style instant posting
 * Returns immediately, processes in background
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fastUpload, waitForUpload } from '@/utils/mediaCompression';

interface UploadState {
  isUploading: boolean;
  progress: number;
  jobId: string | null;
  error: string | null;
}

export function useFastUpload() {
  const { toast } = useToast();
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    jobId: null,
    error: null
  });

  const upload = useCallback(async (
    files: File[],
    postData: any,
    options?: {
      onSuccess?: (result: any) => void;
      onError?: (error: string) => void;
      waitForCompletion?: boolean;
    }
  ) => {
    // Fast upload initiated
    
    setState({
      isUploading: true,
      progress: 0,
      jobId: null,
      error: null
    });

    try {
      // Upload with progress tracking
      const result = await fastUpload(
        files,
        postData,
        (progress) => setState(prev => ({ ...prev, progress }))
      );

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Show instant success (Facebook-style)
      toast({
        title: "Posted! 🚀",
        description: "Your post is being processed and will appear shortly",
        duration: 3000
      });

      setState(prev => ({
        ...prev,
        jobId: result.jobId || null,
        isUploading: false
      }));

      // Optionally wait for completion in background
      if (options?.waitForCompletion) {
        waitForUpload(result.jobId!, (status) => {
          console.log('Upload status:', status);
        }).then((completedPost) => {
          toast({
            title: "Post ready! ✨",
            description: "Your post is now live",
            duration: 2000
          });
          options.onSuccess?.(completedPost);
        }).catch((error) => {
          console.error('Background processing failed:', error);
          // Don't show error toast - post might still succeed
        });
      } else {
        // Call success immediately (Instagram-style)
        options?.onSuccess?.(result);
      }

      return result;

    } catch (error: any) {
      const errorMessage = error.message || 'Upload failed';
      
      setState({
        isUploading: false,
        progress: 0,
        jobId: null,
        error: errorMessage
      });

      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      });

      options?.onError?.(errorMessage);
      throw error;
    }
  }, [toast]);

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      jobId: null,
      error: null
    });
  }, []);

  return {
    upload,
    reset,
    isUploading: state.isUploading,
    progress: state.progress,
    jobId: state.jobId,
    error: state.error
  };
}

/**
 * Example usage in a component:
 * 
 * const { upload, isUploading, progress } = useFastUpload();
 * 
 * const handlePost = async () => {
 *   await upload(
 *     selectedFiles,
 *     { content: postContent, location: selectedLocation },
 *     {
 *       onSuccess: () => {
 *         // Clear form, navigate, etc
 *       },
 *       waitForCompletion: false // Don't wait, instant feedback
 *     }
 *   );
 * };
 */