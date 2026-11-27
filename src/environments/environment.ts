/**
 * Producción (default de `ng build` / Vercel).
 * `ng serve` reemplaza este archivo por `environment.development.ts`.
 *
 * Antes del deploy web (Fase 4), setear la URL real de la API en Vercel:
 * ver README → «API URL en producción».
 */
export const environment = {
  production: true,
  /** Placeholder hasta que exista el proyecto Vercel de voy_api. */
  apiUrl: 'https://voy-api-PLACEHOLDER.vercel.app',
};
