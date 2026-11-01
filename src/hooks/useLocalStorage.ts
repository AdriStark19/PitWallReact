import { useEffect, useState } from 'react';

/**
 * Como useState, pero el valor sobrevive a recargar la página: se lee de localStorage
 * al montar y se guarda cada vez que se cambia con el setter (nunca en el primer render).
 * Además escucha el evento 'storage' para sincronizarse si otra pestaña cambia la misma clave.
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

  /** Cambia el valor y lo guarda: se escribe solo cuando de verdad cambia. */
  function setAndStore(newValue: T) {
    setValue(newValue);
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch {
      /* Sin espacio o sin localStorage: seguimos sin recordar */
    }
  }

  // Sincroniza con otras pestañas: el evento 'storage' solo llega desde ellas
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== key || event.newValue === null) return;
      try {
        setValue(JSON.parse(event.newValue) as T);
      } catch {
        /* Dato corrupto: mantenemos el actual */
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  return [value, setAndStore] as const;
}