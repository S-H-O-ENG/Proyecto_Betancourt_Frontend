<<<<<<< HEAD:Taller De Betancourt/src/components/NavbarInventario.jsx
import logo from '../assets/logo.png';
import '../App.css';

function NavbarInventario({ setVistaActual, vistaActiva = 'Inventario', alSalir }) {
  const manejarSalida = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    if (alSalir) {
      alSalir();
    } else {
      window.location.href = '/';
    }
  };

=======
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { CerrarSesion } from '../utils/CerrarSesion.js';

function NavbarInventario({ setVistaActual }) {
  const navigate = useNavigate();

  function logout() {
    CerrarSesion();
    navigate('/', { replace: true });
  }

>>>>>>> 05ff7dc8d1113ac9faede70da839f5994765f21f:src/components/NavbarInventario.jsx
  return (
    <aside className="sidebar offcanvas offcanvas-start show" tabIndex="-1" id="sidebarMenu">
      <div className="sidebar-logo">
        <img src={logo} alt="Logo Taller De Betancourt" />
        <h2>Taller De Betancourt</h2>
        <p>Gestión De Inventarios</p>
      </div>

      <nav className="sidebar-menu">
        <button
<<<<<<< HEAD:Taller De Betancourt/src/components/NavbarInventario.jsx
          type="button"
          onClick={() => setVistaActual && setVistaActual('Inventario')}
          className={`btn text-start text-white w-100 ${
            vistaActiva === 'Inventario' ? 'active' : ''
          }`}
=======
          onClick={() => setVistaActual && setVistaActual('Inventario')}
          className="btn text-start text-white w-100"
>>>>>>> 05ff7dc8d1113ac9faede70da839f5994765f21f:src/components/NavbarInventario.jsx
        >
          <i className="fa-solid fa-boxes-stacked"></i> Inventario
        </button>

<<<<<<< HEAD:Taller De Betancourt/src/components/NavbarInventario.jsx
        <button
          type="button"
          onClick={() => setVistaActual && setVistaActual('Movimientos')}
          className={`btn text-start text-white w-100 ${
            vistaActiva === 'Movimientos' ? 'active' : ''
          }`}
        >
          <i className="fa-solid fa-arrow-right-arrow-left"></i> Movimientos
        </button>

        <button
          type="button"
          className="btn btn-login-nav"
          onClick={manejarSalida}
        >
          <i className="fa-solid fa-right-from-bracket"></i> Salir
=======
        <button className="btn btn-login-nav" onClick={logout}>
          Cerrar Sesion
>>>>>>> 05ff7dc8d1113ac9faede70da839f5994765f21f:src/components/NavbarInventario.jsx
        </button>
      </nav>
    </aside>
  );
}

export default NavbarInventario;