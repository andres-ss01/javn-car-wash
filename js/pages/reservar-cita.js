import { $, $$, esc, on } from '../utils/dom.js';
import { money, pad, isoDate, hhmm, pick, DIAS, idCita, diaRaw } from '../utils/format.js';
import { spinner, toast } from '../components/ui.js';
import { formModal } from '../components/form-modal.js';
import { priceFor, durationOf } from '../components/service-cards.js';
import { vehicles } from '../services/vehicles-service.js';
import { services, vehicleTypes, schedules } from '../services/services-service.js';
import { appointments } from '../services/appointments-service.js';
import { list } from '../services/api-client.js';
import { isPlate, isYear } from '../utils/validators.js';
const STEPS = ['Vehículo', 'Servicios', 'Fecha y hora', 'Confirmar'];
export default async function (root) {
  root.innerHTML = `<h1>Reservar cita</h1><div class="card" id="w" style="margin-top:20px;max-width:780px">${spinner()}</div>`;
  const w = $('#w'); let vehs, tipos, svcs, hors;
  try { [vehs, tipos, svcs, hors] = (await Promise.all([vehicles.list(), vehicleTypes.list(), services.list(), schedules.list()])).map(list); }
  catch (e) { w.innerHTML = `<p class="err" role="alert">${esc(e.message)}</p>`; return; }
  const pre = new URLSearchParams(location.search).get('servicio'), hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const S = { step: 0, idVehiculo: '', sel: new Set(pre ? [String(pre)] : []), fecha: '', hora: '', slots: null, mes: new Date(hoy.getFullYear(), hoy.getMonth(), 1), pago: 'efectivo', notas: '', err: '' };
  // Ids tolerantes a distintos nombres de campo de la API
  const gid = (o, keys, re) => { for (const k of keys) if (o?.[k] != null) return o[k]; const k = Object.keys(o || {}).find((x) => re.test(x) && !/tipo|cliente|usuario/i.test(x) && o[x] != null && typeof o[x] !== 'object'); return k ? o[k] : undefined; };
  const idV = (x) => gid(x, ['idVehiculo', 'id', 'id_vehiculo', 'vehiculoId'], /^(id.?vehiculo|vehiculo.?id)$/i);
  const idS = (x) => x.idServicio ?? x.id ?? x.id_servicio;
  const idT = (x) => x.idTipoVehiculo ?? x.idTipo ?? x.id ?? x.id_tipo_vehiculo;
  const norm = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  // Día de la semana: acepta 1-7 (lun-dom), 0-6 (dom-sáb) o nombre del día
  const diaNum = (h) => { const r = diaRaw(h); if (r == null) return NaN; if (/^\d+$/.test(String(r))) return Number(r); const i = DIAS.findIndex((d) => d && norm(d) === norm(r)); return i > 0 ? i : NaN; };
  const dias = hors.map(diaNum).filter((n) => !Number.isNaN(n)), base0 = dias.includes(0) && !dias.includes(7);
  console.info('[JAVN debug] muestra de datos de la API', { vehiculo: vehs[0], servicio: svcs[0], tipo: tipos[0], horario: hors[0] });
  const abiertos = new Set(dias.map((n) => (base0 && n === 0 ? 7 : n)));
  const veh = () => vehs.find((v) => String(idV(v)) === String(S.idVehiculo));
  const tipoVeh = () => { const v = veh(); if (!v) return undefined; const id = v.idTipoVehiculo ?? v.idTipo ?? v.id_tipo_vehiculo ?? v.tipo?.idTipoVehiculo ?? v.tipo?.id; if (id != null) return id; const nom = typeof v.tipo === 'string' ? v.tipo : v.tipoVehiculo ?? v.nombreTipo ?? v.tipo_vehiculo ?? v.tipo?.nombre; const t = tipos.find((x) => norm(x.nombre) === norm(nom)); return t ? idT(t) : undefined; };
  const chosen = () => svcs.filter((s) => S.sel.has(String(idS(s))));
  const total = () => chosen().reduce((a, s) => a + priceFor(s, tipoVeh()), 0);
  const mins = () => chosen().reduce((a, s) => a + Number(durationOf(s)), 0);

  async function loadSlots() {
    if (!S.fecha || !S.sel.size) return; S.slots = null; draw();
    try {
      const r = await appointments.availability(S.fecha, [...S.sel]), a = Array.isArray(r) ? r : r.horarios || r.slots || r.disponibles || r.data || [];
      S.slots = [...new Set(a.map((x) => hhmm(typeof x === 'string' ? x : x.hora || x.inicio || x.horaInicio || x.fechaHora)).filter(Boolean))];
    } catch (e) { S.slots = []; S.err = e.message; } draw();
  }
  function body() {
    if (S.step === 0) return `<label for="veh">Selecciona tu vehículo</label><select id="veh"><option value="">—</option>${vehs.map((v) => `<option value="${idV(v)}" ${String(idV(v)) === String(S.idVehiculo) ? 'selected' : ''}>${esc(v.marca)} ${esc(v.modelo)} · ${esc(v.matricula)}</option>`).join('')}</select><div class="row"><button class="btn ghost sm" id="addv">➕ Agregar vehículo</button></div>`;
    if (S.step === 1) return `<div class="grid">${svcs.map((s) => `<div class="opt ${S.sel.has(String(idS(s))) ? 'sel' : ''}" role="button" tabindex="0" aria-pressed="${S.sel.has(String(idS(s)))}" data-s="${idS(s)}"><b>${esc(s.nombre)}</b><p class="mut">${durationOf(s)} min</p><p class="mint">${money(priceFor(s, tipoVeh()))}</p></div>`).join('')}</div><p style="margin-top:14px"><b>Total:</b> <span class="mint">${money(total())}</span> · ${mins()} min</p>`;
    if (S.step === 2) {
      const y = S.mes.getFullYear(), m = S.mes.getMonth(), lead = (new Date(y, m, 1).getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate();
      const days = Array.from({ length: n }, (_, i) => { const d = new Date(y, m, i + 1), iso = isoDate(d), off = d < hoy || (abiertos.size && !abiertos.has(d.getDay() || 7)); return `<button ${off ? 'disabled' : ''} data-d="${iso}" class="${S.fecha === iso ? 'sel' : ''}">${i + 1}</button>`; }).join('');
      return `<div class="grid2"><div><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn ghost sm" data-m="-1" aria-label="Mes anterior">◀</button><b style="text-transform:capitalize">${S.mes.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</b><button class="btn ghost sm" data-m="1" aria-label="Mes siguiente">▶</button></div><div class="cal mut" style="margin-top:10px">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => `<span>${d}</span>`).join('')}</div><div class="cal" style="margin-top:6px">${'<span></span>'.repeat(lead)}${days}</div></div>
      <div><p class="mut">Horarios disponibles</p>${!S.fecha ? '<p class="mut">Elige un día.</p>' : S.slots === null ? spinner() : S.slots.length ? `<div class="slots">${S.slots.map((h) => `<button class="slot ${S.hora === h ? 'sel' : ''}" data-h="${h}">${h}</button>`).join('')}</div>` : '<p class="mut">Sin horarios disponibles ese día.</p>'}</div></div>`;
    }
    return `<div class="card"><p><b>Vehículo:</b> ${esc(veh()?.marca)} ${esc(veh()?.modelo)} · ${esc(veh()?.matricula)}</p><p><b>Servicios:</b> ${esc(chosen().map((s) => s.nombre).join(', '))}</p><p><b>Fecha:</b> ${S.fecha} a las ${S.hora} (${mins()} min)</p><h3 class="mint" style="margin-top:8px">Total estimado: ${money(total())}</h3></div>
    <label for="pago">Método de pago preferido (se cobra en el local)</label><select id="pago">${['efectivo', 'tarjeta', 'transferencia'].map((p) => `<option ${S.pago === p ? 'selected' : ''}>${p}</option>`).join('')}</select><label for="notas">Notas (opcional)</label><textarea id="notas" maxlength="200" rows="2">${esc(S.notas)}</textarea>`;
  }
  function draw() {
    w.innerHTML = `<div class="bar" aria-label="Paso ${S.step + 1} de 4">${STEPS.map((_, i) => `<i class="${i <= S.step ? 'on' : ''}"></i>`).join('')}</div><h2 style="margin-top:0;font-size:1.4rem">${STEPS[S.step]}</h2><div class="step on">${body()}</div><div class="err" role="alert" style="margin-top:12px">${esc(S.err)}</div><div class="row" style="justify-content:space-between"><button class="btn ghost" data-nav="-1" style="visibility:${S.step ? 'visible' : 'hidden'}">Atrás</button><button class="btn" data-nav="1">${S.step === 3 ? 'Agendar cita' : 'Siguiente'}</button></div>`;
  }
  on(w, '[data-s]', 'click', (_, el) => { const id = el.dataset.s; S.sel.has(id) ? S.sel.delete(id) : S.sel.add(id); S.hora = ''; draw(); });
  on(w, '[data-s]', 'keydown', (e, el) => e.key === 'Enter' && el.click());
  on(w, '[data-d]', 'click', (_, el) => { S.fecha = el.dataset.d; S.hora = ''; loadSlots(); });
  on(w, '[data-h]', 'click', (_, el) => { S.hora = el.dataset.h; draw(); });
  on(w, '[data-m]', 'click', (_, el) => { S.mes = new Date(S.mes.getFullYear(), S.mes.getMonth() + Number(el.dataset.m), 1); draw(); });
  on(w, '#veh', 'change', (_, el) => { S.idVehiculo = el.value; });
  on(w, '#pago', 'change', (_, el) => { S.pago = el.value; }); on(w, '#notas', 'input', (_, el) => { S.notas = el.value; });
  on(w, '#addv', 'click', () => formModal({
    title: 'Nuevo vehículo', submitLabel: 'Agregar',
    fields: [{ name: 'matricula', label: 'Matrícula', required: true, maxlength: 11, pattern: /^[A-Za-z0-9-]{5,11}$/, msg: '5-11 caracteres' }, { name: 'idTipoVehiculo', label: 'Tipo', type: 'select', required: true, options: tipos.map((t) => ({ value: t.idTipoVehiculo ?? t.idTipo ?? t.id ?? t.id_tipo_vehiculo, label: t.nombre })) }, { name: 'marca', label: 'Marca', required: true, maxlength: 30 }, { name: 'modelo', label: 'Modelo', required: true, maxlength: 30 }, { name: 'color', label: 'Color', maxlength: 20 }, { name: 'anio', label: 'Año', type: 'number', min: 1950 }],
    onSubmit: async (d) => { if (!isPlate(d.matricula) || !isYear(String(d.anio ?? ''))) throw new Error('Revisa matrícula y año'); const r = await vehicles.create({ ...d, matricula: d.matricula.toUpperCase(), idTipoVehiculo: Number(d.idTipoVehiculo) }); vehs = list(await vehicles.list()); S.idVehiculo = (r && (idV(r) ?? idV(r.data ?? {}))) ?? idV(vehs.at(-1) ?? {}); draw(); },
  }));
  on(w, '[data-nav]', 'click', async (_, b) => {
    const dir = Number(b.dataset.nav); S.err = '';
    if (dir < 0) { S.step--; return draw(); }
    if (S.step === 0 && !S.idVehiculo) { S.err = 'Selecciona o agrega un vehículo'; return draw(); }
    if (S.step === 1 && !S.sel.size) { S.err = 'Elige al menos un servicio'; return draw(); }
    if (S.step === 2 && !(S.fecha && S.hora)) { S.err = 'Elige fecha y horario'; return draw(); }
    if (S.step < 3) { S.step++; draw(); return S.step === 2 ? loadSlots() : undefined; }
    b.disabled = true; b.textContent = 'Agendando…';
    try {
      const c = await appointments.create({ idVehiculo: Number(S.idVehiculo), fechaHoraInicio: `${S.fecha} ${S.hora}`, servicios: [...S.sel].map(Number), notas: `Pago preferido: ${S.pago}.${S.notas ? ' ' + S.notas : ''}` });
      w.innerHTML = `<h2 class="mint" style="margin-top:0">¡Cita agendada!</h2><p>Folio #${esc(idCita(c) ?? idCita(c.data ?? {}) ?? '—')} · ${S.fecha} ${S.hora}</p><div class="row"><a class="btn" href="/pages/historial.html">Ver mi historial</a><a class="btn ghost" href="/pages/seguimiento.html">Seguimiento</a></div>`;
    } catch (e) { S.err = e.message; draw(); }
  });
  draw(); if (S.step === 2) loadSlots();
}