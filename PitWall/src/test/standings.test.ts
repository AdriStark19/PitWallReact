import { describe, it, expect } from 'vitest';
import { resultsFromLaps } from '../logic/standings';
import { buildLapStats } from '../logic/laps';
import type { Lap } from '../types/openf1';

// Dorsales de los pilotos del test
const VERSTAPPEN = 1;
const HAMILTON = 44;
const ALONSO = 14;
const SARGEANT = 2;
const STROLL = 18;

/** Genera `cantidad` vueltas iguales para un piloto. */
const vueltas = (piloto: number, cantidad: number, tiempo: number | null): Lap[] =>
  Array.from({ length: cantidad }, (_, i) => ({
    driver_number: piloto,
    lap_number: i + 1,
    lap_duration: tiempo,
    is_pit_out_lap: false,
  }));

const mockLaps: Lap[] = [
  ...vueltas(VERSTAPPEN, 57, 92.0),                                                 // 57 vueltas, total 5244 s
  ...vueltas(HAMILTON, 56, 92.2),                                                   // 57 vueltas, total 5254,2 s...
  { driver_number: HAMILTON, lap_number: 57, lap_duration: 91.0, is_pit_out_lap: false }, // ...pero mejor vuelta que Verstappen
  ...vueltas(ALONSO, 57, 90.5),                                                     // 57 vueltas, total 5158,5 s: el más rápido
  ...vueltas(STROLL, 56, 90.51),                                                     // misma mejor vuelta que Alonso, pero doblado
  ...vueltas(SARGEANT, 3, null),                                                    // sin tiempos: debe quedar fuera
];
const mockStats = buildLapStats(mockLaps);

describe('resultsFromLaps', () => {
  it('en carrera ordena por vueltas y después por tiempo acumulado', () => {
    const results = resultsFromLaps(mockStats, mockLaps, 'Race');
    console.table(results);

    expect(results.map((r) => r.driver_number)).toEqual([ALONSO, VERSTAPPEN, HAMILTON, STROLL]);
    expect(results[0].gap_to_leader).toBeNull();
    // Verstappen, segundo por tiempo total
    expect(results[1].gap_to_leader).toBeCloseTo(85.5);
    // Hamilton tiene mejor vuelta que Verstappen, pero más tiempo total: va detrás
    expect(results[2].gap_to_leader).toBeCloseTo(95.7);
    // Stroll tiene la mejor vuelta, pero va doblado
    expect(results[3].gap_to_leader).toBe('+1 LAP');
    // En carrera, la duración es el tiempo total
    expect(results[0].duration).toBeCloseTo(5158.5);
    expect(results.some((r) => r.driver_number === SARGEANT)).toBe(false);
  });

  it('en clasificación ordena solo por mejor vuelta', () => {
    const results = resultsFromLaps(mockStats, mockLaps, 'Qualifying');
    console.table(results);

    expect(results.map((r) => r.driver_number)).toEqual([ALONSO, STROLL, HAMILTON, VERSTAPPEN]);
    expect(results[0].gap_to_leader).toBeNull();
    // Hamilton, a medio segundo de la mejor vuelta
    expect(results[2].gap_to_leader).toBeCloseTo(0.5);
  });
});