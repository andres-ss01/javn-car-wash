import { esc, $ } from '../utils/dom.js';
import { money } from '../utils/format.js';
import { list, session } from '../services/api-client.js';
import { services } from '../services/services-service.js';
import { durationOf } from '../components/service-cards.js';
import { skeleton } from '../components/ui.js';
import { renderServices } from '../components/service-cards.js';
import { observeReveal } from '../utils/dom.js';

// Íconos de línea (se reparten en orden entre las tarjetas)
const svg = (d) => `<svg viewBox="0 0 48 48" aria-hidden="true">${d}</svg>`;
const ICONS = [
  svg('<path d="M9 33v-7l4-8h16l4 8v7M9 26h24M9 33v4h5v-4M28 33v4h5v-4"/><circle cx="14" cy="29.5" r="1.2"/><circle cx="28" cy="29.5" r="1.2"/><path d="M37 8c2 3 3 4.5 3 6.2a3 3 0 0 1-6 0C34 12.5 35 11 37 8z"/>'),
  svg('<path d="M7 34v-7l4-8h16l4 8v7M7 27h24M7 34v4h5v-4M26 34v4h5v-4"/><circle cx="12" cy="30.5" r="1.2"/><circle cx="26" cy="30.5" r="1.2"/><path d="M37 8l1.2 3.3L41.5 12.5l-3.3 1.2L37 17l-1.2-3.3L32.5 12.5l3.3-1.2zM13 8l.9 2.4 2.4.9-2.4.9L13 14.6l-.9-2.4-2.4-.9 2.4-.9z"/>'),
  svg('<path d="M16 15h16a3 3 0 0 1 3 3v11H13V18a3 3 0 0 1 3-3zM13 29v6h22v-6M16 35v3M32 35v3M19 15v-3h10v3M18 22h12"/><path d="M39 7l1 2.7 2.7 1-2.7 1L39 14.4l-1-2.7-2.7-1 2.7-1zM9 9l.8 2.1 2.1.8-2.1.8L9 14.8l-.8-2.1-2.1-.8 2.1-.8z"/>'),
];
const CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 3h5"/></svg>';

// Precio mínimo del servicio: la API puede devolver arreglo [{precio}], objeto {idTipo: precio} o un precio único
function minPrice(s) {
  const p = s?.precios;
  const vals = Array.isArray(p) ? p.map((x) => Number(x.precio))
    : p && typeof p === 'object' ? Object.values(p).map(Number)
    : [Number(s?.precio)];
  const ok = vals.filter((n) => Number.isFinite(n) && n > 0);
  return ok.length ? Math.min(...ok) : null;
}

function card(s, i) {
  const dur = durationOf(s), price = minPrice(s);
  return `<article class="svc-card">
    <header>
      <span class="svc-ico">${ICONS[i % ICONS.length]}</span>
      <div><h3>${esc(s.nombre)}</h3>${s.descripcion ? `<p>${esc(s.descripcion)}</p>` : ''}</div>
    </header>
    <div class="svc-meta">
      ${dur ? `<span class="dur">${CLOCK}${dur} min</span>` : '<span></span>'}
      ${price != null ? `<span class="from"><small>Desde</small><b>${money(price)}</b></span>` : ''}
    </div>
    <a class="btn block" href="/pages/servicios.html">Ver detalles</a>
  </article>`;
}

export default async () => {
  // Con sesión iniciada se muestra la pantalla original; sin sesión, la de bienvenida
  if (session.user) {
    $('#home-guest').remove();
    $('#app').classList.remove('home');
    $('#home-user').hidden = false;
    observeReveal();
    return renderServices($('#svc-user'), { limit: 3 });
  }
  $('#home-user').remove();
  const el = $('#svc');
  el.innerHTML = skeleton(3);
  try {
    const items = list(await services.list()).slice(0, 3);
    el.innerHTML = items.map(card).join('') || '<p class="mut">Sin servicios disponibles.</p>';
  } catch (e) {
    el.innerHTML = `<p class="err" role="alert">No se pudo cargar el catálogo: ${esc(e.message)}</p>`;
  }
};
