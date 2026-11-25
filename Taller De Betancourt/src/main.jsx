import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import InicioJefe from './pages/InicioJefe.jsx';

['pushState', 'replaceState'].forEach((metodo) => {
  const original = window.history[metodo];
  window.history[metodo] = function (...args) {
    console.log(`HISTORY ${metodo} ->`, args[2]);
    console.trace('Quién lo llamó');
    return original.apply(this, args);
  };
}); 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
