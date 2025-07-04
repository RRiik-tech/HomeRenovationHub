# 🔥 Firebase Quick Fix Guide

## Current Status
✅ Firebase is configured with your credentials  
✅ Firebase test component added to home page  
✅ Environment variables are set correctly  

## 🚀 Test Your Firebase Setup

1. **Visit your app**: Go to `http://localhost:3000`
2. **Look for the Firebase Test section** (yellow box at the top)
3. **Check the status indicators**:
   - 🟢 Green = Working
   - 🔴 Red = Needs attention

## 🔧 Common Issues & Solutions

### Issue 1: Authentication Not Working
**Symptoms**: Can't sign in with Google  
**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `homeboom-25f47`
3. Go to **Authentication** → **Sign-in method**
4. Enable **Google** provider
5. Add authorized domains:
   - `localhost`
   - `127.0.0.1`
   - Your production domain

### Issue 2: Firestore Permission Denied
**Symptoms**: "Missing or insufficient permissions"  
**Solution**:
1. Go to **Firestore Database** → **Rules**
2. Update rules to allow testing:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for testing
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
3. **Important**: Change this to proper security rules in production!

### Issue 3: Domain Not Authorized
**Symptoms**: "This domain is not authorized"  
**Solution**:
1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add these domains:
   - `localhost`
   - `127.0.0.1:3000`
   - Your Netlify domain (when deploying)

### Issue 4: API Key Issues
**Symptoms**: "Invalid API key"  
**Solution**:
1. Go to **Project Settings** → **General**
2. Scroll to "Your apps" section
3. Copy the config object
4. Update your `.env` file with correct values

## 🧪 Testing Steps

1. **Configuration Test**: Should show ✅ if Firebase is configured
2. **Authentication Test**: Click "Sign In with Google"
3. **Firestore Test**: Click "Test Firestore" after signing in

## 🔍 Debug Information

The Firebase test component shows debug info at the bottom. Check:
- `isFirebaseConfigured`: Should be `true`
- `hasUser`: Should be `true` after sign-in
- `hasDb`: Should be `true` if Firestore is initialized
- `projectId`: Should be `homeboom-25f47`
- `hasApiKey`: Should be `true`
- `hasAppId`: Should be `true`

## 🚨 Emergency Reset

If nothing works, try this:
1. Delete your current Firebase project
2. Create a new one
3. Update `.env` with new credentials
4. Follow the setup steps again

## 📞 Still Having Issues?

Check the browser console (F12) for error messages. Common errors:
- `Firebase: Error (auth/unauthorized-domain)`
- `Firebase: Error (auth/api-key-not-valid)`
- `Missing or insufficient permissions`

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Auth Setup](https://firebase.google.com/docs/auth/web/google-signin)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**Your Firebase Project**: `homeboom-25f47`  
**Test URL**: `http://localhost:3000`  
**Status**: Ready for testing! 🎉 