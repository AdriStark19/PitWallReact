import { useMemo, useState } from 'react';
import type { Meeting } from '../../types/openf1';
import { CALENDAR_TTL_MS, getSessions } from '../../api/openf1';
import { pickDefaultSession, prepareSessions } from '../../logic/calendar';
import { formatDateRange } from '../../logic/format';
import { useCachedFetch } from '../../hooks/useCachedFetch';
import { SafeImage } from '../SafeImage';
import { Loading } from '../states/Loading';
import { ErrorState } from '../states/ErrorState';
import { SessionTabs } from './SessionTabs';
import { SessionResults } from './SessionResults';

interface MeetingDetailProps {
  meeting: Meeting;
}

/** Columna derecha: cabecera del GP, pestañas de sesiones y resultados de la sesión elegida. */
export function MeetingDetail({ meeting }: MeetingDetailProps) {
  const { data: response, loading, error, retry } = useCachedFetch(meeting.meeting_key, getSessions, {
    cacheKey: 'sessions',
    maxAgeMs: CALENDAR_TTL_MS,
  });
  const sessions = useMemo(() => prepareSessions(response?.data ?? []), [response]);
  const [chosenKey, setChosenKey] = useState<number | null>(null);

  // Derivado: la que eligió el usuario; si aún no eligió ninguna, la última terminada
  const selected = sessions.find((session) => session.session_key === chosenKey) ?? pickDefaultSession(sessions);

  function renderBody() {
    if (error) return <ErrorState message={error} onRetry={retry} />;
    if (loading || !response) return <Loading message="Consultando las sesiones del fin de semana…" />;
    return (
      <>
        <SessionTabs
          sessions={sessions}
          selectedKey={selected?.session_key ?? null}
          onSelect={(session) => setChosenKey(session.session_key)}
        />
        {selected && (
          <div className="results" aria-live="polite">
            {/* key: al cambiar de sesión, SessionResults empieza de cero (sin la tabla anterior) */}
            <SessionResults key={selected.session_key} session={selected} />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <header className="gp">
        <div className="gp__text">
          <p className="gp__eyebrow">
            {meeting.country_name ?? ''} · {meeting.location ?? ''}
          </p>
          <h2 className="gp__title">{meeting.meeting_name}</h2>
          <p className="gp__meta">
            {meeting.circuit_short_name ?? ''} · {meeting.circuit_type ?? 'Circuito'} ·{' '}
            {formatDateRange(meeting.date_start, meeting.date_end)}
          </p>
        </div>
        <SafeImage
          src={meeting.circuit_image}
          alt={`Trazado de ${meeting.circuit_short_name ?? 'circuito'}`}
          className="gp__circuit"
        />
      </header>
      {renderBody()}
    </>
  );
}
