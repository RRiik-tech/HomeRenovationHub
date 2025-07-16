import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, signOut, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';

console.log("VITE ENV:", import.meta.env);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase credentials are available
const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
);

console.log('Firebase Configuration Status:', {
  configured: isFirebaseConfigured,
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID,
});

// Initialize Firebase only if configured
let app: any = null;
let auth: any = null;
let analytics: any = null;
let googleProvider: GoogleAuthProvider | null = null;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Initialize Analytics only in browser environment and if measurement ID exists
    if (typeof window !== 'undefined' && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
      try {
        analytics = getAnalytics(app);
      } catch (analyticsError) {
        console.warn('Analytics initialization failed:', analyticsError);
      }
    }
    
    googleProvider = new GoogleAuthProvider();
    
    // Configure Google provider for better user experience
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    
    // Set custom parameters for better UX
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
    
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    // Reset variables on failure
    app = null;
    auth = null;
    db = null;
    googleProvider = null;
  }
} else {
  console.warn('Firebase not configured. Please provide Firebase credentials in your .env file.');
}

// Sign in with Google
export const signInWithGoogle = () => {
  if (!auth || !googleProvider) {
    console.warn('Firebase not configured. Please provide Firebase credentials.');
    return Promise.reject(new Error('Firebase not configured'));
  }
  
  try {
    return signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('Google sign-in failed:', error);
    return Promise.reject(error);
  }
};

// Handle redirect result
export const handleRedirectResult = () => {
  if (!auth) {
    return Promise.resolve(null);
  }
  
  try {
    return getRedirectResult(auth);
  } catch (error) {
    console.error('Redirect result handling failed:', error);
    return Promise.reject(error);
  }
};

// Sign out
export const firebaseSignOut = () => {
  if (!auth) {
    return Promise.resolve();
  }
  
  try {
    return signOut(auth);
  } catch (error) {
    console.error('Sign out failed:', error);
    return Promise.reject(error);
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) {
    console.warn('Firebase auth not available');
    return () => {};
  }
  
  try {
    return onAuthStateChanged(auth, callback);
  } catch (error) {
    console.error('Auth state change listener failed:', error);
    return () => {};
  }
};

// Get current user
export const getCurrentFirebaseUser = () => {
  if (!auth) {
    return null;
  }
  return auth.currentUser;
};

// Export db with null fallback
export { db };

export { auth, analytics, googleProvider, isFirebaseConfigured };
export default app;