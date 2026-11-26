import { useState, useEffect } from 'react';
// useState: guarda el arreglo de pedidos y re-renderiza la tabla cuando cambia
// useEffect: ejecuta la carga inicial de pedidos una sola vez al montar el componente
import axios from 'axios';
import Swal from 'sweetalert2';

import NavbarJefe from '../components/NavbarJefe';
import '../css/InicioJefe.css';

const API_URL = 'http://localhost:8080/api/pedidos';

function InicioJefe() {
    // Arreglo vacío inicialmente para que React renderice la estructura sin fallar antes de que llegue la respuesta del backend
    const [datos, setDatos] = useState([]);

    // Obtiene el token desde sessionStorage limpiando posibles comillas o espacios extra
    function obtenerToken() {
        const rawToken = sessionStorage.getItem('token');
        return rawToken ? rawToken.replace(/^"|"$/g, '').trim() : '';
    }

    // Función para consultar todos los pedidos guardados en PostgreSQL
    async function consultar() {
        const token = obtenerToken();

        try {
            const rta = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setDatos(Array.isArray(rta.data) ? rta.data : []);
        } catch (error) {
            console.error('Error al obtener pedidos:', error.response?.status || error.message);
            Swal.fire('Error al obtener registros');
        }
    }

    // Se ejecuta una sola vez al entrar a la vista de Inicio
    useEffect(() => {
        consultar();
    }, []);

    // Función para actualizar el estado ('Recibido' o 'Cancelado') de un pedido
    const cambiarestado = async (id, nuevoestado) => {
        const token = obtenerToken(sessionStorage.getItem('token'));

        try {
            await axios.patch(
                `${API_URL}/${id}/estado`,
                { estado: nuevoestado },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            consultar();
        } catch (error) {
            console.error('Error al actualizar estado:', error.response?.status || error.message);
            Swal.fire('Error al actualizar');
        }
    };

    const obtenerClaseEstado = (estado) => {
        if (estado === 'Recibido') return 'badge-estado badge-recibido';
        if (estado === 'Cancelado') return 'badge-estado badge-cancelado';
        return 'badge-estado badge-pendiente';
    };

    return (
        <>
            <NavbarJefe />

            <div className="contenido container-fluid py-4">
                <br />
                <div className="tabla-pedidos-container">
                    <h2 className="mb-4 text-center fw-bold">Estado Pedidos</h2>

                    <div className="row align-items-center encabezado-tabla fw-bold pb-2 mb-2">
                        <div className="col-1 text-center">ID PEDIDO</div>
                        <div className="col-3">Repuesto</div>
                        <div className="col-2">Proveedor</div>
                        <div className="col-1 text-center">Cantidad</div>
                        <div className="col-2 text-center">Importancia</div>
                        <div className="col-3 text-center">Estado</div>
                    </div>

                    {datos.map((pedido, index) => {
                        const pedidoId = pedido.idpedido ?? pedido.id ?? index + 1;

                        return (
                            <div className="row align-items-center fila-pedido py-2" key={pedidoId}>
                                <div className="col-1 text-center fw-bold opacity-75">{pedidoId}</div>
                                <div className="col-3 text-truncate">{pedido.repuesto}</div>
                                <div className="col-2 text-truncate">{pedido.proveedor}</div>
                                <div className="col-1 text-center">{pedido.cantidad}</div>
                                <div className="col-2 text-center text-capitalize">{pedido.importancia}</div>

                                <div className="col-3 d-flex align-items-center justify-content-center gap-2">
                                    <span className={obtenerClaseEstado(pedido.estado)}>{pedido.estado}</span>

                                    <button
                                        className="btn btn-outline-success btn-micro"
                                        onClick={() => cambiarestado(pedidoId, 'Recibido')}
                                        disabled={pedido.estado === 'Cancelado' || pedido.estado === 'Recibido'}
                                    >
                                        Recibido
                                    </button>
                                    <button
                                        className="btn btn-outline-danger btn-micro"
                                        onClick={() => cambiarestado(pedidoId, 'Cancelado')}
                                        disabled={pedido.estado === 'Recibido' || pedido.estado === 'Cancelado'}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export default InicioJefe;