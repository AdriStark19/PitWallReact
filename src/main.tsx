import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/main.css';
import App from './App';

const container = document.getElementById('root');
if (container !== null) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}