"use client"

import { Route as RouteIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Map } from "./map";
import { LocationWithCoordinates } from "@/app/page";
import { useJsApiLoader } from "@react-google-maps/api";
import { Skeleton } from "./ui/skeleton";

interface RouteProps {
    route: string;
    routeCoordinates: LocationWithCoordinates[];
}

export function Route({ route, routeCoordinates }: RouteProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places'],
  });

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <RouteIcon className="w-6 h-6 text-primary" />
                    Ваш сгенерированный план
                </CardTitle>
                <CardDescription>Это ваш последний сгенерированный маршрут. Вы можете создать новый в вкладке "Спланировать".</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {route && (
                    <div className="space-y-2 text-sm text-foreground">
                        {route.split('\n').filter(p => p.trim() !== "").map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                )}
                
                <Card className="h-96 md:h-[60vh]">
                     {!isLoaded ? (
                        <Skeleton className="w-full h-full" />
                        ) : loadError ? (
                        <div className="flex items-center justify-center h-full w-full bg-destructive/10 text-destructive p-4 text-center">
                            <p>Не удалось загрузить карту. Пожалуйста, проверьте ваш ключ API Google Maps и убедитесь, что он действителен.</p>
                        </div>
                        ) : (
                        <Map isLoaded={isLoaded} routeCoordinates={routeCoordinates} />
                        )}
                </Card>

                {!route && (
                    <p className="text-muted-foreground">Вы еще не сгенерировали маршрут. Перейдите на вкладку "Спланировать", чтобы начать.</p>
                )}
            </CardContent>
        </Card>
    </div>
  )
}
