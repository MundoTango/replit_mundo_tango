import React from 'react';

// Mapping of role IDs to emojis - matches registration form exactly
export const roleEmojiMapping: Record<string, { emoji: string; label: string }> = {
  dancer: { emoji: "💃", label: "Social Dancer" },
  performer: { emoji: "⭐", label: "Professional Performer" },
  teacher: { emoji: "📚", label: "Tango Teacher" },
  learning_source: { emoji: "📖", label: "Learning Resource" },
  dj: { emoji: "🎵", label: "Tango DJ" },
  musician: { emoji: "🎼", label: "Tango Musician" },
  organizer: { emoji: "🎪", label: "Event Organizer" },
  host: { emoji: "🏠", label: "Host/Venue Owner" },
  guide: { emoji: "🗺️", label: "Tango Guide" },
  photographer: { emoji: "📸", label: "Tango Photographer" },
  content_creator: { emoji: "🎙️", label: "Content Creator" },
  choreographer: { emoji: "✨", label: "Choreographer" },
  tango_traveler: { emoji: "🌍", label: "Tango Traveler" },
  tour_operator: { emoji: "✈️", label: "Tour Operator" },
  vendor: { emoji: "🛒", label: "Tango Vendor" },
  wellness_provider: { emoji: "💆", label: "Wellness Provider" },
  tango_school: { emoji: "🏫", label: "Tango School" },
  tango_hotel: { emoji: "🏨", label: "Tango Hotel" },
  other: { emoji: "➕", label: "Other" }
};

interface RoleEmojiDisplayProps {
  roles: string[];
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function RoleEmojiDisplay({ 
  roles, 
  showLabels = false, 
  size = 'md',
  className = '' 
}: RoleEmojiDisplayProps) {
  if (!roles || roles.length === 0) return null;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {roles.map((role) => {
        const roleData = roleEmojiMapping[role];
        if (!roleData) return null;

        return (
          <span
            key={role}
            className={`inline-flex items-center gap-1 ${sizeClasses[size]}`}
            title={roleData.label}
          >
            <span className="leading-none">{roleData.emoji}</span>
            {showLabels && (
              <span className="text-xs text-gray-600">{roleData.label}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

// Utility function to get emoji for a single role
export function getRoleEmoji(role: string): string {
  return roleEmojiMapping[role]?.emoji || '';
}

// Utility function to get label for a single role
export function getRoleLabel(role: string): string {
  return roleEmojiMapping[role]?.label || role;
}

// Utility function to get all role data
export function getRoleData(role: string): { emoji: string; label: string } | undefined {
  return roleEmojiMapping[role];
}