import { $ } from '../utils/dom.js';
import { auth, homeFor } from '../services/auth-service.js';
import { session } from '../services/api-client.js';
import { isEmail } from '../utils/validators.js';
export default function (root) {
  if (session.token) return (location.href = homeFor(session.user));
  root.innerHTML = `<h2 class="auth-title">¡Bienvenid@ de nuevo!</h2><form class="auth-card" novalidate><h1>Iniciar sesión</h1>
  <label for="correo">Correo</label><input id="correo" type="email" autocomplete="email"><div class="err" id="e1"></div>
  <label for="pass">Contraseña</label><input id="pass" type="password" autocomplete="current-password">
  <label style="display:flex;gap:8px;align-items:center"><input id="show" type="checkbox"> Mostrar contraseña</label><div class="err" id="e2" role="alert"></div>
  <button class="btn" id="go">Iniciar sesión</button><p style="text-align:center;margin:10px 0"><a href="#" id="forgot" class="mut">¿Olvidaste tu contraseña?</a></p><a class="btn ghost" style="display:block;text-align:center" href="/pages/registro.html">Crear cuenta</a></form>`;
  $('#show').onchange = (e) => ($('#pass').type = e.target.checked ? 'text' : 'password');
  $('#forgot').onclick = (e) => { e.preventDefault(); $('#e2').textContent = 'Pide a un administrador que restablezca tu contraseña.'; };
  $('form', root).onsubmit = async (e) => {
    e.preventDefault(); $('#e1').textContent = $('#e2').textContent = '';
    if (!isEmail($('#correo').value)) return ($('#e1').textContent = 'Correo inválido');
    if (!$('#pass').value) return ($('#e2').textContent = 'Ingresa tu contraseña');
    $('#go').disabled = true;
    try { const u = await auth.login($('#correo').value.trim(), $('#pass').value); const next = new URLSearchParams(location.search).get('next'); location.href = next && next.startsWith('/') ? next : homeFor(u); }
    catch (er) { $('#e2').textContent = er.message; $('#go').disabled = false; }
  };
}
