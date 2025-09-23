"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode, Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, VideoOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const qrCodeRegionId = "qr-reader";

export default function ScanPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        const checkCameraPermission = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const hasCamera = devices.some(device => device.kind === 'videoinput');
                if (!hasCamera) {
                    setHasCameraPermission(false);
                    return;
                }
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                stream.getTracks().forEach(track => track.stop());
                setHasCameraPermission(true);
            } catch (err) {
                console.error("Camera permission error:", err);
                setHasCameraPermission(false);
            }
        };

        checkCameraPermission();
    }, []);

    useEffect(() => {
        if (hasCameraPermission === true) {
            const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
                const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                const qrboxSize = Math.floor(minEdge * 0.8);
                return {
                    width: qrboxSize,
                    height: qrboxSize,
                };
            };

            const html5QrCode = new Html5Qrcode(qrCodeRegionId, { 
              formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ],
              verbose: false 
            });
            scannerRef.current = html5QrCode;

            const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
                console.log(`QR code found: ${decodedText}`);
                toast({
                    title: "QR Code Scanned!",
                    description: `Code: ${decodedText}`,
                });
                // For now, we just log it. In the future, we can redirect to an AR page.
                // router.push(`/ar/${decodedText}`);
                 if (scannerRef.current && scannerRef.current.isScanning) {
                    scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
                }
            };

            html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: qrboxFunction,
                    aspectRatio: 1.0,
                },
                qrCodeSuccessCallback,
                (errorMessage) => {
                    // console.log("QR Code scan error:", errorMessage);
                }
            ).catch((err) => {
                console.error("Unable to start scanning.", err);
                 toast({
                    variant: "destructive",
                    title: "Scanner Error",
                    description: "Could not start the QR code scanner.",
                });
            });

            return () => {
                if (scannerRef.current && scannerRef.current.isScanning) {
                    scannerRef.current.stop().catch(err => console.error("Failed to stop scanner on cleanup", err));
                }
            };
        }
    }, [hasCameraPermission, router, toast]);

    return (
        <div className="flex flex-col h-screen bg-black">
            <header className="absolute top-0 left-0 z-30 flex h-14 w-full items-center gap-4 px-4">
                <Button asChild variant="secondary" size="icon" className="h-8 w-8 rounded-full">
                    <Link href="/quest">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Quests</span>
                    </Link>
                </Button>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center text-white">
                <div id={qrCodeRegionId} className="w-full aspect-square max-w-md" />
                
                {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-8">
                         <Alert variant="destructive" className="max-w-sm">
                            <VideoOff className="h-4 w-4" />
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please grant camera access in your browser settings to use the QR scanner. You may need to refresh the page after granting permission.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
                 {hasCameraPermission === true && (
                    <p className="mt-4 text-center text-muted-foreground">Point your camera at a QR code</p>
                 )}
            </main>
        </div>
    );
}
