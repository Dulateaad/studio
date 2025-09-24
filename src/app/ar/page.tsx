
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const startAR = async () => {
    if (typeof window === 'undefined' || !containerRef.current) {
        return;
    }
    
    // --- Запрос разрешений ---
    try {
        // Запрос к гироскопу (для iOS)
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

        // Запрос к камере
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        
        const videoEl = document.createElement("video");
        videoEl.setAttribute("autoplay", "");
        videoEl.setAttribute("muted", "");
        videoEl.setAttribute("playsinline", "");
        videoEl.srcObject = stream;
        videoEl.play();
        videoRef.current = videoEl;

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
    if (!isStarted || !containerRef.current || !videoRef.current) {
      return;
    }
    
    const currentContainer = containerRef.current;
    const video = videoRef.current;

    // --- Инициализация сцены Three.js ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentContainer.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const texture = new THREE.VideoTexture(video);
    scene.background = texture;

    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.5, roughness: 0.2 });
    const coin = new THREE.Mesh(geometry, material);
    scene.add(coin);

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(0, 1, 1).normalize();
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    let heading = 0;
    const handleOrientation = (e: DeviceOrientationEvent) => {
        const compassHeading = (e as any).webkitCompassHeading;
        if (compassHeading != null) {
            heading = 360 - compassHeading;
        } else if (e.alpha != null) {
            heading = e.alpha;
        }
    };
    window.addEventListener("deviceorientation", handleOrientation, true);


    function animate() {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      
      coin.rotation.y += 0.01;

      const rad = THREE.MathUtils.degToRad(heading);
      coin.position.set(
        3 * Math.sin(rad),
        0,
        -3 * Math.cos(rad)
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

    return () => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
        }
        window.removeEventListener('resize', handleResize);
        window.removeEventListener("deviceorientation", handleOrientation);
        
        if (video.srcObject) {
            (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
        
        renderer.dispose();
        if (currentContainer && renderer.domElement) {
             if (currentContainer.contains(renderer.domElement)) {
                currentContainer.removeChild(renderer.domElement);
            }
        }
    };
  }, [isStarted]);

  return (
    <div className="relative h-screen w-screen bg-black">
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
        <Suspense fallback={<div>Loading...</div>}>
            <ARPageComponent />
        </Suspense>
    )
}
