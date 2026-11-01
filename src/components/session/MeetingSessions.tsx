import { useState } from 'react';
import { CALENDAR_TTL_MS, getSessions } from '../../api/openf1';
import { pickDefaultSession, prepareSessions } from '../../logic/calendar';
import { useCachedFetch } from '../../hooks/useCachedFetch';
import { Loading } from '../states/Loading';
import { ErrorState } from '../states/ErrorState';
import { SessionTabs } from './SessionTabs';
import { SessionResults } from './SessionResults';

interface MeetingSessionsProps {
  meetingKey: number;
}

/** Pestañas de sesiones del GP y resultados de la sesión elegida. */
export function MeetingSessions({ meetingKey }: MeetingSessionsProps) {
  const { data: response, loading, error, retry } = useCachedFetch(meetingKey, getSessions, {
    cacheKey: 'sessions',
    maxAgeMs: CALENDAR_TTL_MS,
  });
  const [chosenKey, setChosenKey] = useState<number | null>(null);

  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (loading || !response) return <Loading message="Consultando las sesiones del fin de semana…" />;

  // Derivados: sesiones ordenadas y la elegida (o, si aún no hay, la última terminada)
  const sessions = prepareSessions(response.data);
  const selected = sessions.find((session) => session.session_key === chosenKey) ?? pickDefaultSession(sessions);

  return (
    <>
      <SessionTabs
        sessions={sessions}
        selectedKey={selected?.session_key ?? null}
        onSelect={(session) => setChosenKey(session.session_key)}
      />
      {selected && (
        <div
          className="results"
          role="tabpanel"
          id={`panel-${selected.session_key}`}
          aria-labelledby={`tab-${selected.session_key}`}
          aria-live="polite"
          tabIndex={0}
        >
          {/* key: al cambiar de sesión, SessionResults empieza de cero (sin la tabla anterior) */}
          <SessionResults key={selected.session_key} session={selected} />
        </div>
      )}
    </>
  );
}