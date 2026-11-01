import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import './styles/main.css';
import App from './App';

const contenedor = document.getElementById("root");
if(contenedor !== null){
    createRoot(contenedor).render(<StrictMode>
        <App />
        </StrictMode>,
    );
}
