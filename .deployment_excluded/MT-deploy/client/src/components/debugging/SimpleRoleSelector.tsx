import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Info } from "lucide-react";

interface CommunityRole {
  name: string;
  description: string;
}

interface SimpleRoleSelectorProps {
  roles: CommunityRole[];
  selectedRoles: string[];
  onRoleChange: (roles: string[]) => void;
  isLoading?: boolean;
}

export default function SimpleRoleSelector({ 
  roles, 
  selectedRoles, 
  onRoleChange, 
  isLoading 
}: SimpleRoleSelectorProps) {
  console.log('SimpleRoleSelector render:', { selectedRoles, rolesCount: roles.length });

  const handleRoleToggle = useCallback((roleName: string) => {
    console.log('SimpleRoleSelector handleRoleToggle:', roleName);
    const newRoles = selectedRoles.includes(roleName)
      ? selectedRoles.filter(r => r !== roleName)
      : [...selectedRoles, roleName];
    
    console.log('SimpleRoleSelector new roles:', newRoles);
    onRoleChange(newRoles);
  }, [selectedRoles, onRoleChange]);

  if (isLoading) {
    return (
      <Card className="border-2 border-blue-100">
        <CardContent className="p-6">
          <div className="text-center">Loading roles...</div>
        </CardContent>
      </Card>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <Card className="border-2 border-blue-100">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">No roles available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-100">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-blue-600" />
          What do you do in tango? (Simple Version)
        </CardTitle>
        <p className="text-sm text-gray-600 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 text-blue-500" />
          Choose all that apply. You can always update these later in your profile.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roles.slice(0, 6).map((role) => (
              <div
                key={role.name}
                data-role={role.name}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${selectedRoles.includes(role.name)
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25'
                  }
                `}
                onClick={() => handleRoleToggle(role.name)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🎯</span>
                      <h3 className="font-medium text-gray-900 capitalize">
                        {role.name.replace(/_/g, ' ')}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                </div>
                
                {selectedRoles.includes(role.name) && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedRoles.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-900">Selected roles:</span>
                <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {selectedRoles.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedRoles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                  >
                    {role.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}