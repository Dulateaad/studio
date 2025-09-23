"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getQuests, Quest } from "@/ai/flows/get-quests";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuestPage() {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchQuests() {
            try {
                const result = await getQuests();
                setQuests(result);
            } catch (error) {
                console.error("Failed to fetch quests:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchQuests();
    }, []);

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button asChild variant="outline" size="icon" className="h-8 w-8">
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Home</span>
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold">Quests</h1>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="mx-auto max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="w-6 h-6 text-primary" />
                                Start a Quest
                            </CardTitle>
                            <CardDescription>Scan a QR code at a location to begin an AR quest.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/scan">
                                    <QrCode className="mr-2" /> Scan QR Code
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <h2 className="text-2xl font-bold">Available Quests</h2>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full">
                            {quests.map((quest) => (
                                <AccordionItem key={quest.id} value={quest.id}>
                                    <AccordionTrigger className="text-lg">{quest.title}</AccordionTrigger>
                                    <AccordionContent>
                                        <p className="mb-4 text-muted-foreground">{quest.description}</p>
                                        <ul className="space-y-2">
                                            {quest.tasks.map((task) => (
                                                <li key={task.id} className="flex items-center gap-2 text-sm">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                    <span>{task.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </div>
            </main>
        </div>
    );
}
