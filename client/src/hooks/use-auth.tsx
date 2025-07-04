import { useState, useEffect } from 'react';
import { authManager } from '@/lib/auth';
import { User } from '@shared/schema';

export function useAuth() {
  const [state, setState] = useState(authManager.getState());

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setState);
    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await authManager.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    login: (user: User) => authManager.login(user),
    logout,
    getCurrentUser: () => authManager.getCurrentUser(),
  };
}