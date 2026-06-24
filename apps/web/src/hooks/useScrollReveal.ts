import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealOptions {
  /** Selector de los hijos a animar; si se omite, anima el propio contenedor. */
  selector?: string;
  y?: number;
  stagger?: number;
  duration?: number;
}

/** Fade + slide sutil al entrar en viewport. Respeta prefers-reduced-motion. */
export function useScrollReveal<T extends HTMLElement>({
  selector,
  y = 24,
  stagger = 0.08,
  duration = 0.6,
}: ScrollRevealOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const targets = selector ? container.querySelectorAll(selector) : container;

    const tween = gsap.fromTo(
      targets,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          once: true,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [selector, y, stagger, duration]);

  return ref;
}
