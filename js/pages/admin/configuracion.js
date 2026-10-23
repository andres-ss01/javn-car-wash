import { esc } from '../../utils/dom.js';
import { DIAS, hhmm, pick, diaRaw, diaNombre } from '../../utils/format.js';
import { crudPage } from '../../components/crud-page.js';
import { formModal } from '../../components/form-modal.js';
import { schedules, vehicleTypes } from '../../services/services-service.js';
export default function (root) {
  root.innerHTML = '<div id="h"></div><div id="t" style="margin-top:40px"></div>';
  const dia = diaRaw;
  const hApi = crudPage({
    root: root.querySelector('#h'), title: 'Horarios de atención', header: '<button class="btn" id="nh">Agregar / editar día</button>', load: () => schedules.list(),
    columns: [{ label: 'Día', render: (h) => esc(diaNombre(h)) }, { label: 'Apertura', render: (h) => hhmm(pick(h, 'horaApertura', 'hora_apertura')) }, { label: 'Cierre', render: (h) => hhmm(pick(h, 'horaCierre', 'hora_cierre')) }],
    actions: (h) => [{ label: 'Quitar (cerrado)', danger: true, confirm: '¿Marcar el día como cerrado?', run: () => schedules.remove(dia(h)) }],
  });
  // ⚠ Se envían ambos formatos de nombre (camelCase y snake_case) porque el README no detalla el body de PUT /horarios/:dia
  root.querySelector('#nh').onclick = () => formModal({ title: 'Horario de un día', fields: [{ name: 'dia', label: 'Día', type: 'select', options: DIAS.slice(1).map((d, i) => ({ value: i + 1, label: d })) }, { name: 'a', label: 'Apertura', type: 'time', required: true }, { name: 'c', label: 'Cierre', type: 'time', required: true }], onSubmit: async (d) => { if (d.c <= d.a) throw new Error('El cierre debe ser posterior a la apertura'); await schedules.save(d.dia, { horaApertura: d.a, horaCierre: d.c, hora_apertura: d.a, hora_cierre: d.c }); hApi.refresh(); } });
  const tApi = crudPage({
    root: root.querySelector('#t'), title: 'Tipos de vehículo', header: '<button class="btn" id="nt">Nuevo tipo</button>', load: () => vehicleTypes.list(),
    columns: [{ label: '#', key: 'idTipoVehiculo' }, { label: 'Nombre', render: (t) => esc(t.nombre) }],
    actions: (t) => [{ label: 'Renombrar', run: (r, refresh) => { formModal({ title: 'Renombrar', fields: [{ name: 'nombre', label: 'Nombre', required: true, maxlength: 40 }], values: r, onSubmit: async (d) => { await vehicleTypes.update(r.idTipoVehiculo, d); refresh(); } }); return false; } }, { label: 'Eliminar', danger: true, confirm: '¿Eliminar este tipo?', run: () => vehicleTypes.remove(t.idTipoVehiculo) }],
  });
  root.querySelector('#nt').onclick = () => formModal({ title: 'Nuevo tipo de vehículo', fields: [{ name: 'nombre', label: 'Nombre', required: true, maxlength: 40 }], onSubmit: async (d) => { await vehicleTypes.create(d); tApi.refresh(); } });
}