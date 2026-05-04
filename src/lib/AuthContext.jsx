import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, tokenStore } from '@/api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoadingAuth(true);
    const token = tokenStore.get();
    if (!token) {
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      return;
    }
    try {
      const me = await auth.me();
      setUser(me);
      setIsAuthenticated(true);
    } catch {
      tokenStore.clear();
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (email, password) => {
    const res = await auth.login(email, password);
    tokenStore.set(res.token);
    setUser(res.user);
    setIsAuthenticated(true);
    setAuthError(null);
    return res;
  };

  const register = async (email, password, full_name) => {
    const res = await auth.register(email, password, full_name);
    tokenStore.set(res.token);
    setUser(res.user);
    setIsAuthenticated(true);
    setAuthError(null);
    return res;
  };

  const logout = () => {
    auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Legacy compat — some pages call navigateToLogin
  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings: null,
      login,
      register,
      logout,
      navigateToLogin,
      checkAppState: checkAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
