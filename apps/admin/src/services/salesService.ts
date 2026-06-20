import type { ApiResponse, SalesReport } from '@cee/types';
import { mockSalesReports } from '@/mocks/sales';

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/**
 * Filtro de rango de fechas del selector de Ventas. No vive en @cee/types
 * porque es un parámetro de UI (qué ventana mostrar), no un contrato de
 * respuesta de backend — mismo criterio que CourseFormInput en coursesService.
 */
export type SalesDateRange = 'week' | 'month' | 'quarter';

export const salesService = {
  async getSalesReport(range: SalesDateRange = 'month'): Promise<ApiResponse<SalesReport>> {
    // Fase 5: panel admin trabaja 100% sobre mocks (sin backend real hasta Fase 6).
    return delay({ data: mockSalesReports[range] });
  },
};
