export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Delegación de eventos: on(root, 'button[data-x]', 'click', (event, element) => ...)
export const on = (root, sel, ev, fn) => root.addEventListener(ev, (e) => { const t = e.target.closest(sel); if (t && root.contains(t)) fn(e, t); });
export const observeReveal = () => { const io = new IntersectionObserver((es) => es.forEach((x) => x.isIntersecting && x.target.classList.add('vis'))); $$('.reveal:not(.vis)').forEach((el) => io.observe(el)); };
