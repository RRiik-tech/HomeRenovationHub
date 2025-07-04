import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  type DocumentData,
  type QuerySnapshot,
  type DocumentSnapshot,
  type Query,
  type CollectionReference
} from 'firebase/firestore';
import { db } from './firebase';

// Generic collection operations
export const firestoreUtils = {
  // Get all documents from a collection
  async getCollection(collectionName: string) {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Get a single document by ID
  async getDocument(collectionName: string, documentId: string) {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  },

  // Add a new document
  async addDocument(collectionName: string, data: any) {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  },

  // Update a document
  async updateDocument(collectionName: string, documentId: string, data: any) {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  },

  // Delete a document
  async deleteDocument(collectionName: string, documentId: string) {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  },

  // Query documents with conditions
  async queryDocuments(collectionName: string, conditions: any[] = [], orderByField?: string, limitCount?: number) {
    const collectionRef = collection(db, collectionName);
    let q: Query<DocumentData, DocumentData> = collectionRef;
    
    // Apply where conditions
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
    
    // Apply ordering
    if (orderByField) {
      q = query(q, orderBy(orderByField));
    }
    
    // Apply limit
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Real-time listener for a collection
  subscribeToCollection(collectionName: string, callback: (data: any[]) => void) {
    const unsubscribe = onSnapshot(collection(db, collectionName), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
    
    return unsubscribe; // Call this to stop listening
  },

  // Real-time listener for a single document
  subscribeToDocument(collectionName: string, documentId: string, callback: (data: any) => void) {
    const unsubscribe = onSnapshot(doc(db, collectionName, documentId), (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        });
      } else {
        callback(null);
      }
    });
    
    return unsubscribe; // Call this to stop listening
  }
};

// Specific collections for your app
export const projectsCollection = 'projects';
export const usersCollection = 'users';
export const contractorsCollection = 'contractors';
export const bidsCollection = 'bids';
export const messagesCollection = 'messages'; 