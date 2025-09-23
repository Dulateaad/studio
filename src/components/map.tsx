"use client";

import React, { useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import { Skeleton } from './ui/skeleton';
import { LocationWithCoordinates } from '@/app/page';

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
    routeCoordinates?: LocationWithCoordinates[];
}

export function Map({ routeCoordinates }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && routeCoordinates && routeCoordinates.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      routeCoordinates.forEach(loc => {
        bounds.extend(loc.coordinates);
      });
      mapRef.current.fitBounds(bounds);
    }
  }, [routeCoordinates]);


  if (!isLoaded) {
    return <Skeleton className="w-full h-full" />;
  }

  const polylinePath = routeCoordinates?.map(loc => loc.coordinates);

  return (
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
      {polylinePath && (
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
    </GoogleMap>
  );
}
