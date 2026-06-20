import { useEffect, useState } from 'react';
import type { SalesReport } from '@cee/types';
import { salesService, type SalesDateRange } from '@/services/salesService';

export function useSales() {
  const [range, setRange] = useState<SalesDateRange>('month');
  const [report, setReport] = useState<SalesReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    salesService
      .getSalesReport(range)
      .then((response) => {
        if (isMounted) {
          setReport(response.data);
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
  }, [range]);

  return { report, isLoading, range, setRange };
}
