import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import EventCard from '@/components/events/EventCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Search,
  Filter,
  Clock,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import UploadMedia from '@/components/UploadMedia';

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

export default function EventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'my' | 'attending' | 'nearby'>('all');
  const [activeTab, setActiveTab] = useState('upcoming');
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    maxAttendees: '',
    isPublic: true
  });
  const [uploadedMedia, setUploadedMedia] = useState<any[]>([]);
  const [assignedRoles, setAssignedRoles] = useState<Array<{userIdentifier: string, role: string}>>([]);

  // Fetch events
  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/events', filterBy, searchQuery, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterBy !== 'all') params.append('filter', filterBy);
      if (searchQuery) params.append('q', searchQuery);
      if (activeTab !== 'upcoming') params.append('timeframe', activeTab);
      
      const response = await fetch(`/api/events?${params}`, {
        credentials: 'include'
      });
      const result = await response.json();
      return result.data || [];
    }
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      return apiRequest('POST', '/api/events', eventData);
    },
    onSuccess: (data) => {
      const hasRoleAssignments = assignedRoles.length > 0;
      toast({
        title: "Event created",
        description: hasRoleAssignments 
          ? "Event created and invitations sent!" 
          : "Your tango event has been created successfully.",
      });
      setShowCreateForm(false);
      setNewEvent({
        title: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        maxAttendees: '',
        isPublic: true
      });
      setUploadedMedia([]);
      setAssignedRoles([]);
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreateEvent = () => {
    if (!newEvent.title.trim() || !newEvent.startDate) {
      toast({
        title: "Required fields missing",
        description: "Please fill in the event title and start date.",
        variant: "destructive",
      });
      return;
    }

    if (assignedRoles.length > 10) {
      toast({
        title: "Error",
        description: "Maximum 10 role assignments allowed per event.",
        variant: "destructive",
      });
      return;
    }

    const eventData = {
      ...newEvent,
      maxAttendees: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : undefined,
      imageUrl: uploadedMedia.find(m => m.type?.startsWith('image/'))?.url,
      assignedRoles: assignedRoles,
    };

    createEventMutation.mutate(eventData);
  };

  const handleMediaUpload = (files: any[]) => {
    setUploadedMedia(files);
  };

  const handleEditEvent = (event: Event) => {
    // Navigate to edit event page or open edit modal
    console.log('Edit event:', event);
  };

  const handleShareEvent = (event: Event) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.origin + `/events/${event.id}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/events/${event.id}`);
      toast({
        title: "Link copied",
        description: "Event link has been copied to clipboard.",
      });
    }
  };

  // Quick date presets
  const getQuickDatePresets = () => {
    const today = new Date();
    return [
      { label: 'Today', value: format(today, 'yyyy-MM-dd') },
      { label: 'Tomorrow', value: format(addDays(today, 1), 'yyyy-MM-dd') },
      { label: 'This Weekend', value: format(addDays(today, 6 - today.getDay()), 'yyyy-MM-dd') },
      { label: 'Next Week', value: format(addDays(today, 7), 'yyyy-MM-dd') },
    ];
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tango Events</h1>
            <p className="text-gray-600 mt-1">Discover and organize tango events worldwide</p>
          </div>
          
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Tango Event</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Input
                      placeholder="Event title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      className="text-lg font-semibold"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Textarea
                      placeholder="Event description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <Input
                    placeholder="Location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  />
                  
                  <Input
                    type="number"
                    placeholder="Max attendees (optional)"
                    value={newEvent.maxAttendees}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, maxAttendees: e.target.value }))}
                  />
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">End Date & Time (optional)</label>
                    <Input
                      type="datetime-local"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Visibility:</span>
                    <div className="flex gap-2">
                      <Button
                        variant={newEvent.isPublic ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewEvent(prev => ({ ...prev, isPublic: true }))}
                      >
                        Public
                      </Button>
                      <Button
                        variant={!newEvent.isPublic ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewEvent(prev => ({ ...prev, isPublic: false }))}
                      >
                        Private
                      </Button>
                    </div>
                  </div>
                  
                  <UploadMedia
                    onUpload={handleMediaUpload}
                    maxFiles={1}
                    folder="events"
                    tags={['event', 'tango']}
                    visibility="public"
                    context="event_creation"
                  />
                  
                  {/* Assign Roles Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Assign Roles</label>
                    <p className="text-xs text-gray-500">Tag users with specific roles for this event (optional)</p>
                    
                    {assignedRoles.map((assignment, index) => (
                      <div key={index} className="flex gap-2 items-center bg-white rounded-md border p-2">
                        <input
                          type="text"
                          placeholder="User ID or email"
                          value={assignment.userIdentifier}
                          onChange={(e) => {
                            const newRoles = [...assignedRoles];
                            newRoles[index].userIdentifier = e.target.value;
                            setAssignedRoles(newRoles);
                          }}
                          className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <select
                          value={assignment.role}
                          onChange={(e) => {
                            const newRoles = [...assignedRoles];
                            newRoles[index].role = e.target.value;
                            setAssignedRoles(newRoles);
                          }}
                          className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="DJ">DJ</option>
                          <option value="Teacher">Teacher</option>
                          <option value="Musician">Musician</option>
                          <option value="Performer">Performer</option>
                          <option value="Host">Host</option>
                          <option value="Volunteer">Volunteer</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const newRoles = assignedRoles.filter((_, i) => i !== index);
                            setAssignedRoles(newRoles);
                          }}
                          className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    
                    {assignedRoles.length < 10 && (
                      <button
                        type="button"
                        onClick={() => {
                          setAssignedRoles([...assignedRoles, { userIdentifier: '', role: 'DJ' }]);
                        }}
                        className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-colors"
                      >
                        + Add Role Assignment
                      </button>
                    )}
                    
                    {assignedRoles.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {assignedRoles.map((assignment, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {assignment.userIdentifier} • {assignment.role}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateEvent}
                    disabled={createEventMutation.isPending}
                    className="bg-gradient-to-r from-pink-500 to-purple-600"
                  >
                    {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filterBy === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterBy('all')}
                >
                  All Events
                </Button>
                <Button
                  variant={filterBy === 'my' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterBy('my')}
                >
                  My Events
                </Button>
                <Button
                  variant={filterBy === 'attending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterBy('attending')}
                >
                  Attending
                </Button>
                <Button
                  variant={filterBy === 'nearby' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterBy('nearby')}
                >
                  Nearby
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="this-week">This Week</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {/* Events Grid */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="animate-pulse space-y-4">
                          <div className="h-48 bg-gray-200 rounded"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : events?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event: Event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={handleEditEvent}
                      onShare={handleShareEvent}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">No events found</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        {filterBy === 'my' 
                          ? "You haven't created any events yet. Create your first tango event to get started!"
                          : "No events match your current filters. Try adjusting your search or create a new event."
                        }
                      </p>
                      <Button 
                        onClick={() => setShowCreateForm(true)}
                        className="bg-gradient-to-r from-pink-500 to-purple-600"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Event
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Weekly Milongas</h3>
              <p className="text-sm text-gray-600">Find regular milonga events in your area</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Workshops</h3>
              <p className="text-sm text-gray-600">Discover tango workshops and masterclasses</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Festivals</h3>
              <p className="text-sm text-gray-600">Join tango festivals around the world</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}