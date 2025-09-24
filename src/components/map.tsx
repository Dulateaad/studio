"use client";

import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, Polyline, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Skeleton } from './ui/skeleton';
import { LocationWithCoordinates } from '@/app/page';
import { Button } from './ui/button';
import { Locate } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Place } from '@/ai/flows/find-nearby-places';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: 'inherit'
};

// Coordinates for Astana
const center = {
  lat: 51.1694,
  lng: 71.4491
};

interface MapProps {
    isLoaded: boolean;
    routeCoordinates?: LocationWithCoordinates[];
    origin?: string;
    destination?: string;
    nearbyPlaces?: Place[];
    onCenterChanged?: (center: { lat: number; lng: number }) => void;
}

export function Map({ isLoaded, routeCoordinates, origin, destination, nearbyPlaces, onCenterChanged }: MapProps) {
  const { toast } = useToast();

  const mapRef = useRef<google.maps.Map | null>(null);
  const [userPosition, setUserPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    if (mapRef.current && routeCoordinates && routeCoordinates.length > 0 && !directions) {
      const bounds = new google.maps.LatLngBounds();
      routeCoordinates.forEach(loc => {
        bounds.extend(loc.coordinates);
      });
      mapRef.current.fitBounds(bounds);
    } else if (mapRef.current && userPosition && !directions && !routeCoordinates?.length) {
        mapRef.current.panTo(userPosition);
        mapRef.current.setZoom(15);
    }
  }, [routeCoordinates, userPosition, directions]);

  useEffect(() => {
    if (!origin || !destination || !window.google || !isLoaded) {
        setDirections(null); // Clear directions if origin/destination are cleared
        return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
        {
            origin: origin,
            destination: destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK && result) {
                setDirections(result);
            } else {
                console.error(`error fetching directions ${result}`);
                toast({
                    variant: "destructive",
                    title: "Ошибка",
                    description: "Не удалось построить маршрут. Проверьте адреса.",
                });
            }
        }
    );
  }, [origin, destination, toast, isLoaded]);


  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserPosition(pos);
        if (mapRef.current) {
            mapRef.current.panTo(pos);
            mapRef.current.setZoom(15);
            onCenterChanged?.(pos);
        }
      }, () => {
        toast({
            variant: "destructive",
            title: "Ошибка геолокации",
            description: "Не удалось получить ваше местоположение. Проверьте настройки браузера.",
        });
      });
    } else {
       toast({
            variant: "destructive",
            title: "Ошибка геолокации",
            description: "Ваш браузер не поддерживает геолокацию.",
        });
    }
  };


  if (!isLoaded) {
    return <Skeleton className="w-full h-full" />;
  }

  const polylinePath = routeCoordinates?.map(loc => loc.coordinates);

  const handleDragEnd = () => {
    if (mapRef.current) {
        const newCenter = mapRef.current.getCenter();
        if (newCenter) {
            onCenterChanged?.({ lat: newCenter.lat(), lng: newCenter.lng() });
        }
    }
  };

  return (
    <div className="w-full h-full relative">
        <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={(map) => { mapRef.current = map; }}
        options={{
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        }}
        onDragEnd={handleDragEnd}
        onZoomChanged={handleDragEnd} // Also update on zoom
        >
        {directions && <DirectionsRenderer directions={directions} />}

        {!directions && polylinePath && polylinePath.length > 0 && (
            <>
                <Polyline
                    path={polylinePath}
                    options={{
                        strokeColor: "#FF0000",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                    }}
                />
                {routeCoordinates?.map((loc, index) => (
                    <Marker 
                        key={`route-${index}`}
                        position={loc.coordinates}
                        label={`${index + 1}`}
                        title={loc.name}
                    />
                ))}
            </>
        )}
        {userPosition && <Marker position={userPosition} title="Your Location" />}

        {nearbyPlaces && nearbyPlaces.map((place, index) => (
            <Marker
                key={`nearby-${index}`}
                position={place.location}
                title={place.name}
            />
        ))}

        </GoogleMap>
        <Button 
            size="icon"
            className="absolute bottom-4 right-4 z-10 rounded-full shadow-lg"
            onClick={handleLocateMe}
            aria-label="My Location"
            >
            <Locate className="h-5 w-5"/>
        </Button>
    </div>
  );
}
