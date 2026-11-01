import type { Session } from '../../types/openf1';
import { hasFinished } from '../../logic/calendar';
import { formatSessionTime } from '../../logic/format';
import { useRef, type KeyboardEvent } from 'react';
import { Empty } from '../states/Empty';

interface SessionTabsProps {
  sessions: Session[];
  selectedKey: number | null;
  onSelect: (session: Session) => void;
}

/** Una pestaña por sesión del fin de semana. Al pulsarla avisa al padre con onSelect. */
export function SessionTabs({ sessions, selectedKey, onSelect }: SessionTabsProps) {
  const tabRefs = useRef(new Map<number, HTMLButtonElement>());
  if (sessions.length === 0) return <Empty title="Este Gran Premio todavía no tiene sesiones publicadas" />;
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = sessions.length - 1;
    const targets: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const nextIndex = targets[event.key];
    if (nextIndex === undefined) return; // otra tecla: no hacemos nada

    event.preventDefault();
    const next = sessions[nextIndex];
    onSelect(next);
    tabRefs.current.get(next.session_key)?.focus();
  }
  return (
    <div className="tabs" role="tablist" aria-label="Sesiones del fin de semana">
      {sessions.map((session, index) => {
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
            ref={(element) => {
              if (element) tabRefs.current.set(session.session_key, element);
              else tabRefs.current.delete(session.session_key);
            }}
            id={`tab-${session.session_key}`}
            aria-controls={`panel-${session.session_key}`}
            tabIndex={selected ? 0 : -1}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <span className="tab__name">{session.session_name}</span>
            <span className="tab__time">{formatSessionTime(session.date_start)}</span>
          </button>
        );
      })}
    </div>
  );
}