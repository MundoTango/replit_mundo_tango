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
import { MultiSelect } from "@/components/ui/multi-select";
import { TileSelect } from "@/components/ui/tile-select";
import { AutocompleteLocationPicker } from "@/components/profile/AutocompleteLocationPicker";
import { ComprehensiveRoleSelector } from "@/components/profile/ComprehensiveRoleSelector";
import GoogleMapsLocationPicker from "@/components/onboarding/GoogleMapsLocationPicker";
import RoleSelector from "@/components/onboarding/RoleSelector";
import SimpleRoleSelector from "@/components/debugging/SimpleRoleSelector";
import ErrorBoundary from "@/components/debugging/ErrorBoundary";
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
  Search,
  Sparkles,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Constants from registration form
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const years = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());

const languages = [
  { value: "spanish", label: "Spanish", emoji: "🇪🇸" },
  { value: "english", label: "English", emoji: "🇺🇸" },
  { value: "italian", label: "Italian", emoji: "🇮🇹" },
  { value: "french", label: "French", emoji: "🇫🇷" },
  { value: "german", label: "German", emoji: "🇩🇪" },
  { value: "portuguese", label: "Portuguese", emoji: "🇵🇹" },
  { value: "russian", label: "Russian", emoji: "🇷🇺" },
  { value: "japanese", label: "Japanese", emoji: "🇯🇵" },
  { value: "chinese", label: "Chinese (Mandarin)", emoji: "🇨🇳" },
  { value: "arabic", label: "Arabic", emoji: "🇸🇦" },
  { value: "dutch", label: "Dutch", emoji: "🇳🇱" },
  { value: "swedish", label: "Swedish", emoji: "🇸🇪" },
  { value: "norwegian", label: "Norwegian", emoji: "🇳🇴" },
  { value: "polish", label: "Polish", emoji: "🇵🇱" },
  { value: "korean", label: "Korean", emoji: "🇰🇷" },
  { value: "hindi", label: "Hindi", emoji: "🇮🇳" },
  { value: "turkish", label: "Turkish", emoji: "🇹🇷" },
  { value: "hebrew", label: "Hebrew", emoji: "🇮🇱" },
  { value: "greek", label: "Greek", emoji: "🇬🇷" },
  { value: "czech", label: "Czech", emoji: "🇨🇿" },
];

// Role icons mapping for visual display
const roleIcons: Record<string, string> = {
  dancer: "💃",
  performer: "⭐",
  teacher: "📚", 
  learning_source: "📖",
  dj: "🎵",
  musician: "🎼",
  organizer: "🎪",
  host: "🏠",
  photographer: "📸",
  content_creator: "🎙️",
  choreographer: "✨",
  tango_traveler: "🌍",
  tour_operator: "✈️",
  vendor: "🛒",
  wellness_provider: "💆",
  tango_school: "🏫",
  tango_hotel: "🏨",
  taxi_dancer: "🎫"
};

const danceExperienceOptions = [
  { value: "0", label: "Just Starting", emoji: "🌱", description: "New to tango, taking first steps" },
  { value: "1", label: "1 Year", emoji: "👶", description: "Learning basic steps and rhythm" },
  { value: "2", label: "2 Years", emoji: "🚶", description: "Building foundation and confidence" },
  { value: "3", label: "3 Years", emoji: "🌿", description: "Gaining social dancing experience" },
  { value: "4", label: "4 Years", emoji: "🌳", description: "Expanding vocabulary and style" },
  { value: "5", label: "5 Years", emoji: "💪", description: "Solid social dancer" },
  { value: "7", label: "7 Years", emoji: "⭐", description: "Advanced social dancer" },
  { value: "10", label: "10 Years", emoji: "🏆", description: "Very experienced dancer" },
  { value: "15", label: "15 Years", emoji: "👑", description: "Master level dancer" },
  { value: "20", label: "20+ Years", emoji: "🔥", description: "Tango legend" },
];

interface LocationSuggestion {
  id: string;
  display: string;
  city: string;
  state: string;
  country: string;
  type: 'city' | 'state' | 'country';
}

// Schema matching the registration form exactly
const aboutSchema = z.object({
  nickname: z.string().min(1, "Nickname is required").max(50, "Nickname too long"),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  selectedRoles: z.array(z.string()).optional(),
  leaderLevel: z.number().min(0).max(10),
  followerLevel: z.number().min(0).max(10),
  yearsOfDancing: z.number().min(0).max(50).optional(),
  startedDancingYear: z.number().min(1900).max(new Date().getFullYear()).optional(),
  location: z.object({
    country: z.string().min(1, "Country is required"),
    state: z.string().optional(),
    city: z.string().optional(),
    countryId: z.number().min(1, "Country is required"),
    stateId: z.number().optional(),
    cityId: z.number().optional(),
  }),
});

