import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Calendar, 
  Edit, 
  Plus,
  Camera,
  Users,
  Heart,
  Video,
  Info,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import RoleBadge from '@/components/RoleBadge';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  profileImage?: string;
  backgroundImage?: string;
  bio?: string;
  country?: string;
  city?: string;
  tangoRoles?: string[];
  yearsOfDancing?: number;
  leaderLevel?: number;
  followerLevel?: number;
  languages?: string[];
  createdAt: string;
}

interface ProfileHeadProps {
  user: User;
  isOwnProfile?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onEditProfile?: () => void;
  onAddTravelDetails?: () => void;
}

export default function ProfileHead({ 
  user, 
  isOwnProfile = false, 
  activeTab = 'about',
  onTabChange,
  onEditProfile,
  onAddTravelDetails
}: ProfileHeadProps) {
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    onTabChange?.(tab);
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, string> = {
      teacher: '📚',
      dj: '🎵',
      organizer: '🎪',
      performer: '⭐',
      host: '🏠',
      dancer: '💃',
      photographer: '📸',
      tango_traveler: '🌍',
      vendor: '🛒',
      wellness_provider: '💆'
    };
    return icons[role] || '🎯';
  };

  return (
    <Card className="overflow-hidden">
      {/* Background Cover */}
      <div 
        className="h-48 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 relative"
        style={{
          backgroundImage: user.backgroundImage ? `url(${user.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        
        {/* Cover Photo Edit Button */}
        {isOwnProfile && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
          >
            <Camera className="mr-2 h-4 w-4" />
            Edit Cover
          </Button>
        )}
      </div>

      <CardContent className="relative px-6 pb-6">
        {/* Profile Picture */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={user.profileImage} />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                {user.name?.[0] || user.username?.[0]}
              </AvatarFallback>
            </Avatar>
            
            {isOwnProfile && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-0 right-0 bg-white shadow-md hover:bg-gray-50 rounded-full p-2"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 sm:mt-0">
            {isOwnProfile ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={onAddTravelDetails}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Travel Details
                </Button>
                <Button 
                  onClick={onEditProfile}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Add Friend
                </Button>
                <Button>
                  Message
                </Button>
              </>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-4">
          {/* Name and Roles */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {user.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                {user.tangoRoles?.slice(0, 3).map((role) => (
                  <RoleBadge key={role} role={role} size="sm" />
                ))}
                {user.tangoRoles && user.tangoRoles.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{user.tangoRoles.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Username and Location */}
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <span>@{user.username}</span>
              {user.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.city}{user.country && `, ${user.country}`}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(user.createdAt).getFullYear()}</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-gray-700 max-w-2xl">
              {user.bio}
            </p>
          )}

          {/* Dancing Experience */}
          {(user.yearsOfDancing || user.leaderLevel || user.followerLevel) && (
            <div className="flex flex-wrap gap-4 text-sm">
              {user.yearsOfDancing && (
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                  <span className="font-medium">Dancing:</span>
                  <span>{user.yearsOfDancing} years</span>
                </div>
              )}
              {user.leaderLevel && user.leaderLevel > 0 && (
                <div className="flex items-center gap-2 bg-blue-100 rounded-lg px-3 py-1">
                  <span className="font-medium">Leader:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-2 h-2 rounded-full",
                          i < user.leaderLevel ? "bg-blue-500" : "bg-gray-300"
                        )} 
                      />
                    ))}
                  </div>
                </div>
              )}
              {user.followerLevel && user.followerLevel > 0 && (
                <div className="flex items-center gap-2 bg-pink-100 rounded-lg px-3 py-1">
                  <span className="font-medium">Follower:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-2 h-2 rounded-full",
                          i < user.followerLevel ? "bg-pink-500" : "bg-gray-300"
                        )} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Languages */}
          {user.languages && user.languages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">Languages:</span>
              {user.languages.map((language) => (
                <Badge key={language} variant="secondary" className="capitalize">
                  {language}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Profile Tabs */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="mt-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              About
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="resume" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Resume
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
}