import type { Loaded } from '../types/openf1';
import { readCache, writeCache } from '../storage/cache';
import { useFetch } from './useFetch';

interface CacheOptions {
  /** Prefijo de la entrada en caché; la clave final es `${cacheKey}:${key}`. */
  cacheKey: string;
  /** Cuánto tiempo vale una copia guardada. */
  maxAgeMs: number;
}

/**
 * useFetch con caché en localStorage: antes de pedir a la red mira si hay una copia
 * reciente; si no la hay, pide con `request` y guarda el resultado.
 * Devuelve lo mismo que useFetch, con los datos envueltos en { data, fromCache }.
 *
 * Los arrays vacíos no se guardan: suelen ser sesiones futuras que aún no tienen datos,
 * y cachearlos escondería los datos reales cuando lleguen.
 *
 * `request` recibe la señal de cancelación de useFetch y debe pasarla a fetch: así una
 * petición cancelada no llega a terminar ni a guardarse en caché.
 * No hace falta que `request` sea estable: useFetch la lee con useEffectEvent, así que
 * cambiar de función entre renders no repite la petición.
 *
 * Ejemplo: useCachedFetch(year, getMeetings, { cacheKey: 'meetings', maxAgeMs: CALENDAR_TTL_MS })
 */
export function useCachedFetch<Key extends string | number, Data>(
  key: Key | null,
  request: (key: Key, signal: AbortSignal) => Promise<Data>,
  { cacheKey, maxAgeMs }: CacheOptions,
) {
  async function cachedRequest(currentKey: Key, signal: AbortSignal): Promise<Loaded<Data>> {
    const entryKey = `${cacheKey}:${currentKey}`;
    const cached = readCache<Data>(entryKey, maxAgeMs);
    if (cached !== null) return { data: cached, fromCache: true };

    const fresh = await request(currentKey, signal);
    const isEmptyArray = Array.isArray(fresh) && fresh.length === 0;
    if (!isEmptyArray) writeCache(entryKey, fresh);
    return { data: fresh, fromCache: false };
  }

  return useFetch(key, cachedRequest);
}