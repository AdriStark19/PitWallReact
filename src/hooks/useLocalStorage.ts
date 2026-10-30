import { useEffect, useState } from 'react';

/**
 * Como useState, pero el valor sobrevive a recargar la página: se lee de localStorage
 * al montar y se guarda cada vez que cambia.
 *
 * Si localStorage falla (modo privado, bloqueado, dato corrupto) se comporta como un
 * useState normal: la app sigue funcionando, solo que sin recordar.
 *
 * Ejemplo: const [year, setYear] = useLocalStorage('pitwall:year', 2026);
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Inicialización perezosa: solo se lee localStorage en el primer render
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Sincroniza con un sistema externo (localStorage): justo el caso para un efecto
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Sin espacio o sin localStorage: seguimos sin recordar */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
