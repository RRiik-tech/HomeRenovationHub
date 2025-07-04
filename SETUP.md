# HomeConnect Pro - Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- A Google account for Firebase
- Git (optional)

## Installation Steps

1. **Extract the project files**
   ```bash
   tar -xzf homeconnect-pro.tar.gz
   cd homeconnect-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase/Firestore Setup**
   - Follow the detailed [Firestore Setup Guide](./FIRESTORE_SETUP.md)
   - Create a Firebase project and enable Firestore
   - Get your Firebase configuration keys
   - Generate a service account key for server-side operations

4. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   # Firebase Configuration (Client-side)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Firebase Configuration (Server-side - Admin SDK)
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Project Structure
```
homeconnect-pro/
├── client/src/           # React frontend
│   ├── lib/
│   │   ├── firebase.ts   # Firebase client config
│   │   └── firestore.ts  # Firestore utilities
├── server/              # Express backend
│   ├── firebase.ts      # Firebase Admin SDK config
│   ├── firebase-storage.ts # Firestore storage implementation
│   └── storage.ts       # Storage abstraction layer
├── shared/              # Shared types and schemas
├── components.json      # shadcn/ui config
├── package.json         # Dependencies
└── vite.config.ts       # Vite config
```

## Available Scripts
- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run check` - Run TypeScript type checking

## Features
- **Real-time Database**: Firestore provides real-time updates across all clients
- **User Authentication**: Firebase Auth with email/password + Google Sign-In
- **Project Management**: Post and manage home renovation projects
- **Contractor Profiles**: Verified contractor profiles with ratings and reviews
- **Bidding System**: Contractors can bid on projects with real-time updates
- **Live Messaging**: Real-time chat between homeowners and contractors
- **Location Services**: Location-based contractor search
- **File Upload**: Image and document upload capabilities
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript
- **Database**: Firebase Firestore (NoSQL, real-time)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage (for file uploads)
- **Build Tool**: Vite
- **Deployment**: Ready for Vercel, Netlify, or Firebase Hosting

## Database Collections

### Users Collection
- User profiles and authentication data
- Homeowner and contractor user types
- Location and contact information

### Contractors Collection
- Business information and specialties
- License and insurance details
- Ratings and review statistics
- Portfolio and experience data

### Projects Collection
- Home renovation project details
- Budget and timeline information
- Status tracking (open, in progress, completed)
- Photo attachments

### Bids Collection
- Contractor proposals for projects
- Pricing and timeline estimates
- Bid status (pending, accepted, rejected)

### Messages Collection
- Real-time chat messages
- Project-based conversations
- Message history and timestamps

## Real-time Features

With Firestore, your app gets these real-time capabilities:

- **Live Chat**: Messages appear instantly without page refresh
- **Project Updates**: Status changes sync across all connected clients
- **Bid Notifications**: New bids appear in real-time
- **Contractor Availability**: Live updates when contractors come online
- **Review Updates**: Ratings and reviews update immediately

## Security

- **Firebase Auth**: Secure user authentication with built-in security
- **Firestore Rules**: Server-side security rules control data access
- **Environment Variables**: Sensitive configuration stored securely
- **HTTPS Only**: All Firebase connections use HTTPS encryption

## Development vs Production

### Development
- Uses test mode Firestore rules (open access)
- Local development server
- Hot reload for rapid development

### Production
- Implement proper Firestore security rules
- Use Firebase Hosting or other production hosting
- Enable Firebase Analytics and monitoring
- Set up proper error logging and monitoring

## Getting Started

1. Follow the [Firestore Setup Guide](./FIRESTORE_SETUP.md) to configure Firebase
2. Update your `.env` file with your Firebase credentials
3. Run `npm run dev` to start the development server
4. Open `http://localhost:5173` in your browser
5. Create a test account to explore the features

## Need Help?

- Check the [Firestore Setup Guide](./FIRESTORE_SETUP.md) for detailed Firebase configuration
- Review the [Firebase documentation](https://firebase.google.com/docs)
- Join the [Firebase community](https://firebase.google.com/community) for support