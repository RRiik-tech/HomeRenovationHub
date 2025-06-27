import { useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, handleRedirectResult, isFirebaseConfigured } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

export function useFirebaseAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { login } = useAuth();

  useEffect(() => {
    // Skip Firebase initialization if not configured
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    // Handle redirect result on page load
    handleRedirectResult()
      .then((result) => {
        if (result?.user) {
          // User signed in via redirect
          handleFirebaseUser(result.user);
        }
      })
      .catch((error) => {
        console.error('Firebase redirect error:', error);
      });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        handleFirebaseUser(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFirebaseUser = async (firebaseUser: FirebaseUser) => {
    try {
      // Check if user exists in our database
      const response = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }),
      });

      if (response.ok) {
        const { user } = await response.json();
        login(user);
      }
    } catch (error) {
      console.error('Error syncing Firebase user:', error);
    }
  };

  return {
    firebaseUser,
    loading,
  };
}