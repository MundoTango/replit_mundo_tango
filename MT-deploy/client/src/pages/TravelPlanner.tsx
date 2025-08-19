import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { format, addDays, differenceInDays } from "date-fns";
import { 
  Plane, 
  Calendar as CalendarIcon,
  MapPin,
  Hotel,
  Users,
  DollarSign,
  Clock,
  Globe,
  Navigation,
  Briefcase,
  Sun,
  Cloud,
  Heart,
  Share2,
  Download,
  Plus,
  X,
  ChevronRight,
  Info
} from "lucide-react";

interface TripDestination {
  id: string;
  city: string;
  country: string;
  startDate: Date;
  endDate: Date;
  events: any[];
  accommodation?: string;
  notes?: string;
}

interface TravelPlan {
  id: string;
  name: string;
  destinations: TripDestination[];
  totalBudget: number;
  travelers: number;
  createdAt: Date;
}

const TravelPlanner: React.FC = () => {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [destinations, setDestinations] = useState<TripDestination[]>([]);
  const [tripName, setTripName] = useState('');
  const [budget, setBudget] = useState('');
  const [travelers, setTravelers] = useState('1');
  const [activeTab, setActiveTab] = useState('itinerary');

  // Fetch user profile data
  const { data: userProfile } = useQuery({
    queryKey: ['/api/auth/user'],
    staleTime: 5 * 60 * 1000
  });

  // Fetch user's travel history from profile
  const { data: travelHistory } = useQuery({
    queryKey: ['/api/user/travel-history'],
    enabled: !!userProfile,
    staleTime: 5 * 60 * 1000
  });

  // Fetch events for selected destinations
  const { data: destinationEvents } = useQuery({
    queryKey: ['/api/events', destinations.map(d => d.city)],
    enabled: destinations.length > 0,
    queryFn: async () => {
      const events = await Promise.all(
        destinations.map(dest => 
          fetch(`/api/events?city=${dest.city}&startDate=${dest.startDate}&endDate=${dest.endDate}`)
            .then(res => res.json())
        )
      );
      return events.flat();
    }
  });

  // Add destination
  const addDestination = () => {
    const newDestination: TripDestination = {
      id: Date.now().toString(),
      city: '',
      country: '',
      startDate: new Date(),
      endDate: addDays(new Date(), 3),
      events: []
    };
    setDestinations([...destinations, newDestination]);
  };

  // Remove destination
  const removeDestination = (id: string) => {
    setDestinations(destinations.filter(d => d.id !== id));
  };

  // Update destination
  const updateDestination = (id: string, updates: Partial<TripDestination>) => {
    setDestinations(destinations.map(d => 
      d.id === id ? { ...d, ...updates } : d
    ));
  };

  // Save trip plan
  const saveTripMutation = useMutation({
    mutationFn: async (tripData: any) => {
      const response = await fetch('/api/travel-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to save trip');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Trip Saved!",
        description: "Your tango travel plan has been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/travel-plans'] });
    }
  });

  const handleSaveTrip = () => {
    if (!tripName || destinations.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please add a trip name and at least one destination",
        variant: "destructive"
      });
      return;
    }

    saveTripMutation.mutate({
      name: tripName,
      destinations,
      totalBudget: parseFloat(budget) || 0,
      travelers: parseInt(travelers) || 1
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent">
          Tango Travel Planner
        </h1>
        <p className="text-gray-600">Plan your tango journey across cities and events worldwide</p>
      </div>

      {/* User Travel Stats */}
      {userProfile && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glassmorphic-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cities Visited</p>
                  <p className="text-2xl font-bold">{travelHistory?.citiesVisited || 0}</p>
                </div>
                <MapPin className="h-8 w-8 text-turquoise-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphic-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Events Attended</p>
                  <p className="text-2xl font-bold">{travelHistory?.eventsAttended || 0}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphic-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Countries</p>
                  <p className="text-2xl font-bold">{travelHistory?.countries || 0}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphic-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Next Trip</p>
                  <p className="text-2xl font-bold">
                    {travelHistory?.nextTrip ? format(new Date(travelHistory.nextTrip), 'MMM d') : 'None'}
                  </p>
                </div>
                <Plane className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="saved">Saved Trips</TabsTrigger>
        </TabsList>

        {/* Itinerary Tab */}
        <TabsContent value="itinerary" className="space-y-6">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-turquoise-500" />
                Create Your Tango Journey
              </CardTitle>
              <CardDescription>
                Build a multi-city tango adventure with events and milongas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trip Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="trip-name">Trip Name</Label>
                  <Input
                    id="trip-name"
                    placeholder="e.g., Summer Tango Tour 2025"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    className="glassmorphic-input"
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Total Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="glassmorphic-input"
                  />
                </div>
                <div>
                  <Label htmlFor="travelers">Number of Travelers</Label>
                  <Input
                    id="travelers"
                    type="number"
                    min="1"
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className="glassmorphic-input"
                  />
                </div>
              </div>

              {/* Destinations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Destinations</h3>
                  <Button
                    onClick={addDestination}
                    variant="outline"
                    size="sm"
                    className="border-turquoise-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add City
                  </Button>
                </div>

                {destinations.length === 0 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Add cities to start planning your tango journey
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {destinations.map((dest, index) => (
                      <Card key={dest.id} className="bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{index + 1}</Badge>
                              <span className="font-medium">
                                {dest.city || 'New Destination'}
                              </span>
                            </div>
                            <Button
                              onClick={() => removeDestination(dest.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>City</Label>
                              <Input
                                placeholder="e.g., Buenos Aires"
                                value={dest.city}
                                onChange={(e) => updateDestination(dest.id, { city: e.target.value })}
                                className="glassmorphic-input"
                              />
                            </div>
                            <div>
                              <Label>Country</Label>
                              <Input
                                placeholder="e.g., Argentina"
                                value={dest.country}
                                onChange={(e) => updateDestination(dest.id, { country: e.target.value })}
                                className="glassmorphic-input"
                              />
                            </div>
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="date"
                                value={format(dest.startDate, 'yyyy-MM-dd')}
                                onChange={(e) => updateDestination(dest.id, { startDate: new Date(e.target.value) })}
                                className="glassmorphic-input"
                              />
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <Input
                                type="date"
                                value={format(dest.endDate, 'yyyy-MM-dd')}
                                onChange={(e) => updateDestination(dest.id, { endDate: new Date(e.target.value) })}
                                className="glassmorphic-input"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Accommodation</Label>
                              <Input
                                placeholder="Hotel name or address"
                                value={dest.accommodation || ''}
                                onChange={(e) => updateDestination(dest.id, { accommodation: e.target.value })}
                                className="glassmorphic-input"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Notes</Label>
                              <Textarea
                                placeholder="Special notes for this destination"
                                value={dest.notes || ''}
                                onChange={(e) => updateDestination(dest.id, { notes: e.target.value })}
                                className="glassmorphic-input min-h-[80px]"
                              />
                            </div>
                          </div>

                          {/* Events for this destination */}
                          {dest.city && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-600 mb-2">
                                {dest.events?.length || 0} tango events during your stay
                              </p>
                              {dest.events?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {dest.events.slice(0, 3).map((event: any) => (
                                    <Badge key={event.id} variant="outline">
                                      {event.title}
                                    </Badge>
                                  ))}
                                  {dest.events.length > 3 && (
                                    <Badge variant="outline">+{dest.events.length - 3} more</Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              {destinations.length > 0 && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDestinations([]);
                      setTripName('');
                      setBudget('');
                      setTravelers('1');
                    }}
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={handleSaveTrip}
                    className="bg-gradient-to-r from-turquoise-400 to-cyan-500 hover:from-turquoise-500 hover:to-cyan-600"
                    disabled={saveTripMutation.isPending}
                  >
                    {saveTripMutation.isPending ? 'Saving...' : 'Save Trip Plan'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-cyan-500" />
                Tango Events Along Your Route
              </CardTitle>
              <CardDescription>
                Discover festivals, milongas, and workshops in your destinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {destinations.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Add destinations in the Itinerary tab to see available events
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  {destinations.map((dest) => (
                    <div key={dest.id}>
                      <h3 className="font-semibold text-lg mb-3 text-turquoise-600">
                        {dest.city}, {dest.country}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {destinationEvents?.filter((event: any) => 
                          event.city === dest.city &&
                          new Date(event.startDate) >= dest.startDate &&
                          new Date(event.startDate) <= dest.endDate
                        ).map((event: any) => (
                          <Card key={event.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{event.title}</h4>
                                <Badge variant="secondary">{event.eventType}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{event.location}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {format(new Date(event.startDate), 'MMM d')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {event.attendeeCount} attending
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-3"
                                onClick={() => updateDestination(dest.id, {
                                  events: [...(dest.events || []), event]
                                })}
                              >
                                Add to Itinerary
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Travel Budget Calculator
              </CardTitle>
              <CardDescription>
                Estimate costs for your tango journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Budget Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-50">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Total Budget</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${budget || '0'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Per Person</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${budget ? Math.round(parseFloat(budget) / parseInt(travelers)) : '0'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Per Day</p>
                      <p className="text-2xl font-bold text-purple-600">
                        ${budget && destinations.length ? 
                          Math.round(parseFloat(budget) / destinations.reduce((acc, d) => 
                            acc + differenceInDays(d.endDate, d.startDate), 0
                          )) : '0'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Cost Breakdown */}
                <div>
                  <h3 className="font-semibold mb-3">Estimated Costs by Category</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Hotel className="h-4 w-4 text-gray-600" />
                        <span>Accommodation</span>
                      </div>
                      <Input
                        type="number"
                        placeholder="0"
                        className="w-32 glassmorphic-input"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4 text-gray-600" />
                        <span>Transportation</span>
                      </div>
                      <Input
                        type="number"
                        placeholder="0"
                        className="w-32 glassmorphic-input"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-600" />
                        <span>Events & Classes</span>
                      </div>
                      <Input
                        type="number"
                        placeholder="0"
                        className="w-32 glassmorphic-input"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-gray-600" />
                        <span>Food & Entertainment</span>
                      </div>
                      <Input
                        type="number"
                        placeholder="0"
                        className="w-32 glassmorphic-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Trips Tab */}
        <TabsContent value="saved" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-500" />
                Your Saved Trip Plans
              </CardTitle>
              <CardDescription>
                Access and manage your tango travel plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No saved trips yet</p>
                <p className="text-sm mt-1">Create your first trip in the Itinerary tab</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TravelPlanner;