import { $, esc, on } from '../../utils/dom.js';
import { money, fechaHora, pick, idCita, vehText, txt } from '../../utils/format.js';
import { crudPage } from '../../components/crud-page.js';
import { appointments } from '../../services/appointments-service.js';
import { orders } from '../../services/orders-service.js';
const ESTADOS = ['programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio'];
export default function (root, { only } = {}) {
  const api = crudPage({
    root, title: 'Citas', header: `<select id="fe" aria-label="Estado"><option value="">Todos</option>${ESTADOS.map((e) => `<option>${e}</option>`).join('')}</select><input id="fd" type="date" aria-label="Fecha" style="width:auto">`,
    load: () => appointments.list({ estado: $('#fe').value, fecha: $('#fd').value }),
    columns: [{ label: '#', render: (c) => esc(idCita(c)) }, { label: 'Inicio', render: (c) => esc(fechaHora(pick(c, 'fechaHoraInicio', 'fecha_hora_inicio'))) }, { label: 'Vehículo', render: (c) => esc(vehText(c)) }, { label: 'Cliente', render: (c) => esc(txt(pick(c, 'cliente', 'clienteNombre')) || pick(c, 'idCliente') || '—') }, { label: 'Estado', render: (c) => `<span class="tag">${esc(txt(c.estado))}</span>` }, { label: 'Total', render: (c) => money(pick(c, 'total', 'totalEstimado', 'total_estimado')) }],
    actions: (c0) => {
      const c = { ...c0, estado: txt(c0.estado) }; return [
        ...(c.estado === 'programada' ? [{ label: 'Confirmar', run: (r) => appointments.setState(idCita(r), 'confirmada') }] : []),
        ...(['programada', 'confirmada'].includes(c.estado) ? [{ label: 'Recibir vehículo', run: (r) => orders.create(idCita(r)) }, { label: 'No asistió', run: (r) => appointments.setState(idCita(r), 'no_asistio') }, { label: 'Cancelar', danger: true, confirm: '¿Cancelar la cita?', run: (r) => appointments.setState(idCita(r), 'cancelada') }] : []),
      ];
    },
  });
  on(root, '#fe,#fd', 'change', () => api.refresh()); return api;
}