const API_URL = 'http://localhost:8080/api/v1/auth';

export async function loginConBackend(correo, password) {
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

  const usuario = await obtenerPerfil(accessToken);
  localStorage.setItem('userRole', usuario.rol);
  return usuario;
}

export async function iniciarSesion(correo, password) {
  return loginConBackend(correo, password);
}

export async function obtenerPerfil(accessToken = localStorage.getItem('token')) {
  const response = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('No autorizado o token inválido');
  }

  return response.json();
}
