import { useEffect, useState } from 'react';

let listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function startSharedInterval() {
  if (intervalId !== null) return;
  intervalId = setInterval(() => {
    listeners.forEach((listener) => listener());
  }, 1000);
}

function stopSharedInterval() {
  if (intervalId === null) return;
  clearInterval(intervalId);
  intervalId = null;
}

/**
 * Tick de 1s compartido entre todos los `CourseCountdown` en pantalla:
 * un solo `setInterval` para toda la app en vez de uno por componente.
 */
export function useGlobalSecondTick() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((n) => n + 1);
    listeners.add(listener);
    startSharedInterval();

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        stopSharedInterval();
      }
    };
  }, []);
}
