import { money, isoDate } from '../../utils/format.js';
import { users } from '../../services/users-service.js';
import { appointments } from '../../services/appointments-service.js';
import { orders } from '../../services/orders-service.js';
import { payments } from '../../services/payments-service.js';
import { list } from '../../services/api-client.js';
export default async function (root) {
  root.innerHTML = '<h1>Dashboard</h1><div class="grid" id="s" style="margin-top:20px"><div class="skel"></div><div class="skel"></div><div class="skel"></div><div class="skel"></div></div><div class="row"><a class="btn" href="/admin/citas.html">Citas</a><a class="btn" href="/admin/ordenes.html">Órdenes</a><a class="btn ghost" href="/admin/pagos.html">Pagos</a></div>';
  const [u, c, o, p] = (await Promise.allSettled([users.list({ activo: 1 }), appointments.list({ fecha: isoDate(new Date()) }), orders.list({ abiertas: true }), payments.list({ estado: 'pagado' })])).map((r) => (r.status === 'fulfilled' ? list(r.value) : null));
  const card = (v, l) => `<div class="card stat"><b>${v ?? '—'}</b><span class="mut">${l}</span></div>`;
  document.getElementById('s').innerHTML = card(u?.length, 'Usuarios activos') + card(c?.length, 'Citas de hoy') + card(o?.length, 'Órdenes abiertas') + card(p ? money(p.reduce((a, x) => a + Number(x.monto || 0), 0)) : null, 'Cobrado');
}
