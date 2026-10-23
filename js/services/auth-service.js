import { get, post, session } from './api-client.js';
import { HOME_BY_ROLE } from '../config/api-config.js';
export const auth = {
  async login(correo, contrasena) { const r = await post('/api/auth/login', { correo, contrasena }); session.token = r.token; session.user = r.usuario; return r.usuario; },
  register: (b) => post('/api/auth/register', b), // siempre crea un cliente
  async me() { const r = await get('/api/auth/me'); session.user = r.usuario || r.data || r; return session.user; },
  logout() { session.clear(); location.href = '/'; },
};
export const homeFor = (u) => HOME_BY_ROLE[u?.rol] || '/';
export const isStaff = (u = session.user) => ['administrador', 'trabajador'].includes(u?.rol);
// Protege la página según roles permitidos (null = pública)
export function guard(roles) {
  if (!roles) return true;
  if (!session.token) { location.href = '/pages/login.html?next=' + encodeURIComponent(location.pathname); return false; }
  if (!roles.includes(session.user?.rol)) { location.href = homeFor(session.user); return false; }
  return true;
}
