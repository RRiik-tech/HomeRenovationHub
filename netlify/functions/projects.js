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
    if (event.httpMethod === 'POST' && path.includes('/projects') && !pathParts[pathParts.length - 1].match(/^\d+$/)) {
      // Create project
      const body = JSON.parse(event.body);
      const projectData = {
        homeownerId: parseInt(body.homeownerId),
        title: body.title,
        description: body.description,
        category: body.category,
        budget: body.budget,
        timeline: body.timeline,
        address: body.address,
        photos: body.photos || []
      };
      
      const project = await storage.createProject(projectData);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(project)
      };
    }
    
    if (event.httpMethod === 'GET' && path.includes('/projects/') && pathParts[pathParts.length - 1].match(/^\d+$/)) {
      // Get project by ID
      const projectId = parseInt(pathParts[pathParts.length - 1]);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: "Project not found" })
        };
      }
      
      const homeowner = await storage.getUser(project.homeownerId);
      const bids = await storage.getBidsByProject(project.id);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ...project, homeowner, bids, bidCount: bids.length })
      };
    }
    
    if (event.httpMethod === 'GET' && path.includes('/projects') && !pathParts[pathParts.length - 1].match(/^\d+$/)) {
      // Get all projects
      const projects = await storage.getProjects();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(projects)
      };
    }
    
    if (event.httpMethod === 'PUT' && path.includes('/projects/') && path.includes('/status')) {
      // Update project status
      const projectId = parseInt(pathParts[pathParts.indexOf('projects') + 1]);
      const { status } = JSON.parse(event.body);
      
      await storage.updateProjectStatus(projectId, status);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Project status updated" })
      };
    }
    
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Project operation error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: error.message })
    };
  }
}; 