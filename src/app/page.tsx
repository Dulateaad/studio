"use client"

import { useState } from "react"
import { Bot, Compass, ScrollText, Settings as SettingsIcon, Sparkles } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AiGuide } from "@/components/ai-guide"
import type { Persona } from "@/components/settings"
import { Settings } from "@/components/settings"
import { Recommendations } from "@/components/recommendations"
import { CityQuests } from "@/components/city-quests"
import { Explore } from "@/components/explore"

export default function Home() {
  const [persona, setPersona] = useState<Persona>("friendly");

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
          AlmaGuide AI
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
          Your personal AI companion for exploring Almaty. Get recommendations, embark on quests, and chat with your guide in multiple languages.
        </p>
      </div>

      <Tabs defaultValue="guide" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto md:h-12">
          <TabsTrigger value="guide" className="py-2.5 md:py-0"><Bot className="mr-2 h-4 w-4" />AI Guide</TabsTrigger>
          <TabsTrigger value="recommendations" className="py-2.5 md:py-0"><Sparkles className="mr-2 h-4 w-4" />Recommendations</TabsTrigger>
          <TabsTrigger value="quests" className="py-2.5 md:py-0"><ScrollText className="mr-2 h-4 w-4" />Quests</TabsTrigger>
          <TabsTrigger value="explore" className="py-2.5 md:py-0"><Compass className="mr-2 h-4 w-4" />Explore</TabsTrigger>
          <TabsTrigger value="settings" className="py-2.5 md:py-0"><SettingsIcon className="mr-2 h-4 w-4" />Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="guide" className="mt-6">
          <AiGuide persona={persona} />
        </TabsContent>
        <TabsContent value="recommendations" className="mt-6">
            <Recommendations />
        </TabsContent>
        <TabsContent value="quests" className="mt-6">
            <CityQuests />
        </TabsContent>
        <TabsContent value="explore" className="mt-6">
            <Explore />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
            <div className="max-w-2xl mx-auto">
                <Settings persona={persona} setPersona={setPersona} />
            </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
