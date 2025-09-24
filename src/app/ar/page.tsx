"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, VideoOff, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

// Haversine formula to calculate distance between two lat/lng points
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
}

function ARPageComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [taskCompleted, setTaskCompleted] = useState(false);
    
    const targetLat = parseFloat(searchParams.get('lat') || '0');
    const targetLng = parseFloat(searchParams.get('lng') || '0');
    const target = { lat: targetLat, lng: targetLng };
    const completionThreshold = 2; // meters
    const coinVisibilityThreshold = 3; // meters

    // Request Camera and Geolocation permissions
    useEffect(() => {
        const requestPermissions = async () => {
            try {
                // Camera
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                
                // Geolocation
                if (!navigator.geolocation) {
                    throw new Error("Geolocation is not supported by your browser.");
                }

                setHasPermission(true);

            } catch (error) {
                console.error("Permission error:", error);
                setHasPermission(false);
                const errorMessage = (error as Error).message;
                toast({
                    variant: 'destructive',
                    title: 'Permission Denied',
                    description: errorMessage || 'Please enable camera and location permissions in your browser settings.',
                });
            }
        };

        requestPermissions();

        return () => {
             if (videoRef.current && videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
        }
    }, [toast]);

    // Watch user's position
    useEffect(() => {
        if (hasPermission) {
            const watcher = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserPosition({ lat: latitude, lng: longitude });
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    toast({
                        variant: 'destructive',
                        title: 'Geolocation Error',
                        description: 'Could not get your location.',
                    });
                },
                { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
            );

            return () => navigator.geolocation.clearWatch(watcher);
        }
    }, [hasPermission, toast]);

    // Calculate distance and check for completion
    useEffect(() => {
        if (userPosition && target.lat && target.lng && !taskCompleted) {
            const dist = getDistance(userPosition.lat, userPosition.lng, target.lat, target.lng);
            setDistance(dist);

            if (dist <= completionThreshold) {
                setTaskCompleted(true);
                toast({
                    title: 'Task Completed!',
                    description: 'You have collected the coin!',
                });
                setTimeout(() => router.push('/quest'), 3000);
            }
        }
    }, [userPosition, target, router, toast, taskCompleted, completionThreshold]);


    return (
        <div className="flex flex-col h-screen bg-black text-white">
            {/* Camera View */}
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay playsInline muted />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20" />

            <main className="relative z-10 flex-1 flex flex-col items-center justify-between p-8">
                {/* Top: Distance Indicator */}
                <Card className="bg-black/50 backdrop-blur-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <Compass className="h-8 w-8 text-primary" />
                        <div>
                             <p className="text-sm text-muted-foreground">Distance to Target</p>
                            {distance !== null ? (
                                <p className="text-2xl font-bold">{distance.toFixed(1)} meters</p>
                            ) : (
                                <p className="text-lg">Calculating...</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                 {/* Center: Coin */}
                <div className="flex items-center justify-center">
                    {distance !== null && distance <= coinVisibilityThreshold && (
                        <div className="coin">
                            <div className="coin-inner">
                                <div className="coin-front">💰</div>
                                <div className="coin-back">💰</div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Bottom: Spacer */}
                 <div></div>

            </main>

            <footer className="absolute bottom-0 left-0 z-30 flex h-20 w-full items-center justify-center gap-4 px-4">
                <Button asChild variant="secondary" size="icon" className="h-12 w-12 rounded-full">
                    <Link href="/quest">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Quests</span>
                    </Link>
                </Button>
            </footer>

            {hasPermission === false && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-8 text-center">
                    <Alert variant="destructive" className="max-w-sm">
                        <VideoOff className="h-4 w-4" />
                        <AlertTitle>Permissions Required</AlertTitle>
                        <AlertDescription>
                            Please grant camera and location access in your browser settings to use the AR quest. You may need to refresh the page after granting permissions.
                        </AlertDescription>
                    </Alert>
                </div>
            )}
        </div>
    );
}


export default function ARPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ARPageComponent />
        </Suspense>
    )
}
