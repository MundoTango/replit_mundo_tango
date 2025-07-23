import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Info, Plus } from 'lucide-react';
import { CustomRoleRequestModal } from '../roles/CustomRoleRequestModal';

interface CommunityRole {
  name: string;
  description: string;
}

interface RoleSelectorProps {
  roles: CommunityRole[];
  selectedRoles: string[];
  onRoleChange: (roles: string[]) => void;
  isLoading?: boolean;
}

const roleIcons: Record<string, string> = {
  dancer: "💃",
  performer: "⭐",
  teacher: "📚", 
  learning_source: "📖",
  dj: "🎵",
  musician: "🎼",
  organizer: "🎪",
  host: "🏠",
  guide: "🗺️",
  photographer: "📸",
  content_creator: "🎙️",
  choreographer: "✨",
  tango_traveler: "🌍",
  tour_operator: "✈️",
  vendor: "🛒",
  wellness_provider: "💆",
  tango_school: "🏫",
  tango_hotel: "🏨",
  taxi_dancer: "🎫",
  other: "➕"
};

export default function RoleSelector({ 
  roles, 
  selectedRoles, 
  onRoleChange, 
  isLoading = false 
}: RoleSelectorProps) {
  const [showCustomRoleModal, setShowCustomRoleModal] = useState(false);
  
  // Memoize the selected roles set for efficient lookups
  const selectedRolesSet = useMemo(() => new Set(selectedRoles), [selectedRoles]);
  
  // Memoize the roles count to prevent unnecessary re-renders
  const rolesCount = useMemo(() => roles?.length || 0, [roles?.length]);
  
  // Debug logging with stable dependencies
  useEffect(() => {
    console.log('RoleSelector render:', { 
      selectedRolesCount: selectedRoles.length, 
      rolesCount, 
      isLoading, 
      showCustomRoleModal 
    });
  }, [selectedRoles.length, rolesCount, isLoading, showCustomRoleModal]);
  
  // Memoized role toggle handler to prevent recreation on every render
  const handleRoleToggle = useCallback((roleName: string) => {
    console.log(`Role toggle clicked: ${roleName}`);
    
    if (roleName === 'other') {
      setShowCustomRoleModal(true);
      return;
    }
    
    try {
      if (selectedRolesSet.has(roleName)) {
        const newRoles = selectedRoles.filter(role => role !== roleName);
        console.log('Removing role, new roles:', newRoles);
        onRoleChange(newRoles);
      } else {
        const newRoles = [...selectedRoles, roleName];
        console.log('Adding role, new roles:', newRoles);
        onRoleChange(newRoles);
      }
    } catch (error) {
      console.error('Error in handleRoleToggle:', error);
    }
  }, [selectedRoles, selectedRolesSet, onRoleChange]);

  // Memoized custom role success handler
  const handleCustomRoleSuccess = useCallback(() => {
    setShowCustomRoleModal(false);
  }, []);

  // Memoized role item component to prevent unnecessary re-renders
  const RoleItem = useMemo(() => {
    return React.memo(({ role }: { role: CommunityRole }) => {
      const isSelected = selectedRolesSet.has(role.name);
      
      return (
        <div
          key={role.name}
          data-role={role.name}
          className={`
            relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
            ${isSelected
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25'
            }
          `}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRoleToggle(role.name);
          }}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => {}} // No-op to prevent double handling
              className="mt-1 pointer-events-none"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{roleIcons[role.name] || "🎯"}</span>
                <h3 className="font-medium text-gray-900 capitalize">
                  {role.name.replace(/_/g, ' ')}
                </h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {role.description}
              </p>
            </div>
          </div>
          
          {isSelected && (
            <div className="absolute top-2 right-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      );
    });
  }, [selectedRolesSet, handleRoleToggle]);

  // Display all roles upfront without hiding any
  const displayedRoles = useMemo(() => {
    return roles;
  }, [roles]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-100">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-blue-600" />
          What do you do in tango?
        </CardTitle>
        <p className="text-sm text-gray-600 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 text-blue-500" />
          Choose all that apply. You can always update these later in your profile.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedRoles.map((role) => (
              <RoleItem key={role.name} role={role} />
            ))}
          </div>



          {selectedRoles.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Selected roles:</span>
                <Badge variant="outline" className="text-xs">
                  {selectedRoles.length}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedRoles.map(role => (
                  <Badge 
                    key={role} 
                    className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-2 py-1"
                  >
                    <span className="mr-1">{roleIcons[role] || "🎯"}</span>
                    {role.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <strong>No selection?</strong> No problem! You'll be assigned as a general member 
            and can choose your roles anytime from your profile.
          </div>
        </div>
      </CardContent>

      {/* Custom Role Request Modal */}
      <CustomRoleRequestModal
        open={showCustomRoleModal}
        onOpenChange={setShowCustomRoleModal}
        onSuccess={handleCustomRoleSuccess}
      />
    </Card>
  );
}