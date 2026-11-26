import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import NavbarJefe from '../components/NavbarJefe';
import '../css/Pedidos.css';


function Pedidos() {
    const API_URL = 'http://localhost:8080/api/pedidos';

    const [carga, setCarga] = useState(false); //esta es una constante que se usa para evitar que se dupliquen lo datos al enviarlos a la bd,json (esto es una variable boolenao, por eso el estado inicial es falso)


    //como usar use state, como hacer crud funcinal, etc
    //creamos una constante que se va a encargar e almacenar ls datos para luegon pasarlos al db.json

    const [datos, setDatos] = useState({
        nombre: '',
        apellido: '',
        rol: '',
        proveedor: '',
        repuesto: '',
        cantidad: 1,
        importancia: '',
        metodopago: '',
        estado: 'Pendiente'
    });
    //cons = constante, datos = nombre que le damos a la constante, setDatos = es la manera de modificar datos, osea si ponemos datos = 1, no va a funcionar,setDatos es la unnica autorizada a modificar el campo, mas abajo estan todos los campos que se van a recibir, nombre apellido repuesto etc, y de ultimas el estado en pendiente, siempre nace en pendiennte pq un pedido recien hecho siempre es un pedido pendiente



    //funcion que se usa para enviar los datos anteriores a la constante
    //(e) dice que la funcion recibe un evento

    //aqui llamamos a setdatos para copiar todo el conetnido de esa constante a esa constante, por eso el setdatos, pq estamos modificando esa constante
    //el ... antes de datos es un operador que copia todo el contenido que ya tenia la constante, para evitar que se pierdan datos
    //e.target.name captura el atributo name de el html, ese atributo es el que disparo el cambio
    //e.target.value captura el texto que el usuario escribio o selecciono
    function actualizardatos(e) {
        const { name, value } = e.target;

        setDatos((prev) => ({
            ...prev,
            [name]: name === 'cantidad' ? Number(value) : value
        }));
    }


    // async = indica que la función es asíncrona porque la petición HTTP hacia la API en Spring Boot tarda un momento en responder
    // esta función se encarga de armar los datos del pedido, enviarlos por POST y mostrar el resultado al usuario; recibe el evento (e) del formulario
    async function enviardatos(e) {
        e.preventDefault(); // evita que el navegador recargue la página al enviar el formulario y se pierda el estado

        // primera barrera de seguridad contra doble clic o envíos repetidos:
        // si 'carga' ya está en true, significa que hay una petición en curso y detenemos la función con return
        if (carga) return;

        // marcamos 'carga' en true para bloquear nuevos envíos mientras se procesa este pedido
        setCarga(true);

        // recuperamos el token JWT guardado en sessionStorage al iniciar sesión
        const token = sessionStorage.getItem('token');

        // preparamos el objeto que se enviará al backend:
        // aseguramos que 'cantidad' viaje como número (y no como texto) y que 'estado' nazca en 'Pendiente'
        const payload = {
            ...datos,
            cantidad: Number(datos.cantidad),
            estado: 'Pendiente'
        };

        // usamos try / catch / finally para manejar respuestas exitosas, errores de red/servidor y liberar 'carga' siempre
        try {
            // axios.post(url, cuerpo, configuracion) envía el JSON a /api/pedidos junto con el header Authorization: Bearer <token>
            // 'await' espera la respuesta del servidor y 'respuesta' guarda el status, headers y datos devueltos por el backend
            const respuesta = await axios.post(API_URL, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // si el servidor respondió bien (por ejemplo 201 Created), mostramos la alerta de éxito
            Swal.fire('Pedido Creado Con Exito');

            // limpiamos el formulario dejando 'cantidad' en 1 y 'estado' en 'Pendiente' para el siguiente pedido
            setDatos({
                nombre: '',
                apellido: '',
                rol: '',
                proveedor: '',
                repuesto: '',
                cantidad: 1,
                importancia: '',
                metodopago: '',
                estado: 'Pendiente'
            });
        } catch (error) {
            // si ocurre algún error (token inválido/vencido, fallo de red o error del backend), mostramos la alerta de fallo
            Swal.fire('No Se Ha Podido Crear El Pedido');
            console.log('Token leído:', token);
            console.error('Error POST pedidos:', error.response?.status, error.response?.data, error.message);
        } finally {
            // 'finally' se ejecuta siempre (haya salido bien o mal) para devolver 'carga' a false y permitir futuros envíos
            setCarga(false);
        }
    }

    return (
        <>
            <NavbarJefe />
            <div className="container">


                {/*aqui agregamos on submit al formulario para que permita que todo lo que se haga aca sea enviado a la funcion designada*/}

                <form className="formulario" onSubmit={enviardatos}>

                    <div className="input-group">
                        <span className="input-group-text">Nombres y apellidos</span>
                        <input
                            type="text"
                            aria-label="First name"
                            className="form-control"
                            name="nombre"
                            value={datos.nombre}
                            onChange={actualizardatos}
                            required
                        />
                        <input
                            type="text"
                            aria-label="Last name"
                            className="form-control"
                            name="apellido"
                            value={datos.apellido}
                            onChange={actualizardatos}
                            required
                        />
                    </div>

                    <div className="rol">
                        <label htmlFor="rol">Seleccione su rol en el taller</label>
                        <select
                            id="rol"
                            className="form-select"
                            name="rol"
                            value={datos.rol}
                            onChange={actualizardatos}
                            required
                        >
                            <option value="">Seleccione una opcion</option>
                            <option value="Jefe del taller">Jefe del taller</option>
                        </select>
                    </div>

                    <div className="proveedor">
                        <label htmlFor="proveedor">Seleccione un proveedor</label>
                        <select
                            id="proveedor"
                            className="form-select"
                            name="proveedor"
                            value={datos.proveedor}
                            onChange={actualizardatos}
                            required
                        >
                            <option value="">Seleccione una opcion</option>
                            <option value="Proveedor 1">Proveedor 1</option>
                            <option value="Proveedor 2">Proveedor 2</option>
                            <option value="Proveedor 3">Proveedor 3</option>
                        </select>
                    </div>

                    <div className="pagom">
                        <label htmlFor="repuesto">Repuesto Requerido</label>
                        <select
                            id="repuesto"
                            name="repuesto"
                            className="form-select"
                            value={datos.repuesto}
                            onChange={actualizardatos}
                            required
                        >
                            <option value="">Seleccione una opcion</option>
                            <option value="1">Aceite Sintético 10W40</option>
                            <option value="2">Filtro de Aceite</option>
                            <option value="3">Filtro de Aire</option>
                            <option value="4">Pastillas de Freno Delanteras</option>
                            <option value="5">Discos de Freno</option>
                            <option value="6">Batería 12V 800A</option>
                            <option value="7">Líquido de Frenos DOT4</option>
                            <option value="8">Amortiguador Delantero</option>
                            <option value="9">Liquido Refrigerante</option>
                            <option value="10">Bujía de Iridio</option>
                        </select>
                    </div>

                    <label htmlFor="range4" className="form-label">
                        Cantidad de repuestos requerida: <strong>{datos.cantidad}</strong>
                    </label>
                    <input
                        type="range"
                        name="cantidad"
                        className="form-range"
                        min="1"
                        max="100"
                        value={datos.cantidad}
                        id="range4"
                        onChange={actualizardatos}
                        required
                    />

                    <div className="importancia">
                        <label>Seleccione la importancia del pedido</label> <br />
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="importancia"
                                id="alta"
                                value="alta"
                                checked={datos.importancia === 'alta'}
                                onChange={actualizardatos}
                                required
                            />
                            <label className="form-check-label" htmlFor="alta">Alta</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="importancia"
                                id="media"
                                value="media"
                                checked={datos.importancia === 'media'}
                                onChange={actualizardatos}
                                required
                            />
                            <label className="form-check-label" htmlFor="media">Media</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="importancia"
                                id="baja"
                                value="baja"
                                checked={datos.importancia === 'baja'}
                                onChange={actualizardatos}
                                required
                            />
                            <label className="form-check-label" htmlFor="baja">Baja</label>
                        </div>
                    </div>

                    <div className="pagom">
                        <label htmlFor="metodopago">Seleccione un metodo de pago</label>
                        <select
                            id="metodopago"
                            className="form-select"
                            name="metodopago"
                            value={datos.metodopago}
                            onChange={actualizardatos}
                            required
                        >
                            <option value="">Seleccione una opcion</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="efectivo">Efectivo</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-enviar" disabled={carga}>
                        {carga ? 'Enviando...' : 'Solicitar Pedido'}
                    </button>
                </form>

            </div>
        </>
    )
}

export default Pedidos;