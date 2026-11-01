import type { Session } from '../../types/openf1';
import { hasFinished } from '../../logic/calendar';
import { formatSessionTime } from '../../logic/format';
import { useRovingTabs } from '../../hooks/useRovingTabs';
import { Empty } from '../states/Empty';

interface SessionTabsProps {
  sessions: Session[];
  selectedKey: number | null;
  onSelect: (session: Session) => void;
}

/** Una pestaña por sesión del fin de semana. Se elige con clic o con las flechas del teclado. */
export function SessionTabs({ sessions, selectedKey, onSelect }: SessionTabsProps) {
  const { register, onKeyDown } = useRovingTabs(sessions, (session) => session.session_key, onSelect);

  if (sessions.length === 0) return <Empty title="Este Gran Premio todavía no tiene sesiones publicadas" />;

  return (
    <div className="tabs" role="tablist" aria-label="Sesiones del fin de semana">
      {sessions.map((session, index) => {
        const key = session.session_key;
        const selected = key === selectedKey;
        const className = `tab${selected ? ' tab--selected' : ''}${hasFinished(session) ? '' : ' tab--future'}`;
        return (
          <button
            key={key}
            ref={register(key)}
            id={`tab-${key}`}
            className={className}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`panel-${key}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(session)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            <span className="tab__name">{session.session_name}</span>
            <span className="tab__time">{formatSessionTime(session.date_start)}</span>
          </button>
        );
      })}
    </div>
  );
}