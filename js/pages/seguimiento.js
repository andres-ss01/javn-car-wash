import { $, esc, on } from '../utils/dom.js';
import { fechaHora, pick, vehText } from '../utils/format.js';
import { spinner } from '../components/ui.js';
import { orders } from '../services/orders-service.js';
import { list } from '../services/api-client.js';
import { POLL_MS } from '../config/api-config.js';
export default async function (root) {
  root.innerHTML = `<h1>Seguimiento de vehículo</h1><form id="f" class="row"><input id="q" placeholder="Número de orden, cita o matrícula" style="max-width:380px" aria-label="Buscar"><button class="btn">Buscar</button></form><div class="chips" id="chips"></div><div id="res" class="card" style="margin-top:22px" hidden></div>`;
  let timer, estados = [], ords = [], current;
  try { [estados, ords] = (await Promise.all([orders.states(), orders.list()])).map(list); estados.sort((a, b) => a.orden - b.orden); } catch (e) { $('#res').hidden = false; $('#res').innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
  const idOf = (o) => pick(o, 'idOrden', 'id'), plate = (o) => pick(o, 'matricula', 'vehiculoMatricula') || '';
  $('#chips').innerHTML = ords.map((o) => `<button class="chip" data-o="${idOf(o)}">#${idOf(o)} ${esc(plate(o))}</button>`).join('') || '<p class="mut">No hay órdenes activas todavía.</p>';
  async function show(id) {
    current = id; clearTimeout(timer); const out = $('#res'); out.hidden = false; if (!out.dataset.id || out.dataset.id !== String(id)) out.innerHTML = spinner(); out.dataset.id = id;
    document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('sel', c.dataset.o == id));
    try {
      const r = await orders.tracking(id), d = r.data || r.seguimiento || r, names = estados.map((e) => e.nombre), total = names.length || 4;
      const act = pick(d, 'estadoActual', 'estado_actual', 'estado'), nameNow = typeof act === 'object' ? act?.nombre : act;
      const paso = Number(pick(d, 'pasoActual', 'paso_actual', 'paso') ?? (names.indexOf(nameNow) + 1 || 1)), pct = pick(d, 'progreso', 'porcentaje', 'porcentajeProgreso');
      const hist = pick(d, 'historial') || [], trab = pick(d, 'trabajadores') || [];
      out.innerHTML = `<h2 style="margin:0">Orden #${esc(id)}</h2><p class="mut">${esc(vehText(d))}</p>
      <div class="track" aria-label="Paso ${paso} de ${total}"><div class="fill" style="width:0" data-w="${((paso - 1) / Math.max(total - 1, 1)) * 76}%"></div>${names.map((n, i) => `<div class="dot ${i + 1 < paso ? 'done' : i + 1 === paso ? 'now' : ''}"><b>${i + 1 < paso ? '✓' : i + 1}</b>${esc(n)}</div>`).join('')}</div>
      <div class="grid2"><p><b>Estado:</b> <span class="tag">${esc(nameNow || names[paso - 1])}</span>${pct != null ? ` · ${Math.round(pct)}%` : ''}</p><p><b>Inicio:</b> ${fechaHora(pick(d, 'fechaInicio', 'fecha_inicio'))}</p><p><b>Entrega estimada:</b> ${fechaHora(pick(d, 'entregaEstimada', 'entrega_estimada'))}</p><p><b>Trabajador:</b> ${esc(trab.map((t) => t.nombre || t).join(', ') || 'Por asignar')}</p></div>
      ${hist.length ? `<h3 style="margin-top:16px">Historial</h3><ul class="plist">${hist.map((h) => `<li><span>${esc(pick(h, 'estado', 'nombre', 'estadoNombre') ?? '')}</span><span class="mut">${fechaHora(pick(h, 'fecha', 'fechaCambio', 'fecha_cambio'))}</span></li>`).join('')}</ul>` : ''}`;
      requestAnimationFrame(() => setTimeout(() => { const f = $('.fill'); if (f) f.style.width = f.dataset.w; }, 60));
      if (paso < total) timer = setTimeout(() => !document.hidden && current === id ? show(id) : undefined, POLL_MS); // polling mientras la orden siga abierta
    } catch (e) { out.innerHTML = `<p class="err" role="alert">${esc(e.message)}</p>`; }
  }
  on(root, '[data-o]', 'click', (_, c) => show(c.dataset.o));
  $('#f').onsubmit = (e) => {
    e.preventDefault(); const q = $('#q').value.trim().toUpperCase(); if (!q) return;
    const o = ords.find((x) => [idOf(x), x.idCita].map(String).includes(q) || plate(x).toUpperCase() === q);
    o ? show(idOf(o)) : (/^\d+$/.test(q) ? show(q) : ($('#res').hidden = false, $('#res').innerHTML = '<p class="err">No se encontró ninguna orden con ese dato.</p>'));
  };
  const pre = new URLSearchParams(location.search).get('orden') || (ords[0] && idOf(ords[0])); if (pre) show(pre);
}