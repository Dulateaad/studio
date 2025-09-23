"use client"

import { useState, useRef } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { LocationWithCoordinates } from "@/app/page";
import { Map } from "./map"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

interface NearbyProps {
  routeCoordinates: LocationWithCoordinates[];
}

export function Nearby({ routeCoordinates }: NearbyProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [calculatedRoute, setCalculatedRoute] = useState<{origin: string, destination: string} | null>(null);

  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places'],
  });

  const handleCalculateRoute = () => {
    if (originRef.current && destinationRef.current) {
      setOrigin(originRef.current.value);
      setDestination(destinationRef.current.value);
      setCalculatedRoute({origin: originRef.current.value, destination: destinationRef.current.value});
    }
  };

  const handleClearRoute = () => {
    setOrigin("");
    setDestination("");
    if(originRef.current) originRef.current.value = "";
    if(destinationRef.current) destinationRef.current.value = "";
    setCalculatedRoute(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
              Места рядом
          </h2>
          <p className="text-muted-foreground">Используйте карту для поиска мест и построения маршрутов.</p>
      </div>

       {isLoaded && (
          <Card>
              <CardContent className="pt-6">
                  <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-4">
                          <Autocomplete>
                              <Input type="text" placeholder="Начальный адрес" ref={originRef} className="w-full md:w-auto flex-grow" />
                          </Autocomplete>
                          <Autocomplete>
                              <Input type="text" placeholder="Конечный адрес" ref={destinationRef} className="w-full md:w-auto flex-grow" />
                          </Autocomplete>
                      </div>
                       <div className="flex gap-2">
                            <Button onClick={handleCalculateRoute}>Проложить маршрут</Button>
                            <Button variant="outline" onClick={handleClearRoute} disabled={!calculatedRoute}>
                                <X className="mr-2 h-4 w-4" />
                                Очистить
                            </Button>
                       </div>
                  </div>
              </CardContent>
          </Card>
      )}
      
      <Card className="h-96 md:h-[60vh]">
        {!isLoaded ? (
          <Skeleton className="w-full h-full" />
        ) : loadError ? (
          <div className="flex items-center justify-center h-full w-full bg-destructive/10 text-destructive p-4 text-center">
            <p>Не удалось загрузить карту. Пожалуйста, проверьте ваш ключ API Google Maps и убедитесь, что он действителен.</p>
          </div>
        ) : (
          <Map 
              isLoaded={isLoaded}
              routeCoordinates={calculatedRoute ? [] : routeCoordinates}
              origin={calculatedRoute?.origin}
              destination={calculatedRoute?.destination} 
          />
        )}
      </Card>
    </div>
  )
}
