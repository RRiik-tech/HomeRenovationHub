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
    const { email, password } = JSON.parse(event.body);
    const user = await storage.getUserByEmail(email);
    
    if (!user || user.password !== password) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Invalid credentials" })
      };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ user, message: "Login successful" })
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: error.message })
    };
  }
}; 