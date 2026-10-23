import { get, post, patch } from './api-client.js';
// Nunca enviar número completo de tarjeta ni CVV: solo ultimos4, marcaTarjeta y referencia
export const payments = { list: (p) => get('/api/pagos', p), get: (id) => get(`/api/pagos/${id}`), create: (b) => post('/api/pagos', b), setState: (id, estado) => patch(`/api/pagos/${id}/estado`, { estado }) };
