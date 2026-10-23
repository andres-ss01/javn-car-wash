export const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const money = (n) => '$' + Number(n || 0).toLocaleString('es-MX');
export const pad = (n) => String(n).padStart(2, '0');
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fechaHora = (d) => (d ? new Date(String(d).replace(' ', 'T')).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
export const hhmm = (t) => String(t ?? '').match(/\d{2}:\d{2}/)?.[0] ?? '';
// Lee el primer campo existente (la API puede devolver camelCase o snake_case)
export const pick = (o, ...keys) => { for (const k of keys) if (o?.[k] != null) return o[k]; };

// Id de la cita (la API puede llamarlo idCita, id o id_cita)
export const idCita = (c) => c?.idCita ?? c?.id_cita ?? c?.id;
// Texto del vehículo: la API puede devolver un objeto {marca, modelo, matricula}, un texto o campos sueltos
export const vehText = (c) => {
    const v = c?.vehiculo, src = v && typeof v === 'object' ? v : c || {};
    const base = typeof v === 'string' ? v : [src.marca, src.modelo].filter(Boolean).join(' ');
    const plate = src.matricula ?? c?.matricula ?? c?.vehiculoMatricula ?? '';
    return `${base} ${plate && !base.includes(plate) ? plate : ''}`.trim();
};

// Día de un horario: la API puede llamarlo diaSemana, dia_semana, dia... y enviarlo como número (1-7 ó 0-6) o nombre
export const diaRaw = (h) => {
    const v = pick(h, 'diaSemana', 'dia_semana', 'dia', 'diaDeLaSemana', 'dia_de_semana', 'numeroDia', 'numero_dia');
    if (v != null) return v;
    const k = Object.keys(h || {}).find((x) => /dia/i.test(x) && !/mes|hora/i.test(x));
    return k ? h[k] : undefined;
};
export const diaNombre = (h) => {
    const r = diaRaw(h); if (r == null) return '—';
    if (/^\d+$/.test(String(r))) return DIAS[Number(r) === 0 ? 7 : Number(r)] ?? '—';
    const t = String(r); return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
};
// Convierte lo que devuelva la API (texto, objeto o lista de objetos) en texto legible.
// Evita que aparezca "[object Object]" en estados, clientes y trabajadores.
export const txt = (v) => {
    if (v == null) return '';
    if (Array.isArray(v)) return v.map(txt).filter(Boolean).join(', ');
    if (typeof v !== 'object') return String(v);
    const full = [v.nombre, v.apellidos ?? v.apellido].filter(Boolean).join(' ');
    return full || v.descripcion || v.estado || v.name || v.email || v.correo || '';
};

// Id de la orden (la API puede llamarlo idOrden, id o id_orden)
export const idOrden = (o) => o?.idOrden ?? o?.id_orden ?? o?.id;