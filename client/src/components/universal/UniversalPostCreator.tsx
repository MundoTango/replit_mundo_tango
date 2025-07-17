import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Image, 
  Video, 
  MapPin, 
  Globe, 
  Users, 
  Lock, 
  X,
  Smile,
  Link,
  Send,
  Bold,
  Italic,
  List,
  Calendar,
  Home,
  Star,
  AlertCircle
} from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import EnhancedGoogleMapsAutocomplete from '../maps/EnhancedGoogleMapsAutocomplete';
import SimplifiedLocationInput from './SimplifiedLocationInput';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { MentionsInput, Mention } from 'react-mentions';
import { useAuth } from '@/hooks/useAuth';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { extractMediaMetadata } from '@/lib/media-metadata';
import { detectLocationContext } from '@/lib/location-intelligence';

export type PostContextType = 'feed' | 'event' | 'group' | 'recommendation' | 'memory';

interface LocationContext {
  userCurrentLocation?: { lat: number; lng: number };
  userRegistrationCity?: string;
  upcomingEvents?: Array<{
    id: string;
    title: string;
    location: { lat: number; lng: number; name: string };
    startDate: Date;
  }>;
  contextualHints?: string[];
}

interface UniversalPostCreatorProps {
  context: {
    type: PostContextType;
    contextId?: string; // eventId, groupId, etc.
    parentPost?: string; // for replies/threads
    defaultLocation?: string;
    defaultVisibility?: string;
  };
  onPostCreated?: (post: any) => void;
  placeholder?: string;
  showRecommendationOptions?: boolean;
}

interface User {
  id: number;
  username: string;
  name: string;
  profileImage?: string;
}

interface MediaMetadata {
  location?: { lat: number; lng: number; accuracy?: number };
  timestamp?: Date;
  device?: string;
}

