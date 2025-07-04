#!/bin/bash

# Netlify Deployment Script for Home Renovation Hub

echo "🏗️  Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the client application
echo "🔨 Building client application..."
npm run build

# Create environment file for production
echo "🌍 Setting up environment..."
if [ ! -f ".env.production" ]; then
    echo "Creating .env.production file..."
    cat > .env.production << EOL
# Production Environment Variables
NODE_ENV=production
VITE_APP_NAME=Home Renovation Hub
VITE_APP_VERSION=1.0.0
VITE_API_URL=https://your-api-domain.com/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
EOL
fi

# Copy PWA files to dist
echo "📱 Setting up PWA files..."
cp client/public/manifest.json client/dist/
cp client/public/sw.js client/dist/
cp -r client/public/icons client/dist/ 2>/dev/null || true

# Verify build
echo "✅ Verifying build..."
if [ -f "client/dist/index.html" ]; then
    echo "✅ Build successful! Files ready for deployment."
    ls -la client/dist/
else
    echo "❌ Build failed! index.html not found."
    exit 1
fi

echo "🚀 Deployment preparation complete!"
echo "📋 Next steps:"
echo "   1. Push your code to GitHub"
echo "   2. Connect your repository to Netlify"
echo "   3. Set build command: npm run build"
echo "   4. Set publish directory: client/dist"
echo "   5. Add environment variables in Netlify dashboard" 