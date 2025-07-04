import type { Project, Contractor, Bid, User, Message } from "@shared/schema";

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