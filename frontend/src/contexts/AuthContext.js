import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // If token exists, set the auth header for all axios requests
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      // Fetch current user data
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/auth/me');
      setCurrentUser(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching current user:', error);
      logout(); // Logout if token is invalid
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.post('/api/auth/register', userData);
      setLoading(false);
      return res.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      setLoading(false);
      throw error;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.post('/api/auth/login', userData);
      const { token, user } = res.data;
      
      // Save token and user data
      localStorage.setItem('token', token);
      setToken(token);
      setCurrentUser(user);
      
      setLoading(false);
      return user;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      setLoading(false);
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    token,
    loading,
    error,
    register,
    login,
    logout,
    fetchCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
