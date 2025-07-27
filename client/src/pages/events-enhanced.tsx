import React, { useState, useEffect } from 'react';
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
  Music,
  GraduationCap,
  UserCheck,
  Camera,
  Mic,
  Home,
  HandHeart,
  Globe,
  Map as MapIcon,
  Grid,
  Upload,
  X,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import UploadMedia from '@/components/UploadMedia';
import GoogleMapsAutocomplete from '@/components/maps/GoogleMapsAutocomplete';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import EventMap from '@/components/EventMap';

// Event types from requirements
const EVENT_TYPES = [
  { value: 'milonga', label: 'Milonga', icon: Music },
  { value: 'workshop', label: 'Workshop', icon: GraduationCap },
  { value: 'practica', label: 'Práctica', icon: UserCheck },
  { value: 'marathon', label: 'Marathon', icon: Clock },
  { value: 'festival', label: 'Festival', icon: Star },
  { value: 'competition', label: 'Competition', icon: Star },
  { value: 'encuentro', label: 'Encuentro', icon: Users },
  { value: 'clase', label: 'Clase', icon: GraduationCap },
  { value: 'social', label: 'Social', icon: Users }
];

// Vibe types from requirements
const VIBE_TYPES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'bar', label: 'Bar' },
  { value: 'dance_studio', label: 'Dance Studio' },
  { value: 'lgbtq', label: 'LGBTQ+' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'intimate', label: 'Intimate' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'modern', label: 'Modern' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' }
];

// Participant roles
const PARTICIPANT_ROLES = [
  { value: 'dj', label: 'DJ', icon: Music },
  { value: 'teacher', label: 'Teacher', icon: GraduationCap },
  { value: 'musician', label: 'Musician', icon: Mic },
  { value: 'performer', label: 'Performer', icon: Star },
  { value: 'host', label: 'Host', icon: Home },
  { value: 'volunteer', label: 'Volunteer', icon: HandHeart },
  { value: 'photographer', label: 'Photographer', icon: Camera },
  { value: 'organizer', label: 'Co-Organizer', icon: Users }
];

interface Event {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  coverPhotoUrl?: string;
  location?: string;
  locationCoordinates?: { lat: number; lng: number };
  startDate: string;
  endDate?: string;
  userId: number;
  isPublic: boolean;
  maxAttendees?: number;
  currentAttendees?: number;
  eventTypes: string[];
  vibeTypes: string[];
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  participants?: any[];
  userStatus?: 'going' | 'interested' | 'maybe' | null;
}

