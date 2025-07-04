import {
  User,
  Contractor,
  Project,
  Bid,
  Message,
  Review,
  Notification,
  Document,
  Payment,
  Milestone,
  InsertUser,
  InsertContractor,
  InsertProject,
  InsertBid,
  InsertMessage,
  InsertReview,
  InsertNotification,
  InsertDocument,
  InsertPayment,
  InsertMilestone
} from './memory-schema';

export class MemoryStorage {
  private users: User[] = [];
  private contractors: Contractor[] = [];
  private projects: Project[] = [];
  private bids: Bid[] = [];
  private messages: Message[] = [];
  private reviews: Review[] = [];
  private notifications: Notification[] = [];
  private documents: Document[] = [];
  private payments: Payment[] = [];
  private milestones: Milestone[] = [];
  private nextUserId = 1;
  private nextContractorId = 1;
  private nextProjectId = 1;
  private nextBidId = 1;
  private nextMessageId = 1;
  private nextReviewId = 1;
  private nextNotificationId = 1;
  private nextDocumentId = 1;
  private nextPaymentId = 1;
  private nextMilestoneId = 1;

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample users
    const user1 = this.createSampleUser({
      username: "john_doe",
      email: "john@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      userType: "homeowner",
      city: "New York",
      state: "NY"
    });

    const user2 = this.createSampleUser({
      username: "jane_smith",
      email: "jane@example.com", 
      password: "password123",
      firstName: "Jane",
      lastName: "Smith",
      userType: "contractor",
      city: "Los Angeles",
      state: "CA"
    });

    const user3 = this.createSampleUser({
      username: "mike_johnson",
      email: "mike@example.com",
      password: "password123", 
      firstName: "Mike",
      lastName: "Johnson",
      userType: "contractor",
      city: "Chicago",
      state: "IL"
    });

    // Create sample contractors
    this.createSampleContractor({
      userId: user2.id,
      companyName: "Smith Renovations",
      specialties: ["Kitchen Remodeling", "Bathroom Renovation"],
      experienceYears: 8,
      description: "Professional kitchen and bathroom renovation specialist with 8 years of experience.",
      isVerified: true
    });

    this.createSampleContractor({
      userId: user3.id,
      companyName: "Johnson Construction",
      specialties: ["Roofing", "Plumbing", "Electrical"],
      experienceYears: 12,
      description: "Full-service construction company specializing in roofing, plumbing, and electrical work.",
      isVerified: true
    });

    // Create sample projects
    this.createSampleProject({
      homeownerId: user1.id,
      title: "Kitchen Remodel",
      description: "Looking to completely remodel my kitchen. Need new cabinets, countertops, and appliances.",
      category: "Kitchen Remodeling",
      budget: "$15,000 - $25,000",
      timeline: "2-3 months",
      address: "123 Main St, New York, NY"
    });

    this.createSampleProject({
      homeownerId: user1.id,
      title: "Bathroom Update",
      description: "Need to update my master bathroom with new fixtures and tile work.",
      category: "Bathroom Renovation", 
      budget: "$8,000 - $12,000",
      timeline: "1-2 months",
      address: "123 Main St, New York, NY"
    });

    // Create sample reviews
    this.createSampleReview({
      projectId: 1,
      reviewerId: user1.id,
      contractorId: 1,
      rating: 5,
      comment: "Excellent work! Jane and her team were professional, timely, and delivered exactly what we wanted. The kitchen looks amazing and the quality is outstanding.",
      categories: ["quality", "communication", "timeliness", "professionalism"]
    });

