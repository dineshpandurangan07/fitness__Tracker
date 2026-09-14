import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authAPI.getProfile();
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          } else {
            logout();
          }
        } catch (error) {
          console.warn('Authentication token expired or invalid', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid credentials or server error';
      return { success: false, message };
    }
  };

  const googleLogin = async (googleData) => {
    try {
      const res = await authAPI.googleAuth(googleData);
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, message: res.data.message || 'Google authentication failed' };
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      const status = error.response?.status;
      let message;
      if (backendMessage) {
        message = backendMessage;
      } else if (!error.response) {
        message = 'Cannot reach the server. Check your internet connection and try again.';
      } else if (status === 503) {
        message = 'Server database is starting. Please wait a few seconds and try again.';
      } else {
        message = `Google Sign-In failed (${status || 'network error'}). Please try again.`;
      }
      return { success: false, message };
    }
  };

  const fastMailLogin = async (email, name) => {
    try {
      const res = await authAPI.fastMailLogin({ email, name });
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, message: res.data.message || 'Fast Mail Login failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Fast Mail Login failed';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please check inputs.';
      return { success: false, message };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const res = await authAPI.forgotPassword({ email });
      if (res.data.success) {
        return { success: true, message: res.data.message, resetToken: res.data.resetToken };
      }
      return { success: false, message: res.data.message || 'Password reset request failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to request password reset';
      return { success: false, message };
    }
  };

  const confirmPasswordReset = async (data) => {
    try {
      const res = await authAPI.resetPassword(data);
      if (res.data.success) {
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Password reset failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      return { success: false, message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Error refreshing profile', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        googleLogin,
        fastMailLogin,
        register,
        requestPasswordReset,
        confirmPasswordReset,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
