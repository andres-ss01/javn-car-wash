import { $ } from './utils/dom.js';
import { session } from './services/api-client.js';
import { guard } from './services/auth-service.js';
import { renderLayout } from './components/layout.js';
// Cada HTML declara: data-page (módulo en js/pages/), data-layout (site|panel|bare) y data-roles (opcional)
const { page, layout = 'site', roles = '' } = document.body.dataset;
if (guard(roles ? roles.split(',') : null)) {
  if (layout !== 'bare' && !(layout === 'panel' && !session.user)) renderLayout(layout);
  try { const mod = await import(`./pages/${page}.js`); await mod.default?.($('#app')); }
  catch (e) { console.error(e); $('#app').innerHTML = `<p class="err" role="alert">Error al cargar la página: ${e.message}</p>`; }
}
