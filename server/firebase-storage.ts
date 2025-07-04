import { 
  type User, type InsertUser, 
  type Contractor, type InsertContractor,
  type Project, type InsertProject,
  type Bid, type InsertBid,
  type Message, type InsertMessage 
} from "@shared/schema";
import admin from "./firebase";
const db = admin.firestore();

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
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

  // Review operations
  createReview(reviewData: any): Promise<any>;
  getReviewsByContractor(contractorId: number): Promise<any[]>;
  getReviewsByProject(projectId: number): Promise<any[]>;
}

// Firebase Storage Implementation
export class FirebaseStorage implements IStorage {
  private currentUserId = 1;
  private currentContractorId = 1;
  private currentProjectId = 1;
  private currentBidId = 1;
  private currentMessageId = 1;

  // Helper function to calculate distance between two points
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
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

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const userDoc = await db.collection('users').doc(id.toString()).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        return { 
          id, 
          ...data,
          createdAt: new Date(data?.createdAt || new Date()),
          updatedAt: new Date(data?.updatedAt || new Date())
        } as unknown as User;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const querySnapshot = await db.collection('users').where('email', '==', email).get();
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        const idNum = Number(doc.id);
        return { 
          id: Number.isNaN(idNum) ? this.currentUserId++ : idNum, 
          ...data,
          createdAt: new Date(data?.createdAt || new Date()),
          updatedAt: new Date(data?.updatedAt || new Date())
        } as unknown as User;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    try {
      const querySnapshot = await db.collection('users').where('firebaseUid', '==', firebaseUid).get();
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        const idNum = Number(doc.id);
        return { 
          id: Number.isNaN(idNum) ? this.currentUserId++ : idNum, 
          ...data,
          createdAt: new Date(data?.createdAt || new Date()),
          updatedAt: new Date(data?.updatedAt || new Date())
        } as unknown as User;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user by Firebase UID:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const userData = {
        ...insertUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await db.collection('users').add(userData);
      const idNum = Number(docRef.id);
      
      return { 
        id: Number.isNaN(idNum) ? this.currentUserId++ : idNum, 
        ...userData,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt)
      } as unknown as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Contractor operations
  async getContractor(id: number): Promise<Contractor | undefined> {
    try {
      const contractorDoc = await db.collection('contractors').doc(id.toString()).get();
      if (contractorDoc.exists) {
        const data = contractorDoc.data();
        const idNum = Number(contractorDoc.id);
        return { 
          id: Number.isNaN(idNum) ? this.currentContractorId++ : idNum, 
          ...data,
          createdAt: new Date(data?.createdAt || new Date()),
          updatedAt: new Date(data?.updatedAt || new Date())
        } as unknown as Contractor;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting contractor:', error);
      return undefined;
    }
  }

  async getContractorByUserId(userId: number): Promise<Contractor | undefined> {
    try {
      const querySnapshot = await db.collection('contractors').where('userId', '==', userId).get();
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        const idNum = Number(doc.id);
        return { 
          id: Number.isNaN(idNum) ? this.currentContractorId++ : idNum, 
          ...data,
          createdAt: new Date(data?.createdAt || new Date()),
          updatedAt: new Date(data?.updatedAt || new Date())
        } as unknown as Contractor;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting contractor by user ID:', error);
      return undefined;
    }
  }

  async createContractor(insertContractor: InsertContractor): Promise<Contractor> {
    try {
      const contractorData = {
        ...insertContractor,
        rating: "0.00",
        reviewCount: 0,
        portfolio: insertContractor.portfolio || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await db.collection('contractors').add(contractorData);
      const idNum = Number(docRef.id);
      
      return { 
        id: Number.isNaN(idNum) ? this.currentContractorId++ : idNum, 
        ...contractorData,
        portfolio: contractorData.portfolio || [],
        createdAt: new Date(contractorData.createdAt),
        updatedAt: new Date(contractorData.updatedAt)
      } as unknown as Contractor;
    } catch (error) {
      console.error('Error creating contractor:', error);
      throw new Error('Failed to create contractor');
    }
  }

  async getContractors(): Promise<Contractor[]> {
    try {
      const querySnapshot = await db.collection('contractors').get();
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const idNum = Number(doc.id);
        return {
          id: Number.isNaN(idNum) ? this.currentContractorId++ : idNum,
          ...data,
          portfolio: data.portfolio || [],
          createdAt: new Date(data?.createdAt || new Date()),
          updatedAt: new Date(data?.updatedAt || new Date())
        } as unknown as Contractor;
      });
    } catch (error) {
      console.error('Error getting contractors:', error);
      return [];
    }
  }

  async getContractorsByCategory(category: string): Promise<Contractor[]> {
    try {
      const querySnapshot = await db.collection('contractors').where('specialties', 'array-contains', category).get();
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const idNum = Number(doc.id);
        return {
          id: Number.isNaN(idNum) ? this.currentContractorId++ : idNum,
          ...data,
          portfolio: data.portfolio || [],
          createdAt: new Date(data?.createdAt || new Date()),
          updatedAt: new Date(data?.updatedAt || new Date())
        } as unknown as Contractor;
      });
    } catch (error) {
      console.error('Error getting contractors by category:', error);
      return [];
    }
  }

  async getContractorsByLocation(latitude: number, longitude: number, radiusKm: number = 20): Promise<Contractor[]> {
    try {
      const allContractors = await this.getContractors();
      
      return allContractors.filter(contractor => {
        // This is a simplified location filter - in production, you'd want to use GeoFirestore
        // For now, we'll return all contractors
        return true;
      });
    } catch (error) {
      console.error('Error getting contractors by location:', error);
      return [];
    }
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    try {
      const projectDoc = await db.collection('projects').doc(id.toString()).get();
      if (projectDoc.exists) {
        const data = projectDoc.data();
        if (!data) return undefined;
        
        const idNum = Number(projectDoc.id);
        return { 
          id: Number.isNaN(idNum) ? this.currentProjectId++ : idNum, 
          ...data,
          photos: data.photos || [],
          createdAt: new Date(data?.createdAt || new Date()),
          updatedAt: new Date(data?.updatedAt || new Date())
        } as unknown as Project;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting project:', error);
      return undefined;
    }
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    try {
      const projectData = {
        ...insertProject,
        photos: insertProject.photos || [],
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await db.collection('projects').add(projectData);
      const idNum = Number(docRef.id);
      
      return { 
        id: Number.isNaN(idNum) ? this.currentProjectId++ : idNum, 
        ...projectData,
        photos: projectData.photos || [],
        createdAt: new Date(projectData.createdAt),
        updatedAt: new Date(projectData.updatedAt)
      } as unknown as Project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      const querySnapshot = await db.collection('projects').get();
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const idNum = Number(doc.id);
        return {
          id: Number.isNaN(idNum) ? this.currentProjectId++ : idNum,
          ...data,
          photos: data.photos || [],
          createdAt: new Date(data?.createdAt || new Date()),
          updatedAt: new Date(data?.updatedAt || new Date())
        } as unknown as Project;
      });
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  }

  async getProjectsByHomeowner(homeownerId: number): Promise<Project[]> {
    try {
      const querySnapshot = await db.collection('projects').where('homeownerId', '==', homeownerId).get();
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const idNum = Number(doc.id);
        return {
          id: Number.isNaN(idNum) ? this.currentProjectId++ : idNum,
          ...data,
          photos: data.photos || [],
          createdAt: new Date(data?.createdAt || new Date()),
          updatedAt: new Date(data?.updatedAt || new Date())
        } as unknown as Project;
      });
    } catch (error) {
      console.error('Error getting projects by homeowner:', error);
      return [];
    }
  }

  async updateProjectStatus(id: number, status: string): Promise<void> {
    try {
      await db.collection('projects').doc(id.toString()).update({ 
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating project status:', error);
      throw new Error('Failed to update project status');
    }
  }

  // Bid operations
  async getBid(id: number): Promise<Bid | undefined> {
    try {
      const bidDoc = await db.collection('bids').doc(id.toString()).get();
      if (bidDoc.exists) {
        const data = bidDoc.data();
        const idNum = Number(bidDoc.id);
        return { 
          id: Number.isNaN(idNum) ? this.currentBidId++ : idNum, 
          ...data,
          createdAt: new Date(data?.createdAt || new Date()),
          updatedAt: new Date(data?.updatedAt || new Date())
        } as unknown as Bid;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting bid:', error);
      return undefined;
    }
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    try {
      const bidData = {
        ...insertBid,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await db.collection('bids').add(bidData);
      const idNum = Number(docRef.id);
      
      return { 
        id: Number.isNaN(idNum) ? this.currentBidId++ : idNum, 
        ...bidData,
        createdAt: new Date(bidData.createdAt),
        updatedAt: new Date(bidData.updatedAt)
      } as unknown as Bid;
    } catch (error) {
      console.error('Error creating bid:', error);
      throw new Error('Failed to create bid');
    }
  }

  async getBidsByProject(projectId: number): Promise<Bid[]> {
    try {
      const querySnapshot = await db.collection('bids').where('projectId', '==', projectId).get();
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const idNum = Number(doc.id);
        return {
          id: Number.isNaN(idNum) ? this.currentBidId++ : idNum,
          ...data,
          createdAt: new Date(data?.createdAt || new Date()),
          updatedAt: new Date(data?.updatedAt || new Date())
        } as unknown as Bid;
      });
    } catch (error) {
      console.error('Error getting bids by project:', error);
      return [];
    }
  }

  async getBidsByContractor(contractorId: number): Promise<Bid[]> {
    try {
      const querySnapshot = await db.collection('bids').where('contractorId', '==', contractorId).get();
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const idNum = Number(doc.id);
        return {
          id: Number.isNaN(idNum) ? this.currentBidId++ : idNum,
          ...data,
          createdAt: new Date(data?.createdAt || new Date()),
          updatedAt: new Date(data?.updatedAt || new Date())
        } as unknown as Bid;
      });
    } catch (error) {
      console.error('Error getting bids by contractor:', error);
      return [];
    }
  }

  async updateBidStatus(id: number, status: string): Promise<void> {
    try {
      await db.collection('bids').doc(id.toString()).update({ 
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating bid status:', error);
      throw new Error('Failed to update bid status');
    }
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    try {
      const messageData = {
        ...insertMessage,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await db.collection('messages').add(messageData);
      const idNum = Number(docRef.id);
      
      return { 
        id: Number.isNaN(idNum) ? this.currentMessageId++ : idNum, 
        ...messageData,
        createdAt: new Date(messageData.createdAt)
      } as unknown as Message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw new Error('Failed to create message');
    }
  }

  async getMessagesByProject(projectId: number): Promise<Message[]> {
    try {
      const querySnapshot = await db.collection('messages').where('projectId', '==', projectId).orderBy('createdAt', 'asc').get();
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const idNum = Number(doc.id);
        return {
          id: Number.isNaN(idNum) ? this.currentMessageId++ : idNum,
          ...data,
          createdAt: new Date(data?.createdAt || new Date())
        } as unknown as Message;
      });
    } catch (error) {
      console.error('Error getting messages by project:', error);
      return [];
    }
  }

  async getConversations(userId: number): Promise<any[]> {
    try {
      const querySnapshot = await db.collection('messages').where('senderId', '==', userId).get();
      
      const conversations = new Map();
      
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const idNum = Number(doc.id);
        const projectIdNum = Number(data.projectId);
        const safeProjectId = Number.isNaN(projectIdNum) ? this.currentProjectId++ : projectIdNum;
        
        const message = { 
          id: Number.isNaN(idNum) ? this.currentMessageId++ : idNum,
          ...data,
          projectId: safeProjectId,
          createdAt: new Date(data?.createdAt || new Date())
        } as unknown as Message;
        
        if (!conversations.has(safeProjectId)) {
          const project = await this.getProject(safeProjectId);
          conversations.set(safeProjectId, {
            projectId: safeProjectId,
            project,
            lastMessage: message,
            messageCount: 1
          });
        } else {
          const conversation = conversations.get(safeProjectId);
          conversation.messageCount++;
          if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
            conversation.lastMessage = message;
          }
        }
      }
      
      return Array.from(conversations.values());
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  // Review operations
  async createReview(reviewData: any): Promise<any> {
    try {
      const review = {
        ...reviewData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await db.collection('reviews').add(review);
      
      return { 
        id: docRef.id, 
        ...review,
        createdAt: new Date(review.createdAt),
        updatedAt: new Date(review.updatedAt)
      };
    } catch (error) {
      console.error('Error creating review:', error);
      throw new Error('Failed to create review');
    }
  }

  async getReviewsByContractor(contractorId: number): Promise<any[]> {
    try {
      const querySnapshot = await db.collection('reviews').where('contractorId', '==', contractorId).get();
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: new Date(data?.createdAt || new Date()),
          updatedAt: new Date(data?.updatedAt || new Date())
        };
      });
    } catch (error) {
      console.error('Error getting reviews by contractor:', error);
      return [];
    }
  }

  async getReviewsByProject(projectId: number): Promise<any[]> {
    try {
      const querySnapshot = await db.collection('reviews').where('projectId', '==', projectId).get();
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: new Date(data?.createdAt || new Date()),
          updatedAt: new Date(data?.updatedAt || new Date())
        };
      });
    } catch (error) {
      console.error('Error getting reviews by project:', error);
      return [];
    }
  }
}

