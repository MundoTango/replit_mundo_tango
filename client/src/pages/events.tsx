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
  Star,
  Video,
  RefreshCw,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import UploadMedia from '@/components/UploadMedia';
import GoogleMapsAutocomplete from '@/components/maps/GoogleMapsAutocomplete';
import CreateEventDialog from '@/components/events/CreateEventDialog';
import EventsCalendar from '@/components/events/EventsCalendar';
import EventListWithInfiniteScroll from '@/components/events/EventListWithInfiniteScroll';

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
  // New fields for enhanced events
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

export default function EventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'my' | 'attending' | 'nearby'>('all');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Advanced filters
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showVirtualOnly, setShowVirtualOnly] = useState(false);
  const [showRecurringOnly, setShowRecurringOnly] = useState(false);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    maxAttendees: '',
    isPublic: true,
    // New fields for ticketing/payment
    ticketPrice: '',
    currency: 'USD',
    ticketUrl: '',
    // Recurring event support
    isRecurring: false,
    recurringPattern: 'none',
    recurringEndDate: '',
    // Virtual event support
    isVirtual: false,
    virtualPlatform: '',
    virtualUrl: '',
    // Event category
    eventType: 'milonga',
    category: 'social',
    level: 'all_levels'
  });
  const [uploadedMedia, setUploadedMedia] = useState<any[]>([]);
  const [assignedRoles, setAssignedRoles] = useState<Array<{userIdentifier: string, role: string}>>([]);

  // Fetch events with performance optimizations
  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/events', filterBy, searchQuery, activeTab, eventTypeFilter, levelFilter, priceFilter, showVirtualOnly, showRecurringOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterBy !== 'all') params.append('filter', filterBy);
      if (searchQuery) params.append('q', searchQuery);
      if (activeTab !== 'upcoming') params.append('timeframe', activeTab);
      if (eventTypeFilter !== 'all') params.append('eventType', eventTypeFilter);
      if (levelFilter !== 'all') params.append('level', levelFilter);
      if (priceFilter !== 'all') params.append('priceRange', priceFilter);
      if (showVirtualOnly) params.append('virtual', 'true');
      if (showRecurringOnly) params.append('recurring', 'true');
      
      const response = await fetch(`/api/events?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.data || [];
    },
    // Performance optimizations
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
    refetchOnMount: 'always' // Always refetch on mount
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
      // Include ticketing information
      price: newEvent.ticketPrice || undefined,
      currency: newEvent.currency,
      ticketUrl: newEvent.ticketUrl || undefined,
      // Include recurring event data
      isRecurring: newEvent.isRecurring,
      recurringPattern: newEvent.isRecurring ? newEvent.recurringPattern : undefined,
      // Include virtual event data
      isVirtual: newEvent.isVirtual,
      virtualPlatform: newEvent.isVirtual ? newEvent.virtualPlatform : undefined,
      virtualUrl: newEvent.isVirtual ? newEvent.virtualUrl : undefined,
      // Include event type and level
      eventType: newEvent.eventType,
      level: newEvent.level,
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
              <Button className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700">
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
                  
                  <GoogleMapsAutocomplete
                    value={newEvent.location}
                    placeholder="Event location (venue, city, address)"
                    onLocationSelect={(locationData) => {
                      setNewEvent(prev => ({ ...prev, location: locationData.formattedAddress }));
                    }}
                    onClear={() => setNewEvent(prev => ({ ...prev, location: '' }))}
                    showMap={true}
                    className="col-span-2"
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
                  
                  {/* Event Type & Category */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Event Type</label>
                    <Select
                      value={newEvent.eventType}
                      onValueChange={(value) => setNewEvent(prev => ({ ...prev, eventType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="milonga">Milonga</SelectItem>
                        <SelectItem value="practica">Práctica</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="festival">Festival</SelectItem>
                        <SelectItem value="class">Class</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="marathon">Marathon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Level</label>
                    <Select
                      value={newEvent.level}
                      onValueChange={(value) => setNewEvent(prev => ({ ...prev, level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_levels">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Ticketing Section */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">Ticketing & Payment</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Ticket Price</label>
                      <div className="flex gap-2">
                        <Select
                          value={newEvent.currency}
                          onValueChange={(value) => setNewEvent(prev => ({ ...prev, currency: value }))}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="ARS">ARS</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={newEvent.ticketPrice}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, ticketPrice: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">External Ticket URL (optional)</label>
                      <Input
                        type="url"
                        placeholder="https://ticketing-platform.com/event"
                        value={newEvent.ticketUrl}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, ticketUrl: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Virtual Event Section */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Virtual Event Settings</h3>
                    <div className="flex items-center gap-2">
                      <label className="text-sm">Virtual Event</label>
                      <input
                        type="checkbox"
                        checked={newEvent.isVirtual}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, isVirtual: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                  </div>
                  
                  {newEvent.isVirtual && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Platform</label>
                        <Select
                          value={newEvent.virtualPlatform}
                          onValueChange={(value) => setNewEvent(prev => ({ ...prev, virtualPlatform: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zoom">Zoom</SelectItem>
                            <SelectItem value="youtube">YouTube Live</SelectItem>
                            <SelectItem value="facebook">Facebook Live</SelectItem>
                            <SelectItem value="instagram">Instagram Live</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Virtual Event URL</label>
                        <Input
                          type="url"
                          placeholder="https://zoom.us/j/..."
                          value={newEvent.virtualUrl}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, virtualUrl: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Recurring Event Section */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Recurring Event</h3>
                    <div className="flex items-center gap-2">
                      <label className="text-sm">Repeat Event</label>
                      <input
                        type="checkbox"
                        checked={newEvent.isRecurring}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, isRecurring: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                  </div>
                  
                  {newEvent.isRecurring && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Recurrence Pattern</label>
                        <Select
                          value={newEvent.recurringPattern}
                          onValueChange={(value) => setNewEvent(prev => ({ ...prev, recurringPattern: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select pattern" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Repeat Until</label>
                        <Input
                          type="date"
                          value={newEvent.recurringEndDate}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, recurringEndDate: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
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
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Event Media</h3>
                    <UploadMedia
                      onUpload={handleMediaUpload}
                      maxFiles={10}
                      folder="events"
                      tags={['event', 'tango']}
                      visibility="public"
                      context="event_creation"
                    />
                    {uploadedMedia.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Uploaded files ({uploadedMedia.length}):</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {uploadedMedia.map((file, index) => (
                            <div key={index} className="relative group">
                              {file.type?.startsWith('image/') ? (
                                <img 
                                  src={file.url} 
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <span className="text-xs text-gray-500 text-center px-2">
                                    {file.type?.split('/')[1] || 'Document'}
                                  </span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setUploadedMedia(uploadedMedia.filter((_, i) => i !== index));
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
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
                    className="bg-gradient-to-r from-turquoise-500 to-cyan-600"
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
          <CardContent className="p-4 space-y-4">
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
            
            {/* Advanced Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Event Type Filter */}
              <Select
                value={eventTypeFilter}
                onValueChange={setEventTypeFilter}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="milonga">Milonga</SelectItem>
                  <SelectItem value="practica">Práctica</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="marathon">Marathon</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Level Filter */}
              <Select
                value={levelFilter}
                onValueChange={setLevelFilter}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="all_levels">All Levels Welcome</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Price Range Filter */}
              <Select
                value={priceFilter}
                onValueChange={setPriceFilter}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="0-25">$0 - $25</SelectItem>
                  <SelectItem value="25-50">$25 - $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="100+">$100+</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Virtual Events Toggle */}
              <Button
                variant={showVirtualOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowVirtualOnly(!showVirtualOnly)}
                className={showVirtualOnly ? "bg-cyan-500 hover:bg-cyan-600" : ""}
              >
                <Video className="mr-2 h-4 w-4" />
                Virtual Events
              </Button>
              
              {/* Recurring Events Toggle */}
              <Button
                variant={showRecurringOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowRecurringOnly(!showRecurringOnly)}
                className={showRecurringOnly ? "bg-turquoise-500 hover:bg-turquoise-600" : ""}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recurring
              </Button>
              
              {/* Clear Filters */}
              {(eventTypeFilter !== 'all' || levelFilter !== 'all' || priceFilter !== 'all' || showVirtualOnly || showRecurringOnly) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEventTypeFilter('all');
                    setLevelFilter('all');
                    setPriceFilter('all');
                    setShowVirtualOnly(false);
                    setShowRecurringOnly(false);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
            
            {/* Trending & Recommended Section */}
            <div className="flex gap-2">
              <Badge variant="secondary" className="cursor-pointer hover:bg-turquoise-100">
                🔥 Trending Now
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-cyan-100">
                ⭐ Recommended for You
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                🆕 New This Week
              </Badge>
              <Badge variant="secondary" className="cursor-pointer hover:bg-purple-100">
                💎 Premium Events
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
            {activeTab === 'upcoming' ? 'Upcoming Events' : activeTab === 'this-week' ? 'This Week' : 'Past Events'}
          </h2>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-gradient-to-r from-turquoise-500 to-cyan-600' : ''}
            >
              <List className="h-4 w-4 mr-2" />
              List View
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className={viewMode === 'calendar' ? 'bg-gradient-to-r from-turquoise-500 to-cyan-600' : ''}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </Button>
          </div>
        </div>

        {/* Event Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="this-week">This Week</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {viewMode === 'calendar' ? (
              <EventsCalendar 
                events={events || []}
                onEventClick={(event) => window.location.href = `/events/${event.id}`}
                onDateClick={(date) => {
                  setShowCreateForm(true);
                  setNewEvent(prev => ({
                    ...prev,
                    startDate: format(date, "yyyy-MM-dd'T'HH:mm")
                  }));
                }}
              />
            ) : (
              <EventListWithInfiniteScroll
                filters={{
                  eventType: eventTypeFilter === 'all' ? undefined : eventTypeFilter,
                  level: levelFilter === 'all' ? undefined : levelFilter,
                  priceRange: priceFilter === 'all' ? undefined : priceFilter,
                  virtual: showVirtualOnly || undefined,
                  recurring: showRecurringOnly || undefined,
                  search: searchQuery || undefined,
                }}
                onEventClick={(event) => window.location.href = `/events/${event.id}`}
              />
            )}
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