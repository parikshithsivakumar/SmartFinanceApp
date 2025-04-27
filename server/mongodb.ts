import mongoose from 'mongoose';

// MongoDB connection URI (safely loaded from environment variables)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://parikshithsr19:Parikshithsivakumar@cluster0.vfid2yq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
export const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    throw error;
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