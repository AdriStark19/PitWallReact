import { useCache } from '../hooks/useCache';

interface TopbarProps {
  seasons: number[];
  year: number;
  onYearChange: (year: number) => void;
  query: string;
  onQueryChange: (query: string) => void;
}

/** Cabecera: marca, selector de temporada, buscador de GP y botón para vaciar la caché. */
export function Topbar({ seasons, year, onYearChange, query, onQueryChange }: TopbarProps) {
  const cache = useCache(); // número de entradas (siempre al día) y vaciado

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand__mark" aria-hidden="true"></span>
        <div>
          <h1 className="brand__title">PIT WALL</h1>
          <p className="brand__tagline">Datos reales de F1 · vía OpenF1</p>
        </div>
      </div>

      <div className="controls">
        <label className="field">
          <span className="field__label">Temporada</span>
          <select className="field__input" value={year} onChange={(event) => onYearChange(Number(event.target.value))}>
            {seasons.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--grow">
          <span className="field__label">Buscar GP</span>
          <input
            className="field__input"
            type="search"
            placeholder="Mónaco, Spa, Japan…"
            autoComplete="off"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <button className="button button--ghost" type="button" onClick={cache.clear} disabled={cache.entries === 0}>
          {cache.entries > 0 ? `Vaciar caché (${cache.entries})` : 'Caché vacía'}
        </button>
      </div>
    </header>
  );
}