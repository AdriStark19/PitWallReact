import type { CSSProperties } from 'react';
import type { StandingRow } from '../../logic/standings';

const HEADERS = ['Pos', 'Piloto', 'Tiempo', 'Gap', 'Vueltas', 'Mejor vuelta', 'Ritmo medio'];

interface TimingTableProps {
  rows: StandingRow[];
}

/** Tabla de tiempos de una sesión. Las filas ya llegan formateadas desde logic/standings. */
export function TimingTable({ rows }: TimingTableProps) {
  return (
    <div className="timing-wrap">
      <table className="timing">
        <thead>
          <tr>
            {HEADERS.map((title) => (
              <th key={title} scope="col">
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.driverNumber}
              className={`row row--${row.status.toLowerCase()}`}
              style={{ '--team': row.teamColour } as CSSProperties}
            >
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
          ))}
        </tbody>
      </table>
    </div>
  );
}