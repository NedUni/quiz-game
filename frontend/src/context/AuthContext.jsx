// context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check existing token

  // On mount: if we have a token in localStorage, fetch the current user.
  // This keeps the user "logged in" across page refreshes.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => setUser(res.data.data.user))
      .catch(() => {
        // Token is invalid/expired — clear it.
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const res = await api.post('/auth/login', { username, password });
    const { token, user: u } = res.data.data;
    localStorage.setItem('token', token);
    setUser(u);
    return u;
  }

  async function register(username, password) {
    const res = await api.post('/auth/register', { username, password });
    const { token, user: u } = res.data.data;
    localStorage.setItem('token', token);
    setUser(u);
    return u;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook so components don't need to import useContext + AuthContext.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}