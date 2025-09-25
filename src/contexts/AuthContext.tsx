import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import type { Admin, LoginRequest } from '@/types/api';

interface AuthContextType {
  user: Admin | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const profile = await apiService.getProfile();
          setUser(profile.data);
        } catch (error) {
          console.error('Failed to get profile:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

const login = async (credentials: LoginRequest) => {
  const response = await apiService.login(credentials);

  localStorage.setItem("auth_token", response.token);
  setUser(response.admin);

  try {
    const profile = await apiService.getProfile();
    setUser(profile.data);
  } catch (err) {
    console.error("Failed to fetch profile after login", err);
  }
};

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};