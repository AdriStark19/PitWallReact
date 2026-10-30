import { useState } from 'react';

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  className: string;
}

/** Imagen que no se pinta si falta la URL y desaparece si la URL de la API está rota. */
export function SafeImage({ src, alt, className }: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return <img className={className} src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}
