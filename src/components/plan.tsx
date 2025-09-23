"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Sparkles } from "lucide-react"

import { providePersonalizedRecommendation } from "@/ai/flows/provide-personalized-recommendation"
import { getRouteCoordinates } from "@/ai/flows/get-route-coordinates"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "./ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dispatch, SetStateAction, useState } from "react"
import { LocationWithCoordinates } from "@/app/page"

const formSchema = z.object({
  userPreferences: z.string().min(10, { message: "Please describe your preferences in more detail." }),
  realTimeData: z.string().min(5, { message: "Please provide some real-time context." }),
})

interface PlanProps {
    setRoute: Dispatch<SetStateAction<string>>;
    setRouteCoordinates: Dispatch<SetStateAction<LocationWithCoordinates[]>>;
    setActiveTab: Dispatch<SetStateAction<string>>;
}

export function Plan({ setRoute, setRouteCoordinates, setActiveTab }: PlanProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userPreferences: "",
      realTimeData: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRoute("");
    setRouteCoordinates([]);
    try {
      // 1. Get the text-based route recommendation
      const result = await providePersonalizedRecommendation(values);
      const routeText = result.recommendations;
      setRoute(routeText);
      
      toast({
        title: "Route Generated!",
        description: "Your personalized route is ready. Now plotting it on the map.",
      });

      // 2. Get the coordinates for the route
      const coordsResult = await getRouteCoordinates({ route: routeText });
      setRouteCoordinates(coordsResult.locations);

       toast({
        title: "Map Updated!",
        description: "Your route has been plotted. Check the 'План' tab.",
      });

      // 3. Switch to the "Route" tab to show the result
      setActiveTab("route");

    } catch (error) {
      console.error("Failed to get recommendations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate a route. Please try again.",
      })
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    Спланировать поездку
                </CardTitle>
                <CardDescription>Расскажите нам о своих предпочтениях, и мы предложим идеальный маршрут.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name="userPreferences"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Интересы, бюджет, нагрузка</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="например, 'Я люблю историю, тихие места и хороший кофе. Я не поклонник людных туристических мест.'"
                                        {...field}
                                        rows={4}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                         <FormField
                        control={form.control}
                        name="realTimeData"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Дополнительные параметры</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="например, 'Сегодня солнечный день, и у меня есть 3 часа свободного времени.'"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Генерация..." : "Generate Route"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  )
}
