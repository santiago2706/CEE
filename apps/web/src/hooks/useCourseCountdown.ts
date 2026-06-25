import { useGlobalSecondTick } from '@/hooks/useGlobalSecondTick';

export interface CourseCountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  hasStarted: boolean;
}

function getCountdown(startDate: string): CourseCountdownValue {
  const diffMs = new Date(`${startDate}T00:00:00`).getTime() - Date.now();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, hasStarted: true };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    hasStarted: false,
  };
}

/** Cuenta regresiva hasta `startDate`, recalculada en el tick global compartido. */
export function useCourseCountdown(startDate: string): CourseCountdownValue {
  useGlobalSecondTick();
  return getCountdown(startDate);
}
