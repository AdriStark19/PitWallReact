import type { Driver, Lap, Session, SessionResult } from '../../types/openf1';
import { buildStandings } from '../../logic/standings';
import { Empty } from '../states/Empty';
import { SourceBadge } from '../states/SourceBadge';
import { Podium } from './Podium';
import { TimingTable } from './TimingTable';

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
  // Une pilotos, vueltas y resultados en filas ya formateadas
  const standings = buildStandings(results, drivers, laps, session);

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

      <TimingTable rows={standings.rows} />

      <p className="legend">
        Morado = vuelta rápida de la sesión. El ritmo medio excluye vueltas por encima del 107 % de la mejor de cada piloto.
      </p>
    </>
  );
}