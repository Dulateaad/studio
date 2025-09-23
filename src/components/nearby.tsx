"use client"

import { LocationWithCoordinates } from "@/app/page";
import { Map } from "./map"
import { Card } from "./ui/card"

interface NearbyProps {
  routeCoordinates: LocationWithCoordinates[];
}

export function Nearby({ routeCoordinates }: NearbyProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
              Места рядом
          </h2>
          <p className="text-muted-foreground">Используйте карту для поиска мест и построения маршрутов.</p>
      </div>
      
      <Card className="h-96 md:h-[60vh]">
        <Map routeCoordinates={routeCoordinates} />
      </Card>

      {/* We can add search and routing controls here later */}
    </div>
  )
}
