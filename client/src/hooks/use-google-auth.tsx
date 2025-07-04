import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { 
  signInWithGoogle, 
  handleRedirectResult, 
  onAuthStateChange, 
  getCurrentFirebaseUser,
  isFirebaseConfigured 
} from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Handle redirect result when component mounts
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const handleAuthRedirect = async () => {
      try {
        setIsLoading(true);
        const result = await handleRedirectResult();
        
        if (result?.user) {
          // User signed in successfully
          await handleFirebaseUser(result.user);
        }
      } catch (error: any) {
        console.error('Google auth redirect error:', error);
        
        // Provide user-friendly error messages
        let errorMessage = "Failed to authenticate with Google";
        if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = "Sign-in was cancelled";
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = "Network error. Please check your connection and try again";
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = "Too many attempts. Please try again later";
        }
        
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthRedirect();
  }, [login, toast]);

  // Listen to auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = onAuthStateChange((user) => {
      setFirebaseUser(user);
      
      // If user is already authenticated in our app, don't process Firebase user again
      if (isAuthenticated && user) {
        return;
      }
    });

    return unsubscribe;
  }, [isAuthenticated]);

  const handleFirebaseUser = async (user: FirebaseUser) => {
    try {
      setIsLoading(true);
      
      // Send Firebase user data to backend
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to authenticate with server');
      }

      const data = await response.json();
      
      // Login the user in our app
      login(data.user);
      
      toast({
        title: "Welcome!",
        description: `Successfully signed in as ${data.user.firstName} ${data.user.lastName}`,
      });
    } catch (error: any) {
      console.error('Firebase auth error:', error);
      
      let errorMessage = error.message || "Failed to authenticate";
      if (error.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection and try again";
      } else if (error.message?.includes('server')) {
        errorMessage = "Server error. Please try again in a moment";
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogleHandler = async () => {
    if (!isFirebaseConfigured) {
      toast({
        title: "Configuration Error",
        description: "Google authentication is not configured. Please use email/password to sign in.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Show loading feedback
      toast({
        title: "Redirecting to Google",
        description: "Please wait while we redirect you to Google for authentication...",
      });
      
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      let errorMessage = "Failed to sign in with Google";
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked. Please allow popups and try again";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Sign-in was cancelled";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection and try again";
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle: signInWithGoogleHandler,
    isLoading,
    firebaseUser,
    isFirebaseConfigured,
  };
}; 