# File Copy Commands for HomeConnect Pro

## Step 1: Create Project Structure
```bash
mkdir homeconnect-pro
cd homeconnect-pro

# Create directories
mkdir -p client/src/{components,pages,lib,hooks}
mkdir -p client/src/components/ui
mkdir -p server
mkdir -p shared
mkdir -p uploads
```

## Step 2: Copy Package Configuration
Copy these files from Replit to your VS Code project:

### Root Configuration Files
- `package.json`
- `tsconfig.json` 
- `vite.config.ts`
- `tailwind.config.ts`
- `drizzle.config.ts`
- `components.json`
- `postcss.config.js`
- `.env.example`
- `SETUP.md`
- `VS_CODE_EXTENSIONS.md`

### Client Files
- `client/index.html`
- `client/src/main.tsx`
- `client/src/App.tsx`
- `client/src/index.css`

### Server Files  
- `server/index.ts`
- `server/routes.ts`
- `server/storage.ts`
- `server/db.ts`
- `server/vite.ts`

### Shared Files
- `shared/schema.ts`

### Component Files (copy entire directories)
- `client/src/components/` (all files)
- `client/src/pages/` (all files)
- `client/src/lib/` (all files)
- `client/src/hooks/` (all files)

## Step 3: Install and Setup
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Setup database (after configuring .env)
npm run db:push

# Start development server
npm run dev
```

## Alternative: Direct Download
1. In Replit, click the 3-dot menu
2. Select "Download as ZIP"
3. Extract to your VS Code workspace
4. Follow setup instructions above

## Git Method (if available)
```bash
# In Replit terminal
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/homeconnect-pro.git
git push -u origin main

# On your local machine
git clone https://github.com/yourusername/homeconnect-pro.git
cd homeconnect-pro
npm install
```