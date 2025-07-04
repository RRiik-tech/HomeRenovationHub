import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';

interface ChatMessage {
  id: string;
  projectId: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  type: 'message' | 'typing' | 'read';
}

interface ConnectedUser {
  userId: number;
  ws: WebSocket;
  projectId?: number;
}

export class ChatServer {
  private wss: WebSocketServer;
  private connectedUsers: Map<number, ConnectedUser> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      console.log('New WebSocket connection established');

      ws.on('message', async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format' 
          }));
        }
      });

      ws.on('close', () => {
        this.removeUser(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.removeUser(ws);
      });
    });
  }

  private async handleMessage(ws: WebSocket, message: any) {
    switch (message.type) {
      case 'auth':
        await this.handleAuth(ws, message);
        break;
      case 'join_project':
        await this.handleJoinProject(ws, message);
        break;
      case 'send_message':
        await this.handleSendMessage(ws, message);
        break;
      case 'typing':
        await this.handleTyping(ws, message);
        break;
      case 'read_messages':
        await this.handleReadMessages(ws, message);
        break;
      default:
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Unknown message type' 
        }));
    }
  }

  private async handleAuth(ws: WebSocket, message: any) {
    const { userId } = message;
    if (userId) {
      this.connectedUsers.set(userId, { userId, ws });
      ws.send(JSON.stringify({ 
        type: 'auth_success', 
        userId 
      }));
      console.log(`User ${userId} authenticated`);
    }
  }

  private async handleJoinProject(ws: WebSocket, message: any) {
    const { userId, projectId } = message;
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.projectId = projectId;
      ws.send(JSON.stringify({ 
        type: 'joined_project', 
        projectId 
      }));
      console.log(`User ${userId} joined project ${projectId}`);
    }
  }

  private async handleSendMessage(ws: WebSocket, message: any) {
    const { projectId, senderId, receiverId, content } = message;
    
    // Save message to storage
    const savedMessage = await storage.createMessage({
      projectId,
      senderId,
      receiverId,
      content
    });

    const chatMessage: ChatMessage = {
      id: savedMessage.id.toString(),
      projectId,
      senderId,
      receiverId,
      content,
      timestamp: savedMessage.createdAt,
      type: 'message'
    };

    // Send to sender
    ws.send(JSON.stringify({
      type: 'message_sent',
      message: chatMessage
    }));

    // Send to receiver if online
    const receiver = this.connectedUsers.get(receiverId);
    if (receiver) {
      receiver.ws.send(JSON.stringify({
        type: 'new_message',
        message: chatMessage
      }));
    }

    // Send to all users in the same project
    this.broadcastToProject(projectId, {
      type: 'project_message',
      message: chatMessage
    }, senderId);
  }

  private async handleTyping(ws: WebSocket, message: any) {
    const { projectId, senderId, receiverId, isTyping } = message;
    
    const receiver = this.connectedUsers.get(receiverId);
    if (receiver) {
      receiver.ws.send(JSON.stringify({
        type: 'typing_indicator',
        senderId,
        projectId,
        isTyping
      }));
    }
  }

  private async handleReadMessages(ws: WebSocket, message: any) {
    const { projectId, userId } = message;
    
    // Mark messages as read in storage (you can implement this)
    this.broadcastToProject(projectId, {
      type: 'messages_read',
      userId,
      projectId
    }, userId);
  }

  private broadcastToProject(projectId: number, message: any, excludeUserId?: number) {
    this.connectedUsers.forEach((user, userId) => {
      if (user.projectId === projectId && userId !== excludeUserId) {
        user.ws.send(JSON.stringify(message));
      }
    });
  }

  private removeUser(ws: WebSocket) {
    this.connectedUsers.forEach((user, userId) => {
      if (user.ws === ws) {
        this.connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
      }
    });
  }

  public sendNotification(userId: number, notification: any) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.ws.send(JSON.stringify({
        type: 'notification',
        ...notification
      }));
    }
  }
} 