# Firebase with Netlify Functions Setup Guide

This guide explains how to deploy your Home Renovation Hub backend using Firebase with Netlify Functions.

## Prerequisites

1. **Firebase Project**: You need a Firebase project with Firestore enabled
2. **Netlify Account**: You need a Netlify account for deployment
3. **Firebase Service Account**: You need Firebase Admin SDK credentials

## Step 1: Firebase Configuration

### Get Firebase Service Account
1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon) → Service accounts
4. Click "Generate new private key"
5. Download the JSON file

### Extract Required Environment Variables
From the downloaded JSON file, you'll need these values for Netlify environment variables:

- `FIREBASE_PROJECT_ID` (from `project_id`)
- `FIREBASE_CLIENT_EMAIL` (from `client_email`)
- `FIREBASE_PRIVATE_KEY` (from `private_key`)

## Step 2: Netlify Environment Variables

In your Netlify site settings, go to **Site settings → Environment variables** and add:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**
- The private key must include the full content with `\n` for line breaks
- Wrap the private key in quotes
- Keep the exact format including "-----BEGIN PRIVATE KEY-----" and "-----END PRIVATE KEY-----"

## Step 3: Function Endpoints

The following API endpoints are now available as Netlify Functions:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/firebase` - Firebase authentication

### Users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user

### Contractors
- `GET /api/contractors` - Get all contractors (with filtering)
- `GET /api/contractors/:id` - Get contractor by ID
- `POST /api/contractors` - Create contractor

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id/status` - Update project status

### Bids
- `GET /api/projects/:projectId/bids` - Get bids for project
- `POST /api/bids` - Create bid
- `PUT /api/bids/:id/status` - Update bid status

## Step 4: Deploy to Netlify

1. **Connect Repository**: Connect your GitHub repository to Netlify
2. **Build Settings**: 
   - Build command: `npm run build`
   - Publish directory: `client/dist`
3. **Environment Variables**: Add the Firebase environment variables mentioned above
4. **Deploy**: Trigger a deployment

## Step 5: Update Client Configuration

Update your client-side code to use the deployed Netlify domain instead of localhost for API calls.

## Firestore Security Rules

For production, update your Firestore security rules. Here's a basic example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow reading contractor profiles
    match /contractors/{contractorId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Project access rules
    match /projects/{projectId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Bid access rules
    match /bids/{bidId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Testing

After deployment, test your endpoints:

```bash
# Test user creation
curl -X POST https://your-site.netlify.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","firstName":"Test","lastName":"User","userType":"homeowner"}'

# Test Firebase auth
curl -X POST https://your-site.netlify.app/api/auth/firebase \
  -H "Content-Type: application/json" \
  -d '{"firebaseUid":"test-uid","email":"test@example.com","displayName":"Test User"}'
```

## Troubleshooting

### Common Issues

1. **Firebase initialization errors**: Check environment variables format
2. **CORS issues**: Functions include CORS headers, but verify origin settings
3. **Function timeouts**: Netlify functions have a 10-second timeout limit
4. **Private key format**: Ensure the private key includes proper line breaks (`\n`)

### Logs

Check Netlify function logs at: **Site settings → Functions → View logs**

### Local Development

For local development with Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

This will run your functions locally and proxy API calls to them. 