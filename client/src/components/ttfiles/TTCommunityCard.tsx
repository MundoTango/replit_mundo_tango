import React from 'react';
import { Users, Globe, Calendar, TrendingUp, MapPin, Star } from 'lucide-react';
import '../../styles/ttfiles.css';

interface TTCommunityCardProps {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  location?: string;
  category: string;
  icon?: React.ReactNode;
  coverImage?: string;
  isJoined?: boolean;
  rating?: number;
  activeEvents?: number;
  createdAt?: Date;
  onJoin?: (communityId: string) => void;
  onClick?: () => void;
}

const TTCommunityCard: React.FC<TTCommunityCardProps> = ({
  id,
  name,
  description,
  memberCount,
  location,
  category,
  icon,
  coverImage,
  isJoined = false,
  rating,
  activeEvents,
  createdAt,
  onJoin,
  onClick
}) => {
  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onJoin) {
      onJoin(id);
    }
  };

  const formatMemberCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getCategoryIcon = () => {
    const categoryIcons: Record<string, React.ReactNode> = {
      'milonga': '💃',
      'practice': '🎯',
      'social': '🤝',
      'festival': '🎉',
      'education': '📚',
      'performance': '🎭',
      'general': '🌟'
    };
    return categoryIcons[category.toLowerCase()] || '🌟';
  };

  return (
    <div 
      className="tt-card tt-community-card tt-fade-in" 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Cover Image or Gradient */}
      {coverImage ? (
        <div className="h-32 overflow-hidden">
          <img 
            src={coverImage} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600" />
      )}

      {/* Card Body */}
      <div className="tt-card-body text-center">
        {/* Icon */}
        <div className="tt-community-icon mx-auto mb-4">
          {icon || getCategoryIcon()}
        </div>

        {/* Community Name */}
        <h3 className="tt-community-name text-gray-900">{name}</h3>

        {/* Category Badge */}
        <div className="mb-3">
          <span className="tt-badge tt-badge-secondary">
            {category}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {description}
        </p>

        {/* Community Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600">
              <Users className="w-4 h-4" />
              <span className="font-semibold">{formatMemberCount(memberCount)}</span>
            </div>
            <div className="text-xs text-gray-500">Members</div>
          </div>
          
          {activeEvents !== undefined && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">{activeEvents}</span>
              </div>
              <div className="text-xs text-gray-500">Active Events</div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="space-y-2 mb-4">
          {location && (
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
            </div>
          )}
          
          {rating && (
            <div className="flex items-center justify-center gap-1 text-xs">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-gray-600">{rating.toFixed(1)} rating</span>
            </div>
          )}
        </div>

        {/* Member Count */}
        <div className="tt-community-members">
          {memberCount.toLocaleString()} members
        </div>
      </div>

      {/* Card Footer */}
      <div className="tt-card-footer">
        <button 
          className={`w-full ${isJoined ? 'tt-btn tt-btn-outline' : 'tt-btn tt-btn-primary'}`}
          onClick={handleJoin}
        >
          {isJoined ? 'Leave Community' : 'Join Community'}
        </button>
      </div>
    </div>
  );
};

export default TTCommunityCard;