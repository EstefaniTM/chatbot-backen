import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    setUser(null);
    setIsAuthenticated(false);
    
    // Remover token de axios
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const checkAuthStatus = useCallback(() => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        let parsedUser = null;
        try {
          parsedUser = JSON.parse(userData);
        } catch (e) {
          console.warn('userData no es un JSON válido:', e);
          parsedUser = null;
        }
        if (parsedUser) {
          setUser(parsedUser);
          setIsAuthenticated(true);
          // Configurar axios con el token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = (authData) => {
    const { token, user: userData } = authData;
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    setUser(userData);
    setIsAuthenticated(true);
    
    // Configurar axios con el token
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
