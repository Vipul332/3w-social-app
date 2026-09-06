import { createContext, useCallback, useEffect, useState } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

/**
 * Holds the current user + token in memory (backed by localStorage so a
 * page refresh doesn't log the user out), and exposes login/signup/logout.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, if a token exists, verify it and hydrate the user.
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const { user: me } = await authService.getMe();
        setUser(me);
      } catch (err) {
        // Token invalid/expired — clear it silently.
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (credentials) => {
    const { token, user: loggedInUser } = await authService.login(credentials);
    localStorage.setItem('token', token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const signup = useCallback(async (details) => {
    const { token, user: newUser } = await authService.signup(details);
    localStorage.setItem('token', token);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
