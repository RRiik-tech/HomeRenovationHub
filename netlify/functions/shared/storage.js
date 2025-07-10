import { db } from './firebase.js';

// Firebase Storage Implementation for Netlify Functions
export class FirebaseStorage {
  constructor() {
    this.currentUserId = 1;
    this.currentContractorId = 1;
    this.currentProjectId = 1;
    this.currentBidId = 1;
    this.currentMessageId = 1;
    this.initialized = false;
  }

  async initializeCounters() {
    if (this.initialized) return;
    
    try {
      // Initialize project counter from existing data
      const projectsSnapshot = await db.collection('projects').get();
      if (!projectsSnapshot.empty) {
        const allIds = projectsSnapshot.docs.map(doc => doc.data().id || 0).filter(id => typeof id === 'number');
        const maxId = allIds.length > 0 ? Math.max(...allIds) : 0;
        this.currentProjectId = maxId + 1;
      }
      
      // Initialize other counters similarly
      const usersSnapshot = await db.collection('users').get();
      if (!usersSnapshot.empty) {
        const allUserIds = usersSnapshot.docs.map(doc => doc.data().id || 0).filter(id => typeof id === 'number');
        const maxUserId = allUserIds.length > 0 ? Math.max(...allUserIds) : 0;
        this.currentUserId = maxUserId + 1;
      }
      
      const contractorsSnapshot = await db.collection('contractors').get();
      if (!contractorsSnapshot.empty) {
        const allContractorIds = contractorsSnapshot.docs.map(doc => doc.data().id || 0).filter(id => typeof id === 'number');
        const maxContractorId = allContractorIds.length > 0 ? Math.max(...allContractorIds) : 0;
        this.currentContractorId = maxContractorId + 1;
      }
      
      const bidsSnapshot = await db.collection('bids').get();
      if (!bidsSnapshot.empty) {
        const allBidIds = bidsSnapshot.docs.map(doc => doc.data().id || 0).filter(id => typeof id === 'number');
        const maxBidId = allBidIds.length > 0 ? Math.max(...allBidIds) : 0;
        this.currentBidId = maxBidId + 1;
      }
      
      this.initialized = true;
      console.log('Firebase counters initialized');
    } catch (error) {
      console.error('Error initializing counters:', error);
      this.initialized = true; // Continue with default values
    }
  }

  // Helper function to calculate distance between two points
  calculateDistance(lat1, lon1, lat2, lon2) {
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

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  // User operations
  async getUser(id) {
    try {
      await this.initializeCounters();
      const userDoc = await db.collection('users').doc(id.toString()).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        return { 
          id, 
          ...data,
          createdAt: new Date(data?.createdAt || new Date()),
          updatedAt: new Date(data?.updatedAt || new Date())
        };
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email) {
    try {
      await this.initializeCounters();
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
        };
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserByFirebaseUid(firebaseUid) {
    try {
      await this.initializeCounters();
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
        };
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user by Firebase UID:', error);
      return undefined;
    }
  }

  async createUser(insertUser) {
    try {
      await this.initializeCounters();
      const newUserId = this.currentUserId++;
      const userData = {
        ...insertUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.collection('users').doc(newUserId.toString()).set(userData);
      return { id: newUserId, ...userData };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Contractor operations
  async getContractor(id) {
    try {
      await this.initializeCounters();
      const contractorDoc = await db.collection('contractors').doc(id.toString()).get();
      if (contractorDoc.exists) {
        const data = contractorDoc.data();
        return { id, ...data };
      }
      return undefined;
    } catch (error) {
      console.error('Error getting contractor:', error);
      return undefined;
    }
  }

  async getContractors() {
    try {
      await this.initializeCounters();
      const snapshot = await db.collection('contractors').get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: Number(doc.id), ...data };
      });
    } catch (error) {
      console.error('Error getting contractors:', error);
      return [];
    }
  }

  async createContractor(insertContractor) {
    try {
      await this.initializeCounters();
      const newContractorId = this.currentContractorId++;
      const contractorData = {
        ...insertContractor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.collection('contractors').doc(newContractorId.toString()).set(contractorData);
      return { id: newContractorId, ...contractorData };
    } catch (error) {
      console.error('Error creating contractor:', error);
      throw error;
    }
  }

  // Project operations
  async getProject(id) {
    try {
      await this.initializeCounters();
      const projectDoc = await db.collection('projects').doc(id.toString()).get();
      if (projectDoc.exists) {
        const data = projectDoc.data();
        return { id, ...data };
      }
      return undefined;
    } catch (error) {
      console.error('Error getting project:', error);
      return undefined;
    }
  }

  async getProjects() {
    try {
      await this.initializeCounters();
      const snapshot = await db.collection('projects').get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: Number(doc.id), ...data };
      });
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  }

  async createProject(insertProject) {
    try {
      await this.initializeCounters();
      const newProjectId = this.currentProjectId++;
      const projectData = {
        ...insertProject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.collection('projects').doc(newProjectId.toString()).set(projectData);
      return { id: newProjectId, ...projectData };
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Bid operations
  async getBidsByProject(projectId) {
    try {
      await this.initializeCounters();
      const snapshot = await db.collection('bids').where('projectId', '==', projectId).get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: Number(doc.id), ...data };
      });
    } catch (error) {
      console.error('Error getting bids by project:', error);
      return [];
    }
  }

  async createBid(insertBid) {
    try {
      await this.initializeCounters();
      const newBidId = this.currentBidId++;
      const bidData = {
        ...insertBid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.collection('bids').doc(newBidId.toString()).set(bidData);
      return { id: newBidId, ...bidData };
    } catch (error) {
      console.error('Error creating bid:', error);
      throw error;
    }
  }

  async getBids() {
    try {
      await this.initializeCounters();
      const snapshot = await db.collection('bids').get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: Number(doc.id), ...data };
      });
    } catch (error) {
      console.error('Error getting all bids:', error);
      return [];
    }
  }

  async updateBidStatus(id, status) {
    try {
      await this.initializeCounters();
      await db.collection('bids').doc(id.toString()).update({
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating bid status:', error);
      throw error;
    }
  }

  async updateProjectStatus(id, status) {
    try {
      await this.initializeCounters();
      await db.collection('projects').doc(id.toString()).update({
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  }

  async getContractorByUserId(userId) {
    try {
      await this.initializeCounters();
      const snapshot = await db.collection('contractors').where('userId', '==', userId).get();
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        return { id: Number(doc.id), ...data };
      }
      return undefined;
    } catch (error) {
      console.error('Error getting contractor by user ID:', error);
      return undefined;
    }
  }

  async getProjectsByHomeowner(homeownerId) {
    try {
      await this.initializeCounters();
      const snapshot = await db.collection('projects').where('homeownerId', '==', homeownerId).get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: Number(doc.id), ...data };
      });
    } catch (error) {
      console.error('Error getting projects by homeowner:', error);
      return [];
    }
  }
}

// Create and export a shared instance
export const storage = new FirebaseStorage(); 