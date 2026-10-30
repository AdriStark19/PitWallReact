/**
 * Almacén de la caché en localStorage: leer, escribir, contar y vaciar entradas.
 * CUÁNDO se usa (antes de pedir a la red, qué se guarda) lo decide el hook useCachedFetch.
 *
 * Cada entrada guarda el momento en que se escribió y caduca pasado su TTL.
 * localStorage puede fallar (modo privado, cuota llena, bloqueado por el
 * navegador), así que todos los accesos van en try/catch: si falla, la app
 * sigue funcionando y simplemente vuelve a pedir los datos a la red.
 */

const PREFIX = 'pitwall:v1:';

interface CacheEntry<T> {
  savedAt: number;
  data: T;
}

function isCacheEntry(value: unknown): value is CacheEntry<unknown> {
  return typeof value === 'object' && value !== null && typeof (value as CacheEntry<unknown>).savedAt === 'number';
}

/** Claves de localStorage que pertenecen a esta app. */
function ownKeys(): string[] {
  try {
    return Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter((key): key is string => key !== null && key.startsWith(PREFIX));
  } catch {
    return [];
  }
}

export function readCache<T>(key: string, maxAgeMs: number): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return null;

    const entry: unknown = JSON.parse(raw);
    if (!isCacheEntry(entry) || Date.now() - entry.savedAt > maxAgeMs) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return entry.data as T;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T): void {
  const payload = JSON.stringify({ savedAt: Date.now(), data } satisfies CacheEntry<T>);
  try {
    localStorage.setItem(PREFIX + key, payload);
  } catch {
    // Cuota llena: vaciamos nuestra caché y probamos una vez más
    clearCache();
    try {
      localStorage.setItem(PREFIX + key, payload);
    } catch {
      /* Sin espacio o sin localStorage: seguimos sin caché */
    }
  }
  window.dispatchEvent(new Event('pitwall:cache'));
}

/** Borra solo las entradas de esta app y devuelve cuántas había. */
export function clearCache(): number {
  const keys = ownKeys();
  keys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignorado */
    }
  });
  window.dispatchEvent(new Event('pitwall:cache'));
  return keys.length;
}

export const countCacheEntries = (): number => ownKeys().length;

/** Avisa a quien escuche (el botón de App) cada vez que cambia la caché. */
export function subscribeToCache(onChange: () => void) {
  window.addEventListener('pitwall:cache', onChange);
  return () => window.removeEventListener('pitwall:cache', onChange);
}
