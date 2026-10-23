import { get, post, patch, del } from './api-client.js';
export const vehicles = { list: (p) => get('/api/vehiculos', p), get: (id) => get(`/api/vehiculos/${id}`), create: (b) => post('/api/vehiculos', b), update: (id, b) => patch(`/api/vehiculos/${id}`, b), remove: (id) => del(`/api/vehiculos/${id}`) };
