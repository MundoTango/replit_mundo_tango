import React, { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete';
import { Progress } from '@/components/ui/progress';
import { InternalUploader } from '@/components/upload/InternalUploader';
// ESA Layer 58: Cloudinary removed per user request - single upload option only
import { extractMentions } from '@/utils/mentionUtils';
// VideoURLInput removed per user request
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MapPin, 
  Image, 
  Video, 
  Hash, 
  Smile, 
  Sparkles,
  X,
  ChevronDown,
  Globe,
  Lock,
  Users,
  Loader,
  AlertCircle,
  Lightbulb,
  Camera,
  Mic,
  Eye,
  EyeOff,
  Cloud,
  Upload,
  Link2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import EmojiPicker from 'emoji-picker-react';
// Temporarily disabled microInteractions to fix performance issue
// import { 
//   createTypingParticle, 
//   createRipple, 
//   createConfetti,
//   magneticButton,
//   resetMagneticButton 
// } from '@/utils/microInteractions';

interface PostCreatorProps {
  context?: {
    type: 'feed' | 'event' | 'group' | 'memory';
    id?: string;
    name?: string;
  };
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  onPostCreated?: () => void;
  // Custom submit handler for memories feed integration
  onSubmit?: (data: {
    content: string;
    emotions?: string[];
    location?: string;
    tags: string[];
    mentions?: string[];
    media: File[];
    visibility: string;
    isRecommendation: boolean;
    recommendationType?: string;
    priceRange?: string;
  }) => void;
}

export default function BeautifulPostCreator({ 
  context = { type: 'feed' }, 
  user,
  onPostCreated,
  onSubmit 
}: PostCreatorProps) {
  const [content, setContent] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  // ESA Layer 13: Internal-only media URLs system
  const [internalMediaUrls, setInternalMediaUrls] = useState<string[]>([]);
  const [cloudMediaUrls, setCloudMediaUrls] = useState<string[]>([]);
  const [isRecommendation, setIsRecommendation] = useState(false);
  const [recommendationType, setRecommendationType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Location states
  const [location, setLocation] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationTimeoutRef = useRef<NodeJS.Timeout>();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // ESA LIFE CEO 61x21 - @mention functionality
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  
  // Fetch users for @mention autocomplete
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users/search', mentionSearch],
    queryFn: async () => {
      if (!mentionSearch || mentionSearch.length < 1) return [];
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(mentionSearch)}`);
      if (!response.ok) return [];
      const result = await response.json();
      return result.data || [];
    },
    enabled: showMentions && mentionSearch.length > 0
  });

  // Predefined tags with emojis
  const predefinedTags = [
    { value: 'milonga', label: 'Milonga', emoji: '💃' },
    { value: 'practica', label: 'Práctica', emoji: '🎯' },
    { value: 'performance', label: 'Performance', emoji: '🎭' },
    { value: 'workshop', label: 'Workshop', emoji: '📚' },
    { value: 'festival', label: 'Festival', emoji: '🎪' },
    { value: 'travel', label: 'Travel', emoji: '✈️' },
    { value: 'music', label: 'Music', emoji: '🎵' },
    { value: 'fashion', label: 'Fashion', emoji: '👗' }
  ];

  // Get user's location using browser API
  const getCurrentLocation = useCallback(() => {
    setLocationLoading(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            setLocation(data.display_name);
            toast({
              title: "Location found! 📍",
              description: data.display_name.split(',').slice(0, 2).join(','),
            });
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        
        setLocationLoading(false);
      },
      (error) => {
        setLocationError('Unable to get location');
        setLocationLoading(false);
        toast({
          title: "Location access denied",
          description: "Please enable location services",
          variant: "destructive"
        });
      }
    );
  }, [toast]);

  // Search locations with debounce
  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    // Clear previous timeout
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }

    // Set new timeout for debounce
    locationTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
        );
        const data = await response.json();
        setLocationSuggestions(data);
        setShowLocationSuggestions(true);
      } catch (error) {
        console.error('Location search error:', error);
      }
    }, 500); // 500ms debounce
  }, []);

  // Handle location input change
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    searchLocations(value);
  };

  // Select location from suggestions
  const selectLocation = (suggestion: any) => {
    setLocation(suggestion.display_name);
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
  };

  // Handle media upload
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ESA LIFE CEO 61x21 - DISABLED TO PREVENT SERVER UPLOADS
    console.error('❌ BLOCKED: Old file upload mechanism triggered!');
    toast({
      title: "⚠️ Use Cloud Upload Instead",
      description: "Please use the '☁️ Cloud Upload' button for all media uploads",
      variant: "destructive"
    });
    return; // Block completely
    const files = Array.from(e.target.files || []);
    console.log('📸 Files selected:', files.length, files);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 500 * 1024 * 1024; // 500MB for videos
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: "Please upload only images or videos",
          variant: "destructive"
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 500MB limit`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) {
      console.log('❌ No valid files after filtering');
      return;
    }

    console.log('✅ Valid files:', validFiles);
    setMediaFiles(prev => {
      const updated = [...prev, ...validFiles];
      console.log('📁 Media files state updated:', updated);
      return updated;
    });

    // Create previews - handle videos differently
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        // For images, create data URL preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        // For videos, create object URL for preview
        const videoUrl = URL.createObjectURL(file);
        setMediaPreviews(prev => [...prev, videoUrl]);
      }
    });
    
    // Show success message
    toast({
      title: "Media added! 📸",
      description: `${validFiles.length} file(s) ready to upload`,
    });
    
    // Reset the file input to allow re-selecting the same file
    fileInputRef.current!.value = '';
  };

  // Create post mutation - now handles cloud URLs instead of file uploads
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      // Starting post creation
      console.log('📦 Post data received:', postData);
      console.log('🏠 Internal media URLs:', internalMediaUrls.length);
      console.log('📸 Legacy media files:', mediaFiles.length);
      
      // ESA Layer 13: Internal URLs only - single reliable upload solution
      if (internalMediaUrls.length > 0) {
        // Use internal URLs directly - no file upload needed!
        console.log('🏠 Using Internal URLs - reliable local upload!');
        const endpoint = '/api/posts/direct'; // Direct endpoint that accepts URLs only
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...postData,
            mediaUrls: internalMediaUrls, // Send internal URLs directly
            mediaType: 'internal'
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Server response error:', response.status, errorText);
          throw new Error(`Failed to create post: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Post created successfully:', result);
        return result;
      }
      // ESA LIFE CEO 61x21 - COMPLETELY BLOCK ALL FILE UPLOADS
      else if (mediaFiles.length > 0) {
        console.error('❌ ESA LIFE CEO 61x21: SERVER UPLOAD BLOCKED!');
        console.error('Files detected:', mediaFiles);
        
        // Clear the files immediately
        setMediaFiles([]);
        setMediaPreviews([]);
        
        toast({
          title: "❌ Server Upload Blocked!",
          description: "Please use the 'Upload Media Files' button for ALL media. Direct file uploads are disabled.",
          variant: "destructive"
        });
        
        setIsUploading(false);
        setUploadProgress(0);
        
        // Force stop any ongoing uploads
        throw new Error('ESA LIFE CEO 61x21: Server uploads are completely disabled. Use Internal Upload only.');
        
        /* DISABLED - DO NOT USE SERVER UPLOADS
        const formData = new FormData();
        formData.append('content', postData.content);
        formData.append('visibility', postData.visibility);
        // ESA LIFE CEO 61x21 - Ensure location is properly sent
        const locationValue = location || postData.location || '';
        // Location being sent
        formData.append('location', locationValue);
        formData.append('tags', JSON.stringify(postData.tags));
        formData.append('isRecommendation', String(postData.isRecommendation));
        if (postData.recommendationType) formData.append('recommendationType', postData.recommendationType);
        if (postData.priceRange) formData.append('priceRange', postData.priceRange);
        
        // ESA LIFE CEO 61x21 - Append each media file with debug logging
        mediaFiles.forEach((file, index) => {
          // Appending file to upload
          formData.append('media', file);
        });
        */
        
        // ESA LIFE CEO 61x21 - FormData logging disabled (server uploads blocked)
        
        // ESA LIFE CEO 61x21 FIX - Use /api/memories for memories feed
        const uploadEndpoint = context.type === 'memory' || context.type === 'feed' ? '/api/memories' : '/api/posts';
        console.log(`📤 Sending FormData to ${uploadEndpoint} with progress tracking`);
        
        // Use XMLHttpRequest for REAL progress tracking only (no simulation)
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          // Calculate total size for progress estimation
          const totalSize = mediaFiles.reduce((sum, file) => sum + file.size, 0);
          console.log(`📦 Total upload size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
          
          // FIXED upload progress tracking
          let lastProgress = 0;
          let progressInterval: NodeJS.Timeout;
          console.log('🚀 Initializing upload progress tracking');
          
          // Start progress immediately when upload begins
          setIsUploading(true);
          setUploadProgress(1);
          
          // ESA LIFE CEO 61x21 FIX: Simulate progress based on file size and estimated upload speed
          const startTime = Date.now();
          const estimatedBytesPerSecond = 1024 * 1024 * 2; // Estimate 2MB/s upload speed
          const estimatedDuration = (totalSize / estimatedBytesPerSecond) * 1000; // in milliseconds
          
          // Update progress smoothly every 100ms
          progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            // ESA LIFE CEO 61x21 FIX - Allow progress to reach 100%
            const estimatedProgress = Math.min(100, Math.round((elapsed / estimatedDuration) * 100));
            
            if (estimatedProgress > lastProgress) {
              lastProgress = estimatedProgress;
              setUploadProgress(estimatedProgress);
              console.log(`📊 Upload progress: ${estimatedProgress}%`);
            }
          }, 100);
          
          xhr.upload.addEventListener('progress', (e) => {
            console.log(`📡 Progress Event:`, {
              loaded: e.loaded,
              total: e.total,
              computable: e.lengthComputable,
              percentage: e.total > 0 ? Math.round((e.loaded / e.total) * 100) : 0
            });
            
            if (e.lengthComputable && e.total > 0) {
              // If we get real progress, use it instead
              clearInterval(progressInterval);
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              if (percentComplete >= lastProgress) {
                lastProgress = percentComplete;
                const mbLoaded = (e.loaded / 1024 / 1024).toFixed(2);
                const mbTotal = (e.total / 1024 / 1024).toFixed(2);
                console.log(`📊 REAL Progress: ${percentComplete}% (${mbLoaded}MB / ${mbTotal}MB)`);
                setUploadProgress(percentComplete);
                
                // Ensure we show 100% when bytes are complete
                if (e.loaded >= e.total && percentComplete >= 99) {
                  console.log('✅ Upload bytes complete, forcing 100%');
                  setUploadProgress(100);
                }
              }
            }
          }, false);
          
          // Monitor upload start
          xhr.upload.addEventListener('loadstart', () => {
            console.log('📤 Upload started');
            setUploadProgress(1); // Show minimal progress to indicate start
          });
          
          xhr.addEventListener('load', () => {
            clearInterval(progressInterval); // Clear the progress interval
            // XHR load event triggered
            
            if (xhr.status >= 200 && xhr.status < 300) {
              // Success - show 100% progress
              setUploadProgress(100);
              // Debug log removed
              
              try {
                const response = JSON.parse(xhr.responseText);
                // Debug log removed
                
                // Give user time to see 100% before resetting
                setTimeout(() => {
                  setIsUploading(false);
                  setUploadProgress(0);
                  // Debug log removed
                }, 1500);
                
                resolve(response);
              } catch (e) {
                // Error log removed
                setIsUploading(false);
                setUploadProgress(0);
                reject(new Error('Invalid response format'));
              }
            } else {
              // Error log removed
              setIsUploading(false);
              setUploadProgress(0);
              reject(new Error(`Failed to create post: ${xhr.status}`));
            }
          });
          
          xhr.addEventListener('error', () => {
            clearInterval(progressInterval); // Clear the progress interval
            setIsUploading(false);
            setUploadProgress(0);
            // Error log removed
            reject(new Error('Network error during upload'));
          });
          
          xhr.addEventListener('abort', () => {
            clearInterval(progressInterval); // Clear the progress interval
            setIsUploading(false);
            setUploadProgress(0);
            // Debug log removed
            reject(new Error('Upload cancelled'));
          });
          
          // ESA LIFE CEO 61x21 FIX - Use /api/posts endpoint for all posts
          const endpoint = '/api/posts';
          // Debug log removed
          xhr.open('POST', endpoint);
          xhr.withCredentials = true;
          xhr.timeout = 0; // ESA LIFE CEO 61x21 - Disable client timeout, let server handle it
          
          // ESA LIFE CEO 61x21 - Removed client timeout handler since we disabled timeout
          
          // Log xhr state changes for debugging
          xhr.onreadystatechange = () => {
            console.log(`🔄 XHR State: ${xhr.readyState} - Status: ${xhr.status}`);
          };
          
          // Create FormData for server upload (legacy path - blocked)
          const serverFormData = new FormData();
          xhr.send(serverFormData);
        });
      } else {
        // No media files, use JSON
        // ESA LIFE CEO 61x21 FIX - Use /api/posts endpoint for all posts
        const endpoint = '/api/posts';
        // Debug log removed
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(postData)
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('❌ API Error:', response.status, errorData);
          throw new Error(`Failed to create post: ${response.status} - ${errorData}`);
        }
        
        const result = await response.json();
        console.log('✅ Text-only post created successfully:', result);
        return result;
      }
    },
    onSuccess: (response) => {
      console.log('✅ ESA Layer 13: Post mutation success!', response);
      toast({
        title: "Post created! 🎉", 
        description: "Your memory has been shared",
      });

      // Trigger confetti celebration
      // createConfetti(); // Temporarily disabled for performance

      // Reset form
      setContent('');
      setLocation('');
      setSelectedTags([]);
      setMediaFiles([]);
      setMediaPreviews([]);
      setCloudMediaUrls([]); // Reset cloud URLs
      setIsRecommendation(false);
      setUploadProgress(0);
      setIsUploading(false);

      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] }); // Keep both for compatibility
      onPostCreated?.();
    },
    onError: (error: any) => {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Error creating post",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    console.log('🎯 ESA Layer 13: handleSubmit called!');
    console.log('📝 Content:', content);
    console.log('📍 Location:', location);
    console.log('📸 Media files:', mediaFiles.length);
    console.log('🏷️ Tags:', selectedTags);
    console.log('👁️ Visibility:', visibility);
    console.log('💡 Is recommendation:', isRecommendation);
    console.log('🔄 onSubmit prop exists?', !!onSubmit);
    
    // Don't allow submission while uploading
    if (isUploading) {
      toast({
        title: "Upload in progress",
        description: "Please wait for the upload to complete",
        variant: "destructive"
      });
      return;
    }
    
    if (!content.trim() && mediaFiles.length === 0 && cloudMediaUrls.length === 0) {
      toast({
        title: "Add some content",
        description: "Write something or add a photo",
        variant: "destructive"
      });
      return;
    }

    // If custom submit handler is provided (for memories feed), use it
    if (onSubmit) {
      console.log('🔄 ESA Layer 13: Using custom onSubmit handler!');
      onSubmit({
        content,
        emotions: [], // BeautifulPostCreator doesn't have emotions
        location: location || undefined,
        tags: selectedTags,
        mentions: extractMentions(content).map(m => m.display), // ESA LIFE CEO 61x21 - Extract mentions
        media: mediaFiles,
        visibility,
        isRecommendation,
        recommendationType,
        priceRange
      });

      // Reset form after submission
      setContent('');
      setLocation('');
      setSelectedTags([]);
      setMediaFiles([]);
      setMediaPreviews([]);
      setCloudMediaUrls([]); // Reset cloud URLs
      setIsRecommendation(false);
      setRecommendationType('');
      setPriceRange('');
      
      // Show success notification
      toast({
        title: "Memory created! 🎉",
        description: "Your moment has been shared",
      });
      
      // Trigger confetti
      // createConfetti(); // Temporarily disabled for performance
      
      onPostCreated?.();
      return;
    }

    // Default behavior: use internal mutation
    console.log('✅ ESA Layer 13: Using default mutation path!');
    const postData = {
      content,
      visibility,
      tags: selectedTags,
      location: location || undefined,
      contextType: context.type,
      contextId: context.id,
      isRecommendation,
      recommendationData: isRecommendation ? {
        type: recommendationType,
        priceRange
      } : undefined
    };
    console.log('🚀 Submitting post via mutation:', postData);
    createPostMutation.mutate(postData);
  };

  // Handle typing with particle effects
  const handleTyping = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // createTypingParticle(e); // Temporarily disabled for performance
  };

  return (
    <div className="w-full">
      <Card className="relative overflow-hidden border-0 glassmorphic-card beautiful-hover shadow-2xl">
        {/* Enhanced gradient background with animation */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-turquoise-400/30 via-cyan-400/20 to-blue-500/30 animate-gradient" />
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/10 via-transparent to-pink-400/10 animate-gradient-reverse" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-turquoise-300/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-float-delayed" />
        </div>
        
        <div className="relative z-10 p-8">
          {/* Enhanced Header with better styling */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-turquoise-400 to-blue-600 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-turquoise-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-xl transform transition-transform group-hover:scale-110">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover border-2 border-white/50" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">{user?.name}</h3>
              <p className="text-sm text-gray-500">@{user?.username}</p>
            </div>
          </div>

          {/* Main content area */}
          <div className="space-y-5">
            {/* Visibility Dropdown - Added above post body */}
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-gray-600">Post visibility:</span>
              <div className="relative">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-turquoise-300 focus:outline-none focus:ring-2 focus:ring-turquoise-400/30 focus:border-turquoise-400 transition-all cursor-pointer"
                >
                  <option value="public">🌍 Public</option>
                  <option value="friends">👥 Friends Only</option>
                  <option value="private">🔒 Private</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Enhanced Text input with animated placeholder */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => {
                  const value = e.target.value;
                  const cursorPos = e.target.selectionStart || 0;
                  setContent(value);
                  setCursorPosition(cursorPos);
                  
                  // ESA LIFE CEO 61x21 - Detect @mention
                  const lastAtIndex = value.lastIndexOf('@', cursorPos - 1);
                  if (lastAtIndex !== -1 && cursorPos > lastAtIndex) {
                    const searchText = value.substring(lastAtIndex + 1, cursorPos);
                    if (!searchText.includes(' ')) {
                      setMentionSearch(searchText);
                      setShowMentions(true);
                    } else {
                      setShowMentions(false);
                    }
                  } else {
                    setShowMentions(false);
                  }
                }}
                onKeyDown={handleTyping}
                placeholder="✨ Share your tango moment..."
                className="w-full min-h-[120px] p-5 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-turquoise-400/30 focus:border-transparent transition-all placeholder:text-gray-400 placeholder:text-lg glassmorphic-input-enhanced text-lg leading-relaxed font-medium text-gray-800"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {content.length > 0 && `${content.length} characters`}
              </div>
              
              {/* ESA LIFE CEO 61x21 - @Mention Dropdown */}
              {showMentions && users.length > 0 && (
                <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-48 overflow-y-auto">
                  {users.map((user: any) => (
                    <button
                      key={user.id}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-turquoise-50 flex items-center gap-2 transition-colors"
                      onClick={() => {
                        const lastAtIndex = content.lastIndexOf('@', cursorPosition - 1);
                        if (lastAtIndex !== -1) {
                          const newContent = 
                            content.substring(0, lastAtIndex) +
                            `@${user.username} ` +
                            content.substring(cursorPosition);
                          setContent(newContent);
                          setShowMentions(false);
                          setMentionSearch('');
                        }
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-turquoise-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">@{user.username}</div>
                        {user.email && (
                          <div className="text-xs text-gray-500">{user.email}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Media previews - supports both cloud URLs and local files */}
            {mediaPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {mediaPreviews.map((preview, index) => {
                  // Check if this is an internal URL or local file
                  const isInternalUrl = internalMediaUrls.includes(preview) || preview.includes('/uploads/');
                  const file = !isInternalUrl ? mediaFiles[index] : null;
                  const isVideo = isInternalUrl ? preview.includes('.mp4') || preview.includes('.mov') || preview.includes('.webm') : file?.type?.startsWith('video/');
                  
                  return (
                    <div key={index} className="relative group rounded-lg overflow-hidden bg-gray-100">
                      {isVideo ? (
                        <div className="relative w-full h-32">
                          <video 
                            src={preview} 
                            className="w-full h-full object-cover"
                            controls
                            muted
                            playsInline
                          />
                          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            Video
                          </div>
                        </div>
                      ) : (
                        <img src={preview} alt={`Media ${index + 1}`} className="w-full h-32 object-cover" />
                      )}
                      <button
                        onClick={() => {
                          // Handle removal for internal and local media
                          const isInternalUrl = internalMediaUrls.includes(preview) || preview.includes('/uploads/');
                          
                          if (isInternalUrl) {
                            // Remove from internal URLs
                            setInternalMediaUrls(prev => prev.filter(url => url !== preview));
                          } else {
                            // Remove from local files
                            setMediaFiles(prev => prev.filter((_, i) => i !== index));
                          }
                          
                          setMediaPreviews(prev => {
                            // Clean up object URLs for videos to prevent memory leaks
                            if (!isInternalUrl && isVideo && preview.startsWith('blob:')) {
                              URL.revokeObjectURL(preview);
                            }
                            return prev.filter((_, i) => i !== index);
                          });
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Enhanced Recommendation toggle with better design */}
            <div className="relative">
              <button
                onClick={() => setIsRecommendation(!isRecommendation)}
                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all duration-300 group ${
                  isRecommendation 
                    ? 'bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 border-2 border-amber-300 shadow-lg transform scale-[1.02]' 
                    : 'bg-white/70 hover:bg-white border border-gray-200/60 hover:border-amber-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    isRecommendation 
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-amber-100 group-hover:text-amber-600'
                  }`}>
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <span className={`block font-semibold transition-colors ${
                      isRecommendation ? 'text-amber-800' : 'text-gray-700 group-hover:text-amber-700'
                    }`}>
                      Share a recommendation
                    </span>
                    <span className="text-xs text-gray-500">
                      Help others discover amazing places
                    </span>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-all duration-300 ${
                  isRecommendation ? 'rotate-180 text-amber-600' : 'group-hover:text-amber-500'
                }`} />
              </button>

              {isRecommendation && (
                <div className="mt-3 p-5 bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-50 backdrop-blur-sm rounded-2xl space-y-4 border border-amber-200/40 shadow-inner animate-slide-in">
                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-sm font-semibold text-amber-800 mb-2 block">What are you recommending?</span>
                      <div className="relative">
                        <select
                          value={recommendationType}
                          onChange={(e) => setRecommendationType(e.target.value)}
                          className="w-full p-4 pl-12 rounded-xl bg-white/90 backdrop-blur-sm border border-amber-200/60 focus:outline-none focus:ring-4 focus:ring-amber-400/30 font-medium text-gray-800 appearance-none cursor-pointer transition-all hover:border-amber-300"
                        >
                          <option value="">Choose a category...</option>
                          <option value="restaurant">🍽️ Restaurant</option>
                          <option value="cafe">☕ Café</option>
                          <option value="hotel">🏨 Hotel</option>
                          <option value="venue">💃 Venue</option>
                        </select>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                          {recommendationType === 'restaurant' ? '🍽️' : 
                           recommendationType === 'cafe' ? '☕' :
                           recommendationType === 'hotel' ? '🏨' :
                           recommendationType === 'venue' ? '🎭' : '📍'}
                        </div>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-600 pointer-events-none" />
                      </div>
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-amber-800 mb-2 block">Price range</span>
                      <div className="grid grid-cols-3 gap-2">
                        {['$', '$$', '$$$'].map((price) => (
                          <button
                            key={price}
                            onClick={() => setPriceRange(price)}
                            className={`p-3 rounded-xl font-bold transition-all duration-200 ${
                              priceRange === price
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg transform scale-105'
                                : 'bg-white/80 text-gray-700 hover:bg-amber-100 hover:text-amber-700 border border-amber-200/40'
                            }`}
                          >
                            <div className="text-lg">{price}</div>
                            <div className="text-xs font-normal mt-1">
                              {price === '$' ? 'Budget' : price === '$$' ? 'Moderate' : 'Upscale'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Location input using LocationAutocomplete */}
            <div className="relative">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <LocationAutocomplete
                    value={location}
                    onChange={(value, details) => {
                      // Debug log removed
                      // Debug log removed
                      // Debug log removed
                      
                      // Update location state with full value
                      setLocation(value);
                      
                      // ESA LIFE CEO 61x21 - Store location details for recommendations
                      if (details && details.type === 'business') {
                        // For businesses, store the full address for better recommendations
                        const fullLocation = `${details.display}${details.address ? ', ' + details.address : ''}`;
                        // Debug log removed
                      }
                      
                      // Log state update
                      // Debug log removed
                      
                      if (details) {
                        // Enhanced location data from LocationAutocomplete
                        // Debug log removed
                      }
                      
                      // Verify state update after next render
                      setTimeout(() => {
                        // Debug log removed
                      }, 100);
                    }}
                    placeholder="Add location or business (restaurants, bars, cafes...)"
                    className="w-full glassmorphic-input"
                    includeBusinesses={true}
                    businessTypes={['restaurant', 'bar', 'cafe', 'club', 'store', 'hotel', 'venue']}
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="shrink-0 border-gray-200"
                >
                  {locationLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {locationError && (
                <p className="mt-1 text-xs text-red-500 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {locationError}
                </p>
              )}
            </div>

            {/* Enhanced Tags with better styling */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Hash className="h-4 w-4 text-turquoise-500" />
                <span>Add tags to your memory</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {predefinedTags.map((tag) => (
                  <button
                    key={tag.value}
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag.value) 
                          ? prev.filter(t => t !== tag.value)
                          : [...prev, tag.value]
                      );
                    }}
                    className={`group relative px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      selectedTags.includes(tag.value)
                        ? 'bg-gradient-to-r from-turquoise-500 to-cyan-600 text-white shadow-xl hover:shadow-2xl hover:from-turquoise-600 hover:to-cyan-700'
                        : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200/60 hover:border-turquoise-300 shadow-sm hover:shadow-lg'
                    }`}
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <span className="text-lg transform group-hover:rotate-12 transition-transform">{tag.emoji}</span>
                      <span>{tag.label}</span>
                    </span>
                    {selectedTags.includes(tag.value) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-turquoise-600 to-cyan-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ESA LIFE CEO 61x21 - Enhanced Upload Progress Bar */}
          {(isUploading || uploadProgress > 0) && (
            <div className="mt-4 p-6 bg-gradient-to-r from-turquoise-100 to-cyan-100 rounded-xl border-2 border-turquoise-400 shadow-2xl animate-pulse">
              <div className="flex items-center justify-between text-base mb-4">
                <span className="text-gray-800 flex items-center gap-3">
                  <Loader className="h-7 w-7 animate-spin text-turquoise-700" />
                  <span className="font-bold text-lg">Uploading your media...</span>
                </span>
                <span className="font-bold text-3xl text-turquoise-800">{uploadProgress}%</span>
              </div>
              <div className="relative h-8 bg-gray-300 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-turquoise-500 via-cyan-500 to-blue-500 transition-all duration-300 ease-out rounded-full shadow-lg"
                  style={{ 
                    width: `${uploadProgress}%`,
                    boxShadow: '0 4px 6px rgba(0, 184, 217, 0.5)'
                  }}
                >
                  {/* Animated stripe effect */}
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-3 flex items-center gap-2 font-medium">
                📤 Upload progress
                {uploadProgress > 0 && uploadProgress < 100 && `: ${uploadProgress}%`}
                {uploadProgress === 100 && ': Complete! Processing...'}
              </p>
            </div>
          )}

          {/* Enhanced Action bar with better visual design */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* ESA Layer 13: Single Internal Upload System - Reliable & Fast */}
                <InternalUploader
                  onUploadComplete={(files) => {
                    const urls = files.map(f => f.url);
                    setInternalMediaUrls(prev => [...prev, ...urls]);
                    setMediaPreviews(prev => [...prev, ...urls]);
                    console.log(`[Internal Upload] ✅ Added ${files.length} files to post`);
                  }}
                  maxFiles={30}
                  maxFileSize={500}
                  className=""
                />

                <div className="group relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-600 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  >
                    <Smile className="h-6 w-6" />
                    <div className="absolute -top-2 -right-2 px-2 py-1 bg-amber-600 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      Emoji
                    </div>
                  </button>
                </div>


              </div>

              <button
                onClick={(e) => {
                  // createRipple(e); // Temporarily disabled for performance
                  handleSubmit();
                }}
                // onMouseMove={magneticButton} // Temporarily disabled for performance
                // onMouseLeave={resetMagneticButton} // Temporarily disabled for performance
                disabled={createPostMutation.isPending || isUploading || (!content.trim() && internalMediaUrls.length === 0 && mediaFiles.length === 0)}
                className="group relative px-5 py-2 overflow-hidden rounded-lg font-medium text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                style={{
                  background: createPostMutation.isPending || isUploading || (!content.trim() && mediaFiles.length === 0) 
                    ? 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)'
                    : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-turquoise-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center space-x-2 text-white">
                  {createPostMutation.isPending ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>📝 Share Memory</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* ESA LIFE CEO 61x21 - OLD FILE INPUT DISABLED - USE CLOUDINARY ONLY */}
          {/* <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            className="hidden"
          /> */}

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-50">
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg z-10"
                >
                  <X className="h-3 w-3" />
                </button>
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setContent(prev => prev + emojiData.emoji);
                    setShowEmojiPicker(false);
                  }}
                  lazyLoadEmojis
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}// ESA LIFE CEO 61x21 - Cache bust: Tue Aug 12 02:47:58 PM UTC 2025
