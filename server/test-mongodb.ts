import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://parikshithsr19:Parikshithsivakumar@cluster0.vfid2yq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB!');
    
    // Check if we can create a collection
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Existing collections:', collections.map(c => c.name));
    }
    
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

// Run the test
testConnection();