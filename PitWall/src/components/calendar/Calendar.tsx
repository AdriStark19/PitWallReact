import { useMemo } from 'react'; // Para no recalcular resumen, rondas y filtro si no cambian sus datos
import type { Meeting } from '../../types/openf1';
import { filterMeetings, roundNumbers, summarizeSeason } from '../../logic/calendar';
import { Empty } from '../states/Empty';
import { SeasonSummary } from './SeasonSummary';
import { MeetingItem } from './MeetingItem';

interface CalendarProps {
  year: number;
  meetings: Meeting[];
  query: string;
  fromCache: boolean;
  selectedKey: number | null;
  onSelect: (meeting: Meeting) => void;
}
export function Calendar({ year, meetings, query, fromCache, selectedKey, onSelect }: CalendarProps) {
    const summary = useMemo(() => summarizeSeason(meetings), [meetings]);
    const rounds = useMemo(() => roundNumbers(meetings), [meetings]);
    // La lista visible sí depende de la búsqueda
    const visible = useMemo(() => filterMeetings(meetings, query), [meetings, query]);
    return (
        <>
            <SeasonSummary year={year} summary={summary} fromCache={fromCache} />
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