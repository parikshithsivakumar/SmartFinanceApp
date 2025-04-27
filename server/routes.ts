import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { setupAuth } from "./auth";
import { 
  uploadDocument, 
  getDocumentHistory, 
  getDocumentById,
  deleteDocument,
  compareDocuments
} from "./controllers/documentController";

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'server/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage_config,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only certain file types
    const allowedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedFileTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG, and TXT files are allowed.') as any);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication with Passport
  setupAuth(app);

  // Document routes - protect with isAuthenticated middleware
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Not authenticated' });
  };

  app.post('/api/documents/upload', isAuthenticated, upload.single('document'), uploadDocument);
  app.get('/api/documents', isAuthenticated, getDocumentHistory);
  app.get('/api/documents/:id', isAuthenticated, getDocumentById);
  app.delete('/api/documents/:id', isAuthenticated, deleteDocument);
  app.post('/api/documents/compare', isAuthenticated, compareDocuments);

  const httpServer = createServer(app);
  return httpServer;
}
