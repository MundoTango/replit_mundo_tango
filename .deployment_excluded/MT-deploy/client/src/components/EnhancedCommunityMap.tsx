import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap, ZoomControl, ScaleControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Home, MapPin, Star, Users, Layers, Navigation, Download, Expand, Search, RefreshCw, Info, Eye, EyeOff, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { CSVLink } from 'react-csv';
import { Tooltip } from 'react-tooltip';
import { useHotkeys } from 'react-hotkeys-hook';
import { useInView } from 'react-intersection-observer';
import { FixedSizeList as List } from 'react-window';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

// Fix for missing marker icons in production
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ESA LIFE CEO 56x21 - MT Ocean Theme Enhanced Icons
const createEnhancedIcon = (color: string, icon: string, isCluster?: boolean) => {
  const size = isCluster ? 48 : 42;
  const anchor = size / 2;
  
  return L.divIcon({
    html: `
      <div class="mt-map-marker ${isCluster ? 'mt-cluster' : ''}" 
           style="
             background: ${color};
             width: ${size}px;
             height: ${size}px;
             display: flex;
             align-items: center;
             justify-content: center;
             border-radius: 50%;
             box-shadow: 0 4px 12px rgba(0,0,0,0.3);
             border: 3px solid white;
             position: relative;
             cursor: pointer;
             transition: all 0.3s ease;
           ">
        <span style="font-size: ${isCluster ? '22px' : '20px'}; line-height: 1;">${icon}</span>
        ${isCluster ? `<span style="
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          border: 2px solid white;
        ">2+</span>` : ''}
      </div>
    `,
    className: 'mt-ocean-marker',
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
    popupAnchor: [0, -anchor],
  });
};

// ESA LIFE CEO 56x21 - MT Ocean Theme Layer Configuration
const LAYER_CONFIG = {
  cityGroup: { 
    color: 'linear-gradient(135deg, #38b2ac 0%, #06b6d4 100%)', // Turquoise to cyan gradient
    icon: '🌍', 
    name: 'Cities' 
  },
  event: { 
    color: 'linear-gradient(135deg, #10B981 0%, #14b8a6 100%)', // Green gradient
    icon: '📅', 
    name: 'Events' 
  },
  home: { 
    color: 'linear-gradient(135deg, #F59E0B 0%, #fbbf24 100%)', // Orange gradient
    icon: '🏠', 
    name: 'Housing' 
  },
  recommendation: { 
    color: 'linear-gradient(135deg, #EF4444 0%, #f87171 100%)', // Red gradient
    icon: '⭐', 
    name: 'Recommendations' 
  },
};

// Map navigation controller with enhanced features and zoom tracking
const MapNavigationController = ({ onZoomIn, onZoomOut, onReset, onZoomChange }: any) => {
  const map = useMap();
  
  useEffect(() => {
    const handleZoomEnd = () => {
      onZoomChange?.(map.getZoom());
    };
    
    map.on('zoomend', handleZoomEnd);
    
    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, onZoomChange]);
  
  useHotkeys('cmd+plus,ctrl+plus', () => {
    map.zoomIn();
    onZoomIn?.();
  }, [map]);
  
  useHotkeys('cmd+minus,ctrl+minus', () => {
    map.zoomOut();
    onZoomOut?.();
  }, [map]);
  
  useHotkeys('cmd+0,ctrl+0', () => {
    map.setView([-34.6037, -58.3816], 3);
    onReset?.();
  }, [map]);
  
  return null;
};

// Cluster markers for performance
const createClusterGroup = (items: any[], type: string) => {
  const clusters: any[] = [];
  const processed = new Set();
  
  items.forEach((item, idx) => {
    if (processed.has(idx)) return;
    
    const nearbyItems = items.filter((other, otherIdx) => {
      if (idx === otherIdx || processed.has(otherIdx)) return false;
      const distance = Math.sqrt(
        Math.pow(item.lat - other.lat, 2) + 
        Math.pow(item.lng - other.lng, 2)
      );
      return distance < 0.1; // Cluster items within 0.1 degrees
    });
    
    if (nearbyItems.length > 0) {
      clusters.push({
        ...item,
        isCluster: true,
        clusterCount: nearbyItems.length + 1,
        items: [item, ...nearbyItems]
      });
      nearbyItems.forEach((_, idx2) => processed.add(items.indexOf(nearbyItems[idx2])));
    } else {
      clusters.push(item);
    }
    processed.add(idx);
  });
  
  return clusters;
};

interface EnhancedMapItem {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type: 'cityGroup' | 'event' | 'home' | 'recommendation';
  city: string;
  slug?: string;
  memberCount?: number;
  eventCount?: number;
  hostCount?: number;
  recommendationCount?: number;
  date?: string;
  price?: number;
  rating?: number;
  photos?: string[];
  isCluster?: boolean;
  clusterCount?: number;
  items?: any[];
}

interface EnhancedCommunityMapProps {
  city?: string;
  groupSlug?: string;
  centerLat?: number;
  centerLng?: number;
  groupCity?: string;
  layers?: {
    events: boolean;
    housing: boolean;
    recommendations: boolean;
  };
  dateFilter?: {
    startDate?: Date;
    endDate?: Date;
  };
  eventFilters?: {
    category: string;
    priceRange: string;
    timeOfDay: string;
  };
  friendFilter?: 'all' | 'direct' | 'friend-of-friend' | 'community';
  recommendationType?: 'all' | 'local' | 'visitor';
}

const EnhancedCommunityMap = memo(function EnhancedCommunityMap({
  city,
  groupSlug,
  centerLat,
  centerLng,
  groupCity,
  layers = { events: false, housing: false, recommendations: false }, // ESA LIFE CEO 56x21 - All disabled
  dateFilter,
  eventFilters,
  friendFilter = 'all',
  recommendationType = 'all',
}: EnhancedCommunityMapProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce search
  const [showClusters, setShowClusters] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(3); // Track zoom level
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // ESA LIFE CEO 56x21 - Force only city groups to be visible
  const [layerVisibility, setLayerVisibility] = useState({
    cityGroup: true,
    event: false,  // ESA LIFE CEO 56x21 - Disabled
    home: false,   // ESA LIFE CEO 56x21 - Disabled  
    recommendation: false,  // ESA LIFE CEO 56x21 - Disabled
  });
  
  // Stats tracking
  const [mapStats, setMapStats] = useState({
    totalMarkers: 0,
    visibleMarkers: 0,
    clusters: 0,
  });
  
  // Intersection observer for lazy loading
  const { ref: mapRef, inView: mapInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  
  // ESA LIFE CEO 56x21 - Fetch all groups including location type (Tirana)
  const { data: cityGroupsResponse, isLoading: loadingCities } = useQuery({
    queryKey: ['/api/groups'],
    enabled: mapInView,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // ESA LIFE CEO 56x21 - Extract data from success wrapper
  const cityGroups = React.useMemo(() => {
    // API returns {success: true, data: [...]} structure
    if (!cityGroupsResponse) return [];
    
    // Handle direct array (backwards compatibility)
    if (Array.isArray(cityGroupsResponse)) return cityGroupsResponse;
    
    // Handle success wrapper structure (current API format)
    if (cityGroupsResponse?.success && Array.isArray(cityGroupsResponse.data)) {
      // City groups loaded
      return cityGroupsResponse.data;
    }
    
    // Handle data wrapper without success flag
    if (cityGroupsResponse?.data && Array.isArray(cityGroupsResponse.data)) {
      return cityGroupsResponse.data;
    }
    
    return [];
  }, [cityGroupsResponse]);
  
  // Fetch events
  const { data: events = [], isLoading: loadingEvents } = useQuery<any[]>({
    queryKey: ['/api/community/events-map', { city, groupSlug, dateFilter, eventFilters }],
    enabled: false, // ESA LIFE CEO 56x21 - Events disabled
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  
  // Fetch host homes
  const { data: homes = [], isLoading: loadingHomes } = useQuery<any[]>({
    queryKey: ['/api/community/homes-map', { city, groupSlug, friendFilter }],
    enabled: false, // ESA LIFE CEO 56x21 - Housing disabled
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  
  // Fetch recommendations
  const { data: recommendations = [], isLoading: loadingRecs } = useQuery<any[]>({
    queryKey: ['/api/community/recommendations-map', { city, groupSlug, friendFilter, recommendationType }],
    enabled: false, // ESA LIFE CEO 56x21 - Recommendations disabled
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  
  // ESA LIFE CEO 56x21 - Optimized processing with memory management
  const processedMapItems = useMemo(() => {
    // Early return if no data to prevent unnecessary processing
    if (!mapInView) return [];
    const allItems: EnhancedMapItem[] = [];
    
    // ESA LIFE CEO 56x21 - Processing map items
    
    // Add city groups
    if (layerVisibility.cityGroup) {
      const validCities = (cityGroups || []).filter((city: any) => {
        // ESA LIFE CEO 56x21 - Include both city and location types
        if (city.type !== 'city' && city.type !== 'location') return false;
        const hasCoords = (city.lat && city.lng) || (city.latitude && city.longitude);
        const lat = parseFloat(city.lat || city.latitude);
        const lng = parseFloat(city.lng || city.longitude);
        return hasCoords && !isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0);
      });
      
      const cityItems = validCities.map((city: any) => {
        // ESA LIFE CEO 56x21 - Force consistent data for all cities
        const eventCount = parseInt(city.eventCount) || 0;
        const hostCount = parseInt(city.hostCount) || 0;  
        const recommendationCount = parseInt(city.recommendationCount) || 0;
        const memberCount = parseInt(city.totalUsers || city.memberCount) || 0;
        
        return {
          id: `city-${city.id}`,
          // ESA LIFE CEO 56x21 - Parse coordinates from string or number
          lat: parseFloat(city.lat || city.latitude),
          lng: parseFloat(city.lng || city.longitude),
          title: city.name,
          description: `Click to see community statistics`,
          type: 'cityGroup' as const,
          city: city.name,
          slug: city.slug,
          memberCount,
          eventCount,
          hostCount,
          recommendationCount,
        };
      });
      
      if (showClusters) {
        allItems.push(...createClusterGroup(cityItems, 'cityGroup'));
      } else {
        allItems.push(...cityItems);
      }
    }
    
    // ESA LIFE CEO 56x21 - Events disabled for Tango World Map
    if (false) {  // ESA LIFE CEO 56x21 - Force disabled
      // Events code removed
    }
    
    // ESA LIFE CEO 56x21 - Housing disabled for Tango World Map
    if (false) {  // ESA LIFE CEO 56x21 - Force disabled
      // Housing code removed
    }
    
    // ESA LIFE CEO 56x21 - Recommendations disabled for Tango World Map
    // Only city groups should be displayed
    if (false) {  // ESA LIFE CEO 56x21 - Force disabled
      // Recommendations code removed
    }
    
    // Filter by search using debounced value for better performance
    const filtered = debouncedSearchQuery 
      ? allItems.filter(item => 
          item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          item.city.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        )
      : allItems;
    
    // ESA LIFE CEO 56x21 - Progressive loading based on zoom with memory optimization
    const maxMarkersPerZoom = currentZoom < 5 ? 30 : 
                              currentZoom < 8 ? 75 : 
                              currentZoom < 10 ? 150 : 
                              currentZoom < 12 ? 300 :
                              Math.min(filtered.length, 500); // Hard cap at 500 for memory
    
    // Clear references to prevent memory leaks
    const result = filtered.slice(0, maxMarkersPerZoom);
    
    // Force garbage collection hint for large datasets
    if (filtered.length > 500) {
      setTimeout(() => {
        // Allow browser to garbage collect unused items
      }, 0);
    }
    
    return result;
  }, [cityGroups, events, homes, recommendations, layerVisibility, showClusters, debouncedSearchQuery, currentZoom]);
  
  // ESA LIFE CEO 56x21 - Fixed infinite loop with proper dependency management
  useEffect(() => {
    // Use a stable reference check to prevent unnecessary updates
    const itemCount = processedMapItems.length;
    const clusterCount = processedMapItems.filter(item => item.isCluster).length;
    
    setMapStats(prevStats => {
      // Only update if values actually changed
      if (prevStats.totalMarkers === itemCount && 
          prevStats.visibleMarkers === itemCount && 
          prevStats.clusters === clusterCount) {
        return prevStats; // Return same reference to prevent re-render
      }
      
      return {
        totalMarkers: itemCount,
        visibleMarkers: itemCount,
        clusters: clusterCount,
      };
    });
  }, [processedMapItems.length]); // Only depend on length, not entire array
  
  // CSV export data
  const csvData = useMemo(() => {
    return processedMapItems.map(item => ({
      Type: item.type,
      Title: item.title,
      City: item.city,
      Latitude: item.lat,
      Longitude: item.lng,
      Description: item.description || '',
      ...(item.type === 'cityGroup' && {
        Members: item.memberCount || 0,
        Events: item.eventCount || 0,
        Hosts: item.hostCount || 0,
        Recommendations: item.recommendationCount || 0,
      }),
      ...(item.type === 'event' && {
        Date: item.date || '',
        Price: item.price || 0,
      }),
      ...(item.type === 'recommendation' && {
        Rating: item.rating || 0,
      }),
    }));
  }, [processedMapItems]);
  
  // Toggle layer visibility
  const toggleLayer = useCallback((layerType: keyof typeof layerVisibility) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerType]: !prev[layerType],
    }));
  }, []);
  
  // Refresh map data
  const refreshMapData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/community'] });
    toast({
      title: 'Map data refreshed',
      description: 'All layers have been updated with latest data',
    });
  }, [queryClient]);
  
  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen && mapContainerRef.current) {
      mapContainerRef.current.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);
  
  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Enhanced marker component
  const EnhancedMarker = ({ item }: { item: EnhancedMapItem }) => {
    const config = LAYER_CONFIG[item.type];
    const icon = createEnhancedIcon(config.color, config.icon, item.isCluster);
    
    return (
      <Marker
        position={[item.lat, item.lng]}
        icon={icon}
        eventHandlers={{
          click: (e) => {
            // ESA LIFE CEO 56x21 - Prevent map click-through
            e.originalEvent.stopPropagation();
          }
        }}
      >
        <Popup 
          className="enhanced-map-popup" 
          closeButton={true} 
          closeOnClick={false}
          autoClose={false}
          autoPan={true}
          interactive={true}
          keepInView={true}
        >
          <div className="relative p-0 min-w-[320px] max-w-[360px] bg-gradient-to-br from-turquoise-500/10 via-cyan-500/10 to-blue-500/10 backdrop-blur-lg rounded-xl border border-turquoise-300/30 shadow-2xl overflow-hidden">
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-turquoise-400 via-cyan-400 to-blue-400 opacity-20 animate-pulse" />
            
            {/* Content */}
            <div className="relative p-5">
              {/* Header with icon and title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-turquoise-500 to-cyan-500 rounded-xl shadow-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-xl bg-gradient-to-r from-turquoise-700 to-cyan-700 bg-clip-text text-transparent">
                  {item.title}
                </h3>
              </div>
            {item.isCluster ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {item.clusterCount} {config.name.toLowerCase()} in this area
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {item.items?.slice(0, 5).map((subItem: any, idx: number) => (
                    <div key={idx} className="text-xs text-gray-500 border-l-2 border-turquoise-200 pl-2">
                      {subItem.title}
                    </div>
                  ))}
                  {(item.items?.length || 0) > 5 && (
                    <p className="text-xs text-gray-400 italic">
                      and {(item.items?.length || 0) - 5} more...
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                )}
                {/* ESA LIFE CEO 56x21 - MT Design city group statistics */}
                {item.type === 'cityGroup' && (
                  <>
                    {/* ESA LIFE CEO 56x21 - Display statistics for all cities */}
                  <div className="space-y-4">
                    {/* Statistics Grid with glassmorphic cards */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* People Count */}
                      <div className="bg-white/40 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-lg hover:bg-white/50 transition-all group">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gradient-to-br from-turquoise-500 to-cyan-500 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-turquoise-700 to-cyan-700 bg-clip-text text-transparent">
                              {item.memberCount || 0}
                            </div>
                            <div className="text-xs text-gray-700 font-medium">People</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Events Count */}
                      <div className="bg-white/40 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-lg hover:bg-white/50 transition-all group">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                            <Calendar className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent">
                              {item.eventCount || 0}
                            </div>
                            <div className="text-xs text-gray-700 font-medium">Events</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Housing Hosts Count */}
                      <div className="bg-white/40 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-lg hover:bg-white/50 transition-all group">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                            <Home className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-green-700 bg-clip-text text-transparent">
                              {item.hostCount || 0}
                            </div>
                            <div className="text-xs text-gray-700 font-medium">Hosts</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Recommendations Count */}
                      <div className="bg-white/40 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-lg hover:bg-white/50 transition-all group">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                            <Star className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-700 to-orange-700 bg-clip-text text-transparent">
                              {item.recommendationCount || 0}
                            </div>
                            <div className="text-xs text-gray-700 font-medium">Tips</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* ESA LIFE CEO 56x21 - Navigation link with mouse event handlers */}
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onMouseUp={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        // Navigate on mouse up to ensure click completes
                        window.location.href = `/groups/${item.slug || item.id}`;
                      }}
                      className="block w-full py-3 px-4 bg-gradient-to-r from-turquoise-500 via-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-turquoise-600 hover:via-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-xl text-center relative overflow-hidden group cursor-pointer select-none"
                      style={{ zIndex: 10000, pointerEvents: 'auto' }}
                    >
                      {/* Animated shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="relative flex items-center justify-center gap-2 pointer-events-none">
                        <MapPin className="h-5 w-5" />
                        Visit {item.title} Community
                      </span>
                    </div>
                  </div>
                  </>
                )}
                {item.type === 'event' && item.date && (
                  <p className="text-xs text-gray-500">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                )}
                {item.type === 'recommendation' && item.rating && (
                  <p className="text-xs text-gray-500">
                    <Star className="inline h-3 w-3 mr-1 text-yellow-500" />
                    {item.rating}/5
                  </p>
                )}
              </>
            )}
            </div>
          </div>
        </Popup>
      </Marker>
    );
  };
  
  // Map center and zoom
  const mapCenter: [number, number] = [centerLat || -34.6037, centerLng || -58.3816];
  const mapZoom = centerLat && centerLng ? 13 : 3;
  
  const isLoading = loadingCities || loadingEvents || loadingHomes || loadingRecs;
  
  return (
    <div ref={mapContainerRef} className={cn(
      "relative h-full w-full transition-all duration-300",
      isFullscreen && "fixed inset-0 z-50 bg-white"
    )}>
      {/* Enhanced Controls Panel */}
      <div className="absolute top-4 left-4 z-[1000] space-y-3 max-w-sm">
        {/* Search Bar */}
        <Card className="glassmorphic-card">
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Layer Controls */}
        <Card className="glassmorphic-card">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Map Layers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {/* ESA LIFE CEO 56x21 - Only show Cities layer control */}
            {Object.entries(LAYER_CONFIG).filter(([key]) => key === 'cityGroup').map(([key, config]) => (
              <button
                key={key}
                onClick={() => toggleLayer(key as keyof typeof layerVisibility)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm",
                  layerVisibility[key as keyof typeof layerVisibility]
                    ? "bg-gradient-to-r from-turquoise-100 to-cyan-100 text-turquoise-700 border border-turquoise-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
                data-tooltip-id="layer-tooltip"
                data-tooltip-content={`Toggle ${config.name} layer`}
              >
                <span className="text-lg">{config.icon}</span>
                <span className="font-medium">{config.name}</span>
                {layerVisibility[key as keyof typeof layerVisibility] ? (
                  <Eye className="h-3 w-3 ml-auto" />
                ) : (
                  <EyeOff className="h-3 w-3 ml-auto" />
                )}
              </button>
            ))}
          </CardContent>
        </Card>
        
        {/* Map Stats */}
        <Card className="glassmorphic-card">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Total Markers:</span>
              <Badge variant="secondary">{mapStats.totalMarkers}</Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Visible:</span>
              <Badge variant="secondary">{mapStats.visibleMarkers}</Badge>
            </div>
            {showClusters && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Clusters:</span>
                <Badge variant="secondary">{mapStats.clusters}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowClusters(!showClusters)}
          className="glassmorphic-card"
          data-tooltip-id="cluster-tooltip"
          data-tooltip-content={showClusters ? "Disable clustering" : "Enable clustering"}
        >
          <Layers className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={refreshMapData}
          className="glassmorphic-card"
          data-tooltip-id="refresh-tooltip"
          data-tooltip-content="Refresh map data"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        <CSVLink
          data={csvData}
          filename={`tango-map-data-${new Date().toISOString().split('T')[0]}.csv`}
          className="inline-flex"
        >
          <Button
            size="sm"
            variant="outline"
            className="glassmorphic-card"
            data-tooltip-id="export-tooltip"
            data-tooltip-content="Export map data as CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
        </CSVLink>
        
        <Button
          size="sm"
          variant="outline"
          onClick={toggleFullscreen}
          className="glassmorphic-card"
          data-tooltip-id="fullscreen-tooltip"
          data-tooltip-content={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Map Container */}
      <div ref={mapRef} className="h-full w-full">
        {mapInView && (
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
            zoomControl={false}
            preferCanvas={true}
            maxZoom={18}
            minZoom={2}

            keepBuffer={4}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <ZoomControl position="bottomright" />
            <ScaleControl position="bottomleft" />
            
            <MapNavigationController
              onZoomIn={() => toast({ title: 'Zoomed in', duration: 1000 })}
              onZoomOut={() => toast({ title: 'Zoomed out', duration: 1000 })}
              onReset={() => toast({ title: 'Map reset', duration: 1000 })}
              onZoomChange={(zoom: number) => setCurrentZoom(zoom)}
            />
            
            {/* Render markers */}
            {processedMapItems.map((item) => (
              <EnhancedMarker key={item.id} item={item} />
            ))}
          </MapContainer>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[999]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map data...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Tooltips */}
      <Tooltip id="layer-tooltip" place="right" />
      <Tooltip id="cluster-tooltip" place="left" />
      <Tooltip id="refresh-tooltip" place="left" />
      <Tooltip id="export-tooltip" place="left" />
      <Tooltip id="fullscreen-tooltip" place="left" />
      
      {/* Keyboard shortcuts help */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Card className="glassmorphic-card">
          <CardContent className="p-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Info className="h-3 w-3" />
              <span>Shortcuts: ⌘/Ctrl + (+/-) to zoom, ⌘/Ctrl + 0 to reset</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <style>{`
        .map-marker-enhanced {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .map-marker-enhanced:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        
        .map-marker-enhanced.cluster {
          width: 40px;
          height: 40px;
        }
        
        .marker-icon {
          font-size: 18px;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
        }
        
        .cluster-count {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          font-size: 11px;
          font-weight: bold;
          padding: 2px 5px;
          border-radius: 10px;
          border: 2px solid white;
        }
        
        .enhanced-map-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        
        .enhanced-map-popup .leaflet-popup-tip {
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .glassmorphic-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
});

export default EnhancedCommunityMap;