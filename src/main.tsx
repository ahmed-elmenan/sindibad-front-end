import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './i18n.ts' 
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

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
