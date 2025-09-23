"use client";

import type { Dispatch, SetStateAction } from 'react';
import { changeAvatarPersona } from '@/ai/flows/change-avatar-persona';
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Users } from 'lucide-react';

export type Persona = "formal" | "friendly" | "humorous";

interface SettingsProps {
  persona: Persona;
  setPersona: Dispatch<SetStateAction<Persona>>;
}

export function Settings({ persona, setPersona }: SettingsProps) {
  const { toast } = useToast()

  const handlePersonaChange = async (newPersona: Persona) => {
    setPersona(newPersona);
    try {
      const result = await changeAvatarPersona({ persona: newPersona });
      toast({
        title: "Persona Updated",
        description: result.message,
      })
    } catch (error) {
      console.error("Failed to change persona:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update avatar persona.",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          Avatar Persona
        </CardTitle>
        <CardDescription>
          Choose the communication style for your AI guide.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={persona}
          onValueChange={(value: Persona) => handlePersonaChange(value)}
          className="gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="formal" id="formal" />
            <Label htmlFor="formal" className="font-normal text-base cursor-pointer">Formal</Label>
          </div>
          <p className="text-sm text-muted-foreground ml-6 -mt-2">Professional and direct communication.</p>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="friendly" id="friendly" />
            <Label htmlFor="friendly" className="font-normal text-base cursor-pointer">Friendly</Label>
          </div>
          <p className="text-sm text-muted-foreground ml-6 -mt-2">Warm, approachable, and conversational.</p>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="humorous" id="humorous" />
            <Label htmlFor="humorous" className="font-normal text-base cursor-pointer">Humorous</Label>
          </div>
          <p className="text-sm text-muted-foreground ml-6 -mt-2">Engaging with witty remarks and jokes.</p>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
