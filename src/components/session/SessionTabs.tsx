import type { Session } from '../../types/openf1';
import { hasFinished } from '../../logic/calendar';
import { formatSessionTime } from '../../logic/format';
import { Empty } from '../states/Empty';

interface SessionTabsProps {
  sessions: Session[];
  selectedKey: number | null;
  onSelect: (session: Session) => void;
}

/** Una pestaña por sesión del fin de semana. Al pulsarla avisa al padre con onSelect. */
export function SessionTabs({ sessions, selectedKey, onSelect }: SessionTabsProps) {
  if (sessions.length === 0) return <Empty title="Este Gran Premio todavía no tiene sesiones publicadas" />;

  return (
    <nav className="tabs" role="tablist" aria-label="Sesiones del fin de semana">
      {sessions.map((session) => {
        const selected = session.session_key === selectedKey;
        const className = `tab${selected ? ' tab--selected' : ''}${hasFinished(session) ? '' : ' tab--future'}`;
        return (
          <button
            key={session.session_key}
            className={className}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(session)}
          >
            <span className="tab__name">{session.session_name}</span>
            <span className="tab__time">{formatSessionTime(session.date_start)}</span>
          </button>
        );
      })}
    </nav>
  );
}