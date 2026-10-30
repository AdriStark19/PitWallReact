import { useMemo } from 'react';
import type { Session } from '../../types/openf1';
import type { SessionBundle } from '../../api/openf1';
import { buildStandings } from '../../logic/standings';
import { Empty } from '../states/Empty';
import { SourceBadge } from '../states/SourceBadge';
import { Podium } from './Podium';
import { StandingRowView } from './StandingRowView';

const HEADERS = ['Pos', 'Piloto', 'Tiempo', 'Gap', 'Vueltas', 'Mejor vuelta', 'Ritmo medio'];

interface StandingsProps {
  session: Session;
  bundle: SessionBundle;
}

/** Resultados de una sesión: título, aviso si es provisional, podio y tabla de tiempos. */
export function Standings({ session, bundle }: StandingsProps) {
  // Une pilotos, vueltas y resultados en filas ya formateadas (solo si cambian los datos)
  const standings = useMemo(
    () => buildStandings(bundle.results, bundle.drivers, bundle.laps, session),
    [bundle, session],
  );

  if (standings.rows.length === 0) {
    return <Empty title="OpenF1 aún no tiene tiempos para esta sesión" hint="Suele publicarlos pocos minutos después de que termine." />;
  }

  return (
    <>
      <div className="results-head">
        <h3 className="results-head__title">{session.session_name}</h3>
        <SourceBadge fromCache={bundle.fromCache} />
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
            {standings.rows.map((row) => (
              <StandingRowView key={row.driverNumber} row={row} />
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