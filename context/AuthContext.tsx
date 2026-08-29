
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User, Role } from '../types';
import { authenticateUser, getMockUsers } from '../services/mockApi';
// import { loginAPI } from '../services/mysqlApi'; // UNCOMMENT FOR REAL API

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (userId: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = useCallback(async (userId: string, password: string): Promise<boolean> => {
    // SWITCH TO THIS FOR REAL API:
    // const user = await loginAPI(userId, password);
    
    // CURRENT MOCK:
    const user = authenticateUser(userId, password);
    
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!currentUser, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
