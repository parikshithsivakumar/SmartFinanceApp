import { IStorage } from './storage';
import { User, InsertUser, Document, InsertDocument } from '@shared/schema';
import { UserModel } from './models/User';
import { DocumentModel } from './models/Document';

// Helper function to convert MongoDB document to application schema type
function convertToDocument(doc: any): Document {
  return {
    id: doc.id as number,
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
  return {
    id: doc.id as number,
    name: doc.name as string,
    email: doc.email as string,
    password: doc.password as string,
    createdAt: doc.createdAt as Date
  };
}

export class MongoStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const user = await UserModel.findOne({ id });
    if (!user) return undefined;
    
    return convertToUser(user);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    if (!user) return undefined;
    
    return convertToUser(user);
  }

  async createUser(user: InsertUser): Promise<User> {
    // Get the highest user ID and increment by 1
    const maxUser = await UserModel.findOne().sort('-id').limit(1);
    const id = maxUser ? (maxUser.id as number) + 1 : 1;
    
    const newUser = new UserModel({
      id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: new Date()
    });
    
    await newUser.save();
    
    return convertToUser(newUser);
  }

  // Document operations
  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    const documents = await DocumentModel.find({ userId });
    return documents.map(doc => convertToDocument(doc));
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    const doc = await DocumentModel.findOne({ id });
    if (!doc) return undefined;
    
    return convertToDocument(doc);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    // Get the highest document ID and increment by 1
    const maxDoc = await DocumentModel.findOne().sort('-id').limit(1);
    const id = maxDoc ? (maxDoc.id as number) + 1 : 1;
    
    const newDocument = new DocumentModel({
      id,
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
    
    await newDocument.save();
    
    return convertToDocument(newDocument);
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await DocumentModel.deleteOne({ id });
    return result.deletedCount > 0;
  }
}