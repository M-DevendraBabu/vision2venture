import { createContext, useState, useEffect } from 'react';
import api, { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Synchronous instant initialization from localStorage (0ms load time)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Warm up backend connection in background immediately
    api.get('/health').catch(() => {});

    // 2. Validate and refresh profile silently if token exists
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getProfile()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch((error) => {
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        });
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    await authAPI.register({ name, email, password });
    // Auto-login after registration
    const loginRes = await authAPI.login({ email, password });
    localStorage.setItem('token', loginRes.data.access_token);
    localStorage.setItem('user', JSON.stringify(loginRes.data.user));
    setUser(loginRes.data.user);
    return loginRes.data;
  };

  const googleLogin = async (accessToken, userInfo) => {
    const res = await authAPI.googleAuth(accessToken, userInfo);
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
