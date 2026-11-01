import { useEffect, useEffectEvent, useState } from 'react';
import { toUserMessage } from '../api/http';

/** Último resultado recibido y a qué petición (clave + intento) pertenece. */
interface FetchResult<Key, Data> {
  key: Key;
  attempt: number;
  data: Data | null;
  error: string | null;
}

/**
 * Hook genérico de carga de datos (useFetch).
 * Llama a `request(key, signal)` cada vez que cambia `key` y expone los datos, si está cargando,
 * el mensaje de error y un `retry` para el botón "Reintentar". Con `key` null no pide nada
 * (por ejemplo, una sesión que todavía no se ha disputado).
 *
 * Solo se guarda en el estado el último resultado junto a su clave e intento; `data`, `error`
 * y `loading` se derivan de él. Así, al cambiar de clave nunca se muestran los datos anteriores.
 *
 * Si la clave cambia o el componente se desmonta antes de que llegue la respuesta, la limpieza
 * aborta la petición con AbortController.
 *
 * `request` no necesita ser estable: el efecto la lee con useEffectEvent, así que una función
 * flecha creada en cada render no repite la petición. Solo `key` y `retry` lanzan una carga.
 */
export function useFetch<Key, Data>(key: Key | null, request: (key: Key, signal: AbortSignal) => Promise<Data>) {
  const [retryCount, setRetryCount] = useState(0);
  const [result, setResult] = useState<FetchResult<Key, Data> | null>(null);

  // Siempre usa el último `request` sin que el efecto dependa de él
  const runRequest = useEffectEvent((currentKey: Key, signal: AbortSignal) => request(currentKey, signal));

  useEffect(() => {
    if (key === null) return; // nada que pedir
    const currentKey = key;
    const attempt = retryCount;
    const controller = new AbortController();
    const { signal } = controller;

    runRequest(currentKey, signal).then(
      (data) => {
        if (!signal.aborted) setResult({ key: currentKey, attempt, data, error: null });
      },
      (err: unknown) => {
        if (signal.aborted) return; // cancelada a propósito: no es un error
        console.error('[api]', err);
        setResult({ key: currentKey, attempt, data: null, error: toUserMessage(err) });
      },
    );

    return () => controller.abort();
  }, [key, retryCount]);

  // Valores derivados: el resultado solo vale si es de la clave e intento actuales
  const isCurrent = key !== null && result !== null && Object.is(result.key, key) && result.attempt === retryCount;
  const data = isCurrent ? result.data : null;
  const error = isCurrent ? result.error : null;
  const loading = key !== null && !isCurrent;

  /** Vuelve a pedir lo mismo: cambiar retryCount hace que el efecto se repita. */
  const retry = () => setRetryCount((count) => count + 1);

  return { data, loading, error, retry };
}