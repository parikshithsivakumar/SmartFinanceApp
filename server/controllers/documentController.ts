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
  checkCompliance,
  calculateTextSimilarity,
  findInfoDifferences
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
      const result = await extractTextFromDocument(filePath);
      // Handle case where extractTextFromDocument returns either string or Record<string, string[]>
      extractedText = typeof result === 'string' ? result : '';
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

// Compare two documents and return differences
export const compareDocuments = async (req: Request, res: Response) => {
  try {
    // Get document IDs from request
    const { documentId1, documentId2 } = req.body;
    
    if (!documentId1 || !documentId2) {
      return res.status(400).json({ message: 'Two document IDs are required for comparison' });
    }
    
    // Get user ID from authenticated request
    const userId = (req as any).user.id;
    
    // Fetch both documents
    const document1 = await storage.getDocumentById(documentId1);
    const document2 = await storage.getDocumentById(documentId2);
    
    // Validate documents
    if (!document1 || document1.userId !== userId) {
      return res.status(404).json({ message: 'First document not found or access denied' });
    }
    
    if (!document2 || document2.userId !== userId) {
      return res.status(404).json({ message: 'Second document not found or access denied' });
    }
    
    // Extract text from both documents if they exist
    let text1 = '';
    let text2 = '';
    
    if (fs.existsSync(document1.filePath)) {
      try {
        const result1 = await extractTextFromDocument(document1.filePath);
        text1 = typeof result1 === 'string' ? result1 : '';
        console.log('Extracted text from first document');
      } catch (err) {
        console.error('Error extracting text from first document:', err);
        return res.status(500).json({ message: 'Error processing first document' });
      }
    } else {
      return res.status(404).json({ message: 'First document file not found' });
    }
    
    if (fs.existsSync(document2.filePath)) {
      try {
        const result2 = await extractTextFromDocument(document2.filePath);
        text2 = typeof result2 === 'string' ? result2 : '';
        console.log('Extracted text from second document');
      } catch (err) {
        console.error('Error extracting text from second document:', err);
        return res.status(500).json({ message: 'Error processing second document' });
      }
    } else {
      return res.status(404).json({ message: 'Second document file not found' });
    }
    
    // Compare documents by:
    // 1. Overall similarity score
    // 2. Key information differences
    // 3. Important dates/amounts/entities differences
    
    // Calculate similarity score (simple implementation)
    const similarityScore = calculateTextSimilarity(text1, text2);
    
    // Extract key information from both documents
    const info1 = await extractTextFromDocument(document1.filePath, true) as any;
    const info2 = await extractTextFromDocument(document2.filePath, true) as any;
    
    // Find differences in extracted information
    const differences = findInfoDifferences(info1, info2);
    
    // Return comparison results
    return res.status(200).json({
      comparison: {
        documents: [
          { 
            id: document1.id, 
            name: document1.name,
            type: document1.fileType,
            uploadDate: document1.uploadDate
          },
          { 
            id: document2.id, 
            name: document2.name,
            type: document2.fileType,
            uploadDate: document2.uploadDate
          }
        ],
        similarityScore,
        differences
      }
    });
  } catch (error) {
    console.error('Document comparison error:', error);
    return res.status(500).json({ message: 'Server error during document comparison' });
  }
};
