import React, { createContext, useState, useEffect } from 'react'
import { isTokenValid, clearExpiredToken } from '../utils/tokenUtils';

export const AuthContext = createContext();

const ContextProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {

      if (isTokenValid(storedToken)) {
        return JSON.parse(storedUser);
      } else {

        clearExpiredToken();
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => {

    const storedToken = localStorage.getItem('token');
    if (storedToken && isTokenValid(storedToken)) {
      return storedToken;
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.token && isTokenValid(parsedUser.token)) {
        return parsedUser.token;
      }
    }

    clearExpiredToken();
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      if (user.token) {
        localStorage.setItem('token', user.token);
        setToken(user.token);
      }
    } else {

      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setToken(null);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }

    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [token, isInitialized]);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export default ContextProvider