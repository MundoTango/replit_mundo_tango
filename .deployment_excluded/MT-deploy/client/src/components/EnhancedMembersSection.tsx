/**
 * 🏗️ 11L Enhanced Members Section with Tango Role Management
 * Layer 7: Frontend Layer - Advanced member organization with filtering and role visualization
 */

import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Search, Filter, Users, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TANGO_ROLES, ROLE_CATEGORIES, mapUserRoleToTangoRole, getTangoRoleById, TangoRole } from '@/utils/tangoRoles';
import { RoleEmojiDisplay } from '@/components/ui/RoleEmojiDisplay';

interface GroupMember {
  id: number;
  userId: number;
  name: string;
  username: string;
  profileImage?: string;
  role: string;
  joinedAt: string;
  status: string;
  tangoRoles?: string[];
  leaderLevel?: number;
  followerLevel?: number;
}

interface EnhancedMembersSectionProps {
  members: GroupMember[];
  memberCount: number;
}

interface EnhancedMember extends GroupMember {
  tangoRole: TangoRole;
  allTangoRoles?: TangoRole[];
}

const MemberCard: React.FC<{ member: EnhancedMember; onClick: () => void }> = ({ member, onClick }) => {
  const [, setLocation] = useLocation();
  
  const handleClick = () => {
    setLocation(`/u/${member.username}`);
  };

  return (
    <div 
      className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer group"
      onClick={handleClick}
    >
      {/* Clean profile image without emoji badge */}
      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
        {member.profileImage ? (
          <img src={member.profileImage} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          member.name.charAt(0).toUpperCase()
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-600 transition-colors">
            {member.name}
          </p>
          {member.role === 'admin' && (
            <div title="Group Admin">
              <Crown className="h-3 w-3 text-yellow-500" />
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">@{member.username}</p>
        
        {/* Clean emoji-only role indicators with hover tooltips */}
        <div className="flex items-center mt-2">
          <RoleEmojiDisplay 
            tangoRoles={member.tangoRoles} 
            leaderLevel={member.leaderLevel}
            followerLevel={member.followerLevel}
            fallbackRole="dancer"
            size="lg"
            maxRoles={4}
          />
          
          {member.role !== 'member' && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 ml-2">
              {member.role}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

const CategorySection: React.FC<{ 
  category: string; 
  members: EnhancedMember[]; 
  categoryInfo: { name: string; emoji: string; color: string } 
}> = ({ category, members, categoryInfo }) => {
  if (members.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <span className="text-lg">{categoryInfo.emoji}</span>
        <h4 className="text-md font-semibold text-gray-800">{categoryInfo.name}</h4>
        <Badge variant="outline" className={`text-xs ${categoryInfo.color}`}>
          {members.length}
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {members.map((member) => (
          <MemberCard 
            key={`${category}-${member.userId}`} 
            member={member} 
            onClick={() => {}} 
          />
        ))}
      </div>
    </div>
  );
};

export const EnhancedMembersSection: React.FC<EnhancedMembersSectionProps> = ({ 
  members, 
  memberCount 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Enhanced members with tango role mapping from user profile data
  const enhancedMembers: EnhancedMember[] = useMemo(() => {
    return members.map(member => {
      // Use tangoRoles from user profile if available, otherwise fallback to role mapping
      const primaryTangoRole = member.tangoRoles && member.tangoRoles.length > 0 
        ? member.tangoRoles[0] 
        : member.role;
      
      // Map all tangoRoles to role objects for multi-role support
      const allTangoRoles = member.tangoRoles && member.tangoRoles.length > 0
        ? member.tangoRoles.map(roleId => getTangoRoleById(roleId)).filter((role): role is TangoRole => role !== undefined)
        : [mapUserRoleToTangoRole(primaryTangoRole)];
      
      return {
        ...member,
        tangoRole: mapUserRoleToTangoRole(primaryTangoRole),
        allTangoRoles: allTangoRoles as TangoRole[]
      };
    });
  }, [members]);

  // Filtered and organized members
  const { filteredMembers, membersByCategory } = useMemo(() => {
    let filtered = enhancedMembers;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(searchLower) ||
        member.username.toLowerCase().includes(searchLower) ||
        member.tangoRole.name.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(member => member.tangoRole.category === selectedCategory);
    }

    // Role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(member => member.tangoRole.id === selectedRole);
    }

    // Group by category
    const byCategory: Record<string, EnhancedMember[]> = {};
    Object.keys(ROLE_CATEGORIES).forEach(category => {
      byCategory[category] = filtered.filter(member => member.tangoRole.category === category);
    });

    return {
      filteredMembers: filtered,
      membersByCategory: byCategory
    };
  }, [enhancedMembers, searchTerm, selectedCategory, selectedRole]);

  // Get unique roles for filter dropdown
  const availableRoles = useMemo(() => {
    const roleSet = new Set(enhancedMembers.map(member => member.tangoRole.id));
    return TANGO_ROLES.filter(role => roleSet.has(role.id));
  }, [enhancedMembers]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Members</h3>
          <Badge variant="outline" className="bg-gray-50 text-gray-700">
            {filteredMembers.length} of {memberCount}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(ROLE_CATEGORIES).map(([key, category]) => (
              <SelectItem key={key} value={key}>
                {category.emoji} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Role Filter */}
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {availableRoles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.emoji} {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {(searchTerm || selectedCategory !== 'all' || selectedRole !== 'all') && (
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedRole('all');
            }}
            className="text-gray-600 hover:text-gray-800"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Members organized by category */}
      {filteredMembers.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(ROLE_CATEGORIES).map(([category, categoryInfo]) => (
            <CategorySection
              key={category}
              category={category}
              members={membersByCategory[category] || []}
              categoryInfo={categoryInfo}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No members found matching your filters</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedRole('all');
            }}
            className="mt-2"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};