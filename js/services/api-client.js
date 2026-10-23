import { API_BASE } from '../config/api-config.js';
const decode = (t) => { try { return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch { return null; } };
export const session = {
  get token() { const t = localStorage.getItem('javn_token'); const exp = decode(t || '')?.exp; if (t && exp && exp * 1000 < Date.now()) { this.clear(); return null; } return t; },
  set token(t) { t ? localStorage.setItem('javn_token', t) : localStorage.removeItem('javn_token'); },
  get user() { try { return JSON.parse(localStorage.getItem('javn_user')); } catch { return null; } },
  set user(u) { u ? localStorage.setItem('javn_user', JSON.stringify(u)) : localStorage.removeItem('javn_user'); },
  clear() { localStorage.removeItem('javn_token'); localStorage.removeItem('javn_user'); },
};
export async function request(path, { method = 'GET', body, params } = {}) {
  const clean = params && Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
  const qs = clean && Object.keys(clean).length ? '?' + new URLSearchParams(clean) : '';
  let res;
  try {
    res = await fetch(API_BASE + path + qs, { method, headers: { 'Content-Type': 'application/json', ...(session.token && { Authorization: 'Bearer ' + session.token }) }, body: body ? JSON.stringify(body) : undefined });
  } catch { throw new Error('No se pudo conectar con el servidor'); }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && session.token) { session.clear(); location.href = '/pages/login.html'; }
  if (!res.ok) throw new Error(data.message || data.error || `Error ${res.status}`);
  return data;
}
export const get = (p, params) => request(p, { params });
export const post = (p, body) => request(p, { method: 'POST', body });
export const patch = (p, body) => request(p, { method: 'PATCH', body });
export const put = (p, body) => request(p, { method: 'PUT', body });
export const del = (p) => request(p, { method: 'DELETE' });
export const list = (r) => (Array.isArray(r) ? r : r?.data ?? r?.items ?? r?.rows ?? []);
