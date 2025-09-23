"use client"

import { useState } from "react"
import Link from "next/link"
import { Map, Pin, Route as RouteIcon, Sparkles, QrCode } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plan } from "@/components/plan"
import { Route } from "@/components/route"
import { Nearby } from "@/components/nearby"
import { Button } from "@/components/ui/button"

export type Persona = "formal" | "friendly" | "humorous";

export default function Home() {
  const [route, setRoute] = useState<string>("");

  return (
    <div className="flex flex-col md:flex-row h-screen bg-muted/40">
      <main className="container mx-auto p-4 md:p-8 flex-grow overflow-y-auto mb-16 md:mb-0">
        <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col items-start">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
                    Baiterek Guide
                </h1>
                <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
                    Your personal AI companion for exploring Astana.
                </p>
            </div>
             <div className="hidden md:block">
                <Button asChild>
                    <Link href="/guide">
                        <Pin className="mr-2 h-4 w-4" />
                        AI Guide
                    </Link>
                </Button>
            </div>
        </div>


        <Tabs defaultValue="plan" className="w-full">
          <TabsList className="hidden md:grid w-full grid-cols-4 h-12">
            <TabsTrigger value="plan"><Sparkles className="mr-2 h-4 w-4" />Спланировать</TabsTrigger>
            <TabsTrigger value="route"><RouteIcon className="mr-2 h-4 w-4" />План</TabsTrigger>
            <TabsTrigger value="nearby"><Map className="mr-2 h-4 w-4" />Рядом</TabsTrigger>
            <TabsTrigger value="quest" asChild><Link href="/quest"><QrCode className="mr-2 h-4 w-4" />Квесты</Link></TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="mt-6">
            <Plan setRoute={setRoute} />
          </TabsContent>
          <TabsContent value="route" className="mt-6">
            <Route route={route} />
          </TabsContent>
          <TabsContent value="nearby" className="mt-6">
            <Nearby />
          </TabsContent>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-t-lg z-50">
                <TabsList className="grid w-full grid-cols-5 h-auto">
                    <TabsTrigger value="plan" className="py-2.5 flex-col h-auto gap-1">
                        <Sparkles className="h-5 w-5" />
                        <span className="text-xs">Спланировать</span>
                    </TabsTrigger>
                    <TabsTrigger value="route" className="py-2.5 flex-col h-auto gap-1">
                        <RouteIcon className="h-5 w-5" />
                        <span className="text-xs">План</span>
                    </TabsTrigger>
                    <TabsTrigger value="nearby" className="py-2.5 flex-col h-auto gap-1">
                        <Map className="h-5 w-5" />
                        <span className="text-xs">Рядом</span>
                    </TabsTrigger>
                     <Button variant="ghost" className="flex-col h-auto gap-1 text-muted-foreground py-2.5" asChild>
                        <Link href="/quest">
                            <QrCode className="h-5 w-5" />
                            <span className="text-xs">Квесты</span>
                        </Link>
                    </Button>
                     <Button variant="ghost" className="flex-col h-auto gap-1 text-muted-foreground py-2.5" asChild>
                        <Link href="/guide">
                            <Pin className="h-5 w-5" />
                            <span className="text-xs">Гид</span>
                        </Link>
                    </Button>
                </TabsList>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
