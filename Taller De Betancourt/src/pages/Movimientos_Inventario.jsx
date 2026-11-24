import React, { useState, useMemo } from "react";
import NavbarInventario from "../components/NavbarInventario";
import "../css/Movimientos.css";

/**
 * Regla de negocio al registrar acciones desde Productos:
 * - Agregar producto: tipo "Entrada" (si cantidad > 0) o "Ajuste" (si cantidad = 0)
 * - Modificar producto:
 *     - Si sube la cantidad -> tipo "Entrada", cantidad = diferencia
 *     - Si baja la cantidad -> tipo "Salida", cantidad = Math.abs(diferencia)
 *     - Si solo cambian datos sin variar cantidad -> tipo "Ajuste", cantidad = 0
 * - Borrar producto: si tenía stock > 0 -> tipo "Salida", cantidad = stockAnterior
 */
export function construirMovimientoPorAccionProducto({
  accion, // "AGREGAR" | "MODIFICAR" | "BORRAR"
  productoActual,
  productoAnterior = null,
  responsable = "Administrador",
  fechaEstipulada = new Date().toISOString().slice(0, 10)
}) {
  const ahora = new Date();
  const fechaRegistro = `${ahora.toISOString().slice(0, 10)} ${ahora
    .toTimeString()
    .slice(0, 5)}`;
  const idGenerado = `MOV-${Date.now().toString().slice(-5)}`;

  if (accion === "AGREGAR") {
    const cant = Number(productoActual.cantidad ?? 0);
    return {
      id: idGenerado,
      fechaEstipulada,
      fechaRegistro,
      tipo: cant > 0 ? "Entrada" : "Ajuste",
      motivo: "Registro de nuevo producto",
      productoId: productoActual.id,
      productoNombre: productoActual.nombre ?? productoActual.Lproducto,
      cantidad: cant,
      responsable,
      estado: "Activo",
      observaciones: `Producto agregado al inventario (stock inicial: ${cant}).`
    };
  }

  if (accion === "MODIFICAR") {
    const cantNueva = Number(productoActual.cantidad ?? 0);
    const cantPrevia = Number(productoAnterior?.cantidad ?? 0);
    const diferencia = cantNueva - cantPrevia;

    let tipo = "Ajuste";
    let cantidadMov = 0;
    let motivo = "Modificación de producto";

    if (diferencia > 0) {
      tipo = "Entrada";
      cantidadMov = diferencia;
      motivo = "Incremento de stock por edición de producto";
    } else if (diferencia < 0) {
      tipo = "Salida";
      cantidadMov = Math.abs(diferencia);
      motivo = "Reducción de stock por edición de producto";
    }

    return {
      id: idGenerado,
      fechaEstipulada,
      fechaRegistro,
      tipo,
      motivo,
      productoId: productoActual.id,
      productoNombre: productoActual.nombre ?? productoActual.Lproducto,
      cantidad: cantidadMov,
      responsable,
      estado: "Activo",
      observaciones: `Stock anterior: ${cantPrevia} -> Stock nuevo: ${cantNueva}.`
    };
  }

  const cantEliminada = Number(
    productoAnterior?.cantidad ?? productoActual?.cantidad ?? 0
  );
  return {
    id: idGenerado,
    fechaEstipulada,
    fechaRegistro,
    tipo: cantEliminada > 0 ? "Salida" : "Ajuste",
    motivo: "Eliminación de producto",
    productoId: productoActual?.id ?? productoAnterior?.id,
    productoNombre:
      productoActual?.nombre ??
      productoActual?.Lproducto ??
      productoAnterior?.nombre ??
      productoAnterior?.Lproducto,
    cantidad: cantEliminada,
    responsable,
    estado: "Activo",
    observaciones: `Producto eliminado del inventario (unidades retiradas: ${cantEliminada}).`
  };
}

