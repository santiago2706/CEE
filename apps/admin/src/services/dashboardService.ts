import type { ApiResponse, DashboardSummary } from '@cee/types';
import { mockDashboardSummary } from '@/mocks/dashboard';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const dashboardService = {
  async getSummary(): Promise<ApiResponse<DashboardSummary>> {
    // Fase 5: panel admin trabaja 100% sobre mocks (sin backend real hasta Fase 6).
    return delay({ data: mockDashboardSummary });
  },
};
