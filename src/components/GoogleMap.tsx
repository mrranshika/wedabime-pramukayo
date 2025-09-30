'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Leaf, TreePine, Navigation, Maximize2, Minimize2 } from 'lucide-react';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  onMapClick?: (lat: number, lng: number) => void;
  marker?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

export default function GoogleMap({ center, onMapClick, marker, zoom = 15, className = "" }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapContainerRef, setMapContainerRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (typeof window === 'undefined') return;

      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      setIsLoading(true);
      setError(null);

      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFwg2L7K0O8kXlQkQ7QeHh5g0X6vZ9Y7w&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      // Handle script load error
      script.onerror = () => {
        setError('Failed to load Google Maps. Please check your internet connection.');
        setIsLoading(false);
      };

      // Define callback function
      (window as any).initMap = () => {
        initializeMap();
      };
      
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google || !window.google.maps) {
        setError('Google Maps failed to initialize.');
        setIsLoading(false);
        return;
      }

      try {
        // Responsive map options based on screen size
        const isMobile = window.innerWidth < 768;
        const mapOptions: google.maps.MapOptions = {
          center: center,
          zoom: isMobile ? Math.max(zoom - 1, 12) : zoom, // Slightly lower zoom for mobile
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#f0f9ff' }]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#e0f2fe' }]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#e5e7eb' }]
            },
            {
              featureType: 'administrative',
              elementType: 'geometry',
              stylers: [{ color: '#fef3c7' }]
            }
          ],
          // Responsive controls
          mapTypeControl: !isMobile,
          streetViewControl: !isMobile,
          fullscreenControl: false, // We'll use our own fullscreen button
          zoomControl: !isMobile,
          backgroundColor: '#f0f9ff',
          // Gesture handling for mobile
          gestureHandling: isMobile ? 'greedy' : 'auto',
          // Disable scroll wheel zoom on mobile to prevent accidental zooming
          scrollwheel: !isMobile,
        };

        mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);

        // Add click event listener
        if (onMapClick) {
          mapInstanceRef.current.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              onMapClick(event.latLng.lat(), event.latLng.lng());
            }
          });
        }

        // Add marker if provided
        updateMarker(marker || center);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to initialize map.');
        setIsLoading(false);
      }
    };

    const updateMarker = (position: { lat: number; lng: number }) => {
      if (!mapInstanceRef.current || !window.google || !window.google.maps) return;

      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Custom green marker icon with responsive size
      const isMobile = window.innerWidth < 768;
      const markerIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: isMobile ? 10 : 8, // Slightly larger on mobile for better touch targets
        fillColor: '#059669',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      };

      markerRef.current = new google.maps.Marker({
        position: position,
        map: mapInstanceRef.current,
        title: 'Selected Location',
        animation: google.maps.Animation.DROP,
        draggable: true,
        icon: markerIcon
      });

      // Add drag event listener
      if (onMapClick) {
        markerRef.current.addListener('dragend', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            onMapClick(event.latLng.lat(), event.latLng.lng());
          }
        });
      }
    };

    loadGoogleMaps();

    // Handle window resize for responsive behavior
    const handleResize = () => {
      if (mapInstanceRef.current) {
        const isMobile = window.innerWidth < 768;
        google.maps.event.trigger(mapInstanceRef.current, 'resize');
        // Adjust zoom based on screen size
        const currentZoom = mapInstanceRef.current.getZoom();
        const targetZoom = isMobile ? Math.max(zoom - 1, 12) : zoom;
        if (currentZoom !== targetZoom) {
          mapInstanceRef.current.setZoom(targetZoom);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      delete (window as any).initMap;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!mapContainerRef) return;
    
    if (!isFullscreen) {
      if (mapContainerRef.requestFullscreen) {
        mapContainerRef.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
    }
  }, [center]);

  // Update marker when marker prop changes
  useEffect(() => {
    if (marker && mapInstanceRef.current) {
      updateMarker(marker);
    }
  }, [marker]);

  const mapClasses = `
    w-full rounded-xl border-2 border-green-200 shadow-lg overflow-hidden
    transition-all duration-300 ease-in-out
    ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'}
    ${className}
  `;

  const mapHeight = isFullscreen ? '100vh' : 'h-96 md:h-[500px] lg:h-[600px]';

  if (isLoading) {
    return (
      <div className={`${mapClasses} ${mapHeight} bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">Loading map...</p>
          <p className="text-sm text-green-600 mt-1">Preparing your interactive map experience</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${mapClasses} ${mapHeight} bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center`}>
        <div className="text-center p-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-12 w-12 text-green-600" />
            <TreePine className="h-12 w-12 text-emerald-600" />
          </div>
          <p className="text-green-700 font-medium mb-2">{error}</p>
          <p className="text-sm text-green-600">Map functionality may be limited</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry Loading Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={(el) => {
        mapRef.current = el;
        setMapContainerRef(el);
      }} 
      className={mapClasses}
      style={{ 
        height: mapHeight,
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        minHeight: isFullscreen ? '100vh' : '24rem'
      }}
    >
      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-green-200"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5 text-green-600" />
          ) : (
            <Maximize2 className="h-5 w-5 text-green-600" />
          )}
        </button>
        
        {/* Current Location Button */}
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
                    mapInstanceRef.current.setZoom(16);
                  }
                  if (onMapClick) {
                    onMapClick(latitude, longitude);
                  }
                },
                (error) => {
                  console.error('Error getting current location:', error);
                }
              );
            }
          }}
          className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-green-200"
          title="Center on current location"
        >
          <Navigation className="h-5 w-5 text-green-600" />
        </button>
      </div>

      {/* Mobile Instructions */}
      <div className="absolute bottom-4 left-4 right-4 z-10 md:hidden">
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-green-200">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>Tap to place pin • Drag to move • Pinch to zoom</span>
          </div>
        </div>
      </div>

      {/* Desktop Instructions */}
      <div className="absolute bottom-4 left-4 z-10 hidden md:block">
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-green-200">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>Click to place pin • Drag to move • Scroll to zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
}