import { get, patch } from './api-client.js';
export const notifications = { list: (p) => get('/api/notificaciones', p), read: (id) => patch(`/api/notificaciones/${id}/leida`), readAll: () => patch('/api/notificaciones/leer-todas') };
