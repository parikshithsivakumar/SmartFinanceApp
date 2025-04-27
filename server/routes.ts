import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { authenticate } from "./middleware/auth";
import { register, login, getProfile } from "./controllers/authController";
import { 
  uploadDocument, 
  getDocumentHistory, 
  getDocumentById,
  deleteDocument
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
  // Public routes
  app.post('/api/auth/register', register);
  app.post('/api/auth/login', login);

  // Protected routes
  app.get('/api/auth/profile', authenticate, getProfile);
  
  // Document routes
  app.post('/api/documents/upload', authenticate, upload.single('document'), uploadDocument);
  app.get('/api/documents', authenticate, getDocumentHistory);
  app.get('/api/documents/:id', authenticate, getDocumentById);
  app.delete('/api/documents/:id', authenticate, deleteDocument);

  const httpServer = createServer(app);
  return httpServer;
}
