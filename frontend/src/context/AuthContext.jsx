import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authAPI.getProfile();
          setUser(res.data);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('token', res.data.access_token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    await authAPI.register({ name, email, password });
    // Auto-login after registration
    const loginRes = await authAPI.login({ email, password });
    localStorage.setItem('token', loginRes.data.access_token);
    setUser(loginRes.data.user);
    return loginRes.data;
  };

  const googleLogin = async (accessToken, userInfo) => {
    const res = await authAPI.googleAuth(accessToken, userInfo);
    localStorage.setItem('token', res.data.access_token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
