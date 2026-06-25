import { useMemo } from 'react';
import { useActiveSection } from '@/hooks/useActiveSection';

interface SectionAnchor {
  id: string;
  label: string;
}

interface SectionAnchorsProps {
  sections: SectionAnchor[];
  hidden?: boolean;
}

export function SectionAnchors({ sections, hidden }: SectionAnchorsProps) {
  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const activeId = useActiveSection(ids);

  return (
    <nav
      aria-label="Navegación de secciones"
      className={`section-anchors fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 transition-opacity duration-300 lg:flex ${
        hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {sections.map((section) => {
        const isActive = section.id === activeId;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-label={section.label}
            aria-current={isActive ? 'true' : undefined}
            className={`group relative flex items-center justify-end`}
          >
            <span
              className={`pointer-events-none absolute right-5 whitespace-nowrap rounded-md bg-foreground/90 px-2 py-1 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100`}
            >
              {section.label}
            </span>
            <span
              className={`h-2.5 w-2.5 rounded-full border-2 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                isActive
                  ? 'scale-125 border-cee-red bg-cee-red'
                  : 'border-muted-foreground/50 bg-transparent group-hover:border-cee-red'
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
