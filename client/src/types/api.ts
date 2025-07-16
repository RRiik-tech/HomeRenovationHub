import type { Project, Contractor, Bid, Message } from "@shared/schema";

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ProjectWithHomeowner extends Project {
  homeowner?: User;
}

export interface BidWithContractor extends Bid {
  contractor?: Contractor & {
    user?: User;
  };
}

export interface ContractorWithUser extends Contractor {
  user?: User;
}

export interface Conversation {
  id: number;
  projectId: number;
  project: ProjectWithHomeowner;
  participants: User[];
  lastMessage?: {
    content: string;
    createdAt: string;
    sender: User;
  };
}

export interface MessageWithSender extends Message {
  sender: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  userType: string;
  isVerified?: boolean;
  firebaseUid?: string;
  photoURL?: string | null;
  createdAt: Date;
  bio?: string;
  company?: string;
  website?: string;
  linkedin?: string;
} 