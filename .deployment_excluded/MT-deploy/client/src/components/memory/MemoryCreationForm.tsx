import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, Upload, MapPin, Users, AlertTriangle, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuthContext } from '../../auth/useAuthContext';
import GoogleMapsAutocomplete from '../maps/GoogleMapsAutocomplete';
import UploadMedia from '../upload/UploadMedia';
import { apiRequest } from '@/lib/queryClient';

interface MemoryCreationFormProps {
  open: boolean;
  onClose: () => void;
  onMemoryCreated?: (memory: any) => void;
}

interface CoTaggedUser {
  id: number;
  username: string;
  name: string;
  hasConsent: boolean;
}

const EMOTION_TAGS = [
  'joy', 'passion', 'nostalgia', 'connection', 'elegance', 'intimacy',
  'vulnerability', 'power', 'grace', 'melancholy', 'euphoria', 'tension',
  'release', 'discovery', 'growth', 'challenge', 'triumph', 'flow'
];

const VISIBILITY_TIERS = [
  { value: 'public', label: 'Public', description: 'Visible to everyone' },
  { value: 'friends', label: 'Friends', description: 'Only visible to your friends' },
  { value: 'trusted', label: 'Trusted Circle', description: 'Visible to your trusted circle' },
  { value: 'private', label: 'Private', description: 'Only visible to you' }
];

