// ESA LIFE CEO 56x21 - Video Performance Optimization Hook
import { useEffect, useRef, useState, RefObject } from 'react';

interface VideoOptimizationOptions {
  threshold?: number;
  rootMargin?: string;
  preloadDistance?: string;
}

export function useVideoOptimization(
  options: VideoOptimizationOptions = {}
): {
  videoRef: RefObject<HTMLVideoElement>;
  isVisible: boolean;
  isBuffering: boolean;
  bufferProgress: number;
} {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0);

  const {
    threshold = 0.1,
    rootMargin = '50px',
    preloadDistance = '100px'
  } = options;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // ESA LIFE CEO 56x21 - Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Start loading when visible
            if (video.preload === 'none') {
              video.preload = 'auto';
            }
            // Attempt to start buffering
            video.load();
            // Video entering viewport, starting load
          } else {
            setIsVisible(false);
            // Pause if not visible to save bandwidth
            if (!video.paused && !document.pictureInPictureElement) {
              video.pause();
              // Video left viewport, pausing
            }
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(video);

    // ESA LIFE CEO 56x21 - Video event handlers
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          const progress = (bufferedEnd / duration) * 100;
          setBufferProgress(progress);
          // Buffer progress updated
        }
      }
    };

    const handleWaiting = () => {
      setIsBuffering(true);
      // Video buffering
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
      // Video ready to play
    };

    const handleError = (e: Event) => {
      // Video error occurred
      setIsBuffering(false);
    };

    // Add event listeners
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      observer.disconnect();
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [threshold, rootMargin]);

  return {
    videoRef,
    isVisible,
    isBuffering,
    bufferProgress
  };
}

// ESA LIFE CEO 56x21 - Video Quality Optimization
export function getOptimalVideoQuality(connection?: any): string {
  if (!connection) {
    connection = (navigator as any).connection || 
                 (navigator as any).mozConnection || 
                 (navigator as any).webkitConnection;
  }
  
  if (!connection) return 'auto';
  
  // Network conditions
  const effectiveType = connection.effectiveType;
  const downlink = connection.downlink; // Mbps
  
  // Network info tracked
  
  // Determine quality based on network
  if (effectiveType === '4g' && downlink > 10) {
    return 'high'; // 1080p
  } else if (effectiveType === '4g' || effectiveType === '3g') {
    return 'medium'; // 720p
  } else {
    return 'low'; // 480p
  }
}

// ESA LIFE CEO 56x21 - Adaptive Bitrate Streaming Helper
export function createAdaptiveVideoSource(baseUrl: string): string {
  const quality = getOptimalVideoQuality();
  
  // If we have different quality versions available
  if (baseUrl.includes('.mp4')) {
    const qualityMap: Record<string, string> = {
      'high': baseUrl,
      'medium': baseUrl.replace('.mp4', '_720p.mp4'),
      'low': baseUrl.replace('.mp4', '_480p.mp4')
    };
    
    return qualityMap[quality] || baseUrl;
  }
  
  return baseUrl;
}