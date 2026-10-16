import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export async function getItem(key) {
  try {
    if (Platform.OS === 'web') return globalThis.localStorage?.getItem(key) ?? null;
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setItem(key, value) {
  try {
    if (Platform.OS === 'web') return globalThis.localStorage?.setItem(key, value);
    await SecureStore.setItemAsync(key, value);
  } catch {}
}

export async function removeItem(key) {
  try {
    if (Platform.OS === 'web') return globalThis.localStorage?.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  } catch {}
}
