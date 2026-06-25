import { useEffect, useRef } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { gsap } from 'gsap';

/** Fade + slide sutil al cambiar de ruta. Respeta `prefers-reduced-motion`. */
export function PageTransition() {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo(0, 0);
      return;
    }

    window.scrollTo(0, 0);

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
    );

    return () => {
      tween.kill();
    };
  }, [pathname]);

  return <div ref={containerRef}>{outlet}</div>;
}
