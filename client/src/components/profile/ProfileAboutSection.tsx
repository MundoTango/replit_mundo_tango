import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Edit2, 
  Save, 
  X, 
  MapPin, 
  Calendar, 
  Globe2, 
  Mail, 
  Phone,
  Briefcase,
  Heart,
  Languages,
  Eye,
  EyeOff,
  Lock,
  Users,
  Earth,
  Music,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface LocationSuggestion {
  id: string;
  display: string;
  city: string;
  state: string;
  country: string;
  type: 'city' | 'state' | 'country';
}

interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  bio?: string;
  city?: string;
  state?: string;
  country?: string;
  occupation?: string;
  tangoStartYear?: number;
  startedDancingYear?: number;
  tangoRoles?: string[] | string;
  leaderLevel?: number;
  followerLevel?: number;
  languages?: string[] | string;
  website?: string;
  phone?: string;
  profileVisibility?: {
    bio?: 'public' | 'friends' | 'private';
    location?: 'public' | 'friends' | 'private';
    contact?: 'public' | 'friends' | 'private';
    tangoDetails?: 'public' | 'friends' | 'private';
  } | string;
}

interface ProfileAboutSectionProps {
  user: UserProfile;
  isOwnProfile: boolean;
  currentUserId?: number;
  isFriend?: boolean;
}

