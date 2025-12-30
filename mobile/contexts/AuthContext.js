import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

// Hardcoded users for testing
const HARDCODED_USERS = [
  { id: 1, name: 'John Doe', email: 'john@example.com', password: '123456' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', password: '123456' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    }
  };

  const login = async (credentials, delayNavigation = false) => {
    setLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Check hardcoded users
      const foundUser = HARDCODED_USERS.find(
        u => u.email === credentials.email && u.password === credentials.password
      );

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      // Generate fake token
      const fakeToken = `fake-token-${Date.now()}`;
      const userWithoutPassword = { 
        id: foundUser.id, 
        name: foundUser.name, 
        email: foundUser.email 
      };

      await AsyncStorage.setItem('authToken', fakeToken);
      await AsyncStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      // If delayNavigation is true, return user data but don't set state yet
      if (delayNavigation) {
        setToken(fakeToken);
        return { success: true, user: userWithoutPassword, token: fakeToken };
      }
      
      setToken(fakeToken);
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const register = async (userData, delayNavigation = false) => {
    setLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Check if email already exists
      const existingUser = HARDCODED_USERS.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Create new user
      const newUser = {
        id: HARDCODED_USERS.length + 1,
        name: userData.name,
        email: userData.email,
      };

      // Add to hardcoded users (for this session only)
      HARDCODED_USERS.push({ ...newUser, password: userData.password });

      // Generate fake token
      const fakeToken = `fake-token-${Date.now()}`;

      await AsyncStorage.setItem('authToken', fakeToken);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      // If delayNavigation is true, return user data but don't set state yet
      if (delayNavigation) {
        setToken(fakeToken);
        return { success: true, user: newUser, token: fakeToken };
      }
      
      setToken(fakeToken);
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        logout,
        clearError,
        completeLogin,
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
