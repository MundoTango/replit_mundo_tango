/**
 * 🏗️ 11L Platform-Wide Role Emoji Display Component
 * Layer 2: Component Layer - Reusable role emoji indicators with hover tooltips
 */

import React from 'react';
import { getTangoRoleById, mapUserRoleToTangoRole, TangoRole, processDancerRoles } from '@/utils/tangoRoles';

interface RoleEmojiDisplayProps {
  /** Array of role IDs from user's tangoRoles field */
  tangoRoles?: string[];
  /** Fallback role for users without tangoRoles data */
  fallbackRole?: string;
  /** User leader level from registration */
  leaderLevel?: number;
  /** User follower level from registration */
  followerLevel?: number;
  /** Size variant for different contexts */
  size?: 'sm' | 'md' | 'lg';
  /** Maximum number of roles to display */
  maxRoles?: number;
  /** Custom className for styling */
  className?: string;
}

export const RoleEmojiDisplay: React.FC<RoleEmojiDisplayProps> = ({
  tangoRoles,
  fallbackRole = 'dancer',
  leaderLevel,
  followerLevel,
  size = 'md',
  maxRoles = 5,
  className = ''
}) => {
  // Determine role objects to display with dancer automation
  const roleObjects: TangoRole[] = React.useMemo(() => {
    if (tangoRoles && tangoRoles.length > 0) {
      // Process dancer roles with leader/follower levels
      const processedRoles = processDancerRoles(tangoRoles, leaderLevel, followerLevel);
      
      // Map processed roles to role objects, filter out undefined, and limit to maxRoles
      return processedRoles
        .map(roleId => getTangoRoleById(roleId))
        .filter((role): role is TangoRole => role !== undefined)
        .slice(0, maxRoles);
    } else {
      // Fallback to mapped role
      return [mapUserRoleToTangoRole(fallbackRole)];
    }
  }, [tangoRoles, leaderLevel, followerLevel, fallbackRole, maxRoles]);

  // Size configurations
  const sizeConfig = {
    sm: {
      emoji: 'text-sm',
      spacing: 'space-x-0.5'
    },
    md: {
      emoji: 'text-base',
      spacing: 'space-x-1'
    },
    lg: {
      emoji: 'text-lg',
      spacing: 'space-x-1'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center ${config.spacing} ${className}`}>
      {roleObjects.map((role, index) => (
        <span
          key={`${role.id}-${index}`}
          className={`
            ${config.emoji} 
            cursor-pointer 
            hover:scale-110 
            transition-transform 
            duration-200 
            select-none
          `}
          title={`${role.name}: ${role.description}`}
          role="img"
          aria-label={`${role.name}: ${role.description}`}
        >
          {role.emoji}
        </span>
      ))}
      
      {/* Show "+X more" indicator if there are more roles */}
      {tangoRoles && tangoRoles.length > maxRoles && (
        <span 
          className={`
            ${config.emoji} 
            text-gray-400 
            cursor-pointer 
            hover:text-gray-600 
            transition-colors
          `}
          title={`${tangoRoles.length - maxRoles} more roles`}
        >
          +{tangoRoles.length - maxRoles}
        </span>
      )}
    </div>
  );
};

export default RoleEmojiDisplay;