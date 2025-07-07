import admin from "firebase-admin";
import path from "path";

// Try to load from service account file first, then fall back to environment variables
let firebaseConfig;
try {
  const serviceAccount = require(path.join(__dirname, "..", "firebase-service-account.json"));
  firebaseConfig = {
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  };
} catch (error) {
  // Fall back to environment variables
  firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: firebaseConfig.projectId,
      clientEmail: firebaseConfig.clientEmail,
      privateKey: firebaseConfig.privateKey,
    } as admin.ServiceAccount),
    projectId: firebaseConfig.projectId,
  });
}

export default admin; 