"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
dotenv_1.default.config();
// Initialize global variable to store the MongoDB memory server instance
let mongoServer = null;
const connectDB = async () => {
    try {
        // Start in-memory MongoDB server first
        console.log('Starting in-memory MongoDB server...');
        mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        // Connect to in-memory MongoDB
        const conn = await mongoose_1.default.connect(mongoUri);
        console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
        // Add shutdown handler to clean up memory server
        process.on('SIGINT', async () => {
            await mongoose_1.default.disconnect();
            if (mongoServer) {
                await mongoServer.stop();
                console.log('In-Memory MongoDB server stopped');
            }
            process.exit(0);
        });
    }
    catch (error) {
        console.error(`Failed to start MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
};
exports.default = connectDB;
