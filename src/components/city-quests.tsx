import { quests } from "@/lib/data"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollText } from "lucide-react"

export function CityQuests() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
            <ScrollText className="w-7 h-7" />
            Interactive City Quests
        </h2>
        <p className="text-muted-foreground">Engage with the city through fun challenges and tasks.</p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {quests.map((quest) => (
          <AccordionItem value={quest.id} key={quest.id} className="bg-card rounded-lg px-4 shadow-sm mb-4">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              {quest.title}
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p className="text-muted-foreground">{quest.description}</p>
              <div className="space-y-3">
                <h4 className="font-medium">Tasks:</h4>
                {quest.tasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <Checkbox id={`${quest.id}-${task.id}`} />
                    <Label htmlFor={`${quest.id}-${task.id}`} className="text-sm font-normal cursor-pointer">
                      {task.text}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
