import { $, esc, on } from '../utils/dom.js';
import { skeleton, toast, confirmDialog } from './ui.js';
import { list } from '../services/api-client.js';
// columns: [{label, key | render(row)}]  ·  actions(row) → [{label, run(row, refresh), confirm?, danger?}]
// run() puede devolver false para no mostrar toast ni recargar (p. ej. si abre un modal que recarga solo)
export function crudPage({ root, title, subtitle = '', header = '', load, columns, actions = () => [], empty = 'Sin registros.' }) {
  root.innerHTML = `<div class="page-head"><div><h1>${esc(title)}</h1><p class="mut">${esc(subtitle)}</p></div><div class="row" style="margin:0" id="tb">${header}</div></div><div class="card tablewrap" id="tbl"></div>`;
  const tbl = $('#tbl', root); let rows = [];
  async function refresh() {
    tbl.innerHTML = skeleton(1);
    try {
      rows = list(await load());
      tbl.innerHTML = rows.length ? `<table><thead><tr>${columns.map((c) => `<th>${esc(c.label)}</th>`).join('')}<th></th></tr></thead><tbody>${rows.map((r, i) => `<tr>${columns.map((c) => `<td>${c.render ? c.render(r) : esc(r[c.key])}</td>`).join('')}<td>${actions(r).map((a, j) => `<button class="btn sm ${a.danger ? 'danger' : 'ghost'}" data-i="${i}" data-a="${j}">${esc(a.label)}</button>`).join('')}</td></tr>`).join('')}</tbody></table>` : `<p class="mut" style="padding:16px">${empty}</p>`;
    } catch (e) { tbl.innerHTML = `<p class="err" role="alert" style="padding:16px">${esc(e.message)}</p>`; }
  }
  on(tbl, 'button[data-a]', 'click', async (_, b) => {
    const row = rows[b.dataset.i], a = actions(row)[b.dataset.a];
    if (a.confirm && !(await confirmDialog(a.confirm))) return;
    try { if ((await a.run(row, refresh)) !== false) { toast('Listo'); refresh(); } } catch (e) { toast(e.message, true); }
  });
  refresh(); return { refresh, rows: () => rows, el: root };
}
