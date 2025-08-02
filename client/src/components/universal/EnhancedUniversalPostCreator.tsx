import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Image, 
  Video, 
  Hash, 
  Smile, 
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  Globe,
  Lock,
  Users,
  Loader,
  Check,
  AlertCircle,
  Lightbulb,
  Camera,
  Mic,
  Calendar,
  Heart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import EmojiPicker from 'emoji-picker-react';
import GoogleMapsLocationInput from './GoogleMapsLocationInput';
import { motion, AnimatePresence } from 'framer-motion';

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
}

export default function EnhancedUniversalPostCreator({ 
  context = { type: 'feed' }, 
  user,
  onPostCreated 
}: PostCreatorProps) {
  const [content, setContent] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isRecommendation, setIsRecommendation] = useState(false);
  const [recommendationType, setRecommendationType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [bestFor, setBestFor] = useState<string[]>([]);
  
  // Location states
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive"
      });
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            setLocation(data.display_name);
            
            // Animate location success
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
        setLocationLoading(false);
        toast({
          title: "Location access denied",
          description: "Please enable location services to use this feature",
          variant: "destructive"
        });
      }
    );
  }, [toast]);

  // Handle media upload
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Some files were skipped",
        description: "Only images and videos under 10MB are allowed",
        variant: "destructive"
      });
    }

    setMediaFiles(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove media
  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      // Success animation
      toast({
        title: "Post created! 🎉",
        description: "Your memory has been shared with the community",
      });

      // Reset form
      setContent('');
      setLocation('');
      setCoordinates(null);
      setSelectedTags([]);
      setMediaFiles([]);
      setMediaPreviews([]);
      setIsRecommendation(false);
      setShowAdvanced(false);

      // Refresh feed
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      onPostCreated?.();
    },
    onError: () => {
      toast({
        title: "Error creating post",
        description: "Please try again",
        variant: "destructive"
      });
    }
  });

  // Handle post submission
  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast({
        title: "Add some content",
        description: "Write something or add a photo to share",
        variant: "destructive"
      });
      return;
    }

    const postData = {
      content,
      visibility,
      tags: selectedTags,
      location: location || undefined,
      coordinates: coordinates || undefined,
      contextType: context.type,
      contextId: context.id,
      isRecommendation,
      recommendationData: isRecommendation ? {
        type: recommendationType,
        priceRange,
        bestFor
      } : undefined,
      mediaCount: mediaFiles.length
    };

    createPostMutation.mutate(postData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-turquoise-500/5 via-cyan-500/5 to-blue-500/5 animate-gradient" />
        
        <div className="relative z-10 p-6">
          {/* Header with user info */}
          <div className="flex items-start space-x-4 mb-4">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-turquoise-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </motion.div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{user?.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Globe className="h-3 w-3" />
                <span>Sharing {visibility === 'public' ? 'publicly' : `with ${visibility}`}</span>
              </div>
            </div>

            {/* Close button if in modal */}
            {context.type !== 'feed' && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => {/* handle close */}}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Main content area */}
          <div className="space-y-4">
            {/* Text input with auto-resize */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your tango moment..."
                className="w-full min-h-[120px] p-4 bg-gray-50/50 border-0 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-turquoise-500/50 transition-all placeholder:text-gray-400"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
              
              {/* Character count */}
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {content.length} / 500
              </div>
            </div>

            {/* Media previews */}
            {mediaPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {mediaPreviews.map((preview, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group rounded-lg overflow-hidden"
                  >
                    <img 
                      src={preview} 
                      alt={`Media ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recommendation toggle */}
            <motion.div
              initial={false}
              animate={{ height: isRecommendation ? 'auto' : 48 }}
              className="overflow-hidden"
            >
              <button
                onClick={() => setIsRecommendation(!isRecommendation)}
                className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                  isRecommendation 
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Lightbulb className={`h-5 w-5 ${isRecommendation ? 'text-amber-600' : 'text-gray-400'}`} />
                  <span className={isRecommendation ? 'text-amber-700 font-medium' : 'text-gray-600'}>
                    Share a recommendation
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isRecommendation ? 'rotate-180' : ''}`} />
              </button>

              {isRecommendation && (
                <div className="p-4 space-y-3">
                  <select
                    value={recommendationType}
                    onChange={(e) => setRecommendationType(e.target.value)}
                    className="w-full p-2 rounded-lg border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="">Select type...</option>
                    <option value="restaurant">🍽️ Restaurant</option>
                    <option value="cafe">☕ Café</option>
                    <option value="hotel">🏨 Hotel</option>
                    <option value="venue">🎭 Venue</option>
                    <option value="shop">🛍️ Shop</option>
                    <option value="service">💼 Service</option>
                  </select>

                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full p-2 rounded-lg border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="">Price range...</option>
                    <option value="$">$ - Budget friendly</option>
                    <option value="$$">$$ - Moderate</option>
                    <option value="$$$">$$$ - Upscale</option>
                    <option value="$$$$">$$$$ - Luxury</option>
                  </select>
                </div>
              )}
            </motion.div>

            {/* Location input with Google Maps */}
            <div className="relative">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <GoogleMapsLocationInput
                    value={location}
                    onChange={(newLocation, newCoordinates) => {
                      setLocation(newLocation);
                      if (newCoordinates) {
                        setCoordinates(newCoordinates);
                      }
                    }}
                    placeholder="Search for a business or place..."
                    className="bg-gray-50 border-0 focus:ring-turquoise-500"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="shrink-0"
                >
                  {locationLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </div>


            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {predefinedTags.map((tag) => (
                  <motion.button
                    key={tag.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag.value) 
                          ? prev.filter(t => t !== tag.value)
                          : [...prev, tag.value]
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      selectedTags.includes(tag.value)
                        ? 'bg-turquoise-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1">{tag.emoji}</span>
                    {tag.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Advanced options */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <span>Advanced options</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  {/* Custom tags */}
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && customTag.trim()) {
                          setSelectedTags(prev => [...prev, customTag.trim()]);
                          setCustomTag('');
                        }
                      }}
                      placeholder="Add custom tags..."
                      className="flex-1 px-3 py-1 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-500/50"
                    />
                  </div>

                  {/* Visibility selector */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Visibility:</span>
                    <div className="flex space-x-2">
                      {[
                        { value: 'public', icon: Globe, label: 'Public' },
                        { value: 'friends', icon: Users, label: 'Friends' },
                        { value: 'private', icon: Lock, label: 'Private' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setVisibility(option.value)}
                          className={`px-3 py-1 rounded-lg flex items-center space-x-1 text-sm transition-all ${
                            visibility === option.value
                              ? 'bg-turquoise-100 text-turquoise-700'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <option.icon className="h-3 w-3" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action bar */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-turquoise-50 text-turquoise-600 transition-colors"
              >
                <Camera className="h-5 w-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
              >
                <Video className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
              >
                <Smile className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
              >
                <Mic className="h-5 w-5" />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={createPostMutation.isPending || (!content.trim() && mediaFiles.length === 0)}
              className="px-6 py-2 bg-gradient-to-r from-turquoise-500 to-blue-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Share</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            className="hidden"
          />

          {/* Emoji picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute bottom-full right-0 mb-2 z-50"
              >
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setContent(prev => prev + emojiData.emoji);
                    setShowEmojiPicker(false);
                  }}
                  theme={'light' as any}
                  lazyLoadEmojis
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}