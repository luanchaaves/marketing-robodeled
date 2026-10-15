import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsSetup: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkSetupStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [needsSetup, setNeedsSetup] = useState<boolean>(false);

  const checkSetupStatus = useCallback(async () => {
    try {
      const response = await api.get('/auth/status');
      const hasAdmin = response.data?.data?.hasAdmin ?? true;
      setNeedsSetup(!hasAdmin);
    } catch {
      // If error checking, assume normal flow
      setNeedsSetup(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data?.data?.user || (response.data?.data?.email ? response.data.data : null);
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await checkSetupStatus();
      await refreshUser();
    };
    init();

    // Listen for unauthorized events to clear session
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [checkSetupStatus, refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data?.data?.user || (response.data?.data?.email ? response.data.data : null);
      if (userData) {
        setUser(userData);
      } else {
        await refreshUser();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        needsSetup,
        login,
        logout,
        refreshUser,
        checkSetupStatus,
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
