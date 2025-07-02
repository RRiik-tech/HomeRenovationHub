import { eq, and, or, desc, asc } from 'drizzle-orm';
import { db } from './db';
import {
  users, contractors, projects, bids, messages,
  type User, type InsertUser,
  type Contractor, type InsertContractor,
  type Project, type InsertProject,
  type Bid, type InsertBid,
  type Message, type InsertMessage
} from '@shared/schema';

export class DrizzleStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Contractor operations
  async getContractor(id: number): Promise<Contractor | undefined> {
    const result = await db.select().from(contractors).where(eq(contractors.id, id)).limit(1);
    return result[0];
  }

  async getContractorByUserId(userId: number): Promise<Contractor | undefined> {
    const result = await db.select().from(contractors).where(eq(contractors.userId, userId)).limit(1);
    return result[0];
  }

  async createContractor(insertContractor: InsertContractor): Promise<Contractor> {
    const result = await db.insert(contractors).values(insertContractor).returning();
    return result[0];
  }

  async getContractors(): Promise<Contractor[]> {
    return await db.select().from(contractors);
  }

  async getContractorsByCategory(category: string): Promise<Contractor[]> {
    return await db.select().from(contractors).where(eq(contractors.specialties, [category]));
  }

  async getContractorsByLocation(latitude: number, longitude: number, radiusKm: number = 20): Promise<Contractor[]> {
    // This is a simplified location-based query
    // In a real implementation, you'd use PostGIS or a more sophisticated distance calculation
    const allContractors = await db.select().from(contractors);
    const nearbyContractors = [];

    for (const contractor of allContractors) {
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

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0];
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(insertProject).returning();
    return result[0];
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProjectsByHomeowner(homeownerId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.homeownerId, homeownerId));
  }

  async updateProjectStatus(id: number, status: string): Promise<void> {
    await db.update(projects).set({ status }).where(eq(projects.id, id));
  }

  // Bid operations
  async getBid(id: number): Promise<Bid | undefined> {
    const result = await db.select().from(bids).where(eq(bids.id, id)).limit(1);
    return result[0];
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const result = await db.insert(bids).values(insertBid).returning();
    return result[0];
  }

  async getBidsByProject(projectId: number): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.projectId, projectId));
  }

  async getBidsByContractor(contractorId: number): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.contractorId, contractorId));
  }

  async updateBidStatus(id: number, status: string): Promise<void> {
    await db.update(bids).set({ status }).where(eq(bids.id, id));
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(insertMessage).returning();
    return result[0];
  }

  async getMessagesByProject(projectId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.projectId, projectId)).orderBy(asc(messages.createdAt));
  }

  async getConversations(userId: number): Promise<any[]> {
    const userMessages = await db.select().from(messages).where(
      or(eq(messages.senderId, userId), eq(messages.receiverId, userId))
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

  // Helper method for distance calculation
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
} 