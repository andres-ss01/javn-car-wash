import { esc } from '../../utils/dom.js';
import { money, pick, vehText, txt, idOrden } from '../../utils/format.js';
import { crudPage } from '../../components/crud-page.js';
import { formModal } from '../../components/form-modal.js';
import { paymentForm } from './pagos.js';
import { orders } from '../../services/orders-service.js';
import { users } from '../../services/users-service.js';
import { list } from '../../services/api-client.js';
export function ordersPage(root, { canAssign }) {
  const seg = canAssign ? '/pages/seguimiento.html' : '/trabajador/seguimiento.html';
  return crudPage({
    root, title: 'Órdenes', subtitle: 'Avanza el estado y el cliente recibe una notificación', load: () => orders.list({ abiertas: true }),
    columns: [{ label: '#', render: (o) => esc(idOrden(o)) }, { label: 'Cita', key: 'idCita' }, { label: 'Vehículo', render: (o) => esc(vehText(o)) }, { label: 'Estado', render: (o) => `<span class="tag">${esc(txt(pick(o, 'estadoActual', 'estado_actual', 'estado')) || o.idEstadoOrden)}</span>` }, { label: 'Total', render: (o) => money(o.total) }, { label: 'Saldo', render: (o) => (o.saldo != null ? money(o.saldo) : '—') }, { label: 'Trabajadores', render: (o) => esc(txt(pick(o, 'trabajadores', 'trabajadoresAsignados', 'trabajadores_asignados', 'asignados', 'trabajador')) || '—') }],
    actions: (o) => [
      { label: 'Avanzar', run: (r) => orders.advance(idOrden(r)) },
      { label: 'Cobrar', run: (r, refresh) => { paymentForm({ idOrden: idOrden(r), onDone: refresh }); return false; } },
      { label: 'Seguimiento', run: (r) => { location.href = `${seg}?orden=${idOrden(r)}`; return false; } },
      ...(canAssign ? [{ label: 'Asignar', run: async (r, refresh) => { const t = list(await users.list({ rol: 'trabajador', activo: 1 })); formModal({ title: 'Asignar trabajador', fields: [{ name: 'idTrabajador', label: 'Trabajador', type: 'select', options: t.map((x) => ({ value: x.idUsuario ?? x.id, label: `${x.nombre} ${x.apellidos}` })) }], onSubmit: async (d) => { await orders.assign(idOrden(r), Number(d.idTrabajador)); refresh(); } }); return false; } }] : []),
    ],
  });
}
export default (root) => ordersPage(root, { canAssign: true });