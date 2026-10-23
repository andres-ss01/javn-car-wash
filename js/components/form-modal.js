import { esc, $ } from '../utils/dom.js';
import { modal, toast } from './ui.js';
// fields: [{name,label,type,options:[{value,label}],required,pattern,msg,maxlength,min}]
export function formModal({ title, fields, values = {}, submitLabel = 'Guardar', onSubmit }) {
  const inp = (f) => {
    const v = values[f.name] ?? '', id = 'f_' + f.name;
    if (f.type === 'select') return `<select id="${id}" name="${f.name}">${f.options.map((o) => `<option value="${esc(o.value)}" ${String(o.value) === String(v) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`;
    if (f.type === 'checkbox') return `<input id="${id}" name="${f.name}" type="checkbox" ${v ? 'checked' : ''}>`;
    if (f.type === 'textarea') return `<textarea id="${id}" name="${f.name}" rows="3" maxlength="${f.maxlength || 255}">${esc(v)}</textarea>`;
    return `<input id="${id}" name="${f.name}" type="${f.type || 'text'}" value="${esc(v)}" ${f.maxlength ? `maxlength="${f.maxlength}"` : ''} ${f.min != null ? `min="${f.min}"` : ''} step="any" autocomplete="off">`;
  };
  const m = modal(`<form novalidate>${fields.map((f) => `<label for="f_${f.name}">${esc(f.label)}${f.required ? ' *' : ''}</label>${inp(f)}<div class="err" data-e="${f.name}"></div>`).join('')}<div class="err" id="fe" role="alert"></div><div class="row"><button class="btn">${esc(submitLabel)}</button><button type="button" class="btn ghost" data-c>Cancelar</button></div></form>`, { title });
  const form = $('form', m.el); $('[data-c]', m.el).onclick = m.close;
  form.onsubmit = async (e) => {
    e.preventDefault(); const data = {}; let ok = true;
    for (const f of fields) {
      const el = form.elements[f.name]; let v = f.type === 'checkbox' ? el.checked : el.value.trim(), err = '';
      if (f.required && v === '') err = 'Requerido'; else if (v !== '' && f.pattern && !f.pattern.test(v)) err = f.msg || 'Formato inválido';
      $(`[data-e="${f.name}"]`, form).textContent = err; if (err) ok = false;
      if (f.type === 'number' && v !== '') v = Number(v); if (v === '' && !f.required) v = null; data[f.name] = v;
    }
    if (!ok) return;
    const b = $('.btn', form); b.disabled = true;
    try { await onSubmit(data); m.close(); } catch (er) { $('#fe', form).textContent = er.message; b.disabled = false; }
  };
  return m;
}
