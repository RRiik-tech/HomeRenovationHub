# Netlify Deployment Guide for Home Renovation Hub

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository

First, ensure your code is in a Git repository:

```bash
# If not already initialized
git init
git add .
git commit -m "Initial commit - Home Renovation Hub"

# Push to GitHub (create a new repository on GitHub first)
git remote add origin https://github.com/yourusername/home-renovation-hub.git
git push -u origin main
```

### 2. Build Configuration

The project is already configured with:
- ✅ `netlify.toml` - Netlify configuration
- ✅ Build command: `npm run build`
- ✅ Publish directory: `client/dist`
- ✅ SPA redirects for React Router
- ✅ PWA support with service worker

### 3. Deploy to Netlify

#### Option A: Netlify Dashboard (Recommended)

1. **Sign up/Login** to [Netlify](https://netlify.com)

2. **Import from Git**:
   - Click "New site from Git"
   - Choose GitHub and authorize
   - Select your repository

3. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `client/dist`
   - (These should auto-populate from netlify.toml)

4. **Environment Variables**:
   Add these in Site Settings > Environment Variables:
   ```
   NODE_ENV=production
   VITE_APP_NAME=Home Renovation Hub
   VITE_APP_VERSION=1.0.0
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

5. **Deploy**: Click "Deploy site"

#### Option B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from your project directory
netlify deploy --prod --dir=client/dist
```

### 4. Custom Domain (Optional)

1. Go to Site Settings > Domain management
2. Add your custom domain
3. Configure DNS settings as instructed

## 🛠️ Build Process

The build process:
1. Installs dependencies (`npm install`)
2. Builds React app with Vite (`npm run build`)
3. Outputs to `client/dist/`
4. Copies PWA files (manifest.json, service worker)
5. Applies redirects for SPA routing

## 🔧 Configuration Details

### Netlify Configuration (`netlify.toml`)

```toml
[build]
  publish = "client/dist"
  command = "npm run build"
  
[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables

Create these in Netlify Dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `VITE_APP_NAME` | App name | `Home Renovation Hub` |
| `VITE_FIREBASE_API_KEY` | Firebase API key | `AIza...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `your-project-id` |

## 📱 PWA Features

The app includes:
- ✅ Web App Manifest
- ✅ Service Worker for offline support
- ✅ Install prompts
- ✅ Push notifications ready
- ✅ Responsive design

## 🔍 Troubleshooting

### Common Issues

1. **Build fails with "Module not found"**:
   - Check all imports use correct paths
   - Verify all dependencies are in package.json

2. **404 on page refresh**:
   - Ensure `netlify.toml` redirects are configured
   - Check SPA routing setup

3. **Environment variables not working**:
   - Prefix with `VITE_` for client-side variables
   - Set in Netlify Dashboard, not .env files

4. **PWA not installing**:
   - Verify manifest.json is accessible
   - Check service worker registration
   - Ensure HTTPS (automatic on Netlify)

### Testing Build Locally

```bash
# Run the deployment script
./deploy.sh

# Or build manually
npm run build

# Serve locally to test
npx serve client/dist
```

## 🚀 Post-Deployment

After successful deployment:

1. **Test all features**:
   - Authentication
   - Project creation
   - File uploads
   - PWA installation

2. **Set up monitoring**:
   - Netlify Analytics
   - Error tracking
   - Performance monitoring

3. **Configure backend**:
   - If using serverless functions
   - Database connections
   - API endpoints

## 📊 Performance Optimizations

The build includes:
- ✅ Code splitting
- ✅ Asset optimization
- ✅ Gzip compression
- ✅ CDN distribution
- ✅ Caching headers

## 🔒 Security

Security headers configured:
- ✅ Content Security Policy
- ✅ XSS Protection
- ✅ Frame Options
- ✅ HTTPS redirect

## 📞 Support

If you encounter issues:
1. Check Netlify deploy logs
2. Review browser console errors
3. Verify environment variables
4. Test build locally first

---

**Your app will be live at**: `https://your-site-name.netlify.app`

🎉 **Happy deploying!** 