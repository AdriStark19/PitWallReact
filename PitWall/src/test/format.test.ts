import { describe, it, expect } from 'vitest';
import { formatDuration, PLACEHOLDER } from '../logic/format';

const casos = [
  { segundos: 5565.123, esperado: '1:32:45.123', motivo: 'más de una hora' },
  { segundos: 3600, esperado: '1:00:00.000', motivo: 'hora en punto' },
  { segundos: 3605, esperado: '1:00:05.000', motivo: 'poco más de la hora' },
  { segundos: 3659, esperado: '1:00:59.000', motivo: 'justo antes de 1:01' },
  { segundos: 3605.9999, esperado: '1:00:06.000', motivo: 'redondeo a milésimas' },
  { segundos: 91.743, esperado: '1:31.743', motivo: 'menos de una hora' },
  { segundos: null, esperado: PLACEHOLDER, motivo: 'sin dato' },
  { segundos: -5, esperado: PLACEHOLDER, motivo: 'negativo' },
];

describe('formatDuration', () => {
  it('formatea cada caso como se espera', () => {
    const resultados = casos.map((caso) => ({
      ...caso,
      obtenido: formatDuration(caso.segundos),
    }));
    console.table(resultados);

    resultados.forEach((r) => expect(r.obtenido, r.motivo).toBe(r.esperado));
  });
});