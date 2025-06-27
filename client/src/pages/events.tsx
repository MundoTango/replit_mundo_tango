import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/authUtils";
import Navbar from "@/components/layout/navbar";
import MobileNav from "@/components/layout/mobile-nav";
import EventCard from "@/components/events/event-card";
import EventCalendar from "@/components/events/event-calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  MapPin, 
  Search,
  Filter,
  Grid3X3,
  List
} from "lucide-react";

export default function Events() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    price: "",
    maxAttendees: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      return data.data;
    },
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setIsCreateEventOpen(false);
      setEventData({
        title: "",
        description: "",
        location: "",
        startDate: "",
        endDate: "",
        price: "",
        maxAttendees: "",
      });
      toast({
        title: "Event created!",
        description: "Your event has been published successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(eventData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    createEventMutation.mutate(formData);
  };

  const filteredEvents = events.filter((event: any) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingEvents = filteredEvents.filter((event: any) => 
    new Date(event.startDate) > new Date()
  );

  const todayEvents = filteredEvents.filter((event: any) => {
    const today = new Date();
    const eventDate = new Date(event.startDate);
    return eventDate.toDateString() === today.toDateString();
  });

  return (
    <div className="min-h-screen bg-tango-gray">
      <Navbar onOpenChat={() => setIsChatOpen(true)} />
      
      <div className="pt-16 pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-tango-black mb-2">Tango Events</h1>
              <p className="text-gray-600">Discover and join tango events near you</p>
            </div>
            
            <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
              <DialogTrigger asChild>
                <Button className="bg-tango-red hover:bg-tango-red/90 mt-4 md:mt-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      value={eventData.title}
                      onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Friday Night Milonga"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={eventData.description}
                      onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your event..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={eventData.location}
                      onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Event venue address"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date & Time</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={eventData.startDate}
                        onChange={(e) => setEventData(prev => ({ ...prev, startDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date & Time</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={eventData.endDate}
                        onChange={(e) => setEventData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        value={eventData.price}
                        onChange={(e) => setEventData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="e.g., $20 or Free"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxAttendees">Max Attendees</Label>
                      <Input
                        id="maxAttendees"
                        type="number"
                        value={eventData.maxAttendees}
                        onChange={(e) => setEventData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                        placeholder="e.g., 50"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-tango-red hover:bg-tango-red/90"
                    disabled={createEventMutation.isPending}
                  >
                    {createEventMutation.isPending ? "Creating..." : "Create Event"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search events by title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-tango-red hover:bg-tango-red/90' : ''}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={viewMode === 'calendar' ? 'bg-tango-red hover:bg-tango-red/90' : ''}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {viewMode === 'calendar' ? (
            <EventCalendar events={filteredEvents} />
          ) : (
            <div className="space-y-6">
              {/* Today's Events */}
              {todayEvents.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-tango-black mb-4">Today's Events</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {todayEvents.map((event: any) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Events */}
              <div>
                <h2 className="text-xl font-semibold text-tango-black mb-4">
                  {todayEvents.length > 0 ? 'Upcoming Events' : 'All Events'}
                </h2>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="card-shadow animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                        <CardContent className="p-4">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingEvents.map((event: any) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <Card className="card-shadow">
                    <CardContent className="p-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <CalendarIcon className="h-16 w-16 mx-auto" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        {searchQuery ? 'No events found' : 'No events yet'}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchQuery 
                          ? 'Try adjusting your search terms'
                          : 'Be the first to organize a tango event in your area!'
                        }
                      </p>
                      {!searchQuery && (
                        <Button 
                          className="bg-tango-red hover:bg-tango-red/90"
                          onClick={() => setIsCreateEventOpen(true)}
                        >
                          Create First Event
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav onOpenChat={() => setIsChatOpen(true)} />
    </div>
  );
}
