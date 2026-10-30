import type { Session } from '../../types/openf1';
import { hasStarted } from '../../logic/calendar';
import { formatSessionTime } from '../../logic/format';
import { useSessionBundle } from '../../hooks/useSessionBundle';
import { Loading } from '../states/Loading';
import { ErrorState } from '../states/ErrorState';
import { Empty } from '../states/Empty';
import { Standings } from './Standings';

interface SessionResultsProps {
  session: Session;
}

/** Zona de resultados de una sesión: aviso si es futura, carga, error o la tabla. */
export function SessionResults({ session }: SessionResultsProps) {
  const started = hasStarted(session);
  // Sesión futura: null para que el hook no pida datos que aún no existen
  const { bundle, loading, error, retry } = useSessionBundle(started ? session.session_key : null);

  if (!started) {
    return (
      <Empty
        title={`${session.session_name} aún no se ha disputado`}
        hint={`Empieza el ${formatSessionTime(session.date_start)} (hora local).`}
      />
    );
  }
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (loading || !bundle) return <Loading message={`Descargando tiempos de ${session.session_name}…`} />;
  return <Standings session={session} bundle={bundle} />;
}