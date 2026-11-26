export function CerrarSesion() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('role');
  localStorage.removeItem('token');
  localStorage.removeItem('role');
}