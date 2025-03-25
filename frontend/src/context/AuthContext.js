import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      if (localStorage.token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
          setError(err.response?.data?.error || 'Authentication error');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register user
  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      
      // Load user data
      const userRes = await api.get('/auth/me');
      setUser(userRes.data.data);
      setIsAuthenticated(true);
      setLoading(false);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      return false;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      
      // Load user data
      const userRes = await api.get('/auth/me');
      setUser(userRes.data.data);
      setIsAuthenticated(true);
      setLoading(false);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      return false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Update user profile
  const updateProfile = async (formData) => {
    try {
      const res = await api.put('/auth/updatedetails', formData);
      setUser(res.data.data);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
      return false;
    }
  };

  // Update password
  const updatePassword = async (formData) => {
    try {
      await api.put('/auth/updatepassword', formData);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Password update failed');
      return false;
    }
  };

  // Clear errors
  const clearErrors = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        updatePassword,
        clearErrors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
