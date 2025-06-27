import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase credentials are available
const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
);

// Initialize Firebase only if configured
let app: any = null;
let auth: any = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
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

export { auth, googleProvider, isFirebaseConfigured };
export default app;