export default function MemoryCreationForm({ open, onClose, onMemoryCreated }: MemoryCreationFormProps) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emotionTags, setEmotionTags] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [location, setLocation] = useState<any>(null);
  const [visibilityTier, setVisibilityTier] = useState('public');
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [coTaggedUsers, setCoTaggedUsers] = useState<CoTaggedUser[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);

  // Validation states
  const [needsConsent, setNeedsConsent] = useState(false);
  const [consentWarningUsers, setConsentWarningUsers] = useState<string[]>([]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTitle('');
      setContent('');
      setEmotionTags([]);
      setSelectedDate(new Date());
      setLocation(null);
      setVisibilityTier('public');
      setMediaFiles([]);
      setCoTaggedUsers([]);
      setUserSearchQuery('');
      setSearchedUsers([]);
      setShowUserSearch(false);
    }
  }, [open]);

  // Check consent requirements when co-tagged users change
  useEffect(() => {
    const usersNeedingConsent = coTaggedUsers.filter(user => !user.hasConsent);
    setNeedsConsent(usersNeedingConsent.length > 0);
    setConsentWarningUsers(usersNeedingConsent.map(user => user.username));
  }, [coTaggedUsers]);

  const addEmotionTag = (tag: string) => {
    if (!emotionTags.includes(tag)) {
      setEmotionTags([...emotionTags, tag]);
    }
  };

  const removeEmotionTag = (tag: string) => {
    setEmotionTags(emotionTags.filter(t => t !== tag));
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) return;
    
    try {
      const response = await apiRequest('GET', `/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.success) {
        // Filter out current user and already tagged users
        const filteredUsers = response.data.filter((u: any) => 
          u.id !== user?.id && !coTaggedUsers.find(tagged => tagged.id === u.id)
        );
        setSearchedUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const addCoTaggedUser = async (selectedUser: any) => {
    try {
      // Check if user has pre-approved consent for this type of content
      const consentResponse = await apiRequest('GET', `/api/memory/consent-check/${selectedUser.id}?visibility=${visibilityTier}`);
      
      const newUser: CoTaggedUser = {
        id: selectedUser.id,
        username: selectedUser.username,
        name: selectedUser.name,
        hasConsent: consentResponse.hasConsent || false
      };
      
      setCoTaggedUsers([...coTaggedUsers, newUser]);
      setUserSearchQuery('');
      setSearchedUsers([]);
      setShowUserSearch(false);
    } catch (error) {
      console.error('Error checking consent:', error);
      // Default to requiring consent if check fails
      const newUser: CoTaggedUser = {
        id: selectedUser.id,
        username: selectedUser.username,
        name: selectedUser.name,
        hasConsent: false
      };
      setCoTaggedUsers([...coTaggedUsers, newUser]);
    }
  };

  const removeCoTaggedUser = (userId: number) => {
    setCoTaggedUsers(coTaggedUsers.filter(user => user.id !== userId));
  };

  const handleLocationSelect = (locationData: any) => {
    setLocation(locationData);
  };

  const handleMediaUpload = (files: any[]) => {
    setMediaFiles(files);
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please provide a title for your memory.',
        variant: 'destructive'
      });
      return false;
    }

    if (!content.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please describe your memory.',
        variant: 'destructive'
      });
      return false;
    }

    if (emotionTags.length === 0) {
      toast({
        title: 'Emotion Tags Required',
        description: 'Please select at least one emotion tag.',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user) return;

    setLoading(true);

    try {
      const memoryData = {
        title: title.trim(),
        content: content.trim(),
        emotion_tags: emotionTags,
        emotion_visibility: visibilityTier,
        date: selectedDate.toISOString().split('T')[0],
        location: location ? {
          formatted_address: location.formattedAddress,
          latitude: location.latitude,
          longitude: location.longitude,
          place_id: location.placeId || null
        } : null,
        media_urls: mediaFiles.map(file => file.url),
        co_tagged_users: coTaggedUsers.map(user => user.id),
        consent_required: needsConsent,
        trust_circle_level: visibilityTier === 'trusted' ? 3 : 1 // Default trust level
      };

      const response = await apiRequest('POST', '/api/memory/create', memoryData);

      if (response.success) {
        toast({
          title: 'Memory Created Successfully',
          description: needsConsent 
            ? `Memory saved! Consent requests sent to ${consentWarningUsers.join(', ')}.`
            : 'Your memory has been saved and is now visible based on your privacy settings.',
        });

        // Log successful memory creation
        await apiRequest('POST', '/api/memory/audit', {
          action_type: 'create',
          result: 'success',
          metadata: {
            memory_id: response.data.id,
            emotion_tags: emotionTags,
            visibility: visibilityTier,
            co_tagged_count: coTaggedUsers.length,
            needs_consent: needsConsent
          }
        });

        onMemoryCreated?.(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error creating memory:', error);
      
      // Log failed memory creation
      await apiRequest('POST', '/api/memory/audit', {
        action_type: 'create',
        result: 'error',
        reason: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          emotion_tags: emotionTags,
          visibility: visibilityTier,
          co_tagged_count: coTaggedUsers.length
        }
      });

      toast({
        title: 'Failed to Create Memory',
        description: 'There was an error saving your memory. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
            Create New Memory
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What would you like to call this memory?"
              className="text-lg"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Description *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe this memory... What happened? How did it feel?"
              className="min-h-[100px]"
            />
          </div>

          {/* Emotion Tags */}
          <div className="space-y-3">
            <Label>Emotion Tags * (Select all that apply)</Label>
            <div className="flex flex-wrap gap-2">
              {EMOTION_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={emotionTags.includes(tag) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all",
                    emotionTags.includes(tag) 
                      ? "bg-gradient-to-r from-pink-500 to-blue-500 text-white" 
                      : "hover:bg-gray-100"
                  )}
                  onClick={() => 
                    emotionTags.includes(tag) ? removeEmotionTag(tag) : addEmotionTag(tag)
                  }
                >
                  {tag}
                  {emotionTags.includes(tag) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Location</Label>
            <GoogleMapsAutocomplete
              onLocationSelect={handleLocationSelect}
              placeholder="Where did this happen?"
            />
            {location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {location.formattedAddress}
              </div>
            )}
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label>Media (Optional)</Label>
            <UploadMedia
              onUpload={handleMediaUpload}
              maxFiles={5}
              folder="memories"
              tags={emotionTags}
              visibility={visibilityTier as "public" | "private" | "mutual"}
              context="memory_creation"
            />
          </div>

          {/* Co-Tagged Users */}
          <div className="space-y-3">
            <Label>Tag Other Users</Label>
            
            {/* Search Input */}
            <div className="relative">
              <Input
                value={userSearchQuery}
                onChange={(e) => {
                  setUserSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                  setShowUserSearch(true);
                }}
                placeholder="Search by username or email..."
                className="pr-10"
              />
              <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              
              {/* Search Results */}
              {showUserSearch && searchedUsers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {searchedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => addCoTaggedUser(user)}
                    >
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tagged Users */}
            {coTaggedUsers.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Tagged Users:</div>
                <div className="flex flex-wrap gap-2">
                  {coTaggedUsers.map((user) => (
                    <Badge
                      key={user.id}
                      variant="outline"
                      className={cn(
                        "flex items-center gap-1",
                        !user.hasConsent && "border-orange-300 bg-orange-50"
                      )}
                    >
                      {user.username}
                      {!user.hasConsent && (
                        <AlertTriangle className="w-3 h-3 text-orange-500" />
                      )}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => removeCoTaggedUser(user.id)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Consent Warning */}
            {needsConsent && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-orange-800">Consent Required</div>
                    <div className="text-sm text-orange-700">
                      Consent will be requested from {consentWarningUsers.join(', ')} before this memory is visible to them.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visibility Tier */}
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select value={visibilityTier} onValueChange={setVisibilityTier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_TIERS.map((tier) => (
                  <SelectItem key={tier.value} value={tier.value}>
                    <div>
                      <div className="font-medium">{tier.label}</div>
                      <div className="text-sm text-gray-500">{tier.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
            >
              {loading ? 'Creating...' : 'Create Memory'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}