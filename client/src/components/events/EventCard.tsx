import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Share2, 
  MoreVertical, 
  Edit, 
  Trash2,
  Heart,
  Clock
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
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
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  participants?: any[];
  userStatus?: 'going' | 'interested' | 'maybe' | null;
}

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onShare?: (event: Event) => void;
}

export default function EventCard({ event, onEdit, onShare }: EventCardProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showParticipants, setShowParticipants] = useState(false);

  const isEventOwner = user?.id === event.userId;

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      return apiRequest('DELETE', `/api/events/${eventId}`);
    },
    onSuccess: () => {
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: number; status: string }) => {
      return apiRequest('POST', `/api/events/${eventId}/rsvp`, { status });
    },
    onSuccess: () => {
      toast({
        title: "RSVP updated",
        description: "Your response has been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleRSVP = (status: string) => {
    rsvpMutation.mutate({ eventId: event.id, status });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(event.id);
    }
  };

  const handleViewEvent = () => {
    setLocation(`/events/${event.id}`);
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy • h:mm a');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'going': return 'bg-green-500 hover:bg-green-600';
      case 'interested': return 'bg-blue-500 hover:bg-blue-600';
      case 'maybe': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
      {/* Event Image */}
      <div 
        className="relative h-48 bg-gradient-to-b from-transparent to-black/60"
        style={{
          backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Event Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            onClick={() => onShare?.(event)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          
          {isEventOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(event)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Event Date Badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
            <Calendar className="mr-1 h-3 w-3" />
            {format(new Date(event.startDate), 'MMM dd')}
          </Badge>
        </div>

        {/* Event Title & Location */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 
            className="text-white font-bold text-lg mb-2 cursor-pointer hover:text-gray-200 transition-colors line-clamp-2"
            onClick={handleViewEvent}
          >
            {event.title}
          </h3>
          
          {event.location && (
            <div className="flex items-center text-white/90 text-sm">
              <MapPin className="mr-1 h-4 w-4" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="mr-2 h-4 w-4" />
            {formatEventDate(event.startDate)}
          </div>
          
          {event.description && (
            <p className="text-sm text-gray-700 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>

        {/* Participants */}
        {event.participants && event.participants.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Friends attending
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowParticipants(!showParticipants)}
                className="text-xs"
              >
                View all ({event.participants.length})
              </Button>
            </div>
            
            <div className="flex -space-x-2 overflow-hidden">
              {event.participants.slice(0, 5).map((participant, index) => (
                <Avatar key={participant.id || index} className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={participant.user?.profileImage} />
                  <AvatarFallback className="text-xs">
                    {participant.user?.name?.[0] || participant.user?.username?.[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
              
              {event.participants.length > 5 && (
                <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    +{event.participants.length - 5}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RSVP Buttons */}
        <div className="flex gap-2">
          {event.userStatus === 'going' ? (
            <Button 
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              disabled
            >
              <Heart className="mr-2 h-4 w-4" />
              Going
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleRSVP('interested')}
                disabled={rsvpMutation.isPending}
              >
                Interested
              </Button>
              <Button 
                className="flex-1"
                onClick={() => handleRSVP('going')}
                disabled={rsvpMutation.isPending}
              >
                Going
              </Button>
            </>
          )}
        </div>

        {/* Event Statistics */}
        {(event.maxAttendees || event.currentAttendees) && (
          <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
            <span>
              {event.currentAttendees || 0} attending
            </span>
            {event.maxAttendees && (
              <span>
                Max: {event.maxAttendees}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}