interface EmptyProps {
  title: string;
  hint?: string;
}

/** No hay datos que mostrar. No es un error: solo una explicación y, si hay, una pista. */
export function Empty({ title, hint }: EmptyProps) {
  return (
    <div className="state state--empty">
      <p className="state__title">{title}</p>
      {hint && <p className="state__text">{hint}</p>}
    </div>
  );
}