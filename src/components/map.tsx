"use client";

import React from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Skeleton } from './ui/skeleton';

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

export function Map() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  });

  if (!isLoaded) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
    >
      {/* You can add markers here later */}
    </GoogleMap>
  );
}
