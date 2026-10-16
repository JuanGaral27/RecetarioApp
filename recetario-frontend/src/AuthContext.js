import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as api from './api';
import { getItem, setItem, removeItem } from './storage';

const TOKEN_KEY = 'recetario_token';
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const clearSession = useCallback(async () => {
    api.setToken(null);
    await removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    api.setSessionExpiredHandler(clearSession);
    (async () => {
      const saved = await getItem(TOKEN_KEY);
      if (saved) {
        api.setToken(saved);
        try {
          setUser(await api.users.me());
        } catch (e) {
          // Solo cerramos sesión si el token ya no sirve; si es un error de red lo dejamos pasar a login
          await clearSession();
        }
      }
      setBooting(false);
    })();
  }, [clearSession]);

  const startSession = async ({ user: u, token }) => {
    api.setToken(token);
    await setItem(TOKEN_KEY, token);
    setUser(u);
  };

  const value = {
    user,
    booting,
    login: async (email, password) => startSession(await api.auth.login({ email, password })),
    register: async (data) => startSession(await api.auth.register(data)),
    logout: clearSession,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
