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
    icon: <span className="text-2xl">💃</span>,
    color: 'from-pink-400 to-rose-500',
    details: [
      'Attend milongas regularly',
      'Dance for pleasure and connection',
      'Enjoy the social aspect of tango',
      'Focus on musicality and embrace'
    ]
  },
  {
    id: 'taxi_dancer',
    name: 'taxi_dancer',
    label: 'Taxi Dancer',
    description: 'Professional social dancer hired to partner with guests at milongas and events',
    icon: <span className="text-2xl">🎫</span>,
    color: 'from-amber-400 to-yellow-500',
    details: [
      'Ensure everyone can dance regardless of partner availability',
      'Help balance follower/leader ratios at events',
      'Create inclusive atmosphere for newcomers',
      'Professional service at milongas and festivals',
      'Support event organizers with social dynamics'
    ]
  },
  {
    id: 'performer',
    name: 'performer',
    label: 'Professional Performer',
    description: 'I perform tango professionally on stage',
    icon: <span className="text-2xl">⭐</span>,
    color: 'from-yellow-400 to-orange-500',
    details: [
      'Stage performances',
      'Show choreography',
      'Competition dancing',
      'Entertainment venues'
    ]
  },
  {
    id: 'teacher',
    name: 'teacher',
    label: 'Tango Teacher',
    description: 'I teach tango classes, workshops, or private lessons',
    icon: <span className="text-2xl">📚</span>,
    color: 'from-purple-400 to-indigo-500',
    details: [
      'Lead regular classes',
      'Conduct workshops and seminars',
      'Offer private lessons',
      'Share technique and philosophy'
    ]
  },
  {
    id: 'learning_source',
    name: 'learning_source',
    label: 'Learning Resource',
    description: 'I provide learning resources and educational content',
    icon: <span className="text-2xl">📖</span>,
    color: 'from-blue-400 to-indigo-500',
    details: [
      'Create educational materials',
      'Develop online courses',
      'Write instructional guides',
      'Share learning resources'
    ]
  },
  {
    id: 'dj',
    name: 'dj',
    label: 'Tango DJ',
    description: 'I DJ at milongas and tango events',
    icon: <span className="text-2xl">🎵</span>,
    color: 'from-green-400 to-emerald-500',
    details: [
      'Create tandas and cortinas',
      'Read the dance floor energy',
      'Curate musical journeys',
      'Mix traditional and nuevo'
    ]
  },
  {
    id: 'musician',
    name: 'musician',
    label: 'Tango Musician',
    description: 'I play tango music professionally',
    icon: <span className="text-2xl">🎼</span>,
    color: 'from-red-400 to-pink-500',
    details: [
      'Play in tango orchestras',
      'Perform at milongas',
      'Compose tango music',
      'Record tango albums'
    ]
  },
  {
    id: 'organizer',
    name: 'organizer',
    label: 'Event Organizer',
    description: 'I organize milongas, festivals, or tango events',
    icon: <span className="text-2xl">🎪</span>,
    color: 'from-blue-400 to-cyan-500',
    details: [
      'Host regular milongas',
      'Organize tango festivals',
      'Coordinate workshops and events',
      'Build tango communities'
    ]
  },
  {
    id: 'host',
    name: 'host',
    label: 'Host/Venue Owner',
    description: 'I host tango events or own a tango venue',
    icon: <span className="text-2xl">🏠</span>,
    color: 'from-amber-400 to-orange-500',
    details: [
      'Provide venue for milongas',
      'Host weekly practicas',
      'Maintain dance floors',
      'Create welcoming spaces'
    ]
  },
  {
    id: 'guide',
    name: 'guide',
    label: 'Tango Guide',
    description: 'I guide visitors through the local tango scene',
    icon: <span className="text-2xl">🗺️</span>,
    color: 'from-teal-400 to-cyan-500',
    details: [
      'Show visitors best milongas',
      'Provide local insights',
      'Connect with communities',
      'Share cultural knowledge'
    ]
  },
  {
    id: 'photographer',
    name: 'photographer',
    label: 'Tango Photographer',
    description: 'I photograph tango events and dancers',
    icon: <span className="text-2xl">📸</span>,
    color: 'from-purple-400 to-pink-500',
    details: [
      'Capture milonga moments',
      'Professional dance photos',
      'Event documentation',
      'Artistic tango imagery'
    ]
  },
  {
    id: 'content_creator',
    name: 'content_creator',
    label: 'Content Creator',
    description: 'I create tango content for social media and blogs',
    icon: <span className="text-2xl">🎙️</span>,
    color: 'from-pink-400 to-purple-500',
    details: [
      'Create social media content',
      'Produce tango podcasts',
      'Film dance videos',
      'Share tango stories'
    ]
  },
  {
    id: 'choreographer',
    name: 'choreographer',
    label: 'Choreographer',
    description: 'I create tango choreographies for shows and performances',
    icon: <span className="text-2xl">✨</span>,
    color: 'from-indigo-400 to-purple-500',
    details: [
      'Design show choreographies',
      'Create performance pieces',
      'Stage theatrical tangos',
      'Develop artistic concepts'
    ]
  },
  {
    id: 'tango_traveler',
    name: 'tango_traveler',
    label: 'Tango Traveler',
    description: 'I travel the world to dance tango in different cities',
    icon: <span className="text-2xl">🌍</span>,
    color: 'from-turquoise-400 to-cyan-500',
    details: [
      'Visit tango festivals globally',
      'Dance in different communities',
      'Experience local tango cultures',
      'Connect internationally'
    ]
  },
  {
    id: 'tour_operator',
    name: 'tour_operator',
    label: 'Tour Operator',
    description: 'I organize tango travel experiences and tours',
    icon: <span className="text-2xl">✈️</span>,
    color: 'from-sky-400 to-blue-500',
    details: [
      'Organize tango trips',
      'Plan festival packages',
      'Coordinate group travel',
      'Create tango vacations'
    ]
  },
  {
    id: 'vendor',
    name: 'vendor',
    label: 'Tango Vendor',
    description: 'I sell tango-related products (shoes, clothes, accessories)',
    icon: <span className="text-2xl">🛒</span>,
    color: 'from-emerald-400 to-green-500',
    details: [
      'Sell tango shoes',
      'Provide dance clothing',
      'Offer tango accessories',
      'Supply community needs'
    ]
  },
  {
    id: 'wellness_provider',
    name: 'wellness_provider',
    label: 'Wellness Provider',
    description: 'I provide wellness services for tango dancers',
    icon: <span className="text-2xl">💆</span>,
    color: 'from-rose-400 to-pink-500',
    details: [
      'Massage therapy for dancers',
      'Body work and alignment',
      'Injury prevention',
      'Holistic health services'
    ]
  },
  {
    id: 'tango_school',
    name: 'tango_school',
    label: 'Tango School',
    description: 'I run or represent a tango school',
    icon: <span className="text-2xl">🏫</span>,
    color: 'from-indigo-400 to-blue-500',
    details: [
      'Manage dance academy',
      'Structured curriculum',
      'Student programs',
      'Professional training'
    ]
  },
  {
    id: 'tango_hotel',
    name: 'tango_hotel',
    label: 'Tango Hotel',
    description: 'I provide accommodation specifically for tango dancers',
    icon: <span className="text-2xl">🏨</span>,
    color: 'from-purple-400 to-indigo-500',
    details: [
      'Tango-friendly lodging',
      'Practice spaces',
      'Dancer amenities',
      'Festival accommodation'
    ]
  },
  {
    id: 'other',
    name: 'other',
    label: 'Other',
    description: 'I contribute to tango in other ways',
    icon: <span className="text-2xl">➕</span>,
    color: 'from-gray-400 to-gray-500',
    details: [
      'Unique contributions',
      'Support services',
      'Community involvement',
      'Special projects'
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