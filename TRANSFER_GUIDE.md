# HomeConnect Pro - Transfer to VS Code

## Quick Transfer Methods

### Method 1: GitHub Repository (Recommended)
1. Initialize git repository in this Replit
2. Push to GitHub
3. Clone to your local machine

### Method 2: File-by-File Download
Since you're on Replit, you can:
1. Use Replit's "Download as ZIP" feature
2. Or copy files manually using the file explorer

### Method 3: Manual Recreation
Create a new project in VS Code and copy these key files:

## Essential Files to Copy

### Root Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `drizzle.config.ts` - Database configuration
- `components.json` - shadcn/ui configuration
- `postcss.config.js` - PostCSS configuration

### Environment Setup
- `.env.example` - Environment variables template
- `SETUP.md` - Setup instructions
- `VS_CODE_EXTENSIONS.md` - Recommended extensions

### Client Directory (`client/`)
- `client/index.html` - HTML template
- `client/src/main.tsx` - React entry point
- `client/src/App.tsx` - Main app component
- `client/src/index.css` - Global styles
- `client/src/lib/` - Utility libraries
- `client/src/components/` - React components
- `client/src/pages/` - Page components
- `client/src/hooks/` - Custom hooks

### Server Directory (`server/`)
- `server/index.ts` - Express server entry
- `server/routes.ts` - API routes
- `server/storage.ts` - Database storage layer
- `server/db.ts` - Database connection
- `server/vite.ts` - Vite server setup

### Shared Directory (`shared/`)
- `shared/schema.ts` - Database schema and types

## After Transfer Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

3. **Database Setup**
   ```bash
   npm run db:push
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## Required Dependencies
```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.0.0",
    "@neondatabase/serverless": "^0.9.0",
    "@radix-ui/react-*": "^1.0.0",
    "@tanstack/react-query": "^5.0.0",
    "drizzle-orm": "^0.30.0",
    "drizzle-zod": "^0.5.0",
    "express": "^4.18.0",
    "firebase": "^10.0.0",
    "react": "^18.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "wouter": "^3.0.0",
    "zod": "^3.0.0"
  }
}
```