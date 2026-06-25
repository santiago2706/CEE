/**
 * Tracking minimo sin dependencia de un proveedor especifico.
 * Despacha un CustomEvent en `window` que cualquier script de analitica
 * (GA4/GTM) puede escuchar cuando se integre; mientras tanto, deja rastro
 * en consola para verificar el click en desarrollo.
 */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent(name, { detail: params }));

  if (import.meta.env.DEV) {
    console.debug(`[analytics] ${name}`, params);
  }
}
