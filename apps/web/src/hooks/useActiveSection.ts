import { useEffect, useRef, useState } from 'react';

/** Observa una lista de IDs de sección y devuelve el más visible en viewport. */
export function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '');
  // Estabilizamos la dependencia: JSON.stringify solo cambia si los IDs cambian de verdad
  const key = JSON.stringify(sectionIds);
  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    const ids: string[] = JSON.parse(keyRef.current);

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      { threshold: [0.3, 0.5, 0.7], rootMargin: '-10% 0px -10% 0px' },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return activeId;
}
