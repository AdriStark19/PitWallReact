import { useEffect, useState } from 'react';
import { toUserMessage } from '../api/http';

/**
 * Hook genérico de carga de datos (useFetch).
 * Llama a `request(key)` cada vez que cambia `key` y expone los datos, si está cargando,
 * el mensaje de error y un `retry` para el botón "Reintentar". Con `key` null no pide nada
 * (por ejemplo, una sesión que todavía no se ha disputado).
 *
 * El hook no sabe QUÉ pide, solo CUÁNDO pedirlo y cómo guardar el resultado.
 * useCachedFetch lo usa por debajo para todas las cargas de la app.
 *
 * Ojo: `request` está en las dependencias del efecto, así que debe ser una función estable
 * (las de api/openf1 lo son porque se definen una vez en el módulo). Una flecha escrita
 * dentro del componente sería nueva en cada render y repetiría la petición sin fin.
 */
export function useFetch<Key, Data>(key: Key | null, request: (key: Key) => Promise<Data>) {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(key !== null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (key === null) return; // nada que pedir

    // Si la clave cambia antes de que llegue la respuesta, la limpieza la marca como vieja
    let cancelled = false;

    async function load(currentKey: Key) {
      setLoading(true);
      setError(null);
      try {
        const result = await request(currentKey);
        if (cancelled) return;
        setData(result);
      } catch (err) {
        if (cancelled) return;
        console.error('[api]', err);
        setData(null);
        setError(toUserMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load(key);

    return () => {
      cancelled = true;
    };
  }, [key, request, retryCount]);

  /** Vuelve a pedir lo mismo: cambiar retryCount hace que el efecto se repita. */
  const retry = () => setRetryCount((count) => count + 1);

  return { data, loading, error, retry };
}
