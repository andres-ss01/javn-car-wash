// Genera js/config/env.js a partir de JAVN_API_URL (útil en Vercel: Build Command = npm run build)
import { writeFileSync } from 'node:fs';
const url = process.env.JAVN_API_URL;
if (url) { writeFileSync('js/config/env.js', `export const ENV = { API_URL: ${JSON.stringify(url.replace(/\/$/, ''))} };\n`); console.log('API_URL =', url); }
else console.log('JAVN_API_URL no definida: se usa js/config/env.js tal cual.');
