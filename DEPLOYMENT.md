# Deployment Guide for Home Renovation Hub

## Overview
This is a full-stack application with:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript + Firebase
- **Database**: Firebase Firestore

## Current Issue with Netlify
The Netlify deployment at https://homeboom.netlify.app/ is only hosting the frontend, but the application requires a backend server to function properly. This is why the dashboard appears empty and API calls fail.

## Recommended Deployment Solutions

### Option 1: Deploy Backend Separately (Recommended)

#### Step 1: Deploy Backend to Railway/Render/Heroku
1. **Railway** (Recommended):
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway new
   railway up
   ```

2. **Render**:
   - Connect your GitHub repository
   - Create new Web Service
   - Build command: `npm install && npm run build:server`
   - Start command: `npm run start:server`

3. **Heroku**:
   ```bash
   # Install Heroku CLI and deploy
   heroku create your-app-name
   heroku config:set NODE_ENV=production
   git push heroku main
   ```

#### Step 2: Configure Environment Variables
Add these environment variables to your Netlify site settings:

```env
NODE_ENV=production
VITE_API_URL=https://your-backend-url.com/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Option 2: Move to Full-Stack Platform

#### Vercel (Recommended for full-stack)
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Framework: Vite
   - Root directory: `client`
   - Build command: `npm run build`
   - Install command: `npm install`

#### Railway (Full-stack deployment)
1. Deploy both frontend and backend together
2. Use Railway's automatic deployments from GitHub

## Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Enable Authentication (Google Sign-in)
4. Get configuration values from Project Settings

## Backend Environment Variables
Your backend deployment needs these environment variables:

```env
NODE_ENV=production
PORT=3000

# Firebase Admin (for backend)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# CORS Origins
ALLOWED_ORIGINS=https://homeboom.netlify.app,https://your-custom-domain.com
```

## Current Code Changes
✅ **Added API URL configuration** - The frontend now uses environment variables for API endpoints
✅ **Fixed ID generation** - All database operations use consistent numeric IDs
✅ **Fixed data retrieval** - Projects and user data are properly matched
✅ **Added missing endpoints** - All required API endpoints are implemented

## Next Steps
1. Choose a backend hosting solution (Railway recommended)
2. Deploy the backend with proper environment variables
3. Update Netlify environment variables with the backend URL
4. Configure Firebase credentials
5. Test the full deployment

## Local Development
To run locally (already working):
```bash
npm run dev  # Starts both frontend and backend
```

The local setup is working perfectly with all features functional.

## Support
If you need help with deployment, the recommended approach is:
1. Deploy backend to Railway: https://railway.app
2. Update VITE_API_URL in Netlify environment variables
3. Add Firebase credentials to both Netlify and Railway 