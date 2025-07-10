import { storage } from './shared/storage.js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const { firebaseUid, email, displayName, photoURL } = JSON.parse(event.body);
    
    if (!firebaseUid || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Firebase UID and email are required" })
      };
    }

    // First check if user already exists by Firebase UID
    let user = await storage.getUserByFirebaseUid(firebaseUid);
    
    // If not found by Firebase UID, check by email
    if (!user) {
      user = await storage.getUserByEmail(email);
    }
    
    if (!user) {
      // Create new user from Firebase data
      const [firstName, ...lastNameParts] = (displayName || email.split('@')[0]).split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      const userData = {
        email,
        username: email.split('@')[0],
        firstName,
        lastName,
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        userType: 'homeowner',
        firebaseUid,
        photoURL: photoURL || undefined,
        password: '', // Firebase users don't use password auth
        isVerified: true, // Firebase users are pre-verified
      };
      
      user = await storage.createUser(userData);
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        user, 
        message: "Firebase authentication successful"
      })
    };
  } catch (error) {
    console.error("Firebase auth error:", error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: error.message })
    };
  }
}; 