import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, getCurrentUser, logoutUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('shms_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('shms_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate existing session on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('shms_token');
      if (storedToken) {
        try {
          const freshUser = await getCurrentUser();
          setUser(freshUser);
          localStorage.setItem('shms_user', JSON.stringify(freshUser));
        } catch (err) {
          // Only clear session if server explicitly returns 401 Unauthorized or 403 Forbidden
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            console.warn('Session expired or invalid:', err.message);
            setUser(null);
            setToken(null);
            localStorage.removeItem('shms_token');
            localStorage.removeItem('shms_user');
          } else {
            // Server might be waking up or temporarily unreachable; retain stored session
            console.warn('Backend server cold-start or network delay; retaining local session credentials:', err.message);
          }
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('shms_token', data.token);
    localStorage.setItem('shms_user', JSON.stringify(data.user));
    return data;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const isViewer = user?.role === 'viewer';
  const isApproved = user?.accountStatus === 'approved' || user?.accountStatus === 'active';
  const isPending = user?.accountStatus === 'pending';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isStaff,
        isViewer,
        isApproved,
        isPending,
        assignedBeats: user?.assignedBeats || [],
        assignedVillages: user?.assignedVillages || [],
        login,
        logout
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
