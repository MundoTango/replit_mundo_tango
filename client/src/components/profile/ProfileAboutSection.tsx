import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  Earth
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

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
    languages: parseLanguages(user.languages),
    website: user.website || '',
    phone: user.phone || '',
    profileVisibility: parseVisibility(user.profileVisibility)
  });

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
      tangoStartYear: user.tangoStartYear || new Date().getFullYear(),
      tangoRoles: user.tangoRoles || [],
      languages: user.languages || [],
      website: user.website || '',
      phone: user.phone || '',
      profileVisibility: user.profileVisibility || {
        bio: 'public',
        location: 'public',
        contact: 'friends',
        tangoDetails: 'public'
      }
    });
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
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="border-turquoise-200 focus:border-turquoise-400"
                />
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State/Province"
                  className="border-turquoise-200 focus:border-turquoise-400"
                />
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Country"
                  className="border-turquoise-200 focus:border-turquoise-400"
                />
              </div>
            ) : (
              <p className="text-gray-600">
                {[user.city, user.state, user.country].filter(Boolean).join(', ') || 'Location not specified'}
              </p>
            )}
          </div>
        )}

        {/* Tango Details Section */}
        {(canViewField('tangoDetails') || isEditing) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Heart className="h-4 w-4 text-turquoise-600" />
                Tango Details
              </Label>
              {isEditing && (
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
              )}
            </div>
            
            <div className="space-y-3">
              {/* Dancing Since */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-turquoise-500" />
                {isEditing ? (
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
                ) : (
                  <span className="text-sm text-gray-600">
                    Dancing for {yearsOfDancing} {yearsOfDancing === 1 ? 'year' : 'years'}
                  </span>
                )}
              </div>

              {/* Tango Roles */}
              <div className="flex items-start gap-2">
                <Briefcase className="h-4 w-4 text-turquoise-500 mt-1" />
                <div className="flex-1">
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2">
                      {['Leader', 'Follower', 'Both'].map((role) => (
                        <Badge
                          key={role}
                          variant={formData.tangoRoles.includes(role) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer transition-all",
                            formData.tangoRoles.includes(role)
                              ? "bg-gradient-to-r from-turquoise-500 to-cyan-600 text-white border-0"
                              : "border-turquoise-300 hover:bg-turquoise-50"
                          )}
                          onClick={() => {
                            const newRoles = formData.tangoRoles.includes(role)
                              ? formData.tangoRoles.filter(r => r !== role)
                              : [...formData.tangoRoles, role];
                            setFormData({ ...formData, tangoRoles: newRoles });
                          }}
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.tangoRoles?.map((role) => (
                        <Badge
                          key={role}
                          className="bg-gradient-to-r from-turquoise-500/10 to-cyan-600/10 text-turquoise-700 border-turquoise-300"
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Languages */}
              <div className="flex items-start gap-2">
                <Languages className="h-4 w-4 text-turquoise-500 mt-1" />
                <div className="flex-1">
                  {isEditing ? (
                    <Input
                      value={formData.languages.join(', ')}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        languages: e.target.value.split(',').map(l => l.trim()).filter(Boolean)
                      })}
                      placeholder="English, Spanish, etc."
                      className="border-turquoise-200 focus:border-turquoise-400"
                    />
                  ) : (
                    <span className="text-sm text-gray-600">
                      {user.languages?.join(', ') || 'Languages not specified'}
                    </span>
                  )}
                </div>
              </div>
            </div>
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