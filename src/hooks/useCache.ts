import { useSyncExternalStore } from 'react';
import { clearCache, countCacheEntries, subscribeToCache } from '../storage/cache';

/**
 * La caché vista desde React: cuántas entradas hay (siempre al día, porque se suscribe
 * a sus cambios) y cómo vaciarla. Los componentes no necesitan saber que es localStorage.
 */
export function useCache() {
  const entries = useSyncExternalStore(subscribeToCache, countCacheEntries);
  return { entries, clear: clearCache };
}
