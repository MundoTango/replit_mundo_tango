import React from 'react';
import { 
  Shield, Users, Settings, Crown, GraduationCap, Music, UserCheck, 
  Camera, Palette, MapPin, Heart, ShoppingBag, Hotel, Building,
  Plane, Star, Mic, MonitorSpeaker, Home, Scissors, Bed, Book,
  Calendar, Disc, Flag, Bot
} from 'lucide-react';

interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const roleIcons: Record<string, any> = {
  // Community roles
  dancer: Music,
  performer: Star,
  teacher: GraduationCap,
  learning_source: Book,
  dj: MonitorSpeaker,
  musician: Mic,
  organizer: Calendar,
  host: Home,
  photographer: Camera,
  content_creator: Palette,
  choreographer: Scissors,
  tango_traveler: MapPin,
  tour_operator: Plane,
  vendor: ShoppingBag,
  wellness_provider: Heart,
  tango_school: Building,
  tango_hotel: Bed,
  
  // Platform roles
  guest: UserCheck,
  super_admin: Crown,
  admin: Shield,
  moderator: Flag,
  curator: Star,
  bot: Bot
};

const roleColors: Record<string, string> = {
  // Community roles - various colors
  dancer: 'bg-purple-100 text-purple-800 border-purple-200',
  performer: 'bg-pink-100 text-pink-800 border-pink-200',
  teacher: 'bg-green-100 text-green-800 border-green-200',
  learning_source: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  dj: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  musician: 'bg-violet-100 text-violet-800 border-violet-200',
  organizer: 'bg-blue-100 text-blue-800 border-blue-200',
  host: 'bg-rose-100 text-rose-800 border-rose-200',
  photographer: 'bg-amber-100 text-amber-800 border-amber-200',
  content_creator: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  choreographer: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  tango_traveler: 'bg-teal-100 text-teal-800 border-teal-200',
  tour_operator: 'bg-sky-100 text-sky-800 border-sky-200',
  vendor: 'bg-orange-100 text-orange-800 border-orange-200',
  wellness_provider: 'bg-lime-100 text-lime-800 border-lime-200',
  tango_school: 'bg-slate-100 text-slate-800 border-slate-200',
  tango_hotel: 'bg-stone-100 text-stone-800 border-stone-200',
  
  // Platform roles - administrative colors
  guest: 'bg-gray-100 text-gray-800 border-gray-200',
  super_admin: 'bg-red-100 text-red-800 border-red-200',
  admin: 'bg-red-100 text-red-800 border-red-200',
  moderator: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  curator: 'bg-purple-100 text-purple-800 border-purple-200',
  bot: 'bg-gray-100 text-gray-800 border-gray-200'
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base'
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5'
};

export default function RoleBadge({ 
  role, 
  size = 'md', 
  showIcon = true, 
  className = '' 
}: RoleBadgeProps) {
  const IconComponent = roleIcons[role] || UserCheck;
  const colorClass = roleColors[role] || roleColors.guest;
  const sizeClass = sizeClasses[size];
  const iconSize = iconSizes[size];
  
  const displayName = role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full border font-medium
      ${colorClass}
      ${sizeClass}
      ${className}
    `}>
      {showIcon && <IconComponent className={iconSize} />}
      <span>{displayName}</span>
    </span>
  );
}