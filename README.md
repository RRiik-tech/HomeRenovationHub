# Home Renovation Hub

A full-stack web application for connecting homeowners with contractors and managing home renovation projects.

## Features

- User Authentication (Firebase)
- Project Management
- Contractor Marketplace
- Real-time Messaging
- Document Management
- Payment Integration
- Analytics Dashboard
- AI-powered Recommendations

## Prerequisites

- Node.js 18+ and npm
- Firebase account
- Git

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd HomeRenovationHub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   VITE_FIREBASE_PROJECT_ID=your_project_id_here
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here

   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Database Configuration (if using)
   DATABASE_URL=your_database_url_here

   # Session Secret
   SESSION_SECRET=your_session_secret_here
   ```

4. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication (Email/Password and Google)
   - Set up Firestore Database
   - Set up Storage
   - Download your Firebase service account key and save it as `firebase-service-account.json`

5. Development:
   ```bash
   # Start development server
   npm run dev

   # Or start client and server separately
   npm run dev:client
   npm run dev:server
   ```

6. Build:
   ```bash
   # Build everything
   npm run build:full

   # Or build separately
   npm run build        # Client
   npm run build:server # Server
   ```

7. Production:
   ```bash
   npm start
   ```

## Project Structure

- `/client` - Frontend React application
  - `/src` - Source code
    - `/components` - React components
    - `/hooks` - Custom React hooks
    - `/lib` - Utility functions and configurations
    - `/pages` - Page components
    - `/types` - TypeScript type definitions
- `/server` - Backend Express server
- `/shared` - Shared code between frontend and backend
- `/netlify` - Netlify serverless functions

## Development Guidelines

1. Code Style
   - Use TypeScript for type safety
   - Follow ESLint and Prettier configurations
   - Write meaningful commit messages

2. Component Structure
   - Use functional components with hooks
   - Keep components small and focused
   - Use UI components from `/components/ui`

3. State Management
   - Use React Query for server state
   - Use React Context for global state
   - Use local state for component-specific state

4. Testing
   - Write unit tests for critical functionality
   - Test components in isolation
   - Follow the testing guide in `TESTING_GUIDE.md`

## Deployment

1. Netlify
   - Follow instructions in `NETLIFY_DEPLOYMENT.md`
   - Set up environment variables in Netlify dashboard
   - Configure build settings

2. Firebase
   - Follow instructions in `FIREBASE_SETUP.md`
   - Set up security rules
   - Configure Firebase hosting if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details 