import { esc } from '../../utils/dom.js';
import { crudPage } from '../../components/crud-page.js';
import { formModal } from '../../components/form-modal.js';
import { vehicles } from '../../services/vehicles-service.js';
import { vehicleTypes } from '../../services/services-service.js';
import { users } from '../../services/users-service.js';
import { list } from '../../services/api-client.js';
export default async function (root) {
  const [tipos, clientes] = (await Promise.all([vehicleTypes.list(), users.list({ rol: 'cliente' })])).map(list);
  const api = crudPage({
    root, title: 'Vehículos', header: '<button class="btn" id="new">Nuevo vehículo</button>', load: () => vehicles.list(),
    columns: [{ label: 'Matrícula', key: 'matricula' }, { label: 'Vehículo', render: (v) => esc(`${v.marca} ${v.modelo} ${v.color || ''}`) }, { label: 'Año', key: 'anio' }, { label: 'Cliente', render: (v) => esc(v.cliente || v.idCliente) }],
    actions: (v) => [{ label: 'Eliminar', danger: true, confirm: 'No se pueden borrar vehículos con citas. ¿Continuar?', run: () => vehicles.remove(v.idVehiculo) }],
  });
  document.getElementById('new').onclick = () => formModal({
    title: 'Nuevo vehículo', fields: [{ name: 'idCliente', label: 'Cliente', type: 'select', options: clientes.map((c) => ({ value: c.idUsuario ?? c.id, label: `${c.nombre} ${c.apellidos}` })) }, { name: 'matricula', label: 'Matrícula', required: true, maxlength: 11, pattern: /^[A-Za-z0-9-]{5,11}$/ }, { name: 'idTipoVehiculo', label: 'Tipo', type: 'select', options: tipos.map((t) => ({ value: t.idTipoVehiculo ?? t.idTipo ?? t.id ?? t.id_tipo_vehiculo, label: t.nombre })) }, { name: 'marca', label: 'Marca', required: true }, { name: 'modelo', label: 'Modelo', required: true }, { name: 'color', label: 'Color' }, { name: 'anio', label: 'Año', type: 'number' }],
    onSubmit: async (d) => { await vehicles.create({ ...d, idCliente: Number(d.idCliente), idTipoVehiculo: Number(d.idTipoVehiculo), matricula: d.matricula.toUpperCase() }); api.refresh(); },
  });
}