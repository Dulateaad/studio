
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from 'next/link';
import { ArrowLeft, Play } from 'lucide-react';
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ARPageComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isStarted, setIsStarted] = useState(false);
  
  // Refs to hold Three.js objects and other state that doesn't trigger re-renders
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const startAR = async () => {
    if (typeof window === 'undefined' || !containerRef.current) {
        return;
    }
    
    try {
        // --- Request permissions ---
        // Request gyroscope access (for iOS)
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            const permission = await (DeviceOrientationEvent as any).requestPermission();
            if (permission !== 'granted') {
                toast({
                    variant: "destructive",
                    title: "Permission Denied",
                    description: "Device orientation access is needed for AR.",
                });
                return;
            }
        }

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        
        // Create video element dynamically
        const videoEl = document.createElement("video");
        videoEl.setAttribute("autoplay", "");
        videoEl.setAttribute("muted", "");
        videoEl.setAttribute("playsinline", "");
        videoEl.srcObject = stream;
        videoRef.current = videoEl;
        await videoEl.play();

        setIsStarted(true);

    } catch (err) {
        console.error("Permission or camera access error:", err);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not access camera or device orientation. Please grant permissions.",
        });
    }
  };

  useEffect(() => {
    // Only run this effect when isStarted is true
    if (!isStarted || !containerRef.current || !videoRef.current) {
      return;
    }
    
    const currentContainer = containerRef.current;
    const video = videoRef.current;

    // --- Initialize Three.js Scene ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentContainer.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const texture = new THREE.VideoTexture(video);
    scene.background = texture;

    // Coin (primitive)
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.5, roughness: 0.2 });
    const coin = new THREE.Mesh(geometry, material);
    scene.add(coin);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(0, 1, 1).normalize();
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    let heading = 0;
    const handleOrientation = (e: DeviceOrientationEvent) => {
        // webkitCompassHeading is for iOS
        const compassHeading = (e as any).webkitCompassHeading;
        if (compassHeading != null) {
            heading = 360 - compassHeading; // iOS compass is reversed
        } else if (e.alpha != null) {
            heading = e.alpha; // Standard DeviceOrientation API
        }
    };
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);


    function animate() {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      
      coin.rotation.y += 0.01;

      // Simplest logic: place the coin 3m in front of the view
      const rad = THREE.MathUtils.degToRad(heading);
      coin.position.set(
        3 * Math.sin(rad),
        0,
        -3 * Math.cos(rad) // Use -Z for "in front" in Three.js
      );

      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup function ---
    return () => {
        // Stop animation frame
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
        }
        
        // Remove event listeners
        window.removeEventListener('resize', handleResize);
        window.removeEventListener("deviceorientationabsolute", handleOrientation);
        
        // Stop camera stream
        if (video && video.srcObject) {
            (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
        
        // Dispose of Three.js resources
        if(rendererRef.current) {
          // Remove canvas from DOM
          if (currentContainer && rendererRef.current.domElement && currentContainer.contains(rendererRef.current.domElement)) {
               currentContainer.removeChild(rendererRef.current.domElement);
          }
          rendererRef.current.dispose();
          rendererRef.current = null;
        }

        if (sceneRef.current) {
            sceneRef.current.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            sceneRef.current = null;
        }
    };
  }, [isStarted]); // This effect depends only on 'isStarted'

  return (
    <div className="relative h-screen w-screen bg-black">
      {/* This div is the mount point for the Three.js canvas */}
      <div ref={containerRef} className="absolute inset-0" />
      
      {!isStarted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <Card className="max-w-sm text-center">
                <CardHeader>
                    <CardTitle>Start AR Quest</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-muted-foreground">Press the button below to start your camera and begin the augmented reality experience.</p>
                    <Button size="lg" onClick={startAR}>
                        <Play className="mr-2" />
                        Start AR
                    </Button>
                </CardContent>
            </Card>
        </div>
      )}

      {isStarted && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
           <Button asChild variant="secondary" size="icon" className="h-12 w-12 rounded-full">
              <Link href="/quest">
                  <ArrowLeft className="h-6 w-6" />
                  <span className="sr-only">Back to Quests</span>
              </Link>
          </Button>
        </div>
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
