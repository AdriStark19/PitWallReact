import { useState } from 'react';
import type { Meeting } from '../../types/openf1';
import { pickDefaultSession } from '../../logic/calendar';
import { Loading } from '../states/Loading';
import { ErrorState } from '../states/ErrorState';
import { MeetingHeader } from './MeetingHeader';
import { SessionTabs } from './SessionTabs';
import { SessionResults } from './SessionResults';
import { useSessions } from '../../hooks/useSessions';

interface MeetingDetailProps {
  meeting: Meeting;
}

/** Columna derecha: cabecera del GP, pestañas de sesiones y resultados de la sesión elegida. */
export function MeetingDetail({ meeting }: MeetingDetailProps) {
    const { sessions, loading, error, retry } = useSessions(meeting.meeting_key);
    const [chosenKey, setChosenKey] = useState<number | null>(null);

  // La que eligió el usuario; si aún no eligió ninguna, la última terminada (tu pickDefaultSession)
    const selected = sessions.find((session) => session.session_key === chosenKey) ?? pickDefaultSession(sessions);

    function renderBody() {
        if (loading) return <Loading message="Consultando las sesiones del fin de semana…" />;
        if (error) return <ErrorState message={error} onRetry={retry} />;
        return (
            <>
            <SessionTabs
            sessions={sessions}
            selectedKey={selected?.session_key ?? null}
            onSelect={(session) => setChosenKey(session.session_key)}
            />
            {selected && (
            <div className="results" aria-live="polite">
                <SessionResults key={selected.session_key} session={selected} />
            </div>
            )}
        </>
        );
  }

    return (
        <>
            <MeetingHeader meeting={meeting} />
            {renderBody()}
        </>
    );
}