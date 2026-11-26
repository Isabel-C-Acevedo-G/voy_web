/**
 * Fechas de voy_api son UTC. Con SQLite suelen llegar naive (sin Z/offset);
 * `new Date(iso)` las trata como local y desfasa America/Bogota (~300 min).
 * DatePipe de Angular tiene el mismo sesgo si no normalizamos.
 */
export function parseApiDateTime(value: string | Date | null | undefined): Date {
  if (value instanceof Date) {
    return value;
  }
  if (value == null) {
    return new Date(NaN);
  }
  const raw = String(value).trim();
  if (!raw) {
    return new Date(NaN);
  }
  if (/([zZ]|[+-]\d{2}:?\d{2})$/.test(raw)) {
    return new Date(raw);
  }
  // "YYYY-MM-DD HH:mm:ss(.ffffff)?" o con T — asumir UTC
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(raw)) {
    return new Date(raw.replace(' ', 'T') + 'Z');
  }
  return new Date(raw);
}

/** Minutos enteros restantes hasta `expiresAt` (UTC-aware). Nunca negativo. */
export function minutosRestantesHasta(
  expiresAt: string | Date,
  nowMs: number = Date.now(),
): number {
  const ms = parseApiDateTime(expiresAt).getTime() - nowMs;
  return Math.max(0, Math.floor(ms / 60_000));
}
