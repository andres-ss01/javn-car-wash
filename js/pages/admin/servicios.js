import { esc } from '../../utils/dom.js';
import { money } from '../../utils/format.js';
import { crudPage } from '../../components/crud-page.js';
import { formModal } from '../../components/form-modal.js';
import { priceFor, durationOf } from '../../components/service-cards.js';
import { services, vehicleTypes } from '../../services/services-service.js';
import { list } from '../../services/api-client.js';
export default async function (root) {
  const tipos = list(await vehicleTypes.list().catch(() => []));
  const fields = [{ name: 'nombre', label: 'Nombre', required: true, maxlength: 45 }, { name: 'descripcion', label: 'Descripción', required: true, maxlength: 255 }, { name: 'duracionMin', label: 'Duración (min)', type: 'number', required: true, min: 1 }, ...tipos.map((t) => ({ name: 'p_' + t.idTipoVehiculo, label: `Precio · ${t.nombre}`, type: 'number', required: true, min: 0 }))];
  // ⚠ Se asume { nombre, descripcion, duracionMin, precios:[{idTipoVehiculo, precio}] }; ajusta a tu validador si difiere
  const body = (d) => ({ nombre: d.nombre, descripcion: d.descripcion, duracionMin: d.duracionMin, duracion_min: d.duracionMin, precios: tipos.map((t) => ({ idTipoVehiculo: t.idTipoVehiculo, precio: d['p_' + t.idTipoVehiculo] })) });
  const form = (s, api) => formModal({ title: s ? 'Editar servicio' : 'Nuevo servicio', fields, values: s ? { ...s, duracionMin: durationOf(s), ...Object.fromEntries(tipos.map((t) => ['p_' + t.idTipoVehiculo, priceFor(s, t.idTipoVehiculo)])) } : {}, onSubmit: async (d) => { s ? await services.update(s.idServicio, body(d)) : await services.create(body(d)); api.refresh(); } });
  const api = crudPage({
    root, title: 'Servicios', header: '<button class="btn" id="new">Nuevo servicio</button>', load: () => services.all(),
    columns: [{ label: 'Nombre', key: 'nombre' }, { label: 'Descripción', render: (s) => esc(s.descripcion) }, { label: 'Duración', render: (s) => `${durationOf(s)} min` }, { label: 'Desde', render: (s) => money(Math.min(...tipos.map((t) => priceFor(s, t.idTipoVehiculo)).filter(Boolean), Infinity) === Infinity ? 0 : Math.min(...tipos.map((t) => priceFor(s, t.idTipoVehiculo)).filter(Boolean))) }, { label: 'Activo', render: (s) => (s.activo ? 'Sí' : 'No') }],
    actions: (s) => [{ label: 'Editar', run: (r) => { form(r, api); return false; } }, { label: s.activo ? 'Desactivar' : 'Activar', run: (r) => services.update(r.idServicio, { activo: r.activo ? 0 : 1 }) }, { label: 'Baja', danger: true, confirm: 'Baja lógica del servicio. ¿Continuar?', run: (r) => services.remove(r.idServicio) }],
  });
  document.getElementById('new').onclick = () => form(null, api);
}
