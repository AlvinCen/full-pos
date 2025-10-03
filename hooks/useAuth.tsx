
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User, UserRole } from '../types';
import { USERS } from '../constants';

interface AuthContextType {
  user: User | null;
  login: (email: string, passwordHash: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('pos-user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  });

  const login = useCallback(async (email: string, passwordHash: string): Promise<User | null> => {
    // This is a mock login. In a real app, you'd call an API.
    const foundUser = USERS.find(u => u.email === email && u.passwordHash === passwordHash);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('pos-user', JSON.stringify(foundUser));
      return foundUser;
    }
    return null;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('pos-user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
