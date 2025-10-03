'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { api, LoginCredentials } from '@/lib/api';

// Define the shape of the user object and auth context
interface User {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string };
  outlet?: { id: string; name: string };
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a client
const queryClient = new QueryClient();

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProviderContent>
        {children}
      </AuthProviderContent>
    </QueryClientProvider>
  );
};

const AuthProviderContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Attempt to load user from localStorage on initial render
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('pos-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('pos-user');
    }
  }, []);

  const { mutateAsync: loginMutation, isPending: isLoading } = useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      setUser(data.user);
      localStorage.setItem('pos-user', JSON.stringify(data.user));
    },
    onError: (error) => {
      // Error is thrown and caught in the component that calls login
      console.error('Login failed:', error);
    },
  });

  const login = async (credentials: LoginCredentials) => {
    await loginMutation(credentials);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pos-user');
    // Optionally redirect to login page
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
