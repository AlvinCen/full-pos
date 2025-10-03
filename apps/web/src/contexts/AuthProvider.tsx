'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { api, LoginCredentials } from '@/lib/api';
import { usePathname, useRouter } from 'next/navigation';

// Define the shape of the user object and auth context
interface User {
  id: string;
  name: string;
  email: string;
  permissions: string[];
  outlet?: { id: string; name: string };
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const queryClient = new QueryClient();

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
  const router = useRouter();
  const pathname = usePathname();

  const { data: initialUser, isLoading: isMeLoading } = useQuery({
    queryKey: ['me'],
    queryFn: api.getMe,
    enabled: !!(typeof window !== 'undefined' && localStorage.getItem('pos-user')),
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser.user);
    } else if (!isMeLoading && pathname !== '/login') {
      const storedUser = localStorage.getItem('pos-user');
      if (!storedUser) {
        router.push('/login');
      }
    }
  }, [initialUser, isMeLoading, router, pathname]);


  const { mutateAsync: loginMutation, isPending: isLoginLoading } = useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      setUser(data.user);
      localStorage.setItem('pos-user', JSON.stringify(data.user));
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  const login = async (credentials: LoginCredentials) => {
    await loginMutation(credentials);
    router.push('/dashboard');
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('pos-user');
    queryClient.clear();
    router.push('/login');
  }, [router]);

  const hasPermission = useCallback((requiredPermission: string): boolean => {
    if (!user?.permissions) {
      return false;
    }
    if (user.permissions.includes('all')) {
      return true;
    }
    if (user.permissions.includes(requiredPermission)) {
      return true;
    }
    // Check for wildcards
    const permissionParts = requiredPermission.split(':'); // e.g., ['sale', 'create']
    const wildcard = `${permissionParts[0]}:*`; // e.g., 'sale:*'
    if (user.permissions.includes(wildcard)) {
      return true;
    }
    return false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading: isLoginLoading || isMeLoading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
