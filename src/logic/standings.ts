/**
 * Une resultados, pilotos y vueltas en filas listas para pintar.
 * El render no tiene que saber nada de la forma de la API.
 */

import type { Driver, GapValue, Lap, SessionResult, Session } from '../types/openf1.ts';
import { buildLapStats, findFastestDriver, type DriverLapStats } from './laps.ts';
import { formatDuration, formatGap, formatLapTime, toTeamColour, PLACEHOLDER } from './format.ts';

export type FinishStatus = 'FIN' | 'DNF' | 'DNS' | 'DSQ';

export interface StandingRow {
  position: number | null;
  positionLabel: string;
  driverNumber: number;
  acronym: string;
  fullName: string;
  team: string;
  teamColour: string;
  headshotUrl: string | null;
  status: FinishStatus;
  time: string;
  gap: string;
  laps: string;
  bestLap: string;
  averagePace: string;
  hasFastestLap: boolean;
}

/** En clasificación duration/gap son arrays [Q1, Q2, Q3]: nos quedamos con la última fase disputada. */
export function lastDefined<T>(value: T | Array<T | null> | null | undefined): T | null {
  if (!Array.isArray(value)) return value ?? null;
  return value.filter((item): item is T => item !== null && item !== undefined).at(-1) ?? null;
}

const statusOf = (result: SessionResult): FinishStatus =>
  result.dsq ? 'DSQ' : result.dns ? 'DNS' : result.dnf ? 'DNF' : 'FIN';

/** Ordena por posición; los que no tienen posición (DNS, DSQ…) van al final. */
function byPosition(a: SessionResult, b: SessionResult): number {
  const posA = a.position ?? Number.MAX_SAFE_INTEGER;
  const posB = b.position ?? Number.MAX_SAFE_INTEGER;
  return posA - posB;
}

/**
 * Si la sesión aún no tiene resultado oficial, construimos una clasificación
 * provisional ordenando a los pilotos por su mejor vuelta. Para carrera usamos mayor cantidad de vueltas 
 * y menor tiempo en recorrerlas. Exportada para uso en test 
 */
export function resultsFromLaps(stats: Map<number, DriverLapStats>, laps: Lap[], sessionType: string): SessionResult[] {
  const isRace = sessionType === 'Race';

  // Solo en carrera: tiempo total por dorsal (incluye salidas de boxes, que en carrera cuentan)
  const totalTimes = isRace
    ? laps
        .filter((lap) => (lap.lap_duration ?? 0) > 0)
        .reduce(
          (totals, lap) => totals.set(lap.driver_number, (totals.get(lap.driver_number) ?? 0) + (lap.lap_duration ?? 0)),
          new Map<number, number>(),
        )
    : new Map<number, number>();
  const timeOf = (driverNumber: number) => totalTimes.get(driverNumber) ?? Number.MAX_SAFE_INTEGER;

  const ranked = [...stats.values()]
    .filter((driver) => driver.bestLap !== null)
    .sort((a, b) => {
      if (isRace) {
        if (b.totalLaps !== a.totalLaps) return b.totalLaps - a.totalLaps;   // más vueltas primero
        return timeOf(a.driverNumber) - timeOf(b.driverNumber);             // menos tiempo total
      }
      return (a.bestLap ?? 0) - (b.bestLap ?? 0);                           // resto: mejor vuelta
    });

  const leader = ranked[0];
  const leaderLaps = leader?.totalLaps ?? 0;
  const leaderBestLap = leader?.bestLap ?? 0;
  const leaderTime = leader ? timeOf(leader.driverNumber) : 0;

  return ranked.map((driver, index) => {
    const isLeader = index === 0;
    const lapsBehind = leaderLaps - driver.totalLaps;

    let gapToLeader: GapValue = null;

    if (!isLeader) {
      if (isRace && lapsBehind > 0) {
        gapToLeader = `+${lapsBehind} LAP${lapsBehind > 1 ? 'S' : ''}`;
      } else if (isRace) {
        gapToLeader = timeOf(driver.driverNumber) - leaderTime;
      } else if (driver.bestLap !== null) {
        gapToLeader = driver.bestLap - leaderBestLap;
      }
    }

    return {
      driver_number: driver.driverNumber,
      position: index + 1,
      duration: isRace ? totalTimes.get(driver.driverNumber) ?? null : driver.bestLap,
      gap_to_leader: gapToLeader,
      number_of_laps: driver.totalLaps,
    };
  });
}

function toRow(result: SessionResult, driver: Driver | undefined, stats: DriverLapStats | undefined, fastestDriver: number | null): StandingRow {
  const status = statusOf(result);
  const position = typeof result.position === 'number' ? result.position : null;
  const laps = result.number_of_laps ?? stats?.totalLaps ?? null;

  return {
    position,
    positionLabel: position !== null && status !== 'DSQ' ? String(position) : status,
    driverNumber: result.driver_number,
    acronym: driver?.name_acronym ?? `#${result.driver_number}`,
    fullName: driver?.full_name ?? driver?.broadcast_name ?? `Piloto ${result.driver_number}`,
    team: driver?.team_name ?? 'Equipo desconocido',
    teamColour: toTeamColour(driver?.team_colour),
    headshotUrl: driver?.headshot_url ?? null,
    status,
    time: status === 'FIN' ? formatDuration(lastDefined<number>(result.duration)) : status,
    gap: status === 'FIN' ? formatGap(lastDefined<GapValue>(result.gap_to_leader), position) : PLACEHOLDER,
    laps: laps !== null ? String(laps) : PLACEHOLDER,
    bestLap: formatLapTime(stats?.bestLap),
    averagePace: formatLapTime(stats?.averagePace),
    hasFastestLap: fastestDriver !== null && fastestDriver === result.driver_number,
  };
}

export interface Standings {
  rows: StandingRow[];
  /** true si no había resultado oficial y la tabla se ha calculado a partir de las vueltas. */
  isProvisional: boolean;
}

export function buildStandings(results: SessionResult[], drivers: Driver[], laps: Lap[], session : Session): Standings {
  
  const driversByNumber = new Map(drivers.filter((driver) => Number.isFinite(driver?.driver_number)).map((driver) => [driver.driver_number, driver]));
  const lapStats = buildLapStats(laps);
  const fastestDriver = findFastestDriver(lapStats);
  const officialResults = results.filter((result) => Number.isFinite(result?.driver_number));
  const isProvisional = officialResults.length === 0;
  const sessionType : string = session.session_type
  const source = isProvisional ? resultsFromLaps(lapStats,laps, sessionType) : officialResults;
  
  const rows = [...source]
    .sort(byPosition)
    .map((result) => toRow(result, driversByNumber.get(result.driver_number), lapStats.get(result.driver_number), fastestDriver));

  return { rows, isProvisional };
}
