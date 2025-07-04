# Quick Firebase Setup for Google OAuth

## 🚀 Your Google Sign-In Button is Now Visible!

The Google sign-in button should now appear in your authentication modal. However, to make it fully functional, you need to set up Firebase.

## 📝 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it (e.g., "home-renovation-hub")
4. Follow the setup wizard

## 🔧 Step 2: Enable Google Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider
5. Add `localhost` to authorized domains

## 📋 Step 3: Get Frontend Configuration

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click the web icon (</>)
4. Register your app
5. Copy the config values

## 📄 Step 4: Create .env File

Create a `.env` file in your project root with:

```env
# Frontend Firebase Config (from web app config)
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_PROJECT_ID=your-project-id-here
VITE_FIREBASE_APP_ID=your-app-id-here
```

## ✅ Step 5: Test

1. Restart your development server
2. The Google sign-in button should now work
3. Click it to test Google OAuth

## 🔍 Current Status

- ✅ Google button is visible
- ⚠️ Firebase not configured (button shows setup message)
- ✅ Ready for Firebase setup

## 🆘 Need Help?

1. Follow the detailed guide in `FIREBASE_SETUP.md`
2. Check `GOOGLE_OAUTH_SETUP.md` for OAuth-specific instructions
3. The button will show helpful error messages if Firebase isn't configured 