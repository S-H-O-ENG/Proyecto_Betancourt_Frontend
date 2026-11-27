import { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Inventario.css';
import NavbarInventario from '../components/NavbarInventario';
import { construirMovimientoPorAccionProducto } from './Movimientos_Inventario';

const API_URL = "http://localhost:8080/api/v1/productos";

const OPCIONES_REPUESTOS = [
  "Aceite Sintético 10W40",
  "Filtro de Aceite",
  "Filtro de Aire",
  "Pastillas de Freno Delanteras",
  "Discos de Freno",
  "Batería 12V 800A",
  "Líquido de Frenos DOT4",
  "Amortiguador Delantero",
  "Líquido Refrigerante",
  "Bujía de Iridio"
];

const obtenerEstadoYBadge = (cantidadNum) => {
  if (cantidadNum === 0) {
    return { estado: "Sin Stock", claseBadge: "bg-danger" };
  }
  if (cantidadNum <= 5) {
    return { estado: "Bajo Stock", claseBadge: "bg-warning text-dark" };
  }
  return { estado: "Activo", claseBadge: "bg-success" };
};

const formatearPrecio = (precio) => {
  const valor = Number(precio) || 0;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(valor);
};

function Inventario({ setVistaActual, onRegistrarMovimiento, alSalir }) {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    cantidad: "",
    precio: ""
  });

  const consultarP = async () => {
    try {
      const respuesta = await axios.get(API_URL);
      const normalizados = (respuesta.data || []).map((p) => {
        const nombreProd = p.nombre ?? p.Lproducto ?? "";
        const cantNum = Number(p.cantidad) || 0;
        const calculado = obtenerEstadoYBadge(cantNum);
        return {
          ...p,
          nombre: nombreProd,
          cantidad: cantNum,
          precio: Number(p.precio) || 0,
          estado: p.estado || calculado.estado,
          claseBadge: p.claseBadge || calculado.claseBadge
        };
      });
      setProductos(normalizados);
    } catch (error) {
      console.error("Error al consultar API:", error);
    }
  };

  useEffect(() => {
    consultarP();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cantidadNum = parseInt(formData.cantidad, 10) || 0;
    const precioNum = parseFloat(formData.precio) || 0;
    const { estado, claseBadge } = obtenerEstadoYBadge(cantidadNum);

    // Deja que PostgreSQL/Hibernate genere el ID o envía si tu backend lo requiere
    const payload = {
      nombre: formData.nombre,
      cantidad: cantidadNum,
      precio: precioNum,
      estado
    };

    try {
      const respuesta = await axios.post(API_URL, payload);
      const creado = respuesta.data || {};
      await consultarP();

      if (onRegistrarMovimiento) {
        onRegistrarMovimiento(
          construirMovimientoPorAccionProducto({
            accion: "AGREGAR",
            productoActual: {
              ...payload,
              id: creado.id ?? String(Date.now()),
              Lproducto: payload.nombre,
              claseBadge
            }
          })
        );
      }

      setFormData({ id: "", nombre: "", cantidad: "", precio: "" });

      const botonCerrar = document.querySelector("#modalProducto .btn-close");
      if (botonCerrar) botonCerrar.click();
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };

  const prepararModificacion = (producto) => {
    setFormData({
      id: producto.id,
      nombre: producto.nombre,
      cantidad: producto.cantidad,
      precio: producto.precio
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const cantidadNum = parseInt(formData.cantidad, 10) || 0;
    const precioNum = parseFloat(formData.precio) || 0;
    const { estado, claseBadge } = obtenerEstadoYBadge(cantidadNum);
    const productoAnterior = productos.find((p) => p.id === formData.id);

    const payload = {
      id: formData.id,
      nombre: formData.nombre,
      cantidad: cantidadNum,
      precio: precioNum,
      estado
    };

    try {
      await axios.put(`${API_URL}/${formData.id}`, payload);
      await consultarP();

      if (onRegistrarMovimiento) {
        onRegistrarMovimiento(
          construirMovimientoPorAccionProducto({
            accion: "MODIFICAR",
            productoActual: {
              ...payload,
              Lproducto: payload.nombre,
              claseBadge
            },
            productoAnterior: productoAnterior
              ? { ...productoAnterior, Lproducto: productoAnterior.nombre }
              : null
          })
        );
      }

      setFormData({ id: "", nombre: "", cantidad: "", precio: "" });

      const botonCerrar = document.querySelector("#modalModificar .btn-close");
      if (botonCerrar) botonCerrar.click();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
    }
  };

  const eliminarProducto = async (producto) => {
    if (window.confirm(`¿Desea eliminar este producto? ${producto.nombre}`)) {
      try {
        await axios.delete(`${API_URL}/${producto.id}`);
        await consultarP();

        if (onRegistrarMovimiento) {
          onRegistrarMovimiento(
            construirMovimientoPorAccionProducto({
              accion: "BORRAR",
              productoActual: {
                ...producto,
                Lproducto: producto.nombre
              },
              productoAnterior: {
                ...producto,
                Lproducto: producto.nombre
              }
            })
          );
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Ocurrió un error al eliminar.");
      }
    }
  };

  const termino = busqueda.trim().toLowerCase();
  const productosFiltrados = productos.filter((prod) => {
    if (!termino) return true;
    const matchId = String(prod.id ?? "").toLowerCase().includes(termino);
    const matchNombre = String(prod.nombre ?? "").toLowerCase().includes(termino);
    return matchId || matchNombre;
  });

  const activos = productos.filter((p) => p.estado === "Activo").length;
  const bajoStock = productos.filter((p) => p.estado === "Bajo Stock").length;
  const sinStock = productos.filter((p) => p.estado === "Sin Stock").length;

  return (
    <>
      <div className="d-flex">
        <NavbarInventario
          setVistaActual={setVistaActual}
          vistaActiva="Inventario"
          alSalir={alSalir}
        />

        <div className="dashboard-layout">
          <main className="dashboard-main">
            <header className="topbar">
              <div>
                <p>Bienvenido</p>
              </div>
              <div className="inventario-info">
                <i className="fa-solid fa-boxes-stacked"></i>
                <span>Gestión Inventario</span>
              </div>
            </header>

            <section className="row g-4 mb-4">
              <div className="col-lg-4 col-md-4">
                <div className="card-resumen">
                  <i className="fa-solid fa-check-to-slot"></i>
                  <div>
                    <h3>{activos}</h3>
                    <p>Productos activos</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-4">
                <div className="card-resumen">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <div>
                    <h3>{bajoStock}</h3>
                    <p>Productos con bajo stock</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-4">
                <div className="card-resumen">
                  <i className="fa-solid fa-ban"></i>
                  <div>
                    <h3>{sinStock}</h3>
                    <p>Productos sin stock</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel-table container-fluid">
              <div className="cabecera-tabla d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                <div>
                  <span>Productos</span>
                </div>

                {/* Barra de búsqueda al costado */}
                <div className="d-flex align-items-center gap-2 flex-grow-1 justify-content-end" style={{ maxWidth: "460px" }}>
                  <div className="input-group">
                    <span className="input-group-text bg-dark text-white-50 border-secondary">
                      <i className="fa-solid fa-magnifying-glass"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="Buscar por ID o nombre..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                    {busqueda && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setBusqueda("")}
                        title="Limpiar búsqueda"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    )}
                  </div>

                  <button
                    className="btn btn-inventario text-nowrap"
                    data-bs-toggle="modal"
                    data-bs-target="#modalProducto"
                    onClick={() => setFormData({ id: "", nombre: "", cantidad: "", precio: "" })}
                  >
                    <i className="fa-solid fa-plus"></i> Agregar
                  </button>
                </div>
              </div>
            </section>

            <div className="tabla-inventario">
              <table id="tablaProductos" className="table align-middle">
                <thead>
                  <tr>
                    <th>ID Producto</th>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No se encontraron productos que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    productosFiltrados.map((prod) => (
                      <tr key={prod.id}>
                        <td>{prod.id}</td>
                        <td>{prod.nombre}</td>
                        <td>{prod.cantidad}</td>
                        <td>{formatearPrecio(prod.precio)}</td>
                        <td>
                          <span className={`badge ${prod.claseBadge}`}>
                            {prod.estado}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            data-bs-toggle="modal"
                            data-bs-target="#modalModificar"
                            onClick={() => prepararModificacion(prod)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger me-2"
                            onClick={() => eliminarProducto(prod)}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>

      {/* Modal Nuevo Producto */}
      <div className="modal fade" id="modalProducto" tabIndex="-1" aria-labelledby="modalProductoLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content modal-login text-bg-dark border-secondary">
            <div className="modal-header border-0">
              <h2 className="modal-title w-100 text-center" id="modalProductoLabel">
                Nuevo Producto
              </h2>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form id="formProducto" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <select
                    name="nombre"
                    className="form-select bg-dark text-white border-secondary"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                  >
                    <option value="" disabled hidden>Seleccione una opción</option>
                    {OPCIONES_REPUESTOS.map((item, idx) => (
                      <option key={idx} value={item} style={{ backgroundColor: '#212529', color: '#fff' }}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <input
                    type="number"
                    name="cantidad"
                    className="form-control"
                    placeholder="Cantidad Inicial"
                    min="0"
                    value={formData.cantidad}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="number"
                    name="precio"
                    className="form-control"
                    placeholder="Precio Unitario"
                    min="0"
                    step="any"
                    value={formData.precio}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-registrar w-100">
                  Guardar Producto
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Modificar Producto */}
      <div className="modal fade" id="modalModificar" tabIndex="-1" aria-labelledby="modalModificarLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content modal-login text-bg-dark border-secondary">
            <div className="modal-header border-0">
              <h2 className="modal-title w-100 text-center" id="modalModificarLabel">
                Modificar Producto
              </h2>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form id="formModificar" onSubmit={handleUpdate}>
                <div className="mb-3">
                  <label className="form-label text-white-50">Nombre del Producto</label>
                  <select
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="form-select bg-dark text-white border-secondary mb-3"
                    required
                  >
                    <option value="" disabled hidden>
                      Seleccione Nombre del Producto
                    </option>
                    {OPCIONES_REPUESTOS.map((prod, idx) => (
                      <option key={idx} value={prod} style={{ backgroundColor: '#212529', color: '#fff' }}>
                        {prod}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-white-50">Cantidad</label>
                  <input
                    type="number"
                    name="cantidad"
                    className="form-control"
                    placeholder="Cantidad"
                    min="0"
                    value={formData.cantidad}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-white-50">Precio</label>
                  <input
                    type="number"
                    name="precio"
                    className="form-control"
                    placeholder="Precio Unitario"
                    min="0"
                    step="any"
                    value={formData.precio}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-registrar w-100">
                  Guardar Cambios
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Inventario;