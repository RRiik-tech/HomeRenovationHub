#!/bin/bash

# Firebase Setup Script for Home Renovation Hub
echo "🔥 Firebase Setup for Home Renovation Hub"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "📄 .env file already exists"
fi

echo ""
echo "🔧 Firebase Configuration Steps:"
echo ""
echo "1. 🌐 Go to Firebase Console: https://console.firebase.google.com/"
echo "2. ➕ Create a new project or select existing project"
echo "3. 🔐 Enable Authentication:"
echo "   - Go to Authentication → Sign-in method"
echo "   - Enable Google provider"
echo "   - Add authorized domains"
echo ""
echo "4. 🗄️ Enable Firestore Database:"
echo "   - Go to Firestore Database"
echo "   - Create database in test mode"
echo "   - Choose your region"
echo ""
echo "5. ⚙️ Get Web App Configuration:"
echo "   - Go to Project Settings"
echo "   - Add Web App"
echo "   - Copy the config object"
echo ""
echo "6. 📝 Update your .env file with the configuration:"
echo "   - VITE_FIREBASE_API_KEY=your_api_key"
echo "   - VITE_FIREBASE_PROJECT_ID=your_project_id"
echo "   - VITE_FIREBASE_APP_ID=your_app_id"
echo "   - VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id"
echo "   - VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id"
echo ""
echo "7. 🔑 For Server-side (Admin SDK):"
echo "   - Go to Project Settings → Service accounts"
echo "   - Generate new private key"
echo "   - Copy firebase-service-account.example.json to firebase-service-account.json"
echo "   - Replace with your actual credentials"
echo ""

# Check current Firebase configuration
echo "🔍 Checking current Firebase configuration..."
echo ""

if [ -f ".env" ]; then
    echo "Current .env file status:"
    if grep -q "VITE_FIREBASE_API_KEY=your_firebase_api_key" .env; then
        echo "❌ Firebase API Key not configured"
    else
        echo "✅ Firebase API Key configured"
    fi
    
    if grep -q "VITE_FIREBASE_PROJECT_ID=your_firebase_project_id" .env; then
        echo "❌ Firebase Project ID not configured"
    else
        echo "✅ Firebase Project ID configured"
    fi
    
    if grep -q "VITE_FIREBASE_APP_ID=your_firebase_app_id" .env; then
        echo "❌ Firebase App ID not configured"
    else
        echo "✅ Firebase App ID configured"
    fi
else
    echo "❌ .env file not found"
fi

echo ""
echo "🚀 After configuration, restart your development server:"
echo "   npm run dev"
echo ""
echo "🔗 Useful Links:"
echo "   - Firebase Console: https://console.firebase.google.com/"
echo "   - Firebase Web Setup: https://firebase.google.com/docs/web/setup"
echo "   - Firebase Auth: https://firebase.google.com/docs/auth/web/start"
echo "   - Firestore: https://firebase.google.com/docs/firestore/quickstart"
echo ""
echo "📞 Need help? Check FIREBASE_SETUP.md for detailed instructions" 