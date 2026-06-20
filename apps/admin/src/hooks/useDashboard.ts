import { useEffect, useState } from 'react';
import type { DashboardSummary } from '@cee/types';
import { dashboardService } from '@/services/dashboardService';

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    dashboardService
      .getSummary()
      .then((response) => {
        if (isMounted) {
          setSummary(response.data);
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

  return { summary, isLoading };
}
