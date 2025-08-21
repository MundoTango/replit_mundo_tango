import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Check, X } from 'lucide-react';

interface Role {
  id: string;
  emoji: string;
  label: string;
  description: string;
}

interface RoleCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  bgGradient: string;
  roles: Role[];
}

const roleCategories: RoleCategory[] = [
  {
    id: 'dancers',
    name: 'Dancers & Performers',
    description: 'Express yourself through movement',
    icon: '💃',
    bgGradient: 'from-pink-400 to-purple-500',
    roles: [
      { id: 'dancer', emoji: '💃', label: 'Dancer', description: 'Social dancer enjoying milongas' },
      { id: 'performer', emoji: '⭐', label: 'Performer', description: 'Stage performer and show artist' },
      { id: 'taxi_dancer', emoji: '🎫', label: 'Taxi Dancer', description: 'Professional dance partner for hire' }
    ]
  },
  {
    id: 'teachers',
    name: 'Teachers & Guides',
    description: 'Share knowledge and wisdom',
    icon: '📚',
    bgGradient: 'from-green-400 to-emerald-500',
    roles: [
      { id: 'teacher', emoji: '📚', label: 'Teacher', description: 'Tango instructor and educator' },
      { id: 'learning_source', emoji: '📖', label: 'Learning Source', description: 'Knowledge resource and mentor' },
      { id: 'guide', emoji: '🗺️', label: 'Guide', description: 'Local tango scene navigator' }
    ]
  },
  {
    id: 'music',
    name: 'Music & Entertainment',
    description: 'Create the tango atmosphere',
    icon: '🎵',
    bgGradient: 'from-blue-400 to-cyan-500',
    roles: [
      { id: 'dj', emoji: '🎵', label: 'DJ', description: 'Curate music for milongas' },
      { id: 'musician', emoji: '🎼', label: 'Musician', description: 'Live tango music performer' },
      { id: 'choreographer', emoji: '✨', label: 'Choreographer', description: 'Create tango performances' }
    ]
  },
  {
    id: 'community',
    name: 'Community & Hospitality',
    description: 'Build and host the community',
    icon: '🏠',
    bgGradient: 'from-orange-400 to-red-500',
    roles: [
      { id: 'organizer', emoji: '🎪', label: 'Organizer', description: 'Event and milonga organizer' },
      { id: 'host', emoji: '🏠', label: 'Host', description: 'Accommodation provider' },
      { id: 'tango_hotel', emoji: '🏨', label: 'Tango Hotel', description: 'Tango-friendly accommodation' },
      { id: 'tango_school', emoji: '🏫', label: 'Tango School', description: 'Dance education institution' }
    ]
  },
  {
    id: 'creative',
    name: 'Creative & Media',
    description: 'Capture and share tango moments',
    icon: '📸',
    bgGradient: 'from-purple-400 to-pink-500',
    roles: [
      { id: 'photographer', emoji: '📸', label: 'Photographer', description: 'Capture tango moments' },
      { id: 'content_creator', emoji: '🎙️', label: 'Content Creator', description: 'Create tango media content' }
    ]
  },
  {
    id: 'travel',
    name: 'Travel & Business',
    description: 'Support the tango ecosystem',
    icon: '✈️',
    bgGradient: 'from-turquoise-400 to-cyan-500',
    roles: [
      { id: 'tango_traveler', emoji: '🌍', label: 'Tango Traveler', description: 'Dance around the world' },
      { id: 'tour_operator', emoji: '✈️', label: 'Tour Operator', description: 'Organize tango trips' },
      { id: 'vendor', emoji: '🛒', label: 'Vendor', description: 'Sell tango products' },
      { id: 'wellness_provider', emoji: '💆', label: 'Wellness Provider', description: 'Health and wellness services' }
    ]
  },
  {
    id: 'other',
    name: 'Something Else',
    description: 'Your unique contribution',
    icon: '➕',
    bgGradient: 'from-gray-400 to-gray-500',
    roles: [
      { id: 'other', emoji: '➕', label: 'Other', description: 'Describe your unique role' }
    ]
  }
];

interface GroupedRoleSelectorProps {
  selectedRoles: string[];
  onRoleChange: (roles: string[]) => void;
}

