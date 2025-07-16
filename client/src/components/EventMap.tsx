import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Calendar, Users } from 'lucide-react';

// Fix for default markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface EventMapProps {
  events: any[];
  cityLat?: number;
  cityLng?: number;
  onEventClick?: (event: any) => void;
}

export default function EventMap({ events, cityLat, cityLng, onEventClick }: EventMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on city or Buenos Aires
    const map = L.map(mapContainerRef.current).setView(
      [cityLat || -34.6037, cityLng || -58.3816], 
      12
    );

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [cityLat, cityLng]);

  // Update markers when events change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for events with coordinates
    events.forEach(event => {
      if (event.latitude && event.longitude) {
        // Custom icon based on event type
        const iconHtml = `
          <div class="relative">
            <div class="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-75"></div>
            <div class="relative bg-white rounded-full p-2 shadow-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-event-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        const marker = L.marker([event.latitude, event.longitude], { icon: customIcon })
          .addTo(mapRef.current!);

        // Create popup content
        const popupContent = `
          <div class="p-3 min-w-[200px]">
            <h3 class="font-semibold text-lg mb-2">${event.title}</h3>
            <div class="space-y-1 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                ${new Date(event.startDate).toLocaleDateString()}
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                ${new Date(event.startDate).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                ${event.location}
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                ${event.attendeeCount || 0} attending
              </div>
            </div>
            ${onEventClick ? `
              <button class="mt-3 w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:opacity-90 transition">
                View Details
              </button>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onEventClick) {
          marker.on('popupopen', () => {
            const button = document.querySelector('.leaflet-popup-content button');
            if (button) {
              button.addEventListener('click', () => onEventClick(event));
            }
          });
        }

        markersRef.current.push(marker);
      }
    });

    // Fit bounds to show all markers if there are any
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [events, onEventClick]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full rounded-lg" />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="font-semibold text-sm mb-2">Event Locations</h4>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"></div>
          <span>{events.filter(e => e.latitude && e.longitude).length} events</span>
        </div>
      </div>
    </div>
  );
}