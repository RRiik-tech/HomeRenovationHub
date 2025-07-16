import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, onAuthStateChange, getCurrentFirebaseUser, firebaseSignOut } from '@/lib/firebase';
import { User } from '@shared/schema';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => Promise<void>;
  getCurrentUser: () => User | null;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase user to our User type
        const user: Partial<User> = {
          id: parseInt(firebaseUser.uid, 10),
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || '',
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ')[1] || '',
          photoURL: firebaseUser.photoURL || '',
          firebaseUid: firebaseUser.uid,
          isVerified: firebaseUser.emailVerified,
          createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
          userType: 'homeowner', // Default type, should be updated from database
        };

        setState({
          user: user as User,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = (user: User) => {
    setState({
      user,
      isAuthenticated: true,
      loading: false,
    });
  };

  const logout = async () => {
    try {
      await firebaseSignOut();
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const getCurrentUser = () => state.user;

  const updateUser = (user: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...user } : null,
    }));
  };

  const value = {
    ...state,
    login,
    logout,
    getCurrentUser,
    updateUser,
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}