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
    console.log('Upload request received', { 
      body: req.body, 
      file: req.file,
      headers: req.headers
    });
    
    // Check if file exists in request
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get user ID from authenticated request
    const userId = (req as any).user.id;
    console.log('User ID from token:', userId);

    // Get uploaded file information
    const file = req.file;
    const filePath = path.join(UPLOAD_DIR, file.filename);
    console.log('File path:', filePath);
    
    // Get document type from request body or use default
    const documentType = req.body.documentType || 'Financial';
    console.log('Document type:', documentType);
    
    // Get document name from request body or use original filename
    const name = req.body.name || file.originalname;
    console.log('Document name:', name);
    
    // Get processing options with defaults
    const extractInfo = req.body.extractInfo === 'true';
    const summarize = req.body.summarize === 'true';
    const anomalyDetection = req.body.anomalyDetection === 'true';
    const complianceCheck = req.body.complianceCheck === 'true';
    
    // Process document
    console.log('Processing document...');
    
    // 1. Extract text from document
    let extractedText = '';
    try {
      extractedText = await extractTextFromDocument(filePath);
      console.log('Text extraction complete');
    } catch (err) {
      console.error('Text extraction error:', err);
      extractedText = '';
    }
    
    // 2. Initialize result object
    let documentData: any = {
      userId,
      name,
      filePath,
      fileType: documentType,
      extractedData: null,
      anomalies: null,
      // Default compliance status to Warning until checked
      complianceStatus: 'Warning',
      summary: null
    };
    
    // 3. Apply processing options if selected
    if (summarize && extractedText) {
      try {
        documentData.summary = await summarizeText(extractedText);
      } catch (err) {
        console.error('Summarization error:', err);
        documentData.summary = 'Error generating summary';
      }
    }
    
    if (extractInfo && extractedText) {
      try {
        documentData.extractedData = await extractTextFromDocument(filePath, true);
      } catch (err) {
        console.error('Entity extraction error:', err);
        documentData.extractedData = {};
      }
    }
    
    if (anomalyDetection && extractedText) {
      try {
        documentData.anomalies = await detectAnomalies(extractedText, documentType);
      } catch (err) {
        console.error('Anomaly detection error:', err);
        documentData.anomalies = {};
      }
    }
    
    if (complianceCheck && extractedText) {
      try {
        documentData.complianceStatus = await checkCompliance(extractedText, documentType);
      } catch (err) {
        console.error('Compliance check error:', err);
        // Set to a valid enum value
        documentData.complianceStatus = 'Fail';
      }
    }
    
    // 4. Save document information to database
    console.log('Saving document to database:', documentData);
    const document = await storage.createDocument(documentData);
    console.log('Document saved successfully:', document);
    
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
    const documentId = req.params.id;
    console.log(`Fetching document with ID: ${documentId}`);
    
    // Get user ID from authenticated request
    const userId = (req as any).user.id;
    console.log(`User ID from token: ${userId}`);
    
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
    const documentId = req.params.id;
    console.log(`Deleting document with ID: ${documentId}`);
    
    // Get user ID from authenticated request
    const userId = (req as any).user.id;
    console.log(`User ID from token: ${userId}`);
    
    // Find document
    const document = await storage.getDocumentById(documentId);
    
    // Check if document exists and belongs to user
    if (!document || document.userId !== userId) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Delete document file
    if (fs.existsSync(document.filePath)) {
      console.log(`Deleting file: ${document.filePath}`);
      fs.unlinkSync(document.filePath);
    }
    
    // Delete document from database
    const result = await storage.deleteDocument(documentId);
    console.log(`Document deletion result: ${result}`);
    
    return res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Document delete error:', error);
    return res.status(500).json({ message: 'Server error while deleting document' });
  }
};
