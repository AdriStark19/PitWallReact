import type { SeasonSummary as Summary } from '../../logic/calendar';
import { SourceBadge } from '../states/SourceBadge';

interface SeasonSummaryProps {
  year: number;
  summary: Summary;
  fromCache: boolean;
}
export function SeasonSummary({ year, summary, fromCache }: SeasonSummaryProps) {
    const stats = [{ value: summary.grandsPrix, label: 'Grandes Premios' },
                { value: summary.completed, label: 'Disputados' },
                { value: summary.upcoming, label: 'Por disputar' },
                ];
    return (
    <div className="season">
      <div className="season__head">
        <h2 className="season__title">Temporada {year}</h2>
        <SourceBadge fromCache={fromCache} />
      </div>
      <div className="season__stats">
        {stats.map((stat) => (
          <div key={stat.label} className="stat">
            <span className="stat__value">{stat.value}</span>
            <span className="stat__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
        
}