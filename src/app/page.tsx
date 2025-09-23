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
    <div className="flex flex-col h-screen">
      <main className="container mx-auto p-4 md:p-8 flex-grow overflow-y-auto mb-16 md:mb-0">
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
            AlmaGuide AI
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
            Your personal AI companion for exploring Almaty. Get recommendations, embark on quests, and chat with your guide in multiple languages.
          </p>
        </div>

        <Tabs defaultValue="guide" className="w-full">
          <TabsList className="hidden md:grid w-full grid-cols-5 h-12">
            <TabsTrigger value="guide"><Bot className="mr-2 h-4 w-4" />AI Guide</TabsTrigger>
            <TabsTrigger value="recommendations"><Sparkles className="mr-2 h-4 w-4" />Recommendations</TabsTrigger>
            <TabsTrigger value="quests"><ScrollText className="mr-2 h-4 w-4" />Quests</TabsTrigger>
            <TabsTrigger value="explore"><Compass className="mr-2 h-4 w-4" />Explore</TabsTrigger>
            <TabsTrigger value="settings"><SettingsIcon className="mr-2 h-4 w-4" />Settings</TabsTrigger>
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

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-t-lg z-50">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="guide" className="py-2.5 flex-col h-auto gap-1">
                <Bot className="h-5 w-5" />
                <span className="text-xs">Guide</span>
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="py-2.5 flex-col h-auto gap-1">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs">For You</span>
              </TabsTrigger>
              <TabsTrigger value="quests" className="py-2.5 flex-col h-auto gap-1">
                <ScrollText className="h-5 w-5" />
                <span className="text-xs">Quests</span>
              </TabsTrigger>
              <TabsTrigger value="explore" className="py-2.5 flex-col h-auto gap-1">
                <Compass className="h-5 w-5" />
                <span className="text-xs">Explore</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="py-2.5 flex-col h-auto gap-1">
                <SettingsIcon className="h-5 w-5" />
                <span className="text-xs">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
