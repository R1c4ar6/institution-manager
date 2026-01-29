import React, { createContext, useContext, useEffect, useState } from 'react';
import pb from '../config/pocketbaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  // Get initial auth state
  const checkInitialAuth = async () => {
    setLoading(true);
    
    // Check if we have a valid token
    if (pb.authStore.isValid) {
      try {
        // Refresh token to ensure it's valid and get latest user data
        await pb.collection('_superusers').authRefresh();
        const user = pb.authStore.model;
        setUser(user);
        
        if (user?.id) {
          await fetchEmployeeData(user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth refresh failed:", error);
        // Clear invalid auth
        pb.authStore.clear();
        setUser(null);
        setEmployee(null);
        setLoading(false);
      }
    } else {
      // No valid auth token
      setUser(null);
      setEmployee(null);
      setLoading(false);
    }
  };

  // Run initial check
  checkInitialAuth();

  // Listen for auth store changes (login/logout)
  const unsubscribe = pb.authStore.onChange((token, model) => {
    console.log('Auth state changed:', token ? 'Logged in' : 'Logged out');
    
    if (token && model) {
      // User logged in or token refreshed
      setUser(model);
      if (model.id) {
        fetchEmployeeData(model.id);
      }
    } else {
      // User logged out or token expired
      setUser(null);
      setEmployee(null);
      setLoading(false);
    }
  });

  // Clean up on unmount
  return () => {
    unsubscribe();
  };
}, []);

  const fetchEmployeeData = async (userId) => {
    try {
      const { data, error } = await pb.collection('employees').getOne(userId);

      if (error) throw error;
      setEmployee(data);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await pb.collection('employees').authWithPassword(email, password);
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = pb.authStore.clear();
    if (error) throw error;
  };

  const value = {
    user,
    employee,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};