type AboutData = z.infer<typeof aboutSchema>;

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
  const [currentStep, setCurrentStep] = useState(1);
  const [showGoogleMaps, setShowGoogleMaps] = useState(false);
  
  // Initialize form with user data matching registration form structure
  const form = useForm<AboutData>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      nickname: user.name || '',
      languages: user.languages ? (typeof user.languages === 'string' ? JSON.parse(user.languages) : user.languages) : [],
      selectedRoles: user.tangoRoles ? (typeof user.tangoRoles === 'string' ? JSON.parse(user.tangoRoles) : user.tangoRoles) : [],
      leaderLevel: user.leaderLevel || 5,
      followerLevel: user.followerLevel || 5,
      yearsOfDancing: 0,
      startedDancingYear: user.startedDancingYear || new Date().getFullYear(),
      location: {
        country: user.country || '',
        state: user.state || '',
        city: user.city || '',
        countryId: 0,
        stateId: 0,
        cityId: 0
      }
    }
  });
  


  // Update profile mutation matching registration form
  const updateProfileMutation = useMutation({
    mutationFn: async (data: AboutData) => {
      return apiRequest('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.nickname,
          city: data.location.city,
          state: data.location.state,
          country: data.location.country,
          startedDancingYear: data.startedDancingYear,
          tangoRoles: data.selectedRoles,
          leaderLevel: data.leaderLevel,
          followerLevel: data.followerLevel,
          languages: data.languages
        })
      });
    },
    onSuccess: (response) => {
      toast({
        title: "Success", 
        description: "Profile updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/', user.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: AboutData) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  // Get Google Maps API key
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  
  if (!isOwnProfile && !isEditing) {
    // Display view for other users
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-turquoise-500" />
            About {user.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.bio && (
            <div>
              <h3 className="font-semibold mb-2">Bio</h3>
              <p className="text-gray-600">{user.bio}</p>
            </div>
          )}
          
          {(user.city || user.country) && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{[user.city, user.state, user.country].filter(Boolean).join(', ')}</span>
            </div>
          )}
          
          {user.languages && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {(typeof user.languages === 'string' ? JSON.parse(user.languages) : user.languages).map((lang: string) => {
                  const language = languages.find(l => l.value === lang);
                  return (
                    <Badge key={lang} variant="secondary">
                      {language?.emoji} {language?.label || lang}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          
          {user.tangoRoles && (
            <div>
              <h3 className="font-semibold mb-2">Tango Roles</h3>
              <div className="flex flex-wrap gap-2">
                {(typeof user.tangoRoles === 'string' ? JSON.parse(user.tangoRoles) : user.tangoRoles).map((role: string) => (
                  <Badge key={role} variant="outline">
                    {roleIcons[role]} {role.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {user.leaderLevel !== undefined && user.leaderLevel > 0 && (
              <div>
                <p className="text-sm text-gray-600">Leader Level</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-turquoise-500 h-2 rounded-full"
                      style={{ width: `${user.leaderLevel * 10}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{user.leaderLevel}/10</span>
                </div>
              </div>
            )}
            
            {user.followerLevel !== undefined && user.followerLevel > 0 && (
              <div>
                <p className="text-sm text-gray-600">Follower Level</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-cyan-500 h-2 rounded-full"
                      style={{ width: `${user.followerLevel * 10}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{user.followerLevel}/10</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Edit mode - exact copy of registration form
  if (isEditing) {
    return (
      <Card className="glassmorphic-card overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-turquoise-50 via-cyan-50 to-blue-50 border-b border-turquoise-200/30">
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
              <Edit2 className="w-5 h-5 text-turquoise-500" />
              Edit Profile
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCancel}
                className="hover:bg-white/50 hover:shadow-md transition-all duration-300"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateProfileMutation.isPending}
                className="bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-br from-white via-turquoise-50/20 to-cyan-50/20">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Step 1: Basic Info */}
              <div className="space-y-6 glassmorphic-card p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                  <Sparkles className="w-5 h-5 text-turquoise-500" />
                  Basic Information
                </h3>
                
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">How should we call you?</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Your nickname" 
                          className="glassmorphic-input border-turquoise-200/50 focus:border-turquoise-400 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="languages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">What languages do you speak?</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={languages}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Select languages"
                          className="glassmorphic-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Step 2: Tango Roles */}
              <div className="space-y-6 glassmorphic-card p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                  <Music className="w-5 h-5 text-turquoise-500" />
                  Your Tango Journey
                </h3>
                
                <FormField
                  control={form.control}
                  name="selectedRoles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">What roles do you play in tango?</FormLabel>
                      <FormControl>
                        <ErrorBoundary>
                          <ComprehensiveRoleSelector
                            selectedRoles={field.value || []}
                            onRoleChange={field.onChange}
                          />
                        </ErrorBoundary>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="leaderLevel"
                    render={({ field }) => (
                      <FormItem className="glassmorphic-card p-4">
                        <FormLabel className="text-gray-700 font-medium">Leader Level (0-10)</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <Slider
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              min={0}
                              max={10}
                              step={1}
                              className="w-full [&_.slider-thumb]:bg-turquoise-500 [&_.slider-track]:bg-turquoise-200 [&_.slider-range]:bg-gradient-to-r [&_.slider-range]:from-turquoise-400 [&_.slider-range]:to-cyan-500"
                            />
                            <div className="text-center text-sm font-medium bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                              {field.value}/10
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="followerLevel"
                    render={({ field }) => (
                      <FormItem className="glassmorphic-card p-4">
                        <FormLabel className="text-gray-700 font-medium">Follower Level (0-10)</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <Slider
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              min={0}
                              max={10}
                              step={1}
                              className="w-full [&_.slider-thumb]:bg-turquoise-500 [&_.slider-track]:bg-turquoise-200 [&_.slider-range]:bg-gradient-to-r [&_.slider-range]:from-turquoise-400 [&_.slider-range]:to-cyan-500"
                            />
                            <div className="text-center text-sm font-medium bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                              {field.value}/10
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="startedDancingYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">What year did you start dancing tango?</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <SelectTrigger className="glassmorphic-input border-turquoise-200/50 focus:border-turquoise-400 transition-all duration-300">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent className="glassmorphic-card">
                            {years.map((year) => (
                              <SelectItem key={year} value={year} className="hover:bg-turquoise-50/50 transition-colors">
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Step 3: Location */}
              <div className="space-y-6 glassmorphic-card p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                  <Globe2 className="w-5 h-5 text-turquoise-500" />
                  Location
                </h3>
                
                <AutocompleteLocationPicker
                  selectedLocation={form.watch('location') || { country: '', state: '', city: '' }}
                  onLocationSelect={(location) => {
                    form.setValue('location', location);
                  }}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }
  
  // View mode for own profile
  return (
    <Card className="glassmorphic-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
          <Heart className="w-5 h-5 text-turquoise-500" />
          About
        </CardTitle>
        {isOwnProfile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="beautiful-hover"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display user data in view mode */}
        <div className="grid gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>
          
          {(user.city || user.country) && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Location</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-turquoise-500" />
                <span>{[user.city, user.state, user.country].filter(Boolean).join(', ')}</span>
              </div>
            </div>
          )}
          
          {user.languages && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Languages</p>
              <div className="flex flex-wrap gap-2">
                {(typeof user.languages === 'string' ? JSON.parse(user.languages) : user.languages).map((lang: string) => {
                  const language = languages.find(l => l.value === lang);
                  return (
                    <Badge key={lang} variant="secondary" className="glassmorphic-badge">
                      {language?.emoji} {language?.label || lang}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          
          {user.tangoRoles && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Tango Roles</p>
              <div className="flex flex-wrap gap-2">
                {(typeof user.tangoRoles === 'string' ? JSON.parse(user.tangoRoles) : user.tangoRoles).map((role: string) => (
                  <Badge key={role} variant="outline" className="glassmorphic-badge">
                    {roleIcons[role]} {role.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {user.leaderLevel !== undefined && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Leader Level</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-turquoise-400 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${user.leaderLevel * 10}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{user.leaderLevel}/10</span>
                </div>
              </div>
            )}
            
            {user.followerLevel !== undefined && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Follower Level</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${user.followerLevel * 10}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{user.followerLevel}/10</span>
                </div>
              </div>
            )}
          </div>
          
          {user.startedDancingYear && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Dancing Since</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-turquoise-500" />
                <span>{user.startedDancingYear} ({new Date().getFullYear() - user.startedDancingYear} years)</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
