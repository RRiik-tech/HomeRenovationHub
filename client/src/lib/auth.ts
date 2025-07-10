import { User } from "@shared/schema";
import { firebaseSignOut } from './firebase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

class AuthManager {
  private state: AuthState = {
    user: null,
    isAuthenticated: false
  };
  
  private listeners: Array<(state: AuthState) => void> = [];

  constructor() {
    // Load user from localStorage on init
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        this.state.user = parsedUser;
        this.state.isAuthenticated = true;
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
      }
    }
  }

  getState(): AuthState {
    return { ...this.state };
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  login(user: User) {
    this.state.user = user;
    this.state.isAuthenticated = true;
    
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
    
    this.notify();
  }

  async logout() {
    try {
      // Sign out from Firebase if configured
      await firebaseSignOut();
    } catch (error) {
      console.warn('Firebase sign out failed:', error);
      // Continue with local logout even if Firebase logout fails
    }
    
    // Clear local auth state
    this.state.user = null;
    this.state.isAuthenticated = false;
    localStorage.removeItem('user');
    this.notify();
  }

  getCurrentUser(): User | null {
    return this.state.user;
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }
}

export const authManager = new AuthManager();