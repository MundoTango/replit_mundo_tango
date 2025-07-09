import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '@googlemaps/js-api-loader';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  Users,
  Calendar,
  Music,
  GraduationCap,
  Heart,
  Globe,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  TrendingUp,
  Activity,
  User,
  Building
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CityData {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  dancers: number;
  events: number;
  teachers: number;
  djs: number;
  milongas: number;
  schools: number;
  timezone: string;
  localTime?: string;
}

interface CountryStats {
  country: string;
  totalDancers: number;
  totalEvents: number;
  activeCities: number;
  growthRate: number;
}

export default function CommunityWorldMap() {
  const { toast } = useToast();
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [mapZoom, setMapZoom] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('map');
  const [filterRole, setFilterRole] = useState('all');
  const [filterActivity, setFilterActivity] = useState('all');
  
  // Fetch global community data
  const { data: communityData, isLoading } = useQuery({
    queryKey: ['/api/community/world-map', filterRole, filterActivity],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterRole !== 'all') params.append('role', filterRole);
      if (filterActivity !== 'all') params.append('activity', filterActivity);
      
      const response = await fetch(`/api/community/world-map?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch community data');
      const result = await response.json();
      return result.data || { cities: [], countries: [] };
    }
  });

  // Fetch global statistics
  const { data: globalStats } = useQuery({
    queryKey: ['/api/statistics/global'],
    queryFn: async () => {
      const response = await fetch('/api/statistics/global', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const result = await response.json();
      return result.data;
    }
  });

  // Fetch city groups data
  const { data: cityGroups } = useQuery({
    queryKey: ['/api/community/city-groups'],
    queryFn: async () => {
      const response = await fetch('/api/community/city-groups', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch city groups');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Load Google Maps API
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError('Google Maps API key not configured');
      console.error('Google Maps API key not found');
      return;
    }

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "marker"]
    });

    loader.load().then(() => {
      setIsMapLoaded(true);
      setMapError(null);
    }).catch((error) => {
      console.error('Error loading Google Maps:', error);
      setMapError('Failed to load Google Maps');
    });
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 0, lng: 0 },
      zoom: mapZoom,
      styles: [
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#e9e9e9" }, { lightness: 17 }]
        },
        {
          featureType: "landscape",
          elementType: "geometry",
          stylers: [{ color: "#f5f5f5" }, { lightness: 20 }]
        }
      ]
    });

    mapInstanceRef.current = map;

  }, [isMapLoaded]);

  // Add markers when cityGroups data is available
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !cityGroups) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.markers?.forEach((marker: any) => marker.setMap(null));
    map.markers = [];

    // Add markers for city groups
    cityGroups.forEach((group: any) => {
      const marker = new window.google.maps.Marker({
        position: { lat: group.lat, lng: group.lng },
        map,
        title: `${group.name} - ${group.memberCount} members`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: Math.min(20, 5 + group.memberCount / 10),
          fillColor: group.memberCount > 100 ? '#FF1744' : 
                     group.memberCount > 50 ? '#F50057' : 
                     group.memberCount > 20 ? '#E91E63' : '#9C27B0',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      marker.addListener('click', () => {
        setSelectedCity({
          id: group.id,
          name: group.city || group.name,
          country: group.country || '',
          lat: group.lat,
          lng: group.lng,
          dancers: group.totalUsers || 0,
          events: 0,
          teachers: 0,
          djs: 0,
          milongas: 0,
          schools: 0,
          timezone: 'UTC',
          localTime: ''
        });
        map.panTo({ lat: group.lat, lng: group.lng });
        map.setZoom(10);
      });

      if (!map.markers) map.markers = [];
      map.markers.push(marker);
    });

  }, [cityGroups, isMapLoaded]);

  const getMarkerColor = (city: CityData) => {
    if (city.dancers > 1000) return '#FF1744'; // Red for major hubs
    if (city.dancers > 500) return '#F50057'; // Pink for large communities
    if (city.dancers > 100) return '#E91E63'; // Medium pink
    return '#9C27B0'; // Purple for smaller communities
  };

  const handleSearch = () => {
    if (!searchQuery) return;
    
    const city = communityData?.cities?.find(
      (c: CityData) => c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (city) {
      setSelectedCity(city);
      if (mapRef.current && window.google) {
        const map = mapRef.current;
        map.panTo({ lat: city.lat, lng: city.lng });
        map.setZoom(10);
      }
    } else {
      toast({
        title: "City not found",
        description: "No tango community found in that location.",
        variant: "destructive"
      });
    }
  };

  const getLocalTime = (timezone: string) => {
    try {
      return new Date().toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tango World Map</h1>
              <p className="text-gray-600 mt-1">
                Explore tango communities around the world
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={handleSearch} variant="outline">
                Search
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="map">Interactive Map</TabsTrigger>
              <TabsTrigger value="statistics">Global Statistics</TabsTrigger>
              <TabsTrigger value="leaderboard">City Rankings</TabsTrigger>
            </TabsList>

            {/* Interactive Map Tab */}
            <TabsContent value="map" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="dancer">Dancers</SelectItem>
                        <SelectItem value="teacher">Teachers</SelectItem>
                        <SelectItem value="dj">DJs</SelectItem>
                        <SelectItem value="organizer">Organizers</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterActivity} onValueChange={setFilterActivity}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Activity</SelectItem>
                        <SelectItem value="high">High Activity</SelectItem>
                        <SelectItem value="medium">Medium Activity</SelectItem>
                        <SelectItem value="growing">Growing</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMapZoom(Math.min(20, mapZoom + 1))}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMapZoom(Math.max(1, mapZoom - 1))}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMapZoom(2)}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map Container */}
              <div className="relative">
                <div 
                  ref={mapRef}
                  className="w-full h-[600px] rounded-lg border border-gray-200"
                >
                  {!isMapLoaded && !mapError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading map...</p>
                      </div>
                    </div>
                  )}
                  {mapError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <p className="text-red-500 font-semibold mb-2">Oops! Something went wrong.</p>
                        <p className="text-gray-600">{mapError}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* City Info Panel */}
                {selectedCity && (
                  <Card className="absolute top-4 right-4 w-80 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{selectedCity.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCity(null)}
                        >
                          ×
                        </Button>
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {selectedCity.country} • {getLocalTime(selectedCity.timezone)}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>{selectedCity.dancers} dancers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-500" />
                          <span>{selectedCity.events} events</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-purple-500" />
                          <span>{selectedCity.teachers} teachers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4 text-red-500" />
                          <span>{selectedCity.djs} DJs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-pink-500" />
                          <span>{selectedCity.milongas} milongas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-orange-500" />
                          <span>{selectedCity.schools} schools</span>
                        </div>
                      </div>
                      <div className="pt-3 flex gap-2">
                        <Button size="sm" className="flex-1">
                          View Community
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Join Group
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Legend */}
                <Card className="absolute bottom-4 left-4 p-3">
                  <p className="text-xs font-semibold mb-2">Community Size</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <span>1000+ dancers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-pink-500"></div>
                      <span>500-1000 dancers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-pink-400"></div>
                      <span>100-500 dancers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                      <span>&lt;100 dancers</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Global Statistics Tab */}
            <TabsContent value="statistics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Dancers</p>
                        <p className="text-2xl font-bold">{globalStats?.totalDancers || 0}</p>
                        <p className="text-xs text-green-600 mt-1">Live count</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Cities</p>
                        <p className="text-2xl font-bold">{globalStats?.activeCities || 0}</p>
                        <p className="text-xs text-green-600 mt-1">Cities with users</p>
                      </div>
                      <MapPin className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Groups</p>
                        <p className="text-2xl font-bold">{globalStats?.totalGroups || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Community groups</p>
                      </div>
                      <Globe className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Memories</p>
                        <p className="text-2xl font-bold">{globalStats?.totalMemories || 0}</p>
                        <p className="text-xs text-green-600 mt-1">Shared memories</p>
                      </div>
                      <Calendar className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Regional Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Regional Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { region: 'South America', dancers: 18500, events: 1200, growth: 15 },
                      { region: 'Europe', dancers: 12300, events: 890, growth: 8 },
                      { region: 'North America', dancers: 7800, events: 650, growth: 12 },
                      { region: 'Asia', dancers: 2400, events: 280, growth: 25 },
                      { region: 'Oceania', dancers: 1200, events: 120, growth: 10 },
                      { region: 'Africa', dancers: 637, events: 81, growth: 32 }
                    ].map((region) => (
                      <div key={region.region} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{region.region}</p>
                            <Badge variant="outline" className="text-xs">
                              +{region.growth}% growth
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{region.dancers.toLocaleString()} dancers</span>
                            <span>•</span>
                            <span>{region.events} events/month</span>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                              style={{ width: `${(region.dancers / 18500) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* City Rankings Tab */}
            <TabsContent value="leaderboard" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Top Tango Cities</CardTitle>
                    <Select defaultValue="dancers">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dancers">By Dancers</SelectItem>
                        <SelectItem value="events">By Events</SelectItem>
                        <SelectItem value="growth">By Growth</SelectItem>
                        <SelectItem value="activity">By Activity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { rank: 1, city: 'Buenos Aires', country: '🇦🇷 Argentina', dancers: 8500, events: 420, growth: 5 },
                      { rank: 2, city: 'Paris', country: '🇫🇷 France', dancers: 3200, events: 180, growth: 8 },
                      { rank: 3, city: 'Berlin', country: '🇩🇪 Germany', dancers: 2800, events: 165, growth: 12 },
                      { rank: 4, city: 'New York', country: '🇺🇸 USA', dancers: 2400, events: 145, growth: 10 },
                      { rank: 5, city: 'Barcelona', country: '🇪🇸 Spain', dancers: 2100, events: 130, growth: 15 },
                      { rank: 6, city: 'Moscow', country: '🇷🇺 Russia', dancers: 1800, events: 95, growth: 18 },
                      { rank: 7, city: 'Tokyo', country: '🇯🇵 Japan', dancers: 1600, events: 88, growth: 22 },
                      { rank: 8, city: 'London', country: '🇬🇧 UK', dancers: 1500, events: 92, growth: 7 },
                      { rank: 9, city: 'Seoul', country: '🇰🇷 South Korea', dancers: 1200, events: 75, growth: 28 },
                      { rank: 10, city: 'Istanbul', country: '🇹🇷 Turkey', dancers: 1100, events: 68, growth: 20 }
                    ].map((city) => (
                      <div key={city.rank} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={cn(
                          "text-2xl font-bold w-8 text-center",
                          city.rank === 1 && "text-yellow-500",
                          city.rank === 2 && "text-gray-400",
                          city.rank === 3 && "text-orange-600",
                          city.rank > 3 && "text-gray-600"
                        )}>
                          {city.rank}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{city.city}</p>
                            <span className="text-sm text-gray-600">{city.country}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {city.dancers.toLocaleString()} dancers
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {city.events} events/mo
                            </span>
                            <Badge variant="outline" className="text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              +{city.growth}%
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}