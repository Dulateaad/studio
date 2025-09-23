"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import type { Persona } from "@/app/page"
import { AiGuide } from "@/components/ai-guide"
import { Settings } from "@/components/settings"
import { Button } from "@/components/ui/button"

export default function GuidePage() {
  const [persona, setPersona] = useState<Persona>("friendly");

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Button asChild variant="outline" size="icon" className="h-8 w-8">
            <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Home</span>
            </Link>
        </Button>
      </header>
      <main className="flex-1 flex md:flex-row flex-col gap-8 p-4 md:p-6">
        <div className="md:w-1/3 lg:w-1/4">
          <Settings persona={persona} setPersona={setPersona} />
        </div>
        <div className="flex-1 h-[calc(100vh-120px)] md:h-auto">
          <AiGuide persona={persona} />
        </div>
      </main>
    </div>
  )
}
