import { IStorage } from './storage';
import { User, InsertUser, Document, InsertDocument } from '@shared/schema';
import { UserModel } from './models/User';
import { DocumentModel } from './models/Document';
import session from 'express-session';
import MongoStore from 'connect-mongo';

// Helper function to convert MongoDB document to application schema type
function convertToDocument(doc: any): Document {
  return {
    // Use MongoDB _id as the document ID if no custom id is present
    id: doc._id ? doc._id.toString() : doc.id,
    userId: doc.userId as number,
    name: doc.name as string,
    filePath: doc.filePath as string,
    fileType: doc.fileType as string,
    summary: doc.summary as string | null,
    extractedData: doc.extractedData as Record<string, any> | null,
    anomalies: doc.anomalies as Record<string, any> | null,
    complianceStatus: doc.complianceStatus as string | null,
    uploadDate: doc.uploadDate as Date
  };
}

// Helper function to convert MongoDB document to User type
function convertToUser(doc: any): User {
  const result = {
    // Use MongoDB _id if id is not present
    id: doc.id || doc._id.toString(),
    name: doc.name as string,
    email: doc.email as string,
    password: doc.password as string,
    createdAt: doc.createdAt as Date
  };
  console.log('Converted user:', result);
  return result;
}

export class MongoStorage implements IStorage {
  public sessionStore: session.Store;
  
  constructor() {
    // Initialize MongoDB session store
    this.sessionStore = MongoStore.create({
      // Use the existing MongoDB connection
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-finance',
      collectionName: 'sessions',
      ttl: 24 * 60 * 60 // 1 day
    });
  }
  
  // User operations
  async getUser(id: number | string): Promise<User | undefined> {
    console.log(`Looking for user with ID: ${id}`);
    try {
      // Try to find user by _id if it looks like a MongoDB ObjectId
      if (typeof id === 'string' && id.length === 24) {
        const user = await UserModel.findById(id);
        if (user) {
          console.log('Found user by MongoDB _id:', user);
          return convertToUser(user);
        }
      }
      
      // Fall back to our custom ID field
      const user = await UserModel.findOne({ id });
      if (!user) {
        console.log('User not found');
        return undefined;
      }
      
      console.log('Found user by custom id:', user);
      return convertToUser(user);
    } catch (error) {
      console.error('Error finding user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    if (!user) return undefined;
    
    return convertToUser(user);
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      // Get the highest user ID and increment by 1
      const maxUser = await UserModel.findOne().sort('-id').limit(1);
      // Make sure we have a valid number for the ID
      const id = maxUser && typeof maxUser.id === 'number' ? maxUser.id + 1 : 1;
      console.log(`Creating new user with ID: ${id}`);
      
      const newUser = new UserModel({
        id: id,
        name: user.name,
        email: user.email,
        password: user.password,
        createdAt: new Date()
      });
      
      const savedUser = await newUser.save();
      console.log('Saved user:', savedUser);
      
      return convertToUser(savedUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Document operations
  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    const documents = await DocumentModel.find({ userId });
    return documents.map(doc => convertToDocument(doc));
  }

  async getDocumentById(id: number | string): Promise<Document | undefined> {
    try {
      console.log(`Looking for document with ID: ${id}`);
      
      // Try to find document by MongoDB _id if it's a string
      if (typeof id === 'string' && id.length === 24) {
        try {
          const doc = await DocumentModel.findById(id);
          if (doc) {
            console.log('Found document by MongoDB _id:', doc);
            return convertToDocument(doc);
          }
        } catch (error) {
          console.error('Error finding document by _id:', error);
        }
      }
      
      // Fall back to our custom ID field
      const doc = await DocumentModel.findOne({ id });
      if (!doc) {
        console.log('Document not found');
        return undefined;
      }
      
      console.log('Found document by custom id:', doc);
      return convertToDocument(doc);
    } catch (error) {
      console.error('Error finding document:', error);
      return undefined;
    }
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    try {
      // Get the highest document ID and increment by 1
      const maxDoc = await DocumentModel.findOne().sort('-id').limit(1);
      // Make sure we have a valid number for the ID
      const id = maxDoc && typeof maxDoc.id === 'number' ? maxDoc.id + 1 : 1;
      console.log(`Creating new document with ID: ${id}`);
      
      const newDocument = new DocumentModel({
        id: id,
        userId: document.userId,
        name: document.name,
        filePath: document.filePath,
        fileType: document.fileType,
        summary: document.summary || null,
        extractedData: document.extractedData || null,
        anomalies: document.anomalies || null,
        complianceStatus: document.complianceStatus || null,
        uploadDate: new Date()
      });
      
      const savedDocument = await newDocument.save();
      console.log('Saved document:', savedDocument);
      
      return convertToDocument(savedDocument);
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async deleteDocument(id: number | string): Promise<boolean> {
    try {
      console.log(`Deleting document with ID: ${id}`);
      
      // Try to delete by MongoDB _id if it's a string that looks like an ObjectId
      if (typeof id === 'string' && id.length === 24) {
        try {
          const result = await DocumentModel.findByIdAndDelete(id);
          if (result) {
            console.log('Deleted document by MongoDB _id');
            return true;
          }
        } catch (error) {
          console.error('Error deleting document by _id:', error);
        }
      }
      
      // Fall back to our custom ID field
      const result = await DocumentModel.deleteOne({ id });
      const success = result.deletedCount > 0;
      console.log(`Deleted document by custom id: ${success}`);
      return success;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }
}