export const storage = new FirebaseStorage();

// User exports
export const createUser = storage.createUser.bind(storage);
export const getUser = storage.getUser.bind(storage);
export const getUserByEmail = storage.getUserByEmail.bind(storage);
export const getUserByFirebaseUid = storage.getUserByFirebaseUid.bind(storage);

// Contractor exports
export const createContractor = storage.createContractor.bind(storage);
export const getContractor = storage.getContractor.bind(storage);
export const getContractorByUserId = storage.getContractorByUserId.bind(storage);
export const getContractors = storage.getContractors.bind(storage);
export const getContractorsByCategory = storage.getContractorsByCategory.bind(storage);
export const getContractorsByLocation = storage.getContractorsByLocation.bind(storage);

// Project exports
export const createProject = storage.createProject.bind(storage);
export const getProject = storage.getProject.bind(storage);
export const getProjects = storage.getProjects.bind(storage);
export const getProjectsByHomeowner = storage.getProjectsByHomeowner.bind(storage);
export const updateProjectStatus = storage.updateProjectStatus.bind(storage);

// Bid exports
export const createBid = storage.createBid.bind(storage);
export const getBid = storage.getBid.bind(storage);
export const getBidsByProject = storage.getBidsByProject.bind(storage);
export const getBidsByContractor = storage.getBidsByContractor.bind(storage);
export const updateBidStatus = storage.updateBidStatus.bind(storage);
export const getBids = getAllBids;

// Message exports
export const createMessage = storage.createMessage.bind(storage);
export const getMessagesByProject = storage.getMessagesByProject.bind(storage);
export const getConversations = storage.getConversations.bind(storage);

let fallbackBidId = 1;
export async function getAllBids() {
  const snapshot = await db.collection('bids').get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    const idNum = Number(doc.id);
    return {
      id: Number.isNaN(idNum) ? fallbackBidId++ : idNum,
      ...data,
      createdAt: new Date(data?.createdAt || new Date()),
      updatedAt: new Date(data?.updatedAt || new Date())
    };
  });
} 