export const GroupedRoleSelector: React.FC<GroupedRoleSelectorProps> = ({
  selectedRoles,
  onRoleChange
}) => {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  
  // Debug logging
  console.log('🎭 GroupedRoleSelector rendering with:', {
    selectedRoles,
    categoriesCount: roleCategories.length,
    currentCategory: roleCategories[currentCategoryIndex]?.name
  });

  const currentCategory = roleCategories[currentCategoryIndex];

  const handleRoleToggle = (roleId: string) => {
    const newRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter(id => id !== roleId)
      : [...selectedRoles, roleId];
    onRoleChange(newRoles);
  };

  const flipCard = (roleId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  const nextCategory = () => {
    setCurrentCategoryIndex((prev) => (prev + 1) % roleCategories.length);
    setFlippedCards(new Set());
  };

  const prevCategory = () => {
    setCurrentCategoryIndex((prev) => (prev - 1 + roleCategories.length) % roleCategories.length);
    setFlippedCards(new Set());
  };

  const selectedRoleCount = selectedRoles.length;

  return (
    <div className="space-y-6">
      {/* Header with selected count */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Your Tango Roles</h3>
        <Badge variant="secondary" className="bg-turquoise-100 text-turquoise-700">
          {selectedRoleCount} selected
        </Badge>
      </div>

      {/* Category Navigator */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevCategory}
            className="hover:bg-turquoise-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="text-center flex-1">
            <div className={`text-3xl mb-2`}>{currentCategory.icon}</div>
            <h4 className={`text-xl font-bold bg-gradient-to-r ${currentCategory.bgGradient} bg-clip-text text-transparent`}>
              {currentCategory.name}
            </h4>
            <p className="text-sm text-gray-600">{currentCategory.description}</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextCategory}
            className="hover:bg-turquoise-50"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Category Progress Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {roleCategories.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentCategoryIndex(index);
                setFlippedCards(new Set());
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentCategoryIndex
                  ? "w-8 bg-gradient-to-r " + currentCategory.bgGradient
                  : "bg-gray-300"
              )}
            />
          ))}
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300">
          {currentCategory.roles.map((role) => {
            const isSelected = selectedRoles.includes(role.id);
            const isFlipped = flippedCards.has(role.id);

            return (
              <div key={role.id} className="perspective">
                <div
                  className={cn(
                    "relative w-full h-40 transform-style-preserve-3d transition-transform duration-600",
                    isFlipped && "rotate-y-180"
                  )}
                >
                  {/* Front of card */}
                  <Card
                    className={cn(
                      "absolute inset-0 backface-hidden cursor-pointer transition-all duration-300",
                      "hover:shadow-lg hover:scale-105",
                      isSelected && "ring-2 ring-turquoise-400"
                    )}
                    onClick={() => flipCard(role.id)}
                  >
                    <CardContent className="h-full flex flex-col items-center justify-center text-center p-4">
                      <div className="text-4xl mb-2">{role.emoji}</div>
                      <h5 className="font-semibold text-lg mb-1">{role.label}</h5>
                      <p className="text-sm text-gray-600">Click to learn more</p>
                      {isSelected && (
                        <Check className="absolute top-2 right-2 h-5 w-5 text-turquoise-500" />
                      )}
                    </CardContent>
                  </Card>

                  {/* Back of card */}
                  <Card
                    className={cn(
                      "absolute inset-0 backface-hidden cursor-pointer transition-all duration-300 rotate-y-180",
                      "hover:shadow-lg",
                      isSelected && "ring-2 ring-turquoise-400"
                    )}
                  >
                    <CardContent className="h-full flex flex-col justify-between p-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-lg">{role.label}</h5>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              flipCard(role.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                      </div>
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "w-full",
                          isSelected && "bg-gradient-to-r from-turquoise-400 to-cyan-500"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoleToggle(role.id);
                        }}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Roles Summary */}
      {selectedRoles.length > 0 && (
        <div className="mt-6 p-4 bg-turquoise-50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 text-turquoise-700">Your Selected Roles:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedRoles.map(roleId => {
              const role = roleCategories
                .flatMap(cat => cat.roles)
                .find(r => r.id === roleId);
              return role ? (
                <Badge
                  key={roleId}
                  variant="secondary"
                  className="bg-white hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRoleToggle(roleId)}
                >
                  {role.emoji} {role.label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupedRoleSelector;