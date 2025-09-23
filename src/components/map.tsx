"use client";

import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, Polyline, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Skeleton } from './ui/skeleton';
import { LocationWithCoordinates } from '@/app/page';
import { Button } from './ui/button';
import { Locate } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

export function Map({ isLoaded, routeCoordinates, origin, destination }: MapProps) {
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
        >
        {directions && <DirectionsRenderer directions={directions} />}

        {!directions && polylinePath && (
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
                        key={index}
                        position={loc.coordinates}
                        label={`${index + 1}`}
                        title={loc.name}
                    />
                ))}
            </>
        )}
        {userPosition && <Marker position={userPosition} title="Your Location" />}
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
