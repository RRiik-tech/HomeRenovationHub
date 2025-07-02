# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your HomeRenovationHub application.

## Prerequisites

1. A Firebase project (see `FIREBASE_SETUP.md` for initial setup)
2. Google Cloud Console access

## Step 1: Enable Google Authentication in Firebase

1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to "Authentication" in the left sidebar
4. Click on "Sign-in method" tab
5. Click on "Google" provider
6. Enable it and configure:
   - **Project support email**: Your email address
   - **Authorized domains**: Add `localhost` for development
7. Click "Save"

## Step 2: Get Firebase Configuration

### For Frontend (Web App):
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (</>)
4. Register your app with a nickname (e.g., "HomeRenovationHub Web")
5. Copy the config object - you'll need:
   - `apiKey`
   - `projectId` 
   - `appId`

### For Backend (Service Account):
1. Go to Project Settings (gear icon)
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file

## Step 3: Create Environment File

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

## Step 4: Configure Google Cloud Console (Optional)

For additional security and features:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" > "OAuth consent screen"
4. Configure the consent screen:
   - **User Type**: External
   - **App name**: HomeRenovationHub
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Add scopes:
   - `email`
   - `profile`
   - `openid`

## Step 5: Test Your Setup

1. Start your development server: `npm run dev`
2. Open your app at `http://localhost:3000`
3. Click "Sign In" or "Sign Up"
4. You should see a "Continue with Google" button
5. Click it and test the Google OAuth flow

## Features

Once set up, users can:

- **Sign in with Google**: One-click authentication using their Google account
- **Automatic account creation**: New users are automatically created when they first sign in
- **Profile information**: Name, email, and profile picture are automatically imported
- **Seamless experience**: No need to remember additional passwords

## Security Notes

- Google OAuth users are automatically verified
- Firebase handles all authentication security
- User data is stored in your Firebase Firestore database
- The `firebaseUid` field links Google accounts to your app users

## Troubleshooting

### "Google authentication is not configured"
- Check that all environment variables are set correctly
- Verify Firebase project ID matches in both frontend and backend configs
- Ensure Google provider is enabled in Firebase Authentication

### "Failed to authenticate with server"
- Check that your backend is running on port 3000
- Verify Firebase service account has proper permissions
- Check server logs for detailed error messages

### "Invalid WebSocket frame" errors
- These are harmless development server warnings
- They don't affect the authentication functionality
- Can be ignored during development

## Next Steps

After setting up Google OAuth:

1. Test the authentication flow thoroughly
2. Consider adding additional OAuth providers (Facebook, Apple, etc.)
3. Implement user profile management
4. Add role-based access control for contractors vs homeowners 