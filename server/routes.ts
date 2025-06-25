import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertContractorSchema, insertProjectSchema, insertBidSchema, insertMessageSchema } from "@shared/schema";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Contractor routes
  app.post("/api/contractors", async (req, res) => {
    try {
      const contractorData = insertContractorSchema.parse(req.body);
      const contractor = await storage.createContractor(contractorData);
      res.json(contractor);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/contractors", async (req, res) => {
    try {
      const category = req.query.category as string;
      const latitude = req.query.latitude ? parseFloat(req.query.latitude as string) : null;
      const longitude = req.query.longitude ? parseFloat(req.query.longitude as string) : null;
      const radius = req.query.radius ? parseFloat(req.query.radius as string) : 20;

      let contractors;
      
      if (latitude && longitude) {
        // Get contractors by location
        contractors = await storage.getContractorsByLocation(latitude, longitude, radius);
        if (category) {
          // Filter by category if provided
          contractors = contractors.filter(contractor => 
            contractor.specialties.includes(category)
          );
        }
      } else if (category) {
        contractors = await storage.getContractorsByCategory(category);
      } else {
        contractors = await storage.getContractors();
      }
      
      // Get user details for each contractor
      const contractorsWithUsers = await Promise.all(
        contractors.map(async (contractor) => {
          const user = await storage.getUser(contractor.userId);
          return { ...contractor, user };
        })
      );
      
      res.json(contractorsWithUsers);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/contractors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contractor = await storage.getContractor(id);
      if (!contractor) {
        return res.status(404).json({ message: "Contractor not found" });
      }
      
      const user = await storage.getUser(contractor.userId);
      res.json({ ...contractor, user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Project routes
  app.post("/api/projects", upload.array('photos', 10), async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      
      // Handle uploaded files
      const photos = req.files ? (req.files as Express.Multer.File[]).map(file => file.filename) : [];
      
      const project = await storage.createProject({
        ...projectData,
        photos,
      });
      res.json(project);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      
      // Get homeowner details for each project
      const projectsWithHomeowners = await Promise.all(
        projects.map(async (project) => {
          const homeowner = await storage.getUser(project.homeownerId);
          const bids = await storage.getBidsByProject(project.id);
          return { 
            ...project, 
            homeowner, 
            bidCount: bids.length 
          };
        })
      );
      
      res.json(projectsWithHomeowners);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const homeowner = await storage.getUser(project.homeownerId);
      const bids = await storage.getBidsByProject(project.id);
      
      res.json({ 
        ...project, 
        homeowner, 
        bids,
        bidCount: bids.length 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/projects/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      await storage.updateProjectStatus(id, status);
      res.json({ message: "Project status updated" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Bid routes
  app.post("/api/bids", async (req, res) => {
    try {
      const bidData = insertBidSchema.parse(req.body);
      const bid = await storage.createBid(bidData);
      res.json(bid);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/projects/:projectId/bids", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const bids = await storage.getBidsByProject(projectId);
      
      // Get contractor and user details for each bid
      const bidsWithContractors = await Promise.all(
        bids.map(async (bid) => {
          const contractor = await storage.getContractor(bid.contractorId);
          const user = contractor ? await storage.getUser(contractor.userId) : null;
          return { 
            ...bid, 
            contractor: contractor ? { ...contractor, user } : null 
          };
        })
      );
      
      res.json(bidsWithContractors);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/bids/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      await storage.updateBidStatus(id, status);
      res.json({ message: "Bid status updated" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Message routes
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/projects/:projectId/messages", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const messages = await storage.getMessagesByProject(projectId);
      
      // Get sender details for each message
      const messagesWithUsers = await Promise.all(
        messages.map(async (message) => {
          const sender = await storage.getUser(message.senderId);
          const receiver = await storage.getUser(message.receiverId);
          return { ...message, sender, receiver };
        })
      );
      
      res.json(messagesWithUsers);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:userId/conversations", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const conversations = await storage.getConversations(userId);
      
      // Get project and user details for each conversation
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conv) => {
          const project = await storage.getProject(conv.projectId);
          const otherUser = await storage.getUser(conv.otherUserId);
          return { 
            ...conv, 
            project,
            otherUser 
          };
        })
      );
      
      res.json(conversationsWithDetails);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Serve uploaded files
  app.use('/api/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
