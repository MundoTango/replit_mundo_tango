import React, { useState, useRef, useCallback } from 'react';
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
  Globe,
  Lock,
  Users,
  Loader,
  AlertCircle,
  Lightbulb,
  Camera,
  Mic
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import EmojiPicker from 'emoji-picker-react';

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

export default function BeautifulPostCreator({ 
  context = { type: 'feed' }, 
  user,
  onPostCreated 
}: PostCreatorProps) {
  const [content, setContent] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isRecommendation, setIsRecommendation] = useState(false);
  const [recommendationType, setRecommendationType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

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
      toast({
        title: "Post created! 🎉",
        description: "Your memory has been shared",
      });

      // Reset form
      setContent('');
      setLocation('');
      setSelectedTags([]);
      setMediaFiles([]);
      setMediaPreviews([]);
      setIsRecommendation(false);

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

  const handleSubmit = () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast({
        title: "Add some content",
        description: "Write something or add a photo",
        variant: "destructive"
      });
      return;
    }

    createPostMutation.mutate({
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
    });
  };

  return (
    <div className="w-full">
      <Card className="relative overflow-hidden border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        {/* Beautiful gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-turquoise-500/10 via-cyan-500/10 to-blue-500/10 animate-gradient pointer-events-none" />
        
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-turquoise-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{user?.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Globe className="h-3 w-3" />
                <span>Sharing {visibility === 'public' ? 'publicly' : `with ${visibility}`}</span>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="space-y-4">
            {/* Text input */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your tango moment..."
              className="w-full min-h-[100px] p-4 bg-gray-50/80 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-turquoise-500/50 focus:border-transparent transition-all placeholder:text-gray-400"
              style={{ 
                background: 'linear-gradient(to bottom, rgba(249, 250, 251, 0.8), rgba(255, 255, 255, 0.8))'
              }}
            />

            {/* Media previews */}
            {mediaPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {mediaPreviews.map((preview, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden">
                    <img src={preview} alt={`Media ${index + 1}`} className="w-full h-32 object-cover" />
                    <button
                      onClick={() => {
                        setMediaFiles(prev => prev.filter((_, i) => i !== index));
                        setMediaPreviews(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendation toggle */}
            <button
              onClick={() => setIsRecommendation(!isRecommendation)}
              className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                isRecommendation 
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200' 
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
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
              <div className="p-4 bg-amber-50/50 rounded-xl space-y-3">
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
                </select>

                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full p-2 rounded-lg border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="">Price range...</option>
                  <option value="$">$ - Budget</option>
                  <option value="$$">$$ - Moderate</option>
                  <option value="$$$">$$$ - Upscale</option>
                </select>
              </div>
            )}

            {/* Location input */}
            <div className="relative">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={handleLocationChange}
                    placeholder="Add location..."
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500/50 focus:border-transparent transition-all"
                  />
                  
                  {/* Location suggestions */}
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 max-h-60 overflow-y-auto">
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => selectLocation(suggestion)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                        >
                          <div className="font-medium text-gray-900">{suggestion.display_name.split(',')[0]}</div>
                          <div className="text-gray-500 text-xs">
                            {suggestion.display_name.split(',').slice(1, 3).join(',')}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
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

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
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
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                    selectedTags.includes(tag.value)
                      ? 'bg-gradient-to-r from-turquoise-500 to-cyan-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{tag.emoji}</span>
                  {tag.label}
                </button>
              ))}
            </div>

            {/* Advanced options */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <span>Advanced options</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            {showAdvanced && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
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
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <option.icon className="h-3 w-3" />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-turquoise-50 text-turquoise-600 transition-colors"
              >
                <Camera className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
              >
                <Video className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
              >
                <Smile className="h-5 w-5" />
              </button>

              <button
                className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
              >
                <Mic className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={createPostMutation.isPending || (!content.trim() && mediaFiles.length === 0)}
              className="px-6 py-2 bg-gradient-to-r from-turquoise-500 to-blue-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2 hover:scale-105 transform"
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
            </button>
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
                  theme="light"
                  lazyLoadEmojis
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}