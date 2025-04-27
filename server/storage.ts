import { users, documents, type User, type InsertUser, type Document, type InsertDocument } from "@shared/schema";
import { MongoStorage } from './mongoStorage';
import { connectToDatabase } from './mongodb';

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document operations
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  getDocumentById(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private userIdCounter: number;
  private documentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.userIdCounter = 1;
    this.documentIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
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

  async getDocumentById(id: number): Promise<Document | undefined> {
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

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
}

// Try to connect to MongoDB with fallback to in-memory storage
let useMongoStorage = false;

try {
  // Attempt MongoDB connection
  connectToDatabase()
    .then(() => {
      console.log('MongoDB connection established');
      useMongoStorage = true;
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      console.log('Falling back to in-memory storage');
    });
} catch (error) {
  console.error('Error connecting to MongoDB:', error);
  console.log('Falling back to in-memory storage');
}

// Export storage instance with fallback mechanism
export const storage = new MemStorage(); // Start with in-memory storage
// Note: This approach uses in-memory storage throughout the lifetime of the application
// In a production environment, we would need a more robust fallback mechanism
