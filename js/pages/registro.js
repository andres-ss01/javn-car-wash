import { $ } from '../utils/dom.js';
import { auth } from '../services/auth-service.js';
import { toast } from '../components/ui.js';
import { isEmail, isPhone, isPassword } from '../utils/validators.js';
const R = { nombre: [(v) => v.length >= 2, 'Nombre requerido'], apellidos: [(v) => v.length >= 2, 'Apellidos requeridos'], telefono: [isPhone, 'Debe tener 10 dígitos'], correo: [isEmail, 'Correo inválido'], contrasena: [isPassword, 'Mínimo 8 caracteres'] };
const L = { nombre: 'Nombre', apellidos: 'Apellidos', telefono: 'Teléfono (10 dígitos)', correo: 'Correo electrónico', contrasena: 'Contraseña (mín. 8)' };
export default function (root) {
  root.innerHTML = `<h2 class="auth-title">¡Bienvenid@!</h2><form class="auth-card" novalidate><h1>Crear cuenta</h1>${Object.keys(R).map((k) => `<label for="${k}">${L[k]}</label><input id="${k}" type="${k === 'contrasena' ? 'password' : k === 'correo' ? 'email' : 'text'}" ${k === 'telefono' ? 'inputmode="numeric" maxlength="10"' : ''}><div class="err"></div>`).join('')}<div class="err" id="eg" role="alert"></div><button class="btn" id="go">Crear cuenta</button><p style="height:10px"></p><a class="btn ghost" style="display:block;text-align:center" href="/pages/login.html">Iniciar sesión</a></form>`;
  const chk = (k) => { const ok = R[k][0]($('#' + k).value.trim()); $('#' + k).nextElementSibling.textContent = ok ? '' : R[k][1]; return ok; };
  Object.keys(R).forEach((k) => $('#' + k).addEventListener('input', () => { if (k === 'telefono') $('#telefono').value = $('#telefono').value.replace(/\D/g, ''); chk(k); }));
  $('form', root).onsubmit = async (e) => {
    e.preventDefault(); if (!Object.keys(R).map(chk).every(Boolean)) return;
    $('#go').disabled = true;
    try { await auth.register(Object.fromEntries(Object.keys(R).map((k) => [k, $('#' + k).value.trim()]))); toast('Cuenta creada. Inicia sesión.'); setTimeout(() => (location.href = '/pages/login.html'), 1200); }
    catch (er) { $('#eg').textContent = er.message; $('#go').disabled = false; }
  };
}
