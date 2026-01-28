/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getToken, removeToken, handleLogoutUser } from '@/services/auth.service';
import { getSummaryProfile } from '@/services/auth.service';
import type { User, AuthContextType } from '@/types/Auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const queryClient = useQueryClient();

  const updateUser = useCallback((userData: User | null) => {
    setUser(userData);
    const hasToken = !!getToken();
    setIsAuthenticated(!!userData && hasToken);
    
    // Sauvegarder l'utilisateur dans localStorage
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Try to fetch the latest user profile from the API
        const profile = await getSummaryProfile();
        if (profile) {
          const userData = profile as unknown as User;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          setIsAuthenticated(true);
        } else {
          // Fallback to localStorage if API returns nothing
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(true); // token exists but no profile — keep authenticated state
          }
        }
      } catch (error) {
        console.error('Error fetching profile on init:', error);
        // If fetching profile fails, clear auth to force re-login
        removeToken();
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        setInitialized(true);
      }
    };

    init();
  }, []);

  const logout = useCallback(async () => {
    // Appel API de déconnexion
    await handleLogoutUser();
    
    // Supprimer le token
    removeToken();
    
    // Nettoyer le localStorage (données utilisateur)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
    }
    
    // Réinitialiser l'état d'authentification
    setIsAuthenticated(false);
    setUser(null);
    
    // Nettoyer tous les caches React Query
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: updateUser, // Use the new updateUser function
        isAuthenticated,
        logout,
        isLoading,
        initialized
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};