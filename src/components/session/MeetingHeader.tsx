import type { Meeting } from '../../types/openf1';
import { formatDateRange } from '../../logic/format';
import { SafeImage } from '../SafeImage';

interface MeetingHeaderProps {
  meeting: Meeting;
}

/** Cabecera del GP elegido: país, nombre, circuito, fechas y el trazado. */
export function MeetingHeader({ meeting }: MeetingHeaderProps) {
  return (
    <header className="gp">
      <div className="gp__text">
        <p className="gp__eyebrow">
          {meeting.country_name ?? ''} · {meeting.location ?? ''}
        </p>
        <h2 className="gp__title">{meeting.meeting_name}</h2>
        <p className="gp__meta">
          {meeting.circuit_short_name ?? ''} · {meeting.circuit_type ?? 'Circuito'} · {formatDateRange(meeting.date_start, meeting.date_end)}
        </p>
      </div>
      <SafeImage
        src={meeting.circuit_image}
        alt={`Trazado de ${meeting.circuit_short_name ?? 'circuito'}`}
        className="gp__circuit"
      />
    </header>
  );
}