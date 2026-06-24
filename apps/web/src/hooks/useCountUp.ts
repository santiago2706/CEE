import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Anima un contador de 0 al valor numérico extraído de `value` (ej. "15,000+" -> 15000). */
export function useCountUp(value: string) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const match = value.match(/[\d,.]+/);
    const target = match ? Number(match[0].replace(/,/g, '')) : null;
    const suffix = match ? value.slice(match.index! + match[0].length) : '';

    if (target === null || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = value;
      return;
    }

    const counter = { n: 0 };
    const tween = gsap.to(counter, {
      n: target,
      duration: 1.2,
      ease: 'power1.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => {
        el.textContent = Math.round(counter.n).toLocaleString('es-PE') + suffix;
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value]);

  return ref;
}
