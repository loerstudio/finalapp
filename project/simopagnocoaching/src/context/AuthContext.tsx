import React, { createContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  name: string;
  email: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  updateAccount: (updates: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  logout: async () => {},
  register: async () => false,
  updateAccount: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const userStr = await AsyncStorage.getItem('currentUser');
    if (userStr) {
      setUser(JSON.parse(userStr));
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (email: string, password: string) => {
    const usersStr = await AsyncStorage.getItem('users');
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      await AsyncStorage.setItem('currentUser', JSON.stringify(found));
      setUser(found);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('currentUser');
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (name: string, email: string, password: string) => {
    const usersStr = await AsyncStorage.getItem('users');
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    if (users.find(u => u.email === email)) {
      return false; // Email already exists
    }
    const newUser: User = { name, email, password };
    users.push(newUser);
    await AsyncStorage.setItem('users', JSON.stringify(users));
    await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
    setUser(newUser);
    setIsAuthenticated(true);
    return true;
  };

  const updateAccount = async (updates: Partial<User>) => {
    if (!user) return;
    const usersStr = await AsyncStorage.getItem('users');
    let users: User[] = usersStr ? JSON.parse(usersStr) : [];
    users = users.map(u =>
      u.email === user.email ? { ...u, ...updates } : u
    );
    const updatedUser = { ...user, ...updates };
    await AsyncStorage.setItem('users', JSON.stringify(users));
    await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register, updateAccount }}>
      {children}
    </AuthContext.Provider>
  );
}; 