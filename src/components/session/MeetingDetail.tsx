import type { Meeting } from '../../types/openf1';
import { formatDateRange } from '../../logic/format';
import { SafeImage } from '../SafeImage';
import { MeetingSessions } from './MeetingSessions';

interface MeetingDetailProps {
  meeting: Meeting;
}

/** Columna derecha: cabecera del GP y, debajo, sus sesiones. */
export function MeetingDetail({ meeting }: MeetingDetailProps) {
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
      <MeetingSessions meetingKey={meeting.meeting_key} />
    </>
  );
}