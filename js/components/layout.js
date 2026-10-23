import { $, esc, on, observeReveal } from '../utils/dom.js';
import { diaNombre, hhmm, pick, fechaHora } from '../utils/format.js';
import { session, list } from '../services/api-client.js';
import { auth, isStaff } from '../services/auth-service.js';
import { schedules } from '../services/services-service.js';
import { notifications } from '../services/notifications-service.js';
import { modal } from './ui.js';
const L = {
  site: [['/', 'Inicio'], ['/pages/servicios.html', 'Servicios'], ['/pages/nosotros.html', 'Nosotros'], ['/pages/contacto.html', 'Contacto']],
  cliente: [['/pages/reservar-cita.html', 'Reservar'], ['/pages/seguimiento.html', 'Seguimiento'], ['/pages/historial.html', 'Historial'], ['/pages/vehiculos.html', 'Mis vehículos'], ['/pages/perfil.html', 'Perfil']],
  administrador: [['/admin/dashboard.html', 'Inicio'], ['/admin/usuarios.html', 'Usuarios'], ['/admin/trabajadores.html', 'Trabajadores'], ['/admin/servicios.html', 'Servicios'], ['/admin/vehiculos.html', 'Vehículos'], ['/admin/citas.html', 'Citas'], ['/admin/ordenes.html', 'Órdenes'], ['/admin/pagos.html', 'Pagos'], ['/admin/configuracion.html', 'Config.']],
  trabajador: [['/trabajador/dashboard.html', 'Inicio'], ['/trabajador/ordenes.html', 'Órdenes'], ['/trabajador/seguimiento.html', 'Seguimiento']],
};
export function renderLayout(kind) {
  const u = session.user, here = location.pathname;
  document.body.insertAdjacentHTML('afterbegin', '<div class="bubbles" aria-hidden="true"><i style="top:-4rem;left:18%;width:160px;height:160px"></i><i style="top:35%;left:-3rem;width:230px;height:230px;animation-delay:-2s"></i><i style="bottom:-5rem;left:-4rem;width:320px;height:320px;animation-delay:-4s"></i><i style="top:10%;right:-3rem;width:190px;height:190px;animation-delay:-1s"></i><i style="bottom:8%;right:8%;width:130px;height:130px;animation-delay:-3s"></i></div>');
  const links = kind === 'panel' ? L[u.rol] : [...L.site, ...(u?.rol === 'cliente' ? L.cliente : [])];
  const a = ([h, t]) => `<li><a href="${h}" class="${here === h ? 'on' : ''}">${t}</a></li>`;
  document.body.insertAdjacentHTML('afterbegin', `<nav class="top" aria-label="Principal"><a class="logo" href="/">JAVN Car Wash</a><button id="burger" aria-label="Menú" aria-expanded="false">☰</button><ul id="menu">${links.map(a).join('')}${kind !== 'panel' && isStaff(u) ? a([u.rol === 'administrador' ? '/admin/dashboard.html' : '/trabajador/dashboard.html', 'Panel']) : ''}${kind === 'panel' ? a(['/', 'Ver sitio']) : ''}
    ${u ? `<li><button class="bell" id="bell" aria-label="Notificaciones">🔔<b hidden id="nn">0</b></button></li><li class="mut">${esc(u.nombre)}</li><li><a href="#" id="out" class="btn ghost sm">Salir</a></li>` : '<li><a href="/pages/login.html" class="btn ghost sm">Iniciar sesión</a></li><li><a href="/pages/registro.html" class="btn sm">Crear cuenta</a></li>'}</ul></nav>`);
  $('#burger').onclick = (e) => { e.target.setAttribute('aria-expanded', $('#menu').classList.toggle('open')); };
  $('#out')?.addEventListener('click', (e) => { e.preventDefault(); auth.logout(); });
  if (u) bell();
  if (kind === 'site') footer();
  observeReveal();
}
async function bell() {
  const upd = async () => { if (document.hidden) return; try { const r = await notifications.list({ leida: false }); const n = r.noLeidas ?? list(r).length; const b = $('#nn'); b.textContent = n; b.hidden = !n; } catch { /* sin red: se ignora */ } };
  upd(); setInterval(upd, 30000);
  $('#bell').onclick = async () => {
    const m = modal('<div class="spin"></div>', { title: 'Notificaciones' });
    try {
      const items = list(await notifications.list());
      m.body.innerHTML = (items.length ? items.map((n) => `<p style="padding:8px 0;border-bottom:1px solid var(--bd)">${n.leida ? '' : '● '}${esc(n.mensaje)}<br><span class="mut">${fechaHora(n.fecha)}</span></p>`).join('') : '<p class="mut">Sin notificaciones.</p>') + '<div class="row"><button class="btn sm" id="ra">Marcar todas como leídas</button></div>';
      $('#ra', m.el).onclick = async () => { await notifications.readAll(); m.close(); upd(); };
    } catch (e) { m.body.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
  };
}
async function footer() {
  document.body.insertAdjacentHTML('beforeend', `<footer class="site"><div class="in"><div><b class="mint">JAVN Car Wash</b><p class="mut" style="margin-top:8px">San Juan del Río, Qro.<br>Tel: (000) 000 0000</p><p class="mut" style="margin-top:10px"><a href="/pages/privacidad.html">Privacidad</a> · <a href="/pages/terminos.html">Términos</a></p></div><div><b>Horarios de atención</b><ul class="plist" id="hor"><li class="mut">Cargando…</li></ul></div></div></footer>`);
  try { $('#hor').innerHTML = list(await schedules.list()).map((h) => `<li><span>${diaNombre(h)}</span><span>${hhmm(pick(h, 'horaApertura', 'hora_apertura'))} – ${hhmm(pick(h, 'horaCierre', 'hora_cierre'))}</span></li>`).join(''); } catch { $('#hor').innerHTML = '<li class="mut">No disponible</li>'; }
}