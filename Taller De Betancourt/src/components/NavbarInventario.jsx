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

  return (
    <aside className="sidebar offcanvas offcanvas-start show" tabIndex="-1" id="sidebarMenu">
      <div className="sidebar-logo">
        <img src={logo} alt="Logo Taller De Betancourt" />
        <h2>Taller De Betancourt</h2>
        <p>Gestión De Inventarios</p>
      </div>

      <nav className="sidebar-menu">
        <button
          type="button"
          onClick={() => setVistaActual && setVistaActual('Inventario')}
          className={`btn text-start text-white w-100 ${
            vistaActiva === 'Inventario' ? 'active' : ''
          }`}
        >
          <i className="fa-solid fa-boxes-stacked"></i> Inventario
        </button>

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
        </button>
      </nav>
    </aside>
  );
}

export default NavbarInventario;