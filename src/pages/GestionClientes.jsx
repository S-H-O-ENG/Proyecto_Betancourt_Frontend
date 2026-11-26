import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import logoImg from '../assets/logo.png';
import supraImg from '../assets/supra.png';
import { useNavigate } from 'react-router-dom';
import '../css/Clientes.css';
import { CerrarSesion } from '../utils/CerrarSesion.js';

const API_CLIENTES = "http://localhost:8080/api/clientes";

const ICONO_EXITO_SVG = `
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
        <path d="M7 12.5l3 3 7-7" />
    </svg>
`;

const EstadoInicialForm = {
    id: null,
    vehiculoId: null,
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    estado: 'ACTIVO',
    tipoVehiculo: '',
    placa: '',
    marca: '',
    modelo: '',
    color: ''
};

function GestionClientes({ alSalir }) {
    const [clientes, setClientes] = useState([]);
    const [filasTabla, setFilasTabla] = useState([]);
    const [formData, setFormData] = useState(EstadoInicialForm);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [clienteExistenteBloqueado, setClienteExistenteBloqueado] = useState(null);
    const [carga, setCarga] = useState(false);
    const navigate = useNavigate();

    const obtenerConfigAuth = () => {
        const token = sessionStorage.getItem('token');
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    // Cargar clientes (con sus vehículos anidados) desde Spring Boot
    const obtenerDatos = async () => {
        try {
            const resp = await axios.get(API_CLIENTES, obtenerConfigAuth());
            const listaClientes = Array.isArray(resp.data) ? resp.data : [];
            setClientes(listaClientes);

            const filas = [];
            for (const c of listaClientes) {
                const listaVehiculos = Array.isArray(c.vehiculos) ? c.vehiculos : [];
                if (listaVehiculos.length > 0) {
                    for (const v of listaVehiculos) {
                        filas.push({
                            key: `${c.id}-${v.id}`,
                            cliente: c,
                            vehiculo: v
                        });
                    }
                }
            }
            setFilasTabla(filas);
        } catch (error) {
            console.error("Error al cargar clientes desde el backend:", error);
        }
    };

    useEffect(() => {
        obtenerDatos();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;

        if (id === 'cedula' && formData.id === null) {
            setFormData(prev => ({ ...prev, [id]: value }));

            if (value.trim() !== '') {
                const encontrado = clientes.find(c => String(c.cedula) === value.trim());

                if (encontrado) {
                    setFormData(prev => ({
                        ...prev,
                        nombre: encontrado.nombre || '',
                        apellido: encontrado.apellido || '',
                        telefono: encontrado.telefono || '',
                        correo: encontrado.correo || '',
                        estado: encontrado.estado || 'ACTIVO'
                    }));
                    setClienteExistenteBloqueado(encontrado);
                } else {
                    setClienteExistenteBloqueado(null);
                }
            } else {
                setClienteExistenteBloqueado(null);
            }
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const abrirNuevoRegistro = () => {
        setFormData(EstadoInicialForm);
        setClienteExistenteBloqueado(null);
        setMostrarModal(true);
    };

    const abrirEdicion = (cliente, vehiculoAsociado) => {
        setFormData({
            id: cliente.id,
            vehiculoId: vehiculoAsociado ? vehiculoAsociado.id : null,
            cedula: cliente.cedula || '',
            nombre: cliente.nombre || '',
            apellido: cliente.apellido || '',
            telefono: cliente.telefono || '',
            correo: cliente.correo || '',
            estado: cliente.estado || 'ACTIVO',
            tipoVehiculo: vehiculoAsociado ? vehiculoAsociado.tipoVehiculo || '' : '',
            placa: vehiculoAsociado ? vehiculoAsociado.placa || '' : '',
            marca: vehiculoAsociado ? vehiculoAsociado.marca || '' : '',
            modelo: vehiculoAsociado ? vehiculoAsociado.modelo || '' : '',
            color: vehiculoAsociado ? vehiculoAsociado.color || '' : ''
        });
        setClienteExistenteBloqueado(null);
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setClienteExistenteBloqueado(null);
        setFormData(EstadoInicialForm);
    };

    const guardarCliente = async (e) => {
        e.preventDefault();
        if (carga) return;

        const placaNormalizada = formData.placa ? formData.placa.trim().toUpperCase() : '';

        // Validar si la placa ya existe en otro vehículo registrado
        const existePlaca = filasTabla.some(
            ({ vehiculo }) =>
                vehiculo &&
                vehiculo.placa &&
                placaNormalizada &&
                vehiculo.placa.toUpperCase() === placaNormalizada &&
                vehiculo.id !== formData.vehiculoId
        );

        if (existePlaca) {
            Swal.fire("Atención", "Ya existe un vehículo registrado con esta placa.", "warning");
            return;
        }

        setCarga(true);

        const payload = {
            cedula: formData.cedula,
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
            correo: formData.correo,
            estado: formData.estado || 'ACTIVO',
            tipoVehiculo: formData.tipoVehiculo,
            placa: placaNormalizada,
            marca: formData.marca,
            modelo: formData.modelo,
            color: formData.color
        };

        try {
            const config = obtenerConfigAuth();

            if (formData.id === null) {
                await axios.post(API_CLIENTES, payload, config);
                Swal.fire({
                    title: "Registro Guardado",
                    text: "Cliente y vehículo registrados correctamente.",
                    iconHtml: ICONO_EXITO_SVG
                });
            } else {
                await axios.put(`${API_CLIENTES}/${formData.id}`, payload, config);
                Swal.fire({
                    title: "Registro Actualizado",
                    text: "Datos actualizados correctamente.",
                    iconHtml: ICONO_EXITO_SVG
                });
            }

            await obtenerDatos();
            cerrarModal();
        } catch (error) {
            console.error("Error al guardar en el backend:", error.response?.status, error.response?.data, error.message);
            Swal.fire("Error", "No se pudo procesar el registro.", "error");
        } finally {
            setCarga(false);
        }
    };

    const eliminarRegistro = async (cliente, vehiculo) => {
        if (carga) return;

        const confirmacion = await Swal.fire({
            title: "¿Eliminar vehículo?",
            text: `¿Deseas eliminar el vehículo con placa ${vehiculo?.placa || ''} de ${cliente.nombre || ''} ${cliente.apellido || ''}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });

        if (!confirmacion.isConfirmed) return;

        setCarga(true);
        try {
            const config = obtenerConfigAuth();

            if (vehiculo?.id) {
                await axios.delete(`http://localhost:8080/api/vehiculos/${vehiculo.id}`, config);
            }

            const vehiculosRestantes = filasTabla.filter(
                fila => fila.cliente.id === cliente.id && fila.vehiculo?.id !== vehiculo?.id
            );

            if (vehiculosRestantes.length === 0 && cliente?.id) {
                await axios.delete(`${API_CLIENTES}/${cliente.id}`, config);
            }

            Swal.fire({
                title: "Eliminado",
                text: "El registro fue eliminado.",
                iconHtml: ICONO_EXITO_SVG
            });
            await obtenerDatos();
        } catch (error) {
            console.error("Error al eliminar el registro:", error.response?.status, error.response?.data, error.message);
            Swal.fire("Error", "No se pudo eliminar el registro.", "error");
        } finally {
            setCarga(false);
        }
    };

    function logout() {
        CerrarSesion();
        navigate('/', { replace: true });
    }

    return (
        <div className="dashboard-layout">
            <aside className="sidebar offcanvas">
                <div className="sidebar-logo">
                    <img src={logoImg} alt="Logo Taller" />
                    <div className="sidebar-brand-text">
                        <h2>Taller De Betancourt</h2>
                        <p>Gestión de Clientes</p>
                    </div>
                </div>
                <nav className="sidebar-menu">
                    <a href="#gestion-clientes" className="active">
                        <i className="fa-regular fa-user"></i>
                        <span>Gestion Clientes</span>
                    </a>
                    <button type="button" className="btn-cerrar-sesion" onClick={logout} title="Cerrar Sesión">
                        <i className="fa-solid fa-right-from-bracket"></i>
                        <span>Cerrar Sesión</span>
                    </button>
                </nav>
            </aside>

            <main className="dashboard-main">
                <header className="topbar">
                    <div>
                        <p>Bienvenido</p>
                    </div>
                    <div className="inventario-info">
                        <i className="fa-regular fa-user"></i>
                        <span>Gestión de Clientes</span>
                    </div>
                </header>

                <div className="contenedor-principal">
                    <div className="header mb-4 d-flex justify-content-between align-items-center">
                        <div>
                            <h2>Gestión y Registro de Clientes</h2>
                        </div>
                        <img src={supraImg} className="carro" alt="Vehículo decorativo" />
                    </div>

                    <section className="panel tabla">
                        <div className="cabecera-tabla d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h2>Clientes y Vehículos</h2>
                            </div>
                            <button className="btn btn-taller" onClick={abrirNuevoRegistro} disabled={carga}>
                                <i className="fa-solid fa-plus"></i> Nuevo Cliente / Vehículo
                            </button>
                        </div>

                        <div className="table-responsive">
                            <table id="tablaUsuarios" className="table align-middle table-dark table-hover">
                                <thead>
                                    <tr>
                                        <th>Cédula</th>
                                        <th>Propietario</th>
                                        <th>Teléfono / Correo</th>
                                        <th>Vehículo</th>
                                        <th>Placa</th>
                                        <th>Detalles Vehículo</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filasTabla.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center text-muted py-4">
                                                No hay vehículos registrados en el sistema.
                                            </td>
                                        </tr>
                                    ) : (
                                        filasTabla.map(({ key, cliente, vehiculo }) => (
                                            <tr key={key}>
                                                <td>
                                                    <span className="badge bg-dark text-white-50 font-monospace">
                                                        {cliente.cedula || 'N/A'}
                                                    </span>
                                                </td>
                                                <td>{cliente.nombre} {cliente.apellido}</td>
                                                <td>
                                                    <div className="small">
                                                        <i className="fa-solid fa-phone text-muted me-1"></i> {cliente.telefono}
                                                    </div>
                                                    <div className="small correo-tabla">
                                                        <i className="fa-solid fa-envelope me-1"></i> {cliente.correo}
                                                    </div>
                                                </td>
                                                <td><span className="badge bg-secondary">{vehiculo.tipoVehiculo}</span></td>
                                                <td>
                                                    <span className="badge bg-warning text-dark font-monospace" style={{ letterSpacing: '1px' }}>
                                                        {vehiculo.placa ? vehiculo.placa.toUpperCase() : ''}
                                                    </span>
                                                </td>
                                                <td className="small text-white-50">
                                                    {vehiculo.marca} {vehiculo.modelo} ({vehiculo.color})
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-info me-1" onClick={() => abrirEdicion(cliente, vehiculo)} disabled={carga}>
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarRegistro(cliente, vehiculo)} disabled={carga}>
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {mostrarModal && (
                        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} tabIndex="-1">
                            <div className="modal-dialog modal-dialog-centered modal-lg-custom">
                                <div className="modal-content">
                                    <div className="modal-header border-0">
                                        <h2 className="modal-title w-100 text-center">
                                            {formData.id ? "Modificar Registro" : "Nuevo Registro de Cliente / Vehículo"}
                                        </h2>
                                        <button type="button" className="btn-close" onClick={cerrarModal}></button>
                                    </div>

                                    <div className="modal-body">
                                        <form onSubmit={guardarCliente}>
                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <div className="seccion-titulo-modal">Datos del propietario</div>

                                                    <div className="mb-3">
                                                        <label className="form-label text-white-50">Cédula:</label>
                                                        <input
                                                            type="number"
                                                            id="cedula"
                                                            className="form-control"
                                                            placeholder="Cédula de ciudadanía"
                                                            value={formData.cedula}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>

                                                    {clienteExistenteBloqueado && (
                                                        <div className="alert alert-info py-2 small mb-3">
                                                            <i className="fa-solid fa-circle-info me-1"></i>
                                                            Cliente existente detectado. Sus datos serán autocompletados.
                                                        </div>
                                                    )}

                                                    <div className="mb-3">
                                                        <label className="form-label text-white-50">Nombre:</label>
                                                        <input
                                                            type="text"
                                                            id="nombre"
                                                            className="form-control"
                                                            placeholder="Nombres"
                                                            value={formData.nombre}
                                                            onChange={handleChange}
                                                            disabled={clienteExistenteBloqueado !== null}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label text-white-50">Apellido:</label>
                                                        <input
                                                            type="text"
                                                            id="apellido"
                                                            className="form-control"
                                                            placeholder="Apellidos"
                                                            value={formData.apellido}
                                                            onChange={handleChange}
                                                            disabled={clienteExistenteBloqueado !== null}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label text-white-50">Teléfono:</label>
                                                        <input
                                                            type="tel"
                                                            id="telefono"
                                                            className="form-control"
                                                            placeholder="Número de celular"
                                                            value={formData.telefono}
                                                            onChange={handleChange}
                                                            disabled={clienteExistenteBloqueado !== null}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label text-white-50">Correo Electrónico:</label>
                                                        <input
                                                            type="email"
                                                            id="correo"
                                                            className="form-control"
                                                            placeholder="correo@ejemplo.com"
                                                            value={formData.correo}
                                                            onChange={handleChange}
                                                            disabled={clienteExistenteBloqueado !== null}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-6 mb-3">
                                                    <div className="seccion-titulo-modal">Datos del vehículo</div>

                                                    <div className="mb-3">
                                                        <label className="form-label text-white-50">Tipo de vehículo:</label>
                                                        <select id="tipoVehiculo" className="form-select" value={formData.tipoVehiculo} onChange={handleChange} required>
                                                            <option value="">Seleccione un tipo</option>
                                                            <option value="Automóvil">Automóvil</option>
                                                            <option value="Camioneta">Camioneta</option>
                                                            <option value="Motocicleta">Motocicleta</option>
                                                            <option value="Camión">Camión</option>
                                                        </select>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label text-white-50">Placa:</label>
                                                        <input type="text" id="placa" className="form-control" placeholder="Ej: ABC123" value={formData.placa} onChange={handleChange} required />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label text-white-50">Marca:</label>
                                                        <input type="text" id="marca" className="form-control" placeholder="Ej: Chevrolet" value={formData.marca} onChange={handleChange} required />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label text-white-50">Modelo:</label>
                                                        <input type="text" id="modelo" className="form-control" placeholder="Ej: 2024" value={formData.modelo} onChange={handleChange} required />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label text-white-50">Color:</label>
                                                        <input type="text" id="color" className="form-control" placeholder="Ej: Negro" value={formData.color} onChange={handleChange} required />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row mt-3">
                                                <div className="col-12">
                                                    <button type="submit" className="btn btn-taller w-100 py-2" disabled={carga}>
                                                        {carga
                                                            ? "Guardando..."
                                                            : formData.id
                                                                ? "Actualizar Cambios"
                                                                : (clienteExistenteBloqueado ? "Asociar Nuevo Vehículo" : "Guardar Registro")}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default GestionClientes;