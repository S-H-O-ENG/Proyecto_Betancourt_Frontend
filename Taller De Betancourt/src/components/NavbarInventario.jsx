import 'react-router-dom';
import logo from '../assets/logo.png';
import '../App.css';


function NavbarInventario({ setVistaActual }) {
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

        <button 
          className="btn btn-login-nav" 
          onClick={() => {
            localStorage.removeItem("token");    // 1. Borra el token JWT
            localStorage.removeItem("userRole"); // 2. Borra el rol de la sesión
            window.location.href = "/";          // 3. Redirige al inicio/login
          }}
        >
          <i className="fa-solid fa-right-from-bracket"></i> Salir
        </button>
      </nav>
    </aside>
  );
}

export default NavbarInventario;