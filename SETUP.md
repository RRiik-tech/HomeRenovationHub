# HomeConnect Pro - VS Code Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
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

3. **Database Setup**
   - Create a PostgreSQL database
   - Set up your DATABASE_URL environment variable:
   ```bash
   export DATABASE_URL="postgresql://username:password@localhost:5432/homeconnect"
   ```

4. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/homeconnect
   
   # Optional Firebase Config (for Google Sign-In)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

5. **Database Migration**
   ```bash
   npm run db:push
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

## Project Structure
```
homeconnect-pro/
├── client/src/           # React frontend
├── server/              # Express backend
├── shared/              # Shared types and schemas
├── components.json      # shadcn/ui config
├── package.json         # Dependencies
├── drizzle.config.ts    # Database config
└── vite.config.ts       # Vite config
```

## Available Scripts
- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Features
- User authentication (email/password + Firebase Google Sign-In)
- Project posting and management
- Contractor profiles and verification
- Bidding system
- Real-time messaging
- Location-based contractor search
- File upload capabilities

## Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom + Firebase (optional)
- **Build**: Vite