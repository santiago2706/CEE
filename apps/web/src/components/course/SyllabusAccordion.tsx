import type { SyllabusModule } from '@cee/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface SyllabusAccordionProps {
  modules: SyllabusModule[];
}

export function SyllabusAccordion({ modules }: SyllabusAccordionProps) {
  const totalTopics = modules.reduce((sum, module) => sum + module.topics.length, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
        <span>{modules.length} módulos</span>
        <span>{totalTopics} temas en total</span>
      </div>

      <Accordion type="single" collapsible className="w-full px-4">
        {modules.map((module) => (
          <AccordionItem key={module.id} value={module.id}>
            <AccordionTrigger className="font-semibold">{module.title}</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
                {module.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
