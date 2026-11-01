import { useState } from 'react';
import type { Meeting } from './types/openf1';
import { Calendar } from './components/calendar/Calendar';
import { MeetingDetail } from './components/session/MeetingDetail';
import { Empty } from './components/states/Empty';
import { ErrorBoundary } from './components/states/ErrorBoundary';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Topbar } from './components/Topbar';

const FIRST_SEASON = 2023; // OpenF1 tiene datos desde 2023
const CURRENT_SEASON = new Date().getFullYear();
const SEASONS = Array.from({ length: CURRENT_SEASON - FIRST_SEASON + 1 }, (_, index) => CURRENT_SEASON - index);

/**
 * Raíz de la app: guarda solo lo que elige el usuario (temporada, búsqueda y GP)
 * y se lo pasa a los dos paneles, que cargan sus propios datos.
 */
export default function App() {
  // La temporada se recuerda al recargar. Si lo guardado ya no es válido, se usa la actual (valor derivado)
  const [storedYear, setYear] = useLocalStorage('pitwall:year', CURRENT_SEASON);
  const year = SEASONS.includes(storedYear) ? storedYear : CURRENT_SEASON;
  const [query, setQuery] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  function changeYear(newYear: number) {
    setYear(newYear);
    setSelectedMeeting(null); // el GP elegido era de la temporada anterior
  }

  return (
    <>
      <Topbar seasons={SEASONS} year={year} onYearChange={changeYear} query={query} onQueryChange={setQuery} />

      <main className="layout">
        <section className="panel panel--calendar" aria-label="Calendario de la temporada" aria-live="polite">
          {/* key: al cambiar de año, el calendario (y su ErrorBoundary) empiezan de cero */}
          <ErrorBoundary key={year}>
            <Calendar
              year={year}
              query={query}
              selectedKey={selectedMeeting?.meeting_key ?? null}
              onSelect={setSelectedMeeting}
            />
          </ErrorBoundary>
        </section>
        <section className="panel panel--detail" aria-label="Detalle del Gran Premio" aria-live="polite">
          {selectedMeeting ? (
            // key: al elegir otro GP, el detalle empieza de cero (sin sesiones ni tabla del anterior)
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
