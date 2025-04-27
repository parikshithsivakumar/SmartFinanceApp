import mongoose from 'mongoose';

// MongoDB connection URI (use a local MongoDB instance for development)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-finance';

// Max retries and timeout settings
const MAX_RETRIES = 2;
const CONNECT_TIMEOUT_MS = 5000; // 5 seconds timeout

// Connect to MongoDB with retries
export const connectToDatabase = async () => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS
      });
      console.log('Connected to MongoDB');
      return;
    } catch (error) {
      retries++;
      console.error(`Failed to connect to MongoDB (attempt ${retries}/${MAX_RETRIES})`, error);
      
      if (retries >= MAX_RETRIES) {
        console.log('Max retries reached, will use memory storage instead');
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// Close database connection
export const closeDatabaseConnection = async () => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB', error);
  }
};