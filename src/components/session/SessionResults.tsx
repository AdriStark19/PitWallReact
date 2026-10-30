import type { Session } from '../../types/openf1';
import { SESSION_DATA_TTL_MS, getDrivers, getLaps, getSessionResults } from '../../api/openf1';
import { hasStarted } from '../../logic/calendar';
import { formatSessionTime } from '../../logic/format';
import { useCachedFetch } from '../../hooks/useCachedFetch';
import { Loading } from '../states/Loading';
import { ErrorState } from '../states/ErrorState';
import { Empty } from '../states/Empty';
import { Standings } from './Standings';

const SESSION_CACHE = { maxAgeMs: SESSION_DATA_TTL_MS };

interface SessionResultsProps {
  session: Session;
}

/** Zona de resultados de una sesión: aviso si es futura, carga, error o la tabla. */
export function SessionResults({ session }: SessionResultsProps) {
  const started = hasStarted(session);
  // Sesión futura: clave null para que los hooks no pidan datos que todavía no existen
  const sessionKey = started ? session.session_key : null;

  // Tres cargas en paralelo (los efectos se lanzan a la vez), cada una con su propia caché
  const drivers = useCachedFetch(sessionKey, getDrivers, { ...SESSION_CACHE, cacheKey: 'drivers' });
  const laps = useCachedFetch(sessionKey, getLaps, { ...SESSION_CACHE, cacheKey: 'laps' });
  const results = useCachedFetch(sessionKey, getSessionResults, { ...SESSION_CACHE, cacheKey: 'results' });
  const parts = [drivers, laps, results];

  // Valores derivados de las tres cargas: el primer error, si alguna sigue cargando
  const error = parts.find((part) => part.error !== null)?.error ?? null;
  const loading = parts.some((part) => part.loading);
  const retry = () => parts.forEach((part) => part.retry());

  if (!started) {
    return (
      <Empty
        title={`${session.session_name} aún no se ha disputado`}
        hint={`Empieza el ${formatSessionTime(session.date_start)} (hora local).`}
      />
    );
  }
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (loading || !drivers.data || !laps.data || !results.data) {
    return <Loading message={`Descargando tiempos de ${session.session_name}…`} />;
  }
  return (
    <Standings
      session={session}
      drivers={drivers.data.data}
      laps={laps.data.data}
      results={results.data.data}
      fromCache={parts.every((part) => part.data?.fromCache)}
    />
  );
}
