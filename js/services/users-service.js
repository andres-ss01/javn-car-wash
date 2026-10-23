import { get, post, patch, del } from './api-client.js';
export const users = { list: (p) => get('/api/usuarios', p), get: (id) => get(`/api/usuarios/${id}`), create: (b) => post('/api/usuarios', b), update: (id, b) => patch(`/api/usuarios/${id}`, b), remove: (id) => del(`/api/usuarios/${id}`) };
