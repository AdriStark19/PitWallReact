/**
 * Endpoints de OpenF1 usados por la app. Esta capa solo sabe "cómo pedir":
 * construye URLs y adapta la forma de los datos. La caché la pone el hook useCachedFetch.
 * No sabe nada del DOM ni de cómo se ordenan o pintan los datos.
 */

import { fetchJsonArray } from './http.ts';
import type { Driver, Lap, Meeting, Session, SessionResult } from '../types/openf1.ts';

const BASE_URL = 'https://api.openf1.org/v1';

const HOUR_MS = 60 * 60 * 1000;
// El calendario se actualiza a diario en OpenF1; los datos de sesiones pasadas no cambian
export const CALENDAR_TTL_MS = 12 * HOUR_MS;
export const SESSION_DATA_TTL_MS = 7 * 24 * HOUR_MS;

type QueryParams = Record<string, string | number>;

export function buildUrl(endpoint: string, params: QueryParams): string {
  const query = new URLSearchParams(Object.entries(params).map(([name, value]) => [name, String(value)]));
  return `${BASE_URL}/${endpoint}?${query.toString()}`;
}

/**
 * Una vuelta de OpenF1 trae ~15 campos (sectores, minisectores, velocidades...).
 * Nos quedamos con 4 para que la caché de una carrera ocupe decenas de KB y no MB.
 */
function toSlimLap(lap: Lap): Lap {
  return {
    driver_number: lap.driver_number,
    lap_number: lap.lap_number,
    lap_duration: lap.lap_duration ?? null,
    is_pit_out_lap: lap.is_pit_out_lap ?? null,
  };
}

export const getMeetings = (year: number): Promise<Meeting[]> => fetchJsonArray<Meeting>(buildUrl('meetings', { year }));

export const getSessions = (meetingKey: number): Promise<Session[]> =>
  fetchJsonArray<Session>(buildUrl('sessions', { meeting_key: meetingKey }));

export const getDrivers = (sessionKey: number): Promise<Driver[]> =>
  fetchJsonArray<Driver>(buildUrl('drivers', { session_key: sessionKey }));

export const getLaps = async (sessionKey: number): Promise<Lap[]> => {
  const laps = await fetchJsonArray<Lap>(buildUrl('laps', { session_key: sessionKey }));
  return laps.map(toSlimLap);
};

export const getSessionResults = (sessionKey: number): Promise<SessionResult[]> =>
  fetchJsonArray<SessionResult>(buildUrl('session_result', { session_key: sessionKey }));
