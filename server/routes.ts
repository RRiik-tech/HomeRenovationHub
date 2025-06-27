import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertContractorSchema, insertProjectSchema, insertBidSchema, insertMessageSchema } from "@shared/schema";
import multer, { type Multer } from "multer";
import path from "path";

// Extend Express Request type for file uploads
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}

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
      // Parse form data
      const projectData = {
        homeownerId: parseInt(req.body.homeownerId),
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        budget: req.body.budget,
        timeline: req.body.timeline,
        address: req.body.address,
      };
      
      // Validate with schema
      const validatedData = insertProjectSchema.parse(projectData);
      
      // Handle uploaded files
      const photos = req.files ? (req.files as Express.Multer.File[]).map((file: Express.Multer.File) => file.filename) : [];
      
      const project = await storage.createProject({
        ...validatedData,
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

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user, message: "User registered successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ user, message: "Login successful" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Firebase authentication endpoint
  app.post("/api/auth/firebase", async (req, res) => {
    try {
      const { firebaseUid, email, displayName, photoURL } = req.body;
      
      if (!firebaseUid || !email) {
        return res.status(400).json({ message: "Firebase UID and email are required" });
      }

      // Check if user already exists by email
      let user = await storage.getUserByEmail(email);
      
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
          userType: 'homeowner' as const,
          firebaseUid,
          photoURL: photoURL || undefined,
          password: '', // Firebase users don't use password auth
          isVerified: true, // Firebase users are pre-verified
        };
        
        user = await storage.createUser(userData);
      }
      
      res.json({ user });
    } catch (error: any) {
      console.error("Firebase auth error:", error);
      res.status(400).json({ message: "Firebase authentication failed" });
    }
  });

  // Contractor registration
  app.post("/api/contractors", async (req, res) => {
    try {
      const contractorData = insertContractorSchema.parse(req.body);
      const contractor = await storage.createContractor(contractorData);
      res.json(contractor);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get contractor projects
  app.get("/api/contractors/:id/bids", async (req, res) => {
    try {
      const contractorId = parseInt(req.params.id);
      const bids = await storage.getBidsByContractor(contractorId);
      
      // Get project details for each bid
      const bidsWithProjects = await Promise.all(
        bids.map(async (bid) => {
          const project = await storage.getProject(bid.projectId);
          const homeowner = project ? await storage.getUser(project.homeownerId) : null;
          return {
            ...bid,
            project: project ? { ...project, homeowner } : null
          };
        })
      );
      
      res.json(bidsWithProjects);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get homeowner projects
  app.get("/api/users/:id/projects", async (req, res) => {
    try {
      const homeownerId = parseInt(req.params.id);
      const projects = await storage.getProjectsByHomeowner(homeownerId);
      
      // Get bid count for each project
      const projectsWithBids = await Promise.all(
        projects.map(async (project) => {
          const bids = await storage.getBidsByProject(project.id);
          return {
            ...project,
            bidCount: bids.length,
            bids: bids
          };
        })
      );
      
      res.json(projectsWithBids);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Serve uploaded files
  app.use('/api/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
