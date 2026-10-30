import { useEffect, useState } from 'react';
import type { Session } from '../types/openf1';
import { getSessions } from '../api/openf1';
import { toUserMessage } from '../api/http';
import { prepareSessions } from '../logic/calendar';

/** Carga las sesiones de un Gran Premio. Con meetingKey null (ningún GP elegido) no hace nada. */
export function useSessions(meetingKey: number | null) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(meetingKey !== null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (meetingKey === null) return; // sin GP elegido, nada que cargar

    let cancelled = false;

    async function load(key: number) {
      setLoading(true);
      setError(null);
      try {
        const result = await getSessions(key);
        if (cancelled) return;
        setSessions(prepareSessions(result.data));
      } catch (err) {
        if (cancelled) return;
        console.error('[sesiones]', err);
        setSessions([]);
        setError(toUserMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load(meetingKey);

    return () => {
      cancelled = true;
    };
  }, [meetingKey, reloadKey]);

  /** Vuelve a pedir las sesiones del mismo GP (botón "Reintentar"). */
  const retry = () => setReloadKey((key) => key + 1);

  return { sessions, loading, error, retry };
}