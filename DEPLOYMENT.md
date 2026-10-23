# Despliegue

## Vercel (recomendado)
1. Sube la carpeta a GitHub (`git init && git add . && git commit -m "Frontend JAVN" && git push`).
2. En https://vercel.com/new importa el repositorio. Framework Preset: **Other**.
3. Build Command: `npm run build` · Output Directory: `.` (punto) · Install Command: vacío.
4. Variable de entorno (opcional): `JAVN_API_URL` = URL de tu API en Vercel. Si no la defines se usa la de `js/config/env.js`.
5. Deploy. Todas las rutas son archivos reales (`/pages/login.html`, `/admin/dashboard.html`…), no necesitas rewrites.

## CORS (obligatorio)
El navegador bloqueará las peticiones si la API no autoriza el dominio del frontend. En `carwash-api-mysql` habilita
`cors({ origin: ['https://TU-FRONTEND.vercel.app', 'http://localhost:3000'] })` y permite el header `Authorization`.

## Otros hosts
Funciona en cualquier hosting estático (Netlify, GitHub Pages en dominio propio, Nginx). Debe servirse desde la **raíz** del dominio
porque las rutas de CSS/JS son absolutas (`/css/…`). Para una subcarpeta habría que convertirlas a relativas.

## Lista de verificación
- [ ] `npm test` pasa · [ ] CORS configurado · [ ] datos de contacto y textos legales reales · [ ] imágenes en `assets/images`
- [ ] Probar los 3 roles con los usuarios del seed (`admin@carwash.mx`, `luis@carwash.mx`, `carlos@correo.com`).
