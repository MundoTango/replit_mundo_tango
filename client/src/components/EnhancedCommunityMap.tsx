import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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

// Fix for missing marker icons in production
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Enhanced custom icons with better design
const createEnhancedIcon = (color: string, icon: string, isCluster?: boolean) => {
  return L.divIcon({
    html: `<div class="map-marker-enhanced ${isCluster ? 'cluster' : ''}" style="background: ${color}">
      <span class="marker-icon">${icon}</span>
      ${isCluster ? '<span class="cluster-count">2+</span>' : ''}
    </div>`,
    className: 'custom-enhanced-marker',
    iconSize: isCluster ? [40, 40] : [36, 36],
    iconAnchor: isCluster ? [20, 20] : [18, 18],
    popupAnchor: [0, -20],
  });
};

// Layer configuration
const LAYER_CONFIG = {
  cityGroup: { color: '#38b2ac', icon: '🌍', name: 'Cities' },
  event: { color: '#10B981', icon: '📅', name: 'Events' },
  home: { color: '#F59E0B', icon: '🏠', name: 'Housing' },
  recommendation: { color: '#EF4444', icon: '⭐', name: 'Recommendations' },
};

// Map navigation controller with enhanced features
const MapNavigationController = ({ onZoomIn, onZoomOut, onReset }: any) => {
  const map = useMap();
  
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

export default function EnhancedCommunityMap({
  city,
  groupSlug,
  centerLat,
  centerLng,
  groupCity,
  layers = { events: true, housing: true, recommendations: true },
  dateFilter,
  eventFilters,
  friendFilter = 'all',
  recommendationType = 'all',
}: EnhancedCommunityMapProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClusters, setShowClusters] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Layer visibility state
  const [layerVisibility, setLayerVisibility] = useState({
    cityGroup: true,
    event: layers.events,
    home: layers.housing,
    recommendation: layers.recommendations,
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
  
  // Fetch city groups
  const { data: cityGroups = [], isLoading: loadingCities } = useQuery({
    queryKey: ['/api/community/city-groups', { city }],
    enabled: mapInView,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Fetch events
  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['/api/community/events-map', { city, groupSlug, dateFilter, eventFilters }],
    enabled: mapInView && layerVisibility.event,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  
  // Fetch host homes
  const { data: homes = [], isLoading: loadingHomes } = useQuery({
    queryKey: ['/api/community/homes-map', { city, groupSlug, friendFilter }],
    enabled: mapInView && layerVisibility.home,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  
  // Fetch recommendations
  const { data: recommendations = [], isLoading: loadingRecs } = useQuery({
    queryKey: ['/api/community/recommendations-map', { city, groupSlug, friendFilter, recommendationType }],
    enabled: mapInView && layerVisibility.recommendation,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  
  // Process and cluster map items
  const processedMapItems = useMemo(() => {
    const allItems: EnhancedMapItem[] = [];
    
    // Add city groups
    if (layerVisibility.cityGroup) {
      const validCities = cityGroups.filter((city: any) => 
        city.lat !== 0 || city.lng !== 0
      );
      
      const cityItems = validCities.map((city: any) => ({
        id: `city-${city.id}`,
        lat: city.lat,
        lng: city.lng,
        title: city.name,
        description: `${city.totalUsers || 0} members • ${city.eventCount || 0} events`,
        type: 'cityGroup' as const,
        city: city.name,
        slug: city.slug,
        memberCount: city.totalUsers || 0,
        eventCount: city.eventCount || 0,
        hostCount: city.hostCount || 0,
        recommendationCount: city.recommendationCount || 0,
      }));
      
      if (showClusters) {
        allItems.push(...createClusterGroup(cityItems, 'cityGroup'));
      } else {
        allItems.push(...cityItems);
      }
    }
    
    // Add events
    if (layerVisibility.event) {
      const eventItems = events.map((event: any) => ({
        id: `event-${event.id}`,
        lat: event.lat,
        lng: event.lng,
        title: event.title,
        description: event.description,
        type: 'event' as const,
        city: event.city || '',
        date: event.date,
        price: event.price,
      }));
      
      if (showClusters) {
        allItems.push(...createClusterGroup(eventItems, 'event'));
      } else {
        allItems.push(...eventItems);
      }
    }
    
    // Add homes
    if (layerVisibility.home) {
      const homeItems = homes.map((home: any) => ({
        id: `home-${home.id}`,
        lat: home.lat,
        lng: home.lng,
        title: home.title,
        description: home.description,
        type: 'home' as const,
        city: home.city || '',
        price: home.price,
        photos: home.photos || [],
      }));
      
      if (showClusters) {
        allItems.push(...createClusterGroup(homeItems, 'home'));
      } else {
        allItems.push(...homeItems);
      }
    }
    
    // Add recommendations
    if (layerVisibility.recommendation) {
      const recItems = recommendations.map((rec: any) => ({
        id: `rec-${rec.id}`,
        lat: rec.lat,
        lng: rec.lng,
        title: rec.title,
        description: rec.description,
        type: 'recommendation' as const,
        city: rec.city || '',
        rating: rec.rating,
      }));
      
      if (showClusters) {
        allItems.push(...createClusterGroup(recItems, 'recommendation'));
      } else {
        allItems.push(...recItems);
      }
    }
    
    // Filter by search
    const filtered = searchQuery 
      ? allItems.filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.city.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allItems;
    
    // Update stats
    const clusterCount = filtered.filter(item => item.isCluster).length;
    setMapStats({
      totalMarkers: allItems.length,
      visibleMarkers: filtered.length,
      clusters: clusterCount,
    });
    
    return filtered;
  }, [cityGroups, events, homes, recommendations, layerVisibility, showClusters, searchQuery]);
  
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
          mouseover: () => setHoveredItem(item.id.toString()),
          mouseout: () => setHoveredItem(null),
          click: () => {
            if (item.type === 'cityGroup' && item.slug) {
              setLocation(`/groups/${item.slug}`);
            }
          },
        }}
      >
        <Popup className="enhanced-map-popup">
          <div className="p-3 min-w-[200px]">
            <h3 className="font-bold text-lg mb-2 text-gray-900">{item.title}</h3>
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
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                )}
                {item.type === 'cityGroup' && (
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-turquoise-500 to-cyan-500 hover:from-turquoise-600 hover:to-cyan-600"
                    onClick={() => setLocation(`/groups/${item.slug}`)}
                  >
                    Visit Community
                  </Button>
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
            {Object.entries(LAYER_CONFIG).map(([key, config]) => (
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
      
      <style jsx global>{`
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
}