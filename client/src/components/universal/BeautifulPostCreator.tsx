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
import { 
  createTypingParticle, 
  createRipple, 
  createConfetti,
  magneticButton,
  resetMagneticButton 
} from '@/utils/microInteractions';

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
        credentials: 'include',
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

      // Trigger confetti celebration
      createConfetti();

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

    // If custom submit handler is provided (for memories feed), use it
    if (onSubmit) {
      onSubmit({
        content,
        emotions: [], // BeautifulPostCreator doesn't have emotions
        location: location || undefined,
        tags: selectedTags,
        mentions: [], // TODO: extract mentions from content
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
      setIsRecommendation(false);
      setRecommendationType('');
      setPriceRange('');
      
      // Show success notification
      toast({
        title: "Memory created! 🎉",
        description: "Your moment has been shared",
      });
      
      // Trigger confetti
      createConfetti();
      
      onPostCreated?.();
      return;
    }

    // Default behavior: use internal mutation
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

  // Handle typing with particle effects
  const handleTyping = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    createTypingParticle(e);
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
            {/* Enhanced Text input with animated placeholder */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
            </div>

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
                          <option value="restaurant">Restaurant</option>
                          <option value="cafe">Café</option>
                          <option value="hotel">Hotel</option>
                          <option value="venue">Venue</option>
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
                    className="w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500/50 focus:border-transparent transition-all glassmorphic-input"
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
                  <label htmlFor="visibility-select" className="text-sm text-gray-600">Visibility:</label>
                  <div className="relative flex-1 max-w-xs">
                    <select
                      id="visibility-select"
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-full p-2 pl-10 pr-8 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-turquoise-500/50 focus:border-transparent text-sm font-medium text-gray-700 appearance-none cursor-pointer transition-all hover:border-gray-300"
                    >
                      <option value="public">Public - Anyone can see</option>
                      <option value="friends">Friends - Only friends can see</option>
                      <option value="private">Private - Only you can see</option>
                    </select>
                    
                    {/* Icon based on selected visibility */}
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {visibility === 'public' && <Globe className="h-4 w-4 text-turquoise-600" />}
                      {visibility === 'friends' && <Users className="h-4 w-4 text-blue-600" />}
                      {visibility === 'private' && <Lock className="h-4 w-4 text-gray-600" />}
                    </div>
                    
                    {/* Dropdown arrow */}
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Action bar with better visual design */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="group relative">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="relative p-4 rounded-2xl bg-gradient-to-br from-turquoise-50 to-turquoise-100 hover:from-turquoise-100 hover:to-turquoise-200 text-turquoise-600 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  >
                    <Camera className="h-6 w-6" />
                    <div className="absolute -top-2 -right-2 px-2 py-1 bg-turquoise-600 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      Photo
                    </div>
                  </button>
                </div>
                
                <div className="group relative">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-600 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  >
                    <Video className="h-6 w-6" />
                    <div className="absolute -top-2 -right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      Video
                    </div>
                  </button>
                </div>

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

                <div className="group relative">
                  <button
                    className="relative p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-600 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                  >
                    <Mic className="h-6 w-6" />
                    <div className="absolute -top-2 -right-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      Voice
                    </div>
                  </button>
                </div>
              </div>

              <button
                onClick={(e) => {
                  createRipple(e);
                  handleSubmit();
                }}
                onMouseMove={magneticButton}
                onMouseLeave={resetMagneticButton}
                disabled={createPostMutation.isPending || (!content.trim() && mediaFiles.length === 0)}
                className="group relative px-10 py-4 overflow-hidden rounded-full font-bold text-lg shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 magnetic-button ripple-container"
                style={{
                  background: createPostMutation.isPending || (!content.trim() && mediaFiles.length === 0) 
                    ? 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)'
                    : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-turquoise-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center space-x-3 text-white">
                  {createPostMutation.isPending ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Sharing your moment...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 animate-pulse" />
                      <span>Share Memory</span>
                      <span className="text-2xl">→</span>
                    </>
                  )}
                </span>
              </button>
            </div>
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