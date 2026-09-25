import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('routecraft_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('routecraft_token');
      if (storedToken) {
        try {
          const res = await getMeApi();
          setUser(res.data);
          setToken(storedToken);
        } catch (err) {
          console.warn('[AuthContext] Token expired or invalid, clearing session.');
          localStorage.removeItem('routecraft_token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    const { token: receivedToken, ...userData } = res.data;
    localStorage.setItem('routecraft_token', receivedToken);
    setToken(receivedToken);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await registerApi({ name, email, password });
    const { token: receivedToken, ...userData } = res.data;
    localStorage.setItem('routecraft_token', receivedToken);
    setToken(receivedToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('routecraft_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
