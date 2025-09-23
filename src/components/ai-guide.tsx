"use client"

import { useState, useRef, useEffect } from "react"
import { Languages, Send } from "lucide-react"

import type { Persona } from "./settings"
import { generateAvatarResponse } from "@/ai/flows/generate-avatar-response"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "./ui/scroll-area"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

type Message = {
  role: "user" | "assistant";
  content: string;
}

const personaIntros = {
  formal: "Greetings. I am your digital guide. How may I be of assistance?",
  friendly: "Hey there! I'm your friendly AI guide. What's on your mind?",
  humorous: "Alright, let's get this show on the road! Your wish is my command... within reason. What can I do for you?",
}

interface AiGuideProps {
  persona: Persona;
}

export function AiGuide({ persona }: AiGuideProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: personaIntros[persona] }
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"English" | "Russian" | "Kazakh">("English");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: "assistant", content: personaIntros[persona] }]);
  }, [persona]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.children[0] as HTMLElement;
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await generateAvatarResponse({
        query: input,
        preferredLanguage: language,
      });
      const assistantMessage: Message = { role: "assistant", content: result.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to get avatar response:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "The AI guide is currently unavailable.",
      })
      setMessages(prev => prev.filter(m => m !== userMessage));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[70vh] max-h-[700px] rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-primary">
                        <AvatarImage src="https://picsum.photos/seed/avatar/100/100" data-ai-hint="robot woman" />
                        <AvatarFallback>AG</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-card ring-2 ring-green-500" />
                </div>
                <div>
                    <h2 className="font-bold font-headline text-lg">AlmaGuide AI</h2>
                    <p className="text-sm text-muted-foreground capitalize">{persona} Mode</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-muted-foreground" />
                <Select value={language} onValueChange={(value: "English" | "Russian" | "Kazakh") => setLanguage(value)}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Russian">Russian</SelectItem>
                        <SelectItem value="Kazakh">Kazakh</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-6">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={cn(
                            "flex items-end gap-3",
                            message.role === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                         {message.role === "assistant" && (
                            <Avatar className="h-8 w-8 self-start flex-shrink-0">
                                <AvatarImage src="https://picsum.photos/seed/avatar/100/100" />
                                <AvatarFallback>AG</AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={cn(
                                "max-w-md rounded-lg px-4 py-2 shadow-sm",
                                message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                        >
                            <p className="text-sm">{message.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-3 justify-start">
                         <Avatar className="h-8 w-8 self-start flex-shrink-0">
                            <AvatarImage src="https://picsum.photos/seed/avatar/100/100" />
                            <AvatarFallback>AG</AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]" />
                                <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]" />
                                <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
        <div className="p-4 border-t bg-card">
            <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about attractions, routes, or events..."
                    disabled={isLoading}
                    autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                    <Send className="h-5 w-5" />
                </Button>
            </form>
        </div>
    </div>
  )
}
