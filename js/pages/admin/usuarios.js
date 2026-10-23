import { $, esc, on } from '../../utils/dom.js';
import { crudPage } from '../../components/crud-page.js';
import { formModal } from '../../components/form-modal.js';
import { users } from '../../services/users-service.js';
import { isEmail, isPhone } from '../../utils/validators.js';
const ROLES = ['cliente', 'trabajador', 'administrador'], TURNOS = ['matutino', 'vespertino', 'mixto'];
const base = [{ name: 'nombre', label: 'Nombre', required: true, maxlength: 40 }, { name: 'apellidos', label: 'Apellidos', required: true, maxlength: 50 }, { name: 'telefono', label: 'Teléfono', required: true, maxlength: 10, pattern: /^\d{10}$/, msg: '10 dígitos' }];
// Fábrica compartida por usuarios.html (todos) y trabajadores.html (solo rol trabajador)
export function usersPage(root, { rol, title }) {
  const id = (u) => u.idUsuario ?? u.id;
  const api = crudPage({
    root, title, header: `${rol ? '' : `<select id="fr" aria-label="Rol"><option value="">Todos</option>${ROLES.map((r) => `<option>${r}</option>`).join('')}</select>`}<button class="btn" id="new">Nuevo</button>`,
    load: () => users.list({ rol: rol || $('#fr')?.value }),
    columns: [{ label: 'Nombre', render: (u) => esc(`${u.nombre} ${u.apellidos}`) }, { label: 'Correo', key: 'correo' }, { label: 'Teléfono', key: 'telefono' }, { label: 'Rol', render: (u) => `<span class="tag">${esc(u.rol)}</span>` }, { label: 'Activo', render: (u) => (u.activo ? 'Sí' : 'No') }],
    actions: (u) => [
      { label: 'Editar', run: (r, refresh) => { formModal({ title: 'Editar usuario', fields: base, values: r, onSubmit: async (d) => { await users.update(id(r), d); refresh(); } }); return false; } },
      { label: u.activo ? 'Desactivar' : 'Activar', run: (r) => users.update(id(r), { activo: r.activo ? 0 : 1 }) },
      { label: 'Dar de baja', danger: true, confirm: 'Baja lógica: el usuario queda inactivo. ¿Continuar?', run: (r) => users.remove(id(r)) },
    ],
  });
  on(root, '#fr', 'change', () => api.refresh());
  $('#new').onclick = () => formModal({
    title: 'Nuevo usuario', submitLabel: 'Crear',
    fields: [...base, { name: 'correo', label: 'Correo', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Correo inválido' }, { name: 'contrasena', label: 'Contraseña (mín. 8)', type: 'password', required: true, pattern: /^.{8,}$/, msg: 'Mínimo 8' },
      { name: 'rol', label: 'Rol', type: 'select', options: (rol ? [rol] : ROLES).map((r) => ({ value: r, label: r })) }, { name: 'rfc', label: 'RFC (staff)', maxlength: 13 }, { name: 'curp', label: 'CURP (staff)', maxlength: 18 }, { name: 'turno', label: 'Turno (trabajador)', type: 'select', options: TURNOS.map((t) => ({ value: t, label: t })) }],
    onSubmit: async (d) => {
      if (!isEmail(d.correo) || !isPhone(d.telefono)) throw new Error('Revisa correo y teléfono');
      const { rfc, curp, turno, ...u } = d; // ⚠ Se asume que la API recibe los datos de staff en "perfil"
      await users.create(u.rol === 'cliente' ? u : { ...u, perfil: { rfc: rfc?.toUpperCase(), curp: curp?.toUpperCase(), ...(u.rol === 'trabajador' && { turno }) } }); api.refresh();
    },
  });
  return api;
}
export default (root) => usersPage(root, { title: 'Usuarios' });
