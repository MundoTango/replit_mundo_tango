import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Users, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface EventType {
  id: number;
  name: string;
  color: string;
  bgColor: string;
}

interface Event {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location: string;
  city: string;
  country: string;
  eventType?: string;
  currentAttendees: number;
  maxAttendees?: number;
  isPublic: boolean;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  userStatus?: 'going' | 'interested' | 'invited' | null;
}

const eventTypes: EventType[] = [
  { id: 1, name: 'practica', color: 'text-teal-600', bgColor: 'bg-teal-50' },
  { id: 2, name: 'milonga', color: 'text-coral-600', bgColor: 'bg-coral-50' },
  { id: 3, name: 'marathon', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 4, name: 'encuentro', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 5, name: 'festival', color: 'text-pink-600', bgColor: 'bg-pink-50' },
  { id: 6, name: 'competition', color: 'text-orange-600', bgColor: 'bg-orange-50' },
];

export default function EventsBoard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: eventsResponse, isLoading, error } = useQuery({
    queryKey: ['/api/events/sidebar'],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch('/api/events/sidebar', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      
      // Debug logging
      console.log('Events API Response:', data);
      console.log('Total events received:', data?.data?.length || 0);
      
      return data;
    }
  });

  const events = eventsResponse?.data || [];
  
  // Debug info
  const debugInfo = {
    totalEvents: events.length,
    userLocation: user?.city || 'Unknown',
    userId: user?.id,
    error: error?.message
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getEventTypeInfo = (eventType: string) => {
    const type = eventTypes.find(t => t.name.toLowerCase() === eventType?.toLowerCase());
    return type || { name: 'event', color: 'text-gray-600', bgColor: 'bg-gray-50' };
  };

  const handleViewAllEvents = () => {
    setLocation('/events');
  };

  const handleEventClick = (eventId: number) => {
    setLocation(`/events/${eventId}`);
  };

  if (isLoading) {
    return (
      <div className="relative">
        {/* Ambient glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-turquoise-400/20 to-blue-400/20 rounded-3xl blur-2xl animate-pulse" />
        
        <div className="relative glassmorphic-card rounded-3xl p-6 space-y-4">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-turquoise-300 to-blue-300 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-36 animate-pulse" />
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-28 animate-pulse" />
              </div>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-turquoise-100 to-cyan-100 rounded-xl animate-pulse" />
          </div>

          {/* Event Card Skeletons */}
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glassmorphic-card p-4 rounded-2xl border border-white/50 space-y-3">
                {/* Event Type and Status Badges */}
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 bg-gradient-to-r from-turquoise-200 to-blue-200 rounded-lg animate-pulse" />
                  <div className="h-5 w-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
                </div>
                
                {/* Event Title */}
                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/5 animate-pulse" />
                
                {/* Event Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/5 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/5 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2 animate-pulse" />
                  </div>
                </div>
                
                {/* Organizer */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100/50">
                  <div className="w-5 h-5 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse" />
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-24 animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* View All Button Skeleton */}
          <div className="h-10 bg-gradient-to-r from-turquoise-200 to-blue-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-turquoise-400/20 to-blue-400/20 rounded-3xl blur-2xl" />
      
      <div className="relative glassmorphic-card rounded-3xl p-6 space-y-4">
        {/* Beautiful Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-turquoise-400 to-blue-500 p-3 rounded-xl shadow-lg animate-float">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-turquoise-600 to-blue-600 bg-clip-text text-transparent">
                Upcoming Events
              </h3>
              <p className="text-gray-600 text-sm">In your area & invitations</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-turquoise-100 to-cyan-100 p-2 rounded-xl sparkle-effect">
            <Sparkles className="h-5 w-5 text-turquoise-600" />
          </div>
        </div>

      {/* Compact Events List */}
      <div className="space-y-3 mb-4">
        {events?.slice(0, 4).map((event: Event) => {
          const typeInfo = getEventTypeInfo(event.eventType || '');
          return (
            <div
              key={event.id}
              className="group relative glassmorphic-card p-4 rounded-2xl cursor-pointer
                       transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl
                       border border-white/50 hover:border-turquoise-300/50"
              onClick={() => handleEventClick(event.id)}
            >
              {/* Compact Event Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge className={`${typeInfo.bgColor} ${typeInfo.color} border-0 text-xs font-bold px-2 py-0.5 rounded-lg`}>
                    {typeInfo.name}
                  </Badge>
                  {event.userStatus && (
                    <Badge className={`border-0 text-xs font-bold px-1.5 py-0.5 rounded ${
                      event.userStatus === 'going' 
                        ? 'bg-green-100 text-green-700' 
                        : event.userStatus === 'interested'
                        ? 'bg-blue-100 text-blue-700'
                        : event.userStatus === 'invited'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {event.userStatus === 'going' && '✓'}
                      {event.userStatus === 'interested' && '★'}
                      {event.userStatus === 'invited' && '✉'}
                    </Badge>
                  )}
                </div>
                <h4 className="font-bold text-blue-900 text-base group-hover:text-turquoise-600 transition-colors line-clamp-2">
                    {event.title}
                  </h4>

                {/* Enhanced Event Details */}
                <div className="space-y-2 text-sm text-blue-600/80">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatEventDate(event.startDate)} • {formatEventTime(event.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{event.city}, {event.country}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {event.currentAttendees} attending
                      {event.maxAttendees && ` / ${event.maxAttendees} max`}
                    </span>
                  </div>
                </div>

                {/* Enhanced Organizer */}
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-blue-100/50">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-coral-200 to-pink-200 flex items-center justify-center">
                    {event.user?.profileImage ? (
                      <img
                        src={event.user.profileImage}
                        alt={event.user.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-coral-600 text-xs font-bold">
                        {event.user?.name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <span className="text-blue-600/70 text-sm font-medium">
                    by {event.user?.name || 'Unknown Organizer'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {(!events || events.length === 0) && (
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-coral-400 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
              No upcoming events
            </h4>
            
            {/* Enhanced empty state with debug info */}
            <div className="space-y-3 mb-4">
              <p className="text-blue-600/70 font-medium">
                We couldn't find any upcoming events in your area
              </p>
              

              
              <div className="text-sm text-blue-600/60 space-y-1">
                <p>Events are filtered by:</p>
                <p>• Your location ({user?.city || 'Unknown'})</p>
                <p>• Next 30 days</p>
                <p>• Public events & your invitations</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={handleViewAllEvents}
                className="bg-gradient-to-r from-coral-400 to-pink-500 hover:from-coral-500 hover:to-pink-600 
                         text-white font-bold px-6 py-2.5 rounded-2xl shadow-xl hover:shadow-coral-500/30 
                         transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Browse All Events
              </Button>
              
              <p className="text-xs text-blue-600/50">
                or <a href="/events/create" className="underline hover:text-blue-600">create your own event</a>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Compact View All Button */}
      {events && events.length > 0 && (
        <div className="border-t border-blue-100/50 pt-3">
          <Button
            onClick={handleViewAllEvents}
            className="w-full bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 
                     text-white font-bold py-2 text-sm rounded-xl shadow-lg hover:shadow-teal-500/30 
                     transform hover:-translate-y-0.5 transition-all duration-300"
          >
            View All Events
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}