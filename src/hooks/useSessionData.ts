import type { Session } from '../types/openf1';
import { SESSION_DATA_TTL_MS, getDrivers, getLaps, getSessionResults } from '../api/openf1';
import { hasStarted } from '../logic/calendar';
import { useCachedFetch } from './useCachedFetch';

const SESSION_CACHE = { maxAgeMs: SESSION_DATA_TTL_MS };

/**
 * Todo lo que hace falta para pintar los resultados de una sesión: pilotos, vueltas y
 * resultado oficial. Lanza las tres cargas en paralelo (cada una con su caché) y las
 * combina en un único estado: empezada o no, cargando, error, datos y reintento.
 *
 * Ejemplo: const { started, data, loading, error, retry } = useSessionData(session);
 */
export function useSessionData(session: Session) {
  const started = hasStarted(session);
  // Sesión futura: clave null para que no se pidan datos que todavía no existen
  const sessionKey = started ? session.session_key : null;

  const drivers = useCachedFetch(sessionKey, getDrivers, { ...SESSION_CACHE, cacheKey: 'drivers' });
  const laps = useCachedFetch(sessionKey, getLaps, { ...SESSION_CACHE, cacheKey: 'laps' });
  const results = useCachedFetch(sessionKey, getSessionResults, { ...SESSION_CACHE, cacheKey: 'results' });
  const parts = [drivers, laps, results];

  // Valores derivados de las tres cargas
  const error = parts.find((part) => part.error !== null)?.error ?? null;
  const loading = parts.some((part) => part.loading);
  const retry = () => parts.forEach((part) => part.retry());

  // Solo hay datos cuando han llegado los tres
  const data =
    drivers.data && laps.data && results.data
      ? {
          drivers: drivers.data.data,
          laps: laps.data.data,
          results: results.data.data,
          fromCache: parts.every((part) => part.data?.fromCache),
        }
      : null;

  return { started, data, loading, error, retry };
}