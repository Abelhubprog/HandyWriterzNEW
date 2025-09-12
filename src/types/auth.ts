// Minimal user type for authentication flows
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'user' | 'moderator' | 'editor';
  status?: 'active' | 'inactive' | 'suspended';
  avatarUrl?: string;
}


export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error?: Error | null;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
}