export const ProfileAboutSection: React.FC<ProfileAboutSectionProps> = ({
  user,
  isOwnProfile,
  currentUserId,
  isFriend = false
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  // Parse arrays and objects from database strings
  const parseTangoRoles = (roles: string[] | string | undefined): string[] => {
    if (!roles) return [];
    if (Array.isArray(roles)) return roles;
    try {
      return JSON.parse(roles);
    } catch {
      return [];
    }
  };

  const parseLanguages = (langs: string[] | string | undefined): string[] => {
    if (!langs) return [];
    if (Array.isArray(langs)) return langs;
    try {
      return JSON.parse(langs);
    } catch {
      return [];
    }
  };

  const parseVisibility = (vis: any) => {
    const defaultVis = {
      bio: 'public',
      location: 'public',
      contact: 'public',
      tangoDetails: 'public'
    };
    
    if (!vis) return defaultVis;
    if (typeof vis === 'object') return vis;
    
    try {
      return JSON.parse(vis);
    } catch {
      return defaultVis;
    }
  };

  const [formData, setFormData] = useState({
    bio: user.bio || '',
    city: user.city || '',
    state: user.state || '',
    country: user.country || '',
    occupation: user.occupation || '',
    tangoStartYear: user.startedDancingYear || user.tangoStartYear || new Date().getFullYear(),
    tangoRoles: parseTangoRoles(user.tangoRoles),
    leaderLevel: user.leaderLevel || 0,
    followerLevel: user.followerLevel || 0,
    languages: parseLanguages(user.languages),
    website: user.website || '',
    phone: user.phone || '',
    profileVisibility: parseVisibility(user.profileVisibility)
  });

  // Location search state
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Debug log to verify component is loading with updates
  console.log('ProfileAboutSection loaded - v2 with location search, checkboxes, and sliders', {
    user,
    isOwnProfile,
    timestamp: new Date().toISOString()
  });

  // Initialize location search when entering edit mode
  useEffect(() => {
    if (isEditing && formData.city) {
      const location = [formData.city, formData.state, formData.country]
        .filter(Boolean)
        .join(', ');
      setLocationSearch(location);
    }
  }, [isEditing]);

  // Location search functionality
  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    setIsSearchingLocation(true);
    try {
      const response = await fetch(`/api/search/locations?q=${encodeURIComponent(query)}&limit=10`);
      const suggestions = await response.json();
      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(true);
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setIsSearchingLocation(false);
    }
  }, []);

  // Handle location search input
  const handleLocationSearchChange = (value: string) => {
    setLocationSearch(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  // Handle location selection
  const handleLocationSelect = (location: LocationSuggestion) => {
    setFormData(prev => ({
      ...prev,
      city: location.city,
      state: location.state,
      country: location.country
    }));
    setLocationSearch(location.display);
    setShowLocationSuggestions(false);
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('PUT', '/api/user/profile', data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      bio: user.bio || '',
      city: user.city || '',
      state: user.state || '',
      country: user.country || '',
      occupation: user.occupation || '',
      tangoStartYear: user.startedDancingYear || user.tangoStartYear || new Date().getFullYear(),
      tangoRoles: parseTangoRoles(user.tangoRoles),
      leaderLevel: user.leaderLevel || 0,
      followerLevel: user.followerLevel || 0,
      languages: parseLanguages(user.languages),
      website: user.website || '',
      phone: user.phone || '',
      profileVisibility: parseVisibility(user.profileVisibility)
    });
    setLocationSearch('');
    setShowLocationSuggestions(false);
    setIsEditing(false);
  };

  const canViewField = (field: keyof typeof formData.profileVisibility) => {
    if (isOwnProfile) return true;
    const visibility = formData.profileVisibility[field];
    if (visibility === 'public') return true;
    if (visibility === 'friends' && isFriend) return true;
    return false;
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Earth className="h-3 w-3" />;
      case 'friends':
        return <Users className="h-3 w-3" />;
      case 'private':
        return <Lock className="h-3 w-3" />;
      default:
        return <Earth className="h-3 w-3" />;
    }
  };

  const yearsOfDancing = user.tangoStartYear ? new Date().getFullYear() - user.tangoStartYear : 0;

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm border-turquoise-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50 border-b border-turquoise-100/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-700 bg-clip-text text-transparent">
            About
          </CardTitle>
          {isOwnProfile && (
            <Button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              variant={isEditing ? "default" : "outline"}
              size="sm"
              className={cn(
                "transition-all duration-200",
                isEditing 
                  ? "bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white border-0"
                  : "border-turquoise-300 hover:bg-turquoise-50"
              )}
              disabled={updateProfileMutation.isPending}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save"}
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
          {/* Bio Section */}
          {(canViewField('bio') || isEditing) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Bio</Label>
              {isEditing && (
                <Select
                  value={formData.profileVisibility.bio}
                  onValueChange={(value: any) => setFormData({
                    ...formData,
                    profileVisibility: { ...formData.profileVisibility, bio: value }
                  })}
                >
                  <SelectTrigger className="w-32 h-8 border-turquoise-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Earth className="h-3 w-3" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        Friends
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-3 w-3" />
                        Private
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            {isEditing ? (
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="min-h-24 border-turquoise-200 focus:border-turquoise-400"
              />
            ) : (
              <p className="text-gray-600">{user.bio || 'No bio added yet'}</p>
            )}
          </div>
        )}

        {/* Location Section */}
        {(canViewField('location') || isEditing) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-turquoise-600" />
                Location
              </Label>
              {isEditing && (
                <Select
                  value={formData.profileVisibility.location}
                  onValueChange={(value: any) => setFormData({
                    ...formData,
                    profileVisibility: { ...formData.profileVisibility, location: value }
                  })}
                >
                  <SelectTrigger className="w-32 h-8 border-turquoise-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Earth className="h-3 w-3" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        Friends
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-3 w-3" />
                        Private
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            {isEditing ? (
              <div className="relative">
                <div className="relative">
                  <Input
                    value={locationSearch || `${formData.city}, ${formData.state}, ${formData.country}`.replace(/^, |, $|, , /g, '')}
                    onChange={(e) => handleLocationSearchChange(e.target.value)}
                    placeholder="Search for your location..."
                    className="border-turquoise-200 focus:border-turquoise-400 pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-turquoise-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {locationSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => handleLocationSelect(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-turquoise-50 transition-colors duration-200 border-b border-gray-100 last:border-0"
                      >
                        <p className="text-sm font-medium text-gray-900">{suggestion.display}</p>
                        <p className="text-xs text-gray-500">{suggestion.type === 'city' ? 'City' : suggestion.type}</p>
                      </button>
                    ))}
                  </div>
                )}
                {isSearchingLocation && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-turquoise-200 rounded-lg shadow-lg p-4 text-center">
                    <p className="text-sm text-gray-500">Searching locations...</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">
                {[user.city, user.state, user.country].filter(Boolean).join(', ') || 'Location not specified'}
              </p>
            )}
          </div>
        )}

        {/* Tango Details Section - Matching Registration Form Design */}
        {(canViewField('tangoDetails') || isEditing) && (
          <div className="space-y-6">
            {!isEditing ? (
              // Non-editing view with glassmorphic cards
              <>
                {/* Tango Activities Card */}
                <div className="space-y-4 group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg rounded-xl p-4 hover:bg-white/50 glassmorphic-card">
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-200 group-hover:border-teal-300 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center group-hover:animate-pulse shadow-lg">
                      <Users className="w-5 h-5 text-teal-600 group-hover:text-emerald-600 transition-colors duration-300" />
                    </div>
                    <h2 className="text-xl font-medium text-gray-900 group-hover:text-teal-700 transition-colors">Tango Activities</h2>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">💃 Your tango style!</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {parseTangoRoles(user.tangoRoles).map((role) => (
                      <Badge
                        key={role}
                        className="bg-gradient-to-r from-turquoise-500/10 to-cyan-600/10 text-turquoise-700 border-turquoise-300"
                      >
                        {role}
                      </Badge>
                    ))}
                    {parseTangoRoles(user.tangoRoles).length === 0 && (
                      <span className="text-sm text-gray-500">No roles specified</span>
                    )}
                  </div>
                </div>

                {/* Dance Role Skills Card */}
                {(user.leaderLevel > 0 || user.followerLevel > 0) && (
                  <div className="space-y-4 group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg rounded-xl p-4 hover:bg-white/50 glassmorphic-card">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200 group-hover:border-purple-300 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center group-hover:animate-pulse shadow-lg">
                        <Music className="w-5 h-5 text-purple-600 group-hover:text-pink-600 transition-colors duration-300" />
                      </div>
                      <h2 className="text-xl font-medium text-gray-900 group-hover:text-purple-700 transition-colors">Dance Style</h2>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">🕺 Your dance levels!</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {user.leaderLevel > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🤵</span>
                          <span className="text-sm text-gray-700">Leader Level: {user.leaderLevel}/10</span>
                        </div>
                      )}
                      {user.followerLevel > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">💃</span>
                          <span className="text-sm text-gray-700">Follower Level: {user.followerLevel}/10</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Dancing Since */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-turquoise-500" />
                  <span className="text-sm text-gray-600">
                    Dancing for {yearsOfDancing} {yearsOfDancing === 1 ? 'year' : 'years'}
                  </span>
                </div>
              </>
            ) : (
              // Editing view with registration form style
              <div className="space-y-6">
                {/* Visibility selector */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-turquoise-600" />
                    Tango Details
                  </Label>
                  <Select
                    value={formData.profileVisibility.tangoDetails}
                    onValueChange={(value: any) => setFormData({
                      ...formData,
                      profileVisibility: { ...formData.profileVisibility, tangoDetails: value }
                    })}
                  >
                    <SelectTrigger className="w-32 h-8 border-turquoise-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Earth className="h-3 w-3" />
                          Public
                        </div>
                      </SelectItem>
                      <SelectItem value="friends">
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          Friends
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-3 w-3" />
                          Private
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            
                <div className="space-y-6">
                  {/* Dancing Since */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-turquoise-500" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Dancing since</span>
                      <Input
                        type="number"
                        value={formData.tangoStartYear}
                        onChange={(e) => setFormData({ ...formData, tangoStartYear: parseInt(e.target.value) })}
                        min="1900"
                        max={new Date().getFullYear()}
                        className="w-24 border-turquoise-200 focus:border-turquoise-400"
                      />
                    </div>
                  </div>

                  {/* Tango Roles - Matching Registration Form Style */}
                  <div className="space-y-4 group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg rounded-xl p-4 hover:bg-white/50 glassmorphic-card">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200 group-hover:border-teal-300 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center group-hover:animate-pulse shadow-lg">
                        <Users className="w-5 h-5 text-teal-600 group-hover:text-emerald-600 transition-colors duration-300" />
                      </div>
                      <h2 className="text-xl font-medium text-gray-900 group-hover:text-teal-700 transition-colors">Tango Activities</h2>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">💃 Your tango style!</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: 'dancer', label: 'Dancer' },
                        { id: 'teacher', label: 'Teacher' },
                        { id: 'organizer', label: 'Organizer' },
                        { id: 'dj', label: 'DJ' },
                        { id: 'musician', label: 'Musician' }
                      ].map((role) => (
                        <div key={role.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={role.id}
                            checked={formData.tangoRoles.includes(role.label)}
                            onCheckedChange={(checked) => {
                              const newRoles = checked
                                ? [...formData.tangoRoles, role.label]
                                : formData.tangoRoles.filter(r => r !== role.label);
                              setFormData({ ...formData, tangoRoles: newRoles });
                            }}
                            className="h-5 w-5 rounded border-gray-300 text-turquoise-600 focus:ring-turquoise-500"
                          />
                          <label
                            htmlFor={role.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {role.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dance Role Skills - Matching Registration Form Style */}
                  <div className="space-y-4 group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg rounded-xl p-4 hover:bg-white/50 glassmorphic-card">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200 group-hover:border-purple-300 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center group-hover:animate-pulse shadow-lg">
                        <Music className="w-5 h-5 text-purple-600 group-hover:text-pink-600 transition-colors duration-300" />
                      </div>
                      <h2 className="text-xl font-medium text-gray-900 group-hover:text-purple-700 transition-colors">Do you dance as:</h2>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">🕺 Your dance style!</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Leader Level */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors flex items-center gap-2">
                          <span className="text-lg">🤵</span>
                          Leader Level: {formData.leaderLevel}/10
                        </Label>
                        <div className="px-3">
                          <Slider
                            value={[formData.leaderLevel]}
                            onValueChange={(value) => setFormData({ ...formData, leaderLevel: value[0] })}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Beginner</span>
                            <span>Expert</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Follower Level */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors flex items-center gap-2">
                          <span className="text-lg">💃</span>
                          Follower Level: {formData.followerLevel}/10
                        </Label>
                        <div className="px-3">
                          <Slider
                            value={[formData.followerLevel]}
                            onValueChange={(value) => setFormData({ ...formData, followerLevel: value[0] })}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Beginner</span>
                            <span>Expert</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="flex items-start gap-2">
                    <Languages className="h-4 w-4 text-turquoise-500 mt-1" />
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Languages</Label>
                      <Input
                        value={formData.languages.join(', ')}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          languages: e.target.value.split(',').map(l => l.trim()).filter(Boolean)
                        })}
                        placeholder="English, Spanish, etc."
                        className="border-turquoise-200 focus:border-turquoise-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contact Information */}
        {(canViewField('contact') || isEditing) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Contact</Label>
              {isEditing && (
                <Select
                  value={formData.profileVisibility.contact}
                  onValueChange={(value: any) => setFormData({
                    ...formData,
                    profileVisibility: { ...formData.profileVisibility, contact: value }
                  })}
                >
                  <SelectTrigger className="w-32 h-8 border-turquoise-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Earth className="h-3 w-3" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        Friends
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-3 w-3" />
                        Private
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="space-y-2">
              {isEditing ? (
                <>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-turquoise-500" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                    <Badge variant="outline" className="text-xs">Not editable</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-turquoise-500" />
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                      className="flex-1 border-turquoise-200 focus:border-turquoise-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-turquoise-500" />
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="Website URL"
                      className="flex-1 border-turquoise-200 focus:border-turquoise-400"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-turquoise-500" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-turquoise-500" />
                      <span className="text-sm text-gray-600">{user.phone}</span>
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-turquoise-500" />
                      <a 
                        href={user.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-turquoise-600 hover:text-turquoise-700 underline"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Cancel button when editing */}
        {isEditing && (
          <div className="flex justify-end pt-4 border-t border-turquoise-100">
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="border-turquoise-300 hover:bg-turquoise-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};