"use client";
import React from 'react';
import { Avatar, Button } from '@mui/material';
import { LocationOn, Group, Event } from '@mui/icons-material';

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
  onJoin?: (communityId: number) => void;
  onLeave?: (communityId: number) => void;
  onClick?: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ 
  community, 
  onJoin, 
  onLeave,
  onClick 
}) => {
  return (
    <div className="bg-white rounded-[12px] shadow-md overflow-hidden mb-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      {/* Community Image */}
      <div className="relative h-40 bg-gradient-to-r from-[#8E142E] to-[#0D448A]">
        {community.imageUrl ? (
          <img
            src={community.imageUrl}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#8E142E] to-[#0D448A] flex items-center justify-center">
            <Group className="text-white text-4xl" />
          </div>
        )}
      </div>

      {/* Community Content */}
      <div className="p-4">
        {/* Community Name */}
        <h3 className="text-xl font-bold text-black mb-2 line-clamp-2">
          {community.name}
        </h3>

        {/* Community Description */}
        <p className="text-[#64748B] text-sm mb-3 line-clamp-3">
          {community.description}
        </p>

        {/* Community Stats */}
        <div className="space-y-2 mb-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <LocationOn className="text-[#0D448A] text-lg" />
            <span className="line-clamp-1">{community.location}</span>
          </div>

          {/* Members */}
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <Group className="text-[#0D448A] text-lg" />
            <span>{community.memberCount} members</span>
          </div>

          {/* Events */}
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <Event className="text-[#0D448A] text-lg" />
            <span>{community.eventCount} events</span>
          </div>
        </div>

        {/* Join/Leave Button */}
        <div className="flex justify-end">
          <Button
            variant={community.isJoined ? "outlined" : "contained"}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              community.isJoined 
                ? onLeave?.(community.id) 
                : onJoin?.(community.id)
            }}
            sx={{
              backgroundColor: community.isJoined ? 'transparent' : '#0D448A',
              color: community.isJoined ? '#0D448A' : 'white',
              borderColor: '#0D448A',
              '&:hover': {
                backgroundColor: community.isJoined ? '#f5f5f5' : '#0a3570',
              },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              padding: '6px 20px',
            }}
          >
            {community.isJoined ? 'Leave' : 'Join'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;