import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, Layers, CheckCircle2, AlertCircle, Clock, Users, Monitor, Smartphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllFeatures, ProjectItem } from '@/data/comprehensive-project-data';
import { JiraStyleItemDetailModal } from './JiraStyleItemDetailModal';

export function FeatureDeepDive() {
  const [selectedFeature, setSelectedFeature] = useState<ProjectItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  // Get all features from comprehensive project data
  const allFeatures = useMemo(() => getAllFeatures(), []);

  // Get unique teams and statuses for filters
  const { uniqueTeams, uniqueStatuses } = useMemo(() => {
    const teams = new Set<string>();
    const statuses = new Set<string>();
    
    allFeatures.forEach(feature => {
      if (feature.status) statuses.add(feature.status);
      if (feature.team) {
        feature.team.forEach(t => teams.add(t));
      }
    });
    
    return {
      uniqueTeams: Array.from(teams).sort(),
      uniqueStatuses: Array.from(statuses).sort()
    };
  }, [allFeatures]);

  // Filter features based on search and filters
  const filteredFeatures = useMemo(() => {
    return allFeatures.filter(feature => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = feature.title.toLowerCase().includes(query) ||
          (feature.description && feature.description.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && feature.status !== statusFilter) {
        return false;
      }

      // Team filter
      if (teamFilter !== 'all' && (!feature.team || !feature.team.includes(teamFilter))) {
        return false;
      }

      return true;
    });
  }, [allFeatures, searchQuery, statusFilter, teamFilter]);

  // Group features by status
  const groupedFeatures = useMemo(() => {
    const groups = new Map<string, ProjectItem[]>();
    
    filteredFeatures.forEach(feature => {
      const status = feature.status || 'No Status';
      if (!groups.has(status)) {
        groups.set(status, []);
      }
      groups.get(status)!.push(feature);
    });
    
    // Sort groups by status priority
    const statusOrder = ['In Progress', 'Completed', 'Planning', 'Blocked', 'No Status'];
    const sortedGroups = new Map<string, ProjectItem[]>();
    
    statusOrder.forEach(status => {
      if (groups.has(status)) {
        sortedGroups.set(status, groups.get(status)!);
      }
    });
    
    // Add any remaining statuses
    groups.forEach((features, status) => {
      if (!sortedGroups.has(status)) {
        sortedGroups.set(status, features);
      }
    });
    
    return sortedGroups;
  }, [filteredFeatures]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Blocked':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Layers className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Planning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTeamBadgeColor = (team: string) => {
    const colors: { [key: string]: string } = {
      'Frontend': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Backend': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Database': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'AI': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Security': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Performance': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Mobile': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Integration': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
    };
    return colors[team] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Feature Deep Dive</h2>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {filteredFeatures.length} Features
          </Badge>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {uniqueTeams.map(team => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Features grouped by status */}
      <div className="space-y-6">
        {Array.from(groupedFeatures.entries()).map(([status, features]) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              <h3 className="text-lg font-semibold">{status}</h3>
              <Badge variant="outline" className="ml-2">
                {features.length}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card
                  key={feature.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedFeature(feature)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-medium line-clamp-2">
                        {feature.title}
                      </CardTitle>
                      <div className="ml-2">
                        {feature.webCompletion && feature.mobileCompletion ? (
                          <div className="flex gap-1">
                            <Monitor className="w-4 h-4 text-gray-400" />
                            <Smartphone className="w-4 h-4 text-gray-400" />
                          </div>
                        ) : feature.webCompletion ? (
                          <Monitor className="w-4 h-4 text-gray-400" />
                        ) : feature.mobileCompletion ? (
                          <Smartphone className="w-4 h-4 text-gray-400" />
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {feature.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {feature.description}
                      </p>
                    )}

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Progress</span>
                        <span>{feature.completion || 0}%</span>
                      </div>
                      <Progress value={feature.completion || 0} className="h-2" />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(feature.status || 'No Status')}>
                        {feature.status || 'No Status'}
                      </Badge>
                      
                      {feature.priority && (
                        <Badge variant={feature.priority === 'Critical' ? 'destructive' : 'secondary'}>
                          {feature.priority}
                        </Badge>
                      )}

                      {feature.team && feature.team.map(team => (
                        <Badge key={team} className={getTeamBadgeColor(team)}>
                          <Users className="w-3 h-3 mr-1" />
                          {team}
                        </Badge>
                      ))}
                    </div>

                    {/* Platform-specific completion */}
                    {(feature.webCompletion !== undefined || feature.mobileCompletion !== undefined) && (
                      <div className="flex gap-4 text-xs text-gray-500">
                        {feature.webCompletion !== undefined && (
                          <span className="flex items-center gap-1">
                            <Monitor className="w-3 h-3" />
                            Web: {feature.webCompletion}%
                          </span>
                        )}
                        {feature.mobileCompletion !== undefined && (
                          <span className="flex items-center gap-1">
                            <Smartphone className="w-3 h-3" />
                            Mobile: {feature.mobileCompletion}%
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selectedFeature && (
        <JiraStyleItemDetailModal
          isOpen={!!selectedFeature}
          onClose={() => setSelectedFeature(null)}
          item={selectedFeature}
        />
      )}
    </div>
  );
}