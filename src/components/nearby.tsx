"use client"

import { useState, useRef, useEffect } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { LocationWithCoordinates } from "@/app/page";
import { Map } from "./map"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { X, Loader2, Coffee, Landmark, Trees } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { findNearbyPlaces } from "@/ai/flows/find-nearby-places";
import type { Place } from "@/ai/flows/find-nearby-places";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";

interface NearbyProps {
  routeCoordinates: LocationWithCoordinates[];
}

const astanaBounds = {
    north: 51.3,
    south: 51.0,
    west: 71.2,
    east: 71.7,
};

const placeCategories = [
    { name: "Кафе", type: "cafe", icon: Coffee },
    { name: "Музеи", type: "museum", icon: Landmark },
    { name: "Парки", type: "park", icon: Trees },
]

export function Nearby({ routeCoordinates }: NearbyProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [calculatedRoute, setCalculatedRoute] = useState<{origin: string, destination: string} | null>(null);
  
  const [mapCenter, setMapCenter] = useState({ lat: 51.1694, lng: 71.4491 });
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  
  const [originAutocomplete, setOriginAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [destinationAutocomplete, setDestinationAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  
  const { toast } = useToast();

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
      setNearbyPlaces([]);
      setActiveCategory(null);
    }
  };

  const handleClearRoute = () => {
    setOrigin("");
    setDestination("");
    if(originRef.current) originRef.current.value = "";
    if(destinationRef.current) destinationRef.current.value = "";
    setCalculatedRoute(null);
  }

  const handleSearchNearby = async (placeType: string) => {
    setIsSearching(true);
    setActiveCategory(placeType);
    setCalculatedRoute(null);
    try {
        const places = await findNearbyPlaces({
            latitude: mapCenter.lat,
            longitude: mapCenter.lng,
            placeType: placeType,
        });
        setNearbyPlaces(places);
        if (places.length === 0) {
          toast({
            title: "Ничего не найдено",
            description: `Поблизости не найдено мест в категории "${placeType}". Попробуйте переместить карту.`,
          });
        }
    } catch (error) {
        console.error("Failed to find nearby places:", error);
        toast({
            variant: "destructive",
            title: "Ошибка поиска",
            description: "Не удалось найти ближайшие места."
        })
    } finally {
        setIsSearching(false);
    }
  }

  const onOriginLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setOriginAutocomplete(autocomplete);
  }

  const onDestinationLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setDestinationAutocomplete(autocomplete);
  }

  useEffect(() => {
    const options = {
        bounds: astanaBounds,
        strictBounds: true,
        componentRestrictions: { country: "KZ" },
    };
    if (originAutocomplete) {
        originAutocomplete.setOptions(options);
    }
    if (destinationAutocomplete) {
        destinationAutocomplete.setOptions(options);
    }
  }, [originAutocomplete, destinationAutocomplete]);

  const clearNearbySearch = () => {
    setNearbyPlaces([]);
    setActiveCategory(null);
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Построить маршрут</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-4">
                    <div className="flex flex-col gap-4">
                        {isLoaded && (
                            <>
                            <Autocomplete onLoad={onOriginLoad}>
                                <Input type="text" placeholder="Начальный адрес" ref={originRef} className="w-full" />
                            </Autocomplete>
                            <Autocomplete onLoad={onDestinationLoad}>
                                <Input type="text" placeholder="Конечный адрес" ref={destinationRef} className="w-full" />
                            </Autocomplete>
                            </>
                        )}
                    </div>
                     <div className="flex gap-2">
                          <Button onClick={handleCalculateRoute} className="w-full">Проложить маршрут</Button>
                          <Button variant="outline" size="icon" onClick={handleClearRoute} disabled={!calculatedRoute}>
                              <X className="h-4 w-4" />
                          </Button>
                     </div>
                </div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Искать рядом</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Нажмите на категорию для поиска мест в текущей области карты.</p>
                     <div className="grid grid-cols-3 gap-2">
                        {placeCategories.map(cat => (
                            <Button
                                key={cat.type}
                                variant={activeCategory === cat.type ? "default" : "outline"}
                                onClick={() => handleSearchNearby(cat.type)}
                                disabled={isSearching}
                                className="flex-col h-16"
                            >
                                <cat.icon className="h-5 w-5 mb-1" />
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                     {isSearching && (
                        <div className="flex items-center justify-center text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Поиск...</span>
                        </div>
                    )}
                    {nearbyPlaces.length > 0 && !isSearching && (
                         <div className="space-y-2">
                           <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={clearNearbySearch}>
                                <X className="mr-2 h-4 w-4"/>
                                Очистить поиск
                            </Button>
                            <ScrollArea className="h-48">
                                <ul className="space-y-1">
                                    {nearbyPlaces.map(place => (
                                        <li key={place.name} className="text-sm p-2 rounded-md hover:bg-muted">
                                            <p className="font-semibold">{place.name}</p>
                                            <p className="text-xs text-muted-foreground">{place.vicinity}</p>
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>
                         </div>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
      
      <div className="flex-1 h-96 md:h-[75vh]">
        <Card className="h-full w-full">
            {!isLoaded ? (
            <Skeleton className="w-full h-full" />
            ) : loadError ? (
            <div className="flex items-center justify-center h-full w-full bg-destructive/10 text-destructive p-4 text-center">
                <p>Не удалось загрузить карту. Пожалуйста, убедитесь, что **Directions API** и **Places API** включены для вашего ключа API в Google Cloud Console.</p>
            </div>
            ) : (
            <Map 
                isLoaded={isLoaded}
                routeCoordinates={calculatedRoute ? [] : routeCoordinates}
                origin={calculatedRoute?.origin}
                destination={calculatedRoute?.destination}
                nearbyPlaces={nearbyPlaces}
                onCenterChanged={setMapCenter}
            />
            )}
        </Card>
      </div>
    </div>
  )
}
