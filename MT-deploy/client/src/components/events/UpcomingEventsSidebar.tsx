import React from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Event {
  id: number;
  title: string;
  startDate: string;
  location: string;
  attendeesCount: number;
  isRSVPed: boolean;
}

interface EventsResponse {
  success: boolean;
  data: {
    upcoming_events: Event[];
    city_events: Event[];
    followed_events: Event[];
  };
}

export default function UpcomingEventsSidebar() {
  console.log('🔥 COMPONENT RENDERED: UpcomingEventsSidebar called!');
  
  const { data: eventsData, isLoading, error } = useQuery<EventsResponse>({
    queryKey: ['/api/events/feed'],
  });

  console.log('🎯 ESA Events Debug:', { 
    eventsData, 
    isLoading, 
    error, 
    hasData: !!eventsData?.data 
  });

  // Combine all events and sort by date
  const allEvents = [
    ...(eventsData?.data?.upcoming_events || []),
    ...(eventsData?.data?.city_events || []),
    ...(eventsData?.data?.followed_events || [])
  ].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  console.log('🎯 ESA Events Combined:', { 
    totalEvents: allEvents.length,
    upcomingEvents: eventsData?.data?.upcoming_events?.length || 0,
    cityEvents: eventsData?.data?.city_events?.length || 0,
    followedEvents: eventsData?.data?.followed_events?.length || 0,
    allEvents: allEvents.slice(0, 3)
  });



  return (
    <div className="glassmorphic-card p-6 space-y-4 bg-white/90 border border-gray-200 rounded-xl shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-turquoise-500" />
        <h2 className="text-xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
          Upcoming Events
        </h2>
        <div className="text-xs bg-red-100 px-2 py-1 rounded">
          RENDERED
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : allEvents.length > 0 ? (
        <div className="space-y-4">
          {allEvents.slice(0, 5).map((event) => (
            <Card key={event.id} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-turquoise-400">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">
                    {event.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {event.isRSVPed ? 'RSVP\'d' : 'City Event'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-3 h-3" />
                  {format(new Date(event.startDate), 'MMM d, h:mm a')}
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Users className="w-3 h-3" />
                    {event.attendeesCount} attending
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-6 px-2">
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {allEvents.length > 5 && (
            <Button variant="ghost" className="w-full text-sm">
              View All Events ({allEvents.length})
            </Button>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-2">No upcoming events found</p>
          <p className="text-gray-400 text-xs">Debug: {JSON.stringify(eventsData?.data || {})}</p>
          <p className="text-gray-400 text-xs">Check back later for new events</p>
        </div>
      )}
    </div>
  );
}