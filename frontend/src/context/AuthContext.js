import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const API = `${BACKEND_URL}/api`;

  // Explicitly tell axios to ALWAYS send cookies with requests
  axios.defaults.withCredentials = true;

  // Verify auth session on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/auth/me`);
        setUser(res.data.user);
        
        // Clear any old URL auth params to clean up the bar
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('auth')) {
            window.history.replaceState({}, '', window.location.pathname);
        }
      } catch (err) {
        // If 401, it means no cookie, just continue quietly
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Check old localStorage to clear it out if it exists (security migration)
    if (localStorage.getItem('access_token')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
    }

    checkAuthStatus();
  }, [API]);

  const loginWithGoogleToken = async (credentialResponse) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await axios.post(`${API}/auth/google`, {
        token: credentialResponse.credential
      });
      
      setUser(result.data.user);
      return result.data.user;
    } catch (err) {
      console.error("Google login error:", err);
      const detail = err.response?.data?.detail || "Login failed.";
      setError(detail);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await axios.post(`${API}/auth/logout`);
    } catch(err) {
      console.warn("Logout request failed, discarding local session regardless");
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    setError,
    loginWithGoogleToken,
    logout,
    API
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
