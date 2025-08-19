import React from 'react';
import { Users, Calendar, MapPin, ArrowRight, Globe, Heart, Music } from 'lucide-react';
import { Link } from 'wouter';

interface EnhancedCityGroupCardProps {
  group: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    image_url?: string;
    city: string;
    country?: string;
    memberCount: number;
    eventCount?: number;
    isJoined?: boolean;
    type: string;
  };
  onJoin?: () => void;
  onLeave?: () => void;
}

const EnhancedCityGroupCard: React.FC<EnhancedCityGroupCardProps> = ({ 
  group, 
  onJoin, 
  onLeave 
}) => {
  const imageUrl = group.imageUrl || group.image_url;
  
  // Default Buenos Aires image if no image is provided
  const defaultBuenosAiresImage = 'https://images.pexels.com/photos/2238435/pexels-photo-2238435.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  const displayImage = imageUrl || (group.city === 'Buenos Aires' ? defaultBuenosAiresImage : null);
  
  return (
    <Link href={`/groups/${group.slug}`}>
      <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group">
        {/* Background Image with Overlay */}
        <div className="relative h-56 overflow-hidden">
          {displayImage ? (
            <>
              <img
                src={displayImage}
                alt={group.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500">
              <div className="absolute inset-0 bg-black/20" />
            </div>
          )}
          
          {/* City Flag/Icon */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
            <Globe className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-800">City Group</span>
          </div>
          
          {/* Member Status Badge */}
          {group.isJoined && (
            <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full px-3 py-1 text-sm font-medium flex items-center gap-1">
              <Heart className="h-3 w-3 fill-current" />
              Member
            </div>
          )}
          
          {/* City Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
              {group.city}
              {group.country && <span className="text-lg font-normal">, {group.country}</span>}
            </h3>
            <p className="text-white/90 text-sm">
              {group.description || `Connect with tango dancers in ${group.city}`}
            </p>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="p-6 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{group.memberCount || 0}</p>
                <p className="text-sm text-gray-600">Members</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{group.eventCount || 0}</p>
                <p className="text-sm text-gray-600">Events</p>
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Music className="h-4 w-4" />
                <span>Active tango community</span>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
          
          {/* Action Button */}
          <button
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
              group.isJoined 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              group.isJoined ? onLeave?.() : onJoin?.();
            }}
          >
            {group.isJoined ? 'Leave Group' : 'Join Community'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default EnhancedCityGroupCard;