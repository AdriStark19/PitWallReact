import { useEffect, useState } from 'react';
import type { Meeting } from '../types/openf1.ts';
import { getMeetings } from '../api/openf1.ts';
import { toUserMessage } from '../api/http.ts';
import { prepareMeetings } from '../logic/calendar.ts';

/** Carga los Grandes Premios de una temporada y expone su estado de carga y error. */
export function useMeetings(year: number) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [fromCache, setFromCache] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Si el año cambia antes de que llegue la respuesta, la limpieza la marca como vieja
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await getMeetings(year);
        if (cancelled) return;
        setMeetings(prepareMeetings(result.data));
        setFromCache(result.fromCache);
      } catch (err) {
        if (cancelled) return;
        console.error('[calendario]', err);
        setMeetings([]);
        setError(toUserMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [year, reloadKey]);

  /** Vuelve a pedir la misma temporada (botón "Reintentar"). */
  const retry = () => setReloadKey((key) => key + 1);

  return { meetings, fromCache, loading, error, retry };
}