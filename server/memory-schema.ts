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
  reviewerId: z.number(),
  contractorId: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  categories: z.array(z.string()), // quality, communication, timeliness, etc.
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
  reviewerId: number;
  contractorId: number;
  rating: number;
  comment: string;
  categories: string[];
  createdAt: Date;
}

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertContractor = z.infer<typeof insertContractorSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>; 