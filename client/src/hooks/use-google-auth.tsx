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
  const { login } = useAuth();
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
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to authenticate with Google",
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
    });

    return unsubscribe;
  }, []);

  const handleFirebaseUser = async (user: FirebaseUser) => {
    try {
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
        throw new Error('Failed to authenticate with server');
      }

      const data = await response.json();
      
      // Login the user in our app
      login(data.user);
      
      toast({
        title: "Success",
        description: "Successfully signed in with Google!",
      });
    } catch (error: any) {
      console.error('Firebase auth error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate",
        variant: "destructive",
      });
    }
  };

  const signInWithGoogleHandler = async () => {
    if (!isFirebaseConfigured) {
      toast({
        title: "Configuration Error",
        description: "Google authentication is not configured. Please check your Firebase settings.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to sign in with Google",
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