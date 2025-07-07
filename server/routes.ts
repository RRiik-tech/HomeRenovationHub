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
  createMessage, getMessagesByProject, getConversations
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
      const existingUser = await getUserByEmail(validatedUserData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Create user
      const user = await createUser(validatedUserData);
      
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
      const user = await getUserByEmail(email);
      
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
      let user = await getUserByEmail(email);
      
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
        
        user = await createUser(userData);
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
      const bids = await getBidsByContractor(contractorId);
      
      // Get project details for each bid
      const bidsWithProjects = await Promise.all(
        bids.map(async (bid) => {
          const project = await getProject(bid.projectId);
          const homeowner = project ? await getUser(project.homeownerId) : null;
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
      const projects = await getProjectsByHomeowner(homeownerId);
      
      // Get bid count for each project
      const projectsWithBids = await Promise.all(
        projects.map(async (project) => {
          const bids = await getBidsByProject(project.id);
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

  // Get contractor connections for homeowner
  app.get("/api/users/:id/contractor-connections", async (req, res) => {
    try {
      const homeownerId = parseInt(req.params.id);
      
      // Get all bids for this homeowner's projects
      const projects = await getProjectsByHomeowner(homeownerId);
      const allBids: any[] = [];
      
      for (const project of projects) {
        const bids = await getBidsByProject(project.id);
        allBids.push(...bids.map(bid => ({ ...bid, project })));
      }
      
      // Get unique contractors from bids
      const contractorIds = Array.from(new Set(allBids.map(bid => bid.contractorId)));
      const contractors = await Promise.all(
        contractorIds.map(async (contractorId) => {
          const contractor = await getContractor(contractorId);
          const user = contractor ? await getUser(contractor.userId) : null;
          const contractorBids = allBids.filter(bid => bid.contractorId === contractorId);
          
          return {
            ...contractor,
            user,
            projectCount: contractorBids.length,
            lastProject: contractorBids[contractorBids.length - 1]?.project?.title || '',
            status: contractorBids.some(bid => bid.status === 'accepted') ? 'active' : 'potential'
          };
        })
      );
      
      res.json(contractors.filter(Boolean));
    } catch (error: any) {
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
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Get project analysis
      const projectAnalysis = await aiService.analyzeProject(project);
      
      // Get compatible contractors
      const compatibilityScores = await aiService.findCompatibleContractors(project);
      
      // Get contractor details for each score
      const compatibilityWithDetails = await Promise.all(
        compatibilityScores.map(async (score) => {
          const contractor = await storage.getContractor(score.contractorId);
          const user = contractor ? await storage.getUser(contractor.userId) : null;
          return {
            ...score,
            contractor: contractor ? { ...contractor, user } : null
          };
        })
      );

      res.json({
        projectAnalysis,
        compatibilityScores: compatibilityWithDetails
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get project analysis only
  app.get("/api/ai/project-analysis/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const projectAnalysis = await aiService.analyzeProject(project);
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
      const bid = await storage.getBid(bidId);
      
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }

      const project = await storage.getProject(bid.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const bidAnalysis = await aiService.analyzeBid(bid, project);
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
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const timelinePrediction = await aiService.predictTimeline(project);
      res.json(timelinePrediction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // 5. AI Risk Assessment
  app.get("/api/ai/risk-assessment/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const bids = await storage.getBidsByProject(projectId);
      const riskAssessment = await aiService.assessProjectRisks(project, bids);
      res.json(riskAssessment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Comprehensive AI Analysis (all features combined)
  app.get("/api/ai/comprehensive-analysis/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const bids = await storage.getBidsByProject(projectId);
      
      // Run all AI analyses in parallel
      const [
        projectAnalysis,
        compatibilityScores,
        timelinePrediction,
        riskAssessment,
        bidAnalyses
      ] = await Promise.all([
        aiService.analyzeProject(project),
        aiService.findCompatibleContractors(project),
        aiService.predictTimeline(project),
        aiService.assessProjectRisks(project, bids),
        Promise.all(bids.map(bid => aiService.analyzeBid(bid, project)))
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

  const httpServer = createServer(app);
  return httpServer;
}
