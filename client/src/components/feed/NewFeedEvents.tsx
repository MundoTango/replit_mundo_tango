"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

interface Event {
  id: number;
  title: string;
  startDate: string;
  location: string;
  attendeesCount: number;
  isRSVPed?: boolean;
}

interface EventsData {
  upcoming_events: Event[];
  city_events: Event[];
  followed_events: Event[];
}

const NewFeedEvents = () => {
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["/api/events/feed"],
    queryFn: async () => {
      const response = await fetch("/api/events/feed");
      return response.json();
    },
    // Performance optimizations
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
  });

  const events: EventsData = eventsData?.data || {
    upcoming_events: [],
    city_events: [],
    followed_events: []
  };

  const eventSections = [
    {
      title: "Upcoming events you've RSVP'ed",
      events: events.upcoming_events,
      emptyMessage: "No upcoming events"
    },
    {
      title: "Events in Your City",
      events: events.city_events,
      emptyMessage: "No city events found"
    },
    {
      title: "Events you follow",
      events: events.followed_events,
      emptyMessage: "You don't follow any events"
    }
  ];

  if (isLoading) {
    return (
      <Card className="h-full glassmorphic-card mx-2.5 lg:mx-0 rounded-xl lg:rounded-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-turquoise-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full glassmorphic-card mx-2.5 lg:mx-0 rounded-xl lg:rounded-none overflow-hidden">
      <CardContent className="p-0">
        {eventSections.map(({ title, events: sectionEvents, emptyMessage }, sectionIndex) => (
          <div key={sectionIndex}>
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-turquoise-500 to-cyan-600 text-sm">{title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-turquoise-600 hover:text-cyan-700 text-xs font-semibold transition-colors hover:bg-turquoise-50"
                  onClick={() => window.location.href = '/events'}
                >
                  See all
                </Button>
              </div>

              <div className="space-y-3">
                {sectionEvents.length > 0 ? (
                  sectionEvents.slice(0, 3).map((event) => (
                    <div 
                      key={event.id} 
                      className="flex items-start gap-3 hover:bg-turquoise-50/50 p-2 -m-2 rounded-lg transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/events/${event.id}`}
                    >
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-turquoise-400 to-cyan-500 mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                          {event.title}
                        </h4>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <CalendarIcon className="h-3 w-3" />
                            <span>
                              {format(new Date(event.startDate), "EEEE do MMMM")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPinIcon className="h-3 w-3" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          {event.attendeesCount > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <UsersIcon className="h-3 w-3" />
                              <span>{event.attendeesCount} attending</span>
                            </div>
                          )}
                        </div>
                        {event.isRSVPed && (
                          <Badge variant="secondary" className="mt-2 text-xs bg-turquoise-100 text-turquoise-800 border border-turquoise-200">
                            RSVP'd
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm text-center py-8 italic">{emptyMessage}</p>
                )}
              </div>
            </div>
            
            {sectionIndex < eventSections.length - 1 && (
              <hr className="mx-6 border-turquoise-100" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default NewFeedEvents;