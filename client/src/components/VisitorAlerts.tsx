import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Calendar, Users, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VisitorAlertsProps {
  cityId: number;
}

interface UpcomingVisitor {
  id: number;
  name: string;
  username: string;
  profileImage?: string;
  arrivalDate: string;
  departureDate: string;
  city: string;
  country: string;
  tangoRoles: string[];
  lookingFor: string[];
}

export default function VisitorAlerts({ cityId }: VisitorAlertsProps) {
  const [, setLocation] = useLocation();

  // Fetch upcoming visitors for this city
  const { data: visitors = [], isLoading } = useQuery({
    queryKey: ['/api/cities/upcoming-visitors', cityId],
    queryFn: async () => {
      const response = await fetch(`/api/cities/${cityId}/upcoming-visitors`, {
        credentials: 'include',
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visitors.length === 0) {
    return null;
  }

  const formatDateRange = (arrival: string, departure: string) => {
    const arrivalDate = new Date(arrival);
    const departureDate = new Date(departure);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    
    return `${arrivalDate.toLocaleDateString('en-US', options)} - ${departureDate.toLocaleDateString('en-US', options)}`;
  };

  return (
    <Card className="shadow-lg border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Users className="h-5 w-5" />
          Upcoming Visitors to Your City
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {visitors.slice(0, 3).map((visitor) => (
          <div 
            key={visitor.id}
            className="p-4 bg-white rounded-lg border border-orange-100 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setLocation(`/profile/${visitor.username}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                {visitor.profileImage ? (
                  <img 
                    src={visitor.profileImage} 
                    alt={visitor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center text-white font-bold">
                    {visitor.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">{visitor.name}</h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    From {visitor.city}, {visitor.country}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateRange(visitor.arrivalDate, visitor.departureDate)}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {visitor.tangoRoles.slice(0, 3).map((role, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs bg-orange-100 text-orange-800"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            {visitor.lookingFor.length > 0 && (
              <p className="text-sm text-gray-700 mt-2 pl-15">
                Looking for: {visitor.lookingFor.join(', ')}
              </p>
            )}
          </div>
        ))}
        
        {visitors.length > 3 && (
          <Button
            variant="outline"
            className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
            onClick={() => setLocation(`/cities/${cityId}/visitors`)}
          >
            View all {visitors.length} upcoming visitors
          </Button>
        )}
      </CardContent>
    </Card>
  );
}