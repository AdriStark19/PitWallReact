import type { CSSProperties } from 'react';

interface LoadingProps {
  message: string;
}

/** Semáforo de salida de F1: cinco luces que se encienden en orden (la animación está en el CSS). */
export function Loading({ message }: LoadingProps) {
  return (
    <div className="state state--loading" role="status">
      <div className="start-lights" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className="start-lights__light" style={{ '--light-index': index } as CSSProperties} />
        ))}
      </div>
      <p className="state__text">{message}</p>
    </div>
  );
}