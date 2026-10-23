import { get, post, put, patch, del } from './api-client.js';
export const services = { list: () => get('/api/servicios'), all: () => get('/api/servicios/admin/todos'), get: (id) => get(`/api/servicios/${id}`), create: (b) => post('/api/servicios', b), update: (id, b) => patch(`/api/servicios/${id}`, b), remove: (id) => del(`/api/servicios/${id}`) };
export const vehicleTypes = { list: () => get('/api/tipos-vehiculo'), create: (b) => post('/api/tipos-vehiculo', b), update: (id, b) => patch(`/api/tipos-vehiculo/${id}`, b), remove: (id) => del(`/api/tipos-vehiculo/${id}`) };
export const schedules = { list: () => get('/api/horarios'), save: (dia, b) => put(`/api/horarios/${dia}`, b), remove: (dia) => del(`/api/horarios/${dia}`) };
