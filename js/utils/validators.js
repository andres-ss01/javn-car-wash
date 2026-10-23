export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
export const isPhone = (v) => /^\d{10}$/.test(String(v));
export const isPlate = (v) => /^[A-Za-z0-9-]{5,11}$/.test(String(v).trim());
export const isPassword = (v) => String(v).length >= 8;
export const isYear = (v) => v === '' || (/^\d{4}$/.test(String(v)) && +v >= 1950 && +v <= new Date().getFullYear() + 1);
