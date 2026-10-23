import { esc } from '../utils/dom.js';
import { money } from '../utils/format.js';
import { skeleton } from './ui.js';
import { services, vehicleTypes } from '../services/services-service.js';
import { list } from '../services/api-client.js';
import { observeReveal } from '../utils/dom.js';
// La API devuelve "precios por tipo": se acepta arreglo [{idTipoVehiculo,precio}] u objeto {idTipo: precio}
export function priceFor(s, idTipo) { const p = s?.precios; if (Array.isArray(p)) return Number(p.find((x) => (x.idTipoVehiculo ?? x.idTipo ?? x.id_tipo_vehiculo ?? x.id) == idTipo)?.precio ?? 0); if (p && typeof p === 'object') return Number(p[idTipo] ?? 0); return Number(s?.precio ?? 0); }
export const durationOf = (s) => s.duracionMin ?? s.duracion_min ?? s.duracion ?? 0;
function rows(s, tipos) {
  const p = s.precios, name = (id) => tipos[id] || 'Tipo ' + id;
  const r = Array.isArray(p) ? p.map((x) => [x.tipo || x.nombreTipo || name(x.idTipoVehiculo), x.precio]) : p && typeof p === 'object' ? Object.entries(p).map(([k, v]) => [name(k), v]) : [];
  return r.map(([n, v]) => `<li><span>${esc(n)}</span><b>${money(v)}</b></li>`).join('');
}
export async function renderServices(el, { limit } = {}) {
  el.innerHTML = skeleton(3);
  try {
    const [s, t] = await Promise.all([services.list(), vehicleTypes.list().catch(() => [])]);
    const tipos = Object.fromEntries(list(t).map((x) => [x.idTipoVehiculo, x.nombre]));
    el.innerHTML = list(s).slice(0, limit).map((x) => `<article class="card lift reveal"><h3 class="mint">${esc(x.nombre)}</h3><p class="mut" style="margin:8px 0">${esc(x.descripcion)}</p><span class="mut">⏱ ${durationOf(x)} min</span><ul class="plist" style="margin-top:12px">${rows(x, tipos)}</ul><a class="btn" style="display:block;text-align:center;margin-top:16px" href="/pages/reservar-cita.html?servicio=${x.idServicio}">Reservar</a></article>`).join('') || '<p class="mut">Sin servicios disponibles.</p>';
    observeReveal();
  } catch (e) { el.innerHTML = `<p class="err" role="alert">No se pudo cargar el catálogo: ${esc(e.message)}</p>`; }
}