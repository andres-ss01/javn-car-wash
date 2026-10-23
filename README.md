# JAVN Car Wash — Frontend

Sitio web estático (HTML + CSS + JavaScript con módulos ES, sin frameworks ni build obligatorio) que consume la
**Car Wash API REST** (`carwash-api-mysql`). Tema oscuro / glassmorphism con acento verde menta.

## Ejecutar en local
```bash
npm start            # = npx serve .   (necesita servir desde la raíz: las rutas son absolutas, p. ej. /css/global.css)
npm test             # pruebas de validadores y formato (node:test)
```
No abras los HTML con doble clic: los módulos ES requieren un servidor HTTP.

## Configuración
La URL de la API vive en `js/config/env.js`. Para cambiarla: edita ese archivo, o define `JAVN_API_URL` (ver `.env.example`)
y ejecuta `npm run build`, que lo regenera (útil en Vercel). **La API debe permitir CORS desde el dominio del frontend.**

## Arquitectura
- Cada HTML es una carcasa de pocas líneas: `<body data-page="…" data-layout="site|panel" data-roles="…">`. `js/app.js` protege la ruta
  por rol, pinta la navegación y carga `js/pages/<data-page>.js`.
- `js/services/*` = una clase de acceso por módulo de la API (`api-client.js` maneja JWT, errores y query strings).
- `js/components/*` = layout, modales accesibles, formularios, y `crud-page.js` (tabla + acciones) que usan casi todas las pantallas de admin.
- `css/global.css` importa variables, reset, componentes, animaciones y responsive; `css/pages/` para estilos específicos.

| Rol | Entra a |
|---|---|
| Público | `/`, servicios, nosotros, contacto, privacidad, términos, login, registro |
| cliente | reservar-cita, seguimiento, historial, perfil (vehículos) |
| trabajador | `/trabajador/*` (órdenes, seguimiento, citas: confirmar y recibir vehículos, cobrar) |
| administrador | `/admin/*` (todo, incl. usuarios, servicios con precios, horarios, tipos, asignar trabajadores, reembolsos) |

## Decisiones según la API real
- Agendar exige sesión de **cliente** (`POST /citas` es autenticado). `fechaHoraInicio` = `"YYYY-MM-DD HH:mm"`, `servicios` = arreglo de ids (se pueden combinar).
- Horarios libres: `GET /citas/disponibilidad?fecha=…&servicios=1,2`.
- El cliente **no puede registrar pagos** (`POST /pagos` es de staff): el método preferido viaja en `notas` de la cita y el cobro se registra en el panel (botón *Cobrar* en Órdenes).
- Seguimiento por polling cada 10 s (`POLL_MS`) mientras la orden no llegue al último estado; la campana consulta `/notificaciones` cada 30 s.
- Nunca se pide número completo de tarjeta ni CVV: solo referencia, últimos 4 y marca.
- Bajas lógicas (usuarios y servicios): los botones dicen "Dar de baja"/"Baja".

## Pendiente de confirmar contra tu API (marcado con ⚠ en el código)
1. Forma exacta de `precios` en `/servicios` (se acepta arreglo `[{idTipoVehiculo, precio}]` u objeto `{idTipo: precio}`) y del body al crear/editar servicios.
2. Body de `POST /usuarios` para staff (se asume `perfil: {rfc, curp, turno}`).
3. Body de `PUT /horarios/:dia` (se envían `horaApertura/horaCierre` y `hora_apertura/hora_cierre`).
4. Nombres de campos de `/ordenes/:id/seguimiento` (el código acepta camelCase y snake_case y varias alternativas).
5. Body de `POST /ordenes/:id/trabajadores` (se asume `{idTrabajador}`).
6. Textos legales de `privacidad.html` y `terminos.html` son de ejemplo; datos de contacto y teléfono son marcadores.

## Pendiente de agregar
Imágenes reales en `assets/images` (el hero usa un SVG), fuentes locales en `assets/fonts` (hoy Google Fonts), y pruebas E2E.
