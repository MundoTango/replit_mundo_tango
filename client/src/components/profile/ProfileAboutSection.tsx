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
import { TANGO_ROLES } from '@/utils/tangoRoles';

// Create roleIcons mapping from TANGO_ROLES
const roleIcons = TANGO_ROLES.reduce((acc, role) => {
  acc[role.id] = role.emoji;
  return acc;
}, {} as Record<string, string>);

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
      return apiRequest('/api/user/profile', 'PUT', {
        name: data.nickname,
        city: data.location.city,
        state: data.location.state,
        country: data.location.country,
        startedDancingYear: data.startedDancingYear,
        tangoRoles: data.selectedRoles,
        leaderLevel: data.leaderLevel,
        followerLevel: data.followerLevel,
        languages: data.languages
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
    // Display view for other users with MT ocean theme
    return (
      <Card className="glassmorphic-card overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-turquoise-50 via-cyan-50 to-blue-50 border-b border-turquoise-200/30">
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-turquoise-500" />
            <span className="bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
              About {user.name}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-br from-white via-turquoise-50/20 to-cyan-50/20 space-y-6">
          {user.bio && (
            <div className="glassmorphic-card p-4">
              <h3 className="font-semibold mb-2 bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">Bio</h3>
              <p className="text-gray-700">{user.bio}</p>
            </div>
          )}
          
          {(user.city || user.country) && (
            <div className="flex items-center gap-2 glassmorphic-card p-4">
              <MapPin className="w-5 h-5 text-turquoise-500" />
              <span className="text-gray-700 font-medium">{[user.city, user.state, user.country].filter(Boolean).join(', ')}</span>
            </div>
          )}
          
          {user.languages && (
            <div className="glassmorphic-card p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Languages className="w-5 h-5 text-turquoise-500" />
                <span className="bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                  Languages
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(typeof user.languages === 'string' ? JSON.parse(user.languages) : user.languages).map((lang: string) => {
                  const language = languages.find(l => l.value === lang);
                  return (
                    <Badge 
                      key={lang} 
                      className="bg-gradient-to-r from-turquoise-100 to-cyan-100 text-turquoise-700 border-turquoise-200 hover:shadow-md transition-all duration-300"
                    >
                      {language?.emoji} {language?.label || lang}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          
          {user.tangoRoles && (
            <div className="glassmorphic-card p-4">
              <h3 className="font-semibold mb-3 bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                Tango Roles
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(typeof user.tangoRoles === 'string' ? JSON.parse(user.tangoRoles) : user.tangoRoles).map((role: string, index: number) => {
                  const roleDisplayName = role.replace(/_/g, ' ').split(' ').map((word: string) => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ');
                  const roleDetails = TANGO_ROLES.find(r => r.id === role);
                  
                  return (
                    <div
                      key={role}
                      className="group relative animate-fadeInScale glassmorphic-card p-3 hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-turquoise-400/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="flex items-center gap-2">
                        <div className="text-2xl">
                          {roleDetails?.emoji || roleIcons[role] || '🎭'}
                        </div>
                        <p className="text-sm font-medium text-gray-700 group-hover:text-turquoise-600 transition-colors duration-300">
                          {roleDisplayName}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {user.leaderLevel !== undefined && user.leaderLevel > 0 && (
              <div className="glassmorphic-card p-4">
                <p className="text-sm text-gray-600 mb-2">Leader Level</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200/50 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-turquoise-400 to-cyan-500 h-2.5 rounded-full transition-all duration-1000"
                      style={{ width: `${user.leaderLevel * 10}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                    {user.leaderLevel}/10
                  </span>
                </div>
              </div>
            )}
            
            {user.followerLevel !== undefined && user.followerLevel > 0 && (
              <div className="glassmorphic-card p-4">
                <p className="text-sm text-gray-600 mb-2">Follower Level</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200/50 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full transition-all duration-1000"
                      style={{ width: `${user.followerLevel * 10}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {user.followerLevel}/10
                  </span>
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
        <CardContent className="p-8 bg-gradient-to-br from-white via-turquoise-50/30 to-cyan-50/30">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Step 1: Basic Info */}
              <div className="space-y-6 glassmorphic-card p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-turquoise-200/50">
                <h3 className="text-xl font-bold flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-turquoise-500 animate-pulse" />
                  <span className="bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                    Basic Information
                  </span>
                </h3>
                
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-gray-700 font-semibold text-base flex items-center gap-2">
                        <User className="w-4 h-4 text-turquoise-500" />
                        How should we call you?
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Your nickname" 
                          className="glassmorphic-input border-2 border-turquoise-200/50 focus:border-turquoise-400 bg-white/70 backdrop-blur-xl hover:bg-white/80 transition-all duration-300 px-4 py-2.5 rounded-lg"
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
                    <FormItem className="space-y-2">
                      <FormLabel className="text-gray-700 font-semibold text-base flex items-center gap-2">
                        <Languages className="w-4 h-4 text-turquoise-500" />
                        What languages do you speak?
                      </FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={languages}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Select languages"
                          className="glassmorphic-input border-2 border-turquoise-200/50 focus-within:border-turquoise-400 bg-white/70 backdrop-blur-xl hover:bg-white/80 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Step 2: Tango Roles */}
              <div className="space-y-6 glassmorphic-card p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-turquoise-200/50">
                <h3 className="text-xl font-bold flex items-center gap-3 mb-4">
                  <Music className="w-6 h-6 text-turquoise-500 animate-pulse" />
                  <span className="bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                    Your Tango Journey
                  </span>
                </h3>
                
                <FormField
                  control={form.control}
                  name="selectedRoles"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-gray-700 font-semibold text-base flex items-center gap-2">
                        <Heart className="w-4 h-4 text-turquoise-500" />
                        What roles do you play in tango?
                      </FormLabel>
                      <FormControl>
                        <div className="p-4 glassmorphic-card border border-turquoise-200/30">
                          <ErrorBoundary>
                            <ComprehensiveRoleSelector
                              selectedRoles={field.value || []}
                              onRoleChange={field.onChange}
                            />
                          </ErrorBoundary>
                        </div>
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
                      <FormItem className="glassmorphic-card p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-turquoise-200/30">
                        <FormLabel className="text-gray-700 font-semibold flex items-center gap-2 mb-3">
                          <User className="w-4 h-4 text-turquoise-500" />
                          Leader Level (0-10)
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <Slider
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              min={0}
                              max={10}
                              step={1}
                              className="w-full [&_.slider-thumb]:bg-turquoise-500 [&_.slider-thumb]:shadow-lg [&_.slider-track]:bg-turquoise-200/50 [&_.slider-range]:bg-gradient-to-r [&_.slider-range]:from-turquoise-400 [&_.slider-range]:to-cyan-500"
                            />
                            <div className="text-center text-lg font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
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
                      <FormItem className="glassmorphic-card p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-turquoise-200/30">
                        <FormLabel className="text-gray-700 font-semibold flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-cyan-500" />
                          Follower Level (0-10)
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <Slider
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              min={0}
                              max={10}
                              step={1}
                              className="w-full [&_.slider-thumb]:bg-cyan-500 [&_.slider-thumb]:shadow-lg [&_.slider-track]:bg-cyan-200/50 [&_.slider-range]:bg-gradient-to-r [&_.slider-range]:from-cyan-400 [&_.slider-range]:to-blue-500"
                            />
                            <div className="text-center text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
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
                    <FormItem className="space-y-2">
                      <FormLabel className="text-gray-700 font-semibold text-base flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-turquoise-500" />
                        What year did you start dancing tango?
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <SelectTrigger className="glassmorphic-input border-2 border-turquoise-200/50 focus:border-turquoise-400 bg-white/70 backdrop-blur-xl hover:bg-white/80 transition-all duration-300 px-4 py-2.5 rounded-lg">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent className="glassmorphic-card max-h-60 overflow-y-auto border border-turquoise-200/50">
                            {years.map((year) => (
                              <SelectItem key={year} value={year} className="hover:bg-turquoise-50/70 transition-colors cursor-pointer px-4 py-2">
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
              <div className="space-y-6 glassmorphic-card p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-turquoise-200/50">
                <h3 className="text-xl font-bold flex items-center gap-3 mb-4">
                  <Globe2 className="w-6 h-6 text-turquoise-500 animate-pulse" />
                  <span className="bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                    Location
                  </span>
                </h3>
                
                <div className="glassmorphic-card p-4 border border-turquoise-200/30">
                  <AutocompleteLocationPicker
                    selectedLocation={{
                      country: form.watch('location')?.country || '',
                      state: form.watch('location')?.state || '',
                      city: form.watch('location')?.city || ''
                    }}
                    onLocationSelect={(location) => {
                      form.setValue('location', {
                        country: location.country,
                        state: location.state || '',
                        city: location.city,
                        countryId: 0,
                        stateId: 0,
                        cityId: 0
                      });
                    }}
                  />
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }
  
  // View mode for own profile
  
  // Debug logging for Life CEO debugging
  console.log('🔍 Life CEO Debug: ProfileAboutSection rendering in view mode', {
    user,
    tangoRoles: user.tangoRoles,
    tangoRolesType: typeof user.tangoRoles,
    isOwnProfile,
    hasRoles: !!user.tangoRoles,
    rolesLength: user.tangoRoles ? (typeof user.tangoRoles === 'string' ? JSON.parse(user.tangoRoles).length : user.tangoRoles.length) : 0
  });
  
  return (
    <Card className="glassmorphic-card overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-turquoise-50 via-cyan-50 to-blue-50 border-b border-turquoise-200/30 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-turquoise-500" />
          <span className="bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
            About
          </span>
        </CardTitle>
        {isOwnProfile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="hover:bg-white/50 hover:shadow-md transition-all duration-300"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-6 bg-gradient-to-br from-white via-turquoise-50/20 to-cyan-50/20 space-y-6">
        {/* Display user data in view mode with MT ocean theme */}
        <div className="space-y-6">
          {user.bio && (
            <div className="glassmorphic-card p-4">
              <h3 className="font-semibold mb-2 bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">Bio</h3>
              <p className="text-gray-700">{user.bio}</p>
            </div>
          )}
          
          <div className="glassmorphic-card p-4">
            <h3 className="font-semibold mb-3 bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Name</p>
                <p className="font-medium text-gray-800">{user.name}</p>
              </div>
              
              {(user.city || user.country) && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-turquoise-500" />
                    <span className="text-gray-700 font-medium">{[user.city, user.state, user.country].filter(Boolean).join(', ')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {user.languages && (
            <div className="glassmorphic-card p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Languages className="w-5 h-5 text-turquoise-500" />
                <span className="bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                  Languages
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(typeof user.languages === 'string' ? JSON.parse(user.languages) : user.languages).map((lang: string) => {
                  const language = languages.find(l => l.value === lang);
                  return (
                    <Badge 
                      key={lang} 
                      className="bg-gradient-to-r from-turquoise-100 to-cyan-100 text-turquoise-700 border-turquoise-200 hover:shadow-md transition-all duration-300"
                    >
                      {language?.emoji} {language?.label || lang}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          
          {user.tangoRoles && (
            <div className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                  <span className="bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                    What do you do in Tango?
                  </span>
                  <Music className="w-5 h-5 text-turquoise-500 animate-pulse" />
                </h3>
                <p className="text-sm text-gray-600">Your roles in the tango community</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(typeof user.tangoRoles === 'string' ? JSON.parse(user.tangoRoles) : user.tangoRoles).map((role: string, index: number) => {
                  const roleDisplayName = role.replace(/_/g, ' ').split(' ').map((word: string) => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ');
                  
                  // Get role details from TANGO_ROLES
                  const roleDetails = TANGO_ROLES.find(r => r.id === role);
                  
                  return (
                    <div
                      key={role}
                      className="group relative animate-fadeInScale glassmorphic-card p-4 hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Background gradient animation */}
                      <div className="absolute inset-0 bg-gradient-to-br from-turquoise-400/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Role icon */}
                      <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                        {roleDetails?.emoji || roleIcons[role] || '🎭'}
                      </div>
                      
                      {/* Role name */}
                      <p className="text-sm font-medium text-gray-700 group-hover:text-turquoise-600 transition-colors duration-300">
                        {roleDisplayName}
                      </p>
                      
                      {/* Role description on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-turquoise-400/95 to-cyan-500/95 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-3 rounded-xl">
                        <p className="text-xs text-white text-center font-medium">
                          {roleDetails?.description || 'Passionate about tango'}
                        </p>
                      </div>
                      
                      {/* Hover effect border */}
                      <div className="absolute inset-0 border-2 border-turquoise-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  );
                })}
              </div>
              
              {/* Fun fact about roles */}
              <div className="mt-4 p-3 bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50 rounded-lg">
                <p className="text-sm text-gray-600 italic">
                  {(() => {
                    const rolesArray = typeof user.tangoRoles === 'string' ? JSON.parse(user.tangoRoles) : user.tangoRoles;
                    return rolesArray.length > 3 
                      ? "🌟 Wow! You're a multi-talented tango enthusiast!" 
                      : rolesArray.length > 1 
                      ? "✨ Great to see you contribute in multiple ways!" 
                      : "💃 Every role is important in our tango community!";
                  })()}
                </p>
              </div>
            </div>
          )}
          
          {(user.leaderLevel !== undefined || user.followerLevel !== undefined) && (
            <div className="glassmorphic-card p-4">
              <h3 className="font-semibold mb-3 bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                Dance Levels
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {user.leaderLevel !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Leader Level</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200/50 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-turquoise-400 to-cyan-500 h-2.5 rounded-full transition-all duration-1000"
                          style={{ width: `${user.leaderLevel * 10}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                        {user.leaderLevel}/10
                      </span>
                    </div>
                  </div>
                )}
                
                {user.followerLevel !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Follower Level</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200/50 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full transition-all duration-1000"
                          style={{ width: `${user.followerLevel * 10}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        {user.followerLevel}/10
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {user.startedDancingYear && (
            <div className="glassmorphic-card p-4">
              <h3 className="font-semibold mb-2 bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
                Tango Journey
              </h3>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-turquoise-500" />
                <span className="text-gray-700 font-medium">Dancing since {user.startedDancingYear} ({new Date().getFullYear() - user.startedDancingYear} years)</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
