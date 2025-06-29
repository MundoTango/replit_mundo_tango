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
      return response.json();
    }
  });

  const events = eventsResponse?.data || [];

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
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-100/50 p-8">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-200 to-teal-200 rounded-xl"></div>
            <div className="h-6 bg-gradient-to-r from-blue-200 to-teal-200 rounded-xl w-32"></div>
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 p-4 border rounded-2xl">
              <div className="h-4 bg-gradient-to-r from-coral-200 to-pink-200 rounded-xl w-3/4"></div>
              <div className="h-3 bg-gradient-to-r from-blue-200 to-teal-200 rounded-xl w-1/2"></div>
              <div className="h-3 bg-gradient-to-r from-blue-200 to-teal-200 rounded-xl w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-100/50 p-8 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-coral-400 to-pink-500 p-3 rounded-2xl shadow-xl">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Upcoming Events
            </h3>
            <p className="text-blue-600/70 font-medium text-sm">In your area & invitations</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-coral-100 to-pink-100 p-2 rounded-2xl">
          <Sparkles className="h-5 w-5 text-coral-600" />
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4 mb-6">
        {events?.slice(0, 4).map((event: Event) => {
          const typeInfo = getEventTypeInfo(event.eventType || '');
          return (
            <div
              key={event.id}
              className="group bg-gradient-to-br from-blue-50/30 to-teal-50/30 p-5 rounded-2xl border-2 border-blue-100/50 
                       hover:border-coral-300 hover:shadow-xl hover:bg-white/70 transition-all duration-300 cursor-pointer
                       transform hover:-translate-y-1"
              onClick={() => handleEventClick(event.id)}
            >
              {/* Event Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${typeInfo.bgColor} ${typeInfo.color} border-0 text-xs font-bold px-3 py-1 rounded-xl`}>
                      {typeInfo.name}
                    </Badge>
                    {event.userStatus && (
                      <Badge className={`border-0 text-xs font-bold px-2 py-1 rounded-lg ${
                        event.userStatus === 'going' 
                          ? 'bg-green-100 text-green-700' 
                          : event.userStatus === 'interested'
                          ? 'bg-blue-100 text-blue-700'
                          : event.userStatus === 'invited'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {event.userStatus === 'going' && '✓ Going'}
                        {event.userStatus === 'interested' && '★ Interested'}
                        {event.userStatus === 'invited' && '✉ Invited'}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-bold text-blue-900 text-lg group-hover:text-coral-600 transition-colors line-clamp-1">
                    {event.title}
                  </h4>
                </div>
                <ChevronRight className="h-5 w-5 text-blue-400 group-hover:text-coral-500 transition-colors" />
              </div>

              {/* Event Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600/80 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  <span>{formatEventDate(event.startDate)} • {formatEventTime(event.startDate)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-blue-600/80 text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{event.city}, {event.country}</span>
                </div>
                
                <div className="flex items-center gap-2 text-blue-600/80 text-sm font-medium">
                  <Users className="h-4 w-4" />
                  <span>
                    {event.currentAttendees} attending
                    {event.maxAttendees && ` / ${event.maxAttendees} max`}
                  </span>
                </div>
              </div>

              {/* Organizer */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-blue-100/50">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-coral-200 to-pink-200 flex items-center justify-center">
                  {event.user?.profileImage ? (
                    <img
                      src={event.user.profileImage}
                      alt={event.user.name}
                      className="w-6 h-6 rounded-full object-cover"
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
          );
        })}

        {(!events || events.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-coral-400 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
              No upcoming events
            </h4>
            <p className="text-blue-600/70 font-medium mb-4">
              Check back later for new events in your area
            </p>
            <Button
              onClick={handleViewAllEvents}
              className="bg-gradient-to-r from-coral-400 to-pink-500 hover:from-coral-500 hover:to-pink-600 
                       text-white font-bold px-6 py-3 rounded-2xl shadow-xl hover:shadow-coral-500/30 
                       transform hover:-translate-y-1 transition-all duration-300"
            >
              Browse All Events
            </Button>
          </div>
        )}
      </div>

      {/* View All Button */}
      {events && events.length > 0 && (
        <div className="border-t-2 border-blue-100/50 pt-6">
          <Button
            onClick={handleViewAllEvents}
            className="w-full bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 
                     text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-teal-500/30 
                     transform hover:-translate-y-1 transition-all duration-300"
          >
            View All Events
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}