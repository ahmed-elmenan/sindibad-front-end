export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  isLoading: boolean;
}