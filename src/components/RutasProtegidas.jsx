import { Navigate } from 'react-router-dom';

function RutasProtegidas({ children, rolesPermitidos }) {
  const token = sessionStorage.getItem('token');
  const rol = sessionStorage.getItem('role');

  console.log('GUARDA:', { token, rol, rolesPermitidos });

  if (!token) {
    console.log('GUARDA: sin token');
    return <Navigate to="/" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    console.log('GUARDA: rol no permitido');
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RutasProtegidas;