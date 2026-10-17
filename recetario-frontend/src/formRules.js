// Reglas de los formularios (registro y perfil). Límites fijos:
//   nombre: 4 a 20 caracteres · correo: formato estándar, máx. 100 · contraseña: 6 a 14 caracteres
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export function validateName(value) {
  const v = (value || '').trim();
  if (!v) return 'El nombre es obligatorio';
  if (v.length < 4) return 'El nombre debe tener al menos 4 caracteres';
  if (v.length > 20) return 'El nombre no puede pasar de 20 caracteres';
  return '';
}

export function validateEmail(value) {
  const v = (value || '').trim();
  if (!v) return 'El correo es obligatorio';
  if (v.length > 100) return 'El correo no puede pasar de 100 caracteres';
  const local = v.split('@')[0];
  if (!EMAIL_REGEX.test(v) || v.includes('..') || local.startsWith('.') || local.endsWith('.')) {
    return 'Escribe un correo válido, por ejemplo: nombre@empresa.com';
  }
  return '';
}

export function validatePassword(value) {
  if (!value) return 'La contraseña es obligatoria';
  if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  if (value.length > 14) return 'La contraseña no puede pasar de 14 caracteres';
  return '';
}