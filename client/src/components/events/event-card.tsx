import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign,
  Share2,
  Heart,
  MoreHorizontal
} from "lucide-react";

interface Event {
  id: number;
  userId: number;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  location: string;
  price?: string;
  maxAttendees?: number;
  currentAttendees: number;
  isPublic: boolean;
  status: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const [rsvpStatus, setRsvpStatus] = useState<'going' | 'interested' | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async (status: 'going' | 'interested' | 'not_going') => {
      const response = await fetch(`/api/events/${event.id}/rsvp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to RSVP');
      return response.json();
    },
    onSuccess: (data, status) => {
      setRsvpStatus(status === 'not_going' ? null : status);
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "RSVP Updated!",
        description: `You are now ${status === 'going' ? 'going to' : status === 'interested' ? 'interested in' : 'not attending'} this event.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update RSVP",
        variant: "destructive",
      });
    },
  });

  const handleRSVP = (status: 'going' | 'interested') => {
    if (rsvpStatus === status) {
      // If already selected, remove RSVP
      rsvpMutation.mutate('not_going');
    } else {
      rsvpMutation.mutate(status);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Event link copied to clipboard.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isEventPast = new Date(event.startDate) < new Date();
  const isEventToday = new Date(event.startDate).toDateString() === new Date().toDateString();

  return (
    <Card className="card-shadow hover:shadow-lg transition-shadow">
      {/* Event Image */}
      {event.imageUrl && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          {isEventToday && (
            <Badge className="absolute top-3 left-3 bg-tango-red hover:bg-tango-red">
              Today
            </Badge>
          )}
          {isEventPast && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">
                Event Ended
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        {/* Event Creator */}
        {event.user && (
          <div className="flex items-center space-x-2 mb-3">
            <Avatar className="w-6 h-6">
              <AvatarImage src={event.user.profileImage} alt={event.user.name} />
              <AvatarFallback className="text-xs">{event.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600">by {event.user.name}</span>
          </div>
        )}

        {/* Event Title */}
        <h3 className="font-semibold text-lg text-tango-black leading-tight">
          {event.title}
        </h3>

        {/* Event Date & Time */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{formatTime(event.startDate)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Event Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{event.location}</span>
          </div>
          
          {event.price && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>{event.price}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              {event.currentAttendees} attending
              {event.maxAttendees && ` / ${event.maxAttendees} max`}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {!isEventPast ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={rsvpStatus === 'going' ? 'default' : 'outline'}
                onClick={() => handleRSVP('going')}
                disabled={rsvpMutation.isPending}
                className={rsvpStatus === 'going' ? 'bg-tango-red hover:bg-tango-red/90' : 'border-tango-red text-tango-red hover:bg-tango-red hover:text-white'}
              >
                {rsvpStatus === 'going' ? 'Going' : 'Going'}
              </Button>
              
              <Button
                size="sm"
                variant={rsvpStatus === 'interested' ? 'default' : 'outline'}
                onClick={() => handleRSVP('interested')}
                disabled={rsvpMutation.isPending}
                className={rsvpStatus === 'interested' ? 'bg-tango-red hover:bg-tango-red/90' : 'border-tango-red text-tango-red hover:bg-tango-red hover:text-white'}
              >
                {rsvpStatus === 'interested' ? 'Interested' : 'Interested'}
              </Button>
            </div>
            
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full text-center text-gray-500 text-sm">
            This event has ended
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
