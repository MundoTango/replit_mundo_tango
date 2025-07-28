import React from 'react';

// Mapping of tango roles to emojis
export const tangoRoleEmojis: Record<string, string> = {
  'dancer': '💃',
  'performer': '🎭',
  'teacher': '🎓',
  'dj': '🎧',
  'musician': '🎵',
  'organizer': '📅',
  'host': '🏠',
  'guide': '🗺️',
  'photographer': '📸',
  'content_creator': '📱',
  'tango_traveler': '🌍',
  'tour_operator': '✈️',
  'volunteer': '🤝',
  'historian': '📚',
  'singer': '🎤',
  'taxi_dancer': '🎫',
  'dancer_leader': '🕺',
  'dancer_follower': '💃',
  'dancer_switch': '🕺💃',
  'tango_school': '🏫',
  'tango_house': '🏢'
};

interface TangoRoleEmojisProps {
  roles?: string[] | string;
  className?: string;
  showLimit?: number;
}

export const TangoRoleEmojis: React.FC<TangoRoleEmojisProps> = ({ 
  roles, 
  className = "",
  showLimit = 3 
}) => {
  if (!roles) return null;
  
  // Convert string to array if necessary
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  
  // Filter valid roles and limit display
  const validRoles = rolesArray
    .filter(role => tangoRoleEmojis[role])
    .slice(0, showLimit);
  
  if (validRoles.length === 0) return null;
  
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {validRoles.map((role, index) => (
        <span
          key={index}
          className="text-sm opacity-90 hover:opacity-100 transition-opacity"
          title={role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        >
          {tangoRoleEmojis[role]}
        </span>
      ))}
      {rolesArray.length > showLimit && (
        <span className="text-xs text-gray-500 ml-0.5">
          +{rolesArray.length - showLimit}
        </span>
      )}
    </span>
  );
};

export default TangoRoleEmojis;