import type { CSSProperties } from 'react';
import type { StandingRow } from '../../logic/standings';
import { SafeImage } from '../SafeImage';

interface PodiumProps {
  rows: StandingRow[];
}

/** Los tres primeros que terminaron. El CSS los coloca como un podio real: P2, P1, P3. */
export function Podium({ rows }: PodiumProps) {
  const podium = rows.filter((row) => row.position !== null && row.position <= 3 && row.status === 'FIN');
  if (podium.length < 3) return null; // mejor sin podio que un podio cojo

  return (
    <div className="podium">
      {podium.map((row) => (
        <article
          key={row.driverNumber}
          className={`podium__step podium__step--p${row.position}`}
          style={{ '--team': row.teamColour } as CSSProperties}
        >
          <SafeImage src={row.headshotUrl} alt={row.fullName} className="podium__photo" />
          <span className="podium__pos">P{row.position}</span>
          <span className="podium__name">{row.fullName}</span>
          <span className="podium__team">{row.team}</span>
        </article>
      ))}
    </div>
  );
}