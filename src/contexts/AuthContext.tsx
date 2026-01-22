/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getToken, removeToken, handleLogoutUser } from '@/services/auth.service';
import type { User, AuthContextType } from '@/types/Auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading] = useState(false);
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
    // Vérifier seulement si un token existe, sans appeler l'API
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
      
      // Récupérer les données utilisateur depuis localStorage
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user data from localStorage:', error);
      }
    }
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
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};