import { get, post, del } from './api-client.js';
export const orders = {
  states: () => get('/api/ordenes/estados'), list: (p) => get('/api/ordenes', p), get: (id) => get(`/api/ordenes/${id}`), tracking: (id) => get(`/api/ordenes/${id}/seguimiento`),
  create: (idCita) => post('/api/ordenes', { idCita }), advance: (id) => post(`/api/ordenes/${id}/avanzar`),
  assign: (id, idTrabajador) => post(`/api/ordenes/${id}/trabajadores`, { idTrabajador }), unassign: (id, idTrabajador) => del(`/api/ordenes/${id}/trabajadores/${idTrabajador}`),
};
