import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

// Initialize global variable to store the MongoDB memory server instance
let mongoServer: MongoMemoryServer | null = null;

const connectDB = async (): Promise<void> => {
  try {
    // Start in-memory MongoDB server first
    console.log('Starting in-memory MongoDB server...');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to in-memory MongoDB
    const conn = await mongoose.connect(mongoUri);
    console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
    
    // Add shutdown handler to clean up memory server
    process.on('SIGINT', async () => {
      await mongoose.disconnect();
      if (mongoServer) {
        await mongoServer.stop();
        console.log('In-Memory MongoDB server stopped');
      }
      process.exit(0);
    });
  } catch (error) {
    console.error(`Failed to start MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
};

export default connectDB; 