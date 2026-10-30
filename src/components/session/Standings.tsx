import { useMemo, type CSSProperties } from 'react';
import type { Driver, Lap, Session, SessionResult } from '../../types/openf1';
import { buildStandings } from '../../logic/standings';
import { Empty } from '../states/Empty';
import { SourceBadge } from '../states/SourceBadge';
import { Podium } from './Podium';

const HEADERS = ['Pos', 'Piloto', 'Tiempo', 'Gap', 'Vueltas', 'Mejor vuelta', 'Ritmo medio'];

interface StandingsProps {
  session: Session;
  drivers: Driver[];
  laps: Lap[];
  results: SessionResult[];
  /** true solo si las tres listas salieron de la caché. */
  fromCache: boolean;
}

/** Resultados de una sesión: título, aviso si es provisional, podio y tabla de tiempos. */
export function Standings({ session, drivers, laps, results, fromCache }: StandingsProps) {
  // Une pilotos, vueltas y resultados en filas ya formateadas (solo si cambian los datos)
  const standings = useMemo(
    () => buildStandings(results, drivers, laps, session),
    [results, drivers, laps, session],
  );

  if (standings.rows.length === 0) {
    return <Empty title="OpenF1 aún no tiene tiempos para esta sesión" hint="Suele publicarlos pocos minutos después de que termine." />;
  }

  return (
    <>
      <div className="results-head">
        <h3 className="results-head__title">{session.session_name}</h3>
        <SourceBadge fromCache={fromCache} />
      </div>

      {standings.isProvisional && (
        <p className="note">
          Sin resultado oficial todavía: clasificación provisional. En carrera, por vueltas completadas y tiempo acumulado; en el resto de
          sesiones, por mejor vuelta.
        </p>
      )}

      <Podium rows={standings.rows} />

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
            {/* Los textos de cada fila ya llegan formateados desde logic/standings */}
            {standings.rows.map((row) => (
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

      <p className="legend">
        Morado = vuelta rápida de la sesión. El ritmo medio excluye vueltas por encima del 107 % de la mejor de cada piloto.
      </p>
    </>
  );
}
