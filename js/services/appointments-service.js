import { get, post, patch } from './api-client.js';
export const appointments = {
  availability: (fecha, servicios) => get('/api/citas/disponibilidad', { fecha, servicios: servicios.join(',') }),
  list: (p) => get('/api/citas', p), get: (id) => get(`/api/citas/${id}`),
  create: (b) => post('/api/citas', b), // { idVehiculo, fechaHoraInicio:'YYYY-MM-DD HH:mm', servicios:[ids], notas }
  cancel: (id) => patch(`/api/citas/${id}/cancelar`),
  setState: (id, estado) => patch(`/api/citas/${id}/estado`, { estado }), // confirmada | cancelada | no_asistio
};
