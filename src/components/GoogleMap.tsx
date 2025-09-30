'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Leaf, TreePine } from 'lucide-react';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  onMapClick?: (lat: number, lng: number) => void;
  marker?: { lat: number; lng: number };
  zoom?: number;
}

export default function GoogleMap({ center, onMapClick, marker, zoom = 15 }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setError('Google Maps API key is not configured.');
        setIsLoading(false);
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      // Handle script load error
      script.onerror = () => {
        setError('Failed to load Google Maps. Please check your internet connection and API key.');
        setIsLoading(false);
      };

      // Handle script load success but callback not called
      script.onload = () => {
        // Give some time for the callback to be called
        setTimeout(() => {
          if (isLoading) {
            setError('Google Maps loaded but failed to initialize. Please refresh the page.');
            setIsLoading(false);
          }
        }, 5000);
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
        const isSmallMobile = window.innerWidth < 480;
        const mapOptions: google.maps.MapOptions = {
          center: center,
          zoom: isSmallMobile ? Math.max(zoom - 2, 11) : isMobile ? Math.max(zoom - 1, 12) : zoom,
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
          zoomControl: !isSmallMobile,
          backgroundColor: '#f0f9ff',
          // Gesture handling for mobile
          gestureHandling: isMobile ? 'greedy' : 'auto',
          // Disable scroll wheel zoom on mobile to prevent accidental zooming
          scrollwheel: !isMobile,
          // Better performance on mobile
          disableDefaultUI: isSmallMobile,
          // Enable lite mode for better performance on mobile
          draggable: !isSmallMobile,
          // Better touch handling
          draggableCursor: 'pointer',
          draggingCursor: 'grabbing',
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
      const isSmallMobile = window.innerWidth < 480;
      const markerIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: isSmallMobile ? 12 : isMobile ? 10 : 8, // Larger on mobile for better touch targets
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
        draggable: !isSmallMobile, // Disable dragging on very small screens
        icon: markerIcon
      });

      // Add drag event listener
      if (onMapClick && !isSmallMobile) {
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
        const isSmallMobile = window.innerWidth < 480;
        google.maps.event.trigger(mapInstanceRef.current, 'resize');
        // Adjust zoom based on screen size
        const currentZoom = mapInstanceRef.current.getZoom();
        const targetZoom = isSmallMobile ? Math.max(zoom - 2, 11) : isMobile ? Math.max(zoom - 1, 12) : zoom;
        if (currentZoom !== targetZoom) {
          mapInstanceRef.current.setZoom(targetZoom);
        }
        // Update marker size
        if (markerRef.current) {
          const newScale = isSmallMobile ? 12 : isMobile ? 10 : 8;
          const newIcon = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: newScale,
            fillColor: '#059669',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          };
          markerRef.current.setIcon(newIcon);
          markerRef.current.setDraggable(!isSmallMobile);
        }
      }
    };

    // Debounce resize handler for better performance
    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 250);
    };

    window.addEventListener('resize', debouncedResize);

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      delete (window as any).initMap;
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
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

  if (isLoading) {
    return (
      <div className="w-full h-96 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center shadow-lg">
        <div className="text-center p-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-12 w-12 text-green-600" />
            <TreePine className="h-12 w-12 text-emerald-600" />
          </div>
          <p className="text-green-700 font-medium mb-2">{error}</p>
          <p className="text-sm text-green-600 mb-4">Map functionality may be limited</p>
          <div className="space-y-2 text-xs text-green-600">
            <p>Possible solutions:</p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>Check your internet connection</li>
              <li>Verify Google Maps API key is valid</li>
              <li>Ensure Google Maps API is enabled</li>
              <li>Try refreshing the page</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] rounded-xl border-2 border-green-200 shadow-lg overflow-hidden"
      style={{ 
        minHeight: '16rem',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
      }}
    />
  );
}