interface SourceBadgeProps {
  fromCache: boolean;
}

/** Indica si los datos vienen de la caché de localStorage o se acaban de pedir a OpenF1. */
export function SourceBadge({ fromCache }: SourceBadgeProps) {
  return (
    <span
      className={`badge ${fromCache ? 'badge--cache' : 'badge--live'}`}
      title={fromCache ? 'Datos guardados en localStorage: no se ha repetido la petición' : 'Datos pedidos ahora a OpenF1'}
    >
      {fromCache ? 'Desde caché' : 'Recién descargado'}
    </span>
  );
}