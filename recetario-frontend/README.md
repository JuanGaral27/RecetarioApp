# Recetario — Frontend (React Native + Expo)

App móvil que consume el backend de la carpeta `../backend`.

## Ejecutar
1. Levanta el backend (`cd ../backend && npm run dev`) y confirma `MongoDB conectado`.
2. En esta carpeta:
   ```bash
   npm install
   npx expo start
   ```
3. Escanea el QR con **Expo Go** (celular y PC en la **misma WiFi**).

## Conexión con el backend
La app detecta sola la IP de tu PC. Si no conecta, crea un archivo `.env` aquí con:
```
EXPO_PUBLIC_API_URL=http://IP_DE_TU_PC:3000/api
```
(ve tu IP con `ipconfig` → "Dirección IPv4") y reinicia con `npx expo start -c`.
Emulador Android usa `10.0.2.2` automáticamente. Si el celular no llega, permite el puerto 3000 en el Firewall de Windows.

## Estructura
```
src/
  api.js          llamadas al backend (fetch + token)
  AuthContext.js  sesión (login, registro, logout)
  navigation.js   pestañas: Mis recetas · Generales · Grupos · Perfil
  ui.js           botones, inputs, tarjetas, confirmaciones
  screens/        Login, Registro, listas de recetas, detalle, formulario,
                  grupos (lista, detalle, formulario) y perfil
```