export default function Movimientos({
  movimientos = [],
  onRegistrarMovimiento,
  setVistaActual,
  alSalir
}) {
  // Filtros (Requerimiento 5)
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("Todos");
  const [productoFiltro, setProductoFiltro] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 6;

  // Modales y notificaciones
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
  const [modalReporteAbierto, setModalReporteAbierto] = useState(false);
  const [mensajeSistema, setMensajeSistema] = useState(null);

  // Validación fecha inicial <= fecha final
  const errorRangoFechas = useMemo(() => {
    if (fechaInicial && fechaFinal && fechaInicial > fechaFinal) {
      return "La fecha inicial no puede ser mayor a la fecha final.";
    }
    return "";
  }, [fechaInicial, fechaFinal]);

  // Filtrado acumulativo + orden del más reciente al más antiguo por fecha estipulada
  const movimientosFiltrados = useMemo(() => {
    if (errorRangoFechas) return [];

    return movimientos
      .filter((mov) => {
        if (fechaInicial && mov.fechaEstipulada < fechaInicial) return false;
        if (fechaFinal && mov.fechaEstipulada > fechaFinal) return false;
        if (tipoFiltro !== "Todos" && mov.tipo !== tipoFiltro) return false;

        if (productoFiltro.trim() !== "") {
          const termino = productoFiltro.toLowerCase().trim();
          const coincideNombre = String(mov.productoNombre || "")
            .toLowerCase()
            .includes(termino);
          const coincideId = String(mov.productoId || "")
            .toLowerCase()
            .includes(termino);
          const coincideCod = String(mov.id || "")
            .toLowerCase()
            .includes(termino);
          if (!coincideNombre && !coincideId && !coincideCod) return false;
        }

        return true;
      })
      .sort((a, b) =>
        String(b.fechaEstipulada).localeCompare(String(a.fechaEstipulada))
      );
  }, [
    movimientos,
    fechaInicial,
    fechaFinal,
    tipoFiltro,
    productoFiltro,
    errorRangoFechas
  ]);

  // Totales excluyendo "Anulado"
  const resumen = useMemo(() => {
    let totalEntradas = 0;
    let totalSalidas = 0;

    movimientosFiltrados.forEach((mov) => {
      if (mov.estado === "Anulado") return;
      if (mov.tipo === "Entrada") totalEntradas += Number(mov.cantidad || 0);
      if (mov.tipo === "Salida") totalSalidas += Number(mov.cantidad || 0);
    });

    return {
      totalRegistros: movimientosFiltrados.length,
      totalEntradas,
      totalSalidas
    };
  }, [movimientosFiltrados]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(movimientosFiltrados.length / itemsPorPagina)
  );
  const movimientosPaginados = movimientosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const handleLimpiarFiltros = () => {
    setFechaInicial("");
    setFechaFinal("");
    setTipoFiltro("Todos");
    setProductoFiltro("");
    setPaginaActual(1);
    setMensajeSistema(null);
  };

  // Requerimiento 6: Comprobante PDF individual (solo lectura)
  const handleDescargarPdfIndividual = (mov) => {
    const nombreArchivo = `Movimiento_${mov.id}_${mov.fechaEstipulada}.pdf`;
    // TODO: Conectar a endpoint Spring Boot GET /api/movimientos/{id}/pdf
    setMensajeSistema({
      tipo: "ok",
      texto: `Comprobante listo para descarga (solo lectura): ${nombreArchivo}`
    });
  };

  // Requerimiento 6: Reporte consolidado PDF por rango y filtros activos
  const handleGenerarReporteConsolidado = (e) => {
    e.preventDefault();
    if (!fechaInicial || !fechaFinal) {
      setMensajeSistema({
        tipo: "error",
        texto:
          "Debe ingresar fecha inicial y fecha final válidas para el reporte consolidado."
      });
      return;
    }
    if (errorRangoFechas) {
      setMensajeSistema({ tipo: "error", texto: errorRangoFechas });
      return;
    }
    if (movimientosFiltrados.length === 0) {
      setMensajeSistema({
        tipo: "error",
        texto:
          "No hay movimientos con los filtros actuales para generar el reporte PDF."
      });
      return;
    }

    const nombreReporte = `Reporte_Movimientos_${fechaInicial}_a_${fechaFinal}.pdf`;
    // TODO: Conectar a endpoint Spring Boot GET /api/movimientos/reporte-pdf
    setModalReporteAbierto(false);
    setMensajeSistema({
      tipo: "ok",
      texto: `Reporte generado: ${nombreReporte} (${movimientosFiltrados.length} registros)`
    });
  };

  if (typeof window !== "undefined" && onRegistrarMovimiento) {
    window.__registrarMovimientoInventario = onRegistrarMovimiento;
  }

  return (
    
    <div className="d-flex">
      <NavbarInventario
        setVistaActual={setVistaActual}
        vistaActiva="Movimientos"
        alSalir={alSalir}
      />

      <main className="mov-contenido flex-grow-1">
        {/* Encabezado y KPIs */}
        <section className="mov-kpi-grid">
          <div className="mov-card mov-kpi-card">
            <div className="mov-kpi-icon">⇄</div>
            <div>
              <div className="mov-kpi-value">{resumen.totalRegistros}</div>
              <div className="mov-kpi-label">Movimientos registrados</div>
            </div>
          </div>

          <div className="mov-card mov-kpi-card">
            <div className="mov-kpi-icon"></div>
            <div>
              <div className="mov-kpi-value">{resumen.totalEntradas}</div>
              <div className="mov-kpi-label">Unidades entradas (válidas)</div>
            </div>
          </div>

          <div className="mov-card mov-kpi-card">
            <div className="mov-kpi-icon"></div>
            <div>
              <div className="mov-kpi-value">{resumen.totalSalidas}</div>
              <div className="mov-kpi-label">Unidades salidas (válidas)</div>
            </div>
          </div>
        </section>

        {/* Panel de título, filtros y reporte PDF */}
        <section className="mov-card mov-panel">
          <div className="mov-panel-header">
            <h1>Movimientos</h1>
            <button
              type="button"
              className="mov-btn-primary"
              onClick={() => setModalReporteAbierto(true)}
            >
              + Reporte PDF
            </button>
          </div>

          <div className="mov-filters-bar">
            <div className="mov-field">
              <label>Fecha inicial (estipulada)</label>
              <input
                type="date"
                value={fechaInicial}
                onChange={(e) => {
                  setFechaInicial(e.target.value);
                  setPaginaActual(1);
                }}
              />
            </div>

            <div className="mov-field">
              <label>Fecha final (estipulada)</label>
              <input
                type="date"
                value={fechaFinal}
                onChange={(e) => {
                  setFechaFinal(e.target.value);
                  setPaginaActual(1);
                }}
              />
            </div>

            <div className="mov-field">
              <label>Tipo</label>
              <select
                value={tipoFiltro}
                onChange={(e) => {
                  setTipoFiltro(e.target.value);
                  setPaginaActual(1);
                }}
              >
                <option value="Todos">Todos</option>
                <option value="Entrada">Entrada</option>
                <option value="Salida">Salida</option>
                <option value="Ajuste">Ajuste</option>
              </select>
            </div>

            <div className="mov-field mov-field-grow">
              <label>Producto (nombre o ID)</label>
              <input
                type="text"
                placeholder="Buscar por nombre o ID..."
                value={productoFiltro}
                onChange={(e) => {
                  setProductoFiltro(e.target.value);
                  setPaginaActual(1);
                }}
              />
            </div>

            <button
              type="button"
              className="mov-btn-secondary"
              onClick={handleLimpiarFiltros}
            >
              Limpiar filtros
            </button>
          </div>

          {errorRangoFechas && (
            <div className="mov-alert mov-alert-error">{errorRangoFechas}</div>
          )}

          {mensajeSistema && !errorRangoFechas && (
            <div className={`mov-alert mov-alert-${mensajeSistema.tipo}`}>
              <span>{mensajeSistema.texto}</span>
              <button type="button" onClick={() => setMensajeSistema(null)}>
                ✕
              </button>
            </div>
          )}
        </section>

        {/* Tabla vacía al inicio (sin datos inventados) */}
        <section className="mov-table-wrapper">
          <table className="mov-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha Estipulada</th>
                <th>Tipo</th>
                <th>Motivo</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Responsable</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movimientosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="9" className="mov-empty-row">
                    {errorRangoFechas
                      ? errorRangoFechas
                      : movimientos.length === 0
                      ? "Aún no hay movimientos registrados. Agrega, modifica o elimina un producto para registrar movimientos."
                      : "No se encontraron movimientos para los criterios seleccionados."}
                  </td>
                </tr>
              ) : (
                movimientosPaginados.map((mov) => (
                  <tr
                    key={mov.id}
                    className={mov.estado === "Anulado" ? "mov-row-anulado" : ""}
                  >
                    <td>{mov.id}</td>
                    <td>{mov.fechaEstipulada}</td>
                    <td>
                      <span
                        className={`mov-type-tag mov-type-${String(
                          mov.tipo || ""
                        ).toLowerCase()}`}
                      >
                        {mov.tipo}
                      </span>
                    </td>
                    <td>{mov.motivo}</td>
                    <td>{mov.productoNombre}</td>
                    <td>{mov.cantidad}</td>
                    <td>{mov.responsable}</td>
                    <td>
                      <span
                        className={`mov-badge ${
                          mov.estado === "Anulado"
                            ? "mov-badge-anulado"
                            : "mov-badge-activo"
                        }`}
                      >
                        {mov.estado}
                      </span>
                    </td>
                    <td className="mov-actions">
                      <button
                        type="button"
                        className="mov-icon-btn mov-btn-view"
                        title="Ver detalle"
                        onClick={() => setMovimientoSeleccionado(mov)}
                      >
                        
                      </button>
                      <button
                        type="button"
                        className="mov-icon-btn mov-btn-pdf"
                        title="Descargar comprobante PDF"
                        onClick={() => handleDescargarPdfIndividual(mov)}
                      >
                        
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {movimientosFiltrados.length > 0 && (
            <div className="mov-pagination">
              <span>
                Página {paginaActual} de {totalPaginas}
              </span>
              <div className="mov-pagination-btns">
                <button
                  type="button"
                  disabled={paginaActual === 1}
                  onClick={() => setPaginaActual((p) => p - 1)}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPaginaActual((p) => p + 1)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Modal Detalle Movimiento Individual */}
        {movimientoSeleccionado && (
          <div
            className="mov-modal-overlay"
            onClick={() => setMovimientoSeleccionado(null)}
          >
            <div
              className="mov-card mov-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mov-modal-header">
                <h3>Detalle {movimientoSeleccionado.id}</h3>
                <button
                  type="button"
                  className="mov-close-btn"
                  onClick={() => setMovimientoSeleccionado(null)}
                >
                  ✕
                </button>
              </div>

              {movimientoSeleccionado.estado === "Anulado" && (
                <div className="mov-alert mov-alert-error">
                  ANULADO — No suma ni resta en los totales.
                </div>
              )}

              <div className="mov-detail-grid">
                <div>
                  <span className="mov-detail-label">Fecha estipulada</span>
                  <p>{movimientoSeleccionado.fechaEstipulada}</p>
                </div>
                <div>
                  <span className="mov-detail-label">Fecha registro</span>
                  <p>{movimientoSeleccionado.fechaRegistro}</p>
                </div>
                <div>
                  <span className="mov-detail-label">Tipo</span>
                  <p>{movimientoSeleccionado.tipo}</p>
                </div>
                <div>
                  <span className="mov-detail-label">Motivo</span>
                  <p>{movimientoSeleccionado.motivo}</p>
                </div>
                <div>
                  <span className="mov-detail-label">Producto</span>
                  <p>
                    {movimientoSeleccionado.productoId} -{" "}
                    {movimientoSeleccionado.productoNombre}
                  </p>
                </div>
                <div>
                  <span className="mov-detail-label">Cantidad</span>
                  <p>{movimientoSeleccionado.cantidad}</p>
                </div>
                <div>
                  <span className="mov-detail-label">Responsable</span>
                  <p>{movimientoSeleccionado.responsable}</p>
                </div>
                <div>
                  <span className="mov-detail-label">Estado</span>
                  <p>{movimientoSeleccionado.estado}</p>
                </div>
                <div className="mov-detail-full">
                  <span className="mov-detail-label">Observaciones</span>
                  <p>{movimientoSeleccionado.observaciones || "—"}</p>
                </div>
              </div>

              <div className="mov-modal-footer">
                <button
                  type="button"
                  className="mov-btn-secondary"
                  onClick={() => setMovimientoSeleccionado(null)}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="mov-btn-primary"
                  onClick={() =>
                    handleDescargarPdfIndividual(movimientoSeleccionado)
                  }
                >
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Reporte Consolidado PDF */}
        {modalReporteAbierto && (
          <div
            className="mov-modal-overlay"
            onClick={() => setModalReporteAbierto(false)}
          >
            <div
              className="mov-card mov-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mov-modal-header">
                <h3>Reporte Consolidado PDF</h3>
                <button
                  type="button"
                  className="mov-close-btn"
                  onClick={() => setModalReporteAbierto(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleGenerarReporteConsolidado}>
                <div className="mov-modal-form-grid">
                  <div className="mov-field">
                    <label>Fecha inicial *</label>
                    <input
                      type="date"
                      value={fechaInicial}
                      onChange={(e) => setFechaInicial(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mov-field">
                    <label>Fecha final *</label>
                    <input
                      type="date"
                      value={fechaFinal}
                      onChange={(e) => setFechaFinal(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mov-summary-box">
                  <div>
                    <strong>Tipo:</strong> {tipoFiltro}
                  </div>
                  <div>
                    <strong>Producto:</strong> {productoFiltro || "Todos"}
                  </div>
                  <div>
                    <strong>Registros:</strong> {movimientosFiltrados.length}
                  </div>
                  <div>
                    <strong>Totales válidos:</strong> +{resumen.totalEntradas}{" "}
                    entradas / -{resumen.totalSalidas} salidas
                  </div>
                </div>

                {errorRangoFechas && (
                  <div className="mov-alert mov-alert-error">
                    {errorRangoFechas}
                  </div>
                )}

                <div className="mov-modal-footer">
                  <button
                    type="button"
                    className="mov-btn-secondary"
                    onClick={() => setModalReporteAbierto(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="mov-btn-primary"
                    disabled={
                      !!errorRangoFechas ||
                      !fechaInicial ||
                      !fechaFinal ||
                      movimientosFiltrados.length === 0
                    }
                  >
                    Generar PDF
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}