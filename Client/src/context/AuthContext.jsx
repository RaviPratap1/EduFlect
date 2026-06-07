import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../api/services';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Fetch current user
  const fetchMe = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.getMe();
      setUser(data.data);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('accessToken');
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (accessToken) fetchMe();
  }, [accessToken]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const { data } = await api.login(credentials);
      const token = data.data.accessToken;
      localStorage.setItem('accessToken', token);
      setAccessToken(token);
      setUser(data.data.user);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const { data } = await api.register(userData);
      setOtpSent(true);
      toast.success('OTP sent! Check your email.');
      return { success: true, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (payload) => {
    try {
      setLoading(true);
      const { data } = await api.verifyOtp(payload);
      setOtpVerified(true);
      toast.success('Email verified! Please login.');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out');
  };

  const resetOtpState = () => { setOtpSent(false); setOtpVerified(false); };

  return (
    <AuthContext.Provider value={{ user, accessToken, isAuthenticated, loading, otpSent, otpVerified, login, register, verifyOtp, logout, fetchMe, resetOtpState, setOtpSent }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
