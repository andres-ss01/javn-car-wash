import { $, esc } from '../utils/dom.js';
export const spinner = () => '<div class="spin" role="status" aria-label="Cargando"></div>';
export const skeleton = (n = 3) => Array(n).fill('<div class="skel"></div>').join('');
export function toast(msg, bad) {
  const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.append(t); setTimeout(() => t.remove(), 3800);
}
// Modal accesible: foco inicial, cierre con Esc o clic fuera, devuelve el foco al cerrar
export function modal(content, { title = '' } = {}) {
  const prev = document.activeElement, el = document.createElement('div');
  el.className = 'modal'; el.innerHTML = `<div class="card" role="dialog" aria-modal="true" aria-label="${esc(title)}" tabindex="-1">${title ? `<h2 style="margin:0 0 14px;font-size:1.4rem">${esc(title)}</h2>` : ''}<div class="mbody">${content}</div></div>`;
  document.body.append(el);
  const close = () => { document.removeEventListener('keydown', key); el.remove(); prev?.focus?.(); };
  const key = (e) => e.key === 'Escape' && close();
  document.addEventListener('keydown', key); el.addEventListener('mousedown', (e) => e.target === el && close());
  ($('input,select,textarea,button', el) || $('.card', el)).focus();
  return { el, body: $('.mbody', el), close };
}
export const confirmDialog = (msg) => new Promise((res) => {
  const m = modal(`<p>${esc(msg)}</p><div class="row"><button class="btn danger" data-y>Confirmar</button><button class="btn ghost" data-n>Cancelar</button></div>`, { title: 'Confirmar' });
  $('[data-y]', m.el).onclick = () => { m.close(); res(true); }; $('[data-n]', m.el).onclick = () => { m.close(); res(false); };
});
