/**
 * 🏗️ 11L Enhanced Tooltip Component - Fun UI Hover Descriptions
 * Layer 2: Component Layer - Custom styled tooltips with animations and personality
 */

import React, { useState } from 'react';
import { TangoRole } from '@/utils/tangoRoles';

interface EnhancedTooltipProps {
  role: TangoRole;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({ 
  role, 
  children, 
  size = 'md' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Role-specific styling and enhanced descriptions
  const getRoleTooltipStyle = (role: TangoRole) => {
    const styles = {
      'dancer_leader': {
        gradient: 'from-blue-500 via-purple-500 to-indigo-600',
        accent: 'border-blue-400',
        description: 'Dancer: Leader',
        subtitle: ''
      },
      'dancer_follower': {
        gradient: 'from-pink-500 via-rose-500 to-red-500',
        accent: 'border-pink-400',
        description: 'Dancer: Follower',
        subtitle: ''
      },
      'dancer_switch': {
        gradient: 'from-purple-500 via-indigo-500 to-blue-500',
        accent: 'border-purple-400',
        description: 'Dancer: Switch',
        subtitle: ''
      },
      'dancer': {
        gradient: 'from-teal-500 via-cyan-500 to-blue-500',
        accent: 'border-teal-400',
        description: 'Dancer',
        subtitle: ''
      },
      'dj': {
        gradient: 'from-purple-600 via-violet-600 to-indigo-700',
        accent: 'border-purple-400',
        description: 'DJ',
        subtitle: ''
      },
      'teacher': {
        gradient: 'from-green-500 via-emerald-500 to-teal-600',
        accent: 'border-green-400',
        description: 'Teacher',
        subtitle: ''
      },
      'organizer': {
        gradient: 'from-orange-500 via-amber-500 to-yellow-600',
        accent: 'border-orange-400',
        description: 'Organizer',
        subtitle: ''
      },
      'performer': {
        gradient: 'from-red-500 via-pink-500 to-rose-600',
        accent: 'border-red-400',
        description: 'Performer',
        subtitle: ''
      },
      'musician': {
        gradient: 'from-indigo-500 via-blue-500 to-cyan-600',
        accent: 'border-indigo-400',
        description: 'Musician',
        subtitle: ''
      },
      'photographer': {
        gradient: 'from-gray-600 via-slate-600 to-zinc-700',
        accent: 'border-gray-400',
        description: 'Photographer',
        subtitle: ''
      },
      'traveler': {
        gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
        accent: 'border-emerald-400',
        description: 'Traveler',
        subtitle: ''
      },
      'host': {
        gradient: 'from-amber-500 via-orange-500 to-red-600',
        accent: 'border-amber-400',
        description: 'Host',
        subtitle: ''
      },
      'guide': {
        gradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
        accent: 'border-violet-400',
        description: 'Guide',
        subtitle: ''
      }
    };

    return styles[role.id as keyof typeof styles] || styles.dancer;
  };

  const tooltipStyle = getRoleTooltipStyle(role);

  const sizeConfig = {
    sm: { tooltip: 'text-xs max-w-48', emoji: 'text-lg' },
    md: { tooltip: 'text-sm max-w-56', emoji: 'text-xl' },
    lg: { tooltip: 'text-base max-w-64', emoji: 'text-2xl' }
  };

  const config = sizeConfig[size];

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {/* Enhanced Custom Tooltip */}
      {isVisible && (
        <div className={`
          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50
          ${config.tooltip}
          animate-in fade-in-0 zoom-in-95 duration-200
        `}>
          {/* Tooltip Content */}
          <div className={`
            bg-gradient-to-r ${tooltipStyle.gradient}
            text-white px-4 py-3 rounded-xl shadow-2xl
            border-2 ${tooltipStyle.accent} border-opacity-30
            backdrop-blur-sm relative
            transform hover:scale-105 transition-all duration-300
          `}>
            {/* Sparkle Animation */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full opacity-70 animate-ping"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-300 rounded-full opacity-60 animate-pulse"></div>
            
            {/* Main Content */}
            <div className="text-center space-y-1">
              <div className={`${config.emoji} filter drop-shadow-lg`}>
                {role.emoji}
              </div>
              <div className="font-bold text-shadow-sm">
                {tooltipStyle.description}
              </div>
              <div className="text-xs opacity-90 italic">
                {tooltipStyle.subtitle}
              </div>
            </div>

            {/* Tooltip Arrow */}
            <div className={`
              absolute top-full left-1/2 transform -translate-x-1/2
              w-0 h-0 border-l-4 border-r-4 border-t-4
              border-l-transparent border-r-transparent 
              border-t-white border-opacity-20
            `}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTooltip;