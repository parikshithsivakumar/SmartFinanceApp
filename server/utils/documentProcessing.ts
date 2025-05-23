import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';

// Mock functions for demonstration purposes
// In a real application, these would be implemented with actual libraries

/**
 * Extract text from a document using OCR
 * @param filePath Path to the uploaded file
 * @param extractEntities Whether to extract named entities
 * @returns Extracted text or entities
 */
export const extractTextFromDocument = async (filePath: string, extractEntities: boolean = false) => {
  try {
    const fileExt = path.extname(filePath).toLowerCase();
    
    // If it's a text file, just read it
    if (fileExt === '.txt') {
      const text = fs.readFileSync(filePath, 'utf8');
      
      if (extractEntities) {
        // Simple mock entity extraction - in a real app, use NER libraries
        return extractEntitiesFromText(text);
      }
      
      return text;
    }
    
    // For image files and PDFs, use OCR
    if (['.jpg', '.jpeg', '.png', '.pdf'].includes(fileExt)) {
      // Initialize Tesseract worker (updated for latest Tesseract.js)
      const worker = await createWorker('eng');
      
      // Recognize text
      const { data: { text } } = await worker.recognize(filePath);
      await worker.terminate();
      
      if (extractEntities) {
        // Simple mock entity extraction - in a real app, use NER libraries
        return extractEntitiesFromText(text);
      }
      
      return text;
    }
    
    throw new Error('Unsupported file format');
  } catch (error) {
    console.error('Text extraction error:', error);
    return 'Error extracting text from document';
  }
};

/**
 * Extract entities from text
 * @param text The text to process
 * @returns Extracted entities
 */
