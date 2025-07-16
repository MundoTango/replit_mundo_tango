import React from 'react';
import { Users, Calendar, MapPin } from 'lucide-react';

interface CommunityCardProps {
  community: {
    id: number;
    name: string;
    description: string;
    imageUrl?: string;
    location: string;
    memberCount: number;
    eventCount: number;
    isJoined?: boolean;
  };
  onJoin?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ 
  community, 
  onJoin, 
  onLeave,
  onClick 
}) => {
  // Fallback image for city groups
  const getCityFallbackImage = (name: string) => {
    if (name.toLowerCase().includes('buenos aires')) {
      return 'https://images.pexels.com/photos/16228260/pexels-photo-16228260.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&fit=crop';
    }
    return null;
  };

  const displayImage = community.imageUrl || getCityFallbackImage(community.name);

  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group"
      onClick={onClick}
    >
      {/* Community Image */}
      <div className="relative h-48 overflow-hidden">
        {displayImage ? (
          <>
            <img
              src={displayImage}
              alt={community.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #38b2ac 0%, #3182ce 100%)' }}>
            <Users className="text-white text-4xl h-12 w-12" />
          </div>
        )}
        
        {/* Floating member/event badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 shadow-md">
            <Users className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-gray-800">{community.memberCount}</span>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 shadow-md">
            <Calendar className="h-3.5 w-3.5 text-green-600" />
            <span className="text-xs font-semibold text-gray-800">{community.eventCount}</span>
          </div>
        </div>
      </div>

      {/* Community Content */}
      <div className="p-5">
        {/* Community Name with gradient effect */}
        <h3 className="text-xl font-bold mb-2 line-clamp-2 bg-gradient-to-r from-turquoise-500 to-blue-500 bg-clip-text text-transparent">
          {community.name}
        </h3>

        {/* Location with enhanced styling */}
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
          <MapPin className="h-4 w-4 text-pink-500 flex-shrink-0" />
          <span className="font-medium">{community.location}</span>
        </div>

        {/* Community Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {community.description}
        </p>

        {/* Enhanced Stats Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex gap-4">
            {/* Members stat */}
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">{community.memberCount}</span>
              <span className="text-xs text-gray-500">members</span>
            </div>

            {/* Events stat */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold text-gray-700">{community.eventCount}</span>
              <span className="text-xs text-gray-500">events</span>
            </div>
          </div>

          {/* Join/Leave Button with gradient */}
          <button
            className={`px-4 py-1.5 rounded-full font-medium text-sm transition-all transform hover:scale-105 ${
              community.isJoined 
                ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                : 'bg-gradient-to-r from-turquoise-500 to-blue-500 text-white hover:shadow-lg'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              community.isJoined 
                ? onLeave?.() 
                : onJoin?.();
            }}
          >
            {community.isJoined ? 'Leave' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;