import { useState, useEffect } from 'react';
import { authManager } from '@/lib/auth';
import { User } from '@shared/schema';

export function useAuth() {
  const [state, setState] = useState(authManager.getState());

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    login: (user: User) => authManager.login(user),
    logout: () => authManager.logout(),
    getCurrentUser: () => authManager.getCurrentUser(),
  };
}