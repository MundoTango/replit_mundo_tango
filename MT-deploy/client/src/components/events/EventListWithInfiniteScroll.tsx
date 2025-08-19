import React, { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, Video, RefreshCw, DollarSign, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Event {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  userId: number;
  isPublic: boolean;
  maxAttendees?: number;
  currentAttendees?: number;
  price?: string;
  currency?: string;
  ticketUrl?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  isVirtual?: boolean;
  virtualPlatform?: string;
  virtualUrl?: string;
  eventType?: string;
  level?: string;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  participants?: any[];
  userStatus?: 'going' | 'interested' | 'maybe' | null;
}

interface EventListWithInfiniteScrollProps {
  filters?: {
    eventType?: string;
    level?: string;
    priceRange?: string;
    virtual?: boolean;
    recurring?: boolean;
    search?: string;
  };
  onEventClick?: (event: Event) => void;
}

export default function EventListWithInfiniteScroll({ filters, onEventClick }: EventListWithInfiniteScrollProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const loadMoreEvents = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');
      
      if (filters) {
        if (filters.eventType) params.append('eventType', filters.eventType);
        if (filters.level) params.append('level', filters.level);
        if (filters.priceRange) params.append('priceRange', filters.priceRange);
        if (filters.virtual) params.append('virtual', 'true');
        if (filters.recurring) params.append('recurring', 'true');
        if (filters.search) params.append('q', filters.search);
      }
      
      const response = await fetch(`/api/events?${params}`, {
        credentials: 'include',
      });
      
      const result = await response.json();
      const newEvents = result.data || [];
      
      if (newEvents.length < 12) {
        setHasMore(false);
      }
      
      setEvents(prev => page === 1 ? newEvents : [...prev, ...newEvents]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load more events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, filters, loading, hasMore, toast]);

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && !loading && hasMore) {
      loadMoreEvents();
    }
  }, [inView, loading, hasMore, loadMoreEvents]);

  // Reset when filters change
  useEffect(() => {
    setEvents([]);
    setPage(1);
    setHasMore(true);
  }, [filters]);

  const handleEventAction = async (eventId: number, action: 'going' | 'interested' | 'maybe') => {
    try {
      await apiRequest('POST', `/api/events/${eventId}/rsvp`, { status: action });
      toast({
        title: 'Success',
        description: `You're ${action} to this event!`,
      });
      
      // Update local state
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, userStatus: action }
          : event
      ));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update RSVP status',
        variant: 'destructive',
      });
    }
  };

  const getEventTypeIcon = (type?: string) => {
    switch (type) {
      case 'milonga': return '💃';
      case 'workshop': return '🎓';
      case 'festival': return '🎉';
      case 'class': return '📚';
      case 'performance': return '🎭';
      case 'practica': return '🕺';
      case 'marathon': return '🏃';
      default: return '📅';
    }
  };

  const getPriceDisplay = (event: Event) => {
    if (!event.price || event.price === '0') return 'Free';
    return `${event.currency || '$'} ${event.price}`;
  };

  return (
    <div className="space-y-6">
      {/* Featured Events Section */}
      {page === 1 && events.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
              Featured Events
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.slice(0, 2).map(event => (
              <Card 
                key={event.id} 
                className="glassmorphic-card hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
                onClick={() => onEventClick?.(event)}
              >
                <div className="relative h-48">
                  <LazyLoadImage
                    src={event.imageUrl || '/api/placeholder/800/400'}
                    alt={event.title}
                    effect="blur"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="text-white font-semibold text-lg mb-1">{event.title}</h4>
                    <div className="flex items-center gap-3 text-white/90 text-sm">
                      <span>{format(new Date(event.startDate), 'MMM d')}</span>
                      <span>•</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  {event.isVirtual && (
                    <Badge className="absolute top-4 right-4 bg-cyan-500/90 text-white">
                      <Video className="h-3 w-3 mr-1" />
                      Virtual
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <Card 
            key={event.id}
            className="glassmorphic-card hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => onEventClick?.(event)}
          >
            {/* Event Image */}
            <div className="relative h-48 overflow-hidden">
              <LazyLoadImage
                src={event.imageUrl || '/api/placeholder/400/300'}
                alt={event.title}
                effect="blur"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                placeholderSrc="/api/placeholder/40/30"
              />
              
              {/* Event Type Badge */}
              <div className="absolute top-3 left-3">
                <Badge className="bg-white/90 backdrop-blur-sm">
                  <span className="mr-1">{getEventTypeIcon(event.eventType)}</span>
                  {event.eventType}
                </Badge>
              </div>
              
              {/* Price Badge */}
              <div className="absolute top-3 right-3">
                <Badge 
                  variant={event.price === '0' || !event.price ? 'secondary' : 'default'}
                  className="bg-white/90 backdrop-blur-sm"
                >
                  {getPriceDisplay(event)}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Title and Host */}
              <div>
                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-turquoise-600 transition-colors">
                  {event.title}
                </h3>
                {event.user && (
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <LazyLoadImage
                      src={event.user.profileImage || '/api/placeholder/32/32'}
                      alt={event.user.name}
                      className="w-6 h-6 rounded-full"
                      effect="opacity"
                    />
                    {event.user.name}
                  </p>
                )}
              </div>

              {/* Event Details */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(event.startDate), 'EEE, MMM d, h:mm a')}</span>
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                )}
                
                {event.maxAttendees && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{event.currentAttendees || 0} / {event.maxAttendees} attending</span>
                  </div>
                )}
              </div>

              {/* Special Badges */}
              <div className="flex gap-2 flex-wrap">
                {event.isVirtual && (
                  <Badge variant="secondary" className="text-xs">
                    <Video className="h-3 w-3 mr-1" />
                    Virtual
                  </Badge>
                )}
                {event.isRecurring && (
                  <Badge variant="secondary" className="text-xs">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Recurring
                  </Badge>
                )}
                {event.level && event.level !== 'all_levels' && (
                  <Badge variant="outline" className="text-xs">
                    {event.level}
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant={event.userStatus === 'going' ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventAction(event.id, 'going');
                  }}
                  className={event.userStatus === 'going' ? 'bg-gradient-to-r from-turquoise-500 to-cyan-600' : ''}
                >
                  Going
                </Button>
                <Button
                  size="sm"
                  variant={event.userStatus === 'interested' ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventAction(event.id, 'interested');
                  }}
                >
                  Interested
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-turquoise-500 rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce delay-100" />
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200" />
          </div>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && !loading && (
        <div ref={ref} className="h-20" />
      )}

      {/* No More Events */}
      {!hasMore && events.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No more events to load</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <Card className="glassmorphic-card">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later for new events.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}