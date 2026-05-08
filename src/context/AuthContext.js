import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await AsyncStorage.getItem('user');
        console.log('data', data);
        await AsyncStorage.removeItem('user');
        if (data) {
          setUser(JSON.parse(data));
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.log('Auth init error:', e);
      } finally {
        // ⬇️ Splash stays visible for 3 seconds — change to any ms you want
        setTimeout(() => setIsLoading(false), 3000);
      }
    };
    init();
  }, []);

  const login = async (userData) => {
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}