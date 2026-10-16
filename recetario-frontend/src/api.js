import { API_URL } from './config';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

let token = null;
let onSessionExpired = null;

export const setToken = (t) => { token = t; };
export const setSessionExpiredHandler = (fn) => { onSessionExpired = fn; };

const TOKEN_MESSAGES = ['Token inválido o expirado', 'Usuario no existe', 'Token no proporcionado'];

async function request(method, path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    throw new ApiError(`No se pudo conectar con el servidor (${API_URL}). Verifica que el backend esté encendido y que estés en la misma red.`, 0);
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    const detail = Array.isArray(data?.errors) && data.errors.length ? `\n• ${data.errors.join('\n• ')}` : '';
    const message = (data?.message || `Error ${res.status}`) + (data?.errors ? detail : '');
    if (res.status === 401 && token && TOKEN_MESSAGES.includes(data?.message) && onSessionExpired) {
      onSessionExpired();
    }
    throw new ApiError(message, res.status, data);
  }
  return data;
}

const qs = (params = {}) => {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return parts.length ? `?${parts.join('&')}` : '';
};

export const auth = {
  register: (data) => request('POST', '/auth/register', data),
  login: (data) => request('POST', '/auth/login', data),
};

export const users = {
  me: () => request('GET', '/users/me'),
  update: (data) => request('PUT', '/users/me', data),
  remove: (password) => request('DELETE', '/users/me', { password }),
};

export const recipes = {
  mine: (params) => request('GET', `/recipes/mine${qs(params)}`),
  all: (params) => request('GET', `/recipes${qs(params)}`),
  get: (id) => request('GET', `/recipes/${id}`),
  create: (data) => request('POST', '/recipes', data),
  update: (id, data) => request('PUT', `/recipes/${id}`, data),
  remove: (id) => request('DELETE', `/recipes/${id}`),
};

export const groups = {
  list: () => request('GET', '/groups'),
  get: (id) => request('GET', `/groups/${id}`),
  create: (data) => request('POST', '/groups', data),
  update: (id, data) => request('PUT', `/groups/${id}`, data),
  // Sin confirm el backend responde 409 con el aviso de cuántas recetas se borrarán
  remove: (id, confirm = false) => request('DELETE', `/groups/${id}${confirm ? '?confirm=true' : ''}`),
  addRecipe: (id, recipeId) => request('POST', `/groups/${id}/recipes/${recipeId}`),
  removeRecipe: (id, recipeId) => request('DELETE', `/groups/${id}/recipes/${recipeId}`),
};