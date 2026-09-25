const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const isPlaceholder = !uri || uri.includes('<username>') || uri.includes('username:password');

  if (!isPlaceholder) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`[MongoDB Atlas] Connected successfully: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`[MongoDB Atlas] Connection attempt to Atlas failed (${err.message}). Falling back to in-memory instance for development.`);
    }
  }

  // Graceful fallback for local development without Atlas credentials
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[MongoDB Dev] Connected to in-memory MongoDB instance at ${memoryUri}`);
  } catch (memErr) {
    console.error(`[MongoDB Error] Failed to connect to database: ${memErr.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
