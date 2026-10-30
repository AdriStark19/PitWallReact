import type { CSSProperties } from 'react';
import type { StandingRow } from '../../logic/standings';

interface StandingRowViewProps {
  row: StandingRow;
}

/** Una fila de la tabla de tiempos. Los textos ya llegan formateados desde logic/standings. */
export function StandingRowView({ row }: StandingRowViewProps) {
  return (
    <tr className={`row row--${row.status.toLowerCase()}`} style={{ '--team': row.teamColour } as CSSProperties}>
      <td className="row__pos">{row.positionLabel}</td>
      <td className="row__driver">
        <span className="row__acronym">{row.acronym}</span>
        <span className="row__fullname">
          {row.fullName} · {row.team}
        </span>
      </td>
      <td className="num">{row.time}</td>
      <td className="num">{row.gap}</td>
      <td className="num">{row.laps}</td>
      <td
        className={`num${row.hasFastestLap ? ' num--fastest' : ''}`}
        title={row.hasFastestLap ? 'Vuelta rápida de la sesión' : undefined}
      >
        {row.bestLap}
      </td>
      <td className="num num--muted">{row.averagePace}</td>
    </tr>
  );
}