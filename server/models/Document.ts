import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['Financial', 'Legal']
  },
  summary: {
    type: String
  },
  extractedData: {
    type: mongoose.Schema.Types.Mixed
  },
  anomalies: {
    type: mongoose.Schema.Types.Mixed
  },
  complianceStatus: {
    type: String,
    enum: ['Pass', 'Fail', 'Warning']
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

export const DocumentModel = mongoose.model('Document', DocumentSchema);
