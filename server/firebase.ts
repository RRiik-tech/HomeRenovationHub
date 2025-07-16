import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadFirebaseConfig() {
  // Try to load from service account file first
  const serviceAccountPath = path.join(__dirname, "..", "firebase-service-account.json");
  
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      return {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      };
    } catch (error) {
      console.warn("Failed to parse firebase-service-account.json:", error);
    }
  }

  // Fall back to environment variables
  const envConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  // Validate environment variables
  if (!envConfig.projectId || !envConfig.clientEmail || !envConfig.privateKey) {
    throw new Error(
      "Firebase configuration is missing. Please provide either a valid firebase-service-account.json file " +
      "or set the FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
    );
  }

  return envConfig;
}

function initializeFirebase() {
  if (admin.apps.length) {
    return admin;
  }

  try {
    const firebaseConfig = loadFirebaseConfig();

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseConfig.projectId,
        clientEmail: firebaseConfig.clientEmail,
        privateKey: firebaseConfig.privateKey,
      } as admin.ServiceAccount),
      projectId: firebaseConfig.projectId,
    });

    console.log("Firebase Admin SDK initialized successfully");
    return admin;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    throw error;
  }
}

export default initializeFirebase();

// Export commonly used services
export const auth = admin.auth();
export const firestore = admin.firestore();
export const storage = admin.storage(); 