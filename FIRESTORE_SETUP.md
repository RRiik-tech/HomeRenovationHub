# Firestore Database Setup Guide

This guide will help you set up Firebase Firestore as the database for your HomeRenovationHub project.

## Prerequisites

1. A Google account
2. Node.js installed on your system
3. Your HomeRenovationHub project files

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "HomeRenovationHub")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select your preferred location
5. Click "Done"

## Step 3: Set Up Authentication (Optional but Recommended)

1. Go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" and "Google" providers

## Step 4: Configure Firestore Security Rules

1. In Firestore Database, go to the "Rules" tab
2. Replace the default rules with these development rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for development
    // In production, implement proper security rules
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click "Publish"

⚠️ **Important**: These rules allow anyone to read/write to your database. For production, implement proper security rules.

## Step 5: Get Firebase Configuration

1. Go to Project Settings (gear icon in the left sidebar)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "HomeRenovationHub Web")
5. Copy the Firebase configuration object

## Step 6: Generate Service Account Key

1. In Project Settings, go to the "Service accounts" tab
2. Click "Generate new private key"
3. Save the JSON file securely
4. Extract the following values from the JSON:
   - `project_id`
   - `client_email`
   - `private_key`

## Step 7: Update Environment Variables

Update your `.env` file with the Firebase configuration:

```env
# Firebase Configuration (Client-side)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here

# Firebase Configuration (Server-side - Admin SDK)
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_CLIENT_EMAIL=your_client_email_here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
```

## Step 8: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Check the console for any Firebase connection errors
3. Try creating a user account to test database operations

## Firestore Collections Structure

Your app will use these collections:

- `users` - User profiles and authentication data
- `contractors` - Contractor profiles and business information
- `projects` - Home renovation projects
- `bids` - Contractor bids on projects
- `messages` - Communication between users

## Real-time Features

With Firestore, you get real-time updates automatically:

- Live chat messages
- Real-time project updates
- Instant bid notifications
- Live contractor availability

## Production Security Rules

For production, implement these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Contractors can read/write their own contractor profile
    match /contractors/{contractorId} {
      allow read: if true; // Anyone can read contractor profiles
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Projects are readable by all, writable by owner
    match /projects/{projectId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.homeownerId;
    }
    
    // Bids are readable by project owner and bid creator
    match /bids/{bidId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.contractorId;
    }
    
    // Messages are readable by participants
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.senderId || 
         request.auth.uid == resource.data.receiverId);
    }
  }
}
```

## Troubleshooting

### Common Issues:

1. **"Permission denied" errors**: Check your Firestore security rules
2. **"Firebase project not found"**: Verify your project ID in environment variables
3. **"Invalid private key"**: Ensure the private key is properly formatted with `\n` for newlines
4. **CORS errors**: Make sure your domain is added to Firebase authorized domains

### Getting Help:

- Check the [Firebase documentation](https://firebase.google.com/docs/firestore)
- Review the [Firestore security rules guide](https://firebase.google.com/docs/firestore/security/get-started)
- Join the [Firebase community](https://firebase.google.com/community)

## Migration from PostgreSQL

If you're migrating from PostgreSQL, the Firebase storage layer is already implemented. The main differences:

1. **No SQL queries**: Use Firestore's NoSQL query methods
2. **Real-time by default**: Data updates automatically across clients
3. **Automatic scaling**: No need to manage database servers
4. **Document-based**: Data is stored as documents in collections

Your existing API endpoints will continue to work without changes thanks to the storage abstraction layer. 