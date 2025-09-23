"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import { Compass, MapPin, Quote, VenetianMask } from "lucide-react"

import { streetsSpeakMode } from "@/ai/flows/streets-speak-mode"
import { attractions } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "./ui/skeleton"
import { Map } from "./map"

const formSchema = z.object({
  location: z.string().min(3, { message: "Location must be at least 3 characters." }),
})

export function Explore() {
  const [streetsSpeakResult, setStreetsSpeakResult] = useState<{ voice: string; persona: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setStreetsSpeakResult(null);
    try {
      const result = await streetsSpeakMode({ location: values.location });
      setStreetsSpeakResult(result);
    } catch (error) {
      console.error("Failed to activate Streets Speak mode:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not get historical persona for this location.",
      })
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
              <Compass className="w-7 h-7" />
              Explore Astana
          </h2>
          <p className="text-muted-foreground">Discover popular attractions and hidden gems around the city.</p>
      </div>
      
      <Card className="h-96">
        <Map />
      </Card>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((attraction) => (
            <Card key={attraction.id} className="overflow-hidden flex flex-col group hover:shadow-lg transition-shadow duration-300">
              <div className="relative w-full h-48">
                <Image
                  src={attraction.image.imageUrl}
                  alt={attraction.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  data-ai-hint={attraction.image.imageHint}
                  className="group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <CardTitle>{attraction.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm">{attraction.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><VenetianMask className="w-6 h-6" />"Streets Speak" Mode</CardTitle>
          <CardDescription>Enter a location to hear from a historical figure or local character associated with it.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="e.g., Panfilov Park" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Summoning Spirit..." : "Awaken the Past"}
              </Button>
            </form>
          </Form>

          {isLoading && (
            <div className="mt-6 space-y-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {streetsSpeakResult && (
            <div className="mt-6 rounded-lg border bg-stone-50 dark:bg-stone-900 p-4 space-y-3">
                <p className="text-sm font-semibold text-primary">Voice: {streetsSpeakResult.voice}</p>
                <div className="flex items-start gap-3">
                    <Quote className="w-8 h-8 text-muted-foreground flex-shrink-0 -mt-1" />
                    <p className="text-foreground italic">{streetsSpeakResult.persona}</p>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