export default function EnhancedEventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'my' | 'attending' | 'nearby'>('all');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedVibeTypes, setSelectedVibeTypes] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    locationCoordinates: null as any,
    startDate: '',
    endDate: '',
    maxAttendees: '',
    isPublic: true,
    eventTypes: [] as string[],
    vibeTypes: [] as string[]
  });
  
  const [coverPhoto, setCoverPhoto] = useState<any>(null);
  const [uploadedMedia, setUploadedMedia] = useState<any[]>([]);
  const [assignedRoles, setAssignedRoles] = useState<Array<{userIdentifier: string, role: string}>>([]);
  const [newRoleAssignment, setNewRoleAssignment] = useState({ userIdentifier: '', role: '' });

  // Fetch events with enhanced filtering
  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/events/enhanced', filterBy, searchQuery, activeTab, selectedEventTypes, selectedVibeTypes, selectedLocation, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterBy !== 'all') params.append('filter', filterBy);
      if (searchQuery) params.append('q', searchQuery);
      if (activeTab !== 'upcoming') params.append('timeframe', activeTab);
      if (selectedEventTypes.length > 0) params.append('types', selectedEventTypes.join(','));
      if (selectedVibeTypes.length > 0) params.append('vibes', selectedVibeTypes.join(','));
      if (selectedLocation) params.append('location', JSON.stringify(selectedLocation));
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      
      const response = await fetch(`/api/events/enhanced?${params}`, {
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
    }
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const formData = new FormData();
      
      // Add all event data
      Object.keys(eventData).forEach(key => {
        if (key === 'eventTypes' || key === 'vibeTypes') {
          formData.append(key, JSON.stringify(eventData[key]));
        } else if (key === 'locationCoordinates') {
          formData.append(key, JSON.stringify(eventData[key]));
        } else {
          formData.append(key, eventData[key]);
        }
      });
      
      // Add cover photo if present
      if (coverPhoto) {
        formData.append('coverPhoto', coverPhoto);
      }
      
      // Add media files
      uploadedMedia.forEach((media, index) => {
        if (media.file) {
          formData.append(`media_${index}`, media.file);
        }
      });
      
      return apiRequest('POST', '/api/events/enhanced', formData);
    },
    onSuccess: (data) => {
      toast({
        title: "Event created",
        description: "Your tango event has been created successfully.",
      });
      setShowCreateForm(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/events/enhanced'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      location: '',
      locationCoordinates: null,
      startDate: '',
      endDate: '',
      maxAttendees: '',
      isPublic: true,
      eventTypes: [],
      vibeTypes: []
    });
    setCoverPhoto(null);
    setUploadedMedia([]);
    setAssignedRoles([]);
  };

  const handleCreateEvent = () => {
    if (!newEvent.title.trim() || !newEvent.startDate || newEvent.eventTypes.length === 0) {
      toast({
        title: "Required fields missing",
        description: "Please fill in title, date, and select at least one event type.",
        variant: "destructive",
      });
      return;
    }

    createEventMutation.mutate({
      ...newEvent,
      assignedRoles,
      mediaIds: uploadedMedia.map(m => m.id).filter(Boolean)
    });
  };

  const handleLocationSelect = (location: any) => {
    setNewEvent({
      ...newEvent,
      location: location.formatted_address || location.name,
      locationCoordinates: {
        lat: location.geometry?.location?.lat() || 0,
        lng: location.geometry?.location?.lng() || 0
      }
    });
  };

  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPhoto(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        // You could set a preview state here if needed
      };
      reader.readAsDataURL(file);
    }
  };

  const addRoleAssignment = () => {
    if (newRoleAssignment.userIdentifier && newRoleAssignment.role) {
      if (assignedRoles.length >= 10) {
        toast({
          title: "Limit reached",
          description: "You can only assign up to 10 roles per event.",
          variant: "destructive",
        });
        return;
      }
      
      setAssignedRoles([...assignedRoles, newRoleAssignment]);
      setNewRoleAssignment({ userIdentifier: '', role: '' });
    }
  };

  const removeRoleAssignment = (index: number) => {
    setAssignedRoles(assignedRoles.filter((_, i) => i !== index));
  };

  const FilterSection = () => (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
          </Button>
        </div>
      </CardHeader>
      {showFilters && (
        <CardContent className="space-y-4">
          {/* Event Types */}
          <div>
            <Label className="text-sm font-medium mb-2">Event Types</Label>
            <div className="grid grid-cols-3 gap-2">
              {EVENT_TYPES.map(type => (
                <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={selectedEventTypes.includes(type.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedEventTypes([...selectedEventTypes, type.value]);
                      } else {
                        setSelectedEventTypes(selectedEventTypes.filter(t => t !== type.value));
                      }
                    }}
                  />
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Vibe Types */}
          <div>
            <Label className="text-sm font-medium mb-2">Vibes</Label>
            <div className="grid grid-cols-3 gap-2">
              {VIBE_TYPES.map(vibe => (
                <label key={vibe.value} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={selectedVibeTypes.includes(vibe.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedVibeTypes([...selectedVibeTypes, vibe.value]);
                      } else {
                        setSelectedVibeTypes(selectedVibeTypes.filter(v => v !== vibe.value));
                      }
                    }}
                  />
                  <span className="text-sm">{vibe.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <Label className="text-sm font-medium mb-2">Location</Label>
            <GoogleMapsAutocomplete
              onLocationSelect={(location) => setSelectedLocation(location)}
              placeholder="Filter by city, state, or country"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2">Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2">End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>

          {/* Clear Filters */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedEventTypes([]);
              setSelectedVibeTypes([]);
              setSelectedLocation(null);
              setDateRange({ start: '', end: '' });
            }}
          >
            Clear All Filters
          </Button>
        </CardContent>
      )}
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tango Events</h1>
              <p className="text-gray-600 mt-1">
                Discover milongas, workshops, and festivals around the world
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="gap-2"
                >
                  <Grid className="h-4 w-4" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="gap-2"
                >
                  <MapIcon className="h-4 w-4" />
                  Map
                </Button>
              </div>
              
              {/* Create Event Button */}
              <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600">
                    <Plus className="h-4 w-4" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create a New Tango Event</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6 mt-4">
                    {/* Cover Photo Upload */}
                    <div>
                      <Label>Cover Photo</Label>
                      <div className="mt-2">
                        {coverPhoto ? (
                          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={URL.createObjectURL(coverPhoto)}
                              alt="Cover"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 bg-white/80"
                              onClick={() => setCoverPhoto(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                            <div className="flex flex-col items-center justify-center h-full">
                              <Upload className="h-8 w-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600">Upload cover photo</span>
                              <span className="text-xs text-gray-500 mt-1">Recommended: 1200x630px</span>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleCoverPhotoUpload}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div>
                      <Label htmlFor="title">Event Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Wednesday Night Milonga at El Beso"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Tell dancers about your event..."
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        className="mt-1"
                        rows={4}
                      />
                    </div>

                    {/* Event Types */}
                    <div>
                      <Label>Event Type(s) * (select all that apply)</Label>
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        {EVENT_TYPES.map(type => {
                          const Icon = type.icon;
                          const isSelected = newEvent.eventTypes.includes(type.value);
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setNewEvent({
                                    ...newEvent,
                                    eventTypes: newEvent.eventTypes.filter(t => t !== type.value)
                                  });
                                } else {
                                  setNewEvent({
                                    ...newEvent,
                                    eventTypes: [...newEvent.eventTypes, type.value]
                                  });
                                }
                              }}
                              className={cn(
                                "flex items-center gap-2 p-3 rounded-lg border transition-colors",
                                isSelected
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-gray-200 hover:border-gray-300"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="text-sm font-medium">{type.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Vibe Types */}
                    <div>
                      <Label>Vibe (select all that apply)</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {VIBE_TYPES.map(vibe => {
                          const isSelected = newEvent.vibeTypes.includes(vibe.value);
                          return (
                            <label key={vibe.value} className="flex items-center space-x-2 cursor-pointer">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setNewEvent({
                                      ...newEvent,
                                      vibeTypes: [...newEvent.vibeTypes, vibe.value]
                                    });
                                  } else {
                                    setNewEvent({
                                      ...newEvent,
                                      vibeTypes: newEvent.vibeTypes.filter(v => v !== vibe.value)
                                    });
                                  }
                                }}
                              />
                              <span className="text-sm">{vibe.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Location with Google Maps */}
                    <div>
                      <Label>Location *</Label>
                      <GoogleMapsAutocomplete
                        onLocationSelect={handleLocationSelect}
                        placeholder="e.g., El Beso, Buenos Aires or full address"
                        className="mt-1"
                      />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date & Time *</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={newEvent.startDate}
                          onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date & Time</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={newEvent.endDate}
                          onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Capacity */}
                    <div>
                      <Label htmlFor="maxAttendees">Maximum Attendees (optional)</Label>
                      <Input
                        id="maxAttendees"
                        type="number"
                        placeholder="Leave empty for unlimited"
                        value={newEvent.maxAttendees}
                        onChange={(e) => setNewEvent({ ...newEvent, maxAttendees: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    {/* Assign Roles */}
                    <div>
                      <Label>Assign Roles (DJ, Teacher, etc.)</Label>
                      <div className="space-y-3 mt-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="User ID or email"
                            value={newRoleAssignment.userIdentifier}
                            onChange={(e) => setNewRoleAssignment({ ...newRoleAssignment, userIdentifier: e.target.value })}
                            className="flex-1"
                          />
                          <Select
                            value={newRoleAssignment.role}
                            onValueChange={(value) => setNewRoleAssignment({ ...newRoleAssignment, role: value })}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {PARTICIPANT_ROLES.map(role => (
                                <SelectItem key={role.value} value={role.value}>
                                  <div className="flex items-center gap-2">
                                    <role.icon className="h-4 w-4" />
                                    {role.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            onClick={addRoleAssignment}
                            disabled={assignedRoles.length >= 10}
                          >
                            Add
                          </Button>
                        </div>
                        
                        {assignedRoles.length > 0 && (
                          <div className="space-y-2">
                            {assignedRoles.map((assignment, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <span className="text-sm">
                                  {assignment.userIdentifier} - {PARTICIPANT_ROLES.find(r => r.value === assignment.role)?.label}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeRoleAssignment(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Media */}
                    <div>
                      <Label>Additional Photos/Videos</Label>
                      <div className="mt-2">
                        <UploadMedia
                          onUploadComplete={(media) => setUploadedMedia([...uploadedMedia, media])}
                          folder="events"
                          context="event_media"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCreateForm(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateEvent}
                        disabled={createEventMutation.isPending}
                        className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
                      >
                        {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search events by name, location, or organizer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Section */}
          <FilterSection />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="my">My Events</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* View Content */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="inline-flex items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    Loading events...
                  </div>
                </div>
              ) : events?.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No events found</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search terms</p>
                </div>
              ) : (
                events?.map((event: Event) => (
                  <EventCard
                    key={event.id}
                    event={{
                      ...event,
                      imageUrl: event.coverPhotoUrl || event.imageUrl,
                      organizer: event.user || { id: 0, name: 'Unknown', profileImage: null }
                    }}
                    onRSVP={(eventId) => {
                      // Handle RSVP
                      console.log('RSVP to event:', eventId);
                    }}
                  />
                ))
              )}
            </div>
          ) : (
            <Card className="h-[600px] glassmorphic-card">
              <CardContent className="p-0 h-full">
                <EventMap 
                  events={events?.filter(event => event.locationCoordinates) || []}
                  onEventClick={(event) => {
                    toast({
                      title: event.title,
                      description: `${event.location} - ${format(new Date(event.startDate), 'MMM d, h:mm a')}`
                    });
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}