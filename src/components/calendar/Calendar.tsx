import type { Meeting } from '../../types/openf1';
import { CALENDAR_TTL_MS, getMeetings } from '../../api/openf1';
import { filterMeetings, prepareMeetings, roundNumbers, summarizeSeason } from '../../logic/calendar';
import { useCachedFetch } from '../../hooks/useCachedFetch';
import { Loading } from '../states/Loading';
import { ErrorState } from '../states/ErrorState';
import { Empty } from '../states/Empty';
import { SourceBadge } from '../states/SourceBadge';
import { MeetingItem } from './MeetingItem';

interface CalendarProps {
  year: number;
  query: string;
  selectedKey: number | null;
  onSelect: (meeting: Meeting) => void;
}

/** Columna izquierda: pide los GP del año y pinta el resumen y la lista filtrada por el buscador. */
export function Calendar({ year, query, selectedKey, onSelect }: CalendarProps) {
  const { data: response, loading, error, retry } = useCachedFetch(year, getMeetings, { cacheKey: 'meetings', maxAgeMs: CALENDAR_TTL_MS });

  // Valores derivados: se calculan a partir de la respuesta, no se guardan en el estado
  const meetings = prepareMeetings(response?.data ?? []);
  const summary = summarizeSeason(meetings); // sobre TODOS los GP
  const rounds = roundNumbers(meetings); // sobre TODOS los GP
  const visible = filterMeetings(meetings, query); // depende de la búsqueda

  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (loading || !response) return <Loading message={`Cargando el calendario ${year}…`} />;
  if (meetings.length === 0) return <Empty title={`OpenF1 no tiene eventos para ${year}`} hint="Prueba con otra temporada." />;

  const stats = [
    { value: summary.grandsPrix, label: 'Grandes Premios' },
    { value: summary.completed, label: 'Disputados' },
    { value: summary.upcoming, label: 'Por disputar' },
  ];

  return (
    <>
      <div className="season">
        <div className="season__head">
          <h2 className="season__title">Temporada {year}</h2>
          <SourceBadge fromCache={response.fromCache} />
        </div>
        <div className="season__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="stat">
              <span className="stat__value">{stat.value}</span>
              <span className="stat__label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {visible.length > 0 ? (
        <ul className="meeting-list">
          {visible.map((meeting) => (
            <MeetingItem
              key={meeting.meeting_key}
              meeting={meeting}
              round={rounds.get(meeting.meeting_key)}
              selected={meeting.meeting_key === selectedKey}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : (
        <Empty title="Ningún Gran Premio coincide con la búsqueda" hint="Prueba con el país, la ciudad o el nombre del circuito." />
      )}
    </>
  );
}
