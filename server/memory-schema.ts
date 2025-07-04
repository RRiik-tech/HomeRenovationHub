import { z } from "zod";

// Simple schemas for in-memory storage without Drizzle
export const insertUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  userType: z.enum(['homeowner', 'contractor']),
  isVerified: z.boolean().optional(),
  firebaseUid: z.string().optional(),
  photoURL: z.string().optional(),
});

export const insertContractorSchema = z.object({
  userId: z.number(),
  companyName: z.string(),
  licenseNumber: z.string().optional(),
  insuranceNumber: z.string().optional(),
  specialties: z.array(z.string()),
  experienceYears: z.number(),
  description: z.string(),
  portfolio: z.array(z.string()).optional(),
  isVerified: z.boolean().optional(),
});

export const insertProjectSchema = z.object({
  homeownerId: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  budget: z.string(),
  timeline: z.string(),
  address: z.string(),
  photos: z.array(z.string()).optional(),
});

export const insertBidSchema = z.object({
  projectId: z.number(),
  contractorId: z.number(),
  amount: z.string(),
  timeline: z.string(),
  proposal: z.string(),
});

export const insertMessageSchema = z.object({
  projectId: z.number(),
  senderId: z.number(),
  receiverId: z.number(),
  content: z.string(),
});

export const insertReviewSchema = z.object({
  projectId: z.number(),
  contractorId: z.number(),
  reviewerId: z.number(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100),
  comment: z.string().min(10).max(1000),
  photos: z.array(z.string()).optional(),
  categories: z.object({
    quality: z.number().min(1).max(5),
    timeliness: z.number().min(1).max(5),
    communication: z.number().min(1).max(5),
    professionalism: z.number().min(1).max(5),
    value: z.number().min(1).max(5),
  }),
  wouldRecommend: z.boolean(),
  isVerified: z.boolean().default(false),
});

export const insertNotificationSchema = z.object({
  userId: z.number(),
  type: z.enum(['bid_received', 'bid_accepted', 'bid_rejected', 'project_update', 'message_received', 'review_received', 'payment_received']),
  title: z.string(),
  message: z.string(),
  relatedId: z.number().optional(),
  relatedType: z.enum(['project', 'bid', 'message', 'review', 'payment']).optional(),
  isRead: z.boolean().default(false),
});

export const insertDocumentSchema = z.object({
  projectId: z.number(),
  uploadedBy: z.number(),
  name: z.string(),
  type: z.enum(['contract', 'permit', 'invoice', 'receipt', 'photo', 'other']),
  fileUrl: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  description: z.string().optional(),
});

export const insertPaymentSchema = z.object({
  projectId: z.number(),
  fromUserId: z.number(),
  toUserId: z.number(),
  amount: z.number(),
  type: z.enum(['milestone', 'deposit', 'final', 'refund']),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded']),
  description: z.string(),
  milestoneId: z.number().optional(),
});

export const insertMilestoneSchema = z.object({
  projectId: z.number(),
  title: z.string(),
  description: z.string(),
  amount: z.number(),
  dueDate: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue']).default('pending'),
  order: z.number(),
});

// Type definitions
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  latitude: string | null;
  longitude: string | null;
  userType: 'homeowner' | 'contractor';
  isVerified: boolean;
  firebaseUid: string | null;
  photoURL: string | null;
  createdAt: Date;
}

export interface Contractor {
  id: number;
  userId: number;
  companyName: string;
  licenseNumber: string | null;
  insuranceNumber: string | null;
  specialties: string[];
  experienceYears: number;
  description: string;
  portfolio: string[];
  rating: string;
  reviewCount: number;
  isVerified: boolean;
}

export interface Project {
  id: number;
  homeownerId: number;
  title: string;
  description: string;
  category: string;
  budget: string;
  timeline: string;
  address: string;
  photos: string[];
  status: string;
  createdAt: Date;
}

export interface Bid {
  id: number;
  projectId: number;
  contractorId: number;
  amount: string;
  timeline: string;
  proposal: string;
  status: string;
  createdAt: Date;
}

export interface Message {
  id: number;
  projectId: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: Date;
}

export interface Review {
  id: number;
  projectId: number;
  contractorId: number;
  reviewerId: number;
  rating: number;
  title: string;
  comment: string;
  photos: string[];
  categories: {
    quality: number;
    timeliness: number;
    communication: number;
    professionalism: number;
    value: number;
  };
  wouldRecommend: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: number;
  userId: number;
  type: 'bid_received' | 'bid_accepted' | 'bid_rejected' | 'project_update' | 'message_received' | 'review_received' | 'payment_received';
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: 'project' | 'bid' | 'message' | 'review' | 'payment';
  isRead: boolean;
  createdAt: Date;
}

export interface Document {
  id: number;
  projectId: number;
  uploadedBy: number;
  name: string;
  type: 'contract' | 'permit' | 'invoice' | 'receipt' | 'photo' | 'other';
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  createdAt: Date;
}

export interface Payment {
  id: number;
  projectId: number;
  fromUserId: number;
  toUserId: number;
  amount: number;
  type: 'milestone' | 'deposit' | 'final' | 'refund';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  description: string;
  milestoneId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: number;
  projectId: number;
  title: string;
  description: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertContractor = z.infer<typeof insertContractorSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>; 