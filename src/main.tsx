import { createRoot } from 'react-dom/client';
import './styles/main.css';
import App from './App';

const contenedor = document.getElementById("root");
if(contenedor !== null){
    createRoot(contenedor).render(<App />);
}
