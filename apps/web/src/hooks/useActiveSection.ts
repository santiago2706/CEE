import { useEffect, useRef, useState } from 'react';

/** Devuelve el ID de la sección que ocupa más espacio visible en el viewport.
 *  Usa un listener de `scroll` en lugar de IntersectionObserver porque
 *  con `scroll-snap` el navegador puede saltar frames y no disparar los callbacks. */
export function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '');
  // Referencia estable: no provoca que el effect se re-ejecute en cada render
  const key = JSON.stringify(sectionIds);
  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    const ids: string[] = JSON.parse(keyRef.current);

    function getMostVisible(): string | null {
      let bestId: string | null = null;
      let minDistance = Infinity;
      // El punto objetivo es justo debajo del navbar (aprox 64px + margen)
      const TARGET_Y = 100;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        
        // Si el punto objetivo está dentro de esta sección, es la activa
        if (rect.top <= TARGET_Y && rect.bottom > TARGET_Y) {
          return id;
        }

        // Fallback: si ninguna cubre el punto, buscamos la que tenga su borde superior más cerca
        const dist = Math.abs(rect.top - TARGET_Y);
        if (dist < minDistance) {
          minDistance = dist;
          bestId = id;
        }
      }
      return bestId;
    }

    function handleScroll() {
      const found = getMostVisible();
      if (found) setActiveId(found);
    }

    // Llamada inicial para establecer el estado correcto desde el primer render
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return activeId;
}
