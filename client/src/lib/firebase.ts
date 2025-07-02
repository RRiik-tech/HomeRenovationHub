import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, signOut, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

// Check if Firebase credentials are available
const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
);

// For demo purposes, show Google button even without proper config
const showGoogleButton = true;

// Initialize Firebase only if configured
let app: any = null;
let auth: any = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Add scopes if needed
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

// Sign in with Google
export const signInWithGoogle = () => {
  if (!auth || !googleProvider) {
    console.warn('Firebase not configured. Please provide Firebase credentials.');
    return Promise.reject(new Error('Firebase not configured'));
  }
  return signInWithRedirect(auth, googleProvider);
};

// Handle redirect result
export const handleRedirectResult = () => {
  if (!auth) {
    return Promise.resolve(null);
  }
  return getRedirectResult(auth);
};

// Sign out
export const firebaseSignOut = () => {
  if (!auth) {
    return Promise.resolve();
  }
  return signOut(auth);
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) {
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentFirebaseUser = () => {
  if (!auth) {
    return null;
  }
  return auth.currentUser;
};

export { auth, googleProvider, isFirebaseConfigured, showGoogleButton };
export default app;