const extractEntitiesFromText = (text: string) => {
  // Mock implementation - in a real app, use NER libraries like spaCy
  // This would extract names, dates, monetary amounts, etc.
  
  // Simple regex patterns for demonstration
  const patterns = {
    date: /\b(?:\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}|\d{1,2}(?:st|nd|rd|th)? (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{2,4})\b/gi,
    money: /\$\s?[0-9,]+(\.\d{2})?|\b\d+(\.\d{2})?\s?(?:dollars|USD)\b/gi,
    percentage: /\b\d+(\.\d+)?%\b/gi,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(?:\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
  };
  
  const entities: Record<string, string[]> = {};
  
  // Extract entities using regex
  for (const [key, pattern] of Object.entries(patterns)) {
    const matches = text.match(pattern) || [];
    if (matches.length > 0) {
      entities[key] = Array.from(new Set(matches)); // Remove duplicates
    }
  }
  
  return entities;
};

/**
 * Summarize text using BART or similar model
 * @param text The text to summarize
 * @returns Summarized text
 */
export const summarizeText = async (text: string) => {
  // Mock summarization - in a real app, use libraries or API calls
  // This would use BART or other summarization models
  
  try {
    // Simple extractive summarization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Keep only ~20% of sentences for summary
    const summaryLength = Math.max(1, Math.floor(sentences.length * 0.2));
    
    // Select sentences (simple approach - in reality would use importance scoring)
    const summary = sentences.slice(0, summaryLength).join('. ') + '.';
    
    return summary;
  } catch (error) {
    console.error('Summarization error:', error);
    return 'Error summarizing document';
  }
};

/**
 * Detect anomalies in document text
 * @param text The document text
 * @param documentType The type of document (Financial or Legal)
 * @returns Detected anomalies
 */
export const detectAnomalies = async (text: string, documentType: string) => {
  // Mock anomaly detection - in a real app, use isolation forest or similar
  
  try {
    // Simple keyword-based anomaly detection
    const anomalies: Record<string, any> = { detected: false, items: [] };
    
    // Basic patterns that might indicate anomalies
    const patterns = {
      Financial: [
        { pattern: /\bunauthorized\b/i, type: 'Unauthorized Transaction' },
        { pattern: /\binconsistent\b/i, type: 'Inconsistent Data' },
        { pattern: /\boverpayment\b/i, type: 'Overpayment' },
        { pattern: /\bunderpayment\b/i, type: 'Underpayment' },
        { pattern: /\bmismatched\b/i, type: 'Mismatched Figures' },
      ],
      Legal: [
        { pattern: /\bunenforceable\b/i, type: 'Unenforceable Clause' },
        { pattern: /\bcontradictory\b/i, type: 'Contradictory Terms' },
        { pattern: /\bvoid\b/i, type: 'Potentially Void Clause' },
        { pattern: /\bprohibited\b/i, type: 'Prohibited Terms' },
        { pattern: /\billegal\b/i, type: 'Potentially Illegal Terms' },
      ]
    };
    
    // Check for patterns based on document type
    const relevantPatterns = patterns[documentType as keyof typeof patterns] || [];
    
    for (const { pattern, type } of relevantPatterns) {
      if (pattern.test(text)) {
        anomalies.items.push({
          type,
          confidence: Math.round(Math.random() * 30 + 70) // Mock confidence score 70-100%
        });
      }
    }
    
    anomalies.detected = anomalies.items.length > 0;
    
    return anomalies;
  } catch (error) {
    console.error('Anomaly detection error:', error);
    return { detected: false, error: 'Error detecting anomalies' };
  }
};

/**
 * Check compliance with regulatory standards
 * @param text The document text
 * @param documentType The type of document (Financial or Legal)
 * @returns Compliance status
 */
export const checkCompliance = async (text: string, documentType: string) => {
  // Mock compliance checking - in a real app, use regulatory rules
  
  try {
    // Simple keyword-based compliance checking
    const complianceTerms = {
      Financial: [
        { term: /\bdisclosure\b/i, required: true },
        { term: /\btransparency\b/i, required: true },
        { term: /\bcompliance\b/i, required: true },
        { term: /\brbi\s+guidelines\b/i, required: true }, // RBI guidelines
      ],
      Legal: [
        { term: /\bconsent\b/i, required: true },
        { term: /\bliability\b/i, required: true },
        { term: /\btermination\b/i, required: true },
        { term: /\bconfidentiality\b/i, required: true },
      ]
    };
    
    // Check for required terms based on document type
    const relevantTerms = complianceTerms[documentType as keyof typeof complianceTerms] || [];
    const missingTerms = relevantTerms
      .filter(({ term, required }) => required && !term.test(text))
      .map(({ term }) => term.toString().replace(/\\b|\(|\)|\\\s\+|\/i/g, ''));
    
    // Determine compliance status
    if (missingTerms.length === 0) {
      return 'Pass';
    } else if (missingTerms.length <= 1) {
      return 'Warning';
    } else {
      return 'Fail';
    }
  } catch (error) {
    console.error('Compliance checking error:', error);
    return 'Error';
  }
};

/**
 * Calculate text similarity between two documents
 * @param text1 First document text
 * @param text2 Second document text
 * @returns Similarity score (0-100)
 */
export const calculateTextSimilarity = (text1: string, text2: string): number => {
  try {
    // Remove extra whitespace and convert to lowercase
    const normalizedText1 = text1.toLowerCase().replace(/\s+/g, ' ').trim();
    const normalizedText2 = text2.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Split into words
    const words1 = normalizedText1.split(/\W+/).filter(word => word.length > 0);
    const words2 = normalizedText2.split(/\W+/).filter(word => word.length > 0);
    
    // Count word frequencies
    const freq1: Record<string, number> = {};
    const freq2: Record<string, number> = {};
    
    words1.forEach(word => {
      freq1[word] = (freq1[word] || 0) + 1;
    });
    
    words2.forEach(word => {
      freq2[word] = (freq2[word] || 0) + 1;
    });
    
    // Calculate Jaccard similarity (intersection over union)
    const allWords = new Set([...words1, ...words2]);
    let intersection = 0;
    let union = 0;
    
    allWords.forEach(word => {
      const count1 = freq1[word] || 0;
      const count2 = freq2[word] || 0;
      
      intersection += Math.min(count1, count2);
      union += Math.max(count1, count2);
    });
    
    // Calculate similarity as a percentage
    const similarity = union > 0 ? (intersection / union) * 100 : 0;
    
    // Round to 2 decimal places
    return Math.round(similarity * 100) / 100;
  } catch (error) {
    console.error('Error calculating text similarity:', error);
    return 0;
  }
};

/**
 * Find differences between extracted information from two documents
 * @param info1 First document extracted information
 * @param info2 Second document extracted information
 * @returns Structured differences
 */
export const findInfoDifferences = (info1: Record<string, any>, info2: Record<string, any>): Record<string, any> => {
  try {
    const differences: Record<string, any> = {};
    
    // Combine all possible keys
    const allKeys = new Set([
      ...Object.keys(info1 || {}), 
      ...Object.keys(info2 || {})
    ]);
    
    // Compare each category
    allKeys.forEach(key => {
      const values1 = info1?.[key] || [];
      const values2 = info2?.[key] || [];
      
      // Simple array comparison
      if (Array.isArray(values1) && Array.isArray(values2)) {
        // Check for additions (in doc2 but not in doc1)
        const additions = values2.filter(value => !values1.includes(value));
        
        // Check for removals (in doc1 but not in doc2)
        const removals = values1.filter(value => !values2.includes(value));
        
        // Only add to differences if there are actual changes
        if (additions.length > 0 || removals.length > 0) {
          differences[key] = {
            additions,
            removals
          };
        }
      }
    });
    
    return differences;
  } catch (error) {
    console.error('Error comparing document information:', error);
    return { error: 'Failed to compare document information' };
  }
};
