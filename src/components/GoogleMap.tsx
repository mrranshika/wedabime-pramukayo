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
        const mapOptions: google.maps.MapOptions = {
          center: center,
          zoom: zoom,
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
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          backgroundColor: '#f0f9ff'
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

      // Custom green marker icon
      const markerIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
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

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      delete (window as any).initMap;
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
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-12 w-12 text-green-600" />
            <TreePine className="h-12 w-12 text-emerald-600" />
          </div>
          <p className="text-green-700 font-medium mb-2">{error}</p>
          <p className="text-sm text-green-600">Map functionality may be limited</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-96 rounded-xl border-2 border-green-200 shadow-lg overflow-hidden"
      style={{ 
        minHeight: '24rem',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
      }}
    />
  );
}