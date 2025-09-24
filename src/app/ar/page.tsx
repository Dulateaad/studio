"use client";

import { useEffect, useRef, Suspense } from "react";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function ARPageComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) {
        return;
    }

    const currentContainer = containerRef.current;

    // --- Инициализация камеры ---
    const video = document.createElement("video");
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    let videoReady = false;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => { 
          video.srcObject = stream;
          video.play(); // Start playing the video once the stream is ready
          videoReady = true;
       })
      .catch(err => {
        console.error("Camera access error:", err);
        toast({
            variant: "destructive",
            title: "Camera Error",
            description: "Could not access the camera. Please grant permission and ensure it's not in use by another app.",
        });
      });

    // --- Инициализация сцены Three.js ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    currentContainer.appendChild(renderer.domElement);

    // Фон – поток с камеры
    const texture = new THREE.VideoTexture(video);
    scene.background = texture;

    // Монета (примитив)
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xffd700 });
    const coin = new THREE.Mesh(geometry, material);
    scene.add(coin);

    // Свет
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(0,1,1).normalize();
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // --- Определяем геопозицию и азимут ---
    let heading = 0;

    const handleOrientation = (e: DeviceOrientationEvent) => {
        // webkitCompassHeading is for iOS
        const compassHeading = (e as any).webkitCompassHeading; 
        if (compassHeading != null) {
            heading = 360 - compassHeading; // Invert for correct direction
        } else if (e.alpha != null) {
            // e.alpha is the fallback for other devices
            heading = e.alpha; 
        }
    };
    
    // Check for iOS > 13
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
            .then((permissionState: string) => {
                if (permissionState === 'granted') {
                    window.addEventListener("deviceorientation", handleOrientation);
                } else {
                     toast({
                        variant: "destructive",
                        title: "Permission Denied",
                        description: "Device orientation access is needed for AR.",
                    });
                }
            })
            .catch(console.error);
    } else {
        // For other devices
        window.addEventListener("deviceorientationabsolute", handleOrientation);
    }


    navigator.geolocation.getCurrentPosition(pos => {
      console.log("User coordinates:", pos.coords.latitude, pos.coords.longitude);
      // coordinates can be used for quest logic
    });

    // --- Рендер ---
    let animationFrameId: number;
    function animate() {
      animationFrameId = requestAnimationFrame(animate);

      if(videoReady) {
        texture.needsUpdate = true;
      }
      
      coin.rotation.y += 0.01; // Make it spin

      // Simple logic: place the coin 3m ahead
      const rad = THREE.MathUtils.degToRad(heading);
      coin.position.set(
        3 * Math.sin(rad),
        0, // centered vertically
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
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener("deviceorientationabsolute", handleOrientation);
        window.removeEventListener("deviceorientation", handleOrientation);
        if (video.srcObject) {
            (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
        renderer.dispose();
        if (currentContainer) {
            currentContainer.removeChild(renderer.domElement);
        }
    };
  }, [toast]);

  return (
    <div className="relative h-screen w-screen bg-black">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
         <Button asChild variant="secondary" size="icon" className="h-12 w-12 rounded-full">
            <Link href="/quest">
                <ArrowLeft className="h-6 w-6" />
                <span className="sr-only">Back to Quests</span>
            </Link>
        </Button>
      </div>
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
