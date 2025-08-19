import React from 'react';
import { Users, Calendar, MapPin, Award, Mail, MessageCircle } from 'lucide-react';
import '../../styles/ttfiles.css';

interface TTProfileHeadProps {
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    coverImage?: string;
    bio?: string;
    location?: string;
    joinDate: Date;
    roles: string[];
    followers: number;
    following: number;
    events: number;
    yearsOfDancing?: number;
  };
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
  onEditProfile?: () => void;
}

const TTProfileHead: React.FC<TTProfileHeadProps> = ({
  user,
  isOwnProfile = false,
  isFollowing = false,
  onFollow,
  onMessage,
  onEditProfile
}) => {
  const getRoleBadgeColor = (role: string) => {
    const roleColors: Record<string, string> = {
      'dancer': 'tt-badge-primary',
      'teacher': 'tt-badge-secondary',
      'organizer': 'tt-badge-success',
      'dj': 'tt-badge-warning',
      'performer': 'bg-purple-600 text-white',
      'admin': 'bg-gray-800 text-white'
    };
    return roleColors[role.toLowerCase()] || 'bg-gray-500 text-white';
  };

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="tt-profile-head">
      {/* Cover Image */}
      <div className="relative h-48 -mx-8 -mt-8 mb-4">
        {user.coverImage ? (
          <img 
            src={user.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600" />
        )}
      </div>

      {/* Profile Info */}
      <div className="tt-profile-info">
        {/* Avatar */}
        <div className="relative">
          <div className="tt-profile-avatar">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="tt-profile-details flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1>{user.name}</h1>
              <p className="text-lg opacity-90 mb-2">@{user.username}</p>
              
              {/* Role Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {user.roles.map((role, index) => (
                  <span key={index} className={`tt-badge ${getRoleBadgeColor(role)}`}>
                    {role}
                  </span>
                ))}
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-base opacity-90 mb-3 max-w-2xl">{user.bio}</p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm opacity-80">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatJoinDate(user.joinDate)}</span>
                </div>
                {user.yearsOfDancing && (
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    <span>{user.yearsOfDancing} years dancing</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isOwnProfile ? (
                <button 
                  className="tt-btn tt-btn-outline bg-white text-gray-900 border-white hover:bg-gray-100"
                  onClick={onEditProfile}
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button 
                    className={`tt-btn ${isFollowing ? 'tt-btn-outline bg-white text-gray-900 border-white hover:bg-gray-100' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
                    onClick={onFollow}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button 
                    className="tt-btn tt-btn-outline bg-transparent text-white border-white hover:bg-white hover:text-gray-900"
                    onClick={onMessage}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="tt-profile-stats">
            <div className="tt-profile-stat">
              <span className="tt-profile-stat-value">{user.followers.toLocaleString()}</span>
              <span className="tt-profile-stat-label">Followers</span>
            </div>
            <div className="tt-profile-stat">
              <span className="tt-profile-stat-value">{user.following.toLocaleString()}</span>
              <span className="tt-profile-stat-label">Following</span>
            </div>
            <div className="tt-profile-stat">
              <span className="tt-profile-stat-value">{user.events.toLocaleString()}</span>
              <span className="tt-profile-stat-label">Events</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TTProfileHead;