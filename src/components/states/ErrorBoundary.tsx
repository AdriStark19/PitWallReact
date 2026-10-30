import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from './ErrorState';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Si un componente de dentro lanza un error al pintarse (por ejemplo, por un dato inesperado),
 * muestra la bandera roja en lugar de dejar la página en blanco.
 * Tiene que ser una clase: React no ofrece todavía un hook equivalente.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  /** React la llama cuando un hijo falla al pintarse: activa el modo error. */
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  /** Deja el error técnico en la consola, para el programador. */
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[render]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          message="Algo ha fallado al mostrar estos datos. Reintenta o elige otro Gran Premio."
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }
    return this.props.children;
  }
}
