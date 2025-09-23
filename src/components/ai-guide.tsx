"use client"

import { useState, useRef, useEffect } from "react"
import { Languages, Send, BookText } from "lucide-react"

import type { Persona } from "./settings"
import { generateAvatarResponse } from "@/ai/flows/generate-avatar-response"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "./ui/scroll-area"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { aiAvatarImage } from "@/lib/data"

type Message = {
  role: "user" | "assistant";
  content: string;
  citations?: any[];
}

const personaIntros = {
  formal: "Greetings. I am your digital guide. How may I be of assistance?",
  friendly: "Hey there! I'm your friendly AI guide for Astana. What can I help you with today?",
  humorous: "Alright, let's get this show on the road! Your wish is my command... as long as it's about Astana. What's the plan?",
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
  const videoRef = useRef<HTMLVideoElement>(null);

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

    useEffect(() => {
        if (isLoading && videoRef.current) {
            videoRef.current.play().catch(error => console.error("Video play failed:", error));
        }
    }, [isLoading]);

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
      const assistantMessage: Message = { role: "assistant", content: result.response, citations: result.citations };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to get avatar response:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "The AI guide is currently unavailable.",
      })
      // We don't remove the user message on failure anymore
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[80vh] max-h-[800px] rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Avatar Section - Top Half */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 border-b relative bg-muted/20">
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <Languages className="h-5 w-5 text-muted-foreground" />
          <Select value={language} onValueChange={(value: "English" | "Russian" | "Kazakh") => setLanguage(value)}>
            <SelectTrigger className="w-[120px] bg-background">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Russian">Russian</SelectItem>
              <SelectItem value="Kazakh">Kazakh</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-48 h-48 md:w-64 md:h-64">
                 <Avatar className="w-full h-full border-4 border-primary shadow-lg">
                    {isLoading ? (
                        <video
                            ref={videoRef}
                            src="/talking_avatar.mp4"
                            className="aspect-square h-full w-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                        />
                    ) : (
                        <AvatarImage src={aiAvatarImage.imageUrl} data-ai-hint={aiAvatarImage.imageHint} />
                    )}
                    <AvatarFallback>BG</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-2 right-2 block h-5 w-5 rounded-full bg-green-500 border-2 border-card ring-2 ring-green-500" />
            </div>
        </div>
        <div className="mt-2 text-center">
          <h2 className="font-bold font-headline text-xl">Baiterek Guide</h2>
          <p className="text-sm text-muted-foreground capitalize">{persona} Mode</p>
        </div>
      </div>

      {/* Chat Section - Bottom Half */}
      <div className="flex-1 flex flex-col bg-background">
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
                    <AvatarImage src={aiAvatarImage.imageUrl} />
                    <AvatarFallback>BG</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-md rounded-lg px-4 py-2 shadow-sm relative group",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.citations && message.citations.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          <BookText className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">Citations</h4>
                            <div className="text-sm text-muted-foreground space-y-2">
                              {message.citations.map((citation, i) => (
                                <div key={i} className="truncate">
                                  <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{citation.title}</a>
                                  <p>{citation.text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-3 justify-start">
                <Avatar className="h-8 w-8 self-start flex-shrink-0">
                  <AvatarImage src={aiAvatarImage.imageUrl} />
                  <AvatarFallback>BG</AvatarFallback>
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
              placeholder="Ask about attractions, routes, or events in Astana..."
              disabled={isLoading}
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
