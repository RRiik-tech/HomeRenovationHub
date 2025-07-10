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
    const {
      companyName,
      licenseNumber,
      insuranceNumber,
      specialties,
      experienceYears,
      description,
      ...userData
    } = JSON.parse(event.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "User already exists" })
      };
    }
    
    // Create user
    const user = await storage.createUser(userData);
    
    // If user is a contractor, create contractor profile
    if (userData.userType === "contractor") {
      const contractorData = {
        userId: user.id,
        companyName: companyName || "",
        licenseNumber: licenseNumber || "",
        insuranceNumber: insuranceNumber || "",
        specialties: specialties || [],
        experienceYears: experienceYears || 0,
        description: description || "",
        portfolio: [],
        rating: "0.00",
        reviewCount: 0,
        isVerified: false,
      };
      
      const contractor = await storage.createContractor(contractorData);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          user: { ...user, contractor }, 
          message: "Contractor registered successfully"
        })
      };
    } else {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          user, 
          message: "User registered successfully"
        })
      };
    }
  } catch (error) {
    console.error("Registration error:", error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: error.message })
    };
  }
}; 