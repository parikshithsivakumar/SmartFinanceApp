import { IStorage } from './storage';
import { User, InsertUser, Document, InsertDocument } from '@shared/schema';
import { UserModel } from './models/User';
import { DocumentModel } from './models/Document';

export class MongoStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const user = await UserModel.findOne({ id });
    if (!user) return undefined;
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    if (!user) return undefined;
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt
    };
  }

  async createUser(user: InsertUser): Promise<User> {
    // Get the highest user ID and increment by 1
    const maxUser = await UserModel.findOne().sort('-id').limit(1);
    const id = maxUser ? maxUser.id + 1 : 1;
    
    const newUser = new UserModel({
      id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: new Date()
    });
    
    await newUser.save();
    
    return {
      id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: newUser.createdAt
    };
  }

  // Document operations
  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    const documents = await DocumentModel.find({ userId });
    
    return documents.map(doc => ({
      id: doc.id,
      userId: doc.userId,
      name: doc.name,
      filePath: doc.filePath,
      fileType: doc.fileType,
      summary: doc.summary,
      extractedData: doc.extractedData,
      anomalies: doc.anomalies,
      complianceStatus: doc.complianceStatus,
      uploadDate: doc.uploadDate
    }));
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    const doc = await DocumentModel.findOne({ id });
    if (!doc) return undefined;
    
    return {
      id: doc.id,
      userId: doc.userId,
      name: doc.name,
      filePath: doc.filePath,
      fileType: doc.fileType,
      summary: doc.summary,
      extractedData: doc.extractedData,
      anomalies: doc.anomalies,
      complianceStatus: doc.complianceStatus,
      uploadDate: doc.uploadDate
    };
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    // Get the highest document ID and increment by 1
    const maxDoc = await DocumentModel.findOne().sort('-id').limit(1);
    const id = maxDoc ? maxDoc.id + 1 : 1;
    
    const newDocument = new DocumentModel({
      id,
      userId: document.userId,
      name: document.name,
      filePath: document.filePath,
      fileType: document.fileType,
      summary: document.summary,
      extractedData: document.extractedData,
      anomalies: document.anomalies,
      complianceStatus: document.complianceStatus,
      uploadDate: new Date()
    });
    
    await newDocument.save();
    
    return {
      id,
      userId: document.userId,
      name: document.name,
      filePath: document.filePath,
      fileType: document.fileType,
      summary: document.summary,
      extractedData: document.extractedData,
      anomalies: document.anomalies,
      complianceStatus: document.complianceStatus,
      uploadDate: newDocument.uploadDate
    };
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await DocumentModel.deleteOne({ id });
    return result.deletedCount > 0;
  }
}