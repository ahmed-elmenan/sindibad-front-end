import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './i18n.ts' 
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from './contexts/AuthContext';

// Configuration globale pour désactiver TOUS les refetch automatiques
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Ne jamais refetch au focus
      refetchOnMount: false, // Ne jamais refetch au mount
      refetchOnReconnect: false, // Ne jamais refetch à la reconnexion
      staleTime: Infinity, // Données jamais considérées comme périmées
      gcTime: 1000 * 60 * 60 * 2, // Cache garde 2 heures
      retry: 1, // Réessayer 1 fois en cas d'erreur
      networkMode: 'offlineFirst', // Utiliser le cache d'abord, network en dernier recours
    },
  },
});

// Initialize RTL direction based on stored language
const storedLanguage = localStorage.getItem('language') || 'fr';
document.documentElement.lang = storedLanguage;
document.documentElement.dir = storedLanguage === 'ar' ? 'rtl' : 'ltr';

createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
)
