import { esc } from '../../utils/dom.js';
import { money, fechaHora, pick } from '../../utils/format.js';
import { crudPage } from '../../components/crud-page.js';
import { formModal } from '../../components/form-modal.js';
import { payments } from '../../services/payments-service.js';
import { session } from '../../services/api-client.js';
// Formulario reutilizable (también desde Órdenes). Nunca se pide el número completo de tarjeta ni CVV.
export function paymentForm({ idOrden, onDone }) {
  formModal({
    title: 'Registrar pago', submitLabel: 'Registrar',
    fields: [...(idOrden ? [] : [{ name: 'idOrden', label: 'ID de orden', type: 'number', required: true, min: 1 }]), { name: 'monto', label: 'Monto', type: 'number', required: true, min: 0.01 }, { name: 'metodo', label: 'Método', type: 'select', options: ['efectivo', 'tarjeta', 'transferencia'].map((v) => ({ value: v, label: v })) }, { name: 'referencia', label: 'Referencia de la pasarela (tarjeta/transferencia)', maxlength: 80 }, { name: 'ultimos4', label: 'Últimos 4 dígitos (tarjeta)', maxlength: 4, pattern: /^\d{4}$/, msg: '4 dígitos' }, { name: 'marcaTarjeta', label: 'Marca de tarjeta', maxlength: 20 }],
    onSubmit: async (d) => {
      if (d.metodo !== 'efectivo' && !d.referencia) throw new Error('Tarjeta y transferencia requieren referencia');
      await payments.create({ ...d, idOrden: Number(idOrden ?? d.idOrden) }); onDone?.();
    },
  });
}
export default function (root) {
  const admin = session.user.rol === 'administrador';
  const api = crudPage({
    root, title: 'Pagos', header: '<button class="btn" id="new">Registrar pago</button>', load: () => payments.list(),
    columns: [{ label: '#', key: 'idPago' }, { label: 'Orden', key: 'idOrden' }, { label: 'Monto', render: (p) => money(p.monto) }, { label: 'Método', key: 'metodo' }, { label: 'Estado', render: (p) => `<span class="tag">${esc(p.estado)}</span>` }, { label: 'Fecha', render: (p) => esc(fechaHora(pick(p, 'fechaPago', 'fecha_pago'))) }, { label: 'Ref.', render: (p) => esc(p.referencia || '') }],
    actions: (p) => !admin ? [] : [...(p.estado === 'pendiente' ? [{ label: 'Marcar pagado', run: (r) => payments.setState(r.idPago, 'pagado') }, { label: 'Rechazar', danger: true, run: (r) => payments.setState(r.idPago, 'rechazado') }] : []), ...(p.estado === 'pagado' ? [{ label: 'Reembolsar', danger: true, confirm: '¿Reembolsar este pago?', run: (r) => payments.setState(r.idPago, 'reembolsado') }] : [])],
  });
  document.getElementById('new').onclick = () => paymentForm({ onDone: api.refresh });
}
