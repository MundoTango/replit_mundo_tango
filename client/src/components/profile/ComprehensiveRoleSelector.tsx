import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  Users, 
  Mic, 
  Star, 
  GraduationCap, 
  Heart,
  Calendar,
  MapPin,
  Briefcase,
  Sparkles,
  Globe,
  Baby
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  details: string[];
}

interface ComprehensiveRoleSelectorProps {
  selectedRoles: string[];
  onRoleChange: (roles: string[]) => void;
}

const tangoRoles: Role[] = [
  {
    id: 'dancer',
    name: 'dancer',
    label: 'Social Dancer',
    description: 'I enjoy dancing tango socially at milongas and events',
    icon: <Heart className="w-5 h-5" />,
    color: 'from-pink-400 to-rose-500',
    details: [
      'Attend milongas regularly',
      'Dance for pleasure and connection',
      'Enjoy the social aspect of tango',
      'Focus on musicality and embrace'
    ]
  },
  {
    id: 'teacher',
    name: 'teacher',
    label: 'Tango Teacher',
    description: 'I teach tango classes, workshops, or private lessons',
    icon: <GraduationCap className="w-5 h-5" />,
    color: 'from-purple-400 to-indigo-500',
    details: [
      'Lead regular classes',
      'Conduct workshops and seminars',
      'Offer private lessons',
      'Share technique and philosophy'
    ]
  },
  {
    id: 'organizer',
    name: 'organizer',
    label: 'Event Organizer',
    description: 'I organize milongas, festivals, or tango events',
    icon: <Calendar className="w-5 h-5" />,
    color: 'from-blue-400 to-cyan-500',
    details: [
      'Host regular milongas',
      'Organize tango festivals',
      'Coordinate workshops and events',
      'Build tango communities'
    ]
  },
  {
    id: 'dj',
    name: 'dj',
    label: 'Tango DJ',
    description: 'I DJ at milongas and tango events',
    icon: <Music className="w-5 h-5" />,
    color: 'from-green-400 to-emerald-500',
    details: [
      'Create tandas and cortinas',
      'Read the dance floor energy',
      'Curate musical journeys',
      'Mix traditional and nuevo'
    ]
  },
  {
    id: 'performer',
    name: 'performer',
    label: 'Professional Performer',
    description: 'I perform tango professionally on stage',
    icon: <Star className="w-5 h-5" />,
    color: 'from-yellow-400 to-orange-500',
    details: [
      'Stage performances',
      'Show choreography',
      'Competition dancing',
      'Entertainment venues'
    ]
  },
  {
    id: 'musician',
    name: 'musician',
    label: 'Tango Musician',
    description: 'I play tango music professionally',
    icon: <Mic className="w-5 h-5" />,
    color: 'from-red-400 to-pink-500',
    details: [
      'Play in tango orchestras',
      'Perform at milongas',
      'Compose tango music',
      'Record tango albums'
    ]
  },
  {
    id: 'producer',
    name: 'producer',
    label: 'Festival Producer',
    description: 'I produce large-scale tango festivals and events',
    icon: <Briefcase className="w-5 h-5" />,
    color: 'from-indigo-400 to-purple-500',
    details: [
      'Produce major festivals',
      'Manage event logistics',
      'Book international artists',
      'Create tango experiences'
    ]
  },
  {
    id: 'blogger',
    name: 'blogger',
    label: 'Tango Blogger/Influencer',
    description: 'I create content about tango culture and community',
    icon: <Globe className="w-5 h-5" />,
    color: 'from-cyan-400 to-blue-500',
    details: [
      'Write about tango culture',
      'Share dance experiences',
      'Review events and venues',
      'Document tango history'
    ]
  },
  {
    id: 'traveler',
    name: 'tango_traveler',
    label: 'Tango Traveler',
    description: 'I travel the world to dance tango in different cities',
    icon: <MapPin className="w-5 h-5" />,
    color: 'from-turquoise-400 to-cyan-500',
    details: [
      'Visit tango festivals globally',
      'Dance in different communities',
      'Experience local tango cultures',
      'Connect internationally'
    ]
  },
  {
    id: 'beginner',
    name: 'beginner',
    label: 'Tango Beginner',
    description: 'I\'m new to tango and actively learning',
    icon: <Baby className="w-5 h-5" />,
    color: 'from-emerald-400 to-green-500',
    details: [
      'Taking beginner classes',
      'Learning basic steps',
      'Discovering tango music',
      'Building confidence'
    ]
  },
  {
    id: 'enthusiast',
    name: 'enthusiast',
    label: 'Tango Enthusiast',
    description: 'I\'m passionate about all aspects of tango culture',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'from-pink-400 to-purple-500',
    details: [
      'Study tango history',
      'Collect tango music',
      'Support the community',
      'Promote tango culture'
    ]
  }
];

export function ComprehensiveRoleSelector({ selectedRoles, onRoleChange }: ComprehensiveRoleSelectorProps) {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const toggleRole = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      onRoleChange(selectedRoles.filter(r => r !== roleId));
    } else {
      onRoleChange([...selectedRoles, roleId]);
    }
  };

  const isSelected = (roleId: string) => selectedRoles.includes(roleId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Label className="text-base font-medium">Select all roles that apply to you</Label>
        <span className="text-sm text-gray-500">
          {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
        </span>
      </div>

      <div className="grid gap-3">
        {tangoRoles.map((role) => {
          const selected = isSelected(role.id);
          const expanded = expandedRole === role.id;

          return (
            <Card
              key={role.id}
              className={`
                relative overflow-hidden cursor-pointer transition-all duration-300
                ${selected 
                  ? 'border-turquoise-400 bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50 shadow-md' 
                  : 'border-gray-200 hover:border-turquoise-200 hover:shadow-sm'
                }
              `}
              onClick={() => toggleRole(role.id)}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`
                    rounded-full p-2.5 bg-gradient-to-br ${role.color}
                    ${selected ? 'shadow-lg' : 'opacity-80'}
                  `}>
                    <div className="text-white">
                      {role.icon}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{role.label}</h4>
                      {selected && (
                        <Badge className="bg-turquoise-100 text-turquoise-700 border-turquoise-200">
                          Selected
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{role.description}</p>

                    <button
                      type="button"
                      className="text-sm text-turquoise-600 hover:text-turquoise-700 font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedRole(expanded ? null : role.id);
                      }}
                    >
                      {expanded ? 'Hide details' : 'Show details'} →
                    </button>

                    {expanded && (
                      <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <div className="border-l-2 border-turquoise-200 pl-3">
                          {role.details.map((detail, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm text-gray-600 py-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-turquoise-400 mt-1.5 flex-shrink-0" />
                              {detail}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selected && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-turquoise-400/20 to-cyan-400/20 blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-turquoise-400/20 to-cyan-400/20 blur-2xl" />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-turquoise-50 to-cyan-50 rounded-lg border border-turquoise-100">
        <p className="text-sm text-gray-700">
          <strong>Tip:</strong> Select multiple roles to better represent your involvement in the tango community. 
          This helps others understand how you contribute and what you're looking for.
        </p>
      </div>
    </div>
  );
}