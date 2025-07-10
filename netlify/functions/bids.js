import { storage } from './shared/storage.js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
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
    if (event.httpMethod === 'POST' && path.includes('/bids') && !pathParts[pathParts.length - 1].match(/^\d+$/)) {
      // Create bid
      const bidData = JSON.parse(event.body);
      const bid = await storage.createBid(bidData);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(bid)
      };
    }
    
    if (event.httpMethod === 'GET' && path === '/api/bids') {
      // Get all bids
      const bids = await storage.getBids();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(bids)
      };
    }
    
    if (event.httpMethod === 'GET' && path.includes('/projects/') && path.includes('/bids')) {
      // Get bids by project ID
      const projectId = parseInt(pathParts[pathParts.indexOf('projects') + 1]);
      const bids = await storage.getBidsByProject(projectId);
      
      const bidsWithContractors = await Promise.all(
        bids.map(async (bid) => {
          const contractor = await storage.getContractor(bid.contractorId);
          const user = contractor ? await storage.getUser(contractor.userId) : null;
          return { ...bid, contractor: contractor ? { ...contractor, user } : null };
        })
      );
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(bidsWithContractors)
      };
    }
    
    if (event.httpMethod === 'PUT' && path.includes('/bids/') && path.includes('/status')) {
      // Update bid status
      const bidId = parseInt(pathParts[pathParts.indexOf('bids') + 1]);
      const { status } = JSON.parse(event.body);
      
      await storage.updateBidStatus(bidId, status);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Bid status updated" })
      };
    }
    
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Bid operation error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: error.message })
    };
  }
}; 