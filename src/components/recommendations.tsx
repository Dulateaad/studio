"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Sparkles } from "lucide-react"

import { providePersonalizedRecommendation } from "@/ai/flows/provide-personalized-recommendation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "./ui/input"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "./ui/skeleton"

const formSchema = z.object({
  userPreferences: z.string().min(10, { message: "Please describe your preferences in more detail." }),
  realTimeData: z.string().min(5, { message: "Please provide some real-time context." }),
})

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<string>("");
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
    setRecommendations("");
    try {
      const result = await providePersonalizedRecommendation(values);
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate personalized recommendations.",
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
                    Personalized Recommendations
                </CardTitle>
                <CardDescription>Tell us what you like, and we'll suggest the perfect itinerary for you.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name="userPreferences"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Preferences</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g., 'I love history, quiet places, and good coffee. I'm not a fan of crowded tourist spots.'"
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
                                <FormLabel>Current Situation</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., 'It's a sunny afternoon, and I have 3 hours to spare.'"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Generating..." : "Get Recommendations"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        
        {isLoading && (
            <Card>
                <CardHeader>
                    <CardTitle>Your Personalized Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
            </Card>
        )}

        {recommendations && (
            <Card>
                <CardHeader>
                    <CardTitle>Your Personalized Plan</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-foreground">
                        {recommendations.split('\n').filter(p => p.trim() !== "").map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  )
}
