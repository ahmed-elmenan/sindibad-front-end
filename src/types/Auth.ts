export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'ADMIN' | 'LEARNER' | 'ORGANISATION' | 'SUPER_ADMIN';
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  isLoading: boolean;
  initialized?: boolean;
}