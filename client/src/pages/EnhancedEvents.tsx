import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { useHotkeys } from 'react-hotkeys-hook';
import InfiniteScroll from 'react-infinite-scroll-component';
import { animated, useSpring } from 'react-spring';
// ESA Fix: Temporarily disabled fullcalendar imports to fix build
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Countdown from 'react-countdown';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import { Tooltip } from 'react-tooltip';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import LazyLoad from 'react-lazyload';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  Plus,
  Grid,
  List,
  Map,
  Download,
  Upload,
  Filter,
  Clock,
  Star,
  Video,
  Ticket,
  Share2,
  Copy,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Timer,
  TrendingUp,
  Globe,
  Music,
  DollarSign,
  QrCode,
  RefreshCw,
  CheckCircle,
  Info,
  X
} from 'lucide-react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share';

// Lazy load the map component for better performance
const LeafletMap = lazy(() => import('@/components/LeafletMap'));

interface Event {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  photos?: string[];
  location?: string;
  coordinates?: { lat: number; lng: number };
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
  category?: string;
  level?: string;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  participants?: any[];
  userStatus?: 'going' | 'interested' | 'maybe' | null;
  tags?: string[];
  languages?: string[];
}

interface EventApiResponse {
  success: boolean;
  data: Event[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

const localizer = momentLocalizer(moment);

const categoryColors: Record<string, string> = {
  milonga: '#38b2ac',
  class: '#3182ce',
  workshop: '#8b5cf6',
  festival: '#ec4899',
  performance: '#f59e0b',
  practice: '#10b981',
  social: '#06b6d4'
};

const viewOptions = [
  { value: 'list', label: 'List View', icon: List },
  { value: 'grid', label: 'Grid View', icon: Grid },
  { value: 'calendar', label: 'Calendar View', icon: CalendarDays },
  { value: 'map', label: 'Map View', icon: Map }
];

export default function EnhancedEventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'calendar' | 'map'>('list');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [showVirtualOnly, setShowVirtualOnly] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState(50); // km
  
  const { toast } = useToast();

  // Animations
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 60 }
  });

  // Keyboard shortcuts
  useHotkeys('cmd+n, ctrl+n', (e) => {
    e.preventDefault();
    setShowCreateDialog(true);
  });

  useHotkeys('cmd+e, ctrl+e', (e) => {
    e.preventDefault();
    exportEventsToCSV();
  });

  useHotkeys('cmd+/, ctrl+/', (e) => {
    e.preventDefault();
    document.getElementById('event-search')?.focus();
  });

  // Fetch events with performance optimizations
  const { data: eventsData, isLoading: eventsLoading, refetch } = useQuery<EventApiResponse>({
    queryKey: ['/api/events', {
      search: searchQuery,
      category: categoryFilter,
      level: levelFilter,
      price: priceFilter,
      virtual: showVirtualOnly,
      dateStart: dateRange.start?.toISOString(),
      dateEnd: dateRange.end?.toISOString(),
      tab: activeTab
    }],
    enabled: true,
    // Performance optimizations
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
    refetchOnMount: 'always' // Always refetch on mount
  });

  const events = eventsData?.data || [];

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: number; status: string }) => {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error('Failed to RSVP');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "RSVP updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive",
      });
    }
  });

  // Export to CSV
  const exportEventsToCSV = () => {
    const csvConfig = mkConfig({
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'Mundo Tango Events',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
      columnHeaders: [
        { key: 'title', displayLabel: 'Title' },
        { key: 'date', displayLabel: 'Date' },
        { key: 'location', displayLabel: 'Location' },
        { key: 'category', displayLabel: 'Category' },
        { key: 'price', displayLabel: 'Price' },
        { key: 'attendees', displayLabel: 'Attendees' }
      ]
    });

    const csvData = events.map(event => ({
      title: event.title,
      date: moment(event.startDate).format('YYYY-MM-DD HH:mm'),
      location: event.location || 'TBD',
      category: event.category || event.eventType || 'Event',
      price: event.price ? `${event.currency || '$'}${event.price}` : 'Free',
      attendees: `${event.currentAttendees || 0}/${event.maxAttendees || '∞'}`
    }));

    const csv = generateCsv(csvConfig)(csvData);
    download(csvConfig)(csv);
    
    toast({
      title: "Exported!",
      description: `Successfully exported ${events.length} events`,
    });
  };

  // Calendar events formatting
  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      id: event.id.toString(), // Convert to string for FullCalendar
      title: event.title,
      start: new Date(event.startDate),
      end: event.endDate ? new Date(event.endDate) : new Date(event.startDate),
      extendedProps: {
        resource: event
      },
      backgroundColor: categoryColors[event.category || 'social'],
      borderColor: categoryColors[event.category || 'social']
    }));
  }, [events]);

  // Countdown renderer
  const countdownRenderer = ({ days, hours, minutes, completed }: any) => {
    if (completed) {
      return <span className="text-green-600 font-medium">Happening now!</span>;
    } else {
      return (
        <span className="text-turquoise-600 font-medium">
          {days}d {hours}h {minutes}m
        </span>
      );
    }
  };

  // Event Card Component
  const EventCard = ({ event }: { event: Event }) => (
    <LazyLoad height={300} offset={100}>
      <Card className="glassmorphic-card hover:scale-105 transition-all duration-300 group">
        <div className="relative">
          {event.imageUrl && (
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                {event.isVirtual && (
                  <Badge className="bg-purple-500 text-white">
                    <Video className="w-3 h-3 mr-1" />
                    Virtual
                  </Badge>
                )}
                {event.isRecurring && (
                  <Badge className="bg-blue-500 text-white">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Recurring
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {event.title}
            </h3>
            <div className="flex gap-1">
              <CopyToClipboard 
                text={`${window.location.origin}/events/${event.id}`}
                onCopy={() => toast({ title: "Link copied!" })}
              >
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Copy className="w-4 h-4" />
                </Button>
              </CopyToClipboard>
              
              <div className="relative group/share">
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Share2 className="w-4 h-4" />
                </Button>
                <div className="absolute right-0 mt-1 hidden group-hover/share:flex gap-1 bg-white shadow-lg rounded-lg p-2 z-10">
                  <FacebookShareButton url={`${window.location.origin}/events/${event.id}`}>
                    <FacebookIcon size={24} round />
                  </FacebookShareButton>
                  <TwitterShareButton url={`${window.location.origin}/events/${event.id}`}>
                    <TwitterIcon size={24} round />
                  </TwitterShareButton>
                  <WhatsappShareButton url={`${window.location.origin}/events/${event.id}`}>
                    <WhatsappIcon size={24} round />
                  </WhatsappShareButton>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-turquoise-500" />
              <span>{moment(event.startDate).format('MMM D, YYYY • h:mm A')}</span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-turquoise-500" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-turquoise-500" />
              <span>
                {event.currentAttendees || 0} / {event.maxAttendees || '∞'} attending
              </span>
            </div>

            {event.price && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-turquoise-500" />
                <span>{event.currency || '$'}{event.price}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline" className="text-xs" style={{ borderColor: categoryColors[event.category || 'social'] }}>
              {event.category || 'Event'}
            </Badge>
            {event.level && event.level !== 'all_levels' && (
              <Badge variant="outline" className="text-xs">
                {event.level.replace('_', ' ')}
              </Badge>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              className={`flex-1 ${
                event.userStatus === 'going' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600'
              } text-white`}
              onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'going' })}
            >
              {event.userStatus === 'going' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Going
                </>
              ) : (
                'RSVP'
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedEvent(event)}
            >
              Details
            </Button>
          </div>

          {/* Countdown for upcoming events */}
          {moment(event.startDate).isAfter() && moment(event.startDate).diff(moment(), 'days') <= 7 && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Starts in:</p>
              <Countdown date={event.startDate} renderer={countdownRenderer} />
            </div>
          )}
        </div>
      </Card>
    </LazyLoad>
  );

  if (eventsLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-6">
          <Skeleton height={60} className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} height={300} />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <animated.div style={fadeIn} className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
              Events
            </h1>
            <p className="text-gray-600 mt-1">Discover and join tango events worldwide</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={exportEventsToCSV}
              variant="outline"
              className="border-turquoise-200 hover:bg-turquoise-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-r from-turquoise-50 to-cyan-50 glassmorphic-card">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-turquoise-600" />
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-sm text-gray-600">Total Events</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 glassmorphic-card">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-cyan-600" />
              <div>
                <p className="text-2xl font-bold">
                  {events.filter(e => moment(e.startDate).isAfter()).length}
                </p>
                <p className="text-sm text-gray-600">Upcoming</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 glassmorphic-card">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {events.filter(e => e.userStatus === 'going').length}
                </p>
                <p className="text-sm text-gray-600">Attending</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-turquoise-50 glassmorphic-card">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {events.filter(e => moment(e.startDate).isSame(moment(), 'week')).length}
                </p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters with MT ocean theme */}
        <Card className="mb-6 p-4 glassmorphic-card bg-gradient-to-r from-white/90 via-turquoise-50/30 to-cyan-50/30 border-turquoise-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-turquoise-500 w-5 h-5" />
                <Input
                  id="event-search"
                  type="text"
                  placeholder="Search events... (Cmd+/)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glassmorphic-input border-turquoise-200 focus:border-turquoise-400 focus:ring-turquoise-400/20"
                />
              </div>
              <div className="flex gap-2">
                {viewOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={viewMode === option.value ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode(option.value as any)}
                    data-tooltip-id="view-tooltip"
                    data-tooltip-content={option.label}
                    className={viewMode === option.value 
                      ? 'bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white hover:from-turquoise-500 hover:to-cyan-600' 
                      : 'border-turquoise-200 hover:bg-turquoise-50'
                    }
                  >
                    <option.icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 border-turquoise-200 focus:border-turquoise-400">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="milonga">Milonga</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-40 border-turquoise-200 focus:border-turquoise-400">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="all_levels">Mixed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-40 border-turquoise-200 focus:border-turquoise-400">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showVirtualOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowVirtualOnly(!showVirtualOnly)}
                className={showVirtualOnly 
                  ? 'bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white hover:from-turquoise-500 hover:to-cyan-600' 
                  : 'border-turquoise-200 hover:bg-turquoise-50'
                }
              >
                <Video className="w-4 h-4 mr-1" />
                Virtual Only
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="border-turquoise-200 hover:bg-turquoise-50"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        {/* Event Tabs with MT styling */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-turquoise-50 to-cyan-50 border border-turquoise-200/50">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-400 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="today" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-400 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              Today
            </TabsTrigger>
            <TabsTrigger value="thisWeek" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-400 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              This Week
            </TabsTrigger>
            <TabsTrigger value="myEvents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-400 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              My Events
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Events Display */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            <InfiniteScroll
              dataLength={events.length}
              next={() => {}}
              hasMore={false}
              loader={<Skeleton height={100} count={3} />}
              endMessage={
                <p className="text-center text-gray-500 mt-8">
                  You've seen all events! 🎉
                </p>
              }
            >
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </InfiniteScroll>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {viewMode === 'calendar' && (
          <Card className="p-6">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Calendar View</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={calendarView === 'month' ? 'default' : 'outline'}
                  onClick={() => setCalendarView('month')}
                >
                  Month
                </Button>
                <Button
                  size="sm"
                  variant={calendarView === 'week' ? 'default' : 'outline'}
                  onClick={() => setCalendarView('week')}
                >
                  Week
                </Button>
                <Button
                  size="sm"
                  variant={calendarView === 'day' ? 'default' : 'outline'}
                  onClick={() => setCalendarView('day')}
                >
                  Day
                </Button>
              </div>
            </div>
            <div className="h-[600px]">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={calendarView === 'month' ? 'dayGridMonth' : calendarView === 'week' ? 'timeGridWeek' : 'timeGridDay'}
                events={calendarEvents}
                eventClick={(info) => {
                  setSelectedEvent(info.event.extendedProps.resource);
                }}
                eventContent={(eventInfo) => (
                  <div className="p-1 text-xs">
                    <div className="font-semibold truncate">{eventInfo.event.title}</div>
                    <div className="text-gray-600">{moment(eventInfo.event.start).format('h:mm A')}</div>
                  </div>
                )}
                height="100%"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: ''
                }}
              />
            </div>
          </Card>
        )}

        {viewMode === 'map' && (
          <Card className="p-6 glassmorphic-card bg-gradient-to-br from-white/90 via-turquoise-50/20 to-cyan-50/20">
            <div className="h-[600px] rounded-lg overflow-hidden border border-turquoise-200/50">
              <Suspense fallback={
                <div className="h-full bg-gradient-to-br from-turquoise-50/50 to-cyan-50/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading map...</p>
                  </div>
                </div>
              }>
                <LeafletMap
                  markers={events.filter(event => event.coordinates).map(event => ({
                    id: event.id,
                    position: [event.coordinates!.lat, event.coordinates!.lng],
                    popupContent: `
                      <div class="p-2">
                        <h3 class="font-bold text-sm">${event.title}</h3>
                        <p class="text-xs text-gray-600 mt-1">${moment(event.startDate).format('MMM D, h:mm A')}</p>
                        ${event.location ? `<p class="text-xs text-gray-500">${event.location}</p>` : ''}
                        <div class="mt-2">
                          <span class="inline-block px-2 py-1 text-xs rounded-full" style="background-color: ${categoryColors[event.category || 'social']}20; color: ${categoryColors[event.category || 'social']}">
                            ${event.category || 'Event'}
                          </span>
                        </div>
                      </div>
                    `,
                    icon: 'calendar'
                  }))}
                  centerLat={-34.6037}
                  centerLng={-58.3816}
                  zoom={3}
                  height="600px"
                />
              </Suspense>
            </div>
          </Card>
        )}

        {/* Keyboard Shortcuts */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            <kbd className="px-2 py-1 bg-gray-100 rounded">Cmd+N</kbd> Create Event • 
            <kbd className="px-2 py-1 bg-gray-100 rounded ml-2">Cmd+E</kbd> Export • 
            <kbd className="px-2 py-1 bg-gray-100 rounded ml-2">Cmd+/</kbd> Search
          </p>
        </div>

        {/* Tooltips */}
        <Tooltip id="view-tooltip" />
      </animated.div>
    </DashboardLayout>
  );
}