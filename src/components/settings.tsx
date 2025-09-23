"use client"

import { Dispatch, SetStateAction } from "react"
import { Smile, Briefcase, Drama } from "lucide-react"

import { changeAvatarPersona } from "@/ai/flows/change-avatar-persona"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import type { Persona } from "@/app/page"

interface SettingsProps {
  persona: Persona;
  setPersona: Dispatch<SetStateAction<Persona>>;
}

export function Settings({ persona, setPersona }: SettingsProps) {
  const { toast } = useToast();

  const handlePersonaChange = async (newPersona: Persona) => {
    setPersona(newPersona);
    try {
      const result = await changeAvatarPersona({ persona: newPersona });
      toast({
        title: "Persona Updated",
        description: result.message,
      });
    } catch (error) {
      console.error("Failed to change persona:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update the avatar's persona.",
      });
      // Revert UI change on failure
      setPersona(persona);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Guide Persona</CardTitle>
        <CardDescription>
          Choose the communication style of your AI guide.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={persona}
          onValueChange={(value: Persona) => handlePersonaChange(value)}
          className="grid grid-cols-3 gap-4"
        >
          <div>
            <RadioGroupItem value="friendly" id="friendly" className="peer sr-only" />
            <Label
              htmlFor="friendly"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Smile className="mb-3 h-6 w-6" />
              Friendly
            </Label>
          </div>
          <div>
            <RadioGroupItem value="formal" id="formal" className="peer sr-only" />
            <Label
              htmlFor="formal"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Briefcase className="mb-3 h-6 w-6" />
              Formal
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="humorous"
              id="humorous"
              className="peer sr-only"
            />
            <Label
              htmlFor="humorous"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Drama className="mb-3 h-6 w-6" />
              Humorous
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
