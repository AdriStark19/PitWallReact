import { useRef, type KeyboardEvent } from 'react';

/**
 * Navegación por teclado para un grupo de pestañas (patrón "roving tabindex"):
 * ← → pasan a la anterior/siguiente (en bucle) e Inicio/Fin a la primera/última,
 * seleccionándola y moviéndole el foco.
 *
 * Devuelve `register(key)` para el ref de cada pestaña y `onKeyDown(event, index)`.
 *
 * Ejemplo: const { register, onKeyDown } = useRovingTabs(sessions, (s) => s.session_key, onSelect);
 */
export function useRovingTabs<Item>(items: Item[], getKey: (item: Item) => number, onSelect: (item: Item) => void) {
  // Elemento de cada pestaña, para poder moverle el foco
  const elements = useRef(new Map<number, HTMLElement>());

  function register(key: number) {
    return (element: HTMLElement | null) => {
      if (element) elements.current.set(key, element);
      else elements.current.delete(key);
    };
  }

  function onKeyDown(event: KeyboardEvent, index: number) {
    const last = items.length - 1;
    const targets: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const nextIndex = targets[event.key];
    if (nextIndex === undefined) return; // otra tecla: no hacemos nada

    event.preventDefault();
    const next = items[nextIndex];
    onSelect(next);
    elements.current.get(getKey(next))?.focus();
  }

  return { register, onKeyDown };
}