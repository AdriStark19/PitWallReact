import { useState, useSyncExternalStore } from 'react';
import type { Meeting } from './types/openf1';
import { clearCache, countCacheEntries, subscribeToCache } from './api/cache';
import { useMeetings } from './hooks/useMeetings';
import { Calendar } from './components/calendar/Calendar';
import { Loading } from './components/states/Loading';
import { ErrorState } from './components/states/ErrorState';
import { Empty } from './components/states/Empty';
import { ErrorBoundary } from './components/states/ErrorBoundary';
import { MeetingDetail } from './components/session/MeetingDetail';

const FIRST_SEASON = 2023; // OpenF1 tiene datos desde 2023
const CURRENT_SEASON = new Date().getFullYear();
const SEASONS = Array.from({ length: CURRENT_SEASON - FIRST_SEASON + 1 }, (_, index) => CURRENT_SEASON - index);

export default function App() {
  const [year, setYear] = useState(CURRENT_SEASON);
  const [query, setQuery] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const { meetings, fromCache, loading, error, retry } = useMeetings(year);
  // localStorage está fuera de React: App se suscribe a sus cambios para actualizar el botón
  const cacheEntries = useSyncExternalStore(subscribeToCache, countCacheEntries);

  function changeYear(newYear: number) {
    setYear(newYear);
    setSelectedMeeting(null); // el GP elegido era de la temporada anterior
  }

  function renderCalendar() {
    if (loading) return <Loading message={`Cargando el calendario ${year}…`} />;
    if (error) return <ErrorState message={error} onRetry={retry} />;
    if (meetings.length === 0) return <Empty title={`OpenF1 no tiene eventos para ${year}`} hint="Prueba con otra temporada." />;
    return (
      <Calendar
        year={year}
        meetings={meetings}
        query={query}
        fromCache={fromCache}
        selectedKey={selectedMeeting?.meeting_key ?? null}
        onSelect={setSelectedMeeting}
      />
    );
  }

  return (
    <>
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
            <select className="field__input" value={year} onChange={(event) => changeYear(Number(event.target.value))}>
              {SEASONS.map((season) => (
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
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button className="button button--ghost" type="button" onClick={clearCache} disabled={cacheEntries === 0}>
            {cacheEntries > 0 ? `Vaciar caché (${cacheEntries})` : 'Caché vacía'}
          </button>
        </div>
      </header>

      <main className="layout">
        <section className="panel panel--calendar" aria-label="Calendario de la temporada" aria-live="polite">
          {/* key: al cambiar de año, el ErrorBoundary empieza de cero */}
          <ErrorBoundary key={year}>{renderCalendar()}</ErrorBoundary>
        </section>
        <section className="panel panel--detail" aria-label="Detalle del Gran Premio" aria-live="polite">
          {selectedMeeting ? (
            // key: al elegir otro GP, el detalle (y su ErrorBoundary) empiezan de cero
            <ErrorBoundary key={selectedMeeting.meeting_key}>
              <MeetingDetail meeting={selectedMeeting} />
            </ErrorBoundary>
          ) : (
            <Empty title="Elige un Gran Premio" hint="Verás sus sesiones, el podio y la tabla de tiempos." />
          )}
        </section>
      </main>

      <footer className="footer">
        Proyecto no oficial, sin relación con Formula 1. Datos de{' '}
        <a href="https://openf1.org" target="_blank" rel="noopener">
          OpenF1
        </a>
        .
      </footer>
    </>
  );
}