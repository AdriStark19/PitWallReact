import type { Meeting } from '../../types/openf1';
import { hasFinished, hasStarted, isTesting } from '../../logic/calendar';
import { formatDateRange } from '../../logic/format';
import { SafeImage } from '../SafeImage';

interface MeetingItemProps {
  meeting: Meeting;
  round: number | undefined;
  selected: boolean;
  onSelect: (meeting: Meeting) => void;
}

/** Un GP del calendario, como botón accesible. Al pulsarlo avisa a App con onSelect. */
export function MeetingItem({ meeting, round, selected, onSelect }: MeetingItemProps) {
  const className = `meeting${selected ? ' meeting--selected' : ''}${hasFinished(meeting) ? '' : ' meeting--future'}`;
  const place = meeting.circuit_short_name ?? meeting.location ?? '';

  return (
    <li>
      <button className={className} type="button" aria-pressed={selected} onClick={() => onSelect(meeting)}>
        <span className="meeting__round">{round ? `R${String(round).padStart(2, '0')}` : '—'}</span>
        <SafeImage src={meeting.country_flag} alt="" className="meeting__flag" />
        <span className="meeting__body">
          <span className="meeting__name">{meeting.meeting_name}</span>
          <span className="meeting__meta">
            {place} · {formatDateRange(meeting.date_start, meeting.date_end)}
          </span>
        </span>
        <StatusTag meeting={meeting} />
      </button>
    </li>
  );
}

/** Etiqueta de estado del GP: test, en curso, próximo o ninguna si ya terminó. Solo se usa aquí. */
function StatusTag({ meeting }: { meeting: Meeting }) {
  if (isTesting(meeting)) return <span className="tag tag--test">Test</span>;
  if (hasFinished(meeting)) return null;
  if (hasStarted(meeting)) return <span className="tag tag--live">En curso</span>;
  return <span className="tag tag--next">Próximo</span>;
}
