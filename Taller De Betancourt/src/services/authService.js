const API_URL = 'http://localhost:8080/api/v1/auth';

export async function iniciarSesion(correo, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password }),
  });

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
}