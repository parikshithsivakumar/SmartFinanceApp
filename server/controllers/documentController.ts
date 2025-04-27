import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { storage } from '../storage';
import { insertDocumentSchema } from '@shared/schema';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { 
  extractTextFromDocument, 
  summarizeText, 
  detectAnomalies, 
  checkCompliance 
} from '../utils/documentProcessing';

// Upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'server/uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    // Check if file exists in request
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get user ID from authenticated request
    const userId = (req as any).user.id;

    // Get uploaded file information
    const file = req.file;
    const filePath = path.join(UPLOAD_DIR, file.filename);
    
    // Get document type from request body
    const { documentType } = req.body;
    if (!documentType || !['Financial', 'Legal'].includes(documentType)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }
    
    // Get processing options
    const extractInfo = req.body.extractInfo === 'true';
    const summarize = req.body.summarize === 'true';
    const anomalyDetection = req.body.anomalyDetection === 'true';
    const complianceCheck = req.body.complianceCheck === 'true';
    
    // Process document
    // 1. Extract text from document
    const extractedText = await extractTextFromDocument(filePath);
    
    // 2. Initialize result object
    let documentData: any = {
      userId,
      name: file.originalname,
      filePath,
      fileType: documentType,
      extractedData: {},
      anomalies: {},
      complianceStatus: 'Not Checked'
    };
    
    // 3. Apply processing options if selected
    if (summarize && extractedText) {
      documentData.summary = await summarizeText(extractedText);
    }
    
    if (extractInfo && extractedText) {
      documentData.extractedData = await extractTextFromDocument(filePath, true);
    }
    
    if (anomalyDetection && extractedText) {
      documentData.anomalies = await detectAnomalies(extractedText, documentType);
    }
    
    if (complianceCheck && extractedText) {
      documentData.complianceStatus = await checkCompliance(extractedText, documentType);
    }
    
    // 4. Save document information to database
    const document = await storage.createDocument(documentData);
    
    return res.status(201).json({
      message: 'Document uploaded and processed successfully',
      document: {
        id: document.id,
        name: document.name,
        fileType: document.fileType,
        summary: document.summary,
        extractedData: document.extractedData,
        anomalies: document.anomalies,
        complianceStatus: document.complianceStatus,
        uploadDate: document.uploadDate
      }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: fromZodError(error).message });
    }
    console.error('Document upload error:', error);
    return res.status(500).json({ message: 'Server error during document upload' });
  }
};

export const getDocumentHistory = async (req: Request, res: Response) => {
  try {
    // Get user ID from authenticated request
    const userId = (req as any).user.id;
    
    // Get all documents for user
    const documents = await storage.getDocumentsByUserId(userId);
    
    return res.status(200).json({ documents });
  } catch (error) {
    console.error('Document history error:', error);
    return res.status(500).json({ message: 'Server error while fetching document history' });
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    
    // Get user ID from authenticated request
    const userId = (req as any).user.id;
    
    // Find document
    const document = await storage.getDocumentById(documentId);
    
    // Check if document exists and belongs to user
    if (!document || document.userId !== userId) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    return res.status(200).json({ document });
  } catch (error) {
    console.error('Document fetch error:', error);
    return res.status(500).json({ message: 'Server error while fetching document' });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    
    // Get user ID from authenticated request
    const userId = (req as any).user.id;
    
    // Find document
    const document = await storage.getDocumentById(documentId);
    
    // Check if document exists and belongs to user
    if (!document || document.userId !== userId) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Delete document file
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    
    // Delete document from database
    await storage.deleteDocument(documentId);
    
    return res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Document delete error:', error);
    return res.status(500).json({ message: 'Server error while deleting document' });
  }
};
