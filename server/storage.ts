import { users, documents, type User, type InsertUser, type Document, type InsertDocument } from "@shared/schema";
import { MongoStorage } from './mongoStorage';
import { connectToDatabase } from './mongodb';

// Interface for storage operations
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number | string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document operations
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  getDocumentById(id: number | string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number | string): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private userIdCounter: number;
  private documentIdCounter: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.userIdCounter = 1;
    this.documentIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number | string): Promise<User | undefined> {
    if (typeof id === 'string') {
      id = parseInt(id, 10);
      if (isNaN(id)) return undefined;
    }
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Document operations
  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.userId === userId
    );
  }

  async getDocumentById(id: number | string): Promise<Document | undefined> {
    if (typeof id === 'string') {
      id = parseInt(id, 10);
      if (isNaN(id)) return undefined;
    }
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const uploadDate = new Date();
    const document: Document = { 
      id, 
      userId: insertDocument.userId,
      name: insertDocument.name,
      filePath: insertDocument.filePath,
      fileType: insertDocument.fileType,
      summary: insertDocument.summary || null,
      extractedData: insertDocument.extractedData || null,
      anomalies: insertDocument.anomalies || null,
      complianceStatus: insertDocument.complianceStatus || null,
      uploadDate
    };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: number | string): Promise<boolean> {
    if (typeof id === 'string') {
      id = parseInt(id, 10);
      if (isNaN(id)) return false;
    }
    return this.documents.delete(id);
  }
}

// Connect to MongoDB
connectToDatabase()
  .then(() => console.log('MongoDB connection established'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use MongoDB storage
export const storage = new MongoStorage();
