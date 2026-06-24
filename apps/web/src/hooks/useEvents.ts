import { useEffect, useState } from 'react';
import type { EventSlide } from '@cee/types';
import { eventsService } from '@/services/events.service';

export function useEvents() {
  const [events, setEvents] = useState<EventSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    eventsService
      .getAll()
      .then((data) => {
        if (isMounted) {
          setEvents(data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { events, isLoading };
}
