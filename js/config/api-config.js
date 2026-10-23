import { ENV } from './env.js';
export const API_BASE = ENV.API_URL;
export const POLL_MS = 10000; // refresco del seguimiento
export const HOME_BY_ROLE = { cliente: '/', administrador: '/admin/dashboard.html', trabajador: '/trabajador/dashboard.html' };
