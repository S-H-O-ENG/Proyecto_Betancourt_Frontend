import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import InicioJefe from './pages/InicioJefe.jsx';
import Pedidos from './pages/Pedidos.jsx';
import Proveedores from './pages/Proveedores.jsx';
import Inventario from './pages/inventario.jsx';
import GestionClientes from './pages/GestionClientes.jsx';

import ProteccionPaginas from './components/RutasProtegidas.jsx';



import logo from './assets/logo.png';
import supra from './assets/supra.png';
import './App.css';

const LOGIN_URL = 'http://localhost:8080/api/auth/login';

// Ruta de inicio según el rol que devuelve el backend
const RUTA_POR_ROL = {
  SUPER_ADMIN: '/Inicio',
  admin: '/Inicio',
  ADMINISTRATIVO: '/Inventario',
  AUXILIAR: '/GestionClientes',
};

function Landing() {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function login(e) {
    e.preventDefault();
    setMensaje('');

    if (!email || !password) {
      setMensaje('Correo y contraseña obligatorios');
      return;
    }

    try {
      const { data } = await axios.post(LOGIN_URL, { correo: email, password });

      const destino = RUTA_POR_ROL[data.role];
      if (!destino) {
        console.warn('Rol no reconocido:', data.role);
        setMensaje('Tu rol no tiene acceso configurado');
        return;
      }

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('role', data.role);

      // Limpia el modal de Bootstrap antes de navegar
      document.body.classList.remove('modal-open');
      document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '';

      Swal.fire(`¡Bienvenido/a ${data.nombre}!`);
      navigate(destino);
    } catch (error) {
      if (error.response?.status === 401) {
        setMensaje('Correo o contraseña incorrectos');
      } else {
        setMensaje('Error al conectar con el servidor');
      }
      console.error(error);
    }



  }

  return (
    <>
      <header className="header-principal navbar navbar-expand-lg">
        <div className="container-fluid container-header">
          <div className="logo-marca-wrapper d-flex align-items-center">
            <img src={logo} alt="Logo Taller" className="logo-header me-2" />
            <h1 className="marca m-0">TALLER DE BETANCOURT</h1>
          </div>

          <button
            className="navbar-toggler custom-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <nav className="collapse navbar-collapse navegar" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item"><a className="nav-link" href="#Nosotros">Sobre Nosotros</a></li>
              <li className="nav-item"><a className="nav-link" href="#donde">Encuéntranos</a></li>
              <li className="nav-item">
                <button className="btn btn-login-nav" data-bs-toggle="modal" data-bs-target="#loginModal">
                  Login
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="modal fade" id="loginModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content modal-login">
            <div className="modal-header border-0">
              <h2 className="modal-title w-100 text-center">Iniciar Sesión</h2>
              <button type="button" className="btn-cerrar" data-bs-dismiss="modal">X</button>
            </div>
            <div className="modal-body">
              <form onSubmit={login}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Correo Electrónico:</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Ingresa tu correo"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">Contraseña:</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-login btn-ingresar w-100">Ingresar</button>

                <div className="d-flex justify-content-between mt-3">
                  <a href="#" className="link-login">¿Olvidaste tu contraseña?</a>
                </div>
              </form>
              {mensaje && <p className="text-danger text-center mt-2">{mensaje}</p>}
            </div>
          </div>
        </div>
      </div>

      <section className="banner-taller text-center d-flex flex-column justify-content-center align-items-center">
        <img src={supra} alt="supra" className="carro-animado" />
        <h1>Potencia y Rendimiento</h1>
        <p>Tu vehículo en manos de verdaderos profesionales</p>
      </section>

      <main className="container my-5 contenido-principal">
        <section
          className="seccion-contenedor p-4 mb-5 text-center"
          id="Nosotros"
          style={{ background: 'rgba(24, 24, 31, 0.6)', borderRadius: '8px' }}
        >
          <h2>¿Quiénes somos?</h2>
          <p
            className="mx-auto mt-3 text-secondary"
            style={{ maxWidth: '800px', fontFamily: "'Lato', sans-serif", lineHeight: '1.6' }}
          >
            Somos un taller automotriz comprometido con la excelencia mecánica. Contamos con tecnología de
            vanguardia y un equipo de técnicos altamente calificados para ofrecerte soluciones confiables y seguras.
          </p>
        </section>

        <section
          className="seccion-contenedor p-4 mb-5 text-center"
          id="donde"
          style={{ background: 'rgba(24, 24, 31, 0.6)', borderRadius: '8px' }}
        >
          <h2 className="mb-4">Encuéntranos</h2>
          <div
            className="ratio ratio-21x9 mx-auto"
            style={{ maxWidth: '1000px', borderRadius: '8px', overflow: 'hidden' }}
          >
            <iframe
              title="Ubicación del taller"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.974443187212!2d-74.093416!3d4.60001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNC淡MzYnMDAuMCJOIDc0wrA1NSczNi4zIlc!5e0!3m2!1ses!2sco!4v1700000000000!5m2!1ses!2sco"
              style={{ border: '0' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>
      </main>
    </>
  );
}



function App() {
  const location = useLocation();

  useEffect(() => {
    console.log('RUTA:', location.pathname);
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route
        path="/Inicio"
        element={
          <ProteccionPaginas rolesPermitidos={['SUPER_ADMIN', 'admin']}>
            <InicioJefe />
          </ProteccionPaginas>
        }
      />
      <Route
        path="/Pedidos"
        element={
          <ProteccionPaginas rolesPermitidos={['SUPER_ADMIN', 'admin']}>
            <Pedidos />
          </ProteccionPaginas>
        }
      />
      <Route
        path="/ProveedoresGestion"
        element={
          <ProteccionPaginas rolesPermitidos={['SUPER_ADMIN', 'admin']}>
            <Proveedores />
          </ProteccionPaginas>
        }
      />
      <Route
        path="/Inventario"
        element={
          <ProteccionPaginas rolesPermitidos={['ADMINISTRATIVO']}>
            <Inventario />
          </ProteccionPaginas>
        }
      />
      <Route
        path="/GestionClientes"
        element={
          <ProteccionPaginas rolesPermitidos={['AUXILIAR']}>
            <GestionClientes />
          </ProteccionPaginas>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;