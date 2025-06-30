// Google Maps Platform type declarations for Mundo Tango
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
    }
    
    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latlng: LatLng): void;
    }
    
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }
    
    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map: Map, anchor?: Marker): void;
      close(): void;
      setContent(content: string): void;
    }
    
    enum ControlPosition {
      TOP_CENTER,
      TOP_LEFT,
      TOP_RIGHT,
      LEFT_TOP,
      RIGHT_TOP,
      LEFT_CENTER,
      RIGHT_CENTER,
      LEFT_BOTTOM,
      RIGHT_BOTTOM,
      BOTTOM_CENTER,
      BOTTOM_LEFT,
      BOTTOM_RIGHT
    }
    
    interface MapOptions {
      center?: LatLng;
      zoom?: number;
      mapTypeId?: string;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
    }
    
    interface MarkerOptions {
      position?: LatLng;
      map?: Map;
      title?: string;
      icon?: string;
      draggable?: boolean;
    }
    
    interface InfoWindowOptions {
      content?: string;
      position?: LatLng;
    }
    
    namespace places {
      class Autocomplete {
        constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
        addListener(eventName: string, handler: () => void): void;
        getPlace(): PlaceResult;
        setBounds(bounds: LatLngBounds): void;
        setComponentRestrictions(restrictions: ComponentRestrictions): void;
      }
      
      class PlacesService {
        constructor(attrContainer: HTMLDivElement | Map);
        getDetails(request: PlaceDetailsRequest, callback: (result: PlaceResult, status: PlacesServiceStatus) => void): void;
      }
      
      interface AutocompleteOptions {
        bounds?: LatLngBounds;
        componentRestrictions?: ComponentRestrictions;
        fields?: string[];
        strictBounds?: boolean;
        types?: string[];
      }
      
      interface PlaceResult {
        place_id?: string;
        formatted_address?: string;
        name?: string;
        geometry?: {
          location: LatLng;
          viewport: LatLngBounds;
        };
        address_components?: AddressComponent[];
        types?: string[];
      }
      
      interface AddressComponent {
        long_name: string;
        short_name: string;
        types: string[];
      }
      
      interface ComponentRestrictions {
        country?: string | string[];
      }
      
      interface PlaceDetailsRequest {
        placeId: string;
        fields: string[];
      }
      
      enum PlacesServiceStatus {
        OK = 'OK',
        ZERO_RESULTS = 'ZERO_RESULTS',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        INVALID_REQUEST = 'INVALID_REQUEST',
        NOT_FOUND = 'NOT_FOUND',
        ERROR = 'ERROR'
      }
    }
    
    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      extend(point: LatLng): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
    }
  }
}

// Global google object
declare const google: typeof google;