
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Trophy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- Helper Functions ---
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
}

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const λ1 = lon1 * Math.PI/180;
    const λ2 = lon2 * Math.PI/180;

    const y = Math.sin(λ2-λ1) * Math.cos(φ2);
    const x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1);
    const θ = Math.atan2(y, x);
    return (θ*180/PI + 360) % 360; // in degrees
}

function addDistanceToPoint(lat: number, lon: number, distance: number, bearing: number) {
    const R = 6371e3; // Earth's radius in meters
    const δ = distance / R; // Angular distance
    const θ = bearing * Math.PI / 180;
    const φ1 = lat * Math.PI / 180;
    const λ1 = lon * Math.PI / 180;

    const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
    const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));

    const newLat = φ2 * 180 / Math.PI;
    const newLon = λ2 * 180 / Math.PI;

    return { lat: newLat, lng: newLon };
}


function ARPageComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  
  const [isStarted, setIsStarted] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [targetLocation, setTargetLocation] = useState<{lat: number, lng: number} | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isCollected, setIsCollected] = useState(false);

  const searchParams = useSearchParams();

  // Effect to handle permissions and starting the AR experience
  const startAR = async () => {
    try {
        // 1. Gyroscope
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            const permission = await (DeviceOrientationEvent as any).requestPermission();
            if (permission !== 'granted') {
                throw new Error("Device orientation access is needed for AR.");
            }
        }
        
        // 2. Camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(console.error);
        }

        // 3. Geolocation
        navigator.geolocation.getCurrentPosition(
            (position) => {
                 // Successfully got location
                 setHasPermissions(true);
                 setIsStarted(true);
            },
            (error) => {
                throw new Error(`Geolocation error: ${error.message}. Please enable location services.`);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

    } catch (err: any) {
        console.error("Permission or setup error:", err);
        setPermissionError(err.message || "Could not access camera or device sensors. Please grant permissions in your browser settings.");
    }
  };

  // Effect for Device Orientation
  useEffect(() => {
    if (!isStarted) return;
    
    const handleOrientation = (e: DeviceOrientationEvent) => {
        const compassHeading = (e as any).webkitCompassHeading;
        let heading = 0;
        if (compassHeading != null) {
            heading = 360 - compassHeading; // iOS compass is reversed
        } else if (e.alpha != null) {
            heading = e.alpha;
        }
        setDeviceHeading(heading);
    };

    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    return () => window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
  }, [isStarted]);


  // Effect for Geolocation Watching
  useEffect(() => {
    if (!isStarted) return;

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const newLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
            
            // Set user location state
            setUserLocation(newLocation);

            // Set up target on first location fix
            if (!targetLocation) {
                const lat = searchParams.get('lat');
                const lng = searchParams.get('lng');
                if (lat && lng) {
                    setTargetLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
                } else {
                    // DEMO MODE: Create a target 5 meters in front of the user
                    const target = addDistanceToPoint(newLocation.lat, newLocation.lng, 5, deviceHeading);
                    setTargetLocation(target);
                }
            }
        },
        (error) => {
            console.error("Geolocation watch error:", error);
            toast({
                variant: 'destructive',
                title: 'Geolocation Error',
                description: 'Could not track your location.',
            });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isStarted, targetLocation, deviceHeading, searchParams, toast]);

   // Effect for calculating distance and checking for collection
  useEffect(() => {
    if (userLocation && targetLocation) {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, targetLocation.lat, targetLocation.lng);
        setDistance(dist);

        if (dist < 2 && !isCollected) { // Collection threshold: 2 meters
            setIsCollected(true);
            toast({
                title: "Quest Item Collected!",
                description: "You've found the coin!",
            });
            setTimeout(() => {
                // In a real app, you'd navigate back or update quest state
                // For now, we can just show a message
            }, 2000);
        }
    }
  }, [userLocation, targetLocation, isCollected, toast]);


  // --- Render logic ---

  let coinStyle: React.CSSProperties = { display: 'none' };

  if (distance !== null && targetLocation && userLocation && distance < 50 && !isCollected) { // Render within 50 meters
      const bearing = calculateBearing(userLocation.lat, userLocation.lng, targetLocation.lat, targetLocation.lng);
      const angleDiff = (bearing - deviceHeading + 360) % 360;
      
      const scale = Math.max(0.1, 1 - distance / 50); // Scale from 1 down to 0.1
      const left = 50 + (angleDiff > 180 ? angleDiff - 360 : angleDiff) * 2; // Position horizontally

      coinStyle = {
          display: 'block',
          position: 'absolute',
          top: '40%',
          left: `${left}%`,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transition: 'transform 0.5s ease-out, left 0.5s linear',
      };
  }

  return (
    <div className="relative h-screen w-screen bg-black">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />
      
      {!isStarted && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20 p-4">
            <Card className="max-w-sm text-center">
                <CardHeader>
                    <CardTitle>Start AR Quest</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-muted-foreground">Press the button to start your camera and begin the augmented reality experience.</p>
                    {permissionError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTitle>Permission Error</AlertTitle>
                            <AlertDescription>{permissionError}</AlertDescription>
                        </Alert>
                    )}
                    <Button size="lg" onClick={startAR}>
                        <Play className="mr-2" />
                        Start AR
                    </Button>
                </CardContent>
            </Card>
        </div>
      )}

      {isStarted && (
        <>
            {/* HUD */}
            <div className="absolute top-4 left-4 z-10 text-white bg-black/50 p-2 rounded-md">
                <p>Distance: {distance !== null ? `${distance.toFixed(1)}m` : 'Calculating...'}</p>
            </div>
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                <Button asChild variant="secondary" size="icon" className="h-12 w-12 rounded-full">
                <Link href="/quest">
                    <ArrowLeft className="h-6 w-6" />
                    <span className="sr-only">Back to Quests</span>
                </Link>
            </Button>
            </div>

            {/* Coin */}
            {!isCollected && distance !== null && distance < 50 && (
                 <div className="coin" style={coinStyle}>
                    <div className="coin-inner">$</div>
                </div>
            )}

            {/* Collected State */}
            {isCollected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-30 p-4">
                     <Card className="max-w-sm text-center">
                        <CardHeader>
                            <CardTitle className="flex justify-center items-center gap-2">
                                <Trophy className="text-yellow-500"/>
                                Quest Item Found!
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-muted-foreground">You have successfully collected the quest item.</p>
                             <Button asChild>
                                <Link href="/quest">
                                    Return to Quests
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
      )}
    </div>
  );
}


export default function ARPage() {
    return (
        <Suspense fallback={<div className="h-screen w-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <ARPageComponent />
        </Suspense>
    )
}

    