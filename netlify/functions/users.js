import { storage } from './shared/storage.js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
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

  const path = event.path;
  const pathParts = path.split('/');
  
  try {
    if (event.httpMethod === 'POST' && path.includes('/users') && !pathParts[pathParts.length - 1].match(/^\d+$/)) {
      // Create user
      const userData = JSON.parse(event.body);
      const user = await storage.createUser(userData);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(user)
      };
    }
    
    if (event.httpMethod === 'GET' && path.includes('/users/')) {
      // Get user by ID
      const userId = pathParts[pathParts.length - 1];
      if (!userId.match(/^\d+$/)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Invalid user ID' })
        };
      }
      
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: "User not found" })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(user)
      };
    }
    
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  } catch (error) {
    console.error('User operation error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: error.message })
    };
  }
}; 