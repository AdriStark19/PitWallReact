interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/** Bandera roja con el mensaje de error y, si se puede, un botón de reintentar. */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state state--error" role="alert">
      <span className="state__flag" aria-hidden="true" />
      <p className="state__title">Bandera roja</p>
      <p className="state__text">{message}</p>
      {onRetry && (
        <button className="button" type="button" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}