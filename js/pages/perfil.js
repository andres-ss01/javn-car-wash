import { $, esc } from '../utils/dom.js';
import { session, list } from '../services/api-client.js';
import { users } from '../services/users-service.js';
import { vehicles } from '../services/vehicles-service.js';
import { vehicleTypes } from '../services/services-service.js';
import { crudPage } from '../components/crud-page.js';
import { formModal } from '../components/form-modal.js';
import { toast } from '../components/ui.js';
import { isPhone } from '../utils/validators.js';
export default async function (root) {
  const u = session.user, id = u.idUsuario ?? u.id;
  root.innerHTML = `<h1>Mi perfil</h1><form class="card" id="pf" style="max-width:560px;margin-top:20px" novalidate><p class="mut">${esc(u.correo)} · ${esc(u.rol)}</p><label for="nombre">Nombre</label><input id="nombre" value="${esc(u.nombre)}"><label for="apellidos">Apellidos</label><input id="apellidos" value="${esc(u.apellidos)}"><label for="telefono">Teléfono</label><input id="telefono" value="${esc(u.telefono)}" maxlength="10"><div class="err" id="pe" role="alert"></div><div class="row"><button class="btn">Guardar cambios</button></div></form><div id="veh" style="margin-top:40px"></div>`;
  $('#pf').onsubmit = async (e) => {
    e.preventDefault(); if (!isPhone($('#telefono').value)) return ($('#pe').textContent = 'El teléfono debe tener 10 dígitos'); $('#pe').textContent = '';
    try { await users.update(id, { nombre: $('#nombre').value.trim(), apellidos: $('#apellidos').value.trim(), telefono: $('#telefono').value }); session.user = { ...u, nombre: $('#nombre').value.trim(), apellidos: $('#apellidos').value.trim(), telefono: $('#telefono').value }; toast('Perfil actualizado'); } catch (er) { $('#pe').textContent = er.message; }
  };
  if (u.rol !== 'cliente') return;
  const tipos = list(await vehicleTypes.list().catch(() => []));
  const api = crudPage({
    root: $('#veh'), title: 'Mis vehículos', header: '<button class="btn" id="new">Agregar vehículo</button>', load: () => vehicles.list(),
    columns: [{ label: 'Matrícula', key: 'matricula' }, { label: 'Marca', key: 'marca' }, { label: 'Modelo', key: 'modelo' }, { label: 'Color', key: 'color' }, { label: 'Año', key: 'anio' }],
    actions: (v) => [{ label: 'Eliminar', danger: true, confirm: 'Si el vehículo tiene citas, la API no permitirá borrarlo. ¿Continuar?', run: () => vehicles.remove(v.idVehiculo) }],
  });
  $('#new').onclick = () => formModal({ title: 'Nuevo vehículo', fields: [{ name: 'matricula', label: 'Matrícula', required: true, maxlength: 11, pattern: /^[A-Za-z0-9-]{5,11}$/, msg: '5-11 caracteres' }, { name: 'idTipoVehiculo', label: 'Tipo', type: 'select', required: true, options: tipos.map((t) => ({ value: t.idTipoVehiculo ?? t.idTipo ?? t.id ?? t.id_tipo_vehiculo, label: t.nombre })) }, { name: 'marca', label: 'Marca', required: true }, { name: 'modelo', label: 'Modelo', required: true }, { name: 'color', label: 'Color' }, { name: 'anio', label: 'Año', type: 'number' }], onSubmit: async (d) => { await vehicles.create({ ...d, matricula: d.matricula.toUpperCase(), idTipoVehiculo: Number(d.idTipoVehiculo) }); api.refresh(); } });
}