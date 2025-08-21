import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RoleEmojiDisplay } from '@/components/ui/RoleEmojiDisplay';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  MapPin, 
  Calendar, 
  Edit, 
  Camera,
  Users,
  Heart,
  Eye,
  Share2,
  Instagram,
  Facebook,
  Twitter,
  Link,
  Shield,
  CheckCircle,
  Globe,
  Mail,
  Phone,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageCropper from '@/components/ImageCropper';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  country?: string;
  city?: string;
  tangoRoles?: string[];
  yearsOfDancing?: number;
  leaderLevel?: number;
  followerLevel?: number;
  languages?: string[];
  createdAt?: string;
  isVerified?: boolean;
  profileViews?: number;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
}

interface Stats {
  posts?: number;
  followers?: number;
  following?: number;
  events?: number;
  photos?: number;
  friends?: number;
}

interface EnhancedProfileHeaderProps {
  user: User;
  stats?: Stats;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
}

export default function EnhancedProfileHeader({ 
  user, 
  stats,
  isOwnProfile = false, 
  onEditProfile
}: EnhancedProfileHeaderProps) {
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showCoverCropper, setShowCoverCropper] = useState(false);
  const [showProfileCropper, setShowProfileCropper] = useState(false);
  const [tempCoverImage, setTempCoverImage] = useState<string | null>(null);
  const [tempProfileImage, setTempProfileImage] = useState<string | null>(null);
  const [viewAsVisitor, setViewAsVisitor] = useState(false);

  // Upload cover image mutation
  const uploadCoverMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return apiRequest('/api/user/cover-image', { 
        method: 'PUT', 
        body: formData
      });
    },
    onSuccess: () => {
      toast({
        title: "Cover photo updated",
        description: "Your cover photo has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload cover photo. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Upload profile image mutation
  const uploadProfileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return apiRequest('/api/user/profile-image', { 
        method: 'PUT', 
        body: formData
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload profile photo. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempCoverImage(event.target?.result as string);
        setShowCoverCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempProfileImage(event.target?.result as string);
        setShowProfileCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverCropComplete = (croppedFile: File) => {
    uploadCoverMutation.mutate(croppedFile);
    setShowCoverCropper(false);
    setTempCoverImage(null);
  };

  const handleProfileCropComplete = (croppedFile: File) => {
    uploadProfileMutation.mutate(croppedFile);
    setShowProfileCropper(false);
    setTempProfileImage(null);
  };

  const handleViewAsVisitor = () => {
    setViewAsVisitor(!viewAsVisitor);
    toast({
      title: viewAsVisitor ? "Editor mode" : "Visitor mode",
      description: viewAsVisitor ? "You're now viewing as yourself" : "You're now viewing as a visitor would see"
    });
  };

  const handleShare = () => {
    const profileUrl = `${window.location.origin}/u/${user.username}`;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Profile link copied",
      description: "The profile link has been copied to your clipboard."
    });
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Abrazo terminado" : "¡Nuevo abrazo!",
      description: isFollowing ? `Ya no estás en abrazo con ${user.name}` : `${user.name} ahora está en tu círculo`
    });
  };

  return (
    <div className="relative">
      {/* Cover Image Section */}
      <div className="relative h-64 md:h-80 overflow-hidden rounded-t-xl">
        {user.coverImage ? (
          <img 
            src={user.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-turquoise-400 via-cyan-500 to-blue-600 relative">
            <div className="absolute inset-0 bg-[url('/ocean-pattern.svg')] opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        )}
        
        {/* Cover Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isOwnProfile && (
            <>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
              <Button
                onClick={() => coverInputRef.current?.click()}
                variant="secondary"
                size="sm"
                className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-0.5 border-0"
                disabled={uploadCoverMutation.isPending}
              >
                <Camera className="mr-2 h-4 w-4" />
                {uploadCoverMutation.isPending ? "Uploading..." : "Edit Cover"}
              </Button>
            </>
          )}
          <Button
            onClick={handleShare}
            variant="secondary"
            size="sm"
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-white/30"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="bg-white rounded-b-xl shadow-sm">
        <div className="px-6 md:px-10 pb-8">
          {/* Avatar and Actions Row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-20 gap-6">
            {/* Avatar Section */}
            <div className="flex items-end gap-4 mb-4 md:mb-0">
              <div className="relative">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-xl">
                  {/* ESA LIFE CEO 56x21 - Fixed profile image with fallback */}
                  <AvatarImage src={user.profileImage || `/images/default-avatar.svg`} />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-turquoise-400 to-cyan-600 text-white">
                    {user.name?.[0] || user.username?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                {isOwnProfile && (
                  <>
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => profileInputRef.current?.click()}
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full shadow-lg bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white border-2 border-white transform transition-all hover:scale-110"
                      disabled={uploadProfileMutation.isPending}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {user.isVerified && (
                  <div className="group absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md cursor-help">
                    <CheckCircle className="h-6 w-6 text-blue-500 fill-current" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      Verified Tango Professional
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Name and Details */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {user.name || user.username || 'Tango Dancer'}
                  </h1>
                  {user.isVerified && (
                    <div className="group relative">
                      <Shield className="h-6 w-6 text-blue-500" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Verified Tango Professional
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600">@{user.username || 'username'}</p>
                  {(user.city || user.country) && (
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {user.city}{user.city && user.country ? ', ' : ''}{user.country}
                    </p>
                  )}
                  {user.bio && (
                    <p className="text-gray-700 max-w-md line-clamp-2">
                      {user.bio}
                    </p>
                  )}
                  {user.city && (
                    <div className="flex items-center gap-1 mt-2">
                      <MapPin className="w-3 h-3 text-turquoise-500" />
                      <span className="text-sm text-gray-600">
                        {user.city}{user.country ? `, ${user.country}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {isOwnProfile ? (
                <>
                  <Button 
                    onClick={onEditProfile}
                    className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleViewAsVisitor}
                    className="border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {viewAsVisitor ? 'View as Owner' : 'View as Visitor'}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={handleFollow}
                    variant={isFollowing ? "outline" : "default"}
                    className={isFollowing ? "border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50" : "bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white"}
                  >
                    {isFollowing ? (
                      <>
                        <Users className="mr-2 h-4 w-4" />
                        En Mi Círculo
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-4 w-4" />
                        Invitar al Abrazo
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50">
                    <Mail className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="outline" size="icon" className="border-turquoise-200 text-turquoise-700 hover:bg-turquoise-50">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {user.bio && (
            <p className="mt-4 text-gray-700 max-w-3xl">
              {user.bio}
            </p>
          )}

          {/* Info Grid */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location & Join Date */}
            <div className="space-y-2">
              {user.city && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-turquoise-500" />
                  <span>{user.city}{user.country && `, ${user.country}`}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 text-turquoise-500" />
                <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</span>
              </div>
              {user.languages && user.languages.length > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe className="h-4 w-4 text-turquoise-500" />
                  <span>{user.languages.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Tango Experience */}
            <div className="space-y-2">
              {user.yearsOfDancing && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Dancing since</span>
                  <Badge variant="secondary" className="bg-turquoise-100 text-turquoise-700">
                    {new Date().getFullYear() - user.yearsOfDancing}
                  </Badge>
                </div>
              )}
              <div className="flex items-center gap-2">
                <RoleEmojiDisplay 
                  tangoRoles={user.tangoRoles} 
                  leaderLevel={user.leaderLevel}
                  followerLevel={user.followerLevel}
                  fallbackRole="dancer"
                  size="sm"
                  maxRoles={3}
                />
              </div>
            </div>

            {/* Social Links */}
            {user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
              <div className="flex items-center gap-3">
                {user.socialLinks.instagram && (
                  <a 
                    href={`https://instagram.com/${user.socialLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-pink-600 transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {user.socialLinks.facebook && (
                  <a 
                    href={user.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {user.socialLinks.twitter && (
                  <a 
                    href={`https://twitter.com/${user.socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-400 transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {user.socialLinks.website && (
                  <a 
                    href={user.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-turquoise-600 transition-colors"
                  >
                    <Link className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-8 justify-center md:justify-start">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats?.posts || 0}</p>
                <p className="text-sm text-gray-600">Recuerdos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats?.followers || 0}</p>
                <p className="text-sm text-gray-600">Mi Círculo</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats?.following || 0}</p>
                <p className="text-sm text-gray-600">Siguiendo</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats?.events || 0}</p>
                <p className="text-sm text-gray-600">Milongas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats?.photos || 0}</p>
                <p className="text-sm text-gray-600">Photos</p>
              </div>
              {user.profileViews !== undefined && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{user.profileViews}</p>
                  <p className="text-sm text-gray-600">Profile Views</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Image Cropper Modals */}
      {tempCoverImage && (
        <ImageCropper
          open={showCoverCropper}
          onClose={() => {
            setShowCoverCropper(false);
            setTempCoverImage(null);
          }}
          onCropComplete={handleCoverCropComplete}
          imageUrl={tempCoverImage}
          aspectRatio={16 / 9}
          title="Crop Cover Photo"
        />
      )}
      
      {tempProfileImage && (
        <ImageCropper
          open={showProfileCropper}
          onClose={() => {
            setShowProfileCropper(false);
            setTempProfileImage(null);
          }}
          onCropComplete={handleProfileCropComplete}
          imageUrl={tempProfileImage}
          aspectRatio={1}
          cropShape="round"
          title="Crop Profile Photo"
        />
      )}
    </div>
  );
}