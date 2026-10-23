import { esc } from '../utils/dom.js';
import { money, fechaHora, pick } from '../utils/format.js';
import { spinner } from '../components/ui.js';
import { list } from '../services/api-client.js';
import { vehicles } from '../services/vehicles-service.js';
import { appointments } from '../services/appointments-service.js';
import { vehicleTypes } from '../services/services-service.js';

// Página "Mis vehículos": ficha completa de cada vehículo registrado + su historial de citas
const norm = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const idV = (v) => pick(v, 'idVehiculo', 'id', 'id_vehiculo', 'vehiculoId');
const idT = (t) => pick(t, 'idTipoVehiculo', 'idTipo', 'id', 'id_tipo_vehiculo');
const ini = (c) => pick(c, 'fechaHoraInicio', 'fecha_hora_inicio');
const tot = (c) => pick(c, 'total', 'totalEstimado', 'total_estimado');
const time = (c) => new Date(String(ini(c) ?? '').replace(' ', 'T')).getTime();

export default async function (root) {
  root.innerHTML = `<div class="page-head"><div><h1>Mis vehículos</h1><p class="mut">Toda la información de tus vehículos registrados y sus servicios</p></div><div class="row" style="margin:0"><a class="btn ghost" href="/pages/perfil.html">Administrar vehículos</a></div></div><div id="vl">${spinner()}</div>`;
  const out = root.querySelector('#vl');
  let vehs, citas, tipos;
  try { vehs = list(await vehicles.list()); } catch (e) { out.innerHTML = `<p class="err" role="alert">${esc(e.message)}</p>`; return; }
  [citas, tipos] = await Promise.all([appointments.list().then(list).catch(() => []), vehicleTypes.list().then(list).catch(() => [])]);

  if (!vehs.length) { out.innerHTML = '<div class="card"><p>Aún no tienes vehículos registrados.</p><div class="row"><a class="btn" href="/pages/reservar-cita.html">Agendar mi primera cita</a></div></div>'; return; }

  const tipoDe = (v) => {
    const t = v.tipo, o = typeof t === 'string' ? t : t?.nombre ?? pick(v, 'tipoVehiculo', 'nombreTipo', 'tipo_vehiculo');
    if (o) return typeof o === 'object' ? o.nombre : o;
    const id = pick(v, 'idTipoVehiculo', 'idTipo', 'id_tipo_vehiculo');
    return tipos.find((x) => String(idT(x)) === String(id))?.nombre ?? '—';
  };
  const delVeh = (v) => citas.filter((c) => {
    const id = pick(c, 'idVehiculo', 'id_vehiculo') ?? pick(c.vehiculo ?? {}, 'idVehiculo', 'id'), pl = c.matricula ?? c.vehiculo?.matricula;
    return (id != null && String(id) === String(idV(v))) || (pl && norm(pl) === norm(v.matricula));
  }).sort((a, b) => time(b) - time(a));
  const row = (k, val) => `<li><span class="mut">${k}</span><span>${esc(val ?? '—') || '—'}</span></li>`;

  out.innerHTML = `<div class="grid">${vehs.map((v) => {
    const cs = delVeh(v), hecha = cs.filter((c) => c.estado === 'completada'), ahora = Date.now();
    const prox = cs.filter((c) => ['programada', 'confirmada'].includes(c.estado) && time(c) >= ahora).sort((a, b) => time(a) - time(b))[0];
    const gasto = hecha.reduce((a, c) => a + Number(tot(c) || 0), 0);
    const reg = pick(v, 'fechaRegistro', 'fecha_registro', 'createdAt', 'created_at');
    return `<article class="card" style="display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><h3 class="mint" style="margin:0">${esc(v.marca)} ${esc(v.modelo)}</h3><p class="mut">${esc(tipoDe(v))}</p></div><span class="tag">${esc(String(v.matricula ?? '').toUpperCase())}</span></div>
      <ul class="plist">${row('Color', v.color)}${row('Año', v.anio)}${row('Registrado', reg ? fechaHora(reg) : '—')}</ul>
      <ul class="plist">${row('Citas en total', cs.length)}${row('Servicios completados', hecha.length)}${row('Total gastado', money(gasto))}${row('Próxima cita', prox ? fechaHora(ini(prox)) : 'Ninguna')}</ul>
      <details><summary style="cursor:pointer">Historial de este vehículo (${cs.length})</summary>${cs.length ? `<ul class="plist" style="margin-top:8px">${cs.map((c) => `<li><span>${esc(fechaHora(ini(c)))}</span><span><span class="tag">${esc(c.estado)}</span> ${money(tot(c))}</span></li>`).join('')}</ul>` : '<p class="mut" style="margin-top:8px">Sin citas todavía.</p>'}</details>
      <a class="btn sm" style="text-align:center" href="/pages/reservar-cita.html">Agendar cita</a>
    </article>`;
  }).join('')}</div>`;
}
