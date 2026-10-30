import { useEffect, useState } from 'react';
import { getSessionBundle, type SessionBundle } from '../api/openf1';
import { toUserMessage } from '../api/http';

/**
 * Carga pilotos, vueltas y resultados de una sesión (en paralelo, con Promise.all dentro de getSessionBundle).
 * Con sessionKey null (ninguna sesión elegida, o una futura) no pide nada.
 */
export function useSessionBundle(sessionKey: number | null) {
  const [bundle, setBundle] = useState<SessionBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (sessionKey === null) return; // sin sesión que cargar

    let cancelled = false;

    async function load(key: number) {
      setLoading(true);
      setError(null);
      try {
        const result = await getSessionBundle(key);
        if (cancelled) return;
        setBundle(result);
      } catch (err) {
        if (cancelled) return;
        console.error('[tiempos]', err);
        setBundle(null);
        setError(toUserMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load(sessionKey);

    return () => {
      cancelled = true;
    };
  }, [sessionKey, reloadKey]);

  /** Vuelve a pedir los tiempos de la misma sesión (botón "Reintentar"). */
  const retry = () => setReloadKey((key) => key + 1);

  return { bundle, loading, error, retry };
}