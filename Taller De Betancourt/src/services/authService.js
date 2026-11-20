const API_URL = 'http://localhost:8080/api/v1/auth';

export async function loginConBackend(correo, password) {
  // 1. Petición POST a /api/v1/auth/login
  const resLogin = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password }),
  });

  if (!resLogin.ok) {
    throw new Error('Correo o contraseña incorrectos');
  }

  const { accessToken } = await resLogin.json();
  localStorage.setItem('token', accessToken);

  // 2. Petición GET a /api/v1/auth/me con el Bearer token
  const resPerfil = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!resPerfil.ok) {
    throw new Error('No se pudo obtener el perfil del usuario');
  }

  const usuario = await resPerfil.json(); // { idUsuario, nombre, apellido, correo, rol }
  
  // Guardamos el rol para que tus Navbars y rutas sigan funcionando igual
  localStorage.setItem('userRole', usuario.rol);
  return usuario;
}