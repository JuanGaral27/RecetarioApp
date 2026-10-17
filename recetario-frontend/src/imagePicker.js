import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Abre la galería del dispositivo y devuelve la foto como texto "data:image/jpeg;base64,..."
// para guardarla directamente en la base de datos.
export async function pickImageFromDevice({ width = 800, quality = 0.6 } = {}) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false, // sin recorte: evita fallos en algunos teléfonos
    quality: 0.7,
    base64: true, // respaldo por si falla el redimensionado
  });
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];

  // 1) Intentar reducir la foto (así pesa poco y carga rápido)
  try {
    const rendered = await ImageManipulator.manipulate(asset.uri).resize({ width }).renderAsync();
    const saved = await rendered.saveAsync({ compress: quality, format: SaveFormat.JPEG, base64: true });
    if (saved.base64) return `data:image/jpeg;base64,${saved.base64}`;
  } catch (e) {
    // seguimos con el respaldo
  }

  // 2) Respaldo: usar la foto tal como la entregó la galería
  if (asset.base64) {
    if (asset.base64.length > 9 * 1024 * 1024) throw new Error('La foto es demasiado pesada. Elige una más pequeña.');
    return `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
  }
  throw new Error('No se pudo leer la foto seleccionada.');
}