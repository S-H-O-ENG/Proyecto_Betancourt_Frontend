import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { CerrarSesion } from '../utils/CerrarSesion.js';

function NavbarInventario({ setVistaActual }) {
  const navigate = useNavigate();

  function logout() {
    CerrarSesion();
    navigate('/', { replace: true });
  }

  return (
    <aside className="sidebar offcanvas offcanvas-start show" tabIndex="-1" id="sidebarMenu">
      <div className="sidebar-logo">
        <img src={logo} alt="Logo Taller De Betancourt" />
        <h2>Taller De Betancourt</h2>
        <p>Gestión De Inventarios</p>
      </div>
      <nav className="sidebar-menu">
        <button
          onClick={() => setVistaActual && setVistaActual('Inventario')}
          className="btn text-start text-white w-100"
        >
          <i className="fa-solid fa-boxes-stacked"></i> Inventario
        </button>

        <button className="btn btn-login-nav" onClick={logout}>
          Cerrar Sesion
        </button>
      </nav>
    </aside>
  );
}

export default NavbarInventario;