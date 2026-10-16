import { Platform } from 'react-native';
import Constants from 'expo-constants';

const PORT = 3000;

// 1) Si defines EXPO_PUBLIC_API_URL (archivo .env de la app) se usa tal cual.
//    Ej: EXPO_PUBLIC_API_URL=http://192.168.1.50:3000/api
// 2) Si no, se intenta detectar la IP de tu PC a partir del servidor de Expo
//    (funciona con Expo Go en el celular, en la misma red WiFi).
// 3) Emulador Android -> 10.0.2.2 ; iOS simulator / web -> localhost
function resolveApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri ? hostUri.split(':')[0] : null;
  if (host && !host.includes('exp.direct')) return `http://${host}:${PORT}/api`;
  if (Platform.OS === 'android') return `http://10.0.2.2:${PORT}/api`;
  return `http://localhost:${PORT}/api`;
}

export const API_URL = resolveApiUrl();