export default function UniversalPostCreator({ 
  context, 
  onPostCreated,
  placeholder = "What's happening in your tango world? Use @mentions and #hashtags...",
  showRecommendationOptions = true
}: UniversalPostCreatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [richContent, setRichContent] = useState('');
  const [location, setLocation] = useState(context.defaultLocation || '');
  const [locationData, setLocationData] = useState<any>(null);
  const [visibility, setVisibility] = useState(context.defaultVisibility || 'public');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showEmbedInput, setShowEmbedInput] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [useRichEditor, setUseRichEditor] = useState(false);
  const [locationContext, setLocationContext] = useState<LocationContext>({});
  const [mediaMetadata, setMediaMetadata] = useState<MediaMetadata[]>([]);
  
  // Recommendation-specific states
  const [isRecommendation, setIsRecommendation] = useState(false);
  const [recommendationType, setRecommendationType] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [tags, setTags] = useState<string[]>([]);
  
  const quillRef = useRef<ReactQuill>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch location context on mount
  useEffect(() => {
    const fetchLocationContext = async () => {
      try {
        // Get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocationContext(prev => ({
                ...prev,
                userCurrentLocation: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                }
              }));
            },
            (error) => console.log('Location permission denied:', error),
            { enableHighAccuracy: true }
          );
        }

        // Detect context based on user activity
        const contextData = await detectLocationContext(user?.id);
        setLocationContext(prev => ({ ...prev, ...contextData }));
      } catch (error) {
        console.error('Error fetching location context:', error);
      }
    };

    if (user?.id) {
      fetchLocationContext();
    }
  }, [user?.id]);

  // Fetch users for mention autocomplete
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users/search'],
    queryFn: async (): Promise<User[]> => {
      const response = await fetch('/api/users/search');
      if (!response.ok) throw new Error('Failed to fetch users');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Configure ReactQuill toolbar
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link'],
        ['clean']
      ]
    }
  }), []);

  // Process media files and extract metadata
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Extract metadata from each file
    const metadataPromises = newFiles.map(async (file) => {
      try {
        const metadata = await extractMediaMetadata(file);
        return metadata;
      } catch (error) {
        console.error('Error extracting metadata:', error);
        return {};
      }
    });

    const extractedMetadata = await Promise.all(metadataPromises);
    setMediaMetadata(prev => [...prev, ...extractedMetadata]);

    // If we found location in metadata, suggest it
    const locationFromMedia = extractedMetadata.find(m => m.location)?.location;
    if (locationFromMedia && !location) {
      // Reverse geocode to get address
      try {
        const response = await fetch(
          `/api/geocode/reverse?lat=${locationFromMedia.lat}&lng=${locationFromMedia.lng}`
        );
        if (response.ok) {
          const data = await response.json();
          setLocation(data.formattedAddress);
          setLocationData({
            ...data,
            source: 'media_metadata'
          });
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
      }
    }
  };

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const formData = new FormData();
      
      // Add text content
      formData.append('content', useRichEditor ? richContent : content);
      formData.append('location', location);
      formData.append('visibility', visibility);
      formData.append('contextType', context.type);
      
      if (context.contextId) {
        formData.append('contextId', context.contextId);
      }
      
      if (embedUrl) {
        formData.append('embedUrl', embedUrl);
      }

      // Add location data with full details
      if (locationData) {
        formData.append('locationData', JSON.stringify(locationData));
      }

      // Add media metadata
      if (mediaMetadata.length > 0) {
        formData.append('mediaMetadata', JSON.stringify(mediaMetadata));
      }

      // Add recommendation data if applicable
      if (isRecommendation) {
        formData.append('isRecommendation', 'true');
        formData.append('recommendationType', recommendationType);
        formData.append('rating', rating.toString());
        formData.append('tags', JSON.stringify(tags));
      }

      // Add files
      uploadedFiles.forEach((file, index) => {
        formData.append(`media_${index}`, file);
      });

      const response = await fetch('/api/posts/create-universal', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create post');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: isRecommendation ? 'Recommendation created!' : 'Post created successfully!',
      });
      
      // Reset form
      setContent('');
      setRichContent('');
      setLocation('');
      setLocationData(null);
      setUploadedFiles([]);
      setEmbedUrl('');
      setIsExpanded(false);
      setIsRecommendation(false);
      setRecommendationType('');
      setRating(0);
      setTags([]);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      if (context.type === 'group' && context.contextId) {
        queryClient.invalidateQueries({ queryKey: [`/api/groups/${context.contextId}/posts`] });
      }
      if (isRecommendation) {
        queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
      }
      
      onPostCreated?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!content.trim() && !richContent.trim()) return;
    createPostMutation.mutate({});
  };

  const recommendationTypes = [
    { value: 'restaurant', label: '🍽️ Restaurant', icon: '🍽️' },
    { value: 'venue', label: '💃 Venue', icon: '💃' },
    { value: 'school', label: '🎓 School', icon: '🎓' },
    { value: 'shop', label: '🛍️ Shop', icon: '🛍️' },
    { value: 'accommodation', label: '🏠 Accommodation', icon: '🏠' },
    { value: 'service', label: '🛠️ Service', icon: '🛠️' },
    { value: 'event', label: '📅 Event', icon: '📅' },
    { value: 'other', label: '📍 Other', icon: '📍' }
  ];

  const commonTags = [
    'authentic', 'tourist-friendly', 'locals-only', 'budget', 'luxury',
    'traditional', 'modern', 'late-night', 'family-friendly', 'romantic'
  ];

  return (
    <Card className="mb-6 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-xl overflow-hidden">
      <div className="p-6">
        {/* Context Banner */}
        {context.type !== 'feed' && (
          <div className="mb-4 p-3 bg-gradient-to-r from-turquoise-50 to-blue-50 rounded-lg flex items-center gap-2 border border-turquoise-200">
            {context.type === 'event' && <Calendar className="h-4 w-4 text-turquoise-600" />}
            {context.type === 'group' && <Users className="h-4 w-4 text-turquoise-600" />}
            {context.type === 'memory' && <Star className="h-4 w-4 text-turquoise-600" />}
            <span className="text-sm text-turquoise-700">
              Posting to {context.type}
            </span>
          </div>
        )}

        {/* Location Context Hints */}
        {locationContext.contextualHints && locationContext.contextualHints.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              {locationContext.contextualHints[0]}
            </p>
          </div>
        )}

        {/* Main Input Area */}
        {!isExpanded ? (
          <div
            onClick={() => setIsExpanded(true)}
            className="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <p className="text-gray-500">{placeholder}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-turquoise-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">@{user?.username}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Recommendation Toggle - Enhanced for better discoverability */}
            {showRecommendationOptions && context.type !== 'recommendation' && (
              <div className="mb-4 p-4 bg-gradient-to-r from-turquoise-50 to-blue-50 rounded-lg border border-turquoise-200 shadow-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecommendation}
                    onChange={(e) => setIsRecommendation(e.target.checked)}
                    className="w-5 h-5 rounded border-turquoise-300 text-turquoise-600 focus:ring-turquoise-500"
                  />
                  <div>
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Share a recommendation
                    </span>
                    <span className="text-xs text-gray-600">Help others discover great tango places, services, or experiences</span>
                  </div>
                </label>
              </div>
            )}

            {/* Recommendation Options */}
            {(isRecommendation || context.type === 'recommendation') && (
              <div className="mb-4 p-4 bg-turquoise-50 rounded-lg space-y-3 border border-turquoise-200">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Type of Recommendation</label>
                  <div className="grid grid-cols-4 gap-2">
                    {recommendationTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setRecommendationType(type.value)}
                        className={`p-2 rounded-lg border text-sm transition-all ${
                          recommendationType === type.value
                            ? 'border-turquoise-500 bg-turquoise-100 shadow-sm'
                            : 'border-gray-200 hover:border-turquoise-300 hover:bg-turquoise-50'
                        }`}
                      >
                        <span className="text-lg">{type.icon}</span>
                        <span className="block text-xs mt-1">{type.label.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="text-2xl"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (tags.includes(tag)) {
                            setTags(tags.filter(t => t !== tag));
                          } else {
                            setTags([...tags, tag]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          tags.includes(tag)
                            ? 'bg-turquoise-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-turquoise-100 hover:text-turquoise-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content Input */}
            <div className="mb-4">
              {useRichEditor ? (
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={richContent}
                  onChange={setRichContent}
                  modules={quillModules}
                  placeholder={placeholder}
                  style={{ minHeight: '120px' }}
                />
              ) : (
                <MentionsInput
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={placeholder}
                  className="w-full"
                >
                  <Mention
                    trigger="@"
                    data={users.map(u => ({ id: u.id, display: `@${u.username}` }))}
                    style={{
                      backgroundColor: '#ddd6fe',
                      color: '#6d28d9',
                      fontWeight: '600',
                    }}
                  />
                </MentionsInput>
              )}
            </div>

            {/* Enhanced Location Input */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-turquoise-600" />
                <label className="text-sm font-medium text-gray-700">Location</label>
                {isRecommendation && (
                  <span className="text-xs text-red-500">*Required for recommendations</span>
                )}
              </div>
              
              {/* Use SimplifiedLocationInput as primary input */}
              <SimplifiedLocationInput
                value={location}
                placeholder={
                  locationContext.userCurrentLocation
                    ? "Add location (detected your current area)..."
                    : "Add location..."
                }
                onLocationSelect={(data) => {
                  if (typeof data === 'string') {
                    setLocation(data);
                    setLocationData(null);
                  } else {
                    setLocation(data.formattedAddress);
                    setLocationData(data);
                  }
                }}
                onClear={() => {
                  setLocation('');
                  setLocationData(null);
                }}
                className="w-full"
                required={isRecommendation}
              />
              
              {/* Show error message about Google Maps if needed */}
              {location && !locationData && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Using simplified location input. Google Maps integration requires API key.
                </p>
              )}
            </div>

            {/* Media Previews with Metadata */}
            {uploadedFiles.length > 0 && (
              <div className="mb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover"
                            controls
                          />
                        )}
                      </div>
                      {mediaMetadata[index]?.location && (
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          📍 Location detected
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setUploadedFiles(files => files.filter((_, i) => i !== index));
                          setMediaMetadata(metadata => metadata.filter((_, i) => i !== index));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-turquoise-600 hover:text-turquoise-700 hover:bg-turquoise-50"
                >
                  <Image className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Video className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                >
                  <MapPin className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                >
                  <Smile className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center space-x-3">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="public">🌍 Public</option>
                  <option value="friends">👥 Friends</option>
                  <option value="private">🔒 Private</option>
                </select>

                <Button
                  onClick={handleSubmit}
                  disabled={createPostMutation.isPending || (!content.trim() && !richContent.trim())}
                  className="bg-gradient-to-r from-turquoise-500 to-blue-600 hover:from-turquoise-600 hover:to-blue-700 text-white px-6 shadow-md hover:shadow-lg transition-all"
                >
                  {createPostMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Posting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="h-4 w-4" />
                      <span>{isRecommendation ? 'Recommend' : 'Post'}</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="mt-4">
                <EmojiPicker
                  onEmojiClick={(emojiData: EmojiClickData) => {
                    if (useRichEditor) {
                      setRichContent(prev => prev + emojiData.emoji);
                    } else {
                      setContent(prev => prev + emojiData.emoji);
                    }
                  }}
                  width="100%"
                  height={400}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}