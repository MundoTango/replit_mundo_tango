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
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Community Image */}
      <div className="relative h-40" style={{ background: 'linear-gradient(135deg, #8E142E 0%, #0D448A 100%)' }}>
        {community.imageUrl ? (
          <img
            src={community.imageUrl}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="text-white text-4xl h-12 w-12" />
          </div>
        )}
      </div>

      {/* Community Content */}
      <div className="p-4">
        {/* Community Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {community.name}
        </h3>

        {/* Community Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {community.description}
        </p>

        {/* Community Stats */}
        <div className="space-y-2 mb-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="text-[#0D448A] h-4 w-4" />
            <span className="line-clamp-1">{community.location}</span>
          </div>

          {/* Members */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="text-[#0D448A] h-4 w-4" />
            <span>{community.memberCount} members</span>
          </div>

          {/* Events */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="text-[#0D448A] h-4 w-4" />
            <span>{community.eventCount} events</span>
          </div>
        </div>

        {/* Join/Leave Button */}
        <div className="flex justify-end">
          <button
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              community.isJoined 
                ? 'bg-white text-[#0D448A] border-2 border-[#0D448A] hover:bg-gray-50'
                : 'bg-[#0D448A] text-white hover:bg-[#0a3570]'
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