    this.createSampleReview({
      projectId: 2,
      reviewerId: user1.id,
      contractorId: 2,
      rating: 4,
      comment: "Great work on the bathroom renovation. Mike's team was very skilled and the work was completed on time. Would definitely recommend!",
      categories: ["quality", "timeliness", "value"]
    });
  }

  private createSampleUser(data: any): User {
    const user: User = {
      id: this.nextUserId++,
      ...data,
      phone: null,
      address: null,
      zipCode: null,
      latitude: null,
      longitude: null,
      firebaseUid: null,
      photoURL: null,
      isVerified: false,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  private createSampleContractor(data: any): Contractor {
    const contractor: Contractor = {
      id: this.nextContractorId++,
      ...data,
      licenseNumber: null,
      insuranceNumber: null,
      portfolio: [],
      rating: "4.5",
      reviewCount: 25,
      isVerified: data.isVerified ?? false,
    };
    this.contractors.push(contractor);
    return contractor;
  }

  private createSampleProject(data: any): Project {
    const project: Project = {
      id: this.nextProjectId++,
      ...data,
      photos: [],
      status: "open",
      createdAt: new Date(),
    };
    this.projects.push(project);
    return project;
  }

  private createSampleReview(data: any): Review {
    const review: Review = {
      id: this.nextReviewId++,
      ...data,
      createdAt: new Date(),
    };
    this.reviews.push(review);
    
    // Update contractor rating
    this.updateContractorRating(data.contractorId);
    
    return review;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return this.users.find(user => user.firebaseUid === firebaseUid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      ...insertUser,
      phone: insertUser.phone ?? null,
      address: insertUser.address ?? null,
      city: insertUser.city ?? null,
      state: insertUser.state ?? null,
      zipCode: insertUser.zipCode ?? null,
      latitude: insertUser.latitude ?? null,
      longitude: insertUser.longitude ?? null,
      firebaseUid: insertUser.firebaseUid ?? null,
      photoURL: insertUser.photoURL ?? null,
      isVerified: insertUser.isVerified ?? false,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  // Contractor operations
  async getContractor(id: number): Promise<Contractor | undefined> {
    return this.contractors.find(contractor => contractor.id === id);
  }

  async getContractorByUserId(userId: number): Promise<Contractor | undefined> {
    return this.contractors.find(contractor => contractor.userId === userId);
  }

  async createContractor(insertContractor: InsertContractor): Promise<Contractor> {
    const contractor: Contractor = {
      id: this.nextContractorId++,
      ...insertContractor,
      licenseNumber: insertContractor.licenseNumber ?? null,
      insuranceNumber: insertContractor.insuranceNumber ?? null,
      portfolio: insertContractor.portfolio ?? [],
      rating: "0.00",
      reviewCount: 0,
      isVerified: insertContractor.isVerified ?? false,
    };
    this.contractors.push(contractor);
    return contractor;
  }

  async getContractors(): Promise<Contractor[]> {
    return this.contractors;
  }

  async getContractorsByCategory(category: string): Promise<Contractor[]> {
    return this.contractors.filter(contractor => 
      contractor.specialties.includes(category)
    );
  }

  async getContractorsByLocation(latitude: number, longitude: number, radiusKm: number = 20): Promise<Contractor[]> {
    // Simplified location-based query
    return this.contractors;
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.find(project => project.id === id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const project: Project = {
      id: this.nextProjectId++,
      ...insertProject,
      photos: insertProject.photos ?? [],
      status: "open",
      createdAt: new Date(),
    };
    this.projects.push(project);
    return project;
  }

  async getProjects(): Promise<Project[]> {
    return this.projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProjectsByHomeowner(homeownerId: number): Promise<Project[]> {
    return this.projects.filter(project => project.homeownerId === homeownerId);
  }

  async updateProjectStatus(id: number, status: string): Promise<void> {
    const project = this.projects.find(p => p.id === id);
    if (project) {
      project.status = status;
    }
  }

  // Bid operations
  async getBid(id: number): Promise<Bid | undefined> {
    return this.bids.find(bid => bid.id === id);
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const bid: Bid = {
      id: this.nextBidId++,
      ...insertBid,
      status: "pending",
      createdAt: new Date(),
    };
    this.bids.push(bid);
    return bid;
  }

  async getBidsByProject(projectId: number): Promise<Bid[]> {
    return this.bids.filter(bid => bid.projectId === projectId);
  }

  async getBidsByContractor(contractorId: number): Promise<Bid[]> {
    return this.bids.filter(bid => bid.contractorId === contractorId);
  }

  async updateBidStatus(id: number, status: string): Promise<void> {
    const bid = this.bids.find(b => b.id === id);
    if (bid) {
      bid.status = status;
    }
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.nextMessageId++,
      ...insertMessage,
      createdAt: new Date(),
    };
    this.messages.push(message);
    return message;
  }

  async getMessagesByProject(projectId: number): Promise<Message[]> {
    return this.messages
      .filter(message => message.projectId === projectId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getConversations(userId: number): Promise<any[]> {
    const userMessages = this.messages.filter(message => 
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

  // Review operations
  async createReview(insertReview: InsertReview): Promise<Review> {
    const review: Review = {
      id: this.nextReviewId++,
      ...insertReview,
      photos: insertReview.photos || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reviews.push(review);
    return review;
  }

  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.find(review => review.id === id);
  }

  async getReviewsByProject(projectId: number): Promise<Review[]> {
    return this.reviews.filter(review => review.projectId === projectId);
  }

  async getReviewsByContractor(contractorId: number): Promise<Review[]> {
    return this.reviews.filter(review => review.contractorId === contractorId);
  }

  async getReviewsByReviewer(reviewerId: number): Promise<Review[]> {
    return this.reviews.filter(review => review.reviewerId === reviewerId);
  }

  async updateReview(id: number, updates: Partial<Review>): Promise<Review | undefined> {
    const reviewIndex = this.reviews.findIndex(review => review.id === id);
    if (reviewIndex === -1) return undefined;
    
    this.reviews[reviewIndex] = { 
      ...this.reviews[reviewIndex], 
      ...updates, 
      updatedAt: new Date() 
    };
    return this.reviews[reviewIndex];
  }

  // Notification operations
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: this.nextNotificationId++,
      ...insertNotification,
      createdAt: new Date(),
    };
    this.notifications.push(notification);
    return notification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return this.notifications
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      return true;
    }
    return false;
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    return this.notifications.filter(n => n.userId === userId && !n.isRead).length;
  }

  // Document operations
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const document: Document = {
      id: this.nextDocumentId++,
      ...insertDocument,
      createdAt: new Date(),
    };
    this.documents.push(document);
    return document;
  }

  async getDocumentsByProject(projectId: number): Promise<Document[]> {
    return this.documents.filter(doc => doc.projectId === projectId);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.find(doc => doc.id === id);
  }

  async deleteDocument(id: number): Promise<boolean> {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index !== -1) {
      this.documents.splice(index, 1);
      return true;
    }
    return false;
  }

  // Payment operations
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const payment: Payment = {
      id: this.nextPaymentId++,
      ...insertPayment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.payments.push(payment);
    return payment;
  }

  async getPaymentsByProject(projectId: number): Promise<Payment[]> {
    return this.payments.filter(payment => payment.projectId === projectId);
  }

  async getPaymentsByUser(userId: number): Promise<Payment[]> {
    return this.payments.filter(payment => 
      payment.fromUserId === userId || payment.toUserId === userId
    );
  }

  async updatePaymentStatus(id: number, status: Payment['status']): Promise<Payment | undefined> {
    const payment = this.payments.find(p => p.id === id);
    if (payment) {
      payment.status = status;
      payment.updatedAt = new Date();
      return payment;
    }
    return undefined;
  }

  // Milestone operations
  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const milestone: Milestone = {
      id: this.nextMilestoneId++,
      ...insertMilestone,
      dueDate: new Date(insertMilestone.dueDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.milestones.push(milestone);
    return milestone;
  }

  async getMilestonesByProject(projectId: number): Promise<Milestone[]> {
    return this.milestones
      .filter(milestone => milestone.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  }

  async updateMilestoneStatus(id: number, status: Milestone['status']): Promise<Milestone | undefined> {
    const milestone = this.milestones.find(m => m.id === id);
    if (milestone) {
      milestone.status = status;
      milestone.updatedAt = new Date();
      return milestone;
    }
    return undefined;
  }

  async getMilestone(id: number): Promise<Milestone | undefined> {
    return this.milestones.find(milestone => milestone.id === id);
  }

  private updateContractorRating(contractorId: number): void {
    // Implementation of updateContractorRating method
  }
} 