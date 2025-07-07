import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertContractorSchema, 
  insertProjectSchema, 
  insertBidSchema, 
  insertMessageSchema, 
  insertReviewSchema,
  insertNotificationSchema,
  insertDocumentSchema,
  insertPaymentSchema,
  insertMilestoneSchema
} from "./memory-schema";
import multer, { type Multer } from "multer";
import path from "path";
import { AIAnalysisService } from "./ai-analysis";
import {
  createUser, getUser, getUserByEmail,
  createContractor, getContractor, getContractors, getContractorByUserId, getContractorsByCategory, getContractorsByLocation,
  createProject, getProject, getProjects, getProjectsByHomeowner, updateProjectStatus,
  createBid, getBid, getBidsByProject, getBidsByContractor, updateBidStatus, getBids,
  createMessage, getMessagesByProject, getConversations,
  createReview, getReviewsByProject, getReviewsByContractor
} from "./firebase-storage";

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
      const user = await createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await getUser(id);
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
      const contractor = await createContractor(contractorData);
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
        contractors = await getContractorsByLocation(latitude, longitude, radius);
        if (category) {
          contractors = contractors.filter(contractor => contractor.specialties.includes(category));
        }
      } else if (category) {
        contractors = await getContractorsByCategory(category);
      } else {
        contractors = await getContractors();
      }
      const contractorsWithUsers = await Promise.all(
        contractors.map(async (contractor) => {
          const user = await getUser(contractor.userId);
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
      const contractor = await getContractor(id);
      if (!contractor) {
        return res.status(404).json({ message: "Contractor not found" });
      }
      const user = await getUser(contractor.userId);
      res.json({ ...contractor, user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Project routes
  app.post("/api/projects", upload.array('photos', 10), async (req, res) => {
    try {
      const projectData = {
        homeownerId: parseInt(req.body.homeownerId),
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        budget: req.body.budget,
        timeline: req.body.timeline,
        address: req.body.address,
      };
      const validatedData = insertProjectSchema.parse(projectData);
      const photos = req.files ? (req.files as Express.Multer.File[]).map((file: Express.Multer.File) => file.filename) : [];
      const project = await createProject({ ...validatedData, photos });
      res.json(project);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await getProjects();
      res.json(projects);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const homeowner = await getUser(project.homeownerId);
      const bids = await getBidsByProject(project.id);
      res.json({ ...project, homeowner, bids, bidCount: bids.length });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/projects/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      await updateProjectStatus(id, status);
      res.json({ message: "Project status updated" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Bid routes
  app.post("/api/bids", async (req, res) => {
    try {
      const bidData = insertBidSchema.parse(req.body);
      const bid = await createBid(bidData);
      res.json(bid);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/bids", async (req, res) => {
    try {
      const bids = await getBids();
      res.json(bids);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/projects/:projectId/bids", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const bids = await getBidsByProject(projectId);
      const bidsWithContractors = await Promise.all(
        bids.map(async (bid) => {
          const contractor = await getContractor(bid.contractorId);
          const user = contractor ? await getUser(contractor.userId) : null;
          return { ...bid, contractor: contractor ? { ...contractor, user } : null };
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
      await updateBidStatus(id, status);
      res.json({ message: "Bid status updated" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Message routes
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await createMessage(messageData);
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/projects/:projectId/messages", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const messages = await getMessagesByProject(projectId);
      res.json(messages);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/conversations", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const conversations = await getConversations(userId);
      res.json(conversations);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const {
        companyName,
        licenseNumber,
        insuranceNumber,
        specialties,
        experienceYears,
        description,
        ...userData
      } = req.body;
      
      // Validate user data
      const validatedUserData = insertUserSchema.parse(userData);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedUserData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Create user
      const user = await storage.createUser(validatedUserData);
      
      // If user is a contractor, create contractor profile
      if (validatedUserData.userType === "contractor") {
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
        
        const validatedContractorData = insertContractorSchema.parse(contractorData);
        const contractor = await createContractor(validatedContractorData);
        
        res.json({ 
          user: { ...user, contractor }, 
          message: "Contractor registered successfully"
        });
      } else {
        res.json({ 
          user, 
          message: "User registered successfully"
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
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

      // First check if user already exists by Firebase UID
      let user = await storage.getUserByFirebaseUid(firebaseUid);
      
      // If not found by Firebase UID, check by email
      if (!user) {
        user = await storage.getUserByEmail(email);
        
        // If user exists by email but doesn't have Firebase UID, update it
        if (user && !user.firebaseUid) {
          // Update user with Firebase UID and photo URL
          // Note: This would require an update method in storage
          // For now, we'll create a new user
        }
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
      const contractor = await createContractor(contractorData);
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

  // Debug endpoint for testing
  app.get("/api/debug/user/:id/projects", async (req, res) => {
    console.log("🚀 DEBUG ENDPOINT HIT - User ID:", req.params.id);
    try {
      const homeownerId = parseInt(req.params.id);
      console.log("🚀 DEBUG - Parsed homeowner ID:", homeownerId);
      
      // Test both function import and storage instance method
      console.log("🚀 DEBUG - Testing imported getProjects function...");
      const importedProjects = await getProjects();
      console.log("🚀 DEBUG - Imported function returned:", importedProjects.length, "projects");
      
      console.log("🚀 DEBUG - Testing storage.getProjects method...");
      const storageProjects = await storage.getProjects();
      console.log("🚀 DEBUG - Storage method returned:", storageProjects.length, "projects");
      
      // Compare first few projects from both
      console.log("🚀 DEBUG - First 3 imported projects:");
      importedProjects.slice(0, 3).forEach((p, i) => {
        console.log(`  ${i + 1}. ID: ${p.id}, homeownerId: ${p.homeownerId}, title: ${p.title}`);
      });
      
      console.log("🚀 DEBUG - First 3 storage projects:");
      storageProjects.slice(0, 3).forEach((p, i) => {
        console.log(`  ${i + 1}. ID: ${p.id}, homeownerId: ${p.homeownerId}, title: ${p.title}`);
      });
      
      const matchingProjects = importedProjects.filter(p => {
        return Number(p.homeownerId) === Number(homeownerId);
      });
      
      console.log("🚀 DEBUG - Found matching projects:", matchingProjects.length);
      res.json({ 
        importedTotal: importedProjects.length,
        storageTotal: storageProjects.length,
        matching: matchingProjects.length,
        projects: matchingProjects.slice(0, 3)
      });
    } catch (error: any) {
      console.error("🚀 DEBUG - Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get homeowner projects
  app.get("/api/users/:id/projects", async (req, res) => {
    try {
      // Disable caching for this endpoint to ensure fresh data
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Expires', '0');
      res.set('Pragma', 'no-cache');
      
      const homeownerId = parseInt(req.params.id);
      console.log('API Route - Getting projects for homeowner:', homeownerId);
      
      // Debug: First get all projects to compare
      const allProjects = await getProjects();
      console.log('API Route - Total projects available:', allProjects.length);
      console.log('API Route - Sample project homeowner IDs:', allProjects.slice(0, 5).map(p => ({ id: p.id, homeownerId: p.homeownerId, type: typeof p.homeownerId })));
      
      // Use imported function instead of storage method for consistency
      const projects = allProjects.filter(project => Number(project.homeownerId) === Number(homeownerId));
      console.log('API Route - Projects found for homeowner:', projects.length);
      
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
      
      console.log('API Route - Returning projects with bids:', projectsWithBids.length);
      res.json(projectsWithBids);
    } catch (error: any) {
      console.error('API Route - Error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Review routes
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/projects/:projectId/reviews", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const reviews = await storage.getReviewsByProject(projectId);
      
      // Get reviewer and contractor details for each review
      const reviewsWithDetails = await Promise.all(
        reviews.map(async (review) => {
          const reviewer = await storage.getUser(review.reviewerId);
          const contractor = await storage.getContractor(review.contractorId);
          return {
            ...review,
            reviewer,
            contractor
          };
        })
      );
      
      res.json(reviewsWithDetails);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/contractors/:contractorId/reviews", async (req, res) => {
    try {
      const contractorId = parseInt(req.params.contractorId);
      const reviews = await storage.getReviewsByContractor(contractorId);
      
      const reviewsWithDetails = await Promise.all(
        reviews.map(async (review) => {
          const reviewer = await storage.getUser(review.reviewerId);
          const project = await storage.getProject(review.projectId);
          return {
            ...review,
            reviewer,
            project
          };
        })
      );
      
      res.json(reviewsWithDetails);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Notification routes
  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.json(notification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:userId/notifications", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:userId/notifications/unread-count", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Document routes
  app.post("/api/documents", upload.single('file'), async (req, res) => {
    try {
      const documentData = {
        projectId: parseInt(req.body.projectId),
        uploadedBy: parseInt(req.body.uploadedBy),
        name: req.body.name,
        type: req.body.type,
        fileUrl: req.file ? `/api/uploads/${req.file.filename}` : '',
        fileSize: req.file ? req.file.size : 0,
        mimeType: req.file ? req.file.mimetype : '',
        description: req.body.description
      };
      
      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);
      res.json(document);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/projects/:projectId/documents", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const documents = await storage.getDocumentsByProject(projectId);
      res.json(documents);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDocument(id);
      if (success) {
        res.json({ message: "Document deleted successfully" });
      } else {
        res.status(404).json({ message: "Document not found" });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Payment routes
  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/projects/:projectId/payments", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const payments = await storage.getPaymentsByProject(projectId);
      res.json(payments);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:userId/payments", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const payments = await storage.getPaymentsByUser(userId);
      res.json(payments);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/payments/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const payment = await storage.updatePaymentStatus(id, status);
      if (payment) {
        res.json(payment);
      } else {
        res.status(404).json({ message: "Payment not found" });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Milestone routes
  app.post("/api/milestones", async (req, res) => {
    try {
      const milestoneData = insertMilestoneSchema.parse(req.body);
      const milestone = await storage.createMilestone(milestoneData);
      res.json(milestone);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/projects/:projectId/milestones", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const milestones = await storage.getMilestonesByProject(projectId);
      res.json(milestones);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/milestones/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const milestone = await storage.updateMilestoneStatus(id, status);
      if (milestone) {
        res.json(milestone);
      } else {
        res.status(404).json({ message: "Milestone not found" });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Serve uploaded files
  app.use('/api/uploads', express.static('uploads'));

  // AI Analysis routes
  const aiService = new AIAnalysisService();

  // Analyze project and get compatibility scores
  app.get("/api/ai/analyze-project/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Convert Firebase project to compatible format
      const compatibleProject = {
        ...project,
        photos: project.photos || []
      };

      // Get project analysis
      const projectAnalysis = await aiService.analyzeProject(compatibleProject);
      
      // Get compatible contractors - the AI service already includes contractor data with user info
      const compatibilityScores = await aiService.findCompatibleContractors(compatibleProject);

      res.json({
        projectAnalysis,
        compatibilityScores
      });
    } catch (error: any) {
      console.error('AI Analysis error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get project analysis only
  app.get("/api/ai/project-analysis/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Convert Firebase project to compatible format
      const compatibleProject = {
        ...project,
        photos: project.photos || []
      };

      const projectAnalysis = await aiService.analyzeProject(compatibleProject);
      res.json(projectAnalysis);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get contractor recommendations for a project
  app.get("/api/ai/recommendations/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const compatibilityScores = await aiService.findCompatibleContractors(project);
      
      // Get contractor details for each score
      const recommendations = await Promise.all(
        compatibilityScores.slice(0, 10).map(async (score) => { // Top 10 recommendations
          const contractor = await storage.getContractor(score.contractorId);
          const user = contractor ? await storage.getUser(contractor.userId) : null;
          return {
            ...score,
            contractor: contractor ? { ...contractor, user } : null
          };
        })
      );

      res.json(recommendations);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // 1. AI Project Description Generator
  app.post("/api/ai/generate-description", async (req, res) => {
    try {
      const { keywords, category, budget } = req.body;
      
      if (!keywords || !category) {
        return res.status(400).json({ message: "Keywords and category are required" });
      }

      const generatedDescription = await aiService.generateProjectDescription(keywords, category, budget);
      res.json(generatedDescription);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // 2. AI Bid Analysis
  app.get("/api/ai/analyze-bid/:bidId", async (req, res) => {
    try {
      const bidId = parseInt(req.params.bidId);
      const bid = await getBid(bidId);
      
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }

      const project = await getProject(bid.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Convert Firebase project to compatible format
      const compatibleProject = {
        ...project,
        photos: project.photos || []
      };

      const bidAnalysis = await aiService.analyzeBid(bid, compatibleProject);
      res.json(bidAnalysis);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // 3. AI Response Suggestions
  app.post("/api/ai/response-suggestions", async (req, res) => {
    try {
      const { context, contractorName, bidAmount, projectTitle } = req.body;
      
      if (!context || !contractorName) {
        return res.status(400).json({ message: "Context and contractor name are required" });
      }

      const suggestions = await aiService.generateResponseSuggestion(
        context,
        contractorName,
        bidAmount,
        projectTitle
      );
      res.json(suggestions);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // 4. AI Timeline Prediction
  app.get("/api/ai/predict-timeline/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Convert Firebase project to compatible format
      const compatibleProject = {
        ...project,
        photos: project.photos || []
      };

      const timelinePrediction = await aiService.predictTimeline(compatibleProject);
      res.json(timelinePrediction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // 5. AI Risk Assessment
  app.get("/api/ai/risk-assessment/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Convert Firebase project to compatible format
      const compatibleProject = {
        ...project,
        photos: project.photos || []
      };

      const bids = await getBidsByProject(projectId);
      const riskAssessment = await aiService.assessProjectRisks(compatibleProject, bids);
      res.json(riskAssessment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Comprehensive AI Analysis (all features combined)
  app.get("/api/ai/comprehensive-analysis/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Convert Firebase project to compatible format
      const compatibleProject = {
        ...project,
        photos: project.photos || []
      };

      const bids = await getBidsByProject(projectId);
      
      // Run all AI analyses in parallel
      const [
        projectAnalysis,
        compatibilityScores,
        timelinePrediction,
        riskAssessment,
        bidAnalyses
      ] = await Promise.all([
        aiService.analyzeProject(compatibleProject),
        aiService.findCompatibleContractors(compatibleProject),
        aiService.predictTimeline(compatibleProject),
        aiService.assessProjectRisks(compatibleProject, bids),
        Promise.all(bids.map(bid => aiService.analyzeBid(bid, compatibleProject)))
      ]);

      res.json({
        projectAnalysis,
        compatibilityScores,
        timelinePrediction,
        riskAssessment,
        bidAnalyses
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Debug route for troubleshooting
  app.get("/api/debug/projects", async (req, res) => {
    try {
      const allProjects = await getProjects();
      const recentProjects = allProjects.slice(-10); // Get last 10 projects
      
      res.json({
        totalProjects: allProjects.length,
        recentProjects: recentProjects.map(p => ({
          id: p.id,
          title: p.title,
          homeownerId: p.homeownerId,
          status: p.status,
          createdAt: p.createdAt
        })),
        allProjectIds: allProjects.map(p => p.id).sort((a, b) => b - a).slice(0, 20) // Most recent 20 IDs
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: error.message,
        stack: error.stack
      });
    }
  });

  // User stats endpoint for profile page
  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let stats = {
        totalProjects: 0,
        averageRating: 0,
        totalReviews: 0,
        memberSince: user.createdAt
      };

      if (user.userType === 'homeowner') {
        // Get homeowner projects
        const projects = await getProjectsByHomeowner(userId);
        stats.totalProjects = projects.length;
        
        // Get reviews for homeowner (as a reviewer)
        // For now, we'll set this to 0 since we don't have a getReviewsByReviewer method
        // TODO: Implement getReviewsByReviewer method
        stats.totalReviews = 0;
        
      } else if (user.userType === 'contractor') {
        // Get contractor information
        const contractor = await getContractorByUserId(userId);
        if (contractor) {
          // Get contractor bids (represents projects worked on)
          const bids = await getBidsByContractor(contractor.id);
          const acceptedBids = bids.filter(bid => bid.status === 'accepted');
          stats.totalProjects = acceptedBids.length;
          
          // Get contractor reviews
          const reviews = await storage.getReviewsByContractor(contractor.id);
          stats.totalReviews = reviews.length;
          
          if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            stats.averageRating = Number((totalRating / reviews.length).toFixed(1));
          }
        }
      }

      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update user profile endpoint
  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      // Validate that the user exists
      const existingUser = await getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user data (this would need an updateUser method in storage)
      // For now, we'll simulate the update
      const updatedUser = { ...existingUser, ...updateData, updatedAt: new Date().toISOString() };
      
      // TODO: Implement actual updateUser method in firebase-storage.ts
      // const updatedUser = await storage.updateUser(userId, updateData);
      
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get user contractor connections
  app.get("/api/users/:id/contractor-connections", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // For homeowners, get contractors they've worked with through accepted bids
      if (user.userType === 'homeowner') {
        const projects = await getProjectsByHomeowner(userId);
        const contractorConnections = [];
        
        for (const project of projects) {
          const bids = await getBidsByProject(project.id);
          const acceptedBids = bids.filter(bid => bid.status === 'accepted');
          
          for (const bid of acceptedBids) {
            const contractor = await getContractor(bid.contractorId);
            if (contractor) {
              const contractorUser = await getUser(contractor.userId);
              contractorConnections.push({
                contractor: { ...contractor, user: contractorUser },
                project: project,
                bid: bid
              });
            }
          }
        }
        
        res.json(contractorConnections);
      } else {
        // For contractors, return empty array for now
        res.json([]);
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
