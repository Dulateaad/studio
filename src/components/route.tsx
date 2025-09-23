"use client"

import { Route as RouteIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface RouteProps {
    route: string;
}

export function Route({ route }: RouteProps) {
  // In a real app, you would fetch the latest route from Firestore here using SWR
  // const { data: route, error } = useSWR('userRoutes', fetcher);
  // if (error) return <div>Failed to load route</div>;
  // if (!route) return <div>Loading...</div>;

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
            <CardContent>
                {route ? (
                    <div className="space-y-2 text-sm text-foreground">
                        {route.split('\n').filter(p => p.trim() !== "").map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">Вы еще не сгенерировали маршрут. Перейдите на вкладку "Спланировать", чтобы начать.</p>
                )}
            </CardContent>
        </Card>
    </div>
  )
}
