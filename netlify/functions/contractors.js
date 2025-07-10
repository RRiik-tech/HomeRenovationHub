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
  const queryParams = event.queryStringParameters || {};
  
  try {
    if (event.httpMethod === 'POST' && path.includes('/contractors') && !pathParts[pathParts.length - 1].match(/^\d+$/)) {
      // Create contractor
      const contractorData = JSON.parse(event.body);
      const contractor = await storage.createContractor(contractorData);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(contractor)
      };
    }
    
    if (event.httpMethod === 'GET' && path.includes('/contractors/') && pathParts[pathParts.length - 1].match(/^\d+$/)) {
      // Get contractor by ID
      const contractorId = parseInt(pathParts[pathParts.length - 1]);
      const contractor = await storage.getContractor(contractorId);
      
      if (!contractor) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: "Contractor not found" })
        };
      }
      
      const user = await storage.getUser(contractor.userId);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ...contractor, user })
      };
    }
    
    if (event.httpMethod === 'GET' && path.includes('/contractors') && !pathParts[pathParts.length - 1].match(/^\d+$/)) {
      // Get contractors with optional filtering
      const category = queryParams.category;
      const latitude = queryParams.latitude ? parseFloat(queryParams.latitude) : null;
      const longitude = queryParams.longitude ? parseFloat(queryParams.longitude) : null;
      const radius = queryParams.radius ? parseFloat(queryParams.radius) : 20;

      let contractors = await storage.getContractors();
      
      // Apply filters
      if (category) {
        contractors = contractors.filter(contractor => 
          contractor.specialties && contractor.specialties.includes(category)
        );
      }
      
      if (latitude && longitude) {
        contractors = contractors.filter(contractor => {
          if (!contractor.latitude || !contractor.longitude) return false;
          const distance = storage.calculateDistance(latitude, longitude, contractor.latitude, contractor.longitude);
          return distance <= radius;
        });
      }
      
      // Get user data for each contractor
      const contractorsWithUsers = await Promise.all(
        contractors.map(async (contractor) => {
          const user = await storage.getUser(contractor.userId);
          return { ...contractor, user };
        })
      );
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(contractorsWithUsers)
      };
    }
    
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Contractor operation error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: error.message })
    };
  }
}; 