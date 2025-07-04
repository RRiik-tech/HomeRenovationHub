# Firebase Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "home-renovation-hub")
4. Follow the setup wizard (you can disable Google Analytics if you don't need it)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (you can secure it later)
4. Select a location close to your users
5. Click "Done"

## Step 3: Enable Authentication

1. Go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider
5. Add your authorized domain (localhost for development)

## Step 4: Get Firebase Configuration

### For Frontend (Authentication):
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (</>)
4. Register your app with a nickname
5. Copy the config object - you'll need:
   - `apiKey`
   - `projectId` 
   - `appId`

### For Backend (Firestore):
1. Go to Project Settings (gear icon)
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Copy the values from the JSON file

## Step 5: Create .env File

Create a `.env` file in your project root with:

```env
# Firebase Configuration (from service account JSON)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com

# Frontend Firebase Config (from web app config)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Step 6: Update Server Configuration

The server has been updated to use Firebase Firestore instead of PostgreSQL. The `server/firebase.ts` file contains the Firebase configuration.

## Step 7: Test Your Setup

1. Start your development server: `npm run dev`
2. Check the console for any Firebase-related errors
3. Try accessing your app at `http://localhost:5000`

## Security Rules (Optional)

In Firestore, you can set up security rules to control access to your data. For development, you can start with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // WARNING: This allows anyone to read/write
    }
  }
}
```

**Note**: This is for development only. For production, you should implement proper security rules. 