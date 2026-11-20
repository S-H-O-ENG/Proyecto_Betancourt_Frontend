const API_URL = 'http://localhost:8080/api/v1/auth';

<<<<<<< HEAD
export async function loginConBackend(correo, password) {
  // 1. Petición POST a /api/v1/auth/login
  const resLogin = await fetch(`${API_URL}/login`, {
=======
export async function iniciarSesion(correo, password) {
  const response = await fetch(`${API_URL}/login`, {
>>>>>>> c28695313f8f265c8c7b6687dbe0beb6a7edc3ff
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password }),
  });

<<<<<<< HEAD
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
=======
  if (!response.ok) {
    throw new Error('Error al iniciar sesión: credenciales incorrectas');
  }

  const data = await response.json();
  localStorage.setItem('token', data.accessToken);
  return data;
}

export async function obtenerPerfil() {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('No autorizado o token inválido');
  }

  return await response.json();
>>>>>>> c28695313f8f265c8c7b6687dbe0beb6a7edc3ff
}