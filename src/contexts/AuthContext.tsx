/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getToken, removeToken, handleLogoutUser } from '@/services/auth.service';
import type { User, AuthContextType } from '@/types/Auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading] = useState(false);
  const queryClient = useQueryClient();

  const updateUser = (userData: User | null) => {
    setUser(userData);
    const hasToken = !!getToken();
    setIsAuthenticated(!!userData && hasToken);
  };

  useEffect(() => {
    // Vérifier seulement si un token existe, sans appeler l'API
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const logout = async () => {
    // Appel API de déconnexion
    await handleLogoutUser();
    
    // Supprimer le token
    removeToken();
    
    // Nettoyer le localStorage (données utilisateur)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
    }
    
    // Réinitialiser l'état d'authentification
    setIsAuthenticated(false);
    setUser(null);
    
    // Nettoyer tous les caches React Query
    queryClient.clear();
  };

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