import { $, esc, on } from '../utils/dom.js';
import { money, fechaHora, pick, idCita, vehText } from '../utils/format.js';
import { crudPage } from '../components/crud-page.js';
import { appointments } from '../services/appointments-service.js';
import { list } from '../services/api-client.js';
const ini = (c) => pick(c, 'fechaHoraInicio', 'fecha_hora_inicio'), tot = (c) => pick(c, 'total', 'totalEstimado', 'total_estimado');
const veh = vehText;
function receipt(c) {
  const w = window.open('', '_blank'); if (!w) return;
  w.document.write(`<title>Recibo #${idCita(c)}</title><body style="font-family:sans-serif;max-width:420px;margin:30px auto"><h2>JAVN Car Wash</h2><p>Recibo de cita #${idCita(c)}</p><hr><p>Fecha: ${esc(fechaHora(ini(c)))}</p><p>Vehículo: ${esc(veh(c))}</p><p>Estado: ${esc(c.estado)}</p><h3>Total: ${money(tot(c))}</h3></body>`);
  w.document.close(); w.print();
}
export default function (root) {
  const api = crudPage({
    root, title: 'Historial de servicios', subtitle: 'Tus citas y su estado',
    header: `<input id="fd" type="date" aria-label="Fecha" style="width:auto"><input id="fv" placeholder="Vehículo / matrícula" aria-label="Vehículo" style="width:auto">`,
    load: async () => { const r = list(await appointments.list({ fecha: $('#fd').value })), v = $('#fv').value.toLowerCase(); return v ? r.filter((c) => veh(c).toLowerCase().includes(v)) : r; },
    columns: [{ label: '#', render: (c) => esc(idCita(c)) }, { label: 'Fecha', render: (c) => esc(fechaHora(ini(c))) }, { label: 'Vehículo', render: (c) => esc(veh(c)) }, { label: 'Estado', render: (c) => `<span class="tag">${esc(c.estado)}</span>` }, { label: 'Total', render: (c) => money(tot(c)) }],
    actions: (c) => [{ label: 'Recibo', run: (r) => { receipt(r); return false; } }, ...(['programada', 'confirmada'].includes(c.estado) ? [{ label: 'Cancelar', danger: true, confirm: '¿Cancelar esta cita?', run: (r) => appointments.cancel(idCita(r)) }] : [])],
  });
  on(root, '#fd,#fv', 'change', () => api.refresh());
}