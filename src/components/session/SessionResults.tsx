import type { Session } from '../../types/openf1';
import { formatSessionTime } from '../../logic/format';
import { useSessionData } from '../../hooks/useSessionData';
import { Loading } from '../states/Loading';
import { ErrorState } from '../states/ErrorState';
import { Empty } from '../states/Empty';
import { Standings } from './Standings';

interface SessionResultsProps {
  session: Session;
}

/** Zona de resultados de una sesión: aviso si es futura, carga, error o la tabla. */
export function SessionResults({ session }: SessionResultsProps) {
  const { started, data, loading, error, retry } = useSessionData(session);

  if (!started) {
    return (
      <Empty
        title={`${session.session_name} aún no se ha disputado`}
        hint={`Empieza el ${formatSessionTime(session.date_start)} (hora local).`}
      />
    );
  }
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (loading || !data) return <Loading message={`Descargando tiempos de ${session.session_name}…`} />;

  return (
    <Standings
      session={session}
      drivers={data.drivers}
      laps={data.laps}
      results={data.results}
      fromCache={data.fromCache}
    />
  );
}