import { 
  users, contractors, projects, bids, messages,
  type User, type InsertUser, 
  type Contractor, type InsertContractor,
  type Project, type InsertProject,
  type Bid, type InsertBid,
  type Message, type InsertMessage 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Contractor operations
  getContractor(id: number): Promise<Contractor | undefined>;
  getContractorByUserId(userId: number): Promise<Contractor | undefined>;
  createContractor(contractor: InsertContractor): Promise<Contractor>;
  getContractors(): Promise<Contractor[]>;
  getContractorsByCategory(category: string): Promise<Contractor[]>;
  getContractorsByLocation(latitude: number, longitude: number, radiusKm: number): Promise<Contractor[]>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  getProjects(): Promise<Project[]>;
  getProjectsByHomeowner(homeownerId: number): Promise<Project[]>;
  updateProjectStatus(id: number, status: string): Promise<void>;
  
  // Bid operations
  getBid(id: number): Promise<Bid | undefined>;
  createBid(bid: InsertBid): Promise<Bid>;
  getBidsByProject(projectId: number): Promise<Bid[]>;
  getBidsByContractor(contractorId: number): Promise<Bid[]>;
  updateBidStatus(id: number, status: string): Promise<void>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByProject(projectId: number): Promise<Message[]>;
  getConversations(userId: number): Promise<any[]>;
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const { db } = await import('./db');
    const { users } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { db } = await import('./db');
    const { users } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { db } = await import('./db');
    const { users } = await import('@shared/schema');
    
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getContractor(id: number): Promise<Contractor | undefined> {
    const { db } = await import('./db');
    const { contractors } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [contractor] = await db.select().from(contractors).where(eq(contractors.id, id));
    return contractor || undefined;
  }

  async getContractorByUserId(userId: number): Promise<Contractor | undefined> {
    const { db } = await import('./db');
    const { contractors } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [contractor] = await db.select().from(contractors).where(eq(contractors.userId, userId));
    return contractor || undefined;
  }

  async createContractor(insertContractor: InsertContractor): Promise<Contractor> {
    const { db } = await import('./db');
    const { contractors } = await import('@shared/schema');
    
    const [contractor] = await db
      .insert(contractors)
      .values(insertContractor)
      .returning();
    return contractor;
  }

  async getContractors(): Promise<Contractor[]> {
    const { db } = await import('./db');
    const { contractors } = await import('@shared/schema');
    
    return await db.select().from(contractors);
  }

  async getContractorsByCategory(category: string): Promise<Contractor[]> {
    const { db } = await import('./db');
    const { contractors } = await import('@shared/schema');
    const { arrayContains } = await import('drizzle-orm');
    
    return await db.select().from(contractors).where(arrayContains(contractors.specialties, [category]));
  }

  async getContractorsByLocation(latitude: number, longitude: number, radiusKm: number = 20): Promise<Contractor[]> {
    const { db } = await import('./db');
    const { contractors, users } = await import('@shared/schema');
    const { eq, sql } = await import('drizzle-orm');
    
    const result = await db
      .select({
        contractor: contractors,
        user: users
      })
      .from(contractors)
      .leftJoin(users, eq(contractors.userId, users.id))
      .where(
        sql`
          CASE 
            WHEN ${users.latitude} IS NOT NULL AND ${users.longitude} IS NOT NULL THEN
              6371 * acos(cos(radians(${latitude})) * cos(radians(${users.latitude})) * 
              cos(radians(${users.longitude}) - radians(${longitude})) + 
              sin(radians(${latitude})) * sin(radians(${users.latitude}))) <= ${radiusKm}
            ELSE true
          END
        `
      );
    
    return result.map(r => r.contractor);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const { db } = await import('./db');
    const { projects } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const { db } = await import('./db');
    const { projects } = await import('@shared/schema');
    
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async getProjects(): Promise<Project[]> {
    const { db } = await import('./db');
    const { projects } = await import('@shared/schema');
    
    return await db.select().from(projects);
  }

  async getProjectsByHomeowner(homeownerId: number): Promise<Project[]> {
    const { db } = await import('./db');
    const { projects } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    return await db.select().from(projects).where(eq(projects.homeownerId, homeownerId));
  }

  async updateProjectStatus(id: number, status: string): Promise<void> {
    const { db } = await import('./db');
    const { projects } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    await db.update(projects).set({ status }).where(eq(projects.id, id));
  }

  async getBid(id: number): Promise<Bid | undefined> {
    const { db } = await import('./db');
    const { bids } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [bid] = await db.select().from(bids).where(eq(bids.id, id));
    return bid || undefined;
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const { db } = await import('./db');
    const { bids } = await import('@shared/schema');
    
    const [bid] = await db
      .insert(bids)
      .values(insertBid)
      .returning();
    return bid;
  }

  async getBidsByProject(projectId: number): Promise<Bid[]> {
    const { db } = await import('./db');
    const { bids } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    return await db.select().from(bids).where(eq(bids.projectId, projectId));
  }

  async getBidsByContractor(contractorId: number): Promise<Bid[]> {
    const { db } = await import('./db');
    const { bids } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    return await db.select().from(bids).where(eq(bids.contractorId, contractorId));
  }

  async updateBidStatus(id: number, status: string): Promise<void> {
    const { db } = await import('./db');
    const { bids } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    await db.update(bids).set({ status }).where(eq(bids.id, id));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const { db } = await import('./db');
    const { messages } = await import('@shared/schema');
    
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getMessagesByProject(projectId: number): Promise<Message[]> {
    const { db } = await import('./db');
    const { messages } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    return await db.select().from(messages).where(eq(messages.projectId, projectId));
  }

  async getConversations(userId: number): Promise<any[]> {
    const { db } = await import('./db');
    const { messages, projects, users } = await import('@shared/schema');
    const { eq, or, sql } = await import('drizzle-orm');
    
    const conversations = await db
      .selectDistinct({
        projectId: messages.projectId,
        otherUserId: sql`CASE WHEN ${messages.senderId} = ${userId} THEN ${messages.receiverId} ELSE ${messages.senderId} END`.as('otherUserId'),
        lastMessage: sql`MAX(${messages.createdAt})`.as('lastMessage')
      })
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .groupBy(messages.projectId, sql`CASE WHEN ${messages.senderId} = ${userId} THEN ${messages.receiverId} ELSE ${messages.senderId} END`);
    
    return conversations;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contractors: Map<number, Contractor>;
  private projects: Map<number, Project>;
  private bids: Map<number, Bid>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentContractorId: number;
  private currentProjectId: number;
  private currentBidId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.contractors = new Map();
    this.projects = new Map();
    this.bids = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentContractorId = 1;
    this.currentProjectId = 1;
    this.currentBidId = 1;
    this.currentMessageId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Sample contractors
    const contractor1 = await this.createUser({
      username: "mikejohnson",
      email: "mike@constructionpro.com",
      password: "password",
      firstName: "Mike",
      lastName: "Johnson",
      phone: "(555) 123-4567",
      address: "123 Builder St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      latitude: "37.7749",
      longitude: "-122.4194",
      userType: "contractor",
      isVerified: true,
    });

    await this.createContractor({
      userId: contractor1.id,
      companyName: "Johnson Construction",
      licenseNumber: "CA-123456",
      insuranceNumber: "INS-789012",
      specialties: ["Kitchen Remodeling", "Bathroom Renovation"],
      experienceYears: 15,
      description: "Expert kitchen and bathroom contractor with 15+ years of experience in residential renovations.",
      portfolio: [],
      isVerified: true,
    });

    const contractor2 = await this.createUser({
      username: "sarahdavis",
      email: "sarah@electricpro.com",
      password: "password",
      firstName: "Sarah",
      lastName: "Davis",
      phone: "(555) 234-5678",
      address: "456 Electric Ave",
      city: "Austin",
      state: "TX",
      zipCode: "73301",
      latitude: "30.2672",
      longitude: "-97.7431",
      userType: "contractor",
      isVerified: true,
    });

    await this.createContractor({
      userId: contractor2.id,
      companyName: "Davis Electrical",
      licenseNumber: "TX-654321",
      insuranceNumber: "INS-345678",
      specialties: ["Electrical"],
      experienceYears: 12,
      description: "Licensed electrician specializing in residential wiring, lighting, and panel upgrades.",
      portfolio: [],
      isVerified: true,
    });

    // Sample homeowner
    const homeowner1 = await this.createUser({
      username: "johnsmith",
      email: "john@email.com",
      password: "password",
      firstName: "John",
      lastName: "Smith",
      phone: "(555) 345-6789",
      address: "789 Home Ave",
      city: "San Francisco",
      state: "CA",
      zipCode: "94103",
      latitude: "37.7849",
      longitude: "-122.4094",
      userType: "homeowner",
      isVerified: true,
    });

    // Sample projects
    const project1 = await this.createProject({
      homeownerId: homeowner1.id,
      title: "Complete Kitchen Renovation",
      description: "Looking for a contractor to remodel my entire kitchen. Includes new cabinets, countertops, flooring, and appliances.",
      category: "Kitchen Remodeling",
      budget: "$25,000 - $35,000",
      timeline: "4-6 weeks",
      address: "789 Home Ave, San Francisco, CA 94103",
      photos: [],
    });

    // Sample bids
    await this.createBid({
      projectId: project1.id,
      contractorId: 1,
      amount: "28500.00",
      timeline: "4-6 weeks",
      proposal: "I can complete your kitchen renovation using high-quality materials and modern design principles. Timeline: 4-6 weeks.",
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      phone: insertUser.phone || null,
      address: insertUser.address || null,
      city: insertUser.city || null,
      state: insertUser.state || null,
      zipCode: insertUser.zipCode || null,
      latitude: insertUser.latitude || null,
      longitude: insertUser.longitude || null,
      isVerified: insertUser.isVerified || false,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Contractor operations
  async getContractor(id: number): Promise<Contractor | undefined> {
    return this.contractors.get(id);
  }

  async getContractorByUserId(userId: number): Promise<Contractor | undefined> {
    return Array.from(this.contractors.values()).find(contractor => contractor.userId === userId);
  }

  async createContractor(insertContractor: InsertContractor): Promise<Contractor> {
    const id = this.currentContractorId++;
    const contractor: Contractor = { 
      ...insertContractor, 
      id,
      licenseNumber: insertContractor.licenseNumber || null,
      insuranceNumber: insertContractor.insuranceNumber || null,
      isVerified: insertContractor.isVerified || false,
      portfolio: insertContractor.portfolio || [],
      rating: "4.9",
      reviewCount: 0,
    };
    this.contractors.set(id, contractor);
    return contractor;
  }

  async getContractors(): Promise<Contractor[]> {
    return Array.from(this.contractors.values());
  }

  async getContractorsByCategory(category: string): Promise<Contractor[]> {
    return Array.from(this.contractors.values()).filter(contractor => 
      contractor.specialties.includes(category)
    );
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = { 
      ...insertProject, 
      id,
      status: "open",
      createdAt: new Date(),
      photos: insertProject.photos || [],
    };
    this.projects.set(id, project);
    return project;
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getProjectsByHomeowner(homeownerId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => 
      project.homeownerId === homeownerId
    );
  }

  async updateProjectStatus(id: number, status: string): Promise<void> {
    const project = this.projects.get(id);
    if (project) {
      this.projects.set(id, { ...project, status });
    }
  }

  // Bid operations
  async getBid(id: number): Promise<Bid | undefined> {
    return this.bids.get(id);
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const id = this.currentBidId++;
    const bid: Bid = { 
      ...insertBid, 
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.bids.set(id, bid);
    return bid;
  }

  async getBidsByProject(projectId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(bid => bid.projectId === projectId);
  }

  async getBidsByContractor(contractorId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(bid => bid.contractorId === contractorId);
  }

  async updateBidStatus(id: number, status: string): Promise<void> {
    const bid = this.bids.get(id);
    if (bid) {
      this.bids.set(id, { ...bid, status });
    }
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByProject(projectId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.projectId === projectId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getConversations(userId: number): Promise<any[]> {
    const userMessages = Array.from(this.messages.values()).filter(message => 
      message.senderId === userId || message.receiverId === userId
    );
    
    const conversationMap = new Map();
    userMessages.forEach(message => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const key = `${message.projectId}-${otherUserId}`;
      
      if (!conversationMap.has(key) || conversationMap.get(key).createdAt < message.createdAt) {
        conversationMap.set(key, {
          projectId: message.projectId,
          otherUserId,
          lastMessage: message,
        });
      }
    });
    
    return Array.from(conversationMap.values());
  }

  // Calculate distance between two coordinates using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  async getContractorsByLocation(latitude: number, longitude: number, radiusKm: number = 20): Promise<Contractor[]> {
    const contractors = Array.from(this.contractors.values());
    const nearbyContractors = [];

    for (const contractor of contractors) {
      const user = await this.getUser(contractor.userId);
      if (user && user.latitude && user.longitude) {
        const userLat = parseFloat(user.latitude);
        const userLon = parseFloat(user.longitude);
        const distance = this.calculateDistance(latitude, longitude, userLat, userLon);
        
        if (distance <= radiusKm) {
          nearbyContractors.push(contractor);
        }
      }
    }

    return nearbyContractors;
  }
}

export const storage = new DatabaseStorage();
