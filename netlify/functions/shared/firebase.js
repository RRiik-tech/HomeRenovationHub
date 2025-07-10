import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
let app;
if (!getApps().length) {
  // Try to load from service account file first, then fall back to environment variables
  let firebaseConfig;
  
  try {
    // For production, use environment variables
    firebaseConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    
    if (!firebaseConfig.projectId || !firebaseConfig.clientEmail || !firebaseConfig.privateKey) {
      throw new Error('Missing Firebase environment variables');
    }
    
    app = initializeApp({
      credential: cert(firebaseConfig),
      projectId: firebaseConfig.projectId,
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
} else {
  app = getApp();
}

export const db = getFirestore(app);
export default app; 